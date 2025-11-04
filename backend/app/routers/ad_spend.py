from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import date
from app.db.session import get_db
from app.models.spend_report import AdSpendDaily
from app.schemas.spend_report import (
    AdSpendCreate,
    AdSpendResponse,
    AdSpendListResponse
)

router = APIRouter(prefix="/ad-spend", tags=["投手消耗上报"])


@router.get("", response_model=AdSpendListResponse)
def get_ad_spend(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    project_id: Optional[int] = Query(None, description="项目ID筛选"),
    operator_id: Optional[int] = Query(None, description="投手ID筛选"),
    start_date: Optional[date] = Query(None, description="开始日期"),
    end_date: Optional[date] = Query(None, description="结束日期"),
    db: Session = Depends(get_db)
):
    """获取投手消耗上报列表"""
    try:
        query = db.query(AdSpendDaily)

        # 筛选条件
        if project_id:
            query = query.filter(AdSpendDaily.project_id == project_id)
        if operator_id:
            query = query.filter(AdSpendDaily.operator_id == operator_id)
        if start_date:
            query = query.filter(AdSpendDaily.spend_date >= start_date)
        if end_date:
            query = query.filter(AdSpendDaily.spend_date <= end_date)

        # 获取总数
        total = query.count()

        # 排序和分页
        records = query.order_by(desc(AdSpendDaily.spend_date), desc(AdSpendDaily.created_at)).offset(skip).limit(limit).all()

        # 转换为响应格式
        data = [
            AdSpendResponse(
                id=record.id,
                spend_date=record.spend_date,
                project_id=record.project_id,
                country=record.country,
                operator_id=record.operator_id,
                platform=record.platform,
                amount_usdt=record.amount_usdt,
                raw_memo=record.raw_memo,
                status=record.status,
                created_at=record.created_at.isoformat() if record.created_at else None
            )
            for record in records
        ]

        return AdSpendListResponse(
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
def create_ad_spend(
    spend_data: AdSpendCreate,
    db: Session = Depends(get_db)
):
    """创建投手消耗上报"""
    try:
        # 验证项目是否存在
        from app.models.project import Project
        project = db.query(Project).filter(Project.id == spend_data.project_id).first()
        if not project:
            return {
                "data": None,
                "error": f"项目ID {spend_data.project_id} 不存在",
                "meta": None
            }

        # 验证投手是否存在
        from app.models.operator import Operator
        operator = db.query(Operator).filter(Operator.id == spend_data.operator_id).first()
        if not operator:
            return {
                "data": None,
                "error": f"投手ID {spend_data.operator_id} 不存在",
                "meta": None
            }

        # 创建记录
        new_spend = AdSpendDaily(
            spend_date=spend_data.spend_date,
            project_id=spend_data.project_id,
            country=spend_data.country,
            operator_id=spend_data.operator_id,
            platform=spend_data.platform,
            amount_usdt=spend_data.amount_usdt,
            raw_memo=spend_data.raw_memo,
            status="pending"
        )

        db.add(new_spend)
        db.commit()
        db.refresh(new_spend)

        # 构建响应
        response_data = AdSpendResponse(
            id=new_spend.id,
            spend_date=new_spend.spend_date,
            project_id=new_spend.project_id,
            country=new_spend.country,
            operator_id=new_spend.operator_id,
            platform=new_spend.platform,
            amount_usdt=new_spend.amount_usdt,
            raw_memo=new_spend.raw_memo,
            status=new_spend.status,
            created_at=new_spend.created_at.isoformat() if new_spend.created_at else None
        )

        return {
            "data": response_data.model_dump(),
            "error": None,
            "meta": {"message": "消耗上报创建成功"}
        }
    except Exception as e:
        db.rollback()
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }

