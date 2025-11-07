# AI 财务与投手管理系统 - 开发文档（修订版 v3）

这版是在你现有文档的基础上，把下面几件事补齐了：

1. 把 **bolt.new 是主要前端生产工具** 这件事写清楚了（之前只是提到了）
2. 把 **Cursor / Claude Code 在哪个步骤用、要怎么提示** 写清楚了
3. 把 **Supabase 的 RLS、本地调试、环境变量命名、接口命名规范** 补上了
4. 把 **渠道 = 代理** 的业务口径固定下来，避免前后端叫法不一致
5. 把 **你说KPI以后做、不在这一期实现** 也写进了“非本期范围”
6. 把“容易踩坑的点”挑出来放到了文档里，防止你下次再遇到 bolt 生成空白页、API 写死、RLS 不开这种事

下面是修订后的完整版本，你可以直接丢给 Claude / Cursor，当成项目说明用。

---

## 0. 背景说明

本系统的目标有两层：

1. **财务侧**：让财务不再对着 Excel 手工对账，日报录一次，财务记一次，系统自动比对；
2. **运营侧**：让你能看到「今天每个投手在干什么、手里几个户、哪些户在烧、哪些渠道给的户是沉的」。

所以后端是“比较严肃的业务系统”，前端是“可以用 AI 快速生成的录入 + 列表界面”。文档里的所有规范，都是为了这两个目标服务的。

---

## 1. 总体架构

```text
浏览器 (投手/财务/户管/管理层)
        ↓
Next.js 14 前端（由 bolt.new 生成初版 → 在 Cursor 里重构 → 接后端）
        ↓
FastAPI 后端（统一接口风格 /api/...）
        ↓
Supabase PostgreSQL （开启 RLS，行级权限）
```

- 前端：**不手写也行，用 bolt.new 拉出来，再在 Cursor 里改成统一风格**
- 后端：你现在的 FastAPI 结构可以继续沿用
- 数据库：Supabase，上来要先开 RLS，不然后面所有表都变“Unrestricted”

---

## 2. 业务口径固定

这一版开始，名称统一成这样：

| 业务词 | 系统里叫 | 说明 |
|--------|----------|------|
| 代理 | 渠道（channel） | 你刚说了“渠道跟代理是一个意思”，这里统一叫 channel |
| 投手 | operator | 人 |
| 项目 | project | 收入归属的业务 |
| 日报 / 消耗 | ad_spend_daily | 投手每天报的消耗 |
| 财务收支 | ledger_transactions | 财务记账 |
| 对账结果 | reconciliation | 系统比出来的结果 |

这样前端、后端、数据库就不会一个叫 agent，一个叫 channel，一个叫 supplier 了。

---

## 3. 环境与配置

### 3.1 前端 `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_NAME=AI财务与投手管理系统
```

**要求：**
- bolt.new 生成的代码里 **禁止写死** `http://localhost:8000/api`
- 一律用 `process.env.NEXT_PUBLIC_API_BASE_URL`

### 3.2 后端 `backend/.env`

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_KEY=...   # service role
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
SECRET_KEY=...
```

**注意点：** CORS 不要写 `*`，不然浏览器会骂你。

---

## 4. Supabase 必修步骤

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_spend_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_channels ENABLE ROW LEVEL SECURITY;
```

投手策略示例：

```sql
CREATE POLICY "operator_can_view_own_spend" ON ad_spend_daily
FOR SELECT
USING (operator_id = auth.uid());
```

---

## 5. 前端开发方式（bolt.new + Cursor）

### 5.1 开发顺序

1. 先写后端 API；
2. 再用 bolt.new 生成页面；
3. 最后粘回 Cursor，做结构与风格统一。

### 5.2 bolt.new 提示语库（示例）

> 使用原则：描述清楚「页面目的、数据来源、交互状态、UI 限制」，避免模糊词语。

**5.2.1 表单 + 列表页面模板**

```
请用 Next.js 14 App Router + TypeScript + Tailwind CSS 编写 `/report/spend` 页面：

- 页面布局：桌面端左侧为表单（宽 420px），右侧为提交历史列表；移动端上下排列。
- 表单字段：日期、项目（下拉，来自 GET /api/projects?status=active）、渠道（下拉，来自 GET /api/channels/projects/{project_id}/channels）、投手（下拉，来自 GET /api/operators?project_id=...&status=active）、平台、金额、备注。
- 提交：POST /api/ad-spend，使用 `NEXT_PUBLIC_API_BASE_URL` 环境变量拼接；提交成功重置表单，显示成功提示；后端若返回 warning 字段，需要黄色提示框展示。
- 交互：加载态、失败态（展示后端 error 字段）、成功态均需样式；禁止使用 inline style。
- 历史列表：最近 20 条记录，调用 GET /api/ad-spend?limit=20，展示日期、项目、渠道、金额、状态。
- 类型要求：所有接口响应使用已有 `ApiResponse<T>` 泛型，严格模式无隐式 any。
```

**5.2.2 数据看板页面模板**

```
请生成渠道绩效看板页面 `/analytics/channel`：
- 使用 Next.js 14 + Tailwind + shadcn/ui Card。
- 数据来源：GET /api/channels/stats?start_date=&end_date=。
- 显示 KPI 卡片（总消耗、记录数）、趋势图（recharts）、渠道排名表。
- 需要加载、错误、空数据提示。
- 所有 fetch 通过 `lib/api.ts` 中的 `apiRequest`。
```

### 5.3 Cursor 整理提示语（示例）

重构时让 Cursor 做「结构调整 + 接口对接 + 代码规范」，参考以下提示：

```
请把刚粘贴的 bolt.new 代码重构为项目规范：
- 迁移到 `frontend/app/report/spend/page.tsx`，保持客户端组件。
- 使用我们已有的 `getProjects`、`getProjectChannels`、`getOperators` API 方法。
- Tailwind 类名符合文档约定（按钮使用 `bg-blue-600 hover:bg-blue-700`）。
- 把投手下拉改为从 API 动态加载，默认选项“请选择投手”。
- 添加 `useEffect` 处理中断时的取消（AbortController）。
- 保留 bolt.new 生成的 UI 结构，但去掉任何内联样式。
```

如果需要 Cursor 批量梳理样式，可补充：「请统一按钮、表格、Card 的 Tailwind 语义，参考 `styles/theme.md`」。

---

## 6. 后端接口规范

### 6.1 命名规则

- 一律用复数资源：`/api/projects`、`/api/channels`
- CRUD 操作：`GET / POST / PUT / DELETE`

### 6.2 返回格式统一

```json
{
  "data": {},
  "error": null,
  "meta": {
    "total": 100,
    "limit": 10
  },
  "warning": "当日消耗比昨日高出30%，请确认"
}
```

### 6.3 当前已实现 API 列表

| 模块 | 方法 | 路径 | 描述 | 鉴权/角色 |
|------|------|------|------|-----------|
| 项目 | GET | `/api/projects` | 查询项目列表（支持状态分页） | `finance/account_mgr/admin` |
| 项目 | POST | `/api/projects` | 创建项目 | `admin` |
| 项目 | PUT | `/api/projects/{id}` | 更新项目 | `admin` |
| 投手 | GET | `/api/operators` | 查询投手列表（支持项目筛选） | `finance/account_mgr/admin` |
| 投手 | POST | `/api/operators` | 创建投手 | `account_mgr/admin` |
| 渠道 | GET | `/api/channels` | 查询渠道列表 | `account_mgr/admin` |
| 渠道 | POST | `/api/channels` | 创建渠道 | `account_mgr/admin` |
| 渠道 | GET | `/api/channels/projects/{project_id}/channels` | 获取项目关联渠道 | `account_mgr/admin` |
| 渠道 | POST | `/api/channels/projects/{project_id}/channels` | 关联渠道到项目 | `account_mgr/admin` |
| 渠道 | GET | `/api/channels/stats` | 渠道统计数据 | `account_mgr/manager/admin` |
| 日报 | GET | `/api/ad-spend` | 查询消耗上报列表 | `operator`（仅本人）/`finance/admin` |
| 日报 | POST | `/api/ad-spend` | 创建消耗上报 | `operator` |
| 财务 | POST | `/api/ledger` | 创建财务记录 | `finance/admin` |
| 对账 | POST | `/api/reconcile/run` | 执行对账 | `finance/admin` |
| 对账 | GET | `/api/reconcile` | 查询对账结果 | `finance/admin` |

> **注意**：所有写操作需要记录 `created_by`/`updated_by`，对应 Supabase RLS 策略需限制角色可见数据范围。

---

## 7. 渠道（代理）模块

- `channels`：代理/渠道来源  
- `project_channels`：项目与渠道关联  
- 在 `ad_spend_daily` 加字段 `channel_id`  

---

## 8. 非本期范围

- KPI 考核与投手绩效发放  
- 自动工资结算  
- 多租户支持  
- 审批流  
- BI 可视化报表

---

## 9. 开发阶段计划

| 阶段 | 任务 | Claude 提示语 |
|------|------|----------------|
| 阶段 1 | Supabase 数据表 + RLS | 生成建表 SQL，包含项目、投手、渠道等表 |
| 阶段 2 | FastAPI API 层 | 生成标准 CRUD 接口 |
| 阶段 3 | bolt.new 前端页面 | 用模板 prompt 生成前端页面 |
| 阶段 4 | Cursor 重构集成 | 重构为统一结构 |
| 阶段 5 | 部署与联调 | PM2 + Nginx 部署 |

---

## 10. 常见坑

1. Supabase 表没开 RLS → 数据全开放。  
2. bolt.new 写死 API → 调不到后端。  
3. Cursor 重构时忘加 token → 接口 401。  
4. 渠道字段没传 → 报表空白。  
5. Next.js 编译慢 → 建议使用 Standalone 模式。

---

## 11. 联调与验收清单

| 检查项 | 说明 | 工具 |
|--------|------|------|
| API 调用域名 | 前端所有请求使用 `NEXT_PUBLIC_API_BASE_URL`，无硬编码 | 浏览器 Network 面板 |
| 鉴权与角色 | 不同角色访问受限（operator 仅看自己数据） | Supabase RLS + Postman |
| 表单状态 | 每个页面具备加载态、错误提示、成功提示、警告提示 | 手工测试 |
| 渠道必填 | `POST /api/ad-spend` 必传 `channel_id`，UI 禁用提交空渠道 | 单元测试 + 手测 |
| RLS 生效 | Supabase Dashboard → Table Editor → 验证匿名访问受限 | Supabase 控制台 |
| 日志记录 | 后端写操作记录 `created_by/updated_by` | 数据库检查 |
| 构建模式 | Next.js 使用 Standalone 输出 | `frontend/next.config.ts` |

验收时请按模块逐项打勾，避免上线后回归遗漏。

---

## 12. Cursor 开发规范与项目约束

### 12.1 代码风格与格式规范

#### 12.1.1 TypeScript 严格模式配置
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### 12.1.2 Prettier 配置
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

#### 12.1.3 ESLint 规则
```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "prefer-const": "error"
  }
}
```

### 12.2 文件组织结构规范

#### 12.2.1 前端目录结构
```
frontend/
├── app/
│   ├── (dashboard)/           # 路由组
│   │   ├── report/
│   │   │   ├── spend/
│   │   │   │   └── page.tsx   # 消耗上报页面
│   │   │   └── revenue/       # 收入上报页面
│   │   ├── analytics/         # 数据分析页面
│   │   └── settings/          # 设置页面
│   ├── api/                   # API路由（如有需要）
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                    # shadcn/ui组件
│   ├── forms/                 # 表单组件
│   ├── charts/                # 图表组件
│   └── layout/                # 布局组件
├── lib/
│   ├── api.ts                 # API调用封装
│   ├── auth.ts                # 认证相关
│   ├── utils.ts               # 工具函数
│   └── validations.ts         # 表单验证
├── types/
│   ├── api.ts                 # API类型定义
│   ├── business.ts            # 业务类型
│   └── index.ts
└── hooks/
    ├── use-api.ts             # API调用Hook
    └── use-auth.ts            # 认证Hook
```

#### 12.2.2 命名规范
```typescript
// 文件命名：kebab-case
spend-report-page.tsx
channel-analytics.tsx

// 组件命名：PascalCase
const SpendReportForm = () => {...}
const ChannelAnalyticsCard = () => {...}

// 变量/函数命名：camelCase
const handleSubmit = () => {...}
const channelList = [...]
const isLoading = false

// 常量命名：SCREAMING_SNAKE_CASE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const MAX_FILE_SIZE = 5 * 1024 * 1024

// 类型/接口命名：PascalCase，以I开头（接口）或T开头（类型）
interface IApiResponse<T> {...}
type TChannelStatus = 'active' | 'inactive'
```

### 12.3 API 调用规范

#### 12.3.1 统一API调用方法
```typescript
// lib/api.ts
class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<IApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      });

      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }

      return await response.json();
    } catch (error) {
      console.error('API请求失败:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();

// 具体API方法
export const api = {
  projects: {
    getAll: (params?: ProjectListParams) =>
      apiClient.request<Project[]>('/projects', { method: 'GET', ...params }),
    create: (data: CreateProjectDto) =>
      apiClient.request<Project>('/projects', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
  },
  adSpend: {
    create: (data: CreateAdSpendDto) =>
      apiClient.request<AdSpend>('/ad-spend', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
  },
};
```

#### 12.3.2 错误处理规范
```typescript
// lib/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// 统一错误处理Hook
export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          // 跳转到登录页
          router.push('/login');
          break;
        case 403:
          toast.error('权限不足');
          break;
        case 500:
          toast.error('服务器错误，请稍后重试');
          break;
        default:
          toast.error(error.message || '请求失败');
      }
    } else {
      toast.error('未知错误');
    }
  }, []);

  return { handleError };
};
```

### 12.4 组件开发规范

#### 12.4.1 函数组件模板
```typescript
// components/forms/SpendReportForm.tsx
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useErrorHandler } from '@/hooks/use-error-handler';
import type { CreateAdSpendDto } from '@/types/api';

interface SpendReportFormProps {
  onSuccess?: () => void;
  projectId?: string;
}

export const SpendReportForm: React.FC<SpendReportFormProps> = ({
  onSuccess,
  projectId
}) => {
  const { handleError } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateAdSpendDto>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      project_id: projectId || '',
    }
  });

  const selectedProjectId = watch('project_id');

  const onSubmit = useCallback(async (data: CreateAdSpendDto) => {
    setIsLoading(true);
    try {
      await api.adSpend.create(data);
      toast.success('消耗上报成功');
      reset();
      onSuccess?.();
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [handleError, reset, onSuccess]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>消耗上报</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 表单字段 */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? '提交中...' : '提交'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
```

#### 12.4.2 样式规范
```typescript
// 使用Tailwind CSS类的规范
const buttonStyles = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
};

const spacingStyles = {
  container: 'p-6',
  card: 'p-4',
  form: 'space-y-4',
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md',
};

// 禁止内联样式
// ❌ 错误
<div style={{ backgroundColor: 'red', padding: '10px' }}>

// ✅ 正确
<div className="bg-red-500 p-2.5">
```

### 12.5 状态管理规范

#### 12.5.1 数据获取模式
```typescript
// hooks/use-api-data.ts
import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export function useApiData<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetcher();
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
```

### 12.6 Git 提交规范

#### 12.6.1 Commit Message 格式
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例:**
```
feat(report): add channel selection to spend report form

- Add channel dropdown based on selected project
- Implement channel API integration
- Add form validation for required fields

Closes #123
```

### 12.7 Cursor 提示语模板库

#### 12.7.1 创建新组件提示语
```
请创建一个符合项目规范的组件：
- 使用 TypeScript + Next.js 14 App Router
- 遵循项目的命名规范和文件结构
- 使用 shadcn/ui 组件库
- 包含完整的类型定义和错误处理
- 使用项目统一的 API 调用方式
- 样式使用 Tailwind CSS，符合设计规范
- 添加适当的加载状态和错误提示
```

#### 12.7.2 API 集成提示语
```
请为这个组件集成 API：
- 使用 lib/api.ts 中的统一 API 调用方法
- 实现完整的错误处理逻辑
- 添加加载状态管理
- 使用 useErrorHandler Hook 处理错误
- 确保类型安全，使用项目定义的 TypeScript 类型
- 实现数据重新获取机制
```

#### 12.7.3 代码重构提示语
```
请重构代码以符合项目规范：
- 统一命名规范（变量、函数、组件）
- 使用项目定义的类型和接口
- 应用统一的错误处理模式
- 优化组件性能（useCallback, useMemo）
- 确保代码可读性和可维护性
- 遵循项目的目录结构规范
```

### 12.8 代码质量检查清单

在提交代码前，确保以下检查项：

- [ ] 所有 TypeScript 错误已修复
- [ ] ESLint 检查通过
- [ ] 组件有正确的 PropTypes 或 TypeScript 类型
- [ ] API 调用包含错误处理
- [ ] 表单有验证逻辑
- [ ] 加载状态和错误状态已处理
- [ ] 没有硬编码的 API 地址或配置
- [ ] 组件可访问性（a11y）考虑
- [ ] 响应式设计适配
- [ ] 代码注释清晰必要

### 12.9 性能优化规范

```typescript
// 使用 React.memo 优化组件
export const ChannelCard = React.memo<ChannelCardProps>(({ channel }) => {
  return (
    <Card>
      {/* 组件内容 */}
    </Card>
  );
});

// 使用 useMemo 优化计算
const filteredChannels = useMemo(() => {
  return channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}, [channels, searchTerm]);

// 使用 useCallback 优化函数
const handleChannelSelect = useCallback((channelId: string) => {
  setSelectedChannel(channelId);
}, []);
```

---

## 13. 结语

这版文档确保：
- bolt.new / Cursor / Claude 三个工具能协同开发；
- Supabase 与后端对齐；
- 业务口径（渠道=代理）统一；
- 本期不被 KPI 等额外需求拖累；
- Cursor 开发有明确的代码规范和质量标准。
