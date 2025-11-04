# 广告投手消耗上报系统

一个完整的 Web 端"广告投手消耗上报 + 财务收支录入 + 自动对账 + 月度分析"系统。

## 技术栈

- **前端**: Next.js + Tailwind CSS
- **后端**: FastAPI + PostgreSQL
- **数据库**: PostgreSQL

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
```
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
```

3. 运行数据库迁移（需要先配置 Alembic）

4. 启动服务：
```bash
uvicorn app.main:app --reload
```

### 前端设置

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

