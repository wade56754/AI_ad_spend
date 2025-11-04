from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.spend_report import AdSpendDaily
from app.models.finance_ledger import LedgerTransaction
from app.models.reconciliation import Reconciliation


def calculate_match_score(amount_diff: Decimal, date_diff: int) -> Decimal:
    """计算匹配度（0-100）"""
    # 金额差异越小，匹配度越高
    amount_score = max(0, 100 - abs(float(amount_diff)) * 50)  # 每差0.02 USDT扣1分
    
    # 日期差异越小，匹配度越高
    date_score = max(0, 100 - abs(date_diff) * 10)  # 每差1天扣10分
    
    # 综合匹配度（取平均值）
    match_score = (amount_score + date_score) / 2
    return Decimal(str(round(match_score, 2)))


def run_reconciliation(db: Session) -> dict:
    """
    执行对账逻辑
    
    返回统计结果：
    {
        "matched_count": 匹配成功的数量,
        "unmatched_count": 匹配不成功的数量,
        "total_processed": 处理的总数
    }
    """
    # 1. 获取状态为 pending 的投手日报记录
    pending_spends = db.query(AdSpendDaily).filter(
        AdSpendDaily.status == "pending"
    ).all()

    # 2. 获取最近7天内、方向为支出的财务记录
    seven_days_ago = date.today() - timedelta(days=7)
    expense_ledgers = db.query(LedgerTransaction).filter(
        and_(
            LedgerTransaction.direction == "expense",
            LedgerTransaction.tx_date >= seven_days_ago
        )
    ).all()

    matched_count = 0
    unmatched_count = 0
    processed_spends = []

    # 获取已经匹配过的 ledger_id 列表（避免重复匹配）
    matched_ledger_ids = set()
    existing_reconciliations = db.query(Reconciliation).filter(
        Reconciliation.status == "matched"
    ).all()
    for rec in existing_reconciliations:
        matched_ledger_ids.add(rec.ledger_id)

    # 3. 对每条投手日报记录进行匹配
    for spend in pending_spends:
        # 检查是否已经处理过这条 spend
        existing_reconciliation = db.query(Reconciliation).filter(
            Reconciliation.ad_spend_id == spend.id
        ).first()

        if existing_reconciliation and existing_reconciliation.status == "matched":
            continue  # 跳过已匹配的记录

        best_match = None
        best_match_score = Decimal("0")
        min_amount_diff = Decimal("999999")
        min_date_diff = 999

        # 遍历所有支出记录，寻找最佳匹配
        for ledger in expense_ledgers:
            # 跳过已经被匹配过的支出记录
            if ledger.id in matched_ledger_ids:
                continue

            # 匹配规则1：project_id 相同
            if spend.project_id != ledger.project_id:
                continue

            # 匹配规则2：日期相差不超过1天
            date_diff = abs((spend.spend_date - ledger.tx_date).days)
            if date_diff > 1:
                continue

            # 匹配规则3：金额差不超过1 USDT
            # 注意：ledger.amount 可能不是 USDT，需要处理币种转换
            # 这里假设 ledger.currency == 'USDT' 时直接比较
            if ledger.currency == 'USDT':
                amount_diff = abs(spend.amount_usdt - ledger.amount)
            else:
                # 如果币种不同，跳过（需要汇率转换，这里简化处理）
                continue

            if amount_diff > Decimal("1.0"):
                continue

            # 计算匹配度
            match_score = calculate_match_score(amount_diff, date_diff)

            # 选择最佳匹配（匹配度最高，金额差异最小）
            if match_score > best_match_score or (match_score == best_match_score and amount_diff < min_amount_diff):
                best_match = ledger
                best_match_score = match_score
                min_amount_diff = amount_diff
                min_date_diff = date_diff

        # 4. 创建对账记录
        if best_match:
            # 匹配成功
            reconciliation = Reconciliation(
                ad_spend_id=spend.id,
                ledger_id=best_match.id,
                amount_diff=min_amount_diff,
                date_diff=min_date_diff,
                match_score=best_match_score,
                status="matched",
                reason="自动匹配成功"
            )
            db.add(reconciliation)

            # 更新两边记录的 status 为 matched
            spend.status = "matched"
            best_match.status = "matched"
            
            # 将该 ledger 标记为已匹配
            matched_ledger_ids.add(best_match.id)

            matched_count += 1
        else:
            # 匹配不成功，创建一条空的对账记录（ledger_id 可以为空或者使用一个特殊值）
            # 但根据模型定义，ledger_id 是必填的，所以我们需要找到一个候选记录
            # 或者修改逻辑，先找最接近的候选记录作为参考
            candidate_ledger = None
            candidate_amount_diff = Decimal("999999")
            candidate_date_diff = 999

            # 寻找最接近的候选记录（即使不满足匹配条件）
            for ledger in expense_ledgers:
                if spend.project_id == ledger.project_id:
                    date_diff = abs((spend.spend_date - ledger.tx_date).days)
                    if ledger.currency == 'USDT':
                        amount_diff = abs(spend.amount_usdt - ledger.amount)
                        if amount_diff < candidate_amount_diff:
                            candidate_ledger = ledger
                            candidate_amount_diff = amount_diff
                            candidate_date_diff = date_diff

            if candidate_ledger:
                # 找到候选记录，但不符合匹配条件
                reconciliation = Reconciliation(
                    ad_spend_id=spend.id,
                    ledger_id=candidate_ledger.id,
                    amount_diff=candidate_amount_diff,
                    date_diff=candidate_date_diff,
                    match_score=calculate_match_score(candidate_amount_diff, candidate_date_diff),
                    status="need_review",
                    reason=f"自动匹配失败：金额差 {candidate_amount_diff} USDT，日期差 {candidate_date_diff} 天"
                )
                db.add(reconciliation)
                unmatched_count += 1
            else:
                # 如果没有找到任何候选记录（没有相同项目的支出记录），创建一条特殊的对账记录
                # 使用第一个支出记录作为占位（如果存在）
                if expense_ledgers:
                    placeholder_ledger = expense_ledgers[0]
                    reconciliation = Reconciliation(
                        ad_spend_id=spend.id,
                        ledger_id=placeholder_ledger.id,
                        amount_diff=spend.amount_usdt,
                        date_diff=999,
                        match_score=Decimal("0"),
                        status="need_review",
                        reason="未找到相同项目的财务记录"
                    )
                    db.add(reconciliation)
                    unmatched_count += 1
                else:
                    # 如果没有任何支出记录，跳过（不创建对账记录）
                    continue

        processed_spends.append(spend.id)

    # 提交事务
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

    return {
        "matched_count": matched_count,
        "unmatched_count": unmatched_count,
        "total_processed": len(processed_spends),
        "processed_spend_ids": processed_spends
    }

