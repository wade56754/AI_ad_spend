# AI 财务与投手管理系统（前端）

基于 Next.js 14 + Supabase 的广告投手管理平台前端，实现投手日报、财务收支、渠道管理、自动对账与分析看板等核心业务。项目严格遵循 `ai_finance_devdoc_v_4.md` 与 `rules.md` 中的规范，已对接 FastAPI 后端所需的统一 API 返回格式。

## ✨ 功能总览

- **投手消耗上报**：录入日期、项目、平台、金额、备注等字段，支持异常预警提醒。
- **财务收支录入**：收入 / 支出、币种、账户、手续费等多维度信息管理。
- **渠道管理**：渠道列表维护、返点率、状态切换以及备注管理。
- **自动对账**：基于金额差、日期差的匹配结果展示与过滤（待接后端终端数据）。
- **权限与导航**：基于 Supabase Auth + 角色控制动态显示菜单（管理员、财务、投手等）。
- **运营分析**：投手与项目维度的月度趋势图表展示（Recharts）。

## 🧱 技术栈

| 层级 | 技术 | 说明 |
| --- | --- | --- |
| 框架 | [Next.js 14 App Router](https://nextjs.org) | 路由、服务端组件、Server Actions |
| UI | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) | 无内联样式，实现统一设计体系 |
| 状态 | React Hooks + Context | 轻量级状态管理、封装 `useApi`/`useCurrentUser` |
| 数据 | Supabase Auth & Storage | 用户认证、静态资产 |
| 网络 | `lib/api.ts` | 统一 `fetch` 请求封装，固定 `{ data, error }` 输出 |
| 图表 | [Recharts](https://recharts.org) | 运营报表展示 |

## 📁 目录结构

```
frontend/
├── app/
│   ├── (auth)/login/page.tsx            # 登录页面
│   ├── (protected)/                    # 受保护业务路由
│   │   ├── layout.tsx                  # 鉴权 & 布局注入 AppShell
│   │   ├── page.tsx                    # 仪表盘
│   │   ├── report/spend/page.tsx       # 投手日报上报
│   │   ├── finance/ledger/page.tsx     # 财务收支录入
│   │   ├── reconcile/page.tsx          # 自动对账结果
│   │   ├── analytics/page.tsx          # 数据分析
│   │   └── settings/...                # 项目 / 渠道 / 投手 / 角色管理
│   └── layout.tsx                      # 根布局，挂载 AppShell
├── components/
│   ├── layout/                         # AppShell + Sidebar + Header
│   ├── features/                       # 各业务模块组件（表单/表格/图表）
│   └── ui/                             # shadcn/ui 封装组件
├── hooks/                              # `useApi`, `useCurrentUser`
├── lib/
│   ├── api.ts                          # fetch 封装
│   ├── api/*.ts                        # 业务级 API helper（可选）
│   └── supabase/*                      # Supabase 客户端
├── types/                              # 统一 TypeScript 类型定义
├── middleware.ts                       # Supabase Auth 中间件
├── tailwind.config.ts
└── pnpm-lock.yaml / package.json
```

> **提示**：后端（FastAPI + SQLAlchemy + Supabase）位于独立仓库，确保接口路径、权限返回结构与本前端保持一致。

## 🚀 快速开始

```bash
# 安装依赖（推荐使用 pnpm）
cd frontend
pnpm install

# 复制环境变量模板
cp .env.example .env.local

# 启动开发服务器
pnpm dev
```

默认访问地址：[http://localhost:3000](http://localhost:3000)

### 必填环境变量

`.env.local` 中需配置以下字段（上线时请使用安全的生产值）：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_SUPABASE_URL=https://<your-supabase-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-or-publishable-key>
```

> **注意**：禁止硬编码后端域名，所有请求必须使用 `NEXT_PUBLIC_API_BASE_URL`。Supabase 使用 publishable key（兼容旧 anon key）。

## 🧩 开发规范

- **UI**：仅允许 Tailwind + shadcn/ui，禁止内联样式。
- **请求**：统一通过 `lib/api.ts -> apiRequest()`，返回 `{ data, error }`。
- **类型**：所有接口类型集中存放在 `types/`，禁止在组件内临时声明重复接口。
- **权限**：`useCurrentUser` + `AppSidebar` 实现菜单和路由的角色控制；(protected)/layout 会请求 `/api/me`。
- **目录**：遵循 `cursor_project_rules/knowledge_base.md` 与 `implementation-plan.mdc` 中的目录约束。

## 🔌 接口约定

后端接口统一响应结构：

```json
{
  "data": ..., 
  "error": null,
  "meta": {},
  "warning": "可选的业务提醒"
}
```

前端 `useApi` 按照该格式自动处理 loading / error / 数据状态。

业务接口示例：

- `POST /api/ad-spend` 投手日报上报（触发 30% 波动时返回 `warning`）
- `POST /api/ledger` 财务收支录入
- `GET /api/channels` 渠道列表
- `GET /api/reconcile` 自动对账结果（支持 status/date 过滤）
- `GET /api/reports/monthly` 运营分析数据
- `GET /api/me` 当前用户角色与权限

## 📦 部署建议

1. 生产部署前运行 `pnpm build` 验证构建。
2. 使用 Vercel / Supabase Hosting 或自建环境部署静态产物。
3. 配置如下环境变量：
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-domain>/api`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 若需接入服务器端渲染 Auth，中间件已默认启用 Supabase Helper。

## 🤝 协作与文档

- 项目规则：`cursor_project_rules/knowledge_base.md`
- 开发计划：`implementation-plan.mdc`
- 任务分工：Claude（后端）、bolt.new（前端原型）、Cursor（集成与部署）

欢迎根据业务场景扩展页面或组件。提交前请执行 `pnpm lint` 并确保遵循上述规范。
