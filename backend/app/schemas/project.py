from pydantic import BaseModel, Field
from typing import Optional, List


class ProjectCreate(BaseModel):
    """创建项目"""
    name: str = Field(..., max_length=100, description="项目名称")
    code: str = Field(..., max_length=50, description="项目代码")
    status: str = Field("active", description="状态：active/inactive")
    description: Optional[str] = Field(None, max_length=500, description="项目描述")

    class Config:
        from_attributes = True


class ProjectUpdate(BaseModel):
    """更新项目"""
    name: Optional[str] = Field(None, max_length=100, description="项目名称")
    code: Optional[str] = Field(None, max_length=50, description="项目代码")
    status: Optional[str] = Field(None, description="状态：active/inactive")
    description: Optional[str] = Field(None, max_length=500, description="项目描述")

    class Config:
        from_attributes = True


class ProjectResponse(BaseModel):
    """项目响应"""
    id: int
    name: str
    code: str
    status: str
    description: Optional[str]
    created_at: str
    updated_at: Optional[str]

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """项目列表响应"""
    data: List[ProjectResponse]
    error: Optional[str] = None
    meta: Optional[dict] = None

