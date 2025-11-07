from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal
from typing import Optional, List


class ChannelCreate(BaseModel):
    """创建渠道"""
    name: str = Field(..., max_length=100, description="渠道名称")
    contact: Optional[str] = Field(None, max_length=100, description="联系人")
    rebate_rate: Decimal = Field(0, ge=0, le=100, description="返点率(%)")
    status: str = Field("active", description="状态：active/disabled")
    note: Optional[str] = Field(None, max_length=500, description="备注")

    class Config:
        from_attributes = True


class ChannelUpdate(BaseModel):
    """更新渠道"""
    name: Optional[str] = Field(None, max_length=100, description="渠道名称")
    contact: Optional[str] = Field(None, max_length=100, description="联系人")
    rebate_rate: Optional[Decimal] = Field(None, ge=0, le=100, description="返点率(%)")
    status: Optional[str] = Field(None, description="状态：active/disabled")
    note: Optional[str] = Field(None, max_length=500, description="备注")

    class Config:
        from_attributes = True


class ChannelResponse(BaseModel):
    """渠道响应"""
    id: int
    name: str
    contact: Optional[str]
    rebate_rate: Decimal
    status: str
    note: Optional[str]
    created_at: str
    updated_at: Optional[str]

    class Config:
        from_attributes = True


class ChannelListResponse(BaseModel):
    """渠道列表响应"""
    data: List[ChannelResponse]
    error: Optional[str] = None
    meta: Optional[dict] = None


class ProjectChannelCreate(BaseModel):
    """关联渠道到项目"""
    project_id: int = Field(..., description="项目ID")
    channel_id: int = Field(..., description="渠道ID")

    class Config:
        from_attributes = True


class MonthlyChannelPerformanceResponse(BaseModel):
    """月度渠道绩效响应"""
    id: int
    channel_id: int
    month: date
    total_spend: Decimal
    active_accounts: int
    created_at: str
    updated_at: Optional[str]

    class Config:
        from_attributes = True


