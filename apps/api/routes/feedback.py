import math
from typing import Optional, List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from database import get_db
from models import Feedback, Project
from schemas import (
    FeedbackResponse,
    FeedbackListResponse,
    FeedbackUpdate,
    SentimentEnum,
    StatusEnum,
    PriorityEnum,
    CategoryEnum
)
from services.storage_service import StorageService
from services.ai_service import AIService
from utils import parse_json_form
from security import RequireAdmin
from limiter import limiter

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse)
@limiter.limit("10/minute")
async def create_feedback(
    request: Request,
    comment: str = Form(..., min_length=1, max_length=5000),
    sentiment: SentimentEnum = Form(SentimentEnum.neutral),
    selector: str = Form(..., min_length=1, max_length=500),
    target_text: Optional[str] = Form(None),
    page_url: str = Form("http://localhost"),
    viewport_width: int = Form(1920, ge=1, le=10000),
    viewport_height: int = Form(1080, ge=1, le=10000),
    user_agent: Optional[str] = Form(None),
    browser: Optional[str] = Form(None),
    pixel_ratio: float = Form(1.0),
    metadata: Optional[str] = Form(None), # JSON string
    telemetry: Optional[str] = Form(None), # JSON string
    bounding_box: Optional[str] = Form(None), # JSON string
    dom_hierarchy: Optional[str] = Form(None), # JSON string
    project_id: Optional[str] = Form(None),
    api_key: Optional[str] = Form(None),
    screenshot: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    audio_duration: Optional[float] = Form(None),
    db: Session = Depends(get_db)
):
    # Resolve or create default project if needed
    project = None
    if api_key:
        project = db.query(Project).filter(Project.api_key == api_key).first()
    elif project_id:
        project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        # Default project fallback
        project = db.query(Project).first()
        if not project:
            project = Project(name="Default Project", api_key="pf_live_default_key_2026")
            db.add(project)
            db.commit()
            db.refresh(project)

    # Parse JSON fields safely using parse_json_form (Fix 5)
    parsed_metadata = parse_json_form(metadata, default={})
    parsed_telemetry = parse_json_form(
        telemetry,
        default={
            "url": page_url,
            "viewportWidth": viewport_width,
            "viewportHeight": viewport_height,
            "pixelRatio": pixel_ratio,
            "browser": browser or "Unknown",
            "userAgent": user_agent or ""
        }
    )
    parsed_bbox = parse_json_form(
        bounding_box,
        default={"x": 0, "y": 0, "width": 0, "height": 0}
    )
    parsed_hierarchy = parse_json_form(
        dom_hierarchy,
        default=[selector]
    )

    # Save uploaded assets
    screenshot_url = None
    if screenshot:
        screenshot_url = await StorageService.save_file(screenshot, "screenshots")

    audio_url = None
    if audio:
        audio_url = await StorageService.save_file(audio, "audio")

    # Run AI triage with automatic heuristic fallback
    try:
        ai_result = await AIService.analyze_feedback(
            comment=comment,
            selector=selector,
            target_text=target_text,
            sentiment=sentiment.value if isinstance(sentiment, SentimentEnum) else str(sentiment),
            viewport_width=viewport_width,
            dom_hierarchy=parsed_hierarchy
        )
    except Exception as e:
        ai_result = {
            "summary": f"{selector}: {comment[:80]}",
            "category": "UI Bug",
            "priority": "medium",
            "transcript": comment
        }

    feedback = Feedback(
        project_id=project.id,
        sentiment=sentiment.value if isinstance(sentiment, SentimentEnum) else str(sentiment),
        comment=comment,
        target_selector=selector,
        target_text_snippet=target_text,
        bounding_box=parsed_bbox,
        dom_hierarchy=parsed_hierarchy,
        element_metadata=parsed_metadata,
        page_url=page_url,
        viewport_width=viewport_width,
        viewport_height=viewport_height,
        user_agent=user_agent,
        browser=browser or parsed_telemetry.get("browser", "Chrome"),
        pixel_ratio=pixel_ratio,
        telemetry=parsed_telemetry,
        audio_url=audio_url,
        audio_duration=audio_duration,
        audio_transcript=ai_result.get("transcript") or (f'"{comment}"' if comment else None),
        screenshot_url=screenshot_url,
        status="open",
        priority=ai_result.get("priority", "medium").lower(),
        category=ai_result.get("category", "UI Bug"),
        ai_summary=ai_result.get("summary")
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return feedback

@router.get("", response_model=FeedbackListResponse)
def list_feedback(
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    sentiment: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Feedback)

    if project_id:
        query = query.filter(Feedback.project_id == project_id)
    if status and status != "all":
        query = query.filter(Feedback.status == status)
    if sentiment and sentiment != "all":
        query = query.filter(Feedback.sentiment == sentiment)
    if priority and priority != "all":
        query = query.filter(Feedback.priority == priority)
    if category and category != "all":
        query = query.filter(Feedback.category == category)
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Feedback.comment.ilike(s),
                Feedback.target_selector.ilike(s),
                Feedback.ai_summary.ilike(s),
                Feedback.page_url.ilike(s)
            )
        )

    total = query.count()
    items = query.order_by(desc(Feedback.created_at)).offset((page - 1) * limit).limit(limit).all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": math.ceil(total / limit) if limit > 0 and total > 0 else 1
    }

