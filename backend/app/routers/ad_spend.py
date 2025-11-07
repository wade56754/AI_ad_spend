# Ad spend report router
from datetime import date
from decimal import Decimal
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.channel import Channel
from app.models.operator import Operator
from app.models.project import Project
from app.models.spend_report import AdSpendDaily
from app.utils.responses import failure, success


class AdSpendCreateBody(BaseModel):
    spend_date: date = Field(..., description='spend date')
    project_id: int = Field(..., description='project id')
    operator_id: int = Field(..., description='operator id')
    channel_id: int = Field(..., description='channel id')
    platform: str = Field(..., max_length=50, description='platform name')
    amount_usdt: Decimal = Field(..., gt=0, description='spend amount in USDT')
    remark: Optional[str] = Field(None, max_length=1000, description='optional memo')


router = APIRouter(prefix='/api/ad-spend', tags=['Ad Spend'])


def _serialize(record: AdSpendDaily) -> Dict[str, Any]:
    return {
        'id': record.id,
        'spend_date': record.spend_date.isoformat() if record.spend_date else None,
        'project_id': record.project_id,
        'operator_id': record.operator_id,
        'channel_id': record.channel_id,
        'platform': record.platform,
        'amount_usdt': str(record.amount_usdt) if record.amount_usdt is not None else None,
        'remark': record.raw_memo,
        'status': record.status,
        'created_at': record.created_at.isoformat() if record.created_at else None,
    }


@router.get('/')
def list_ad_spend(
    project_id: Optional[int] = Query(None, description='filter by project'),
    operator_id: Optional[int] = Query(None, description='filter by operator'),
    channel_id: Optional[int] = Query(None, description='filter by channel'),
    start_date: Optional[date] = Query(None, description='start date'),
    end_date: Optional[date] = Query(None, description='end date'),
    limit: int = Query(50, ge=1, le=1000, description='page size'),
    offset: int = Query(0, ge=0, description='offset'),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    try:
        query = db.query(AdSpendDaily)

        if project_id is not None:
            query = query.filter(AdSpendDaily.project_id == project_id)
        if operator_id is not None:
            query = query.filter(AdSpendDaily.operator_id == operator_id)
        if channel_id is not None:
            query = query.filter(AdSpendDaily.channel_id == channel_id)
        if start_date is not None:
            query = query.filter(AdSpendDaily.spend_date >= start_date)
        if end_date is not None:
            query = query.filter(AdSpendDaily.spend_date <= end_date)

        total = query.count()
        records: List[AdSpendDaily] = (
            query.order_by(desc(AdSpendDaily.spend_date), desc(AdSpendDaily.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )

        meta = {
            'total': total,
            'limit': limit,
            'offset': offset,
            'has_more': (offset + limit) < total,
        }
        data = [_serialize(record) for record in records]
        return success(data=data, meta=meta)
    except Exception as exc:  # pylint: disable=broad-exception-caught
        return failure(str(exc))


@router.post('/')
def create_ad_spend(
    *,
    body: AdSpendCreateBody,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    try:
        project = db.query(Project).filter(Project.id == body.project_id).first()
        if project is None:
            return failure(f'project {body.project_id} not found')

        operator = db.query(Operator).filter(Operator.id == body.operator_id).first()
        if operator is None:
            return failure(f'operator {body.operator_id} not found')

        channel = db.query(Channel).filter(Channel.id == body.channel_id).first()
        if channel is None:
            return failure(f'channel {body.channel_id} not found')

        previous = (
            db.query(AdSpendDaily)
            .filter(AdSpendDaily.operator_id == body.operator_id)
            .order_by(desc(AdSpendDaily.spend_date), desc(AdSpendDaily.created_at))
            .first()
        )

        warning: Optional[str] = None
        if previous is not None and previous.amount_usdt is not None:
            prev_amount = Decimal(previous.amount_usdt)
            if prev_amount > 0:
                diff_ratio = abs(body.amount_usdt - prev_amount) / prev_amount
                if diff_ratio > Decimal('0.3'):
                    warning = 'amount_diff_gt_30'

        record = AdSpendDaily(
            spend_date=body.spend_date,
            project_id=body.project_id,
            operator_id=body.operator_id,
            channel_id=body.channel_id,
            platform=body.platform,
            amount_usdt=body.amount_usdt,
            raw_memo=body.remark,
            status='pending',
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        meta: Dict[str, Any] = {}
        if warning is not None:
            meta['warning'] = warning

        return success(data=_serialize(record), meta=meta)
    except Exception as exc:  # pylint: disable=broad-exception-caught
        db.rollback()
        return failure(str(exc))
