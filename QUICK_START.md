# 本地测试快速启动指南

## ⚠️ 当前状态

- ✅ Python 依赖已安装
- ✅ Node.js 环境就绪
- ⚠️ 数据库连接需要配置

## 🔧 第一步：配置数据库连接

### 1. 检查后端 `.env` 文件

确保 `backend/.env` 文件中的 `DATABASE_URL` 格式正确：

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**获取正确连接字符串的方法：**

1. 登录 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目
3. 进入 **Settings** → **Database**
4. 找到 **Connection string** 部分
5. 选择 **Connection pooling** (Transaction mode)
6. 复制连接字符串
7. 将 `<password>` 替换为你的实际密码：`wade56754's Org`

**示例格式：**
```
postgresql://postgres.jzmcoivxhiyidizncyaq:[password]@aws-0-cn-north-1.pooler.supabase.com:6543/postgres
```

### 2. 创建前端 `.env.local` 文件

在 `with-supabase-app/` 目录下创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🚀 第二步：启动服务

### 启动后端（终端 1）

```bash
cd E:\AI\ad-spend-system\backend
python -m uvicorn app.main:app --reload --port 8000
```

**验证：**
- 访问 http://localhost:8000/docs
- 访问 http://localhost:8000/health

### 启动前端（终端 2）

```bash
cd E:\AI\ad-spend-system\with-supabase-app
npm install
npm run dev
```

**验证：**
- 访问 http://localhost:3000

## 🧪 第三步：测试数据库连接

修复连接字符串后，运行：

```bash
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

如果看到 `[OK] 数据库连接成功！`，说明配置正确。

## 📋 测试清单

### 后端 API 测试

访问 http://localhost:8000/docs 测试：

1. **健康检查**
   - `GET /health` → 应返回 `{"status": "healthy"}`

2. **投手上报**
   - `GET /api/ad-spend` → 获取消耗记录列表
   - `POST /api/ad-spend` → 提交新记录

3. **财务录入**
   - `GET /api/ledger` → 获取财务记录
   - `POST /api/ledger` → 录入新记录

4. **对账功能**
   - `POST /api/reconcile/run` → 触发对账
   - `GET /api/reconciliation` → 查看对账结果

### 前端页面测试

1. **首页**
   - http://localhost:3000

2. **认证页面**
   - http://localhost:3000/auth/login
   - http://localhost:3000/auth/sign-up

## 🔍 常见问题

### 问题 1: 数据库连接失败 "Tenant or user not found"

**原因：** 连接字符串中的用户名或密码不正确

**解决：**
1. 确认使用的是连接池 URL（端口 6543）
2. 确认用户名格式：`postgres.[project-ref]`
3. 确认密码正确（注意特殊字符需要 URL 编码）
4. 如果密码包含特殊字符，使用 URL 编码：
   - `'` → `%27`
   - ` ` → `%20`

### 问题 2: 前端无法连接后端

**解决：**
1. 确认后端服务正在运行
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_API_URL`
3. 检查浏览器控制台的网络请求

### 问题 3: 表不存在错误

**解决：**
1. 在 Supabase SQL Editor 中执行 `backend/init_supabase.sql`
2. 或使用 Alembic 迁移：
   ```bash
   cd backend
   alembic upgrade head
   ```

## 📝 测试数据示例

### 创建测试项目

在 Supabase SQL Editor 中执行：

```sql
INSERT INTO projects (name, description, status) 
VALUES ('测试项目', '这是一个测试项目', 'active')
RETURNING *;
```

### 创建测试投手

```sql
INSERT INTO operators (name, email, status) 
VALUES ('测试投手', 'operator@test.com', 'active')
RETURNING *;
```

## ✅ 完成检查

- [ ] 后端 `.env` 配置正确
- [ ] 前端 `.env.local` 配置正确
- [ ] 数据库连接测试通过
- [ ] 后端服务启动成功
- [ ] 前端服务启动成功
- [ ] API 文档可以访问
- [ ] 前端页面可以访问

## 🎯 下一步

完成基础测试后：
1. 复制业务页面到 `with-supabase-app/app/`
2. 测试完整业务流程
3. 配置用户角色和权限
