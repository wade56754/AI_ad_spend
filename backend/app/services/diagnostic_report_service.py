from datetime import date, datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, func as sql_func
from app.models.monthly_reports import MonthlyProjectPerformance, MonthlyOperatorPerformance
from app.models.project import Project
from app.models.operator import Operator
from app.models.spend_report import AdSpendDaily
from app.models.finance_ledger import LedgerTransaction


def calculate_roi(profit: Decimal, cost: Decimal) -> Decimal:
    """计算ROI：ROI = (利润 / 成本) * 100"""
    if cost == 0:
        return Decimal("0")
    return (profit / cost) * 100


def generate_diagnostic_report(db: Session, year: int, month: int) -> dict:
    """
    生成月度诊断报告
    
    返回结构化的诊断报告，包含：
    1. 本月总体情况
    2. 盈利最高的项目及原因
    3. ROI下滑的项目及可能原因
    4. 投手工作状态分析
    5. 建议调整
    """
    # 获取本月项目绩效数据
    project_performances = db.query(MonthlyProjectPerformance).filter(
        and_(
            MonthlyProjectPerformance.year == year,
            MonthlyProjectPerformance.month == month
        )
    ).all()

    # 获取本月投手绩效数据
    operator_performances = db.query(MonthlyOperatorPerformance).filter(
        and_(
            MonthlyOperatorPerformance.year == year,
            MonthlyOperatorPerformance.month == month
        )
    ).all()

    # 获取项目信息
    project_dict = {}
    for perf in project_performances:
        project = db.query(Project).filter(Project.id == perf.project_id).first()
        if project:
            project_dict[perf.project_id] = project.name

    # 获取投手信息
    operator_dict = {}
    for perf in operator_performances:
        operator = db.query(Operator).filter(Operator.id == perf.operator_id).first()
        if operator:
            operator_dict[perf.operator_id] = operator.name

    # 计算总体情况
    total_income_cny = sum(p.total_income_cny for p in project_performances)
    total_spend_cny = sum(p.total_spend_cny for p in project_performances)
    total_profit_cny = sum(p.net_profit_cny for p in project_performances)
    total_salary_cny = sum(o.salary_cost_cny for o in operator_performances)
    total_cost_cny = total_spend_cny + total_salary_cny
    overall_roi = calculate_roi(total_profit_cny, total_cost_cny) if total_cost_cny > 0 else Decimal("0")

    # 1. 本月总体情况
    overall_summary = {
        "total_income_cny": float(total_income_cny),
        "total_spend_cny": float(total_spend_cny),
        "total_salary_cny": float(total_salary_cny),
        "total_cost_cny": float(total_cost_cny),
        "total_profit_cny": float(total_profit_cny),
        "overall_roi": float(overall_roi),
        "project_count": len(project_performances),
        "operator_count": len(operator_performances),
        "profit_status": "盈利" if total_profit_cny > 0 else "亏损",
        "profit_margin": float((total_profit_cny / total_income_cny * 100) if total_income_cny > 0 else 0)
    }

    # 2. 盈利最高的项目及原因分析
    profitable_projects = [
        {
            "project_name": project_dict.get(p.project_id, f"项目{p.project_id}"),
            "profit_cny": float(p.net_profit_cny),
            "income_cny": float(p.total_income_cny),
            "spend_cny": float(p.total_spend_cny),
            "roi": float(calculate_roi(p.net_profit_cny, p.total_spend_cny)) if p.total_spend_cny > 0 else 0,
            "profit_margin": float(p.profit_margin) if p.profit_margin else 0
        }
        for p in project_performances if p.net_profit_cny > 0
    ]
    profitable_projects.sort(key=lambda x: x["profit_cny"], reverse=True)

    top_profitable_project = profitable_projects[0] if profitable_projects else None
    top_profitable_analysis = None
    if top_profitable_project:
        reasons = []
        if top_profitable_project["profit_margin"] > 30:
            reasons.append("利润率高达{:.1f}%，成本控制优秀".format(top_profitable_project["profit_margin"]))
        if top_profitable_project["roi"] > 100:
            reasons.append("ROI超过100%，投入产出比优秀")
        if top_profitable_project["income_cny"] > total_income_cny * 0.3:
            reasons.append("收入占比较高，为主要盈利项目")
        if not reasons:
            reasons.append("收入和成本结构优化，盈利能力强")
        
        top_profitable_analysis = {
            "project_name": top_profitable_project["project_name"],
            "profit_cny": top_profitable_project["profit_cny"],
            "reasons": reasons
        }

    # 3. ROI下滑的项目分析
    # 获取上月数据用于对比
    if month == 1:
        prev_month = 12
        prev_year = year - 1
    else:
        prev_month = month - 1
        prev_year = year

    prev_project_performances = db.query(MonthlyProjectPerformance).filter(
        and_(
            MonthlyProjectPerformance.year == prev_year,
            MonthlyProjectPerformance.month == prev_month
        )
    ).all()

    prev_perf_dict = {p.project_id: p for p in prev_project_performances}

    roi_declining_projects = []
    for curr_perf in project_performances:
        project_name = project_dict.get(curr_perf.project_id, f"项目{curr_perf.project_id}")
        curr_roi = float(calculate_roi(curr_perf.net_profit_cny, curr_perf.total_spend_cny)) if curr_perf.total_spend_cny > 0 else 0
        
        prev_perf = prev_perf_dict.get(curr_perf.project_id)
        if prev_perf:
            prev_roi = float(calculate_roi(prev_perf.net_profit_cny, prev_perf.total_spend_cny)) if prev_perf.total_spend_cny > 0 else 0
            
            if curr_roi < prev_roi - 5:  # ROI下降超过5个百分点
                # 分析可能原因
                reasons = []
                
                # 成本上升
                if curr_perf.total_spend_cny > prev_perf.total_spend_cny * 1.1:
                    reasons.append("广告消耗成本上升{:.1f}%".format(
                        ((curr_perf.total_spend_cny - prev_perf.total_spend_cny) / prev_perf.total_spend_cny * 100) if prev_perf.total_spend_cny > 0 else 0
                    ))
                
                # 收入下降
                if curr_perf.total_income_cny < prev_perf.total_income_cny * 0.9:
                    reasons.append("收入下降{:.1f}%，可能未按时入账或转化率下降".format(
                        ((prev_perf.total_income_cny - curr_perf.total_income_cny) / prev_perf.total_income_cny * 100) if prev_perf.total_income_cny > 0 else 0
                    ))
                
                # 检查手续费
                # 获取本月和上月的财务记录手续费
                start_date = date(year, month, 1)
                if month == 12:
                    end_date = date(year + 1, 1, 1)
                else:
                    end_date = date(year, month + 1, 1)
                
                curr_fees = db.query(sql_func.sum(LedgerTransaction.fee_amount)).filter(
                    and_(
                        LedgerTransaction.project_id == curr_perf.project_id,
                        LedgerTransaction.tx_date >= start_date,
                        LedgerTransaction.tx_date < end_date
                    )
                ).scalar() or Decimal("0")
                
                if month == 1:
                    prev_start = date(prev_year, 12, 1)
                    prev_end = date(prev_year + 1, 1, 1)
                else:
                    prev_start = date(prev_year, prev_month, 1)
                    prev_end = date(prev_year, prev_month + 1, 1)
                
                prev_fees = db.query(sql_func.sum(LedgerTransaction.fee_amount)).filter(
                    and_(
                        LedgerTransaction.project_id == curr_perf.project_id,
                        LedgerTransaction.tx_date >= prev_start,
                        LedgerTransaction.tx_date < prev_end
                    )
                ).scalar() or Decimal("0")
                
                if curr_fees > prev_fees * 1.2:
                    reasons.append("手续费上升{:.1f}%".format(
                        ((curr_fees - prev_fees) / prev_fees * 100) if prev_fees > 0 else 0
                    ))
                
                # 投手效率下降（通过投手绩效分析）
                curr_operators = [
                    o for o in operator_performances
                    if db.query(Operator).filter(Operator.id == o.operator_id).first() and
                    db.query(Operator).filter(Operator.id == o.operator_id).first().project_id == curr_perf.project_id
                ]
                if curr_operators:
                    avg_operator_roi = sum(
                        float(calculate_roi(
                            curr_perf.total_income_cny / len(curr_operators) - o.total_spend_cny,
                            o.total_spend_cny
                        )) if o.total_spend_cny > 0 else 0
                        for o in curr_operators
                    ) / len(curr_operators) if curr_operators else 0
                    
                    if avg_operator_roi < 50:
                        reasons.append("投手平均ROI偏低，效率可能下降")
                
                if not reasons:
                    reasons.append("综合成本结构变化导致ROI下降")
                
                roi_declining_projects.append({
                    "project_name": project_name,
                    "current_roi": curr_roi,
                    "previous_roi": prev_roi,
                    "roi_decline": prev_roi - curr_roi,
                    "reasons": reasons
                })

    # 4. 投手工作状态分析
    # 获取本月投手消耗上报情况
    start_date = date(year, month, 1)
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    operator_analysis = []
    for op_perf in operator_performances:
        operator_name = operator_dict.get(op_perf.operator_id, f"投手{op_perf.operator_id}")
        
        # 检查是否有漏报（通过检查消耗上报记录）
        spend_reports = db.query(AdSpendDaily).filter(
            and_(
                AdSpendDaily.operator_id == op_perf.operator_id,
                AdSpendDaily.spend_date >= start_date,
                AdSpendDaily.spend_date < end_date
            )
        ).all()
        
        # 检查ROI
        # 获取该投手所属项目的收入
        operator = db.query(Operator).filter(Operator.id == op_perf.operator_id).first()
        operator_income_cny = Decimal("0")
        if operator and operator.project_id:
            project_perf = next((p for p in project_performances if p.project_id == operator.project_id), None)
            if project_perf:
                # 按投手消耗比例分配收入（简化处理）
                total_project_spend = sum(
                    o.total_spend_cny for o in operator_performances
                    if db.query(Operator).filter(Operator.id == o.operator_id).first() and
                    db.query(Operator).filter(Operator.id == o.operator_id).first().project_id == operator.project_id
                )
                if total_project_spend > 0:
                    operator_income_cny = project_perf.total_income_cny * (op_perf.total_spend_cny / total_project_spend)
        
        operator_profit = operator_income_cny - op_perf.total_spend_cny - op_perf.salary_cost_cny
        operator_roi = calculate_roi(operator_profit, op_perf.total_spend_cny + op_perf.salary_cost_cny) if (op_perf.total_spend_cny + op_perf.salary_cost_cny) > 0 else Decimal("0")
        
        issues = []
        
        # 检查漏报（消耗上报次数少）
        if len(spend_reports) < 20:  # 假设每月至少应该有20次上报
            issues.append("消耗上报次数偏少，可能存在漏报")
        
        # 检查低ROI
        if float(operator_roi) < 0:
            issues.append("ROI为负，处于亏损状态")
        elif float(operator_roi) < 20:
            issues.append("ROI低于20%，效率偏低")
        
        # 检查只烧不产出
        if op_perf.total_spend_cny > 10000 and operator_income_cny < op_perf.total_spend_cny * 0.5:
            issues.append("消耗超过1万但收入不足消耗的50%，存在只烧不产出问题")
        
        operator_analysis.append({
            "operator_name": operator_name,
            "spend_cny": float(op_perf.total_spend_cny),
            "income_cny": float(operator_income_cny),
            "salary_cny": float(op_perf.salary_cost_cny),
            "roi": float(operator_roi),
            "report_count": len(spend_reports),
            "issues": issues
        })

    # 5. 建议调整
    suggestions = {
        "project_suggestions": [],
        "operator_suggestions": [],
        "finance_suggestions": []
    }

    # 项目建议
    if roi_declining_projects:
        suggestions["project_suggestions"].append(
            f"重点关注{len(roi_declining_projects)}个ROI下滑项目，分析成本结构和收入转化情况"
        )
    
    if profitable_projects:
        top_3 = profitable_projects[:3]
        suggestions["project_suggestions"].append(
            f"扩大盈利项目规模：{', '.join([p['project_name'] for p in top_3])}表现优秀，可考虑增加投入"
        )
    
    # 投手建议
    low_roi_operators = [o for o in operator_analysis if o["roi"] < 20 and o["roi"] > -100]
    if low_roi_operators:
        suggestions["operator_suggestions"].append(
            f"低ROI投手优化：{len(low_roi_operators)}位投手ROI低于20%，建议进行培训和优化"
        )
    
    no_output_operators = [o for o in operator_analysis if o["issues"] and any("只烧不产出" in issue for issue in o["issues"])]
    if no_output_operators:
        suggestions["operator_suggestions"].append(
            f"停用或调整低效投手：{len(no_output_operators)}位投手存在只烧不产出问题，建议暂停或调整策略"
        )
    
    missing_report_operators = [o for o in operator_analysis if o["issues"] and any("漏报" in issue for issue in o["issues"])]
    if missing_report_operators:
        suggestions["operator_suggestions"].append(
            f"加强上报管理：{len(missing_report_operators)}位投手上报次数偏少，建议加强数据规范"
        )
    
    # 财务规范建议
    if total_profit_cny < 0:
        suggestions["finance_suggestions"].append("本月整体亏损，建议全面审查成本结构，优化支出配置")
    
    if overall_roi < 30:
        suggestions["finance_suggestions"].append("整体ROI低于30%，建议提升收入转化率或降低运营成本")
    
    suggestions["finance_suggestions"].append("确保财务数据及时录入，避免收入延迟入账影响报表准确性")
    suggestions["finance_suggestions"].append("定期审查手续费支出，优化支付渠道降低费用成本")

    return {
        "overall_summary": overall_summary,
        "top_profitable_project": top_profitable_analysis,
        "roi_declining_projects": roi_declining_projects,
        "operator_analysis": operator_analysis,
        "suggestions": suggestions,
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

