from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Reconciliation(Base):
    """对账结果表"""
    __tablename__ = "reconciliation"

    id = Column(Integer, primary_key=True, index=True, comment="ID")
    ad_spend_id = Column(Integer, ForeignKey("ad_spend_daily.id"), nullable=False, index=True, comment="投手日报ID")
    ledger_id = Column(Integer, ForeignKey("ledger_transactions.id"), nullable=False, index=True, comment="财务记录ID")
    amount_diff = Column(Numeric(15, 2), default=0, comment="金额差异")
    date_diff = Column(Integer, default=0, comment="日期差异(天数)")
    match_score = Column(Numeric(5, 2), comment="匹配度(0-100)")
    status = Column(String(20), default="matched", comment="状态：matched/unmatched/manual")
    reason = Column(String(500), comment="对账原因/备注")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")

    # 关系
    ad_spend = relationship("AdSpendDaily", back_populates="reconciliations")
    ledger_transaction = relationship("LedgerTransaction", back_populates="reconciliations")



