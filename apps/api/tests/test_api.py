import io
import os
import sys
import pytest
from pathlib import Path
from fastapi.testclient import TestClient

# Add api directory to sys.path
api_dir = str(Path(__file__).resolve().parent.parent)
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from main import app
from schemas import mask_api_key
from limiter import limiter
from database import SessionLocal, Base, engine
from models import Project, Feedback

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db_and_limiter():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Ensure default project exists
    project = db.query(Project).filter(Project.api_key.like("pf_live_%")).first()
    if not project:
        project = Project(
            name="Test Project",
            api_key="pf_live_1234567890abcdef"
        )
        db.add(project)
        db.commit()
    db.close()

    # Reset rate limiting counter between tests
    try:
        limiter._storage.reset()
    except Exception:
        pass

    yield

    try:
        limiter._storage.reset()
    except Exception:
        pass


# ==================== Basic Endpoints ====================

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "POINT.FEEDBACK"

# ==================== Fix 1: Secure File Uploads ====================

def test_create_feedback_with_valid_png_screenshot():
    file_content = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "Test button is misaligned",
            "selector": "button.submit",
            "sentiment": "neutral"
        },
        files={"screenshot": ("test.png", file_content, "image/png")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["screenshot_url"] is not None
    assert data["screenshot_url"].endswith(".png")

def test_create_feedback_with_valid_jpeg_screenshot():
    file_content = b"\xff\xd8\xff" + b"\x00" * 100
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "JPEG image test",
            "selector": "img.banner",
            "sentiment": "loved"
        },
        files={"screenshot": ("test.jpg", file_content, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["screenshot_url"] is not None
    assert data["screenshot_url"].endswith(".jpg")

def test_create_feedback_with_valid_webp_screenshot():
    file_content = b"RIFF" + b"\x00" * 4 + b"WEBP" + b"\x00" * 50
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "WebP image test",
            "selector": "div.hero",
            "sentiment": "neutral"
        },
        files={"screenshot": ("test.webp", file_content, "image/webp")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["screenshot_url"] is not None
    assert data["screenshot_url"].endswith(".webp")

def test_create_feedback_with_valid_webm_audio():
    file_content = b"\x1a\x45\xdf\xa3" + b"\x00" * 100
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "Voice report test",
            "selector": "nav.header",
            "audio_duration": "4.5"
        },
        files={"audio": ("voice.webm", file_content, "audio/webm")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["audio_url"] is not None
    assert data["audio_url"].endswith(".webm")

def test_create_feedback_with_valid_mp4_audio():
    file_content = b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 100
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "Safari voice test",
            "selector": "nav.header",
            "audio_duration": "3.2"
        },
        files={"audio": ("voice.mp4", file_content, "audio/mp4")}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["audio_url"] is not None
    assert data["audio_url"].endswith(".mp4")

def test_reject_invalid_file_type():
    file_content = b"malicious code here"
    response = client.post(
        "/api/v1/feedback",
        data={"comment": "Bad file test", "selector": "body"},
        files={"screenshot": ("exploit.exe", file_content, "application/octet-stream")}
    )
    assert response.status_code == 400
    data = response.json()
    assert data["success"] is False

def test_reject_oversized_screenshot():
    # 5MB + 10KB
    oversized = b"P" * (5 * 1024 * 1024 + 10240)
    response = client.post(
        "/api/v1/feedback",
        data={"comment": "Oversized image test", "selector": "body"},
        files={"screenshot": ("huge.png", oversized, "image/png")}
    )
    assert response.status_code == 413
    data = response.json()
    assert data["success"] is False

def test_reject_oversized_audio():
    # 10MB + 10KB
    oversized = b"A" * (10 * 1024 * 1024 + 10240)
    response = client.post(
        "/api/v1/feedback",
        data={"comment": "Oversized audio test", "selector": "body"},
        files={"audio": ("huge.webm", oversized, "audio/webm")}
    )
    assert response.status_code == 413
    data = response.json()
    assert data["success"] is False

# ==================== Fix 3: Mask API Keys ====================

def test_mask_api_key_helper():
    assert mask_api_key("pf_live_1234567890abcdef") == "pf_live_********cdef"
    assert mask_api_key("short") == "pf_live_********hort"
    assert mask_api_key("") == ""

def test_projects_endpoint_never_leaks_api_key():
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    projects = response.json()
    assert len(projects) > 0
    for proj in projects:
        assert "********" in proj["api_key"]
        assert not proj["api_key"].startswith("pf_live_98a72b610c144e88")

# ==================== Fix 5: Safe JSON Parsing ====================

def test_reject_invalid_json_in_metadata():
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "Bad JSON metadata test",
            "selector": "div.card",
            "metadata": "{not: valid, json: true"
        }
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False
    assert "Invalid JSON" in data["message"]

def test_reject_invalid_json_in_telemetry():
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "Bad JSON telemetry test",
            "selector": "div.card",
            "telemetry": "bad_json"
        }
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False

# ==================== Fix 6: Strict Pydantic Validation ====================

def test_reject_invalid_sentiment_enum():
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "Invalid sentiment test",
            "selector": "div.card",
            "sentiment": "super_furious"
        }
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False

def test_reject_empty_comment():
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "",
            "selector": "div.card"
        }
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False

def test_reject_oversized_comment():
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "x" * 5001,
            "selector": "div.card"
        }
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False

def test_reject_oversized_selector():
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "Long selector test",
            "selector": "div." + ("a" * 501)
        }
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False

