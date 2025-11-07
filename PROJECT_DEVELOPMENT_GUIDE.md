# AI财务与投手管理系统 - 项目开发文档

## 项目概述

本项目是一个**AI财务与投手管理系统**，用于统一管理广告投放业务。系统采用前后端分离架构，前端使用 Next.js 框架（通过 Bolt.new 开发），后端使用 FastAPI，数据库使用 Supabase PostgreSQL，部署到宝塔面板。

### 技术栈

- **前端框架**: Next.js 14+ (App Router)
- **开发工具**: Bolt.new
- **UI组件库**: Tailwind CSS + shadcn/ui
- **状态管理**: React Hooks + Context API
- **API客户端**: Fetch API / Axios
- **数据库**: Supabase PostgreSQL
- **后端框架**: FastAPI (Python)
- **部署平台**: 宝塔面板

---

## 一、环境准备

### 1.1 Supabase 数据库配置

#### 步骤1: 创建 Supabase 项目
1. 访问 [Supabase](https://supabase.com)
2. 创建新项目，记录以下信息：
   - Project URL
   - Anon Key
   - Service Role Key
   - Database Password

#### 步骤2: 执行数据库初始化脚本
在 Supabase Dashboard -> SQL Editor 中执行 `backend/init_supabase.sql`

该脚本会创建以下表：
- `projects` - 项目表
- `operators` - 投手表
- `channels` - 渠道/代理表
- `project_channels` - 项目渠道关联表
- `ad_spend_daily` - 投手日报表（包含 channel_id 字段）
- `ledger_transactions` - 财务收支表
- `reconciliation` - 对账结果表
- `operator_salary` - 投手工资表
- `monthly_project_performance` - 月度项目绩效表
- `monthly_operator_performance` - 月度投手绩效表
- `monthly_channel_performance` - 月度渠道绩效表（新增）

#### 步骤3: 配置 Row Level Security (RLS)
根据业务需求配置 RLS 策略，确保数据安全。

**启用 RLS**：
```sql
-- 为所有表启用 RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_spend_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation ENABLE ROW LEVEL SECURITY;
```

**示例 RLS 策略**：

```sql
-- 1. 投手只能查看自己的消耗记录
CREATE POLICY "operators_view_own_spend" ON ad_spend_daily
    FOR SELECT
    USING (
        operator_id IN (
            SELECT id FROM operators 
            WHERE employee_id = current_setting('app.current_user_id', true)
        )
    );

-- 2. 财务人员可以查看所有财务记录
CREATE POLICY "finance_view_all_ledger" ON ledger_transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM operators 
            WHERE id = current_setting('app.current_user_id', true)::int
            AND role = 'finance'
        )
    );

-- 3. 管理员可以查看所有数据
CREATE POLICY "admin_view_all" ON projects
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM operators 
            WHERE id = current_setting('app.current_user_id', true)::int
            AND role = 'admin'
        )
    );
```

**注意**：以上策略为示例，请根据实际业务需求调整。在生产环境中，建议：
- 为每个表创建细粒度的 RLS 策略
- 区分 SELECT、INSERT、UPDATE、DELETE 操作
- 定期审查和测试 RLS 策略

### 1.5 角色权限设计

#### 角色定义

系统包含以下角色：

| 角色 | 角色代码 | 说明 |
|------|---------|------|
| 投手 | `operator` | 负责广告投放的运营人员 |
| 财务 | `finance` | 负责财务录入和对账审核 |
| 户管 | `account_manager` | 负责渠道管理和客户关系 |
| 管理层 | `manager` | 负责查看报表和分析数据 |
| 管理员 | `admin` | 拥有所有权限，可进行系统配置 |

#### 权限映射表

| 角色 | 可访问模块 | 可操作内容 | 数据范围 |
|------|-----------|-----------|---------|
| **投手** | 日报上报 | - 新建自己的日报<br>- 修改自己未审核的日报<br>- 查看自己的日报历史 | 仅限自己的数据 |
| **财务** | 财务录入、对账 | - 新建财务记录<br>- 修改财务记录<br>- 执行对账<br>- 审核对账结果<br>- 标记异常匹配 | 所有财务数据和对账结果 |
| **户管** | 渠道管理、项目渠道关联 | - 添加/编辑/删除渠道<br>- 关联渠道到项目<br>- 查看渠道统计数据<br>- 查看渠道绩效分析 | 所有渠道数据 |
| **管理层** | 报表、分析、统计 | - 查看所有项目汇总<br>- 查看投手绩效<br>- 查看渠道绩效<br>- 查看月度报表<br>- 查看诊断报告 | 所有汇总和统计数据（不包含明细修改） |
| **管理员** | 所有模块 | - 所有操作权限<br>- 项目和投手管理<br>- 系统配置<br>- 用户管理<br>- 数据导出 | 所有数据 |

#### 前端路由权限控制

在 `middleware.ts` 中实现基于角色的路由保护：

```typescript
// 路由权限配置
const routePermissions = {
  '/report/spend': ['operator', 'admin'],
  '/finance/ledger': ['finance', 'admin'],
  '/reconcile': ['finance', 'admin'],
  '/analytics': ['manager', 'admin'],
  '/settings': ['admin'],
  '/settings/channels': ['account_manager', 'admin'],
}

// 在中间件中检查权限
export async function middleware(req: NextRequest) {
  const user = await getCurrentUser(req)
  const pathname = req.nextUrl.pathname
  
  // 检查路由权限
  const allowedRoles = routePermissions[pathname]
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
  
  return NextResponse.next()
}
```

#### 后端 API 权限控制

在 `app/dependencies.py` 中实现权限检查：

```python
from fastapi import Depends, HTTPException, status
from app.utils.auth import get_current_user

# 权限装饰器
def require_role(allowed_roles: list[str]):
    def decorator(current_user = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="权限不足"
            )
        return current_user
    return decorator

# 使用示例
@router.post("/api/channels")
async def create_channel(
    channel_data: ChannelCreate,
    current_user = Depends(require_role(['account_manager', 'admin']))
):
    # 创建渠道逻辑
    pass
```

### 1.2 前端环境变量配置

创建 `.env.local` 文件：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API 配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# 应用配置
NEXT_PUBLIC_APP_NAME=AI财务与投手管理系统
```

### 1.3 后端环境变量配置

创建 `backend/.env` 文件：

```env
# Supabase 数据库配置
# 推荐使用连接池 URL（性能更好）
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
# 或直接连接 URL
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key

# JWT 配置
SECRET_KEY=your-secret-key-here  # 生产环境请使用强随机密钥
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS 配置（生产环境请设置具体域名，不要使用 *）
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://your-domain.com

# 日志配置
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

**重要提示**：
- 生产环境的 `SECRET_KEY` 应使用强随机字符串（至少 32 字符）
- `CORS_ORIGINS` 在生产环境必须设置为具体的前端域名，不要使用 `*`
- `.env` 文件不应提交到 Git，请确保已添加到 `.gitignore`

### 1.4 环境验证

配置完成后，验证环境是否正确：

**验证后端连接**：
```bash
cd backend
python -c "from app.db.session import get_db; next(get_db()); print('数据库连接成功')"
```

**验证前端环境变量**：
```bash
cd frontend
node -e "console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL)"
```

**验证 Supabase 连接**：
```bash
# 使用 Supabase CLI 或运行测试脚本
cd backend
python test_connection.py
```

---

## 二、数据库设计

### 2.1 核心表结构

#### projects (项目表)
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(100) NOT NULL - 项目名称
- code: VARCHAR(50) UNIQUE NOT NULL - 项目代码
- status: VARCHAR(20) DEFAULT 'active' - 状态
- description: VARCHAR(500) - 描述
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ
```

#### operators (投手表)
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(50) NOT NULL - 投手姓名
- employee_id: VARCHAR(50) UNIQUE NOT NULL - 工号
- project_id: INTEGER REFERENCES projects(id) - 关联项目
- role: VARCHAR(20) DEFAULT 'operator' - 角色
- status: VARCHAR(20) DEFAULT 'active' - 状态
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ
```

#### ad_spend_daily (投手日报表)
```sql
- id: SERIAL PRIMARY KEY
- spend_date: DATE NOT NULL - 消耗日期
- project_id: INTEGER NOT NULL REFERENCES projects(id)
- country: VARCHAR(50) - 国家
- operator_id: INTEGER NOT NULL REFERENCES operators(id)
- platform: VARCHAR(50) - 平台
- amount_usdt: NUMERIC(15, 2) NOT NULL - 消耗金额(USDT)
- raw_memo: VARCHAR(1000) - 原始备注
- status: VARCHAR(20) DEFAULT 'pending' - 状态
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ
```

#### ledger_transactions (财务收支表)
```sql
- id: SERIAL PRIMARY KEY
- tx_date: DATE NOT NULL - 交易日期
- direction: VARCHAR(20) NOT NULL - 方向(income/expense)
- amount: NUMERIC(15, 2) NOT NULL - 金额
- currency: VARCHAR(10) DEFAULT 'USDT' - 币种
- account: VARCHAR(100) - 账户
- description: VARCHAR(1000) - 描述
- fee_amount: NUMERIC(15, 2) DEFAULT 0 - 手续费
- project_id: INTEGER REFERENCES projects(id)
- operator_id: INTEGER REFERENCES operators(id)
- status: VARCHAR(20) DEFAULT 'pending' - 状态
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ
```

#### reconciliation (对账结果表)
```sql
- id: SERIAL PRIMARY KEY
- ad_spend_id: INTEGER NOT NULL REFERENCES ad_spend_daily(id)
- ledger_id: INTEGER NOT NULL REFERENCES ledger_transactions(id)
- amount_diff: NUMERIC(15, 2) DEFAULT 0 - 金额差
- date_diff: INTEGER DEFAULT 0 - 日期差
- match_score: NUMERIC(5, 2) - 匹配分数
- status: VARCHAR(20) DEFAULT 'matched' - 状态
- reason: VARCHAR(500) - 原因
- created_at: TIMESTAMPTZ DEFAULT NOW()
```

#### channels (渠道/代理表)
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(100) NOT NULL - 渠道名称
- code: VARCHAR(50) UNIQUE NOT NULL - 渠道代码
- type: VARCHAR(20) DEFAULT 'agency' - 类型(agency/channel)
- contact_person: VARCHAR(50) - 联系人
- contact_phone: VARCHAR(20) - 联系电话
- contact_email: VARCHAR(100) - 联系邮箱
- commission_rate: NUMERIC(5, 2) DEFAULT 0 - 佣金比例(%)
- status: VARCHAR(20) DEFAULT 'active' - 状态
- description: VARCHAR(500) - 描述
- created_at: TIMESTAMPTZ DEFAULT NOW()
- updated_at: TIMESTAMPTZ
```

#### project_channels (项目渠道关联表)
```sql
- id: SERIAL PRIMARY KEY
- project_id: INTEGER NOT NULL REFERENCES projects(id)
- channel_id: INTEGER NOT NULL REFERENCES channels(id)
- start_date: DATE - 合作开始日期
- end_date: DATE - 合作结束日期
- status: VARCHAR(20) DEFAULT 'active' - 状态
- created_at: TIMESTAMPTZ DEFAULT NOW()
- UNIQUE(project_id, channel_id)
```

**注意**：需要在 `ad_spend_daily` 表中添加 `channel_id` 字段：
```sql
ALTER TABLE ad_spend_daily 
ADD COLUMN channel_id INTEGER REFERENCES channels(id);
```

### 2.2 索引设计

已为以下字段创建索引以优化查询性能：
- `projects.code`
- `operators.employee_id`
- `ad_spend_daily.spend_date`, `project_id`, `operator_id`, `channel_id`, `status`
- `ledger_transactions.tx_date`, `project_id`, `operator_id`, `direction`
- `reconciliation.ad_spend_id`, `ledger_id`, `status`
- `channels.code`
- `project_channels.project_id`, `channel_id`

---

## 三、前端开发 (Next.js + Bolt.new)

### 3.1 项目结构

```
frontend/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局
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
│   ├── ui/                       # 基础 UI 组件 (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── select.tsx
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
│   ├── supabase/
│   │   ├── client.ts             # Supabase 客户端
│   │   └── server.ts             # Supabase 服务端
│   └── utils.ts                  # 通用工具函数
├── hooks/                        # React Hooks
│   ├── useAuth.ts                # 认证 Hook
│   └── useApi.ts                 # API 请求 Hook
├── types/                        # TypeScript 类型定义
│   ├── user.ts
│   ├── project.ts
│   ├── spend.ts
│   └── finance.ts
├── styles/
│   └── globals.css               # 全局样式
├── public/                       # 静态资源
├── next.config.ts               # Next.js 配置（TypeScript）
├── tailwind.config.js            # Tailwind 配置
├── tsconfig.json                 # TypeScript 配置
└── package.json                  # 依赖管理
```

### 3.2 使用 Bolt.new 开发前端

#### 步骤1: 在 Bolt.new 中创建项目
1. 访问 [Bolt.new](https://bolt.new)
2. 选择 Next.js 模板
3. 配置项目名称和基础设置

#### 步骤2: 配置 Supabase 客户端

在 `lib/supabase/client.ts` 中：

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### 步骤3: 创建 API 客户端

在 `lib/api.ts` 中：

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

// 获取认证 token（如果使用 JWT）
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T; error: string | null }> {
  try {
    const token = getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    }

    // 添加认证 token
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // 处理 HTTP 错误状态
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // 如果响应不是 JSON，使用默认错误信息
      }

      // 处理 401 未授权，可能需要重新登录
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
      }

      return {
        data: null as T,
        error: errorMessage
      }
    }

    const result = await response.json()
    return result
  } catch (error) {
    // 处理网络错误、超时等
    return {
      data: null as T,
      error: error instanceof Error ? error.message : '网络请求失败，请检查网络连接'
    }
  }
}

// 便捷方法
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: any) => 
    apiRequest<T>(endpoint, { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
  put: <T>(endpoint: string, data?: any) => 
    apiRequest<T>(endpoint, { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  patch: <T>(endpoint: string, data?: any) => 
    apiRequest<T>(endpoint, { 
      method: 'PATCH', 
      body: JSON.stringify(data) 
    }),
  delete: <T>(endpoint: string) => 
    apiRequest<T>(endpoint, { method: 'DELETE' }),
}
```

#### 步骤4: 配置认证机制

在 `hooks/useAuth.ts` 中实现认证逻辑：

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface User {
  id: string
  email: string
  role: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'operator'
        })
      }
      setLoading(false)
    })

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            role: session.user.user_metadata?.role || 'operator'
          })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return { user, loading, signIn, signOut }
}
```

在 `middleware.ts` 中配置路由保护：

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 保护需要认证的路由
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

#### 步骤5: 开发页面组件

参考 `API_DOCUMENTATION.md` 中的接口文档，使用 Bolt.new 的 AI 功能生成页面组件。

**示例提示词**：
```
创建一个投手消耗上报页面，包含以下功能：
1. 表单字段：日期、项目、国家、平台、金额、备注
2. 提交后调用 POST /api/ad-spend 接口
3. 显示提交成功/失败提示
4. 使用 Tailwind CSS 和 shadcn/ui 组件
5. 添加表单验证和错误处理
```

### 3.3 核心页面开发指南

#### 投手消耗上报页面 (`app/report/spend/page.tsx`)
- 表单字段：日期选择器、项目下拉、渠道下拉、国家输入、平台输入、金额输入、备注输入
- 表单验证：
  - 金额必须大于0
  - 日期不能为空
  - 项目必须选择
  - 渠道必须选择
- 提交逻辑：调用 `POST /api/ad-spend`
- **异常检测规则**：
  - 如果与前一日差异超过30%，显示警告提示
  - 如果金额为0或负数，阻止提交
  - 如果日期为未来日期，显示提示
- 数据校验：提交前调用后端验证接口检查数据合理性

#### 财务收支录入页面 (`app/finance/ledger/page.tsx`)
- 表单字段：日期、方向(收入/支出)、金额、币种、账户、描述、手续费
- 支持批量导入功能
- 自动分类：根据描述关键字自动识别类型

#### 对账页面 (`app/reconcile/page.tsx`)
- 显示对账结果列表
- 支持筛选：状态（matched/need_review/unmatched）、日期范围
- 匹配状态标识：
  - **完全匹配**：金额差 ≤5% 且日期差 ≤1天（绿色）
  - **待审核**：金额差 >5% 或日期差 >1天（黄色）
  - **未匹配**：未找到对应记录（红色）
- 财务审核功能：
  - 确认匹配：手动确认待审核记录
  - 标记异常：标记为异常匹配
  - 批量审核：支持批量操作
- 对账统计展示：
  - 自动匹配率
  - 待审核数量
  - 异常数量
  - 对账效率趋势图

#### 分析页面 (`app/analytics/page.tsx`)
- 月度统计图表
- 项目绩效排行榜
- 投手绩效排行榜
- **渠道绩效分析**：
  - 按渠道汇总消耗与盈利
  - 渠道 ROI 统计
  - 渠道成本回报分析
  - 渠道消耗趋势图
- 异常分析报告

### 3.4 安装依赖

```bash
npm install @supabase/supabase-js
npm install @radix-ui/react-dialog @radix-ui/react-select
npm install tailwindcss postcss autoprefixer
npm install date-fns
npm install recharts  # 图表库
```

---

## 四、后端开发 (FastAPI)

### 4.1 项目结构

```
backend/
├── app/
│   ├── main.py                   # FastAPI 应用入口
│   ├── config.py                 # 配置文件
│   ├── dependencies.py          # 依赖注入
│   ├── routers/                  # 路由模块
│   │   ├── auth.py
│   │   ├── ad_spend.py
│   │   ├── finance_ledger.py
│   │   ├── reconciliation.py
│   │   ├── analytics.py
│   │   └── settings.py
│   ├── models/                   # 数据模型
│   ├── schemas/                  # Pydantic 模式
│   ├── services/                 # 业务逻辑层
│   ├── db/                       # 数据库相关
│   └── utils/                    # 工具函数
├── requirements.txt
└── .env
```

### 4.2 后端配置和中间件

#### CORS 配置（重要：生产环境安全）

在 `app/main.py` 中配置 CORS：

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title="广告投手消耗上报系统",
    description="广告投手消耗上报 + 财务收支录入 + 自动对账 + 月度分析系统",
    version="1.0.0"
)

# CORS 配置 - 生产环境必须设置具体域名
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # 从环境变量读取，不要使用 ["*"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)
```

