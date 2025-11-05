# 启动服务指南

## ✅ 配置已完成

- 数据库连接：成功
- 后端环境变量：已配置
- 前端环境变量：已配置

## 🚀 启动命令

### 方法 1: 手动启动（推荐）

#### 后端服务（终端 1）
```powershell
cd E:\AI\ad-spend-system\backend
python -m uvicorn app.main:app --reload --port 8000
```

#### 前端服务（终端 2）
```powershell
cd E:\AI\ad-spend-system\with-supabase-app
npm run dev
```

### 方法 2: 使用启动脚本

运行以下命令在新窗口启动：

```powershell
# 启动后端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\AI\ad-spend-system\backend; python -m uvicorn app.main:app --reload --port 8000"

# 启动前端
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\AI\ad-spend-system\with-supabase-app; npm run dev"
```

## 🔍 验证服务

### 后端验证

1. **健康检查**
   ```
   http://localhost:8000/health
   ```
   应返回：`{"status": "healthy"}`

2. **API 文档**
   ```
   http://localhost:8000/docs
   ```
   可以看到 Swagger UI 文档

3. **根路径**
   ```
   http://localhost:8000/
   ```
   应返回：`{"message": "广告投手消耗上报系统 API"}`

### 前端验证

1. **首页**
   ```
   http://localhost:3000
   ```

2. **登录页面**
   ```
   http://localhost:3000/auth/login
   ```

3. **注册页面**
   ```
   http://localhost:3000/auth/sign-up
   ```

## 📊 测试 API

访问 http://localhost:8000/docs，测试以下接口：

### 1. 获取项目列表
```
GET /api/projects
```

### 2. 提交消耗记录
```
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

### 3. 录入财务记录
```
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

## ⚠️ 故障排查

### 后端启动失败

**错误：模块未找到**
```bash
pip install -r requirements.txt
```

**错误：端口被占用**
```bash
# 使用不同端口
python -m uvicorn app.main:app --reload --port 8001
```

### 前端启动失败

**错误：依赖未安装**
```bash
npm install
```

**错误：端口被占用**
```bash
# Next.js 会自动尝试其他端口
npm run dev
```

### 数据库连接错误

```bash
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

## 📝 测试数据

如果需要测试数据，在 Supabase SQL Editor 中执行：

```sql
-- 插入测试项目
INSERT INTO projects (name, code, description, status) 
VALUES ('测试项目', 'TEST001', '测试用', 'active')
ON CONFLICT (code) DO NOTHING;

-- 插入测试投手
INSERT INTO operators (name, employee_id, project_id, role, status) 
VALUES ('测试投手', 'EMP001', 1, 'operator', 'active')
ON CONFLICT (employee_id) DO NOTHING;
```

## 🎯 下一步

1. ✅ 启动后端服务
2. ✅ 启动前端服务
3. ⏳ 测试 API 接口
4. ⏳ 测试前端页面
5. ⏳ 开发业务功能
