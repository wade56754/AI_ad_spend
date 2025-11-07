# Bolt.new 提示词 - 业务页面开发

## 项目背景信息

在使用任何提示词前，先提供项目上下文：

```
项目名称：广告投手消耗上报系统
技术栈：Next.js 14 + TypeScript + Tailwind CSS + Supabase
后端 API：http://localhost:8000/api
主要功能：投手上报、财务录入、自动对账、月度分析
用户角色：投手、财务、管理员
```

---

## 1. 投手上报页面 (/report/spend)

### 提示词模板

```
请帮我创建一个广告投手消耗上报页面，使用 Next.js 14 + TypeScript + Tailwind CSS。

【页面需求】
1. 页面路径：/report/spend
2. 页面标题："广告消耗上报"

【功能需求】
1. 表单字段：
   - 上报日期 (spend_date): 日期选择器，默认今天
   - 项目 (project_id): 下拉选择，从 API 获取项目列表
   - 国家 (country): 输入框，如 US, UK, CN
   - 投手 (operator_id): 下拉选择，从 API 获取投手列表
   - 平台 (platform): 下拉选择 (Facebook, Google, TikTok, Twitter)
   - 消耗金额 (amount_usdt): 数字输入，保留两位小数，必填
   - 备注 (raw_memo): 多行文本框，可选

2. 表单验证：
   - 所有必填字段不能为空
   - 金额必须大于 0
   - 日期不能晚于今天

3. 数据提交：
   - 提交到：POST http://localhost:8000/api/ad-spend
   - 请求格式：JSON
   - 成功后显示成功提示并清空表单
   - 失败后显示错误信息

4. 历史记录：
   - 显示最近 10 条上报记录
   - 从 GET http://localhost:8000/api/ad-spend 获取
   - 显示：日期、项目、平台、金额、状态
   - 状态用不同颜色标记：pending(黄色), matched(绿色), need_review(红色)

【UI 设计】
- 使用现代化卡片布局
- 表单和历史记录分两栏显示（桌面端）
- 移动端自适应为单栏
- 使用 shadcn/ui 组件风格
- 添加加载状态和错误处理

【API 接口格式】
提交接口：
POST /api/ad-spend
Content-Type: application/json

{
  "spend_date": "2024-01-15",
  "project_id": 1,
  "country": "US",
  "operator_id": 1,
  "platform": "Facebook",
  "amount_usdt": 100.50,
  "raw_memo": "测试消耗"
}

响应格式：
{
  "data": { ...创建的记录 },
  "error": null,
  "meta": {}
}

请生成完整的页面代码，包括类型定义和错误处理。
```

---

## 2. 财务录入页面 (/finance/ledger)

### 提示词模板

```
请帮我创建一个财务收支录入页面，使用 Next.js 14 + TypeScript + Tailwind CSS。

【页面需求】
1. 页面路径：/finance/ledger
2. 页面标题："财务收支录入"

【功能需求】
1. 表单字段：
   - 交易日期 (tx_date): 日期选择器，默认今天
   - 方向 (direction): 单选按钮 (expense-支出, income-收入)
   - 金额 (amount): 数字输入，必填
   - 货币 (currency): 下拉选择 (USDT, CNY, USD)
   - 账户 (account): 输入框，如 "Meta Ads", "Bank Account"
   - 描述 (description): 多行文本框，必填
   - 手续费 (fee_amount): 数字输入，默认 0
   - 关联项目 (project_id): 下拉选择，可选
   - 关联投手 (operator_id): 下拉选择，可选

2. 智能提示：
   - 根据账户名称自动建议常用账户
   - 支出金额用红色显示，收入用绿色显示
   - 实时计算净额（金额 - 手续费）

3. 数据提交：
   - 提交到：POST http://localhost:8000/api/ledger
   - 成功后显示成功提示并清空表单
   - 失败后显示错误信息

4. 财务记录列表：
   - 显示最近 20 条记录
   - 从 GET http://localhost:8000/api/ledger 获取
   - 支持按日期、方向、项目筛选
   - 显示统计：总收入、总支出、净收入

【UI 设计】
- 表单区域在上方
- 收支记录列表在下方
- 使用表格展示记录
- 收入行用浅绿色背景，支出行用浅红色背景
- 添加筛选器和搜索功能

【API 接口格式】
提交接口：
POST /api/ledger
Content-Type: application/json

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

响应格式：
{
  "data": { ...创建的记录 },
  "error": null,
  "meta": {}
}

请生成完整的页面代码，包括类型定义和筛选逻辑。
```

---

## 3. 对账页面 (/reconcile)

### 提示词模板

