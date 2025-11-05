# 获取正确的数据库连接字符串

## 错误原因

`FATAL: Tenant or user not found` - 连接字符串格式或凭据不正确

当前使用的连接：`aws-0-ap-southeast-1.pooler.supabase.com:6543`

## 📋 操作步骤（跟着做）

### 步骤 1: 打开 Supabase Dashboard

1. 访问：https://app.supabase.com
2. 登录你的账号
3. 点击你的项目（项目名称或 jzmcoivxhiyidizncyaq）

### 步骤 2: 进入数据库设置

1. 在左侧边栏，点击 **Settings**（齿轮图标 ⚙️）
2. 在设置菜单中，点击 **Database**

### 步骤 3: 找到连接字符串

在 Database 页面中：

1. 滚动到 **Connection string** 部分
2. 你会看到两个标签：
   - **URI**（直接连接）
   - **Connection pooling**（连接池）
   
3. **点击 Connection pooling 标签**

4. 在 Mode 下拉菜单中，选择 **Transaction**

5. 你会看到类似这样的连接字符串：
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xx-xxxx-x.pooler.supabase.com:6543/postgres
   ```

### 步骤 4: 复制连接字符串

**完整复制** 显示的连接字符串（从 `postgresql://` 开始到 `/postgres` 结束）

### 步骤 5: 替换密码

将复制的字符串中的 `[YOUR-PASSWORD]` 替换为你的密码（URL 编码后）：

**你的密码：** `wade56754's Org`

**URL 编码后：** `wade56754%27s%20Org`

**示例：**
```
原始：postgresql://postgres.jzmcoivxhiyidizncyaq:[YOUR-PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres

替换后：postgresql://postgres.jzmcoivxhiyidizncyaq:wade56754%27s%20Org@aws-0-xxx.pooler.supabase.com:6543/postgres
```

### 步骤 6: 更新配置文件

1. 打开文件：`E:\AI\ad-spend-system\backend\.env`
2. 找到 `DATABASE_URL=` 这一行
3. 替换为你处理好的连接字符串
4. 保存文件

### 步骤 7: 测试连接

在 PowerShell 中运行：
```powershell
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

应该看到：
```
[OK] 数据库连接成功！
[OK] 表查询成功！当前有 X 个项目
```

## 🔍 注意事项

### 1. 密码编码规则

- 单引号 `'` → `%27`
- 空格 ` ` → `%20`
- `wade56754's Org` → `wade56754%27s%20Org`

### 2. 连接字符串格式

**正确格式（连接池）：**
```
postgresql://postgres.项目引用:密码@aws-0-区域.pooler.supabase.com:6543/postgres
```

**注意：**
- 用户名包含项目引用：`postgres.jzmcoivxhiyidizncyaq`
- 主机名包含区域信息
- 端口是 `6543`（连接池）

### 3. 如果连接池不工作

可以尝试直接连接（URI 标签）：
```
postgresql://postgres:wade56754%27s%20Org@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres
```

## 🆘 如果还是不行

### 方法 1: 截图给我

请截图 Supabase Dashboard 的以下内容（不要包含完整密码）：
1. Settings → Database → Connection string 部分
2. 我会帮你构建正确的连接字符串

### 方法 2: 使用 PowerShell 更新

创建一个临时脚本来更新 .env：

```powershell
# 将下面的 YOUR_FULL_CONNECTION_STRING 替换为从 Supabase 复制的完整字符串
$connectionString = "postgresql://postgres.jzmcoivxhiyidizncyaq:wade56754%27s%20Org@aws-0-xxx.pooler.supabase.com:6543/postgres"

# 读取现有 .env 文件
$envPath = "E:\AI\ad-spend-system\backend\.env"
$content = Get-Content $envPath

# 替换 DATABASE_URL 行
$newContent = $content -replace 'DATABASE_URL=.*', "DATABASE_URL=$connectionString"

# 写回文件
$newContent | Set-Content $envPath

Write-Host "已更新 DATABASE_URL" -ForegroundColor Green
```

## 快速诊断

运行这个命令查看当前配置：
```powershell
cd E:\AI\ad-spend-system\backend
python -c "from app.config import settings; print('Current DATABASE_URL:', settings.database_url[:50] + '...')"
```

## 我需要的信息

如果自己无法解决，请提供：
1. 从 Supabase Dashboard → Settings → Database → Connection pooling 复制的**完整**连接字符串（密码可以用 [YOUR-PASSWORD] 保留）
2. 或者截图 Connection string 部分（模糊处理密码）

有了这个信息，我可以帮你准确配置。