#### 全局异常处理

在 `app/main.py` 中添加异常处理器：

```python
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "data": None,
            "error": "请求参数验证失败",
            "details": exc.errors()
        }
    )

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "data": None,
            "error": exc.detail
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    # 记录错误日志
    import logging
    logging.error(f"未处理的异常: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "data": None,
            "error": "服务器内部错误"
        }
    )
```

#### 日志配置

在 `app/config.py` 中添加日志配置：

```python
import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging():
    log_level = os.getenv("LOG_LEVEL", "INFO")
    log_file = os.getenv("LOG_FILE", "logs/app.log")
    
    # 创建日志目录
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    
    # 配置日志格式
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            RotatingFileHandler(
                log_file, 
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            ),
            logging.StreamHandler()  # 同时输出到控制台
        ]
    )
```

#### 对账日志记录

在对账服务中记录关键指标：

```python
# 在对账完成后记录统计信息
import logging

logger = logging.getLogger(__name__)

def log_reconciliation_stats(matched_count, unmatched_count, auto_matched_count):
    total = matched_count + unmatched_count
    auto_match_rate = (auto_matched_count / total * 100) if total > 0 else 0
    
    logger.info(f"对账完成 - 总计: {total}, 自动匹配: {auto_matched_count}, "
                f"待审核: {unmatched_count}, 自动匹配率: {auto_match_rate:.2f}%")
    
    # 记录异常数量
    if unmatched_count > 0:
        logger.warning(f"发现 {unmatched_count} 条待审核记录，需要人工处理")
```