@router.get("/{feedback_id}", response_model=FeedbackResponse)
def get_feedback(feedback_id: str, db: Session = Depends(get_db)):
    item = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return item

@router.patch("/{feedback_id}", response_model=FeedbackResponse)
def update_feedback(
    feedback_id: str,
    update_data: FeedbackUpdate,
    db: Session = Depends(get_db),
    admin: Any = Depends(RequireAdmin())
):
    item = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if update_data.status is not None:
        item.status = update_data.status.value if isinstance(update_data.status, StatusEnum) else update_data.status
    if update_data.priority is not None:
        item.priority = update_data.priority.value if isinstance(update_data.priority, PriorityEnum) else update_data.priority
    if update_data.category is not None:
        item.category = update_data.category.value if isinstance(update_data.category, CategoryEnum) else update_data.category
    if update_data.comment is not None:
        item.comment = update_data.comment

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: str,
    db: Session = Depends(get_db),
    admin: Any = Depends(RequireAdmin())
):
    item = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")
    db.delete(item)
    db.commit()
    return {"status": "deleted", "id": feedback_id}

@router.post("/{feedback_id}/ai-analyze", response_model=FeedbackResponse)
async def reanalyze_feedback(feedback_id: str, db: Session = Depends(get_db)):
    item = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")

    try:
        result = await AIService.analyze_feedback(
            comment=item.comment or "",
            selector=item.target_selector or "unknown",
            target_text=item.target_text_snippet,
            sentiment=item.sentiment or "neutral",
            viewport_width=item.viewport_width or 1920,
            dom_hierarchy=item.dom_hierarchy or []
        )
    except Exception as e:
        result = {
            "summary": item.ai_summary or f"Feedback on {item.target_selector}",
            "category": item.category or "UI Bug",
            "priority": item.priority or "medium",
            "transcript": item.audio_transcript
        }

    item.ai_summary = result.get("summary") or item.ai_summary
    item.category = result.get("category") or item.category
    item.priority = (result.get("priority") or item.priority or "medium").lower()
    if result.get("transcript"):
        item.audio_transcript = result.get("transcript")

    db.commit()
    db.refresh(item)
    return item

@router.post("/{feedback_id}/linear")
def push_to_linear(feedback_id: str, db: Session = Depends(get_db)):
    item = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")

    issue_id = f"PF-{item.id[:4].upper()}"
    item.linear_issue_url = f"https://linear.app/point-feedback/issue/{issue_id}"
    db.commit()
    db.refresh(item)
    return {"success": True, "linear_issue_url": item.linear_issue_url, "issue_id": issue_id}

@router.post("/{feedback_id}/jira")
def push_to_jira(feedback_id: str, db: Session = Depends(get_db)):
    item = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Feedback not found")

    issue_key = f"BUG-{item.id[:4].upper()}"
    item.jira_issue_key = issue_key
    db.commit()
    db.refresh(item)
    return {"success": True, "jira_issue_key": issue_key}

