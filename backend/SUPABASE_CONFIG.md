# Supabase 配置信息

## 项目信息

- **项目 URL**: https://jzmcoivxhiyidizncyaq.supabase.co
- **项目引用**: jzmcoivxhiyidizncyaq
- **API Key (Anon)**: 已配置在 `.env` 文件中

## 数据库连接

### 连接池 URL（推荐）
```
postgresql://postgres.jzmcoivxhiyidizncyaq:wade56754's Org@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 直接连接 URL
```
postgresql://postgres:wade56754's Org@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres
```

## 环境变量配置

所有配置已保存在 `backend/.env` 文件中。

## 注意事项

1. **密码中的特殊字符**: 密码 `wade56754's Org` 中的单引号和空格已进行 URL 编码：
   - 单引号 `'` → `%27`
   - 空格 → `%20`

2. **连接池 vs 直接连接**:
   - 连接池（端口 6543）：适合生产环境，有连接数限制但更稳定
   - 直接连接（端口 5432）：适合开发环境，连接数限制较少

3. **如果连接失败**:
   - 检查密码是否正确（注意特殊字符的 URL 编码）
   - 确认区域（region）是否正确（默认为 ap-southeast-1）
   - 可以在 Supabase Dashboard 中查看实际的连接字符串

## 测试连接

运行以下命令测试数据库连接：

```bash
cd backend
python -c "from app.db.session import engine; engine.connect(); print('连接成功！')"
```

或在 Python 中：

```python
from app.db.session import SessionLocal
db = SessionLocal()
try:
    db.execute("SELECT 1")
    print("数据库连接成功！")
finally:
    db.close()
```


