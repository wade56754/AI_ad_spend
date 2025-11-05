# 快速部署指南（5 分钟）

## 🚀 最简单的部署方式

### 1️⃣ 后端部署（Railway - 2 分钟）

1. **访问 Railway**
   - https://railway.app
   - 用 GitHub 登录

2. **部署**
   - New Project → Deploy from GitHub
   - 选择 `AI_ad_spend` 仓库
   - Root Directory: `backend`

3. **环境变量**（点击 Variables）
   ```
   DATABASE_URL=postgresql://postgres:Date103221%2A%28%29@db.jzmcoivxhiyidizncyaq.supabase.co:5432/postgres
   SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
   SECRET_KEY=change-this-in-production-min-32-chars
   ```

4. **获取 URL**
   - Settings → 复制 Public Domain
   - 如：`https://ad-spend-backend-production.up.railway.app`

---

### 2️⃣ 前端部署（Vercel - 2 分钟）

1. **访问 Vercel**
   - https://vercel.com
   - 用 GitHub 登录

2. **导入项目**
   - New Project → Import `AI_ad_spend`
   - Root Directory: `with-supabase-app`

3. **环境变量**（Configure Project）
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw
   NEXT_PUBLIC_API_URL=https://你的Railway后端URL/api
   ```

4. **部署**
   - 点击 Deploy
   - 等待完成

---

### 3️⃣ 配置 CORS（1 分钟）

修改 `backend/app/main.py`：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://你的vercel域名.vercel.app",  # 添加这行
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

提交并推送：
```bash
git add .
git commit -m "Add production CORS"
git push
```

Railway 会自动重新部署。

---

## ✅ 验证

1. **后端**：https://你的railway域名/health
2. **API文档**：https://你的railway域名/docs
3. **前端**：https://你的vercel域名.vercel.app

---

## 📝 完成！

你的应用现已部署到公网：
- 前端：由 Vercel 托管（全球 CDN）
- 后端：由 Railway 托管
- 数据库：Supabase（云端）

需要详细说明？查看 `DEPLOYMENT_GUIDE.md`