### 4.3 核心 API 接口

#### 投手消耗上报
- `POST /api/ad-spend` - 创建消耗上报
  - **数据校验规则**：
    - 金额必须 > 0
    - 日期不能为空且不能是未来日期
    - 项目必须存在且为 active 状态
    - 渠道必须存在且为 active 状态
    - **异常检测**：如果与前一日同一项目/渠道的消耗差异超过30%，返回警告信息（但不阻止提交）
    - 返回格式：`{"data": {...}, "warning": "金额较昨日波动35%，请确认", "error": null}`
- `GET /api/ad-spend` - 查询消耗上报列表
  - 查询参数：`project_id`, `channel_id`, `operator_id`, `start_date`, `end_date`, `status`
- `GET /api/ad-spend/{id}` - 查询单个上报
- `PUT /api/ad-spend/{id}` - 更新消耗上报
  - 更新时同样进行异常检测
- `DELETE /api/ad-spend/{id}` - 删除消耗上报

#### 财务收支
- `POST /api/ledger` - 创建财务记录
- `GET /api/ledger` - 查询财务记录列表
- `PUT /api/ledger/{id}` - 更新财务记录
- `DELETE /api/ledger/{id}` - 删除财务记录

#### 对账功能
- `POST /api/reconcile/run` - 执行对账
  - **智能对账算法**：
    - 自动匹配规则：金额差 ≤5% 且日期差 ≤1天 → 自动匹配
    - 待审核规则：金额差 >5% 或日期差 >1天 → 标记为待人工审核
    - 匹配分数计算：基于金额差和日期差的综合评分
  - 返回统计信息：自动匹配率、待审核数量、异常数量
