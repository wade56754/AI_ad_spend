from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Operator(Base):
    """投手表"""
    __tablename__ = "operators"

    id = Column(Integer, primary_key=True, index=True, comment="投手ID")
    name = Column(String(50), nullable=False, comment="投手姓名")
    employee_id = Column(String(50), unique=True, nullable=False, comment="工号")
    project_id = Column(Integer, ForeignKey("projects.id"), comment="所属项目ID")
    role = Column(String(20), default="operator", comment="角色：operator/finance/admin")
    status = Column(String(20), default="active", comment="状态：active/inactive")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")

    # 关系
    project = relationship("Project", back_populates="operators")
    spend_reports = relationship("AdSpendDaily", back_populates="operator", cascade="all, delete-orphan")
    ledger_transactions = relationship("LedgerTransaction", back_populates="operator")



