from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import date
from app.db.session import get_db
from app.models.finance_ledger import LedgerTransaction
from app.schemas.finance_ledger import (
    LedgerTransactionCreate,
    LedgerTransactionResponse,
    LedgerListResponse
)

router = APIRouter(prefix="/ledger", tags=["财务收支录入"])


@router.get("", response_model=LedgerListResponse)
def get_ledger(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    project_id: Optional[int] = Query(None, description="项目ID筛选"),
    operator_id: Optional[int] = Query(None, description="投手ID筛选"),
    direction: Optional[str] = Query(None, description="方向筛选：income/expense"),
    start_date: Optional[date] = Query(None, description="开始日期"),
    end_date: Optional[date] = Query(None, description="结束日期"),
    db: Session = Depends(get_db)
):
    """获取财务收支记录列表"""
    try:
        query = db.query(LedgerTransaction)

        # 筛选条件
        if project_id:
            query = query.filter(LedgerTransaction.project_id == project_id)
        if operator_id:
            query = query.filter(LedgerTransaction.operator_id == operator_id)
        if direction and direction in ["income", "expense"]:
            query = query.filter(LedgerTransaction.direction == direction)
        if start_date:
            query = query.filter(LedgerTransaction.tx_date >= start_date)
        if end_date:
            query = query.filter(LedgerTransaction.tx_date <= end_date)

        # 获取总数
        total = query.count()

        # 排序和分页
        records = query.order_by(desc(LedgerTransaction.tx_date), desc(LedgerTransaction.created_at)).offset(skip).limit(limit).all()

        # 转换为响应格式
        data = [
            LedgerTransactionResponse(
                id=record.id,
                tx_date=record.tx_date,
                direction=record.direction,
                amount=record.amount,
                currency=record.currency,
                account=record.account,
                description=record.description,
                fee_amount=record.fee_amount,
                project_id=record.project_id,
                operator_id=record.operator_id,
                status=record.status,
                created_at=record.created_at.isoformat() if record.created_at else None
            )
            for record in records
        ]

        return LedgerListResponse(
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


@router.post("", response_model=dict)
def create_ledger(
    ledger_data: LedgerTransactionCreate,
    db: Session = Depends(get_db)
):
    """创建财务收支记录"""
    try:
        # 验证方向字段
        if ledger_data.direction not in ["income", "expense"]:
            return {
                "data": None,
                "error": "direction 必须是 'income' 或 'expense'",
                "meta": None
            }

        # 验证项目是否存在（如果提供了项目ID）
        if ledger_data.project_id:
            from app.models.project import Project
            project = db.query(Project).filter(Project.id == ledger_data.project_id).first()
            if not project:
                return {
                    "data": None,
                    "error": f"项目ID {ledger_data.project_id} 不存在",
                    "meta": None
                }

        # 验证投手是否存在（如果提供了投手ID）
        if ledger_data.operator_id:
            from app.models.operator import Operator
            operator = db.query(Operator).filter(Operator.id == ledger_data.operator_id).first()
            if not operator:
                return {
                    "data": None,
                    "error": f"投手ID {ledger_data.operator_id} 不存在",
                    "meta": None
                }

        # 创建记录
        new_ledger = LedgerTransaction(
            tx_date=ledger_data.tx_date,
            direction=ledger_data.direction,
            amount=ledger_data.amount,
            currency=ledger_data.currency,
            account=ledger_data.account,
            description=ledger_data.description,
            fee_amount=ledger_data.fee_amount,
            project_id=ledger_data.project_id,
            operator_id=ledger_data.operator_id,
            status="pending"
        )

        db.add(new_ledger)
        db.commit()
        db.refresh(new_ledger)

        # 构建响应
        response_data = LedgerTransactionResponse(
            id=new_ledger.id,
            tx_date=new_ledger.tx_date,
            direction=new_ledger.direction,
            amount=new_ledger.amount,
            currency=new_ledger.currency,
            account=new_ledger.account,
            description=new_ledger.description,
            fee_amount=new_ledger.fee_amount,
            project_id=new_ledger.project_id,
            operator_id=new_ledger.operator_id,
            status=new_ledger.status,
            created_at=new_ledger.created_at.isoformat() if new_ledger.created_at else None
        )

        return {
            "data": response_data.model_dump(),
            "error": None,
            "meta": {"message": "财务记录创建成功"}
        }
    except Exception as e:
        db.rollback()
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }

