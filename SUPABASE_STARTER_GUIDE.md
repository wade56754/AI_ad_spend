# 使用 Next.js Supabase Starter 框架指南

## 📋 概述

使用 Next.js Supabase Starter 可以快速搭建包含 Supabase 集成的前端项目，支持认证、实时订阅等功能。

## 🚀 方式一：使用 Supabase 官方 Starter（推荐）

### 步骤 1: 创建 Supabase Starter 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目：`jzmcoivxhiyidizncyaq`
3. 进入 **Settings** → **Integrations**
4. 找到 **Next.js** 集成
5. 点击 **"Create Next.js App"** 或使用命令行：

```bash
npx create-next-app@latest ad-spend-frontend --example with-supabase
cd ad-spend-frontend
```

或者使用 Vercel 模板：

```bash
npx create-next-app@latest ad-spend-frontend --example https://github.com/vercel/next.js/tree/canary/examples/with-supabase
```

### 步骤 2: 配置 Supabase 客户端

创建 `lib/supabase/client.ts`：

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

创建 `lib/supabase/server.ts`：

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### 步骤 3: 配置环境变量

创建 `frontend/.env.local`：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://jzmcoivxhiyidizncyaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6bWNvaXZ4aGl5aWRpem5jeWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTc4MTEsImV4cCI6MjA3Nzg5MzgxMX0.PIr4EdBjfyCgRa48IxK6yLS0yIER-_3qvd-Mv-4I7rw

# 后端 API 配置（用于调用 FastAPI）
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 步骤 4: 安装依赖

```bash
cd frontend
npm install @supabase/ssr @supabase/supabase-js
```

## 🚀 方式二：手动集成 Supabase 到现有项目

### 步骤 1: 安装 Supabase 依赖

```bash
cd frontend
npm install @supabase/ssr @supabase/supabase-js
```

### 步骤 2: 更新 package.json

更新 `frontend/package.json`：

```json
{
  "name": "ad-spend-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0"
  }
}
```

### 步骤 3: 创建 Supabase 客户端工具

创建 `lib/supabase/client.ts`：

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

创建 `lib/supabase/server.ts`：

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 中调用 setAll 可以忽略
          }
        },
      },
    }
  )
}
```

### 步骤 4: 创建中间件（可选，用于认证）

创建 `middleware.ts`：

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 刷新用户会话
  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 步骤 5: 更新 API 客户端

更新 `lib/api.ts`，可以结合 Supabase 客户端使用：

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta: any;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : '请求失败',
      meta: null,
    };
  }
}

// 原有的 API 函数保持不变
export async function postAdSpend(data: {...}) { ... }
export async function postLedger(data: {...}) { ... }
export async function getReconciliations(params?: {...}) { ... }
export async function updateReconciliation(id: number, status: string) { ... }
```

## 🎯 使用 Supabase 的优势

### 1. 认证功能（可选）

如果需要使用 Supabase 认证，可以：

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// 登录
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// 注册
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// 获取当前用户
const { data: { user } } = await supabase.auth.getUser()
```

### 2. 实时订阅（可选）

如果需要实时数据更新：

```typescript
const supabase = createClient()

const channel = supabase
  .channel('reconciliations')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'reconciliation' },
    (payload) => {
      console.log('新对账记录:', payload.new)
    }
  )
  .subscribe()
```

### 3. 直接数据库查询（可选）

如果需要直接从 Supabase 查询数据（绕过 FastAPI）：

```typescript
const supabase = createClient()

const { data, error } = await supabase
  .from('ad_spend_daily')
  .select('*')
  .eq('status', 'pending')
```

## 📝 推荐架构

### 混合架构（推荐）

- **Supabase**: 用于认证、实时订阅、文件存储
- **FastAPI**: 用于复杂业务逻辑、对账算法、报表生成

这样既利用了 Supabase 的便利性，又保持了后端业务逻辑的灵活性。

## 🔧 快速迁移步骤

### 如果使用官方 Starter

1. 使用官方模板创建项目
2. 复制现有页面到新项目
3. 更新 API 调用使用 `lib/api.ts`
4. 配置环境变量

### 如果手动集成

1. 安装 Supabase 依赖
2. 创建 Supabase 客户端文件
3. 配置环境变量
4. 现有代码基本无需修改（API 调用保持不变）

## 📚 相关资源

- [Supabase Next.js 文档](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase SSR 文档](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 官方 Supabase 示例](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)

## ✅ 配置检查清单

- [ ] 安装 `@supabase/ssr` 和 `@supabase/supabase-js`
- [ ] 创建 `lib/supabase/client.ts`
- [ ] 创建 `lib/supabase/server.ts`（如需服务端）
- [ ] 配置 `.env.local` 环境变量
- [ ] 创建 `middleware.ts`（如需认证）
- [ ] 测试 Supabase 连接

现在你可以同时使用 Supabase 的便利功能和 FastAPI 的强大后端！

