from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool
from app.config import settings

# Supabase 连接配置
# 如果使用连接池 URL（端口 6543），使用 NullPool 避免连接池冲突
# 如果使用直接连接 URL（端口 5432），可以使用默认连接池
use_pool = ":6543" not in settings.database_url

if use_pool:
    # 直接连接，使用连接池
    engine = create_engine(
        settings.database_url,
        pool_pre_ping=True,  # 检查连接是否有效
        pool_size=5,
        max_overflow=10,
        echo=False  # 设置为 True 可以看到 SQL 查询日志
    )
else:
    # 连接池 URL，不使用 SQLAlchemy 的连接池
    engine = create_engine(
        settings.database_url,
        poolclass=NullPool,
        pool_pre_ping=True,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """数据库会话依赖"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


