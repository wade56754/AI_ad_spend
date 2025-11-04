from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from app.db.session import get_db
from app.models.reconciliation import Reconciliation
from app.models.spend_report import AdSpendDaily
from app.models.finance_ledger import LedgerTransaction
from app.models.operator import Operator
from app.models.project import Project
from app.services.reconciliation_service import run_reconciliation
from app.schemas.reconciliation import (
    ReconciliationRunResponse,
    ReconciliationListResponse,
    ReconciliationDetailResponse,
    ReconciliationUpdate
)

router = APIRouter(prefix="/reconcile", tags=["对账"])


@router.post("/run", response_model=dict)
def run_reconcile(db: Session = Depends(get_db)):
    """
    手动触发对账
    
    从 ad_spend_daily 里取出状态为 pending 的记录
    从 ledger_transactions 里取出最近7天内、方向为支出的记录
    进行匹配并生成对账结果
    """
    try:
        result = run_reconciliation(db)

        return {
            "data": result,
            "error": None,
            "meta": {
                "message": "对账执行完成",
                "success_rate": f"{(result['matched_count'] / result['total_processed'] * 100):.2f}%" if result['total_processed'] > 0 else "0%"
            }
        }
    except Exception as e:
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }


@router.get("", response_model=dict)
def get_reconciliations(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    status: Optional[str] = Query(None, description="状态筛选"),
    db: Session = Depends(get_db)
):
    """获取对账结果列表"""
    try:
        query = db.query(Reconciliation)

        # 状态筛选
        if status:
            query = query.filter(Reconciliation.status == status)

        # 获取总数
        total = query.count()

        # 排序和分页
        records = query.order_by(desc(Reconciliation.created_at)).offset(skip).limit(limit).all()

        # 构建响应数据
        data = []
        for record in records:
            # 获取关联的投手日报信息
            ad_spend = db.query(AdSpendDaily).filter(AdSpendDaily.id == record.ad_spend_id).first()
            ad_spend_info = None
            if ad_spend:
                # 获取投手信息
                operator = db.query(Operator).filter(Operator.id == ad_spend.operator_id).first()
                # 获取项目信息
                project = db.query(Project).filter(Project.id == ad_spend.project_id).first()
                
                ad_spend_info = {
                    "id": ad_spend.id,
                    "operator_name": operator.name if operator else None,
                    "project_name": project.name if project else None,
                    "spend_date": ad_spend.spend_date.isoformat() if ad_spend.spend_date else None,
                    "amount_usdt": float(ad_spend.amount_usdt) if ad_spend.amount_usdt else None,
                }

            # 获取关联的财务记录信息
            ledger = db.query(LedgerTransaction).filter(LedgerTransaction.id == record.ledger_id).first()
            ledger_info = None
            if ledger:
                ledger_info = {
                    "id": ledger.id,
                    "tx_date": ledger.tx_date.isoformat() if ledger.tx_date else None,
                    "amount": float(ledger.amount) if ledger.amount else None,
                    "currency": ledger.currency,
                }

            data.append(ReconciliationDetailResponse(
                id=record.id,
                ad_spend_id=record.ad_spend_id,
                ledger_id=record.ledger_id,
                amount_diff=record.amount_diff,
                date_diff=record.date_diff,
                match_score=record.match_score,
                status=record.status,
                reason=record.reason,
                created_at=record.created_at.isoformat() if record.created_at else None,
                ad_spend=ad_spend_info,
                ledger_transaction=ledger_info
            ))

        return {
            "data": [item.model_dump() for item in data],
            "error": None,
            "meta": {
                "total": total,
                "skip": skip,
                "limit": limit,
                "has_more": (skip + limit) < total
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{reconciliation_id}", response_model=dict)
def update_reconciliation(
    reconciliation_id: int,
    update_data: ReconciliationUpdate,
    db: Session = Depends(get_db)
):
    """更新对账记录状态"""
    try:
        # 查找对账记录
        reconciliation = db.query(Reconciliation).filter(
            Reconciliation.id == reconciliation_id
        ).first()

        if not reconciliation:
            return {
                "data": None,
                "error": f"对账记录 ID {reconciliation_id} 不存在",
                "meta": None
            }

        # 更新状态
        reconciliation.status = update_data.status

        # 如果状态改为 matched，同时更新关联记录的状态
        if update_data.status == "matched":
            # 更新投手日报状态
            ad_spend = db.query(AdSpendDaily).filter(
                AdSpendDaily.id == reconciliation.ad_spend_id
            ).first()
            if ad_spend:
                ad_spend.status = "matched"

            # 更新财务记录状态
            ledger = db.query(LedgerTransaction).filter(
                LedgerTransaction.id == reconciliation.ledger_id
            ).first()
            if ledger:
                ledger.status = "matched"

        db.commit()
        db.refresh(reconciliation)

        return {
            "data": {
                "id": reconciliation.id,
                "status": reconciliation.status
            },
            "error": None,
            "meta": {"message": "对账记录更新成功"}
        }
    except Exception as e:
        db.rollback()
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }
