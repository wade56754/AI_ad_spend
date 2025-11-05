# 修复数据库连接问题

## 当前错误

```
Tenant or user not found
```

## 可能的原因

1. 连接字符串中的用户名格式不正确
2. 区域（region）可能不正确
3. 密码编码问题

## 解决方案

### 方法 1: 从 Supabase Dashboard 获取正确的连接字符串

1. 登录 Supabase Dashboard: https://app.supabase.com
2. 选择项目：`jzmcoivxhiyidizncyaq`
3. 进入 **Settings** → **Database**
4. 找到 **Connection string** 部分
5. 选择 **Connection pooling** (Transaction mode)
6. 复制连接字符串
7. 将 `<password>` 替换为你的密码：`wade56754's Org`

**注意密码编码：**
- 如果密码包含特殊字符，需要进行 URL 编码：
  - 单引号 `'` → `%27`
  - 空格 ` ` → `%20`

### 方法 2: 手动构建连接字符串

根据 Supabase 项目信息：

**连接池 URL（推荐）：**
```
postgresql://postgres.jzmcoivxhiyidizncyaq:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

**直接连接 URL（备用）：**
```
postgresql://postgres:[password]@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres
```

**替换说明：**
- `[password]` → 你的密码（URL 编码后）
- `[region]` → 你的项目区域（可能是 `ap-southeast-1` 或其他）

### 方法 3: 检查区域设置

1. 在 Supabase Dashboard 中查看项目设置
2. 确认项目的区域（Region）
3. 更新连接字符串中的区域

## 密码编码示例

原始密码：`wade56754's Org`

URL 编码后：
- `wade56754%27s%20Org`

Python 编码示例：
```python
from urllib.parse import quote
password = "wade56754's Org"
encoded = quote(password, safe='')
# 结果: wade56754%27s%20Org
```

## 测试连接

修复后，运行测试：

```bash
cd E:\AI\ad-spend-system\backend
python test_connection.py
```

## 常见区域代码

- `ap-southeast-1` - 新加坡
- `ap-northeast-1` - 东京
- `us-east-1` - 美国东部
- `eu-west-1` - 爱尔兰
- `cn-north-1` - 中国（如果适用）

## 下一步

1. 从 Supabase Dashboard 获取准确的连接字符串
2. 更新 `backend/.env` 中的 `DATABASE_URL`
3. 运行 `python test_connection.py` 验证连接
4. 如果连接成功，继续执行 `init_supabase.sql` 创建表
