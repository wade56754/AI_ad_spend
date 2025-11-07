from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base


class AdSpendDaily(Base):
    """投手日报表"""
    __tablename__ = "ad_spend_daily"

    id = Column(Integer, primary_key=True, index=True, comment="ID")
    spend_date = Column(Date, nullable=False, index=True, comment="消耗日期")
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False, index=True, comment="项目ID")
    country = Column(String(50), comment="国家/地区")
    operator_id = Column(Integer, ForeignKey("operators.id"), nullable=False, index=True, comment="投手ID")
    platform = Column(String(50), comment="投放平台")
    amount_usdt = Column(Numeric(15, 2), nullable=False, comment="消耗金额(USDT)")
    raw_memo = Column(String(1000), comment="原始备注")
    channel_id = Column(Integer, ForeignKey("channels.id", ondelete="RESTRICT"), nullable=False, index=True, comment="渠道ID（必填）")
    status = Column(String(20), default="pending", comment="状态：pending/approved/rejected")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")

    # 关系
    project = relationship("Project", back_populates="spend_reports")
    operator = relationship("Operator", back_populates="spend_reports")
    channel = relationship("Channel", back_populates="spend_reports")
    reconciliations = relationship("Reconciliation", back_populates="ad_spend", cascade="all, delete-orphan")



