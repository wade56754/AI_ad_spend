# 本地测试指南

## 前置准备

### 1. 确认 Supabase 配置

确保你已经配置好 Supabase 项目：
- 项目 URL: `https://jzmcoivxhiyidizncyaq.supabase.co`
- API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- 数据库密码: `wade56754's Org`

### 2. 检查数据库连接

确保已在 Supabase SQL Editor 中执行了 `backend/init_supabase.sql` 创建所有表。

---

## 后端测试（FastAPI）

### 步骤 1: 配置环境变量

在 `backend/` 目录下创建或检查 `.env` 文件：

```env
DATABASE_URL=postgresql://postgres.xxxxx:密码@aws-0-cn-north-1.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**获取 DATABASE_URL 的方法：**
1. 登录 Supabase Dashboard
2. 进入项目设置 → Database
3. 找到 "Connection string" → "Connection pooling"
4. 复制连接字符串，替换 `<password>` 为你的数据库密码

### 步骤 2: 安装依赖

```bash
cd E:\AI\ad-spend-system\backend
pip install -r requirements.txt
```

### 步骤 3: 测试数据库连接

```bash
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

如果看到 "数据库连接成功！"，说明配置正确。

### 步骤 4: 启动后端服务

```bash
cd E:\AI\ad-spend-system\backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**验证后端：**
- 访问 http://localhost:8000/docs 查看 Swagger API 文档
- 访问 http://localhost:8000/health 应返回 `{"status": "healthy"}`

---

## 前端测试（Next.js Supabase Starter）

### 步骤 1: 配置环境变量

在 `with-supabase-app/` 目录下创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 步骤 2: 安装依赖

```bash
cd E:\AI\ad-spend-system\with-supabase-app
npm install
```

### 步骤 3: 启动前端服务

```bash
cd E:\AI\ad-spend-system\with-supabase-app
npm run dev
```

**验证前端：**
- 访问 http://localhost:3000
- 应该看到 Supabase Starter 的首页

---

## 功能测试清单

### 1. 后端 API 测试

使用 Swagger UI (http://localhost:8000/docs) 或 Postman 测试：

#### 投手上报 API
- `GET /api/ad-spend` - 获取消耗记录列表
- `POST /api/ad-spend` - 提交消耗记录
  ```json
  {
    "spend_date": "2024-01-15",
    "project_id": 1,
    "country": "US",
    "operator_id": 1,
    "platform": "Facebook",
    "amount_usdt": 100.50,
    "raw_memo": "测试消耗"
  }
  ```

#### 财务录入 API
- `GET /api/ledger` - 获取财务记录列表
- `POST /api/ledger` - 录入财务记录
  ```json
  {
    "tx_date": "2024-01-15",
    "direction": "expense",
    "amount": 100.50,
    "currency": "USDT",
    "account": "Meta Ads",
    "description": "广告支出",
    "fee_amount": 0.5,
    "project_id": 1,
    "operator_id": 1
  }
  ```

#### 对账 API
- `POST /api/reconcile/run` - 手动触发对账
- `GET /api/reconciliation` - 获取对账结果列表
- `PATCH /api/reconciliation/{id}` - 确认匹配

#### 月度分析 API
- `POST /api/reports/monthly` - 生成月度报告
  ```json
  {
    "year": 2024,
    "month": 1
  }
  ```
- `GET /api/analytics/diagnostic` - 获取诊断报告

### 2. 前端页面测试

#### 认证功能
- 访问 http://localhost:3000/auth/login - 登录页面
- 访问 http://localhost:3000/auth/sign-up - 注册页面
- 测试登录/注册流程

#### 业务页面（需要创建）
- `/report/spend` - 投手上报页面
- `/finance/ledger` - 财务录入页面
- `/reconcile` - 对账页面
- `/analytics` - 分析报表页面
- `/settings` - 设置管理页面

### 3. 数据库测试

#### 检查表是否创建

在 Supabase SQL Editor 中执行：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

应该看到以下表：
- `projects`
- `operators`
- `ad_spend_daily`
- `ledger_transactions`
- `reconciliation`
- `operator_salary`
- `monthly_project_performance`
- `monthly_operator_performance`

#### 插入测试数据

```sql
-- 插入测试项目
INSERT INTO projects (name, description, status) 
VALUES ('测试项目', '这是一个测试项目', 'active');

-- 插入测试投手
INSERT INTO operators (name, email, status) 
VALUES ('测试投手', 'operator@test.com', 'active');
```

---

## 常见问题排查

### 问题 1: 后端启动失败 - 数据库连接错误

**解决方案：**
1. 检查 `.env` 文件中的 `DATABASE_URL` 是否正确
2. 确认使用连接池端口（6543）而不是直连端口（5432）
3. 运行 `python test_connection.py` 测试连接

### 问题 2: 前端无法连接后端 API

**解决方案：**
1. 确认后端服务正在运行（http://localhost:8000）
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_API_URL` 是否正确
3. 检查后端 CORS 配置（已在 `main.py` 中配置为允许所有来源）

### 问题 3: Supabase 认证失败

**解决方案：**
1. 确认 `.env.local` 中的 Supabase URL 和 Key 正确
2. 检查 Supabase Dashboard 中的 API 设置
3. 确认 Authentication 功能已启用

### 问题 4: 表不存在错误

**解决方案：**
1. 在 Supabase SQL Editor 中执行 `backend/init_supabase.sql`
2. 或使用 Alembic 迁移：
   ```bash
   cd backend
   alembic upgrade head
   ```

---

## 快速测试脚本

### 后端测试脚本

创建 `backend/test_api.py`：

```python
import requests

BASE_URL = "http://localhost:8000/api"

# 测试健康检查
response = requests.get("http://localhost:8000/health")
print("健康检查:", response.json())

# 测试获取项目列表
response = requests.get(f"{BASE_URL}/projects")
print("项目列表:", response.json())
```

运行：
```bash
cd backend
python test_api.py
```

### 前端测试

在浏览器控制台测试 API 调用：

```javascript
// 测试 API 连接
fetch('http://localhost:8000/api/ad-spend')
  .then(res => res.json())
  .then(data => console.log('API 响应:', data));
```

---

## 下一步

1. ✅ 后端 API 测试通过
2. ✅ 前端页面可以访问
3. ✅ 数据库连接正常
4. ⏳ 复制业务页面到 `with-supabase-app/app/`
5. ⏳ 测试完整业务流程

---

## 测试命令汇总

```bash
# 终端 1: 启动后端
cd E:\AI\ad-spend-system\backend
uvicorn app.main:app --reload --port 8000

# 终端 2: 启动前端
cd E:\AI\ad-spend-system\with-supabase-app
npm run dev

# 终端 3: 测试数据库连接
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

访问：
- 后端 API 文档: http://localhost:8000/docs
- 前端应用: http://localhost:3000
