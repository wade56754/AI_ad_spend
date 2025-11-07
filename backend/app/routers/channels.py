from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from datetime import date
from app.db.session import get_db
from app.models.channel import Channel, MonthlyChannelPerformance, project_channels
from app.models.project import Project
from app.schemas.channel import (
    ChannelCreate,
    ChannelUpdate,
    ChannelResponse,
    ChannelListResponse,
    ProjectChannelCreate,
    MonthlyChannelPerformanceResponse
)

router = APIRouter(prefix="/channels", tags=["渠道管理"])


@router.get("", response_model=ChannelListResponse)
def get_channels(
    skip: int = Query(0, ge=0, description="跳过记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回记录数"),
    status: Optional[str] = Query(None, description="状态筛选"),
    db: Session = Depends(get_db)
):
    """获取渠道列表"""
    try:
        query = db.query(Channel)

        if status:
            query = query.filter(Channel.status == status)

        total = query.count()
        records = query.order_by(desc(Channel.created_at)).offset(skip).limit(limit).all()

        data = [
            ChannelResponse(
                id=record.id,
                name=record.name,
                contact=record.contact,
                rebate_rate=record.rebate_rate,
                status=record.status,
                note=record.note,
                created_at=record.created_at.isoformat() if record.created_at else "",
                updated_at=record.updated_at.isoformat() if record.updated_at else None
            )
            for record in records
        ]

        return ChannelListResponse(
            data=data,
            error=None,
            meta={
                "total": total,
                "skip": skip,
                "limit": limit,
                "has_more": (skip + limit) < total
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{channel_id}", response_model=dict)
def get_channel(
    channel_id: int,
    db: Session = Depends(get_db)
):
    """获取单个渠道"""
    try:
        channel = db.query(Channel).filter(Channel.id == channel_id).first()
        if not channel:
            return {
                "data": None,
                "error": f"渠道ID {channel_id} 不存在",
                "meta": None
            }

        data = ChannelResponse(
            id=channel.id,
            name=channel.name,
            contact=channel.contact,
            rebate_rate=channel.rebate_rate,
            status=channel.status,
            note=channel.note,
            created_at=channel.created_at.isoformat() if channel.created_at else "",
            updated_at=channel.updated_at.isoformat() if channel.updated_at else None
        )

        return {
            "data": data.model_dump(),
            "error": None,
            "meta": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=dict)
def create_channel(
    channel_data: ChannelCreate,
    db: Session = Depends(get_db)
):
    """创建渠道"""
    try:
        new_channel = Channel(
            name=channel_data.name,
            contact=channel_data.contact,
            rebate_rate=channel_data.rebate_rate,
            status=channel_data.status,
            note=channel_data.note
        )

        db.add(new_channel)
        db.commit()
        db.refresh(new_channel)

        data = ChannelResponse(
            id=new_channel.id,
            name=new_channel.name,
            contact=new_channel.contact,
            rebate_rate=new_channel.rebate_rate,
            status=new_channel.status,
            note=new_channel.note,
            created_at=new_channel.created_at.isoformat() if new_channel.created_at else "",
            updated_at=new_channel.updated_at.isoformat() if new_channel.updated_at else None
        )

        return {
            "data": data.model_dump(),
            "error": None,
            "meta": {"message": "渠道创建成功"}
        }
    except Exception as e:
        db.rollback()
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }


@router.put("/{channel_id}", response_model=dict)
def update_channel(
    channel_id: int,
    channel_data: ChannelUpdate,
    db: Session = Depends(get_db)
):
    """更新渠道"""
    try:
        channel = db.query(Channel).filter(Channel.id == channel_id).first()
        if not channel:
            return {
                "data": None,
                "error": f"渠道ID {channel_id} 不存在",
                "meta": None
            }

        # 更新字段
        update_data = channel_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(channel, field, value)

        db.commit()
        db.refresh(channel)

        data = ChannelResponse(
            id=channel.id,
            name=channel.name,
            contact=channel.contact,
            rebate_rate=channel.rebate_rate,
            status=channel.status,
            note=channel.note,
            created_at=channel.created_at.isoformat() if channel.created_at else "",
            updated_at=channel.updated_at.isoformat() if channel.updated_at else None
        )

        return {
            "data": data.model_dump(),
            "error": None,
            "meta": {"message": "渠道更新成功"}
        }
    except Exception as e:
        db.rollback()
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }


