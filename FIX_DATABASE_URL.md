# 修复数据库连接字符串

## 当前问题

错误：`Tenant or user not found`

连接失败到：`aws-0-ap-southeast-1.pooler.supabase.com:6543`

## 解决步骤

### 步骤 1: 从 Supabase 获取正确的连接字符串

1. 登录 Supabase Dashboard: https://app.supabase.com
2. 选择你的项目
3. 点击左侧 **Settings**（齿轮图标）
4. 点击 **Database**
5. 滚动到 **Connection string** 部分
6. 选择 **Connection pooling** (不是 Direct connection)
7. 模式选择：**Transaction** mode
8. 复制显示的连接字符串

连接字符串格式应该是：
```
postgresql://postgres.jzmcoivxhiyidizncyaq:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
```

### 步骤 2: 处理密码

你的密码是：`wade56754's Org`

需要进行 URL 编码：
- 单引号 `'` → `%27`
- 空格 ` ` → `%20`

编码后：`wade56754%27s%20Org`

### 步骤 3: 更新 backend/.env

打开 `E:\AI\ad-spend-system\backend\.env`，更新 `DATABASE_URL`：

**正确格式示例：**
```env
DATABASE_URL=postgresql://postgres.jzmcoivxhiyidizncyaq:wade56754%27s%20Org@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

**注意：**
- 用户名格式：`postgres.jzmcoivxhiyidizncyaq`（注意有个点）
- 或者：`postgres:[密码]@db.jzmcoivxhiyidizncyaq...` （直接连接）
- 区域可能不是 `ap-southeast-1`，请从 Dashboard 确认

### 步骤 4: 可能的连接字符串格式

根据 Supabase 的不同配置，可能是以下格式之一：

**格式 1: 连接池（Transaction mode）**
```
postgresql://postgres.jzmcoivxhiyidizncyaq:wade56754%27s%20Org@aws-0-[region].pooler.supabase.com:6543/postgres
```

**格式 2: 连接池（Session mode）**
```
postgresql://postgres:wade56754%27s%20Org@aws-0-[region].pooler.supabase.com:5432/postgres
```

**格式 3: 直接连接**
```
postgresql://postgres:wade56754%27s%20Org@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres
```

## 快速修复脚本

### PowerShell 脚本更新 .env

```powershell
# 运行前请先从 Supabase Dashboard 获取正确的连接字符串
$correctConnectionString = "从 Supabase Dashboard 复制的连接字符串"
$password = "wade56754%27s%20Org"  # URL 编码后的密码

# 替换连接字符串中的 [YOUR-PASSWORD]
$finalConnectionString = $correctConnectionString -replace '\[YOUR-PASSWORD\]', $password

Write-Host "新的连接字符串："
Write-Host $finalConnectionString

# 注意：手动更新 .env 文件，不要直接运行这个脚本写入
```

## 验证步骤

### 1. 从 Supabase 直接复制

**重要：请完整复制 Dashboard 中显示的连接字符串，包括：**
- 完整的主机名（包括区域）
- 正确的端口号
- 正确的用户名格式

### 2. 替换密码占位符

将复制的字符串中的 `[YOUR-PASSWORD]` 替换为：`wade56754%27s%20Org`

### 3. 保存并测试

```bash
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

## 如果仍然失败

### 尝试直接连接模式

如果连接池失败，尝试直接连接：

```env
DATABASE_URL=postgresql://postgres:wade56754%27s%20Org@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres
```

### 检查 Supabase 项目状态

1. 确认项目状态为 "Active"（绿色）
2. 确认项目没有暂停
3. 检查项目区域设置

### 使用 Supabase 客户端测试

如果 PostgreSQL 连接有问题，可以使用 Supabase REST API：

```python
from supabase import create_client
url = "https://jzmcoivxhiyidizncyaq.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
supabase = create_client(url, key)

# 测试查询
response = supabase.table('projects').select("*").limit(1).execute()
print(response)
```

## 我需要你提供

请从 Supabase Dashboard 复制完整的连接字符串，然后我帮你正确配置。

**获取方式：**
1. https://app.supabase.com → 你的项目
2. Settings → Database
3. Connection string → Connection pooling
4. 复制完整字符串（包括 `postgresql://...` 开头的全部内容）

提供连接字符串后，我会帮你正确处理密码编码和配置。
