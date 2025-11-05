# Supabase Starter 框架集成指南

## ✅ 已完成的步骤

Supabase Starter 框架已下载到 `with-supabase-app` 目录。

## 📋 集成方案

有两种方式集成：

### 方案一：使用新的 Starter 框架（推荐）

直接使用 `with-supabase-app` 作为前端项目，然后添加业务页面。

### 方案二：合并到现有 frontend 目录

将 Starter 框架的有用部分复制到现有的 `frontend` 目录。

## 🚀 方案一：使用 Starter 框架

### 步骤 1: 配置环境变量

在 `with-supabase-app/.env.local` 中配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw

# 后端 API 配置
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 步骤 2: 添加业务页面

将现有页面复制到 `with-supabase-app/app/`：

```bash
# 复制投手上报页面
cp -r frontend/app/report with-supabase-app/app/

# 复制财务录入页面
cp -r frontend/app/finance with-supabase-app/app/

# 复制对账页面
cp -r frontend/app/reconcile with-supabase-app/app/

# 复制分析页面（需要创建）
# mkdir -p with-supabase-app/app/analytics
```

### 步骤 3: 添加 API 客户端

将 `frontend/lib/api.ts` 复制到 `with-supabase-app/lib/api.ts`

### 步骤 4: 更新导航

修改 `with-supabase-app/app/page.tsx` 或创建导航组件，添加业务页面链接。

### 步骤 5: 安装依赖并启动

```bash
cd with-supabase-app
npm install
npm run dev
```

## 🔄 方案二：合并到现有 frontend

### 步骤 1: 复制 Supabase 客户端

```bash
# 复制 Supabase 客户端文件
cp -r with-supabase-app/lib/supabase frontend/lib/

# 复制中间件
cp with-supabase-app/middleware.ts frontend/
```

### 步骤 2: 更新 package.json

```bash
cd frontend
npm install @supabase/ssr @supabase/supabase-js
```

### 步骤 3: 配置环境变量

在 `frontend/.env.local` 中添加 Supabase 配置。

## 📝 关键文件说明

### Supabase 客户端

- `lib/supabase/client.ts` - 浏览器端客户端
- `lib/supabase/server.ts` - 服务端客户端  
- `lib/supabase/middleware.ts` - 中间件辅助函数

### 认证页面（Starter 框架自带）

- `app/auth/login` - 登录页面
- `app/auth/sign-up` - 注册页面
- `app/auth/forgot-password` - 忘记密码
- `app/protected` - 受保护的路由示例

### UI 组件

Starter 框架包含 shadcn/ui 组件：
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/card.tsx`
- 等等

## 🎯 推荐做法

1. **使用方案一**：直接使用 `with-supabase-app` 作为前端项目
2. **保留认证功能**：Starter 框架的认证系统可以保留
3. **添加业务页面**：将现有页面添加到 Starter 框架
4. **配置 API 调用**：使用 `lib/api.ts` 调用 FastAPI 后端

## 📚 下一步

1. 配置 `.env.local` 文件
2. 复制业务页面到 Starter 框架
3. 添加导航菜单
4. 测试功能

Starter 框架已准备就绪，可以开始集成业务功能了！

