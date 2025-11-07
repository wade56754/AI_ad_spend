from pydantic import BaseModel, Field
from typing import Optional, List


class OperatorCreate(BaseModel):
    """创建投手"""
    name: str = Field(..., max_length=50, description="投手姓名")
    employee_id: str = Field(..., max_length=50, description="工号")
    project_id: Optional[int] = Field(None, description="所属项目ID")
    role: str = Field("operator", description="角色：operator/finance/admin/account_mgr/manager")
    status: str = Field("active", description="状态：active/inactive")

    class Config:
        from_attributes = True


class OperatorUpdate(BaseModel):
    """更新投手"""
    name: Optional[str] = Field(None, max_length=50, description="投手姓名")
    employee_id: Optional[str] = Field(None, max_length=50, description="工号")
    project_id: Optional[int] = Field(None, description="所属项目ID")
    role: Optional[str] = Field(None, description="角色")
    status: Optional[str] = Field(None, description="状态")

    class Config:
        from_attributes = True


class OperatorResponse(BaseModel):
    """投手响应"""
    id: int
    name: str
    employee_id: str
    project_id: Optional[int]
    role: str
    status: str
    created_at: str
    updated_at: Optional[str]

    class Config:
        from_attributes = True


class OperatorListResponse(BaseModel):
    """投手列表响应"""
    data: List[OperatorResponse]
    error: Optional[str] = None
    meta: Optional[dict] = None