```
请帮我创建一个对账管理页面，使用 Next.js 14 + TypeScript + Tailwind CSS。

【页面需求】
1. 页面路径：/reconcile
2. 页面标题："对账管理"

【功能需求】
1. 对账操作区：
   - "执行对账" 按钮：触发自动对账
   - 显示上次对账时间
   - 显示对账统计：已匹配、待审核、未匹配

2. 对账结果列表：
   - 从 GET http://localhost:8000/api/reconciliation 获取
   - 显示字段：
     * 投手信息：投手名称、项目、日期、消耗金额
     * 财务信息：财务日期、金额
     * 匹配信息：匹配分数、金额差异、日期差异
     * 状态：matched(已匹配), need_review(待审核), unmatched(未匹配)
     * 原因说明

3. 状态筛选：
   - 全部、已匹配、待审核、未匹配

4. 待审核操作：
   - 对于 need_review 状态的记录，显示"确认匹配"按钮
   - 点击后调用 PATCH http://localhost:8000/api/reconciliation/{id}
   - 将状态更新为 matched

5. 详情查看：
   - 点击记录展开详情
   - 显示完整的投手上报和财务记录信息
   - 显示匹配规则说明

【UI 设计】
- 顶部显示对账统计卡片（3个卡片：已匹配、待审核、未匹配）
- 对账按钮显眼位置，加载时显示动画
- 列表使用表格或卡片布局
- 状态用不同颜色标记
- 待审核的记录高亮显示

【API 接口格式】
执行对账：
POST /api/reconcile/run

响应：
{
  "data": {
    "matched": 5,
    "need_review": 2,
    "total_processed": 10
  },
  "error": null,
  "meta": {}
}

获取对账结果：
GET /api/reconciliation?status=need_review

确认匹配：
PATCH /api/reconciliation/{id}
Content-Type: application/json

{
  "status": "matched"
}

请生成完整的页面代码，包括状态管理和交互逻辑。
```

---

## 4. 月度分析页面 (/analytics)

### 提示词模板

```
请帮我创建一个月度分析报表页面，使用 Next.js 14 + TypeScript + Tailwind CSS + Chart.js。

【页面需求】
1. 页面路径：/analytics
2. 页面标题："月度分析报表"

【功能需求】
1. 时间选择器：
   - 年份选择
   - 月份选择
   - "生成报表" 按钮

2. 数据概览卡片（4个）：
   - 总收入 (CNY)
   - 总支出 (CNY)
   - 净利润 (CNY)
   - ROI (投资回报率)

3. 项目绩效表格：
   - 显示所有项目的绩效数据
   - 字段：项目名称、收入、广告支出、手续费、人力成本、利润、ROI
   - 支持按 ROI 排序
   - ROI 用颜色表示：>50%绿色、20-50%黄色、<20%红色

4. 投手绩效表格：
   - 显示所有投手的绩效数据
   - 字段：投手名称、负责项目、收入、支出、工资、利润、ROI
   - 支持按利润排序

5. 可视化图表（使用 Chart.js）：
   - 饼图：各项目收入占比
   - 柱状图：各项目利润对比
   - 折线图：月度趋势（如果有历史数据）

6. 诊断报告：
   - 从 GET http://localhost:8000/api/analytics/diagnostic 获取
   - 显示 AI 生成的诊断分析
   - 分点显示：总体情况、盈利项目、问题项目、投手分析、建议

【UI 设计】
- 顶部：时间选择器和生成按钮
- 第一行：4个数据卡片
- 第二行：项目绩效表格
- 第三行：投手绩效表格
- 第四行：可视化图表（2-3个图表）
- 第五行：诊断报告卡片
- 使用网格布局，响应式设计

【API 接口格式】
生成月度报告：
POST /api/reports/monthly
Content-Type: application/json

{
  "year": 2024,
  "month": 1
}

响应：
{
  "data": {
    "summary": {
      "total_income": 50000,
      "total_spend": 30000,
      "total_profit": 15000,
      "roi": 50.0
    },
    "projects": [...],
    "operators": [...]
  },
  "error": null,
  "meta": {}
}

获取诊断报告：
GET /api/analytics/diagnostic?year=2024&month=1

请生成完整的页面代码，包括图表配置和数据处理逻辑。
```

---

## 5. 设置管理页面 (/settings)

### 提示词模板

