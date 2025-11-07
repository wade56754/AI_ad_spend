"""Project management endpoints."""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Path, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.project import Project
from app.utils.responses import failure, success


class ProjectCreateBody(BaseModel):
    name: str = Field(..., max_length=100)
    code: str = Field(..., max_length=50)
    status: str = Field(default="active", max_length=20)
    description: Optional[str] = Field(None, max_length=1000)


class ProjectUpdateBody(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    code: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=1000)


router = APIRouter(prefix="/api/projects", tags=["Projects"])


def _serialize(project: Project) -> Dict[str, Any]:
    return {
        "id": project.id,
        "name": project.name,
        "code": project.code,
        "status": project.status,
        "description": project.description,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
    }


@router.get("")
@router.get("/")
def list_projects(
    status: Optional[str] = Query(None, description="filter by status"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    query = db.query(Project)

    if status is not None:
        query = query.filter(Project.status == status)

    projects: List[Project] = query.order_by(desc(Project.created_at)).all()
    return success(data=[_serialize(project) for project in projects], meta={"total": len(projects)})


@router.post("")
@router.post("/")
def create_project(
    *,
    body: ProjectCreateBody,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    existing = db.query(Project.id).filter(Project.code == body.code).first()
    if existing is not None:
        return failure("project_code_exists")

    project = Project(
        name=body.name,
        code=body.code,
        status=body.status,
        description=body.description,
    )

    try:
        db.add(project)
        db.commit()
        db.refresh(project)
        return success(data=_serialize(project), meta={"message": "project_created"})
    except SQLAlchemyError:
        db.rollback()
        return failure("db_error")


@router.put("/{project_id}")
def update_project(
    *,
    project_id: int = Path(..., ge=1),
    body: ProjectUpdateBody,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        return failure("project_not_found")

    update_data = body.model_dump(exclude_unset=True)

    if "code" in update_data and update_data["code"] != project.code:
        conflict = db.query(Project.id).filter(Project.code == update_data["code"]).first()
        if conflict:
            return failure("project_code_exists")

    for field, value in update_data.items():
        setattr(project, field, value)

    try:
        db.commit()
        db.refresh(project)
        return success(data=_serialize(project), meta={"message": "project_updated"})
    except SQLAlchemyError:
        db.rollback()
        return failure("db_error")


@router.delete("/{project_id}")
def archive_project(
    *,
    project_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        return failure("project_not_found")

    project.status = "archived"

    try:
        db.commit()
        return success(data={"id": project.id, "status": project.status}, meta={"message": "project_archived"})
    except SQLAlchemyError:
        db.rollback()
        return failure("db_error")