- `GET /api/reconcile` - 查询对账结果
  - 查询参数：`status`（matched/need_review/unmatched）、`start_date`、`end_date`
- `PATCH /api/reconcile/{id}` - 确认匹配或标记异常
- `GET /api/reconcile/stats` - 获取对账统计
  - 返回：自动匹配率、人工审核率、异常率、对账效率等

#### 月度报表
- `POST /api/reports/monthly` - 生成月度报表
- `GET /api/reports/diagnostic` - 获取诊断报告

#### 渠道管理
- `GET /api/channels` - 查询渠道列表
- `POST /api/channels` - 创建渠道
- `GET /api/channels/{id}` - 查询单个渠道
- `PUT /api/channels/{id}` - 更新渠道
- `DELETE /api/channels/{id}` - 删除渠道
- `GET /api/channels/stats` - 获取渠道统计数据
  - 查询参数：`start_date`, `end_date`, `channel_id`（可选）
  - 返回：渠道消耗汇总、盈利统计、ROI 等

#### 项目渠道关联
- `POST /api/projects/{project_id}/channels` - 关联渠道到项目
- `DELETE /api/projects/{project_id}/channels/{channel_id}` - 解除关联
- `GET /api/projects/{project_id}/channels` - 查询项目关联的渠道

详细接口文档请参考 `API_DOCUMENTATION.md`

