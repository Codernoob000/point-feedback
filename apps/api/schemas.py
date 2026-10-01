from enum import Enum
from pydantic import (
    BaseModel,
    Field,
    ConfigDict,
    EmailStr
)
from typing import Optional, List, Dict, Any
from datetime import datetime


class StatusEnum(str, Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    archived = "archived"


class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class SentimentEnum(str, Enum):
    angry = "angry"
    neutral = "neutral"
    loved = "loved"


class CategoryEnum(str, Enum):
    ui_bug = "UI Bug"
    performance = "Performance"
    accessibility = "Accessibility"
    feature_request = "Feature Request"
    other = "Other"


def mask_api_key(key: Optional[str]) -> str:
    if not key:
        return ""
    last_four = key[-4:] if len(key) >= 4 else key
    return f"pf_live_********{last_four}"


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    allowed_origins: Optional[List[str]] = ["*"]


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    api_key: str
    feedback_count: Optional[int] = 0
    created_at: datetime


class BoundingBoxSchema(BaseModel):
    x: float
    y: float
    width: float
    height: float


class FeedbackBase(BaseModel):
    sentiment: SentimentEnum = SentimentEnum.neutral
    comment: str = Field(..., min_length=1, max_length=5000)
    target_selector: str = Field(..., min_length=1, max_length=500)
    target_text_snippet: Optional[str] = None
    page_url: str = Field(..., min_length=1, max_length=1000)
    viewport_width: Optional[int] = Field(1920, ge=1, le=10000)
    viewport_height: Optional[int] = Field(1080, ge=1, le=10000)
    user_agent: Optional[str] = None
    browser: Optional[str] = None
    pixel_ratio: Optional[float] = 1.0


class FeedbackUpdate(BaseModel):
    status: Optional[StatusEnum] = None
    priority: Optional[PriorityEnum] = None
    category: Optional[CategoryEnum] = None
    comment: Optional[str] = Field(None, min_length=1, max_length=5000)


class FeedbackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    project_id: str
    sentiment: str
    comment: str
    target_selector: str
    target_text_snippet: Optional[str] = None
    bounding_box: Optional[Dict[str, Any]] = None
    dom_hierarchy: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = Field(default=None, alias="element_metadata")
    page_url: str
    viewport_width: int
    viewport_height: int
    user_agent: Optional[str] = None
    browser: Optional[str] = None
    pixel_ratio: Optional[float] = 1.0
    telemetry: Optional[Dict[str, Any]] = None
    audio_url: Optional[str] = None
    audio_duration: Optional[float] = None
    audio_transcript: Optional[str] = None
    screenshot_url: Optional[str] = None
    status: str
    priority: Optional[str] = "medium"
    category: Optional[str] = "UI Bug"
    ai_summary: Optional[str] = None
    linear_issue_url: Optional[str] = None
    jira_issue_key: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class FeedbackListResponse(BaseModel):
    items: List[FeedbackResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class AnalyticsSummaryResponse(BaseModel):
    total_feedback: int
    open_count: int
    in_progress_count: int
    resolved_count: int
    sentiment_breakdown: Dict[str, int]
    category_breakdown: Dict[str, int]
    priority_breakdown: Dict[str, int]
    daily_volume: List[Dict[str, Any]]
    top_pages: List[Dict[str, Any]]
    most_reported_elements: List[Dict[str, Any]]


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str