# 公网部署指南

## 📋 部署架构

```
[用户浏览器]
    ↓
[Vercel - 前端 Next.js]
    ↓
[Railway/Render - 后端 FastAPI]
    ↓
[Supabase - PostgreSQL 数据库] ✅ 已配置
```

## 🎯 推荐方案

### 前端：Vercel（免费）
- ✅ 自动 CI/CD
- ✅ 全球 CDN
- ✅ 支持 Next.js 原生
- ✅ 免费 SSL 证书
- ✅ 自定义域名

### 后端：Railway 或 Render（免费层）
- ✅ 支持 Python/FastAPI
- ✅ 自动部署
- ✅ 免费 SSL
- ✅ 环境变量管理

### 数据库：Supabase
- ✅ 已配置完成
- ✅ 云端托管
- ✅ 无需额外操作

---

## 🚀 部署步骤

## 第一部分：后端部署（FastAPI）

### 方案 A：使用 Railway（推荐）

#### 步骤 1: 准备后端代码

1. 在 `backend` 目录创建 `railway.toml`：

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

2. 更新 `backend/requirements.txt`，确保包含所有依赖：

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
alembic==1.12.1
supabase==2.0.0
```

3. 创建 `backend/Procfile`（备用）：

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### 步骤 2: 部署到 Railway

1. **访问 Railway**
   - https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `AI_ad_spend` 仓库

3. **配置服务**
   - 选择 `backend` 目录作为根目录
   - Railway 会自动检测 Python 项目

4. **设置环境变量**
   在 Railway 项目设置中添加：

   ```env
   DATABASE_URL=postgresql://postgres:Date103221%2A%28%29@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres
   SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
   SECRET_KEY=your-production-secret-key-change-this
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **部署**
   - Railway 会自动检测更改并部署
   - 等待部署完成（约 2-5 分钟）

6. **获取后端 URL**
   - 在 Railway Dashboard 中找到部署的 URL
   - 格式类似：`https://your-backend.railway.app`
   - 测试：`https://your-backend.railway.app/health`

---

### 方案 B：使用 Render

#### 步骤 1: 准备配置文件

创建 `backend/render.yaml`：

```yaml
services:
  - type: web
    name: ad-spend-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
      - key: SECRET_KEY
        generateValue: true
      - key: PYTHON_VERSION
        value: 3.11.0
```

#### 步骤 2: 部署到 Render

1. **访问 Render**
   - https://render.com
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 "New +" → "Web Service"
   - 连接 GitHub 仓库
   - 选择 `AI_ad_spend` 仓库

3. **配置服务**
   - Name: `ad-spend-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`

4. **设置环境变量**
   添加与 Railway 相同的环境变量

5. **选择计划**
   - Free Plan（有限制：服务休眠、冷启动）
   - 或 Starter Plan（$7/月，无休眠）

6. **部署并获取 URL**

---

## 第二部分：前端部署（Next.js）

### 使用 Vercel（推荐）

#### 步骤 1: 准备前端代码

1. 确保 `with-supabase-app/package.json` 配置正确

2. 创建 `with-supabase-app/vercel.json`（可选）：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

#### 步骤 2: 部署到 Vercel

1. **访问 Vercel**
   - https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 `AI_ad_spend` 仓库
   - 点击 "Import"

3. **配置项目**
   - Framework Preset: 自动检测为 Next.js
   - Root Directory: `with-supabase-app`
   - Build Command: `npm run build`（自动）
   - Output Directory: `.next`（自动）

4. **设置环境变量**
   在 Vercel 项目设置中添加：

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
   ```
   
   ⚠️ **重要**：将 `NEXT_PUBLIC_API_URL` 替换为你的后端 URL

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-5 分钟）

6. **获取前端 URL**
   - Vercel 会提供一个 URL，如：`https://your-app.vercel.app`
   - 也可以绑定自定义域名

---

## 第三部分：配置 CORS

### 更新后端 CORS 配置

修改 `backend/app/main.py`：

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="广告投手消耗上报系统",
    description="广告投手消耗上报 + 财务收支录入 + 自动对账 + 月度分析系统",
    version="1.0.0"
)

# 配置 CORS - 添加你的 Vercel 域名
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app",  # 替换为你的 Vercel URL
        "https://your-custom-domain.com",  # 如果有自定义域名
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

提交并推送更改：

```bash
cd E:\AI\ad-spend-system
git add backend/app/main.py
git commit -m "Update CORS for production"
git push origin main
```

Railway/Render 会自动重新部署。

---

## 第四部分：验证部署

### 1. 测试后端

```bash
# 测试健康检查
curl https://your-backend.railway.app/health

# 测试 API 文档
浏览器访问: https://your-backend.railway.app/docs
```

### 2. 测试前端

1. 访问你的 Vercel URL
2. 测试登录/注册功能
3. 测试 API 调用

### 3. 测试完整流程

1. 在前端创建项目和投手
2. 提交消耗记录
3. 录入财务记录
4. 执行对账
5. 生成月度报告

---

## 🔧 环境变量管理

### 后端环境变量（Railway/Render）