### 4.4 数据库迁移

使用 Alembic 进行数据库版本管理：

#### 初始化 Alembic
```bash
cd backend
pip install alembic
alembic init alembic
```

#### 配置 Alembic
在 `alembic/env.py` 中配置数据库连接：

```python
from app.config import settings
from app.db.base import Base

# 使用环境变量中的数据库 URL
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

target_metadata = Base.metadata
```

#### 创建迁移
```bash
# 自动生成迁移文件
alembic revision --autogenerate -m "创建初始表结构"

# 手动创建迁移文件
alembic revision -m "添加新字段"
```

#### 执行迁移
```bash
# 升级到最新版本
alembic upgrade head

# 降级一个版本
alembic downgrade -1

# 查看当前版本
alembic current

# 查看迁移历史
alembic history
```

### 4.5 安装依赖

```bash
pip install fastapi uvicorn
pip install supabase
pip install python-dotenv
pip install pydantic
pip install python-jose[cryptography]
pip install passlib[bcrypt]
```

---

## 五、开发流程

### 5.1 本地开发

#### 创建 Python 虚拟环境（推荐）
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

#### 启动后端服务
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

后端服务启动后，可以访问：
- API 文档：`http://localhost:8000/docs` (Swagger UI)
- 替代文档：`http://localhost:8000/redoc` (ReDoc)
- 健康检查：`http://localhost:8000/health`

