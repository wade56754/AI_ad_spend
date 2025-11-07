from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from app.db.session import get_db
from app.models.operator import Operator
from app.schemas.operator import (
    OperatorCreate,
    OperatorUpdate,
    OperatorResponse,
    OperatorListResponse
)

router = APIRouter(prefix="/operators", tags=["投手管理"])


@router.get("", response_model=OperatorListResponse)
def get_operators(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    project_id: Optional[int] = Query(None, description="项目ID筛选"),
    status: Optional[str] = Query(None, description="状态筛选"),
    db: Session = Depends(get_db)
):
    """获取投手列表"""
    try:
        query = db.query(Operator)

        if project_id:
            query = query.filter(Operator.project_id == project_id)
        if status:
            query = query.filter(Operator.status == status)

        total = query.count()
        records = query.order_by(desc(Operator.created_at)).offset(skip).limit(limit).all()

        data = [
            OperatorResponse(
                id=record.id,
                name=record.name,
                employee_id=record.employee_id,
                project_id=record.project_id,
                role=record.role,
                status=record.status,
                created_at=record.created_at.isoformat() if record.created_at else "",
                updated_at=record.updated_at.isoformat() if record.updated_at else None
            )
            for record in records
        ]

        return OperatorListResponse(
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

