# API 接口文档（供 Bolt.new 使用）

本文档包含所有 API 接口的详细信息，可以直接提供给 Bolt.new 用于生成前端代码。

## 基础信息

- **API Base URL**: `http://localhost:8000/api`
- **响应格式**: 统一为 `{"data": ..., "error": null, "meta": ...}`
- **Content-Type**: `application/json`

## 1. 投手消耗上报

### 创建消耗上报
**POST** `/api/ad-spend`

**请求体**:
```json
{
  "spend_date": "2024-11-04",
  "project_id": 1,
  "country": "美国",
  "operator_id": 1,
  "platform": "Facebook",
  "amount_usdt": 100.50,
  "raw_memo": "备注信息"
}
```

**响应示例**:
```json
{
  "data": {
    "id": 1,
    "spend_date": "2024-11-04",
    "project_id": 1,
    "country": "美国",
    "operator_id": 1,
    "platform": "Facebook",
    "amount_usdt": 100.50,
    "raw_memo": "备注信息",
    "status": "pending",
    "created_at": "2024-11-04T12:00:00Z"
  },
  "error": null,
  "meta": {
    "message": "消耗上报创建成功"
  }
}
```

### 查询消耗上报列表
**GET** `/api/ad-spend?skip=0&limit=100&project_id=1&operator_id=1&start_date=2024-11-01&end_date=2024-11-30`

**查询参数**:
- `skip`: 跳过记录数（默认 0）
- `limit`: 返回记录数（默认 100，最大 1000）
- `project_id`: 项目ID筛选（可选）
- `operator_id`: 投手ID筛选（可选）
- `start_date`: 开始日期（可选）
- `end_date`: 结束日期（可选）

**响应示例**:
```json
{
  "data": [
    {
      "id": 1,
      "spend_date": "2024-11-04",
      "project_id": 1,
      "operator_id": 1,
      "amount_usdt": 100.50,
      "status": "pending",
      "created_at": "2024-11-04T12:00:00Z"
    }
  ],
  "error": null,
  "meta": {
    "total": 50,
    "skip": 0,
    "limit": 100,
    "has_more": false
  }
}
```

## 2. 财务收支录入

### 创建财务记录
**POST** `/api/ledger`

**请求体**:
```json
{
  "tx_date": "2024-11-04",
  "direction": "expense",
  "amount": 1000.00,
  "currency": "USDT",
  "account": "主账户",
  "description": "广告支出",
  "fee_amount": 10.00,
  "project_id": 1,
  "operator_id": 1
}
```

**direction 可选值**: `"income"` 或 `"expense"`  
**currency 可选值**: `"USDT"` 或 `"CNY"`

**响应示例**:
```json
{
  "data": {
    "id": 1,
    "tx_date": "2024-11-04",
    "direction": "expense",
    "amount": 1000.00,
    "currency": "USDT",
    "status": "pending",
    "created_at": "2024-11-04T12:00:00Z"
  },
  "error": null,
  "meta": {
    "message": "财务记录创建成功"
  }
}
```

### 查询财务记录列表
**GET** `/api/ledger?skip=0&limit=100&direction=expense&project_id=1`

**查询参数**:
- `skip`: 跳过记录数
- `limit`: 返回记录数
- `direction`: 方向筛选（`income` 或 `expense`）
- `project_id`: 项目ID筛选
- `operator_id`: 投手ID筛选
- `start_date`: 开始日期
- `end_date`: 结束日期

## 3. 对账功能

### 执行对账
**POST** `/api/reconcile/run`

**响应示例**:
```json
{
  "data": {
    "matched_count": 10,
    "unmatched_count": 2,
    "total_processed": 12,
    "processed_spend_ids": [1, 2, 3]
  },
  "error": null,
  "meta": {
    "message": "对账执行完成",
    "success_rate": "83.33%"
  }
}
```