#### 启动前端服务
```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:3000` 查看前端页面。

#### 验证环境
```bash
# 验证后端 API
curl http://localhost:8000/health

# 验证前端
curl http://localhost:3000

# 验证数据库连接
cd backend
python -c "from app.db.session import get_db; next(get_db()); print('数据库连接成功')"
```

### 5.2 开发顺序建议

1. **第一阶段：基础功能**
   - 完成数据库表创建
   - 实现用户认证功能
   - 开发项目和投手管理页面

2. **第二阶段：核心业务**
   - 开发投手消耗上报功能
   - 开发财务收支录入功能
   - 实现基础查询和列表展示

3. **第三阶段：高级功能**
   - 实现自动对账功能
   - 开发月度报表生成
   - 实现数据分析和可视化

4. **第四阶段：优化和完善**
   - 异常检测和告警
   - 权限控制
   - 性能优化
   - 测试和修复

---

## 六、部署到宝塔面板

### 6.1 准备工作

1. 确保服务器已安装：
   - Node.js (v18+)
   - Python (v3.9+)
   - Nginx
   - PM2 (Node.js 进程管理)

2. 在宝塔面板中创建网站：
   - 域名：`your-domain.com`
   - 根目录：`/www/wwwroot/ai-ad-spend`

### 6.2 部署后端

#### 步骤1: 上传代码
```bash
# 在服务器上克隆或上传代码
cd /www/wwwroot/ai-ad-spend
git clone your-repo-url .
```

#### 步骤2: 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

#### 步骤3: 配置环境变量
创建 `backend/.env` 文件，填入 Supabase 配置信息。

#### 步骤4: 使用 PM2 启动后端

**方式1：使用命令行（简单）**
```bash
cd backend
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name ai-ad-spend-api
pm2 save
```

