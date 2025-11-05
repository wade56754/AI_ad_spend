# ✅ 数据库配置成功 - 下一步

## 已完成

✅ Supabase 项目创建  
✅ 8 张表创建成功  
✅ 数据库连接配置成功  
✅ 前端环境变量配置完成  
✅ 后端环境变量配置完成  
✅ 连接测试通过

## 当前状态

- **数据库**: PostgreSQL @ Supabase
- **后端**: FastAPI (未启动)
- **前端**: Next.js + Supabase Starter (未启动)
- **表数据**: 空表（0 条记录）

## 下一步操作

### 步骤 1: 插入测试数据（可选）

在 Supabase SQL Editor 中执行 `INSERT_TEST_DATA.sql`：

1. 访问 https://app.supabase.com
2. 进入项目 → SQL Editor
3. 复制 `E:\AI\ad-spend-system\INSERT_TEST_DATA.sql` 的内容
4. 点击 Run 执行

这将插入：
- 2 个测试项目
- 3 个测试投手
- 3 条广告消耗记录
- 3 条财务记录

### 步骤 2: 启动后端服务

打开 **终端 1**：

```bash
cd E:\AI\ad-spend-system\backend
python -m uvicorn app.main:app --reload --port 8000
```

**验证：**
- 访问 http://localhost:8000
- 访问 http://localhost:8000/docs（API 文档）
- 访问 http://localhost:8000/health（健康检查）

### 步骤 3: 启动前端服务

打开 **终端 2**：

```bash
cd E:\AI\ad-spend-system\with-supabase-app
npm install
npm run dev
```

**验证：**
- 访问 http://localhost:3000

### 步骤 4: 测试 API 接口

在浏览器中访问 http://localhost:8000/docs，测试以下接口：

#### 测试项目列表
```
GET /api/projects
```

#### 测试投手上报
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

#### 测试财务录入
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

#### 测试对账
```
POST /api/reconcile/run
```

### 步骤 5: 测试前端页面

访问前端应用：

1. **首页**: http://localhost:3000
2. **登录**: http://localhost:3000/auth/login
3. **注册**: http://localhost:3000/auth/sign-up

### 步骤 6: 禁用 RLS（如果需要）

如果前端访问数据库时遇到 RLS 错误，在 Supabase SQL Editor 中执行：

```sql
-- 禁用所有表的 Row Level Security（仅用于开发）
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_spend_daily DISABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation DISABLE ROW LEVEL SECURITY;
ALTER TABLE operator_salary DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_project_performance DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_operator_performance DISABLE ROW LEVEL SECURITY;
```

## 快速启动命令

### 后端
```powershell
cd E:\AI\ad-spend-system\backend
python -m uvicorn app.main:app --reload --port 8000
```

### 前端
```powershell
cd E:\AI\ad-spend-system\with-supabase-app
npm run dev
```

## 常用链接

- **Supabase Dashboard**: https://app.supabase.com/project/jzmcoivxhiyidizncyaq
- **后端 API 文档**: http://localhost:8000/docs
- **前端应用**: http://localhost:3000
- **GitHub 仓库**: https://github.com/wade56754/AI_ad_spend

## 配置文件位置

- 后端配置：`E:\AI\ad-spend-system\backend\.env`
- 前端配置：`E:\AI\ad-spend-system\with-supabase-app\.env.local`
- 数据库脚本：`E:\AI\ad-spend-system\backend\init_supabase.sql`
- 测试数据：`E:\AI\ad-spend-system\INSERT_TEST_DATA.sql`

## 故障排查

### 后端启动失败
```bash
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

### 前端无法连接后端
检查 `.env.local` 中的 `NEXT_PUBLIC_API_URL=http://localhost:8000/api`

### 数据库连接失败
检查 `backend/.env` 中的 `DATABASE_URL`

## 下一阶段开发

1. ⏳ 创建业务页面（投手上报、财务录入、对账、分析）
2. ⏳ 实现用户认证和角色权限
3. ⏳ 添加数据可视化图表
4. ⏳ 完善错误处理和日志
5. ⏳ 编写单元测试和集成测试

---

现在可以开始启动服务进行测试了！