```
请帮我创建一个设置管理页面，使用 Next.js 14 + TypeScript + Tailwind CSS。

【页面需求】
1. 页面路径：/settings
2. 页面标题："系统设置"

【功能需求】
使用标签页布局，包含 3 个标签：

### 标签 1: 项目管理
1. 项目列表：
   - 显示所有项目
   - 字段：项目名称、项目代码、描述、状态
   - 操作：编辑、删除、启用/禁用

2. 添加项目：
   - 表单：项目名称、项目代码、描述
   - 提交到：POST /api/projects

### 标签 2: 投手管理
1. 投手列表：
   - 显示所有投手
   - 字段：姓名、工号、关联项目、角色、状态
   - 操作：编辑、删除、启用/禁用

2. 添加投手：
   - 表单：姓名、工号、关联项目、角色
   - 提交到：POST /api/operators

### 标签 3: 系统配置
1. 对账规则设置：
   - 日期差异容忍度（天）
   - 金额差异容忍度（USDT）
   - 自动匹配开关

2. 通知设置：
   - 邮件通知开关
   - 通知邮箱地址
   - 通知事件选择

【UI 设计】
- 使用 shadcn/ui 的 Tabs 组件
- 每个标签内容独立
- 列表使用表格布局
- 添加/编辑使用弹窗或侧边栏
- 确认删除操作

【API 接口示例】
添加项目：
POST /api/projects
Content-Type: application/json

{
  "name": "新项目",
  "code": "PROJ003",
  "description": "项目描述",
  "status": "active"
}

更新项目：
PUT /api/projects/{id}

删除项目：
DELETE /api/projects/{id}

请生成完整的设置页面代码，包括标签切换和 CRUD 操作。
```

---

## 通用技巧和注意事项

### 1. 基础设置提示词

在开始任何页面前，先让 Bolt.new 了解项目基础：

```
我正在开发一个 Next.js 14 + TypeScript 项目，使用 Tailwind CSS 和 Supabase。

项目结构：
- app/ 目录使用 App Router
- 使用 TypeScript 严格模式
- API 调用统一使用 fetch
- 后端 API 地址：http://localhost:8000/api
- 统一响应格式：{ data, error, meta }

请帮我设置项目基础配置。
```

### 2. 分步开发策略

不要一次性要求所有功能，分步骤进行：

**第一步**：创建基础页面布局
**第二步**：添加表单和验证
**第三步**：集成 API 调用
**第四步**：添加列表展示
**第五步**：优化 UI 和交互

### 3. 常用补充提示词

**添加加载状态**：
```
请为所有 API 调用添加加载状态，使用骨架屏或 spinner。
```

**添加错误处理**：
```
请添加完善的错误处理，包括网络错误、验证错误、服务器错误，并友好显示给用户。
```

**优化 UI**：
```
请优化页面 UI，使用现代化设计，添加图标、动画效果，提升用户体验。
```

**添加响应式**：
```
请确保页面在移动端、平板端、桌面端都有良好的显示效果。
```

### 4. API 调用模板

可以提供一个统一的 API 调用工具函数：

```typescript
// lib/api.ts
export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`http://localhost:8000${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return { data: null, error: result.error || '请求失败' };
    }
    
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: '网络错误' };
  }
}
```

---

## 完整工作流程

### 开发单个页面的完整流程：

1. **准备阶段**
   ```
   打开 bolt.new
   提供项目上下文
   说明技术栈和 API 格式
   ```

2. **创建页面**
   ```
   使用上面的具体页面提示词
   Bolt.new 会生成代码并预览
   ```

3. **测试和调整**
   ```
   在 Bolt.new 中测试功能
   根据需要调整 UI 和逻辑
   ```

4. **导出代码**
   ```
   下载生成的代码
   复制到项目的 app/ 目录
   调整导入路径和配置
   ```

5. **集成测试**
   ```
   在本地项目中测试
   连接真实 API
   修复可能的问题
   ```

---

## 示例：快速创建投手上报页面

### 完整提示词（可直接复制）

```
我需要创建一个广告投手消耗上报页面。

【技术要求】
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- React Hook Form + Zod 验证

【页面功能】
页面路径：/report/spend

1. 上报表单包含：
   - 日期选择（默认今天）
   - 项目下拉选择
   - 国家输入（US, UK, CN）
   - 投手下拉选择  
   - 平台下拉（Facebook, Google, TikTok）
   - 消耗金额（必填，>0）
   - 备注（可选）

2. 历史记录表格：
   - 显示最近10条记录
   - 字段：日期、项目、平台、金额、状态
   - 状态颜色：pending黄色、matched绿色

3. API集成：
   - 提交：POST http://localhost:8000/api/ad-spend
   - 查询：GET http://localhost:8000/api/ad-spend
   - 响应格式：{ data, error, meta }

4. UI要求：
   - 左右布局（桌面）/ 上下布局（移动）
   - 使用卡片组件
   - 添加加载和错误状态
   - 提交成功后清空表单

请生成完整代码。
```

使用这些提示词，Bolt.new 会生成高质量的页面代码，你可以直接使用或稍作调整后集成到项目中。