**方式2：使用配置文件（推荐）**

创建 `backend/ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'ai-ad-spend-api',
      script: 'uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8000',
      cwd: '/www/wwwroot/ai-ad-spend/backend',
      interpreter: 'python3',
      instances: 2,  // 根据 CPU 核心数调整
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      watch: false
    }
  ]
}
```

使用配置文件启动：
```bash
cd backend
pm2 start ecosystem.config.js
pm2 save
```

**PM2 常用命令**：
```bash
pm2 list              # 查看所有进程
pm2 logs ai-ad-spend-api  # 查看日志
pm2 restart ai-ad-spend-api  # 重启
pm2 stop ai-ad-spend-api     # 停止
pm2 delete ai-ad-spend-api   # 删除
```

### 6.3 部署前端

#### 步骤1: 构建前端
```bash
cd frontend
npm install
npm run build
```

#### 步骤2: 配置 Next.js Standalone 输出（推荐）

修改 `frontend/next.config.ts`：

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',  // 启用 Standalone 模式
  reactStrictMode: true,
}

export default nextConfig
```

重新构建：
```bash
cd frontend
npm run build
```

#### 步骤3: 配置 Nginx

在宝塔面板 -> 网站 -> 设置 -> 配置文件 中添加：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Next.js 应用（Standalone 模式）
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 步骤4: 使用 PM2 启动前端

创建 `frontend/ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'ai-ad-spend-frontend',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/www/wwwroot/ai-ad-spend/frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_memory_restart: '1G'
    }
  ]
}
```

启动前端：
```bash
cd frontend
pm2 start ecosystem.config.js
pm2 save
```

### 6.4 SSL 证书配置

在宝塔面板中为域名申请 SSL 证书（Let's Encrypt），并开启强制 HTTPS。

### 6.5 防火墙配置

确保宝塔面板防火墙开放：
- 80 端口 (HTTP)
- 443 端口 (HTTPS)
- 8000 端口 (后端 API，仅内网访问)

---

## 七、测试

### 7.1 功能测试清单

- [ ] 用户登录/登出
- [ ] 投手消耗上报（创建、查询、更新、删除）
- [ ] 财务收支录入（创建、查询、更新、删除）
- [ ] 自动对账功能
- [ ] 对账结果查询和审核
- [ ] 月度报表生成
- [ ] 数据分析页面
- [ ] 项目和投手管理
- [ ] 权限控制（不同角色访问权限）
- [ ] 表单验证和错误处理
- [ ] 数据导出功能

### 7.2 单元测试

#### 后端单元测试示例

创建 `backend/tests/test_ad_spend.py`：

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_ad_spend():
    response = client.post("/api/ad-spend", json={
        "spend_date": "2024-11-04",
        "project_id": 1,
        "operator_id": 1,
        "amount_usdt": 100.50,
        "platform": "Facebook",
        "country": "美国"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["error"] is None
    assert data["data"]["amount_usdt"] == 100.50

def test_get_ad_spend_list():
    response = client.get("/api/ad-spend?skip=0&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert isinstance(data["data"], list)
```

运行测试：
```bash
cd backend
pytest tests/ -v
```

#### 前端单元测试示例

安装测试依赖：
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

创建 `frontend/__tests__/SpendReportForm.test.tsx`：

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SpendReportForm } from '@/components/features/SpendReportForm'

test('提交表单时调用 API', async () => {
  render(<SpendReportForm />)
  const submitButton = screen.getByRole('button', { name: /提交/i })
  fireEvent.click(submitButton)
  
  await waitFor(() => {
    expect(screen.getByText(/成功/i)).toBeInTheDocument()
  })
})
```

### 7.3 集成测试

使用 Postman 或编写 E2E 测试：

```bash
# 使用 curl 测试 API
curl -X POST http://localhost:8000/api/ad-spend \
  -H "Content-Type: application/json" \
  -d '{
    "spend_date": "2024-11-04",
    "project_id": 1,
    "operator_id": 1,
    "amount_usdt": 100.50
  }'
```

### 7.4 性能测试

使用工具进行性能测试：

```bash
# 使用 Apache Bench 测试 API
ab -n 1000 -c 50 http://localhost:8000/api/ad-spend