```env
# 数据库
DATABASE_URL=postgresql://postgres:密码@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
SUPABASE_KEY=你的API密钥

# JWT
SECRET_KEY=生产环境密钥（至少32字符）
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API
API_V1_STR=/api
PROJECT_NAME=广告投手消耗上报系统
```

### 前端环境变量（Vercel）

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的公开密钥

# 后端 API（重要！）
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

## 📝 部署清单

### 后端部署检查

- [ ] Railway/Render 账号已创建
- [ ] GitHub 仓库已连接
- [ ] 环境变量已配置
- [ ] 部署成功
- [ ] 健康检查通过：`/health`
- [ ] API 文档可访问：`/docs`
- [ ] 数据库连接正常

### 前端部署检查

- [ ] Vercel 账号已创建
- [ ] 项目已导入
- [ ] 环境变量已配置（包括后端 URL）
- [ ] 部署成功
- [ ] 页面可访问
- [ ] Supabase 认证正常
- [ ] API 调用成功

### CORS 配置检查

- [ ] 后端 CORS 包含前端域名
- [ ] 前端可以调用后端 API
- [ ] 无跨域错误

---

## 🌐 自定义域名（可选）

### 前端域名（Vercel）

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的域名（如 `app.yourdomain.com`）
3. 按照提示配置 DNS 记录
4. 等待 SSL 证书自动签发

### 后端域名（Railway）

1. 在 Railway 项目设置中点击 "Settings"
2. 找到 "Domains" 部分
3. 添加自定义域名
4. 配置 DNS CNAME 记录

---

## 🔒 安全建议

### 1. 环境变量

- ✅ 使用强密码和密钥
- ✅ 不要在代码中硬编码敏感信息
- ✅ 生产环境使用不同的密钥

### 2. CORS 配置

- ✅ 只允许特定域名
- ✅ 不要使用 `allow_origins=["*"]` 在生产环境

### 3. Supabase RLS

在生产环境启用 Row Level Security：

```sql
-- 启用 RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
-- ... 其他表

-- 创建策略（示例）
CREATE POLICY "Users can view their own data"
ON projects FOR SELECT
USING (auth.uid() = user_id);
```

### 4. API 限流

考虑添加 API 限流中间件。

---

## 📊 监控和日志

### Railway 监控

- 在 Dashboard 查看部署日志
- 监控资源使用情况
- 设置告警

### Vercel 监控

- 在 Analytics 查看访问数据
- 监控构建状态
- 查看错误日志

### Supabase 监控

- 在 Dashboard 查看数据库性能
- 监控 API 使用量
- 查看慢查询

---

## 🚨 故障排查

### 后端部署失败

1. **检查日志**
   ```
   Railway/Render Dashboard → Logs
   ```

2. **常见问题**
   - 依赖安装失败：检查 `requirements.txt`
   - 端口错误：确保使用 `$PORT` 环境变量
   - 数据库连接失败：检查 `DATABASE_URL`

### 前端部署失败

1. **检查构建日志**
   ```
   Vercel Dashboard → Deployments → 查看日志
   ```

2. **常见问题**
   - 构建失败：检查 Node 版本和依赖
   - 环境变量缺失：确认所有 `NEXT_PUBLIC_*` 变量已设置
   - API 调用失败：检查 `NEXT_PUBLIC_API_URL`

### API 跨域错误

1. **检查后端 CORS 配置**
2. **确认前端域名在允许列表中**
3. **清除浏览器缓存**

---

## 💰 成本估算

### 免费方案

- **Supabase Free Tier**: ✅ 已使用
  - 500MB 数据库
  - 5GB 带宽/月
  
- **Railway Free Trial**: 
  - $5 免费额度/月
  - 约 500 小时运行时间
  
- **Vercel Free Tier**: 
  - 100GB 带宽/月
  - 无限部署

**总计**: 基本免费（Railway 试用期后需付费）

### 付费方案（如需要）

- **Railway Starter**: $5/月
- **Render Starter**: $7/月
- **Vercel Pro**: $20/月（通常不需要）
- **Supabase Pro**: $25/月（数据增长后）

---

## 📝 快速部署脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

echo "=== 部署到生产环境 ==="

# 1. 提交代码
git add .
git commit -m "Deploy to production"
git push origin main

echo "✓ 代码已推送到 GitHub"

# 2. Railway 会自动部署后端
echo "✓ 后端部署：自动触发"

# 3. Vercel 会自动部署前端
echo "✓ 前端部署：自动触发"

echo "=== 部署完成 ==="
echo "请等待 2-5 分钟让部署完成"
echo "后端: https://your-backend.railway.app"
echo "前端: https://your-app.vercel.app"
```

---

## 🎯 下一步

部署完成后：

1. ✅ 测试所有功能
2. ✅ 配置自定义域名
3. ✅ 启用 Supabase RLS
4. ✅ 添加监控和告警
5. ✅ 邀请团队成员测试
6. ✅ 收集反馈并优化

需要帮助？查看各平台的官方文档：
- Railway: https://docs.railway.app
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Supabase: https://supabase.com/docs
