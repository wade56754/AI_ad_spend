from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase 数据库配置
    # 使用连接池 URL（推荐）或直接连接 URL
    # 连接池 URL: postgresql://postgres:[password]@[project-ref].supabase.co:6543/postgres
    # 直接连接: postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres
    database_url: str = "postgresql://postgres:password@localhost:5432/postgres"
    
    # Supabase 项目配置（可选，用于 Supabase 客户端）
    supabase_url: str = ""
    supabase_key: str = ""
    
    # JWT 配置
    secret_key: str = "your-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # API 配置
    api_v1_str: str = "/api"
    project_name: str = "广告投手消耗上报系统"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()