# 使用 k6 进行负载测试
k6 run load_test.js
```

**性能指标**：
- API 响应时间 < 500ms（P95）
- 页面加载时间 < 2s
- 支持并发用户数 > 50
- 数据库查询时间 < 100ms（简单查询）

### 7.5 测试数据准备

创建测试数据脚本 `backend/scripts/create_test_data.py`：

```python
from app.db.session import SessionLocal
from app.models.project import Project
from app.models.operator import Operator

def create_test_data():
    db = SessionLocal()
    try:
        # 创建测试项目
        project = Project(name="测试项目", code="TEST001")
        db.add(project)
        db.commit()
        
        # 创建测试投手
        operator = Operator(
            name="测试投手",
            employee_id="OP001",
            project_id=project.id
        )
        db.add(operator)
        db.commit()
        
        print("测试数据创建成功")
    finally:
        db.close()
```

运行：
```bash
cd backend
python scripts/create_test_data.py
```

---

## 八、常见问题

### 8.1 Supabase 连接问题
- 检查环境变量是否正确配置
- 确认 Supabase 项目状态为 Active
- 检查网络连接和防火墙设置

### 8.2 CORS 跨域问题
- 在后端 `main.py` 中配置 CORS 中间件
- 确保前端域名在 CORS_ORIGINS 环境变量中
- **重要**：生产环境不要使用 `allow_origins=["*"]`，必须设置具体域名
- 检查浏览器控制台的 CORS 错误信息
- 验证 `Access-Control-Allow-Origin` 响应头

### 8.3 数据库查询慢
- 检查索引是否创建
- 使用 EXPLAIN ANALYZE 分析查询计划
- 考虑添加缓存层

### 8.4 部署后页面404
- 检查 Nginx 配置是否正确
- 确认前端构建文件路径
- 查看 Nginx 错误日志：`/var/log/nginx/error.log`
- 验证 Next.js 是否正常运行：`pm2 logs ai-ad-spend-frontend`
- 检查 Next.js Standalone 模式是否正确配置

### 8.5 环境变量未生效
- 确认 `.env` 文件在正确位置
- 重启服务使环境变量生效
- 使用 `printenv` 或 `echo $VAR_NAME` 验证环境变量
- 检查 `.env` 文件格式（不要有多余空格、引号）

### 8.6 数据库连接失败
- 验证 `DATABASE_URL` 格式是否正确
- 检查 Supabase 项目状态是否为 Active
- 确认数据库密码是否正确
- 检查网络连接和防火墙设置
- 尝试使用 Supabase Dashboard 的 SQL Editor 测试连接

---

## 九、后续优化

1. **性能优化**
   - 添加 Redis 缓存
   - 数据库查询优化
   - 前端代码分割和懒加载

2. **功能扩展**
   - AI 辅助诊断
   - 多租户支持
   - 移动端适配

3. **安全加固**
   - 完善 RLS 策略
   - 添加操作日志
   - 实现数据加密

---

## 十、参考资料

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [FastAPI 文档](https://fastapi.tiangolo.com)
- [Bolt.new 使用指南](https://bolt.new/docs)
- [宝塔面板文档](https://www.bt.cn/bbs/forum-40-1.html)

---

## 附录：环境变量完整列表

### 前端 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_APP_NAME=
```

### 后端 (.env)
```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_KEY=
SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=
```

---

## 十一、开发工具配置

### 11.1 IDE 配置（VSCode）

创建 `.vscode/settings.json`：

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/backend/venv/bin/python",
  "python.formatting.provider": "black",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 11.2 Git 配置

创建 `.gitignore`：

```
# 环境变量
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/

# Node
node_modules/
.next/
out/
dist/

# 日志
logs/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# 系统文件
.DS_Store
Thumbs.db
```

### 11.3 代码格式化

**Python (Black)**：
```bash
cd backend
pip install black
black app/
```

**TypeScript/React (Prettier)**：
```bash
cd frontend
npm install --save-dev prettier
npx prettier --write .
```

---

**文档版本**: v1.2  
**最后更新**: 2024-11-04  
**维护者**: 开发团队  
**更新内容**: 
- 添加 RLS 策略配置示例
- 完善 API 错误处理
- 修复 Next.js 部署配置
- 添加认证机制说明
- 添加数据库迁移指南
- 完善测试章节
- 添加 PM2 配置文件示例
- 添加开发工具配置
- **v1.2 新增**：
  - 添加渠道/代理模块（channels 表和相关接口）
  - 添加异常检测与智能对账算法详细描述
  - 添加完整的角色权限映射表和访问控制说明
  - 添加对账日志记录规范
  - 添加渠道绩效分析功能说明

