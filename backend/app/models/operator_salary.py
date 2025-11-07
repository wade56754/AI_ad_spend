from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class OperatorSalary(Base):
    """投手工资/提成表"""
    __tablename__ = "operator_salary"

    id = Column(Integer, primary_key=True, index=True, comment="ID")
    operator_id = Column(Integer, ForeignKey("operators.id"), nullable=False, index=True, comment="投手ID")
    year = Column(Integer, nullable=False, index=True, comment="年份")
    month = Column(Integer, nullable=False, index=True, comment="月份")
    salary_amount = Column(Numeric(15, 2), nullable=False, comment="工资金额(CNY)")
    bonus_amount = Column(Numeric(15, 2), default=0, comment="提成金额(CNY)")
    total_amount = Column(Numeric(15, 2), nullable=False, comment="总金额(CNY)")
    description = Column(String(1000), comment="备注")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")

    # 关系
    operator = relationship("Operator", backref="salaries")



