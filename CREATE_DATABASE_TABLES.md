# 在 Supabase 中创建数据库表

## 说明

Supabase 项目创建时已经自动包含了 PostgreSQL 数据库。你现在需要做的是**创建数据库表（Tables）**，而不是创建数据库本身。

## 方法 1: 使用 Supabase SQL Editor（推荐）

### 步骤 1: 登录 Supabase Dashboard

1. 访问 https://app.supabase.com
2. 使用你的账号登录
3. 选择项目：`jzmcoivxhiyidizncyaq`

### 步骤 2: 打开 SQL Editor

1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New Query** 创建新查询

### 步骤 3: 复制并执行 SQL 脚本

1. 打开文件：`E:\AI\ad-spend-system\backend\init_supabase.sql`
2. 复制全部内容（Ctrl+A, Ctrl+C）
3. 粘贴到 Supabase SQL Editor 中（Ctrl+V）
4. 点击右下角的 **Run** 按钮（或按 Ctrl+Enter）

### 步骤 4: 验证表是否创建成功

执行以下查询检查表：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

应该看到以下表：
- `ad_spend_daily`
- `ledger_transactions`
- `monthly_operator_performance`
- `monthly_project_performance`
- `operator_salary`
- `operators`
- `projects`
- `reconciliation`

## 方法 2: 使用命令行工具（高级）

如果你安装了 PostgreSQL 客户端工具（如 `psql`），可以使用命令行：

```bash
# 使用 psql 连接并执行脚本
psql "postgresql://postgres:[password]@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres" -f backend/init_supabase.sql
```

## 创建的表结构

### 1. projects（项目表）
- 存储广告项目信息
- 字段：id, name, description, status, created_at, updated_at

### 2. operators（投手表）
- 存储广告投手信息
- 字段：id, name, email, status, created_at, updated_at

### 3. ad_spend_daily（广告消耗日报表）
- 存储投手每日上报的广告消耗
- 字段：id, spend_date, project_id, country, operator_id, platform, amount_usdt, raw_memo, status, created_at

### 4. ledger_transactions（财务收支表）
- 存储财务录入的收支记录
- 字段：id, tx_date, direction, amount, currency, account, description, fee_amount, project_id, operator_id, status, created_at

### 5. reconciliation（对账结果表）
- 存储自动对账的结果
- 字段：id, ad_spend_id, ledger_id, amount_diff, date_diff, match_score, status, reason, created_at

### 6. operator_salary（投手工资表）
- 存储投手工资信息
- 字段：id, operator_id, month, base_salary, bonus, total, created_at

### 7. monthly_project_performance（项目月度绩效表）
- 存储项目月度绩效统计
- 字段：id, month, project_name, income_cny, ad_spend_cny, fee_cny, salary_cny, profit_cny, roi, created_at

### 8. monthly_operator_performance（投手月度绩效表）
- 存储投手月度绩效统计
- 字段：id, month, operator_name, income_cny, ad_spend_cny, salary_cny, profit_cny, roi, created_at

## 创建测试数据（可选）

表创建成功后，可以插入一些测试数据：

```sql
-- 插入测试项目
INSERT INTO projects (name, description, status) 
VALUES 
  ('测试项目A', '这是一个测试项目', 'active'),
  ('测试项目B', '另一个测试项目', 'active');

-- 插入测试投手
INSERT INTO operators (name, email, status) 
VALUES 
  ('张三', 'zhangsan@test.com', 'active'),
  ('李四', 'lisi@test.com', 'active');

-- 查看插入的数据
SELECT * FROM projects;
SELECT * FROM operators;
```

## 验证数据库连接

表创建成功后，运行测试脚本验证后端连接：

```bash
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

如果看到 `[OK] 表查询成功！当前有 X 个项目`，说明连接和表都正常了。

## 常见问题

### 问题 1: 执行 SQL 时出错

**解决方案：**
- 确保复制了完整的 SQL 脚本
- 检查是否有语法错误
- 如果表已存在，先删除表：
  ```sql
  DROP TABLE IF EXISTS reconciliation CASCADE;
  DROP TABLE IF EXISTS ad_spend_daily CASCADE;
  DROP TABLE IF EXISTS ledger_transactions CASCADE;
  DROP TABLE IF EXISTS operator_salary CASCADE;
  DROP TABLE IF EXISTS monthly_project_performance CASCADE;
  DROP TABLE IF EXISTS monthly_operator_performance CASCADE;
  DROP TABLE IF EXISTS operators CASCADE;
  DROP TABLE IF EXISTS projects CASCADE;
  ```
  然后重新执行 `init_supabase.sql`

### 问题 2: 找不到 SQL Editor

**解决方案：**
- 确保已登录 Supabase Dashboard
- 左侧菜单中找到 **SQL Editor** 图标（看起来像一个数据库图标）
- 如果还是找不到，检查浏览器是否阻止了某些脚本

### 问题 3: 权限错误

**解决方案：**
- 确保你是项目的所有者或有足够的权限
- 使用 Supabase Dashboard 的 SQL Editor 会自动使用管理员权限

## 下一步

1. ✅ 在 Supabase SQL Editor 中执行 `init_supabase.sql`
2. ✅ 验证表已创建
3. ⏳ 插入测试数据（可选）
4. ⏳ 运行 `python test_connection.py` 验证连接
5. ⏳ 启动后端和前端服务进行测试
