# 创建前端环境变量文件

## 问题说明

访问 `https://jzmcoivxhiyidizncyaq.supabase.co/` 返回 `{"error":"requested path is invalid"}` **是正常的**。

Supabase 项目根 URL 不是一个有效的 API 端点，需要访问具体的 API 路径，例如：
- REST API: `/rest/v1/table_name`
- Auth API: `/auth/v1/...`

## 测试结果

✅ Supabase API 连接正常（返回 404 是因为表还未创建）
✅ 后端 `.env` 文件已配置
⚠️ 前端 `.env.local` 文件不存在，需要创建

## 创建前端环境变量文件

在 `with-supabase-app/` 目录下创建 `.env.local` 文件：

### 方法 1: 使用 PowerShell

```powershell
cd E:\AI\ad-spend-system\with-supabase-app

@"
NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
NEXT_PUBLIC_API_URL=http://localhost:8000/api
"@ | Out-File -FilePath .env.local -Encoding utf8
```

### 方法 2: 手动创建

1. 打开 `with-supabase-app/` 目录
2. 创建新文件 `.env.local`
3. 复制以下内容：

```env
NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 验证配置

创建文件后，运行测试脚本：

```bash
cd E:\AI\ad-spend-system
python test_supabase_config.py
```

应该看到：
- `[OK] with-supabase-app/.env.local 存在`
- `[OK] NEXT_PUBLIC_SUPABASE_URL 已配置`

## 下一步

1. ✅ 创建 `.env.local` 文件
2. ⏳ 在 Supabase SQL Editor 中执行 `backend/init_supabase.sql` 创建表
3. ⏳ 启动后端服务：`python -m uvicorn app.main:app --reload --port 8000`
4. ⏳ 启动前端服务：`npm run dev`
