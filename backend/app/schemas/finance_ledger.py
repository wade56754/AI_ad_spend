from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal
from typing import Optional


class LedgerTransactionCreate(BaseModel):
    """创建财务收支记录"""
    tx_date: date = Field(..., description="交易日期")
    direction: str = Field(..., description="方向：income/expense")
    amount: Decimal = Field(..., gt=0, description="金额")
    currency: str = Field(default="USDT", max_length=10, description="币种")
    account: Optional[str] = Field(None, max_length=100, description="账户")
    description: Optional[str] = Field(None, max_length=1000, description="描述")
    fee_amount: Decimal = Field(default=0, ge=0, description="手续费")
    project_id: Optional[int] = Field(None, description="项目ID")
    operator_id: Optional[int] = Field(None, description="投手ID")

    class Config:
        from_attributes = True


class LedgerTransactionResponse(BaseModel):
    """财务收支记录响应"""
    id: int
    tx_date: date
    direction: str
    amount: Decimal
    currency: str
    account: Optional[str]
    description: Optional[str]
    fee_amount: Decimal
    project_id: Optional[int]
    operator_id: Optional[int]
    status: str
    created_at: str

    class Config:
        from_attributes = True


class LedgerListResponse(BaseModel):
    """财务收支列表响应"""
    data: list[LedgerTransactionResponse]
    error: Optional[str] = None
    meta: Optional[dict] = None

