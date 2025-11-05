# Supabase 环境变量配置脚本
# 在 backend 目录下运行此脚本

$envContent = @"
# Supabase 数据库配置
# 连接池 URL（推荐，用于生产环境）
DATABASE_URL=postgresql://postgres.jzmcoivxhiyidizncyaq:wade56754%27s%20Org@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# 直接连接 URL（备用，用于开发环境）
# DATABASE_URL=postgresql://postgres:wade56754%27s%20Org@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres

# Supabase 项目配置
SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw

# JWT 配置
SECRET_KEY=ad-spend-system-secret-key-2024-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API 配置
API_V1_STR=/api
PROJECT_NAME=广告投手消耗上报系统
"@

$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host ".env 文件已创建！" -ForegroundColor Green

