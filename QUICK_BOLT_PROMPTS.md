# Bolt.new 快速提示词

## 🚀 快速开始（5个页面，逐个生成）

### 1️⃣ 投手上报页面

```
创建一个广告投手消耗上报页面，Next.js 14 + TypeScript + Tailwind CSS。

页面路径：/report/spend

功能：
1. 上报表单：
   - 日期选择器（默认今天）
   - 项目下拉（从 GET /api/projects 获取）
   - 国家输入框（如 US, UK）
   - 投手下拉（从 GET /api/operators 获取）
   - 平台下拉（Facebook, Google, TikTok, Twitter）
   - 消耗金额（数字输入，必填，>0）
   - 备注（多行文本，可选）

2. 历史记录列表：
   - 显示最近 10 条记录
   - 从 GET /api/ad-spend 获取
   - 显示：日期、项目、平台、金额、状态
   - 状态颜色：pending(黄), matched(绿), need_review(红)

3. API 集成：
   提交到 POST http://localhost:8000/api/ad-spend
   请求体：
   {
     "spend_date": "2024-01-15",
     "project_id": 1,
     "country": "US",
     "operator_id": 1,
     "platform": "Facebook",
     "amount_usdt": 100.50,
     "raw_memo": "备注"
   }
   
   响应格式：{"data": {...}, "error": null, "meta": {}}

UI要求：
- 左边表单，右边历史记录（桌面端）
- 移动端上下布局
- 使用卡片布局
- 添加加载状态和错误提示
- 成功后清空表单
```

---

### 2️⃣ 财务录入页面

```
创建一个财务收支录入页面，Next.js 14 + TypeScript + Tailwind CSS。

页面路径：/finance/ledger

功能：
1. 录入表单：
   - 交易日期（日期选择器）
   - 收支方向（单选：expense-支出 / income-收入）
   - 金额（数字，必填）
   - 货币（下拉：USDT, CNY, USD）
   - 账户（输入框，如"Meta Ads"）
   - 描述（多行文本，必填）
   - 手续费（数字，默认0）
   - 关联项目（下拉，可选）
   - 关联投手（下拉，可选）

2. 记录列表：
   - 显示最近 20 条记录
   - 从 GET /api/ledger 获取
   - 支持按日期、方向筛选
   - 显示统计：总收入、总支出、净收入
   - 收入行绿色背景，支出行红色背景

3. API 集成：
   提交到 POST http://localhost:8000/api/ledger
   请求体：
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
   
   响应格式：{"data": {...}, "error": null, "meta": {}}

UI要求：
- 表单在上方
- 列表在下方，使用表格
- 添加筛选器
- 实时显示统计数据
```

---

### 3️⃣ 对账管理页面

```
创建一个对账管理页面，Next.js 14 + TypeScript + Tailwind CSS。

页面路径：/reconcile

功能：
1. 顶部操作区：
   - "执行对账"按钮（调用 POST /api/reconcile/run）
   - 显示统计卡片：已匹配、待审核、未匹配数量

2. 对账结果表格：
   - 从 GET /api/reconciliation?status=xxx 获取
   - 显示列：
     * 投手消耗：投手名、项目、日期、金额
     * 财务记录：财务日期、金额
     * 匹配信息：匹配分数、金额差、日期差
     * 状态、原因
   - 状态筛选器（全部/matched/need_review/unmatched）

3. 待审核操作：
   - need_review 状态显示"确认匹配"按钮
   - 点击调用 PATCH /api/reconciliation/{id}
   - 请求体：{"status": "matched"}

执行对账 API：
POST http://localhost:8000/api/reconcile/run
响应：{
  "data": {
    "matched": 5,
    "need_review": 2,
    "total_processed": 10
  },
  "error": null,
  "meta": {}
}

UI要求：
- 3个统计卡片在顶部
- 对账按钮显眼
- 表格清晰展示匹配信息
- 待审核记录高亮显示
```

---

### 4️⃣ 月度分析页面

