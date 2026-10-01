from typing import Any
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from models import Feedback
from schemas import AnalyticsSummaryResponse
from security import RequireAdmin
from limiter import limiter

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsSummaryResponse)
@limiter.limit("30/minute")
def get_analytics(
    request: Request,
    db: Session = Depends(get_db),
    admin: Any = Depends(RequireAdmin())
):
    # Single GROUP BY aggregation for all status counts and total
    status_counts = db.query(Feedback.status, func.count(Feedback.id)).group_by(Feedback.status).all()
    status_map = {s: cnt for s, cnt in status_counts}
    open_c = status_map.get("open", 0)
    in_prog = status_map.get("in_progress", 0)
    resolved = status_map.get("resolved", 0)
    total = sum(status_map.values())

    # Sentiment Breakdown - Single GROUP BY
    sentiments = {"angry": 0, "neutral": 0, "loved": 0}
    sent_counts = db.query(Feedback.sentiment, func.count(Feedback.id)).group_by(Feedback.sentiment).all()
    for s, c in sent_counts:
        if s in sentiments:
            sentiments[s] = c

    # Category Breakdown - Single GROUP BY
    cat_counts = db.query(Feedback.category, func.count(Feedback.id)).group_by(Feedback.category).all()
    category_breakdown = {c or "UI Bug": cnt for c, cnt in cat_counts}

    # Priority Breakdown - Single GROUP BY
    priorities = {"low": 0, "medium": 0, "high": 0}
    pri_counts = db.query(Feedback.priority, func.count(Feedback.id)).group_by(Feedback.priority).all()
    for p, c in pri_counts:
        p_clean = (p or "medium").lower()
        if p_clean in priorities:
            priorities[p_clean] = c

    # Daily Volume (last 7 days) - Single query replacing 7 separate count queries
    now = datetime.utcnow()
    seven_days_ago = (now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
    recent_feedbacks = db.query(Feedback.created_at).filter(Feedback.created_at >= seven_days_ago).all()

    # Bucket in memory for universal SQLite/PostgreSQL portability
    day_counts = {}
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_counts[day_date] = 0

    for (created_at,) in recent_feedbacks:
        if created_at:
            d = created_at.date()
            if d in day_counts:
                day_counts[d] += 1

    daily_volume = [
        {"date": d.strftime("%b %d"), "count": cnt}
        for d, cnt in day_counts.items()
    ]

    # Top Pages - Single GROUP BY with limit
    page_counts = (
        db.query(Feedback.page_url, func.count(Feedback.id).label("cnt"))
        .group_by(Feedback.page_url)
        .order_by(func.count(Feedback.id).desc())
        .limit(5)
        .all()
    )
    top_pages = [{"url": p, "count": c} for p, c in page_counts]

    # Most Reported Elements - Single GROUP BY with limit
    elem_counts = (
        db.query(Feedback.target_selector, func.count(Feedback.id).label("cnt"))
        .group_by(Feedback.target_selector)
        .order_by(func.count(Feedback.id).desc())
        .limit(6)
        .all()
    )
    most_reported = [
        {
            "selector": s,
            "count": c,
            "tag": s.split(" ")[-1].split("#")[0].split(".")[0].upper() or "ELEMENT"
        }
        for s, c in elem_counts
    ]

    return {
        "total_feedback": total,
        "open_count": open_c,
        "in_progress_count": in_prog,
        "resolved_count": resolved,
        "sentiment_breakdown": sentiments,
        "category_breakdown": category_breakdown,
        "priority_breakdown": priorities,
        "daily_volume": daily_volume,
        "top_pages": top_pages,
        "most_reported_elements": most_reported
    }

