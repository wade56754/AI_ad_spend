# 快速启动测试指南

## ✅ 依赖已安装

后端 Python 依赖已成功安装。

## 🚀 启动步骤

### 步骤 1: 创建前端环境变量文件

在 `with-supabase-app/` 目录下创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 步骤 2: 启动后端服务

打开**终端 1**，执行：

```bash
cd E:\AI\ad-spend-system\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**验证：**
- 访问 http://localhost:8000/docs 查看 API 文档
- 访问 http://localhost:8000/health 应返回 `{"status": "healthy"}`

### 步骤 3: 安装前端依赖并启动

打开**终端 2**，执行：

```bash
cd E:\AI\ad-spend-system\with-supabase-app
npm install
npm run dev
```

**验证：**
- 访问 http://localhost:3000 应该看到 Supabase Starter 首页

## 📋 测试清单

### 1. 后端 API 测试

访问 http://localhost:8000/docs 使用 Swagger UI 测试：

- ✅ `GET /health` - 健康检查
- ✅ `GET /api/ad-spend` - 获取消耗记录
- ✅ `POST /api/ad-spend` - 提交消耗记录
- ✅ `GET /api/ledger` - 获取财务记录
- ✅ `POST /api/ledger` - 录入财务记录
- ✅ `POST /api/reconcile/run` - 触发对账
- ✅ `GET /api/reconciliation` - 获取对账结果

### 2. 前端页面测试

- ✅ http://localhost:3000 - 首页
- ✅ http://localhost:3000/auth/login - 登录页面
- ✅ http://localhost:3000/auth/sign-up - 注册页面
- ⏳ `/report/spend` - 投手上报（待创建）
- ⏳ `/finance/ledger` - 财务录入（待创建）
- ⏳ `/reconcile` - 对账页面（待创建）

## 🔧 常见问题

### 问题 1: 后端启动失败

**错误：** `ModuleNotFoundError` 或数据库连接错误

**解决：**
1. 确认 `.env` 文件存在且配置正确
2. 检查数据库连接字符串
3. 运行 `python test_connection.py` 测试连接

### 问题 2: 前端无法连接后端

**解决：**
1. 确认后端服务正在运行（http://localhost:8000）
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_API_URL`
3. 检查浏览器控制台错误信息

### 问题 3: 端口被占用

**解决：**
- 后端：修改 `--port` 参数（如 `--port 8001`）
- 前端：修改 `package.json` 中的端口配置或使用 `npm run dev -- -p 3001`

## 📝 测试数据示例

### 提交消耗记录

```json
POST /api/ad-spend
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

### 录入财务记录

```json
POST /api/ledger
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

## 🎯 下一步

1. ✅ 测试后端 API
2. ✅ 测试前端页面
3. ⏳ 复制业务页面到 `with-supabase-app/app/`
4. ⏳ 测试完整业务流程
