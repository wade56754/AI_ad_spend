# AI 财务与投手管理系统 - 协同开发计划 v4  
（Claude Code × Cursor × bolt.new × Supabase × 宝塔）

---

## 🧭 一、开发目标概述

本项目的核心目标是：
1. 构建一个 Web 端财务与投手管理系统；
2. 自动化处理广告投手日报、财务收支、渠道管理与对账；
3. 利用 AI 协作（Claude、Cursor、bolt.new）实现快速、低误差开发；
4. 最终部署在宝塔服务器环境中。

---

## 🧩 二、AI 协作架构

| 工具 | 职责 | 输入内容 | 输出结果 | 协作方式 |
|------|------|-----------|-----------|-----------|
| **Claude Code** | 负责后端逻辑（FastAPI API / 数据模型 / Schema） | 接口说明、字段定义、逻辑描述 | Python 模块（routers、models、schemas） | 生成代码后，交由 Cursor 集成 |
| **bolt.new** | 负责前端页面原型（Next.js + Tailwind） | 页面路径、字段结构、布局要求 | 生成完整页面骨架 | 输出后交由 Cursor 重构 |
| **Cursor** | 主控与集成（整合前后端） | Claude 与 bolt.new 的代码 | 调试、重构、API 统一、部署配置 | 最终生成项目成品 |

### ✳️ 协作规则：
1. **Claude Code** 不写前端，不建表，只负责逻辑；
2. **bolt.new** 不写 fetch，只负责 UI；
3. **Cursor** 统一接口路径、命名规范、权限判断；
4. 每个阶段完成后，使用 Cursor 验证运行结果；
5. 所有修改必须遵循 `AI_Finance_Operator_System_DevDoc_v4.md`。

---

## 🧱 三、阶段划分与任务清单

### 第一阶段：环境与数据库初始化（1-2天）

**目标：**
- 配置项目仓库；
- Supabase 创建数据库；
- 初始化 RLS 策略。

**执行步骤：**
1. 在 Cursor 中创建新项目 `ai-finance-system`；
2. 新建 `.env` 文件：
   ```
   NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com/api
   SUPABASE_URL=xxx
   SUPABASE_ANON_KEY=xxx
   ```
3. 在 Supabase 中建表（projects, operators, ad_spend_daily, ledger_transactions, channels）；
4. 启用 RLS（Role-Level Security）；
5. 通过 SQL Editor 创建基础索引；
6. 验证数据库连接是否可用。

---

### 第二阶段：后端 API 开发（Claude 主导，3天）

**任务分配：**
| 模块 | Claude Code 提示语 | 说明 |
|------|---------------------|------|
| 投手日报 | 生成 `/api/ad-spend` 模块 | POST/GET + 波动检测（30%） |
| 财务收支 | 生成 `/api/ledger` 模块 | 收入支出录入接口 |
| 渠道管理 | 生成 `/api/channels` 模块 | 新增/查询/更新/删除渠道 |
| 对账分析 | 生成 `/api/reconcile` 模块 | 自动匹配算法（金额差≤5%且日期差≤1天） |

**Claude Code 指令模板：**
```
请帮我生成 FastAPI 路由模块 ad_spend.py：
要求：
- 路径前缀 /api/ad-spend
- 支持 POST/GET
- 字段：spend_date, project_id, operator_id, channel_id, platform, amount_usdt, remark
- 检测与上一条记录差异 >30% 时返回 warning
- 返回格式 {data, error, meta, warning}
```

完成后 Claude 输出的代码由 **Cursor** 整合到项目结构中：

```
backend/app/
├── routers/
│   ├── ad_spend.py
│   ├── ledger.py
│   ├── channels.py
│   └── reconcile.py
└── schemas/
```

---

### 第三阶段：前端页面原型开发（bolt.new 主导，2天）

**目标：**  
生成 3 个主要页面骨架，方便 Cursor 接入。

