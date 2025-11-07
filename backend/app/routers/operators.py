"""Operator management endpoints."""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Path, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.operator import Operator
from app.utils.responses import failure, success


class OperatorCreateBody(BaseModel):
    name: str = Field(..., max_length=100)
    project_id: Optional[int] = Field(None, ge=1)
    auth_user_id: Optional[str] = Field(None, max_length=255)
    status: str = Field(default="active", max_length=20)


class OperatorUpdateBody(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    project_id: Optional[int] = Field(None, ge=1)
    auth_user_id: Optional[str] = Field(None, max_length=255)
    status: Optional[str] = Field(None, max_length=20)


router = APIRouter(prefix="/operators", tags=["Operators"])


def _serialize(operator: Operator) -> Dict[str, Any]:
    return {
        "id": operator.id,
        "name": operator.name,
        "project_id": operator.project_id,
        "auth_user_id": operator.employee_id,
        "status": operator.status,
        "created_at": operator.created_at.isoformat() if operator.created_at else None,
        "updated_at": operator.updated_at.isoformat() if operator.updated_at else None,
    }


@router.get("")
@router.get("/")
def list_operators(
    project_id: Optional[int] = Query(None, ge=1, description="filter by project"),
    status: Optional[str] = Query(None, description="filter by status"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    query = db.query(Operator)

    if project_id is not None:
        query = query.filter(Operator.project_id == project_id)

    if status is not None:
        query = query.filter(Operator.status == status)

    operators: List[Operator] = query.order_by(desc(Operator.created_at)).all()
    return success(data=[_serialize(operator) for operator in operators], meta={"total": len(operators)})


@router.post("")
@router.post("/")
def create_operator(
    *,
    body: OperatorCreateBody,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    operator = Operator(
        name=body.name,
        project_id=body.project_id,
        employee_id=body.auth_user_id,
        role='operator',
        status=body.status,
    )

    try:
        db.add(operator)
        db.commit()
        db.refresh(operator)
        return success(data=_serialize(operator), meta={"message": "operator_created"})
    except SQLAlchemyError:
        db.rollback()
        return failure("db_error")


@router.put("/{operator_id}")
def update_operator(
    *,
    operator_id: int = Path(..., ge=1),
    body: OperatorUpdateBody,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    operator = db.query(Operator).filter(Operator.id == operator_id).first()
    if operator is None:
        return failure("operator_not_found")

    update_data = body.model_dump(exclude_unset=True)

    if "auth_user_id" in update_data:
        operator.employee_id = update_data.pop("auth_user_id")

    for field, value in update_data.items():
        setattr(operator, field, value)

    try:
        db.commit()
        db.refresh(operator)
        return success(data=_serialize(operator), meta={"message": "operator_updated"})
    except SQLAlchemyError:
        db.rollback()
        return failure("db_error")