@router.delete("/{channel_id}", response_model=dict)
def delete_channel(
    channel_id: int,
    db: Session = Depends(get_db)
):
    """删除渠道"""
    try:
        channel = db.query(Channel).filter(Channel.id == channel_id).first()
        if not channel:
            return {
                "data": None,
                "error": f"渠道ID {channel_id} 不存在",
                "meta": None
            }

        db.delete(channel)
        db.commit()

        return {
            "data": {"id": channel_id},
            "error": None,
            "meta": {"message": "渠道删除成功"}
        }
    except Exception as e:
        db.rollback()
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }


@router.post("/projects/{project_id}/channels", response_model=dict)
def associate_channel_to_project(
    project_id: int,
    channel_id: int = Query(..., description="渠道ID"),
    db: Session = Depends(get_db)
):
    """关联渠道到项目"""
    try:
        # 验证项目是否存在
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {
                "data": None,
                "error": f"项目ID {project_id} 不存在",
                "meta": None
            }

        # 验证渠道是否存在
        channel = db.query(Channel).filter(Channel.id == channel_id).first()
        if not channel:
            return {
                "data": None,
                "error": f"渠道ID {channel_id} 不存在",
                "meta": None
            }

        # 检查是否已关联
        from sqlalchemy import and_
        existing = db.execute(
            project_channels.select().where(
                and_(
                    project_channels.c.project_id == project_id,
                    project_channels.c.channel_id == channel_id
                )
            )
        ).first()

        if existing:
            return {
                "data": None,
                "error": "该渠道已关联到此项目",
                "meta": None
            }

        # 创建关联
        db.execute(
            project_channels.insert().values(
                project_id=project_id,
                channel_id=channel_id
            )
        )
        db.commit()

        return {
            "data": {"project_id": project_id, "channel_id": channel_id},
            "error": None,
            "meta": {"message": "渠道关联成功"}
        }
    except Exception as e:
        db.rollback()
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }


@router.delete("/projects/{project_id}/channels/{channel_id}", response_model=dict)
def remove_channel_from_project(
    project_id: int,
    channel_id: int,
    db: Session = Depends(get_db)
):
    """解除项目渠道关联"""
    try:
        from sqlalchemy import and_
        result = db.execute(
            project_channels.delete().where(
                and_(
                    project_channels.c.project_id == project_id,
                    project_channels.c.channel_id == channel_id
                )
            )
        )
        db.commit()

        if result.rowcount == 0:
            return {
                "data": None,
                "error": "关联关系不存在",
                "meta": None
            }

        return {
            "data": {"project_id": project_id, "channel_id": channel_id},
            "error": None,
            "meta": {"message": "关联解除成功"}
        }
    except Exception as e:
        db.rollback()
        return {
            "data": None,
            "error": str(e),
            "meta": None
        }


@router.get("/projects/{project_id}/channels", response_model=dict)
def get_project_channels(
    project_id: int,
    db: Session = Depends(get_db)
):
    """获取项目关联的渠道列表"""
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {
                "data": None,
                "error": f"项目ID {project_id} 不存在",
                "meta": None
            }

        channels = project.channels
        data = [
            ChannelResponse(
                id=channel.id,
                name=channel.name,
                contact=channel.contact,
                rebate_rate=channel.rebate_rate,
                status=channel.status,
                note=channel.note,
                created_at=channel.created_at.isoformat() if channel.created_at else "",
                updated_at=channel.updated_at.isoformat() if channel.updated_at else None
            )
            for channel in channels
        ]

        return {
            "data": [item.model_dump() for item in data],
            "error": None,
            "meta": {"total": len(data)}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats", response_model=dict)
def get_channel_stats(
    start_date: Optional[date] = Query(None, description="开始日期"),
    end_date: Optional[date] = Query(None, description="结束日期"),
    channel_id: Optional[int] = Query(None, description="渠道ID（可选）"),
    db: Session = Depends(get_db)
):
    """获取渠道统计数据"""
    try:
        from app.models.spend_report import AdSpendDaily
        from sqlalchemy import func

        query = db.query(
            AdSpendDaily.channel_id,
            func.sum(AdSpendDaily.amount_usdt).label("total_spend"),
            func.count(AdSpendDaily.id).label("record_count")
        ).filter(AdSpendDaily.channel_id.isnot(None))

        if channel_id:
            query = query.filter(AdSpendDaily.channel_id == channel_id)
        if start_date:
            query = query.filter(AdSpendDaily.spend_date >= start_date)
        if end_date:
            query = query.filter(AdSpendDaily.spend_date <= end_date)

        results = query.group_by(AdSpendDaily.channel_id).all()

        data = [
            {
                "channel_id": result.channel_id,
                "total_spend": float(result.total_spend or 0),
                "record_count": result.record_count
            }
            for result in results
        ]

        return {
            "data": data,
            "error": None,
            "meta": {"count": len(data)}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

