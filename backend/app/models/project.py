from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class Project(Base):
    """项目表"""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True, comment="项目ID")
    name = Column(String(100), nullable=False, comment="项目名称")
    code = Column(String(50), unique=True, nullable=False, comment="项目代码")
    status = Column(String(20), default="active", comment="状态：active/inactive")
    description = Column(String(500), comment="项目描述")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")

    # 关系
    spend_reports = relationship("AdSpendDaily", back_populates="project", cascade="all, delete-orphan")
    ledger_transactions = relationship("LedgerTransaction", back_populates="project")
    operators = relationship("Operator", back_populates="project")



