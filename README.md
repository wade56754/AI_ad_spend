# 广告投手消耗上报系统

一个完整的 Web 端"广告投手消耗上报 + 财务收支录入 + 自动对账 + 月度分析"系统。

## 技术栈

- **前端**: Next.js + Tailwind CSS
- **后端**: FastAPI + PostgreSQL
- **数据库**: Supabase (PostgreSQL) / 本地 PostgreSQL

## 功能特性

### 1. 投手消耗上报
- 每日消耗记录上报
- 支持项目、投手、平台等维度统计

### 2. 财务收支录入
- 收入/支出记录管理
- 支持多币种（USDT/CNY）
- 手续费记录

### 3. 自动对账
- 自动匹配投手日报与财务记录
- 智能匹配算法（金额差、日期差）
- 对账结果审核

### 4. 月度分析
- 月度报表生成
- 项目绩效分析
- 投手绩效分析
- 财务诊断报告

## 项目结构

```
ad-spend-system/
├── backend/          # FastAPI 后端
│   ├── app/
│   │   ├── main.py   # 应用入口
│   │   ├── models/   # 数据模型
│   │   ├── routers/  # 路由
│   │   ├── schemas/  # 数据验证
│   │   ├── services/ # 业务逻辑
│   │   └── db/       # 数据库配置
│   └── requirements.txt
├── frontend/         # Next.js 前端
│   ├── app/          # 页面组件
│   └── lib/           # 工具函数
└── README.md
```

## 快速开始

### 后端设置

1. 安装依赖：
```bash
cd backend
pip install -r requirements.txt
```

2. 配置环境变量（创建 `.env` 文件）：

**使用 Supabase（推荐）**：
```env
# Supabase 连接池 URL（推荐）
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# 或直接连接 URL
# DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

SECRET_KEY=your-secret-key
```

**使用本地 PostgreSQL**：
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ad_spend_db
SECRET_KEY=your-secret-key
```

详细配置请参考 [Supabase 集成指南](backend/SUPABASE_SETUP.md)

3. 运行数据库迁移（需要先配置 Alembic）

4. 启动服务：
```bash
uvicorn app.main:app --reload
```

### 前端设置

有两种方式创建前端：

#### 方式 1: 使用 Bolt.new 生成（推荐）

1. 访问 [Bolt.new](https://bolt.new)
2. 参考 [Bolt.new 使用指南](BOLT_NEW_GUIDE.md) 和 [API 文档](API_DOCUMENTATION.md)
3. 将生成的代码导出到 `frontend` 目录

#### 方式 2: 使用现有代码

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 配置环境变量（创建 `.env.local` 文件）：
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. 启动开发服务器：
```bash
npm run dev
```

## API 文档

启动后端服务后，访问 `http://localhost:8000/docs` 查看 Swagger API 文档。

## 主要 API 端点

- `POST /api/ad-spend` - 投手消耗上报
- `POST /api/ledger` - 财务收支录入
- `POST /api/reconcile/run` - 执行对账
- `GET /api/reconcile` - 查询对账结果
- `POST /api/reports/monthly` - 生成月度报表
- `GET /api/reports/diagnostic` - 生成诊断报告

## 用户角色

- **投手**: 提交每日消耗上报
- **财务**: 录入收支记录，执行对账
- **管理员**: 管理项目、投手，查看分析报表

## 许可证

MIT License


