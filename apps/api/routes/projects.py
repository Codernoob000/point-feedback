import uuid
from typing import List, Any
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Project, Feedback
from schemas import ProjectResponse, ProjectCreate, mask_api_key
from security import RequireAdmin
from limiter import limiter

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectResponse])
@limiter.limit("30/minute")
def get_projects(
    request: Request,
    db: Session = Depends(get_db),
    admin: Any = Depends(RequireAdmin())
):
    rows = (
        db.query(Project, func.count(Feedback.id).label("feedback_count"))
        .outerjoin(Feedback, Project.id == Feedback.project_id)
        .group_by(Project.id)
        .all()
    )
    result = []
    for p, cnt in rows:
        result.append(
            ProjectResponse(
                id=p.id,
                name=p.name,
                api_key=mask_api_key(p.api_key),
                allowed_origins=p.allowed_origins or ["*"],
                feedback_count=cnt,
                created_at=p.created_at
            )
        )
    return result

@router.post("", response_model=ProjectResponse)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    raw_api_key = f"pf_live_{uuid.uuid4().hex[:18]}"
    project = Project(
        name=data.name,
        api_key=raw_api_key,
        allowed_origins=data.allowed_origins or ["*"]
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectResponse(
        id=project.id,
        name=project.name,
        api_key=mask_api_key(project.api_key),
        allowed_origins=project.allowed_origins or ["*"],
        feedback_count=0,
        created_at=project.created_at
    )

