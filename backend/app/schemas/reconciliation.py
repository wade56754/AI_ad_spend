from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import date


class ReconciliationResponse(BaseModel):
    """对账结果响应"""
    matched_count: int
    unmatched_count: int
    total_processed: int
    processed_spend_ids: list[int]

    class Config:
        from_attributes = True


class ReconciliationRunResponse(BaseModel):
    """执行对账接口响应"""
    data: Optional[ReconciliationResponse]
    error: Optional[str] = None
    meta: Optional[dict] = None


class ReconciliationDetailResponse(BaseModel):
    """对账详情响应"""
    id: int
    ad_spend_id: int
    ledger_id: int
    amount_diff: Decimal
    date_diff: int
    match_score: Optional[Decimal]
    status: str
    reason: Optional[str]
    created_at: str
    # 关联的投手日报信息
    ad_spend: Optional[dict] = None
    # 关联的财务记录信息
    ledger_transaction: Optional[dict] = None

    class Config:
        from_attributes = True


class ReconciliationListResponse(BaseModel):
    """对账列表响应"""
    data: list[ReconciliationDetailResponse]
    error: Optional[str] = None
    meta: Optional[dict] = None


class ReconciliationUpdate(BaseModel):
    """更新对账记录"""
    status: str

    class Config:
        from_attributes = True
