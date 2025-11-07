# 广告投手消耗上报系统 - 目录结构与路由规划

## 前端目录结构 (Next.js + Tailwind)

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局组件
│   ├── page.tsx                  # 首页/仪表盘
│   ├── report/
│   │   └── spend/
│   │       └── page.tsx          # 投手消耗上报页面
│   ├── finance/
│   │   └── ledger/
│   │       └── page.tsx          # 财务收支录入页面
│   ├── reconcile/
│   │   └── page.tsx               # 对账页面
│   ├── analytics/
│   │   └── page.tsx               # 分析页面
│   ├── settings/
│   │   └── page.tsx               # 项目和投手维护页面
│   └── login/
│       └── page.tsx               # 登录页面
├── components/                    # 公共组件
│   ├── ui/                       # 基础 UI 组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   └── Select.tsx
│   ├── layout/                   # 布局组件
│   │   ├── Header.tsx            # 顶部导航栏
│   │   ├── Sidebar.tsx           # 侧边栏
│   │   └── Footer.tsx            # 页脚
│   └── features/                 # 功能组件
│       ├── SpendReportForm.tsx   # 消耗上报表单
│       ├── FinanceLedgerForm.tsx # 财务录入表单
│       ├── ReconciliationTable.tsx # 对账表格
│       └── AnalyticsChart.tsx    # 分析图表
├── lib/                          # 工具函数
│   ├── api.ts                    # API 请求封装
│   ├── auth.ts                   # 认证相关
│   └── utils.ts                  # 通用工具函数
├── hooks/                        # React Hooks
│   ├── useAuth.ts                # 认证 Hook
│   └── useApi.ts                 # API 请求 Hook
├── types/                        # TypeScript 类型定义
│   ├── user.ts                   # 用户类型
│   ├── project.ts                # 项目类型
│   ├── spend.ts                  # 消耗类型
│   └── finance.ts               # 财务类型
├── styles/                       # 样式文件
│   └── globals.css               # 全局样式
├── public/                       # 静态资源
├── next.config.js                # Next.js 配置
├── tailwind.config.js            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 依赖管理
```

### 前端路由说明

| 路由 | 页面文件 | 职责 | 访问权限 |
|------|---------|------|---------|
| `/` | `app/page.tsx` | 首页/仪表盘，显示系统概览 | 所有角色 |
| `/report/spend` | `app/report/spend/page.tsx` | 投手消耗上报页面 | 投手、管理员 |
| `/finance/ledger` | `app/finance/ledger/page.tsx` | 财务收支录入页面 | 财务、管理员 |
| `/reconcile` | `app/reconcile/page.tsx` | 对账页面，显示对账结果 | 财务、管理员 |
| `/analytics` | `app/analytics/page.tsx` | 分析页面，月度数据统计 | 所有角色 |
| `/settings` | `app/settings/page.tsx` | 项目和投手维护页面 | 管理员 |
| `/login` | `app/login/page.tsx` | 登录页面 | 未登录用户 |

---

## 后端目录结构 (FastAPI + PostgreSQL)

```
backend/
├── app/
│   ├── main.py                   # FastAPI 应用入口，路由注册
│   ├── config.py                 # 配置文件（数据库、环境变量等）
│   ├── dependencies.py           # 依赖注入（认证、数据库连接等）
│   │
│   ├── routers/                  # 路由模块
│   │   ├── __init__.py
│   │   ├── auth.py               # 认证路由（登录、登出、token刷新）
│   │   ├── spend_report.py      # 消耗上报路由
│   │   ├── finance_ledger.py     # 财务收支路由
│   │   ├── reconciliation.py    # 对账路由
│   │   ├── analytics.py          # 分析统计路由
│   │   └── settings.py           # 项目和投手管理路由
│   │
│   ├── models/                   # SQLAlchemy 数据模型
│   │   ├── __init__.py           # 模型导出
│   │   ├── project.py            # 项目模型
│   │   ├── operator.py           # 投手模型
│   │   ├── spend_report.py       # 消耗上报模型
│   │   ├── finance_ledger.py     # 财务账本模型
│   │   ├── reconciliation.py     # 对账记录模型
│   │   ├── operator_salary.py    # 投手工资模型
│   │   └── monthly_reports.py    # 月度报表模型
│   │
│   ├── schemas/                  # Pydantic 数据模式（请求/响应）
│   │   ├── __init__.py
│   │   ├── auth.py               # 认证相关 Schema
│   │   ├── project.py            # 项目 Schema
│   │   ├── operator.py           # 投手 Schema
│   │   ├── spend_report.py      # 消耗上报 Schema
│   │   ├── finance_ledger.py    # 财务账本 Schema
│   │   ├── reconciliation.py    # 对账 Schema
│   │   └── analytics.py         # 分析统计 Schema
│   │
│   ├── db/                       # 数据库相关
│   │   ├── __init__.py
│   │   ├── session.py            # 数据库会话管理
│   │   ├── base.py               # 数据库基类
│   │   └── init_db.py            # 数据库初始化脚本
│   │
│   ├── services/                 # 业务逻辑层
│   │   ├── __init__.py
│   │   ├── spend_service.py     # 消耗上报业务逻辑
│   │   ├── finance_service.py   # 财务业务逻辑
│   │   ├── reconciliation_service.py # 对账业务逻辑
│   │   └── analytics_service.py # 分析统计业务逻辑
│   │
│   └── utils/                    # 工具函数
│       ├── __init__.py
│       ├── auth.py               # 认证工具（JWT、密码加密等）
│       └── helpers.py            # 通用辅助函数
│
├── alembic/                      # 数据库迁移工具
│   ├── versions/                 # 迁移版本文件
│   └── env.py                    # Alembic 环境配置
│
├── requirements.txt              # Python 依赖
├── .env.example                  # 环境变量示例
├── .gitignore                    # Git 忽略文件
└── README.md                     # 项目说明文档
```

### 后端文件职责说明

#### 核心文件
- **`main.py`**: FastAPI 应用入口，注册所有路由，配置中间件（CORS、认证等）
- **`config.py`**: 读取环境变量，配置数据库连接、JWT 密钥等
- **`dependencies.py`**: 定义依赖注入函数，如获取当前用户、数据库会话等

#### routers/ - 路由模块
- **`auth.py`**: 处理用户登录、登出、token 刷新等认证相关接口
- **`spend_report.py`**: 消耗上报的 CRUD 接口（创建、查询、更新、删除）
- **`finance_ledger.py`**: 财务收支的 CRUD 接口
- **`reconciliation.py`**: 对账相关接口（触发对账、查询对账结果）
- **`analytics.py`**: 分析统计接口（月度报表、数据可视化数据）
- **`settings.py`**: 项目和投手的管理接口（增删改查）

#### models/ - 数据模型
- **`project.py`**: 项目表模型（项目名称、代码、状态等）
- **`operator.py`**: 投手表模型（姓名、工号、角色、关联项目等）
- **`spend_report.py`**: 消耗上报表模型（项目、投手、日期、金额等）
- **`finance_ledger.py`**: 财务账本表模型（收支类型、金额、日期、备注等）
- **`reconciliation.py`**: 对账记录表模型（对账日期、差异金额、状态等）
- **`operator_salary.py`**: 投手工资表模型（投手、月份、工资金额等）
- **`monthly_reports.py`**: 月度报表表模型（月份、汇总数据等）

#### schemas/ - 数据模式
- 定义请求和响应的数据结构，用于数据验证和序列化
- 每个模型对应一个 Schema 文件，包含创建、更新、查询等不同场景的 Schema

#### db/ - 数据库
- **`session.py`**: 数据库会话工厂，管理数据库连接
- **`base.py`**: 数据库基类，定义通用字段和方法
- **`init_db.py`**: 初始化数据库脚本，创建表结构、初始化数据

#### services/ - 业务逻辑层
- 封装复杂的业务逻辑，处理数据校验、计算、对账算法等
- 路由层调用服务层，服务层操作模型层

#### utils/ - 工具函数
- **`auth.py`**: JWT token 生成/验证、密码加密/验证等
- **`helpers.py`**: 通用工具函数（日期格式化、金额计算等）

---

## API 路由规划

### 认证相关 (`/api/auth`)
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `POST /api/auth/refresh` - 刷新 token

### 消耗上报 (`/api/spend`)
- `POST /api/spend/reports` - 创建消耗上报
- `GET /api/spend/reports` - 查询消耗上报列表
- `GET /api/spend/reports/{id}` - 查询单个上报
- `PUT /api/spend/reports/{id}` - 更新消耗上报
- `DELETE /api/spend/reports/{id}` - 删除消耗上报

### 财务收支 (`/api/finance`)
- `POST /api/finance/ledger` - 创建财务记录
- `GET /api/finance/ledger` - 查询财务记录列表
- `GET /api/finance/ledger/{id}` - 查询单个记录
- `PUT /api/finance/ledger/{id}` - 更新财务记录
- `DELETE /api/finance/ledger/{id}` - 删除财务记录

### 对账 (`/api/reconcile`)
- `POST /api/reconcile/run` - 执行对账
- `GET /api/reconcile/results` - 查询对账结果
- `GET /api/reconcile/results/{id}` - 查询单个对账结果

### 分析统计 (`/api/analytics`)
- `GET /api/analytics/monthly` - 获取月度统计数据
- `GET /api/analytics/project/{project_id}` - 获取项目统计数据
- `GET /api/analytics/operator/{operator_id}` - 获取投手统计数据

### 设置管理 (`/api/settings`)
- 项目管理:
  - `POST /api/settings/projects` - 创建项目
  - `GET /api/settings/projects` - 查询项目列表
  - `PUT /api/settings/projects/{id}` - 更新项目
  - `DELETE /api/settings/projects/{id}` - 删除项目
- 投手管理:
  - `POST /api/settings/operators` - 创建投手
  - `GET /api/settings/operators` - 查询投手列表
  - `PUT /api/settings/operators/{id}` - 更新投手
  - `DELETE /api/settings/operators/{id}` - 删除投手



