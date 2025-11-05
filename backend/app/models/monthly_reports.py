from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class MonthlyProjectPerformance(Base):
    """月度项目绩效表"""
    __tablename__ = "monthly_project_performance"

    id = Column(Integer, primary_key=True, index=True, comment="ID")
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True, comment="项目ID")
    year = Column(Integer, nullable=False, index=True, comment="年份")
    month = Column(Integer, nullable=False, index=True, comment="月份")
    total_spend_usdt = Column(Numeric(15, 2), default=0, comment="总消耗(USDT)")
    total_income_usdt = Column(Numeric(15, 2), default=0, comment="总收入(USDT)")
    total_spend_cny = Column(Numeric(15, 2), default=0, comment="总消耗(CNY)")
    total_income_cny = Column(Numeric(15, 2), default=0, comment="总收入(CNY)")
    net_profit_cny = Column(Numeric(15, 2), default=0, comment="净利润(CNY)")
    profit_margin = Column(Numeric(5, 2), comment="利润率(%)")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")

    # 唯一约束：同一项目同一月份只能有一条记录
    __table_args__ = (
        UniqueConstraint('project_id', 'year', 'month', name='uq_project_year_month'),
    )

    # 关系
    project = relationship("Project", backref="monthly_performances")


class MonthlyOperatorPerformance(Base):
    """月度投手绩效表"""
    __tablename__ = "monthly_operator_performance"

    id = Column(Integer, primary_key=True, index=True, comment="ID")
    operator_id = Column(Integer, ForeignKey("operators.id"), nullable=False, index=True, comment="投手ID")
    year = Column(Integer, nullable=False, index=True, comment="年份")
    month = Column(Integer, nullable=False, index=True, comment="月份")
    total_spend_usdt = Column(Numeric(15, 2), default=0, comment="总消耗(USDT)")
    total_spend_cny = Column(Numeric(15, 2), default=0, comment="总消耗(CNY)")
    salary_cost_cny = Column(Numeric(15, 2), default=0, comment="人力成本(CNY)")
    total_cost_cny = Column(Numeric(15, 2), default=0, comment="总成本(CNY)")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")

    # 唯一约束：同一投手同一月份只能有一条记录
    __table_args__ = (
        UniqueConstraint('operator_id', 'year', 'month', name='uq_operator_year_month'),
    )

    # 关系
    operator = relationship("Operator", backref="monthly_performances")