### 查询对账结果
**GET** `/api/reconcile?skip=0&limit=100&status=need_review`

**查询参数**:
- `skip`: 跳过记录数
- `limit`: 返回记录数
- `status`: 状态筛选（`matched` 或 `need_review`）

**响应示例**:
```json
{
  "data": [
    {
      "id": 1,
      "ad_spend_id": 1,
      "ledger_id": 1,
      "amount_diff": 0.50,
      "date_diff": 0,
      "match_score": 95.00,
      "status": "need_review",
      "reason": "自动匹配失败：金额差 0.50 USDT",
      "created_at": "2024-11-04T12:00:00Z",
      "ad_spend": {
        "id": 1,
        "operator_name": "张三",
        "project_name": "项目A",
        "spend_date": "2024-11-04",
        "amount_usdt": 100.50
      },
      "ledger_transaction": {
        "id": 1,
        "tx_date": "2024-11-04",
        "amount": 100.00,
        "currency": "USDT"
      }
    }
  ],
  "error": null,
  "meta": {
    "total": 50,
    "skip": 0,
    "limit": 100,
    "has_more": false
  }
}
```

### 确认匹配
**PATCH** `/api/reconcile/{id}`

**请求体**:
```json
{
  "status": "matched"
}
```

**响应示例**:
```json
{
  "data": {
    "id": 1,
    "status": "matched"
  },
  "error": null,
  "meta": {
    "message": "对账记录更新成功"
  }
}
```

## 4. 月度报表

### 生成月度报表
**POST** `/api/reports/monthly`

**请求体**:
```json
{
  "year": 2024,
  "month": 11
}
```

**响应示例**:
```json
{
  "data": {
    "project_performance_created": 5,
    "project_performance_updated": 2,
    "operator_performance_created": 10,
    "operator_performance_updated": 3,
    "summary": {
      "total_spend_usdt": 1000.00,
      "total_income_usdt": 1500.00,
      "total_spend_cny": 7000.00,
      "total_income_cny": 10500.00,
      "total_salary_cny": 50000.00,
      "total_cost_cny": 57000.00,
      "net_profit_cny": 48000.00
    }
  },
  "error": null,
  "meta": {
    "message": "2024年11月报表生成成功",
    "year": 2024,
    "month": 11
  }
}
```

### 获取诊断报告
**GET** `/api/reports/diagnostic?year=2024&month=11&format=text`

**查询参数**:
- `year`: 年份（必填）
- `month`: 月份 1-12（必填）
- `format`: 返回格式 `json` 或 `text`（默认 `json`）

**响应示例（JSON格式）**:
```json
{
  "data": {
    "overall_summary": {
      "total_income_cny": 10500.00,
      "total_spend_cny": 7000.00,
      "total_profit_cny": 3500.00,
      "overall_roi": 50.00,
      "profit_status": "盈利"
    },
    "top_profitable_project": {
      "project_name": "项目A",
      "profit_cny": 2000.00,
      "reasons": ["利润率高达30%", "ROI超过100%"]
    },
    "roi_declining_projects": [...],
    "operator_analysis": [...],
    "suggestions": {...}
  },
  "error": null,
  "meta": {...}
}
```

## 错误处理

所有 API 在错误时返回：
```json
{
  "data": null,
  "error": "错误信息",
  "meta": null
}
```

常见错误：
- 400: 请求参数错误
- 404: 资源不存在
- 500: 服务器错误

## 使用示例

### JavaScript/TypeScript 调用示例

```typescript
// 创建消耗上报
const response = await fetch('http://localhost:8000/api/ad-spend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    spend_date: '2024-11-04',
    project_id: 1,
    operator_id: 1,
    amount_usdt: 100.50,
  }),
});

const result = await response.json();
if (result.error) {
  console.error('错误:', result.error);
} else {
  console.log('成功:', result.data);
}
```

将此文档提供给 Bolt.new，它就能生成完整的前端代码！


