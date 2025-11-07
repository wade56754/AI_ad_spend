from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal


class MonthlyReportRequest(BaseModel):
    """月度报表请求"""
    year: int = Field(..., ge=2000, le=2100, description="年份")
    month: int = Field(..., ge=1, le=12, description="月份")


class MonthlyReportSummary(BaseModel):
    """月度报表汇总"""
    total_spend_usdt: float
    total_income_usdt: float
    total_spend_cny: float
    total_income_cny: float
    total_salary_cny: float
    total_cost_cny: float
    net_profit_cny: float

    class Config:
        from_attributes = True


class MonthlyReportResponse(BaseModel):
    """月度报表响应"""
    project_performance_created: int
    project_performance_updated: int
    operator_performance_created: int
    operator_performance_updated: int
    summary: MonthlyReportSummary

    class Config:
        from_attributes = True


class MonthlyReportApiResponse(BaseModel):
    """月度报表 API 响应"""
    data: Optional[MonthlyReportResponse]
    error: Optional[str] = None
    meta: Optional[dict] = None


class DiagnosticReportResponse(BaseModel):
    """诊断报告响应"""
    overall_summary: dict
    top_profitable_project: Optional[dict]
    roi_declining_projects: List[dict]
    operator_analysis: List[dict]
    suggestions: dict

    class Config:
        from_attributes = True


class DiagnosticReportApiResponse(BaseModel):
    """诊断报告 API 响应"""
    data: Optional[DiagnosticReportResponse]
    error: Optional[str] = None
    meta: Optional[dict] = None
