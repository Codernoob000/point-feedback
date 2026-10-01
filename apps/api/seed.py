import datetime
from sqlalchemy.orm import Session
from models import Project, Feedback

def seed_database_if_empty(db: Session):
    existing_project = db.query(Project).first()
    if existing_project:
        return

    # Create default project
    project = Project(
        name="Linear / Acme Production App",
        api_key="pf_live_98a72b610c144e88",
        allowed_origins=["*"],
        created_at=datetime.utcnow() - datetime.timedelta(days=10)
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    sample_feedbacks = [
        {
            "sentiment": "angry",
            "comment": "Checkout button completely unresponsive when clicked on mobile Safari. The spinner triggers but the payment sheet never opens.",
            "target_selector": "button#checkout.btn-primary.checkout-trigger",
            "target_text_snippet": "Proceed to Checkout ($129/mo)",
            "bounding_box": {"x": 580, "y": 640, "width": 260, "height": 48},
            "dom_hierarchy": ["html", "body", "div#root", "main.checkout-container", "div.summary-card", "button#checkout"],
            "element_metadata": {
                "tag": "BUTTON",
                "id": "checkout",
                "classes": "btn-primary checkout-trigger w-full",
                "selector": "button#checkout.btn-primary",
                "text": "Proceed to Checkout ($129/mo)",
                "attributes": {"data-testid": "checkout-btn", "type": "submit"}
            },
            "page_url": "https://acme-cloud.io/pricing/checkout",
            "viewport_width": 390,
            "viewport_height": 844,
            "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
            "browser": "Mobile Safari 17.4",
            "pixel_ratio": 3.0,
            "telemetry": {
                "url": "https://acme-cloud.io/pricing/checkout",
                "viewportWidth": 390,
                "viewportHeight": 844,
                "pixelRatio": 3.0,
                "browser": "Mobile Safari 17.4",
                "userAgent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
                "os": "iOS 17.4",
                "language": "en-US",
                "referrer": "https://google.com"
            },
            "audio_duration": 4.8,
            "audio_transcript": "Hey team, clicking Proceed to Checkout on iPhone does not launch Apple Pay. It just hangs with the button locked in a disabled state.",
            "status": "open",
            "priority": "high",
            "category": "UI Bug",
            "ai_summary": "Checkout button hangs and fails to launch payment modal on iOS Safari",
            "linear_issue_url": "https://linear.app/point-feedback/issue/PF-104",
            "created_at": datetime.utcnow() - datetime.timedelta(hours=2)
        },
        {
            "sentiment": "neutral",
            "comment": "Contrast ratio on the dark mode badge seems slightly below WCAG AA guidelines against the #0F172A card background.",
            "target_selector": "span.badge-pill.status-tag",
            "target_text_snippet": "v2.4.0 BETA",
            "bounding_box": {"x": 320, "y": 140, "width": 96, "height": 24},
            "dom_hierarchy": ["html", "body", "div#root", "header.nav-header", "div.brand-row", "span.badge-pill"],
            "element_metadata": {
                "tag": "SPAN",
                "classes": "badge-pill status-tag text-xs font-mono",
                "selector": "span.badge-pill.status-tag",
                "text": "v2.4.0 BETA"
            },
            "page_url": "https://acme-cloud.io/dashboard",
            "viewport_width": 1440,
            "viewport_height": 900,
            "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0",
            "browser": "Chrome 124.0",
            "pixel_ratio": 2.0,
            "telemetry": {
                "url": "https://acme-cloud.io/dashboard",
                "viewportWidth": 1440,
                "viewportHeight": 900,
                "pixelRatio": 2.0,
                "browser": "Chrome 124.0",
                "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124.0.0.0",
                "os": "macOS",
                "language": "en-US"
            },
            "audio_duration": 6.1,
            "audio_transcript": "The beta badge text color is slate-400 on slate-900. Might want to bump it to slate-200 for better readability.",
            "status": "in_progress",
            "priority": "medium",
            "category": "Accessibility",
            "ai_summary": "Low contrast ratio on beta version badge in dashboard header",
            "created_at": datetime.utcnow() - datetime.timedelta(hours=7)
        },
        {
            "sentiment": "loved",
            "comment": "The new real-time analytics chart feels buttery smooth! Would love if we could also filter by country directly here.",
            "target_selector": "div.analytics-chart-container canvas",
            "target_text_snippet": "Live Ingestion Metrics (24h)",
            "bounding_box": {"x": 240, "y": 380, "width": 680, "height": 320},
            "dom_hierarchy": ["html", "body", "div#root", "main", "section.metrics-overview", "div.analytics-chart-container", "canvas"],
            "element_metadata": {
                "tag": "CANVAS",
                "classes": "w-full h-64",
                "selector": "div.analytics-chart-container canvas"
            },
            "page_url": "https://acme-cloud.io/analytics",
            "viewport_width": 1920,
            "viewport_height": 1080,
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36",
            "browser": "Chrome 124.0",
            "pixel_ratio": 1.0,
            "telemetry": {
                "url": "https://acme-cloud.io/analytics",
                "viewportWidth": 1920,
                "viewportHeight": 1080,
                "pixelRatio": 1.0,
                "browser": "Chrome 124.0",
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
                "os": "Windows 11",
                "language": "en-US"
            },
            "status": "resolved",
            "priority": "low",
            "category": "Feature Request",
            "ai_summary": "Add country filter dropdown to live ingestion chart",
            "created_at": datetime.utcnow() - datetime.timedelta(days=1, hours=3)
        },
        {
            "sentiment": "angry",
            "comment": "Modal close button is cut off behind the sticky navigation bar on 1366x768 screens.",
            "target_selector": "button.modal-close-btn",
            "target_text_snippet": "✕",
            "bounding_box": {"x": 890, "y": 62, "width": 36, "height": 36},
            "dom_hierarchy": ["html", "body", "div.modal-backdrop", "div.modal-content", "button.modal-close-btn"],
            "element_metadata": {
                "tag": "BUTTON",
                "classes": "modal-close-btn absolute top-2 right-2 text-slate-400",
                "selector": "button.modal-close-btn"
            },
            "page_url": "https://acme-cloud.io/settings/api-keys",
            "viewport_width": 1366,
            "viewport_height": 768,
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
            "browser": "Firefox 125.0",
            "pixel_ratio": 1.0,
            "telemetry": {
                "url": "https://acme-cloud.io/settings/api-keys",
                "viewportWidth": 1366,
                "viewportHeight": 768,
                "pixelRatio": 1.0,
                "browser": "Firefox 125.0",
                "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
                "os": "Windows 10",
                "language": "en-US"
            },
            "status": "open",
            "priority": "high",
            "category": "UI Bug",
            "ai_summary": "Modal dismiss button z-index collision under sticky navbar on 768p laptops",
            "created_at": datetime.utcnow() - datetime.timedelta(days=2)
        }
    ]

    for item_data in sample_feedbacks:
        fb = Feedback(
            project_id=project.id,
            **item_data
        )
        db.add(fb)

    db.commit()
