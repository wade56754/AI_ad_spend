# 解决 Supabase Row Level Security (RLS) 问题

## 当前状态

✅ 8 张表已成功创建：
- ad_spend_daily
- ledger_transactions
- monthly_operator_performance
- monthly_project_performance
- operator_salary
- operators
- projects
- reconciliation

⚠️ 所有表显示 "Unrestricted" 标签 - 这表示 Row Level Security (RLS) 未启用

## 可能的错误场景

### 场景 1: 如果前端访问数据库时报 RLS 错误

**错误信息可能类似：**
```
new row violates row-level security policy
```

**解决方案：禁用 RLS 或配置策略**

#### 方法 1: 禁用 RLS（开发测试环境）

在 Supabase SQL Editor 中执行：

```sql
-- 对所有表禁用 RLS（仅用于开发测试）
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE ad_spend_daily DISABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation DISABLE ROW LEVEL SECURITY;
ALTER TABLE operator_salary DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_project_performance DISABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_operator_performance DISABLE ROW LEVEL SECURITY;
```

#### 方法 2: 配置 RLS 策略（生产环境推荐）

```sql
-- 启用 RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 创建允许所有操作的策略（示例）
CREATE POLICY "Allow all operations on projects" 
ON projects 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 为其他表重复类似操作
```

### 场景 2: 数据库连接失败

**错误信息可能类似：**
```
Tenant or user not found
connection refused
```

**解决方案：检查数据库连接字符串**

1. 登录 Supabase Dashboard
2. Settings → Database
3. 复制 Connection Pooling 连接字符串
4. 更新 `backend/.env` 中的 `DATABASE_URL`

格式应该是：
```
postgresql://postgres.jzmcoivxhiyidizncyaq:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 场景 3: API 访问权限错误

**错误信息可能类似：**
```
403 Forbidden
Invalid API key
```

**解决方案：检查 API Key**

确保使用的是 **anon/public** key，不是 service_role key（除非在后端）。

前端应使用：
```env
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 场景 4: CORS 错误

**错误信息可能类似：**
```
Access to fetch has been blocked by CORS policy
```

**解决方案：配置 CORS**

后端 `main.py` 已配置 CORS，确保前端 URL 正确。

## 快速修复 - 禁用所有表的 RLS

如果只是开发测试，直接禁用 RLS：

### 步骤 1: 在 Supabase SQL Editor 中执行

```sql
-- 禁用所有表的 RLS
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;
```

### 步骤 2: 验证

```sql
-- 查看 RLS 状态
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

应该看到所有表的 `rowsecurity` 都是 `false`。

### 步骤 3: 测试连接

```bash
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

## 如果仍然有错误

请提供以下信息：

1. **完整的错误信息**
   - 错误发生在哪里（后端/前端）
   - 完整的错误堆栈

2. **测试数据库连接**
   ```bash
   cd E:\AI\ad-spend-system\backend
   python test_connection.py
   ```

3. **尝试插入测试数据**
   ```sql
   INSERT INTO projects (name, code, description) 
   VALUES ('测试项目', 'TEST001', '这是一个测试');
   ```

4. **检查后端日志**
   ```bash
   cd E:\AI\ad-spend-system\backend
   python -m uvicorn app.main:app --reload --port 8000
   ```
   观察启动时是否有错误信息

## 下一步

如果表已创建成功：

1. ✅ 禁用 RLS（开发环境）
2. ✅ 测试数据库连接
3. ⏳ 启动后端服务
4. ⏳ 测试 API 接口
5. ⏳ 启动前端服务

请告诉我具体的错误信息，我才能提供针对性的解决方案。
