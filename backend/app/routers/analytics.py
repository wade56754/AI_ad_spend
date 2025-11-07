from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.monthly_report_service import generate_monthly_report
from app.services.diagnostic_report_service import generate_diagnostic_report
from app.services.diagnostic_report_formatter import format_diagnostic_report
from app.schemas.analytics import (
    MonthlyReportRequest,
    MonthlyReportApiResponse,
    DiagnosticReportApiResponse
)

router = APIRouter(prefix="/reports", tags=["报表分析"])


@router.post("/monthly", response_model=dict)
def create_monthly_report(
    request: MonthlyReportRequest,
    db: Session = Depends(get_db)
):
    """
    生成月度汇总报表
    
    汇总本月所有 matched 的 ad_spend_daily → 得到每个项目、每个投手的广告消耗(USDT)
    汇总本月所有收入类的 ledger_transactions → 得到每个项目的收入(USDT)
    查询本月投手工资/提成表 → 得到每个投手的人力成本(CNY)
    按照 1USDT=7CNY 折算，生成两张表：monthly_project_performance 和 monthly_operator_performance
    """
    try:
        result = generate_monthly_report(db, request.year, request.month)

        return {
            "data": result,
            "error": None,
            "meta": {
                "message": f"{request.year}年{request.month}月报表生成成功",
                "year": request.year,
                "month": request.month
            }
        }
    except Exception as e:
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }


@router.get("/diagnostic", response_model=dict)
def get_diagnostic_report(
    year: int = Query(..., ge=2000, le=2100, description="年份"),
    month: int = Query(..., ge=1, le=12, description="月份"),
    format: str = Query("json", description="返回格式：json 或 text"),
    db: Session = Depends(get_db)
):
    """
    生成月度诊断报告
    
    包含：
    1. 本月总体情况
    2. 盈利最高的项目及原因
    3. ROI下滑的项目及可能原因
    4. 投手工作状态分析
    5. 建议调整（项目、投手、财务规范）
    
    参数：
    - format: json 返回结构化数据，text 返回格式化文本报告
    """
    try:
        result = generate_diagnostic_report(db, year, month)

        if format == "text":
            from app.services.diagnostic_report_formatter import format_diagnostic_report
            formatted_text = format_diagnostic_report(result)
            return {
                "data": {"report_text": formatted_text},
                "error": None,
                "meta": {
                    "message": f"{year}年{month}月诊断报告生成成功",
                    "year": year,
                    "month": month,
                    "format": "text"
                }
            }
        else:
            return {
                "data": result,
                "error": None,
                "meta": {
                    "message": f"{year}年{month}月诊断报告生成成功",
                    "year": year,
                    "month": month,
                    "format": "json"
                }
            }
    except Exception as e:
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }

