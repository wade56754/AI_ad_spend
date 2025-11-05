# Supabase 集成指南

## 📋 概述

本项目已配置支持 Supabase PostgreSQL 数据库。Supabase 提供：
- 🗄️ PostgreSQL 数据库（完全兼容）
- 🔐 认证服务（可选）
- 📊 实时订阅（可选）
- 📁 文件存储（可选）

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project"
4. 填写项目信息：
   - Project Name: `ad-spend-system`
   - Database Password: 设置一个强密码（保存好）
   - Region: 选择离你最近的区域

### 2. 获取数据库连接信息

项目创建后，在 Supabase Dashboard：

1. 进入 **Settings** → **Database**
2. 找到 **Connection string** 部分
3. 选择 **Connection pooling** 模式（推荐）或 **Direct connection**

#### 连接池 URL（推荐）
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

#### 直接连接 URL
```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 3. 配置环境变量

在 `backend/.env` 文件中设置：

```env
# Supabase 数据库连接（使用连接池 URL）
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# 或者使用直接连接
# DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Supabase 项目配置（可选，用于 Supabase 客户端）
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=your-anon-key

# JWT 配置
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 5. 运行数据库迁移

使用 Alembic 创建数据库表：

```bash
# 初始化 Alembic（如果还没有）
alembic init alembic

# 创建初始迁移
alembic revision --autogenerate -m "Initial migration"

# 执行迁移
alembic upgrade head
```

或者在 Supabase SQL Editor 中直接执行 SQL 创建表。

## 📊 在 Supabase Dashboard 中查看数据

1. 登录 Supabase Dashboard
2. 进入 **Table Editor** 查看数据表
3. 使用 **SQL Editor** 执行查询
4. 在 **Database** → **Tables** 查看表结构

## 🔧 数据库表结构

项目需要创建以下表：

1. `projects` - 项目表
2. `operators` - 投手表
3. `ad_spend_daily` - 投手日报表
4. `ledger_transactions` - 财务收支表
5. `reconciliation` - 对账结果表
6. `operator_salary` - 投手工资表
7. `monthly_project_performance` - 月度项目绩效表
8. `monthly_operator_performance` - 月度投手绩效表

表结构定义在 `backend/app/models/` 目录下的各个文件中。

## 🔐 Supabase 认证集成（可选）

如果你想使用 Supabase 的认证服务，可以：

1. 安装 Supabase Python 客户端：
```bash
pip install supabase
```

2. 在代码中使用：
```python
from supabase import create_client, Client

supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_key
)
```

## 📝 注意事项

1. **连接池 vs 直接连接**
   - 连接池（端口 6543）：适合生产环境，有连接数限制但更稳定
   - 直接连接（端口 5432）：适合开发环境，连接数限制较少

2. **SSL 连接**
   - Supabase 默认要求 SSL 连接
   - 如果遇到 SSL 错误，在连接字符串中添加 `?sslmode=require`

3. **数据库密码**
   - 创建项目时设置的密码需要妥善保管
   - 如果忘记，可以在 Supabase Dashboard 重置

4. **免费层限制**
   - Supabase 免费层有数据库大小和连接数限制
   - 查看 [Supabase 定价](https://supabase.com/pricing) 了解详情

## 🚀 部署建议

### Vercel / Netlify（前端）
- 前端可以部署到 Vercel 或 Netlify
- 设置环境变量 `NEXT_PUBLIC_API_URL` 指向后端 API

### Railway / Render（后端）
- 后端可以部署到 Railway 或 Render
- 设置环境变量 `DATABASE_URL` 为 Supabase 连接字符串

### Supabase Edge Functions（可选）
- 可以使用 Supabase Edge Functions 替代部分后端逻辑
- 适合轻量级的 API 端点

## 📚 相关资源

- [Supabase 文档](https://supabase.com/docs)
- [Supabase Python 客户端](https://github.com/supabase/supabase-py)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)

## ❓ 常见问题

**Q: 连接失败怎么办？**
A: 检查连接字符串是否正确，确保密码和项目引用（project-ref）正确。

**Q: 如何重置数据库密码？**
A: 在 Supabase Dashboard → Settings → Database → Reset database password

**Q: 可以本地开发吗？**
A: 可以，使用 Supabase 的远程数据库，或者使用 Supabase CLI 运行本地实例。

**Q: 如何备份数据库？**
A: 在 Supabase Dashboard → Settings → Database → Backups 可以设置自动备份。