def test_reject_out_of_bounds_viewport():
    response = client.post(
        "/api/v1/feedback",
        data={
            "comment": "Bad viewport test",
            "selector": "div.card",
            "viewport_width": 0
        }
    )
    assert response.status_code == 422
    data = response.json()
    assert data["success"] is False

# ==================== CRUD Operations ====================

def test_create_and_read_feedback():
    create_res = client.post(
        "/api/v1/feedback",
        data={
            "comment": "E2E feedback test comment",
            "selector": "header.navbar",
            "sentiment": "loved",
            "page_url": "https://example.com/test",
            "viewport_width": 1280,
            "viewport_height": 720
        }
    )
    assert create_res.status_code == 200
    item = create_res.json()
    feedback_id = item["id"]

    get_res = client.get(f"/api/v1/feedback/{feedback_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == feedback_id

def test_update_feedback_success():
    create_res = client.post(
        "/api/v1/feedback",
        data={"comment": "Feedback to update", "selector": "button.save"}
    )
    feedback_id = create_res.json()["id"]

    patch_res = client.patch(
        f"/api/v1/feedback/{feedback_id}",
        json={
            "status": "resolved",
            "priority": "high",
            "category": "UI Bug",
            "comment": "Updated comment description"
        }
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()
    assert updated["status"] == "resolved"
    assert updated["priority"] == "high"
    assert updated["comment"] == "Updated comment description"

def test_update_feedback_invalid_enum():
    create_res = client.post(
        "/api/v1/feedback",
        data={"comment": "Feedback for invalid update", "selector": "button.save"}
    )
    feedback_id = create_res.json()["id"]

    patch_res = client.patch(
        f"/api/v1/feedback/{feedback_id}",
        json={"status": "invalid_status_state"}
    )
    assert patch_res.status_code == 422
    data = patch_res.json()
    assert data["success"] is False

def test_delete_feedback_success():
    create_res = client.post(
        "/api/v1/feedback",
        data={"comment": "Feedback to delete", "selector": "footer"}
    )
    feedback_id = create_res.json()["id"]

    del_res = client.delete(f"/api/v1/feedback/{feedback_id}")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    get_res = client.get(f"/api/v1/feedback/{feedback_id}")
    assert get_res.status_code == 404

def test_delete_nonexistent_feedback():
    del_res = client.delete("/api/v1/feedback/non-existent-uuid-9999")
    assert del_res.status_code == 404
    data = del_res.json()
    assert data["success"] is False

# ==================== Fix 10 & 11: Queries & Analytics ====================

def test_list_feedback_pagination():
    res = client.get("/api/v1/feedback?page=1&limit=5")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert data["page"] == 1
    assert data["limit"] == 5

def test_analytics_summary_group_by():
    res = client.get("/api/v1/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "total_feedback" in data
    assert "open_count" in data
    assert "sentiment_breakdown" in data
    assert "daily_volume" in data
    assert len(data["daily_volume"]) == 7

# ==================== Fix 4: Auth Layer ====================

def test_auth_layer_allows_dev_by_default():
    # In local dev (default), requests succeed
    res = client.get("/api/v1/projects")
    assert res.status_code == 200

def test_admin_auth_strict_enforcement(monkeypatch):
    monkeypatch.setenv("REQUIRE_ADMIN_AUTH", "true")
    # Request without auth header should fail with 401
    res = client.get("/api/v1/projects")
    assert res.status_code == 401
    assert "credentials required" in res.json()["message"]

    # Request with invalid token should fail with 401
    res_bad = client.get("/api/v1/projects", headers={"Authorization": "Bearer invalid_token"})
    assert res_bad.status_code == 401

    # Request with valid bearer token succeeds
    res_good = client.get("/api/v1/projects", headers={"Authorization": "Bearer pf_admin_secret_key_1234"})
    assert res_good.status_code == 200

def test_rate_limiting_feedback_endpoint():
    limiter._storage.reset()
    # Feedback limit is 10/minute/IP
    for _ in range(10):
        client.post(
            "/api/v1/feedback",
            data={"comment": "Rapid submission", "selector": "div.card"}
        )
    # The 11th request within the window must return 429
    res = client.post(
        "/api/v1/feedback",
        data={"comment": "Flood limit check", "selector": "div.card"}
    )
    assert res.status_code == 429
    data = res.json()
    assert data["success"] is False
    assert "Too Many Requests" in data["message"]


# ==================== Auth Endpoints ====================

def test_auth_register_and_login_flow():
    import uuid
    unique_email = f"user_{uuid.uuid4().hex[:8]}@example.com"
    password = "SuperSecurePassword123!"

    # 1. Register new user
    res_reg = client.post(
        "/auth/register",
        json={"email": unique_email, "password": password}
    )
    assert res_reg.status_code == 201
    assert res_reg.json()["message"] == "User created successfully"

    # 2. Duplicate registration should return 400
    res_dup = client.post(
        "/auth/register",
        json={"email": unique_email, "password": password}
    )
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["message"]

    # 3. Login with incorrect password should return 401
    res_bad_login = client.post(
        "/auth/login",
        json={"email": unique_email, "password": "WrongPassword!"}
    )
    assert res_bad_login.status_code == 401
    assert "Invalid email or password" in res_bad_login.json()["message"]

    # 4. Login with correct credentials should return token
    res_good_login = client.post(
        "/auth/login",
        json={"email": unique_email, "password": password}
    )
    assert res_good_login.status_code == 200
    token_data = res_good_login.json()
    assert "access_token" in token_data
    assert len(token_data["access_token"]) > 20


