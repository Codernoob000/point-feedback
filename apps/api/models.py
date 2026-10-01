from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, JSON, ForeignKey, Index
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    email = Column(String, unique=True, nullable=False, index=True)

    password_hash = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    api_key = Column(String(255), unique=True, nullable=False, index=True)
    allowed_origins = Column(JSON, default=list) # e.g. ["*"] or ["http://localhost:3000"]
    created_at = Column(DateTime, default=datetime.utcnow)

    feedbacks = relationship("Feedback", back_populates="project", cascade="all, delete-orphan")

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    sentiment = Column(String(50), nullable=False, default="neutral", index=True) # angry, neutral, loved
    comment = Column(Text, nullable=False, default="")
    target_selector = Column(String(500), nullable=False, index=True)
    target_text_snippet = Column(Text, nullable=True)
    bounding_box = Column(JSON, nullable=True) # {x, y, width, height}
    dom_hierarchy = Column(JSON, nullable=True) # list of ancestor selectors / tags
    element_metadata = Column(JSON, nullable=True) # tag, id, classes, attributes
    page_url = Column(String(1000), nullable=False, index=True)
    viewport_width = Column(Integer, default=1920)
    viewport_height = Column(Integer, default=1080)
    user_agent = Column(Text, nullable=True)
    browser = Column(String(100), nullable=True)
    pixel_ratio = Column(Float, default=1.0)
    telemetry = Column(JSON, nullable=True)
    audio_url = Column(String(1000), nullable=True)
    audio_duration = Column(Float, nullable=True)
    audio_transcript = Column(Text, nullable=True)
    screenshot_url = Column(String(1000), nullable=True)
    status = Column(String(50), default="open", index=True) # open, in_progress, resolved, archived
    priority = Column(String(50), default="medium", index=True) # low, medium, high
    category = Column(String(100), default="UI Bug", index=True) # UI Bug, Performance, Accessibility, Feature Request
    ai_summary = Column(Text, nullable=True)
    linear_issue_url = Column(String(500), nullable=True)
    jira_issue_key = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("ix_feedbacks_project_id_created_at", "project_id", "created_at"),
        Index("ix_feedbacks_project_id_status", "project_id", "status"),
    )

    project = relationship("Project", back_populates="feedbacks")