| 页面路径 | 功能描述 | bolt.new Prompt |
|-----------|-----------|----------------|
| `/report/spend` | 投手日报上报 | “生成投手广告消耗上报页面（含日期、项目、渠道、金额、平台、备注、右侧历史列表）” |
| `/finance/ledger` | 财务录入页面 | “生成财务收支录入页面，支持导入、自动分类、批量提交” |
| `/settings/channels` | 渠道管理页面 | “生成渠道管理页面，可增删改查，表格展示，户管和管理员可访问” |

bolt 输出后 → 粘贴进 Cursor → 执行以下命令：

```
请重构该页面：
1. 将所有 fetch 调用提取到 lib/api.ts；
2. 添加 useAuth 权限控制；
3. API 根路径从 process.env 读取；
4. 保留 Tailwind 样式；
5. 组件目录放入 app/... 对应位置。
```

---

### 第四阶段：系统集成与权限实现（Cursor 主导，3天）

**任务目标：**
- 将后端 API 与前端页面整合；
- 实现 Supabase Auth 用户认证；
- 设置角色访问控制。

**Cursor 操作指令：**
```
请为该 Next.js 项目添加 Supabase Auth 支持：
- 用户表使用 Supabase 内置 auth.users；
- 登录后返回用户角色；
- 未登录访问自动跳转 /login；
- 不同角色仅显示对应页面。
```

完成后验证：
- 投手只能访问 /report/spend；
- 财务能访问 /finance；
- 户管能访问 /settings/channels；
- 管理员能访问所有内容。

---

### 第五阶段：部署与测试（2-3天）

**部署步骤（宝塔环境）：**
1. 上传前后端项目；
2. 安装依赖并构建：
   ```bash
   npm install && npm run build
   pm2 start "npm run start" --name ai-frontend
   ```
   ```bash
   pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name ai-api
   ```
3. 配置 Nginx：
   ```nginx
   location /api/ {
       proxy_pass http://127.0.0.1:8000/;
   }
   location / {
       proxy_pass http://127.0.0.1:3000/;
   }
   ```
4. 启动 HTTPS 并测试路由；
5. 测试各角色权限、日报提交、异常检测、对账算法。

---

## 📈 六、AI 协作节奏表（按日执行）

| 天数 | 工具 | 任务 | 输出结果 |
|------|------|------|----------|
| 第1天 | Cursor + Supabase | 创建数据库表、配置环境变量 | 数据库可连接，表结构创建成功 |
| 第2天 | Claude Code | 生成 `/api/ad-spend` `/api/ledger` 模块 | 可用 FastAPI 接口 |
| 第3天 | Claude Code | 生成 `/api/channels` `/api/reconcile` 模块 | 对账逻辑可运行 |
| 第4天 | bolt.new | 生成投手日报与财务录入页面 | 页面 UI 骨架 |
| 第5天 | Cursor | 重构 bolt 页面、接入后端 | 前端可展示真实数据 |
| 第6天 | Cursor | 实现权限系统 + Auth | 不同角色访问受控 |
| 第7天 | Cursor | 统一部署配置 | 系统上线测试 |

---

## 🧠 七、开发提示建议

- **Claude Code：**  
  - 一次生成一个模块，不要整包生成；  
  - 明确字段、路径、返回结构；
  - 每完成一个模块都输出 Schema + 路由示例。

- **bolt.new：**  
  - 提示语包含路径、布局、交互逻辑；
  - 一次生成一个页面骨架。

- **Cursor：**  
  - 保持结构化指令；
  - 每次整合 Claude 与 bolt 输出后立刻重构；
  - 保留项目规则文档。

---

## ✅ 八、完成验收标准

1. 所有页面均可访问；
2. 日报上报支持自动检测波动；
3. 财务录入能实时更新；
4. 渠道管理能增删改查；
5. 对账模块能自动匹配；
6. 不同角色访问权限正确；
7. 部署运行稳定无报错。

---

## 📘 文档信息
**版本：** v4.0  
**最后更新：** 2025-11-07  
**作者：** 系统开发协调文档（AI 协作版）  
**适用：** Claude Code + Cursor + bolt.new + Supabase + 宝塔

