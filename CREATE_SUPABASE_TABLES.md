# 在 Supabase 中创建数据库表

## 说明

Supabase 项目创建时已经自动包含了一个 PostgreSQL 数据库，你需要做的是在这个数据库中**创建表（Tables）**。

## 方法 1: 使用 Supabase SQL Editor（推荐）

### 步骤 1: 登录 Supabase Dashboard

1. 访问：https://app.supabase.com
2. 使用你的账号登录
3. 选择你的项目：`jzmcoivxhiyidizncyaq`

### 步骤 2: 打开 SQL Editor

1. 在左侧菜单中点击 **SQL Editor**
2. 点击 **New Query** 创建新查询

### 步骤 3: 执行 SQL 脚本

1. 打开项目文件：`E:\AI\ad-spend-system\backend\init_supabase.sql`
2. 复制所有 SQL 语句
3. 粘贴到 Supabase SQL Editor 中
4. 点击 **Run** 按钮执行

### 步骤 4: 验证表是否创建成功

执行以下查询验证：

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

应该看到以下 8 张表：
- `ad_spend_daily`
- `ledger_transactions`
- `monthly_operator_performance`
- `monthly_project_performance`
- `operator_salary`
- `operators`
- `projects`
- `reconciliation`

## 方法 2: 使用 Supabase Table Editor（可视化）

### 创建 projects 表

1. 在左侧菜单点击 **Table Editor**
2. 点击 **New table**
3. 填写表信息：
   - Table name: `projects`
   - Description: `项目列表`

4. 添加列（Columns）：
   - `id` (int8, Primary Key, Identity)
   - `name` (varchar)
   - `description` (text, nullable)
   - `status` (varchar, default: 'active')
   - `created_at` (timestamptz, default: now())
   - `updated_at` (timestamptz, default: now())

5. 点击 **Save** 保存

6. 重复此过程创建其他 7 张表

**注意：** 使用 SQL Editor 方式更快，推荐使用方法 1。

## 方法 3: 使用 Alembic 迁移（开发环境）

如果后端数据库连接正常，可以使用 Alembic：

```bash
cd E:\AI\ad-spend-system\backend
alembic upgrade head
```

**前提条件：**
- 需要后端数据库连接配置正确
- 需要 Alembic 迁移文件已配置

## SQL 脚本内容预览

`init_supabase.sql` 包含以下表的创建语句：

### 1. projects（项目表）
```sql
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. operators（投手表）
```sql
CREATE TABLE IF NOT EXISTS operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. ad_spend_daily（广告消耗日报表）
### 4. ledger_transactions（财务收支表）
### 5. reconciliation（对账结果表）
### 6. operator_salary（投手薪资表）
### 7. monthly_project_performance（月度项目绩效表）
### 8. monthly_operator_performance（月度投手绩效表）

## 快速执行指南

### 一键创建所有表

1. 打开 Supabase Dashboard: https://app.supabase.com
2. 选择项目 `jzmcoivxhiyidizncyaq`
3. 点击左侧 **SQL Editor**
4. 点击 **New Query**
5. 复制粘贴 `backend/init_supabase.sql` 的全部内容
6. 点击 **Run** 或按 `Ctrl+Enter`
7. 等待执行完成，应该看到 "Success" 提示

### 验证创建结果

```sql
-- 查看所有表
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 查看表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'projects';
```

## 创建测试数据

表创建完成后，可以插入一些测试数据：

```sql
-- 插入测试项目
INSERT INTO projects (name, description, status) 
VALUES 
    ('测试项目1', '这是第一个测试项目', 'active'),
    ('测试项目2', '这是第二个测试项目', 'active');

-- 插入测试投手
INSERT INTO operators (name, email, status) 
VALUES 
    ('张三', 'zhangsan@test.com', 'active'),
    ('李四', 'lisi@test.com', 'active');

-- 查看插入结果
SELECT * FROM projects;
SELECT * FROM operators;
```

## 验证后端连接

表创建完成后，测试后端连接：

```bash
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

应该看到：
```
[OK] 数据库连接成功！
[OK] 表查询成功！当前有 X 个项目
```

## 常见问题

### Q1: SQL 执行报错

**解决：**
1. 检查 SQL 语法
2. 确保没有重复创建表（使用 `IF NOT EXISTS`）
3. 检查字段类型是否支持

### Q2: 权限不足

**解决：**
1. 确保使用的是项目所有者账号
2. 检查 Supabase 项目是否正常运行

### Q3: 表已存在

**解决：**
1. 如果需要重新创建，先删除表：
   ```sql
   DROP TABLE IF EXISTS table_name CASCADE;
   ```
2. 或修改表结构：
   ```sql
   ALTER TABLE table_name ADD COLUMN new_column VARCHAR(100);
   ```

## 下一步

1. ✅ 在 Supabase SQL Editor 中执行 `init_supabase.sql`
2. ✅ 验证表创建成功
3. ⏳ 运行 `python test_connection.py` 测试连接
4. ⏳ 启动后端服务测试 API
5. ⏳ 启动前端服务测试完整功能

## 相关文件

- SQL 脚本：`E:\AI\ad-spend-system\backend\init_supabase.sql`
- 连接测试：`E:\AI\ad-spend-system\backend\test_connection.py`
- 配置说明：`E:\AI\ad-spend-system\backend\SUPABASE_SETUP.md`
