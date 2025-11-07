from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from app.db.session import get_db
from app.models.project import Project
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectListResponse
)

router = APIRouter(prefix="/projects", tags=["项目管理"])


@router.get("", response_model=ProjectListResponse)
def get_projects(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    status: Optional[str] = Query(None, description="状态筛选"),
    db: Session = Depends(get_db)
):
    """获取项目列表"""
    try:
        query = db.query(Project)

        if status:
            query = query.filter(Project.status == status)

        total = query.count()
        records = query.order_by(desc(Project.created_at)).offset(skip).limit(limit).all()

        data = [
            ProjectResponse(
                id=record.id,
                name=record.name,
                code=record.code,
                status=record.status,
                description=record.description,
                created_at=record.created_at.isoformat() if record.created_at else "",
                updated_at=record.updated_at.isoformat() if record.updated_at else None
            )
            for record in records
        ]

        return ProjectListResponse(
            data=data,
            error=None,
            meta={
                "total": total,
                "skip": skip,
                "limit": limit,
                "has_more": (skip + limit) < total
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}", response_model=dict)
def get_project(
    project_id: int,
    db: Session = Depends(get_db)
):
    """获取单个项目"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {
                "data": None,
                "error": f"项目ID {project_id} 不存在",
                "meta": None
            }

        data = ProjectResponse(
            id=project.id,
            name=project.name,
            code=project.code,
            status=project.status,
            description=project.description,
            created_at=project.created_at.isoformat() if project.created_at else "",
            updated_at=project.updated_at.isoformat() if project.updated_at else None
        )

        return {
            "data": data.model_dump(),
            "error": None,
            "meta": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