```
创建一个月度分析报表页面，Next.js 14 + TypeScript + Tailwind CSS + Chart.js。

页面路径：/analytics

功能：
1. 时间选择：
   - 年份选择
   - 月份选择
   - "生成报表"按钮

2. 数据概览卡片：
   - 总收入、总支出、净利润、ROI
   - 4个卡片横向排列

3. 项目绩效表格：
   - 字段：项目名、收入、广告支出、手续费、人力、利润、ROI
   - 按 ROI 排序
   - ROI 颜色：>50%绿、20-50%黄、<20%红

4. 投手绩效表格：
   - 字段：投手名、项目、收入、支出、工资、利润、ROI

5. 图表（Chart.js）：
   - 饼图：各项目收入占比
   - 柱状图：各项目利润对比

6. 诊断报告：
   - 从 GET /api/analytics/diagnostic 获取
   - 显示 AI 分析文本

生成报表 API：
POST http://localhost:8000/api/reports/monthly
请求体：{"year": 2024, "month": 1}
响应：{
  "data": {
    "summary": {...},
    "projects": [...],
    "operators": [...]
  },
  "error": null,
  "meta": {}
}

UI要求：
- 响应式网格布局
- 数据可视化清晰
- 表格支持排序
```

---

### 5️⃣ 设置管理页面

```
创建一个设置管理页面，Next.js 14 + TypeScript + Tailwind CSS。

页面路径：/settings

使用标签页布局，3个标签：

标签1: 项目管理
- 项目列表表格
- 字段：名称、代码、描述、状态
- 操作：新增、编辑、删除、启用/禁用
- API：
  * GET /api/projects - 获取列表
  * POST /api/projects - 创建
  * PUT /api/projects/{id} - 更新
  * DELETE /api/projects/{id} - 删除

标签2: 投手管理
- 投手列表表格
- 字段：姓名、工号、项目、角色、状态
- 操作：新增、编辑、删除、启用/禁用
- API：
  * GET /api/operators - 获取列表
  * POST /api/operators - 创建
  * PUT /api/operators/{id} - 更新
  * DELETE /api/operators/{id} - 删除

标签3: 系统配置
- 对账规则设置
- 通知设置

UI要求：
- 使用标签组件切换
- 表格布局
- 添加/编辑用弹窗
- 删除需确认
```

---

## 🎯 使用步骤

1. **打开 Bolt.new**
   - 访问 https://bolt.new
   - 注册/登录

2. **创建项目**
   - 选择 Next.js 框架
   - 选择 TypeScript + Tailwind CSS

3. **逐个生成页面**
   - 复制上面的提示词
   - 粘贴到 Bolt.new
   - 等待生成和预览
   - 测试功能
   - 下载代码

4. **集成到项目**
   - 将生成的代码复制到 `with-supabase-app/app/` 对应目录
   - 调整导入路径
   - 测试 API 连接

## 💡 优化技巧

### 生成后优化提示词：

```
请优化这个页面：
1. 添加骨架屏加载状态
2. 改进错误提示样式
3. 添加表单验证提示
4. 优化移动端布局
5. 添加图标和动画
```

### 调整样式：

```
请调整页面样式：
- 使用蓝色主题（#3B82F6）
- 圆角改为 8px
- 增加阴影效果
- 优化按钮样式
```

### 添加功能：

```
请添加以下功能：
- 导出 CSV 功能
- 打印功能
- 批量操作
- 搜索和筛选
```

---

## 📚 API 基础信息（所有提示词通用）

**后端地址**: `http://localhost:8000/api`

**统一响应格式**:
```json
{
  "data": { ... },
  "error": null,
  "meta": { ... }
}
```

**统一错误处理**:
```typescript
const response = await fetch('http://localhost:8000/api/xxx', {...});
const result = await response.json();

if (result.error) {
  // 显示错误：result.error
} else {
  // 使用数据：result.data
}
```

**已有 API 端点**:
- `/api/projects` - 项目管理
- `/api/operators` - 投手管理
- `/api/ad-spend` - 消耗上报
- `/api/ledger` - 财务记录
- `/api/reconciliation` - 对账结果
- `/api/reconcile/run` - 执行对账
- `/api/reports/monthly` - 月度报表
- `/api/analytics/diagnostic` - 诊断报告

现在可以直接复制这些提示词到 Bolt.new 开始生成页面了！
