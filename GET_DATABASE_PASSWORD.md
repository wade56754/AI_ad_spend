# 获取 Supabase 数据库密码

## 当前状态

✅ 能连接到 Supabase 服务器  
❌ 密码认证失败：`password authentication failed for user "postgres"`

## 问题

`wade56754's Org` 是组织名称，不是数据库密码。

## 获取正确的数据库密码

### 步骤 1: 登录 Supabase Dashboard

1. 访问：https://app.supabase.com
2. 选择项目 `jzmcoivxhiyidizncyaq`

### 步骤 2: 找到数据库密码

有两种方法：

#### 方法 A: 从设置中查看（如果你知道密码）

1. 点击 **Settings** → **Database**
2. 在 **Database Settings** 部分找到 **Database password**
3. 如果显示了密码，复制它
4. 如果是隐藏的（****），说明需要重置密码

#### 方法 B: 重置数据库密码（推荐）

1. 在 **Settings** → **Database** 页面
2. 找到 **Database password** 部分
3. 点击 **Reset database password** 按钮
4. 输入新密码（建议使用简单密码用于测试，如：`test123456`）
5. 确认重置
6. **复制新密码**（这是唯一一次显示）

### 步骤 3: 更新连接字符串

#### 如果使用新密码（例如：test123456）

运行以下命令：

```powershell
cd E:\AI\ad-spend-system\backend
$password = "test123456"  # 替换为你的实际密码
$encoded = [System.Web.HttpUtility]::UrlEncode($password)
Write-Host "URL编码后的密码: $encoded"
```

或者，如果密码很简单（不含特殊字符），可以直接使用。

### 步骤 4: 使用 Python 更新 .env

创建一个临时更新脚本：

```powershell
cd E:\AI\ad-spend-system\backend
```

然后运行：

```python
# update_password.py
password = "你的实际数据库密码"  # 替换这里

# URL 编码
from urllib.parse import quote
encoded_password = quote(password, safe='')
print(f"编码后的密码: {encoded_password}")

# 更新 .env
with open('.env', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换密码
import re
content = re.sub(
    r'postgresql://postgres:([^@]+)@',
    f'postgresql://postgres:{encoded_password}@',
    content
)

with open('.env', 'w', encoding='utf-8') as f:
    f.write(content)

print("密码已更新")
```

保存为 `update_password.py`，然后运行：
```bash
python update_password.py
```

### 步骤 5: 测试连接

```bash
python test_connection.py
```

## 快速修复方案

如果你重置密码为 `test123456`（无特殊字符），可以直接运行：

```powershell
cd E:\AI\ad-spend-system\backend

@"
DATABASE_URL=postgresql://postgres:test123456@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres
SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
SECRET_KEY=ad-spend-system-secret-key-2024-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"@ | Out-File -FilePath .env -Encoding utf8

python test_connection.py
```

## 我需要你提供

请告诉我：
1. 你是否知道数据库密码
2. 还是需要重置密码
3. 如果重置了，新密码是什么

有了正确的密码，我可以帮你立即配置好。

## 注意事项

- 数据库密码和 Supabase API Key 是不同的
- API Key 用于前端访问
- 数据库密码用于后端 PostgreSQL 直连
- 如果忘记密码，只能重置
