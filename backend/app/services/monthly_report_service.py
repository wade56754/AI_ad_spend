from datetime import date
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, func as sql_func
from app.models.spend_report import AdSpendDaily
from app.models.finance_ledger import LedgerTransaction
from app.models.operator_salary import OperatorSalary
from app.models.monthly_reports import MonthlyProjectPerformance, MonthlyOperatorPerformance

# 汇率：1 USDT = 7 CNY
EXCHANGE_RATE = Decimal("7.0")


def generate_monthly_report(db: Session, year: int, month: int) -> dict:
    """
    生成月度汇总报表
    
    参数:
        year: 年份
        month: 月份 (1-12)
    
    返回:
        {
            "project_performance_count": 项目绩效记录数,
            "operator_performance_count": 投手绩效记录数,
            "summary": {
                "total_spend_usdt": 总消耗(USDT),
                "total_income_usdt": 总收入(USDT),
                "total_cost_cny": 总成本(CNY)
            }
        }
    """
    # 计算月份的开始和结束日期
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    # 1. 汇总本月所有 matched 的 ad_spend_daily，按项目和投手分组
    spend_by_project = db.query(
        AdSpendDaily.project_id,
        sql_func.sum(AdSpendDaily.amount_usdt).label('total_spend')
    ).filter(
        and_(
            AdSpendDaily.status == "matched",
            AdSpendDaily.spend_date >= start_date,
            AdSpendDaily.spend_date < end_date
        )
    ).group_by(AdSpendDaily.project_id).all()

    spend_by_operator = db.query(
        AdSpendDaily.operator_id,
        sql_func.sum(AdSpendDaily.amount_usdt).label('total_spend')
    ).filter(
        and_(
            AdSpendDaily.status == "matched",
            AdSpendDaily.spend_date >= start_date,
            AdSpendDaily.spend_date < end_date
        )
    ).group_by(AdSpendDaily.operator_id).all()

    # 2. 汇总本月所有收入类的 ledger_transactions，按项目分组
    income_by_project = db.query(
        LedgerTransaction.project_id,
        sql_func.sum(LedgerTransaction.amount).label('total_income')
    ).filter(
        and_(
            LedgerTransaction.direction == "income",
            LedgerTransaction.currency == "USDT",
            LedgerTransaction.tx_date >= start_date,
            LedgerTransaction.tx_date < end_date
        )
    ).group_by(LedgerTransaction.project_id).all()

    # 3. 查询本月投手工资/提成
    salary_by_operator = db.query(
        OperatorSalary.operator_id,
        sql_func.sum(OperatorSalary.total_amount).label('total_salary')
    ).filter(
        and_(
            OperatorSalary.year == year,
            OperatorSalary.month == month
        )
    ).group_by(OperatorSalary.operator_id).all()

    # 转换为字典以便快速查找
    spend_by_project_dict = {item.project_id: item.total_spend for item in spend_by_project}
    spend_by_operator_dict = {item.operator_id: item.total_spend for item in spend_by_operator}
    income_by_project_dict = {item.project_id: item.total_income for item in income_by_project}
    salary_by_operator_dict = {item.operator_id: item.total_salary for item in salary_by_operator}

    # 4. 生成项目绩效表
    project_performance_created = 0
    project_performance_updated = 0
    all_project_ids = set(spend_by_project_dict.keys()) | set(income_by_project_dict.keys())

    for project_id in all_project_ids:
        total_spend_usdt = spend_by_project_dict.get(project_id, Decimal("0"))
        total_income_usdt = income_by_project_dict.get(project_id, Decimal("0"))
        
        # 转换为 CNY
        total_spend_cny = total_spend_usdt * EXCHANGE_RATE
        total_income_cny = total_income_usdt * EXCHANGE_RATE
        
        # 计算净利润
        net_profit_cny = total_income_cny - total_spend_cny
        
        # 计算利润率
        profit_margin = None
        if total_income_cny > 0:
            profit_margin = (net_profit_cny / total_income_cny) * 100

        # 查询或创建项目绩效记录
        existing_performance = db.query(MonthlyProjectPerformance).filter(
            and_(
                MonthlyProjectPerformance.project_id == project_id,
                MonthlyProjectPerformance.year == year,
                MonthlyProjectPerformance.month == month
            )
        ).first()

        if existing_performance:
            # 更新现有记录
            existing_performance.total_spend_usdt = total_spend_usdt
            existing_performance.total_income_usdt = total_income_usdt
            existing_performance.total_spend_cny = total_spend_cny
            existing_performance.total_income_cny = total_income_cny
            existing_performance.net_profit_cny = net_profit_cny
            existing_performance.profit_margin = profit_margin
            project_performance_updated += 1
        else:
            # 创建新记录
            new_performance = MonthlyProjectPerformance(
                project_id=project_id,
                year=year,
                month=month,
                total_spend_usdt=total_spend_usdt,
                total_income_usdt=total_income_usdt,
                total_spend_cny=total_spend_cny,
                total_income_cny=total_income_cny,
                net_profit_cny=net_profit_cny,
                profit_margin=profit_margin
            )
            db.add(new_performance)
            project_performance_created += 1

    # 5. 生成投手绩效表
    operator_performance_created = 0
    operator_performance_updated = 0
    all_operator_ids = set(spend_by_operator_dict.keys()) | set(salary_by_operator_dict.keys())

    for operator_id in all_operator_ids:
        total_spend_usdt = spend_by_operator_dict.get(operator_id, Decimal("0"))
        salary_cost_cny = salary_by_operator_dict.get(operator_id, Decimal("0"))
        
        # 转换为 CNY
        total_spend_cny = total_spend_usdt * EXCHANGE_RATE
        
        # 计算总成本
        total_cost_cny = total_spend_cny + salary_cost_cny

        # 查询或创建投手绩效记录
        existing_performance = db.query(MonthlyOperatorPerformance).filter(
            and_(
                MonthlyOperatorPerformance.operator_id == operator_id,
                MonthlyOperatorPerformance.year == year,
                MonthlyOperatorPerformance.month == month
            )
        ).first()

        if existing_performance:
            # 更新现有记录
            existing_performance.total_spend_usdt = total_spend_usdt
            existing_performance.total_spend_cny = total_spend_cny
            existing_performance.salary_cost_cny = salary_cost_cny
            existing_performance.total_cost_cny = total_cost_cny
            operator_performance_updated += 1
        else:
            # 创建新记录
            new_performance = MonthlyOperatorPerformance(
                operator_id=operator_id,
                year=year,
                month=month,
                total_spend_usdt=total_spend_usdt,
                total_spend_cny=total_spend_cny,
                salary_cost_cny=salary_cost_cny,
                total_cost_cny=total_cost_cny
            )
            db.add(new_performance)
            operator_performance_created += 1

    # 计算汇总信息
    total_spend_usdt = sum(spend_by_project_dict.values())
    total_income_usdt = sum(income_by_project_dict.values())
    total_spend_cny = total_spend_usdt * EXCHANGE_RATE
    total_income_cny = total_income_usdt * EXCHANGE_RATE
    total_salary_cny = sum(salary_by_operator_dict.values())
    total_cost_cny = total_spend_cny + total_salary_cny

    # 提交事务
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

    return {
        "project_performance_created": project_performance_created,
        "project_performance_updated": project_performance_updated,
        "operator_performance_created": operator_performance_created,
        "operator_performance_updated": operator_performance_updated,
        "summary": {
            "total_spend_usdt": float(total_spend_usdt),
            "total_income_usdt": float(total_income_usdt),
            "total_spend_cny": float(total_spend_cny),
            "total_income_cny": float(total_income_cny),
            "total_salary_cny": float(total_salary_cny),
            "total_cost_cny": float(total_cost_cny),
            "net_profit_cny": float(total_income_cny - total_cost_cny)
        }
    }

