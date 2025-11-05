def format_diagnostic_report(data: dict) -> str:
    """
    将诊断报告数据格式化为中文文本报告
    
    结构：
    1. 本月总体情况
    2. 盈利最高的项目及原因
    3. ROI下滑的项目及可能原因
    4. 投手工作状态分析
    5. 建议调整
    """
    report_lines = []
    
    # 报告标题
    report_lines.append("=" * 60)
    report_lines.append("月度财务经营诊断报告")
    report_lines.append("=" * 60)
    report_lines.append("")
    
    # 1. 本月总体情况
    overall = data.get("overall_summary", {})
    report_lines.append("【一、本月总体情况】")
    report_lines.append("")
    report_lines.append(f"• 总体盈利状态：{overall.get('profit_status', '未知')}")
    report_lines.append(f"• 总收入：{overall.get('total_income_cny', 0):,.2f} 元")
    report_lines.append(f"• 总消耗：{overall.get('total_spend_cny', 0):,.2f} 元")
    report_lines.append(f"• 人力成本：{overall.get('total_salary_cny', 0):,.2f} 元")
    report_lines.append(f"• 总成本：{overall.get('total_cost_cny', 0):,.2f} 元")
    report_lines.append(f"• 净利润：{overall.get('total_profit_cny', 0):,.2f} 元")
    report_lines.append(f"• 利润率：{overall.get('profit_margin', 0):.2f}%")
    report_lines.append(f"• 整体ROI：{overall.get('overall_roi', 0):.2f}%")
    report_lines.append(f"• 活跃项目数：{overall.get('project_count', 0)} 个")
    report_lines.append(f"• 活跃投手数：{overall.get('operator_count', 0)} 位")
    report_lines.append("")
    
    # 2. 盈利最高的项目及原因
    top_profitable = data.get("top_profitable_project")
    report_lines.append("【二、盈利最高的项目及原因】")
    report_lines.append("")
    if top_profitable:
        report_lines.append(f"• 项目名称：{top_profitable.get('project_name', '未知')}")
        report_lines.append(f"• 净利润：{top_profitable.get('profit_cny', 0):,.2f} 元")
        report_lines.append("• 盈利原因分析：")
        for reason in top_profitable.get("reasons", []):
            report_lines.append(f"  - {reason}")
    else:
        report_lines.append("• 本月无盈利项目")
    report_lines.append("")
    
    # 3. ROI下滑的项目及可能原因
    declining_projects = data.get("roi_declining_projects", [])
    report_lines.append("【三、ROI下滑的项目及可能原因】")
    report_lines.append("")
    if declining_projects:
        for project in declining_projects:
            report_lines.append(f"• 项目：{project.get('project_name', '未知')}")
            report_lines.append(f"  - 当前ROI：{project.get('current_roi', 0):.2f}%")
            report_lines.append(f"  - 上月ROI：{project.get('previous_roi', 0):.2f}%")
            report_lines.append(f"  - ROI下降幅度：{project.get('roi_decline', 0):.2f} 个百分点")
            report_lines.append("  - 可能原因：")
            for reason in project.get("reasons", []):
                report_lines.append(f"    • {reason}")
            report_lines.append("")
    else:
        report_lines.append("• 本月无ROI显著下滑的项目")
        report_lines.append("")
    
    # 4. 投手工作状态分析
    operator_analysis = data.get("operator_analysis", [])
    report_lines.append("【四、投手工作状态分析】")
    report_lines.append("")
    
    # 统计各类问题
    missing_report_count = 0
    low_roi_count = 0
    no_output_count = 0
    
    for operator in operator_analysis:
        issues = operator.get("issues", [])
        if any("漏报" in issue for issue in issues):
            missing_report_count += 1
        if any("ROI" in issue and ("负" in issue or "低于20%" in issue) for issue in issues):
            low_roi_count += 1
        if any("只烧不产出" in issue for issue in issues):
            no_output_count += 1
    
    report_lines.append(f"• 存在漏报问题：{missing_report_count} 位投手")
    report_lines.append(f"• 低ROI投手：{low_roi_count} 位投手")
    report_lines.append(f"• 只烧不产出：{no_output_count} 位投手")
    report_lines.append("")
    report_lines.append("• 详细分析：")
    
    problematic_operators = [op for op in operator_analysis if op.get("issues")]
    if problematic_operators:
        for operator in problematic_operators[:10]:  # 最多显示10个
            report_lines.append(f"  - {operator.get('operator_name', '未知')}：")
            report_lines.append(f"    • 消耗：{operator.get('spend_cny', 0):,.2f} 元")
            report_lines.append(f"    • 收入：{operator.get('income_cny', 0):,.2f} 元")
            report_lines.append(f"    • ROI：{operator.get('roi', 0):.2f}%")
            report_lines.append(f"    • 上报次数：{operator.get('report_count', 0)} 次")
            for issue in operator.get("issues", []):
                report_lines.append(f"    • ⚠️ {issue}")
            report_lines.append("")
    else:
        report_lines.append("  - 所有投手工作状态正常")
        report_lines.append("")
    
    # 5. 建议调整
    suggestions = data.get("suggestions", {})
    report_lines.append("【五、建议调整】")
    report_lines.append("")
    
    # 项目建议
    project_suggestions = suggestions.get("project_suggestions", [])
    if project_suggestions:
        report_lines.append("• 项目方面：")
        for suggestion in project_suggestions:
            report_lines.append(f"  - {suggestion}")
        report_lines.append("")
    
    # 投手建议
    operator_suggestions = suggestions.get("operator_suggestions", [])
    if operator_suggestions:
        report_lines.append("• 投手方面：")
        for suggestion in operator_suggestions:
            report_lines.append(f"  - {suggestion}")
        report_lines.append("")
    
    # 财务规范建议
    finance_suggestions = suggestions.get("finance_suggestions", [])
    if finance_suggestions:
        report_lines.append("• 财务规范方面：")
        for suggestion in finance_suggestions:
            report_lines.append(f"  - {suggestion}")
        report_lines.append("")
    
    report_lines.append("=" * 60)
    report_lines.append("报告生成时间：" + str(data.get("generated_at", "")))
    report_lines.append("=" * 60)
    
    return "\n".join(report_lines)


