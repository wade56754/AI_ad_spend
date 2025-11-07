# 测试指南

## ✅ 服务状态

- **后端**: http://localhost:8000 ✅ 运行中
- **前端**: http://localhost:3000 🔄 启动中

## 🔗 访问链接

### 后端 API

1. **API 根路径**
   - http://localhost:8000
   - 返回：`{"message": "广告投手消耗上报系统 API"}`

2. **健康检查**
   - http://localhost:8000/health
   - 返回：`{"status": "healthy"}`

3. **API 文档 (Swagger UI)**
   - http://localhost:8000/docs
   - 交互式 API 测试界面

4. **ReDoc 文档**
   - http://localhost:8000/redoc
   - 美观的 API 文档

### 前端应用

1. **首页**
   - http://localhost:3000

2. **认证页面**
   - 登录：http://localhost:3000/auth/login
   - 注册：http://localhost:3000/auth/sign-up
   - 忘记密码：http://localhost:3000/auth/forgot-password

3. **受保护页面**
   - http://localhost:3000/protected

## 📊 API 测试步骤

### 1. 测试项目接口

访问 http://localhost:8000/docs

#### GET /api/projects
```json
// 响应示例
{
  "data": [],
  "error": null,
  "meta": {
    "total": 0
  }
}
```

### 2. 创建测试项目和投手

在 Supabase SQL Editor 中执行：

```sql
-- 创建测试项目
INSERT INTO projects (name, code, description, status) 
VALUES ('测试项目A', 'PROJ001', '第一个测试项目', 'active')
ON CONFLICT (code) DO NOTHING
RETURNING *;

-- 创建测试投手
INSERT INTO operators (name, employee_id, project_id, role, status) 
VALUES ('张三', 'EMP001', 1, 'operator', 'active')
ON CONFLICT (employee_id) DO NOTHING
RETURNING *;
```

### 3. 测试投手上报

**请求：** POST /api/ad-spend

```json
{
  "spend_date": "2024-01-15",
  "project_id": 1,
  "country": "US",
  "operator_id": 1,
  "platform": "Facebook",
  "amount_usdt": 100.50,
  "raw_memo": "测试Facebook广告消耗"
}
```

**预期响应：**
```json
{
  "data": {
    "id": 1,
    "spend_date": "2024-01-15",
    "project_id": 1,
    "country": "US",
    "operator_id": 1,
    "platform": "Facebook",
    "amount_usdt": 100.50,
    "raw_memo": "测试Facebook广告消耗",
    "status": "pending",
    "created_at": "2024-01-15T10:00:00Z"
  },
  "error": null,
  "meta": {}
}
```

### 4. 测试财务录入

**请求：** POST /api/ledger

```json
{
  "tx_date": "2024-01-15",
  "direction": "expense",
  "amount": 100.50,
  "currency": "USDT",
  "account": "Meta Ads",
  "description": "Facebook广告支出",
  "fee_amount": 0.5,
  "project_id": 1,
  "operator_id": 1
}
```

### 5. 测试对账功能

**请求：** POST /api/reconcile/run

**预期响应：**
```json
{
  "data": {
    "matched": 1,
    "need_review": 0,
    "total_processed": 1
  },
  "error": null,
  "meta": {}
}
```

### 6. 查看对账结果

**请求：** GET /api/reconciliation

## 🧪 前端测试

### 1. 测试 Supabase 认证

1. 访问 http://localhost:3000/auth/sign-up
2. 注册新用户
3. 检查邮箱验证邮件
4. 访问 http://localhost:3000/auth/login
5. 使用新账号登录

### 2. 测试受保护路由

登录后访问 http://localhost:3000/protected，应该能看到受保护的内容。

### 3. 测试主题切换

在页面右上角切换深色/浅色主题。

## 🔍 常见测试场景

### 场景 1: 完整的上报-录入-对账流程

1. **投手上报消耗**
   ```
   POST /api/ad-spend
   {
     "spend_date": "2024-01-15",
     "project_id": 1,
     "amount_usdt": 100.00,
     ...
   }
   ```

2. **财务录入支出**
   ```
   POST /api/ledger
   {
     "tx_date": "2024-01-15",
     "amount": 100.00,
     ...
   }
   ```

3. **触发对账**
   ```
   POST /api/reconcile/run
   ```

4. **查看对账结果**
   ```
   GET /api/reconciliation
   ```

### 场景 2: 月度报表生成

1. 确保有足够的测试数据
2. 触发月度报告
   ```
   POST /api/reports/monthly
   {
     "year": 2024,
     "month": 1
   }
   ```

3. 查看诊断报告
   ```
   GET /api/analytics/diagnostic?year=2024&month=1
   ```

## 📝 测试检查清单

### 后端测试
- [ ] 健康检查接口正常
- [ ] API 文档可访问
- [ ] 项目列表接口返回数据
- [ ] 投手上报接口创建成功
- [ ] 财务录入接口创建成功
- [ ] 对账接口执行成功
- [ ] 错误处理正确（如缺少必填字段）

### 前端测试
- [ ] 首页正常加载
- [ ] 注册功能正常
- [ ] 登录功能正常
- [ ] 受保护路由拦截未登录用户
- [ ] 主题切换正常
- [ ] 页面响应式设计正常

### 集成测试
- [ ] 前端能调用后端 API
- [ ] 前端能访问 Supabase 数据库
- [ ] 认证状态在前后端同步
- [ ] 错误信息正确显示

## 🐛 调试技巧

### 查看后端日志
后端启动的 PowerShell 窗口会显示所有请求日志。

### 查看浏览器控制台
按 F12 打开浏览器开发者工具，查看：
- Console：JavaScript 错误
- Network：API 请求和响应
- Application：Cookies 和本地存储

### 查看数据库数据
在 Supabase Dashboard → Table Editor 中直接查看表数据。

## 📊 性能测试

### 使用 curl 测试

```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试 API（需要先创建测试数据）
curl -X POST http://localhost:8000/api/ad-spend \
  -H "Content-Type: application/json" \
  -d '{
    "spend_date": "2024-01-15",
    "project_id": 1,
    "country": "US",
    "operator_id": 1,
    "platform": "Facebook",
    "amount_usdt": 100.50,
    "raw_memo": "测试"
  }'
```

## 🎯 下一步

测试通过后：
1. 开发业务页面
2. 实现完整的用户流程
3. 添加数据可视化
4. 优化性能
5. 部署到生产环境
