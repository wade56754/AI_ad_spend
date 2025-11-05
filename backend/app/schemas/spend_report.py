from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal
from typing import Optional


class AdSpendCreate(BaseModel):
    """创建投手消耗上报"""
    spend_date: date = Field(..., description="消耗日期")
    project_id: int = Field(..., description="项目ID")
    country: Optional[str] = Field(None, max_length=50, description="国家/地区")
    operator_id: int = Field(..., description="投手ID")
    platform: Optional[str] = Field(None, max_length=50, description="投放平台")
    amount_usdt: Decimal = Field(..., gt=0, description="消耗金额(USDT)")
    raw_memo: Optional[str] = Field(None, max_length=1000, description="原始备注")

    class Config:
        from_attributes = True


class AdSpendResponse(BaseModel):
    """投手消耗上报响应"""
    id: int
    spend_date: date
    project_id: int
    country: Optional[str]
    operator_id: int
    platform: Optional[str]
    amount_usdt: Decimal
    raw_memo: Optional[str]
    status: str
    created_at: str

    class Config:
        from_attributes = True


class AdSpendListResponse(BaseModel):
    """投手消耗上报列表响应"""
    data: list[AdSpendResponse]
    error: Optional[str] = None
    meta: Optional[dict] = None


