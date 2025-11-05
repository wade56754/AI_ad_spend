# 使用 Bolt.new 生成前端代码指南

## 📋 概述

Bolt.new 是一个 AI 驱动的代码生成工具，可以快速生成前端界面。本指南将帮助你使用 Bolt.new 为这个项目生成前端代码。

## 🚀 准备工作

### 1. 了解项目结构

本项目后端已完成的 API 接口：

- **投手消耗上报**: `POST /api/ad-spend`, `GET /api/ad-spend`
- **财务收支录入**: `POST /api/ledger`, `GET /api/ledger`
- **对账功能**: `POST /api/reconcile/run`, `GET /api/reconcile`, `PATCH /api/reconcile/{id}`
- **月度报表**: `POST /api/reports/monthly`
- **诊断报告**: `GET /api/reports/diagnostic`

### 2. 后端 API 文档

启动后端服务后，访问 `http://localhost:8000/docs` 查看完整的 Swagger API 文档。

## 🎯 使用 Bolt.new 的步骤

### 步骤 1: 访问 Bolt.new

1. 访问 [Bolt.new](https://bolt.new)
2. 注册/登录账号

### 步骤 2: 创建新项目

1. 点击 "New Project" 或 "Create"
2. 选择框架：**Next.js**（推荐）或 **React**
3. 选择样式：**Tailwind CSS**（与现有项目一致）

### 步骤 3: 提供项目描述

在 Bolt.new 的提示框中输入以下内容：

```
我要创建一个广告投手消耗管理系统，包含以下页面：

1. 投手消耗上报页面 (/report/spend)
   - 日期选择器
   - 项目下拉选择
   - 国家下拉选择
   - 投手ID输入
   - 平台输入
   - 金额输入(USDT)
   - 备注文本域
   - 提交按钮
   - API: POST http://localhost:8000/api/ad-spend

2. 财务收支录入页面 (/finance/ledger)
   - 日期选择器
   - 收支类型选择（收入/支出）
   - 金额输入
   - 币种选择（USDT/CNY）
   - 账户输入
   - 手续费输入
   - 项目ID输入（可选）
   - 投手ID输入（可选）
   - 备注文本域
   - 提交按钮
   - API: POST http://localhost:8000/api/ledger

3. 对账结果页面 (/reconcile)
   - 表格显示对账结果
   - 包含：投手信息、项目、日期、金额、匹配度、状态
   - 状态筛选下拉框
   - 待审核记录显示"确认匹配"按钮
   - API: GET http://localhost:8000/api/reconcile
   - API: PATCH http://localhost:8000/api/reconcile/{id}

4. 分析页面 (/analytics)
   - 月度报表生成
   - 诊断报告查看
   - API: POST http://localhost:8000/api/reports/monthly
   - API: GET http://localhost:8000/api/reports/diagnostic

5. 设置页面 (/settings)
   - 项目管理（增删改查）
   - 投手管理（增删改查）

技术栈：Next.js 14 + TypeScript + Tailwind CSS
API 基础 URL: http://localhost:8000/api
响应格式：{"data": ..., "error": null, "meta": ...}
```

### 步骤 4: 提供 API 详细信息

如果需要更详细的 API 信息，可以告诉 Bolt.new：

**API 响应格式统一为：**
```json
{
  "data": {...},
  "error": null,
  "meta": {...}
}
```

**主要 API 端点：**

1. **投手消耗上报**
   - `POST /api/ad-spend`
   - 请求体：`{spend_date, project_id, country, operator_id, platform, amount_usdt, raw_memo}`
   - 响应：`{data: {...}, error: null, meta: {...}}`

2. **财务收支录入**
   - `POST /api/ledger`
   - 请求体：`{tx_date, direction, amount, currency, account, description, fee_amount, project_id, operator_id}`
   - 响应：`{data: {...}, error: null, meta: {...}}`

3. **对账结果查询**
   - `GET /api/reconcile?status=need_review&skip=0&limit=100`
   - 响应：`{data: [...], error: null, meta: {total, skip, limit}}`

4. **确认匹配**
   - `PATCH /api/reconcile/{id}`
   - 请求体：`{status: "matched"}`

### 步骤 5: 生成并优化代码

1. Bolt.new 会生成代码，你可以：
   - 在浏览器中预览效果
   - 实时编辑和调整
   - 请求 Bolt.new 优化特定部分

2. 优化提示示例：
   - "添加表单验证"
   - "优化错误提示显示"
   - "添加加载状态"
   - "美化表格样式"

### 步骤 6: 导出代码

1. 点击 "Export" 或 "Download"
2. 选择导出格式（通常为 ZIP）
3. 解压到 `frontend` 目录

### 步骤 7: 集成到项目

1. 将 Bolt.new 生成的代码复制到 `frontend` 目录
2. 确保 `package.json` 依赖完整
3. 配置 `.env.local`：
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```
4. 安装依赖并运行：
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📝 给 Bolt.new 的详细提示词

### 完整项目描述

```
创建一个完整的广告投手消耗管理系统前端，使用 Next.js 14 App Router + TypeScript + Tailwind CSS。

后端 API 基础 URL: http://localhost:8000/api
所有 API 响应格式：{"data": ..., "error": null, "meta": ...}

页面需求：

1. 投手消耗上报页面 (/report/spend)
   - 表单字段：日期、项目（下拉）、国家（下拉）、投手ID、平台、金额(USDT)、备注
   - 表单验证：日期、项目、投手ID、金额为必填
   - 提交到 POST /api/ad-spend
   - 成功/失败提示

2. 财务收支录入页面 (/finance/ledger)
   - 表单字段：日期、收支类型（收入/支出）、金额、币种(USDT/CNY)、账户、手续费、项目ID、投手ID、备注
   - 提交到 POST /api/ledger
   - 表单验证和错误提示

3. 对账结果页面 (/reconcile)
   - 表格展示：投手、项目、日期、金额、匹配度、状态、原因
   - 状态筛选下拉（全部/已匹配/待审核）
   - 待审核记录显示"确认匹配"按钮
   - 调用 GET /api/reconcile 获取数据
   - 点击确认调用 PATCH /api/reconcile/{id} 更新状态

4. 分析页面 (/analytics)
   - 月度报表生成表单（年份、月份）
   - 诊断报告查看
   - 使用图表展示数据（可选）

5. 设置页面 (/settings)
   - 项目管理表格
   - 投手管理表格
   - 增删改查功能

设计要求：
- 使用 Tailwind CSS 现代化设计
- 响应式布局
- 统一的错误处理和提示
- 加载状态显示
- 表单验证和反馈

技术栈：
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- 使用 fetch API 调用后端
```

## 🔧 集成检查清单

生成代码后，检查以下内容：

- [ ] API 调用使用正确的 base URL
- [ ] 错误处理统一格式
- [ ] 表单验证完整
- [ ] 加载状态显示
- [ ] 响应式设计
- [ ] TypeScript 类型定义完整
- [ ] 环境变量配置正确

## 💡 优化建议

### 1. API 客户端

建议创建一个统一的 API 客户端（类似现有的 `lib/api.ts`）：

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function apiRequest<T>(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return response.json();
}
```

### 2. 类型定义

创建 TypeScript 类型文件：

```typescript
// types/api.ts
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta: any;
}

export interface AdSpend {
  id: number;
  spend_date: string;
  project_id: number;
  operator_id: number;
  amount_usdt: number;
  // ...
}
```

### 3. 错误处理

统一错误处理组件：

```typescript
// components/ErrorMessage.tsx
export function ErrorMessage({ error }: { error: string | null }) {
  if (!error) return null;
  return <div className="bg-red-50 text-red-800 p-4 rounded">{error}</div>;
}
```

## 📚 参考资源

- [Bolt.new 官方文档](https://bolt.new/docs)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- 后端 API 文档：启动后端后访问 `http://localhost:8000/docs`

## 🎯 快速开始模板

可以直接复制以下内容到 Bolt.new：

```
创建一个 Next.js 14 + TypeScript + Tailwind CSS 项目，包含以下页面：

1. /report/spend - 投手消耗上报表单
2. /finance/ledger - 财务收支录入表单  
3. /reconcile - 对账结果表格
4. /analytics - 分析报表页面
5. /settings - 设置管理页面

后端 API: http://localhost:8000/api
所有 API 返回格式: {"data": ..., "error": null, "meta": ...}

使用现代化的 UI 设计，包含表单验证、错误提示、加载状态。
```

这样 Bolt.new 就能为你生成完整的前端代码了！


