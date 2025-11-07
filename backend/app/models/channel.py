from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

# 项目渠道关联表（多对多关系）
project_channels = Table(
    'project_channels',
    Base.metadata,
    Column('id', Integer, primary_key=True),
    Column('project_id', Integer, ForeignKey('projects.id', ondelete='CASCADE'), nullable=False),
    Column('channel_id', Integer, ForeignKey('channels.id', ondelete='CASCADE'), nullable=False),
    Column('created_at', DateTime(timezone=True), server_default=func.now()),
)


class Channel(Base):
    """渠道表"""
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True, comment="渠道ID")
    name = Column(String(100), nullable=False, comment="渠道名称")
    contact = Column(String(100), comment="联系人")
    rebate_rate = Column(Numeric(5, 2), default=0, comment="返点率(%)")
    status = Column(String(20), default="active", comment="状态：active/disabled")
    note = Column(String(500), comment="备注")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")

    # 关系
    spend_reports = relationship("AdSpendDaily", back_populates="channel")
    monthly_performances = relationship("MonthlyChannelPerformance", back_populates="channel", cascade="all, delete-orphan")
    projects = relationship(
        "Project",
        secondary=project_channels,
        back_populates="channels"
    )


class MonthlyChannelPerformance(Base):
    """月度渠道绩效表"""
    __tablename__ = "monthly_channel_performance"

    id = Column(Integer, primary_key=True, index=True, comment="ID")
    channel_id = Column(Integer, ForeignKey("channels.id", ondelete="CASCADE"), nullable=False, index=True, comment="渠道ID")
    month = Column(Date, nullable=False, index=True, comment="月份（日期格式，如2024-11-01）")
    total_spend = Column(Numeric(15, 2), default=0, comment="总消耗")
    active_accounts = Column(Integer, default=0, comment="活跃账户数")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), comment="更新时间")

    # 关系
    channel = relationship("Channel", back_populates="monthly_performances")

