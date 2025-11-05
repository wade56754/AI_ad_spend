# Supabase 快速配置指南

## ✅ 已完成的配置

你的 Supabase 项目已配置完成！

- **项目 URL**: https://jzmcoivxhiyidizncyaq.supabase.co
- **API Key**: 已配置在 `.env` 文件中
- **数据库连接**: 已配置连接池 URL

## 🚀 下一步操作

### 1. 创建数据库表

有两种方式创建表：

#### 方式 1：在 Supabase Dashboard 中执行 SQL（推荐）

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 点击 **New query**
5. 打开 `backend/init_supabase.sql` 文件
6. 复制全部内容并粘贴到 SQL Editor
7. 点击 **Run** 执行

#### 方式 2：使用 Alembic 迁移

```bash
cd backend

# 初始化 Alembic（如果还没有）
alembic init alembic

# 配置 alembic.ini 中的数据库连接
# sqlalchemy.url = postgresql://postgres:[password]@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres

# 创建迁移
alembic revision --autogenerate -m "Initial migration"

# 执行迁移
alembic upgrade head
```

### 2. 验证连接

安装依赖并测试连接：

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 测试连接（Python）
python -c "from app.db.session import SessionLocal; db = SessionLocal(); db.execute('SELECT 1'); print('✅ 数据库连接成功！'); db.close()"
```

### 3. 启动后端服务

```bash
cd backend
uvicorn app.main:app --reload
```

访问 http://localhost:8000/docs 查看 API 文档。

### 4. 配置前端（可选）

如果需要连接前端：

```bash
cd frontend

# 安装依赖
npm install

# 创建 .env.local 文件
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# 启动开发服务器
npm run dev
```

## 📝 重要提示

### 连接字符串说明

已配置的 `.env` 文件中包含：

1. **连接池 URL**（默认使用，推荐）
   - 端口：6543
   - 适合生产环境，有连接数限制但更稳定

2. **直接连接 URL**（备用）
   - 端口：5432
   - 如果连接池 URL 不工作，可以取消注释直接连接 URL

### 密码 URL 编码

密码中的特殊字符已进行 URL 编码：
- 单引号 `'` → `%27`
- 空格 → `%20`

### 如果连接失败

1. **检查密码**：确认密码是否正确（注意特殊字符编码）
2. **检查区域**：连接池 URL 中的区域（region）可能需要调整
   - 在 Supabase Dashboard → Settings → Database 查看实际的连接字符串
3. **使用直接连接**：如果连接池不工作，改用直接连接 URL

### 在 Supabase Dashboard 中查看

- **Table Editor**: 查看和管理数据
- **SQL Editor**: 执行 SQL 查询
- **Database**: 查看表结构和连接信息
- **API**: 查看自动生成的 REST API（可选）

## 🎯 测试连接

创建测试脚本 `test_connection.py`：

```python
from app.db.session import SessionLocal
from app.models.project import Project

db = SessionLocal()
try:
    # 测试查询
    count = db.query(Project).count()
    print(f"✅ 连接成功！当前有 {count} 个项目")
except Exception as e:
    print(f"❌ 连接失败: {e}")
finally:
    db.close()
```

运行：
```bash
cd backend
python test_connection.py
```

## 📚 相关文档

- [Supabase 集成指南](SUPABASE_SETUP.md)
- [项目配置说明](SUPABASE_CONFIG.md)
- [环境变量配置](ENV_SETUP.txt)

## ✅ 配置检查清单

- [x] `.env` 文件已创建
- [x] Supabase URL 已配置
- [x] API Key 已配置
- [x] 数据库连接字符串已配置
- [ ] 数据库表已创建（执行 `init_supabase.sql`）
- [ ] 依赖已安装（`pip install -r requirements.txt`）
- [ ] 连接测试通过
- [ ] 后端服务可以启动

现在你可以开始使用 Supabase 数据库了！


