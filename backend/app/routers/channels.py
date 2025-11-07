"""Channel management endpoints."""
from datetime import date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Path, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, or_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.channel import Channel
from app.models.spend_report import AdSpendDaily
from app.utils.responses import failure, success


class ChannelCreateBody(BaseModel):
    name: str = Field(..., max_length=100)
    code: str = Field(..., max_length=100)
    status: str = Field(default="active", max_length=20)
    description: Optional[str] = Field(None, max_length=500)


class ChannelUpdateBody(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    code: Optional[str] = Field(None, max_length=100)
    status: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=500)


router = APIRouter(prefix="/api/channels", tags=["Channels"])


def _serialize(channel: Channel) -> Dict[str, Any]:
    return {
        "id": channel.id,
        "name": channel.name,
        "code": channel.contact,
        "status": channel.status,
        "description": channel.note,
        "created_at": channel.created_at.isoformat() if channel.created_at else None,
        "updated_at": channel.updated_at.isoformat() if channel.updated_at else None,
    }


@router.get("")
@router.get("/")
def list_channels(
    status: Optional[str] = Query(None, description="filter by status"),
    keyword: Optional[str] = Query(None, description="filter by name or code"),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    query = db.query(Channel)

    if status is not None:
        query = query.filter(Channel.status == status)

    if keyword:
        pattern = f"%{keyword}%"
        query = query.filter(or_(Channel.name.ilike(pattern), Channel.contact.ilike(pattern)))

    channels: List[Channel] = query.order_by(Channel.created_at.desc()).all()
    return success(data=[_serialize(channel) for channel in channels], meta={"total": len(channels)})


@router.post("")
@router.post("/")
def create_channel(
    *,
    body: ChannelCreateBody,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    existing = db.query(Channel.id).filter(Channel.contact == body.code).first()
    if existing is not None:
        return failure("channel_code_exists")

    channel = Channel(
        name=body.name,
        contact=body.code,
        status=body.status,
        note=body.description,
    )

    try:
        db.add(channel)
        db.commit()
        db.refresh(channel)
        return success(data=_serialize(channel), meta={"message": "channel_created"})
    except SQLAlchemyError:
        db.rollback()
        return failure("db_error")


@router.get("/stats")
def channel_stats(
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    today = date.today()
    first_day = today.replace(day=1)

    try:
        rows = (
            db.query(
                AdSpendDaily.channel_id,
                func.coalesce(func.sum(AdSpendDaily.amount_usdt), 0),
            )
            .filter(AdSpendDaily.channel_id.isnot(None))
            .filter(AdSpendDaily.spend_date >= first_day)
            .group_by(AdSpendDaily.channel_id)
            .all()
        )

        data = [
            {
                "channel_id": channel_id,
                "amount_usdt": str(amount),
            }
            for channel_id, amount in rows
        ]

        return success(data=data, meta={"month": first_day.strftime("%Y-%m")})
    except SQLAlchemyError:
        return failure("db_error")


@router.put("/{channel_id}")
def update_channel(
    *,
    channel_id: int = Path(..., ge=1),
    body: ChannelUpdateBody,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if channel is None:
        return failure("channel_not_found")

    update_data = body.model_dump(exclude_unset=True)

    if "code" in update_data and update_data["code"] != channel.contact:
        conflict = db.query(Channel.id).filter(Channel.contact == update_data["code"]).first()
        if conflict:
            return failure("channel_code_exists")

    if "name" in update_data:
        channel.name = update_data["name"]
    if "code" in update_data:
        channel.contact = update_data["code"]
    if "status" in update_data:
        channel.status = update_data["status"]
    if "description" in update_data:
        channel.note = update_data["description"]

    try:
        db.commit()
        db.refresh(channel)
        return success(data=_serialize(channel), meta={"message": "channel_updated"})
    except SQLAlchemyError:
        db.rollback()
        return failure("db_error")


@router.delete("/{channel_id}")
def soft_delete_channel(
    *,
    channel_id: int = Path(..., ge=1),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if channel is None:
        return failure("channel_not_found")

    channel.status = "disabled"

    try:
        db.commit()
        return success(data={"id": channel.id, "status": channel.status}, meta={"message": "channel_disabled"})
    except SQLAlchemyError:
        db.rollback()
        return failure("db_error")
