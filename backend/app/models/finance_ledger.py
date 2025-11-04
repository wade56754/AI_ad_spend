from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class LedgerTransaction(Base):
    """财务收支表"""
    __tablename__ = "ledger_transactions"

    id = Column(Integer, primary_key=True, index=True, comment="ID")
    tx_date = Column(Date, nullable=False, index=True, comment="交易日期")
    direction = Column(String(20), nullable=False, comment="方向：income/expense")
    amount = Column(Numeric(15, 2), nullable=False, comment="金额")
    currency = Column(String(10), default="USDT", comment="币种")
    account = Column(String(100), comment="账户")
    description = Column(String(1000), comment="描述")
    fee_amount = Column(Numeric(15, 2), default=0, comment="手续费")
    project_id = Column(Integer, ForeignKey("projects.id"), index=True, comment="项目ID")
    operator_id = Column(Integer, ForeignKey("operators.id"), index=True, comment="投手ID")
    status = Column(String(20), default="pending", comment="状态：pending/approved/rejected")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")

    # 关系
    project = relationship("Project", back_populates="ledger_transactions")
    operator = relationship("Operator", back_populates="ledger_transactions")
    reconciliations = relationship("Reconciliation", back_populates="ledger_transaction", cascade="all, delete-orphan")

