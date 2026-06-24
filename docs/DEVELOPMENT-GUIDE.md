# 开发指南

## 环境要求

- **Node.js** >= 20.x（推荐 22 LTS 或 24 LTS）
- **Docker Desktop**（本地数据库 + 搜索引擎）
- **npm** 10+（推荐使用 npm —— 项目未锁 pnpm/yarn）

## 本地开发环境搭建

### 1. 克隆并安装依赖

```bash
git clone <repo-url> xsy-website
cd xsy-website/web
npm install
```

### 2. 启动基础设施

```bash
# 在项目根目录
docker compose up -d

# 验证服务状态
docker compose ps
```

此命令启动：
- PostgreSQL 16（`localhost:5432`）
- Redis 7（`localhost:6379`）
- Meilisearch v1.14（`localhost:7700`）

### 3. 配置环境变量

```bash
cd web
cp .env.example .env
```

编辑 `.env`，**必须**设置：
- `SESSION_SECRET` — 至少 32 字符随机字符串（生产环境必须通过 Vercel Environment Variables 设置）
- `SEED_DEMO_PASSWORD` — 至少 12 字符，仅供本地种子数据使用

### 4. 数据库迁移与种子

```bash
cd web
npx prisma migrate deploy
npm run db:seed
```

### 5. 同步搜索索引（可选）

```bash
npm run search:sync
```

### 6. 启动开发服务器

```bash
npm run dev
# 或 Turbo 模式（更快但资源占用更高）
npm run dev:turbo
```

访问 http://localhost:3002

---

## 演示账号

种子脚本创建以下测试账号：

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 超级管理员 | `admin@xinshiye.dev` | `.env` 中的 `SEED_DEMO_PASSWORD` |
| 企业用户 | `enterprise@xinshiye.dev` | `.env` 中的 `SEED_DEMO_PASSWORD` |

- 运营后台：http://localhost:3002/admin/login
- 企业后台：http://localhost:3002/enterprise/login

---

## 编码规范

### 命名约定

| 类别 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `SiteHeader.tsx` |
| 普通文件/目录 | kebab-case | `page-sections.ts` |
| 函数/变量 | camelCase | `getHomePageData()` |
| 类型/接口 | PascalCase | `HomePagePayload` |
| 数据库枚举 | UPPER_SNAKE_CASE | `PENDING_REVIEW` |
| 路由参数 | camelCase / kebab-case | `[itemId]` |

### 导入顺序

```typescript
// 1. 外部库
import { NextResponse } from "next/server";
import { prisma } from "@prisma/client";

// 2. 项目内部库
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth/session";

// 3. 组件
import { SiteHeader } from "@/components/layout/site-header";

// 4. 类型/常量
import type { AdminUser } from "@/lib/admin-auth";
```

### 组件模式

**Server Components（默认选择）：**

```typescript
// 直接获取数据、渲染 HTML
export default async function Page() {
  const data = await getData();
  return <ClientComponent data={data} />;
}
```

**Client Components（需要交互时）：**

```typescript
"use client";
import { useState } from "react";

export function InteractiveButton() {
  const [loading, setLoading] = useState(false);
  // ...
}
```

### API 路由模式

```typescript
import { NextRequest } from "next/server";
import { getAdminFromRequest, unauthorized, ok } from "@/lib/admin-api";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  
  // ... business logic
  return ok(data);
}
```

### 数据层模式

```typescript
// 1. 定义查询函数
async function fetchData() { ... }

// 2. 包装缓存
const getCachedData = unstable_cache(fetchData, ["key"], { revalidate: 60 });

// 3. 安全导出（含降级）
export async function getDataSafe(): Promise<DataType> {
  try { return await getCachedData(); } catch {}
  try { return await fetchData(); } catch {}
  return fallbackValue;
}
```

---

## 可用脚本

在 `web/` 目录下运行：

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（Webpack，端口 3002） |
| `npm run dev:turbo` | Turbo 模式开发（更快） |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |
| `npm run test` | 运行单元测试（Vitest） |
| `npm run test:watch` | Watch 模式单元测试 |
| `npm run test:e2e` | 运行 E2E 测试（Playwright 无头） |
| `npm run test:e2e:ui` | Playwright UI 模式 |
| `npm run db:migrate` | 执行数据库迁移 |
| `npm run db:push` | 直接推送 schema 变更 |
| `npm run db:seed` | 运行种子数据 |
| `npm run db:studio` | 启动 Prisma Studio |
| `npm run search:sync` | 同步 Meilisearch 索引 |

---

## 常见问题

### 数据库连接失败

```bash
# 检查 PostgreSQL 是否运行
docker compose ps

# 检查日志
docker compose logs postgres

# 确认 .env 中 DATABASE_URL 正确
```

### Prisma 迁移问题

```bash
# 重置数据库（清空数据）
npx prisma migrate reset

# 创建新的迁移
npx prisma migrate dev --name describe_change

# 查看迁移状态
npx prisma migrate status
```

### 搜索无结果

```bash
# 需要先同步索引
npm run search:sync

# 验证 Meilisearch 状态
curl http://localhost:7700/health
```

### 开发环境图片不显示

Next.js 配置中 `images.unoptimized = !isProd` —— 开发环境不对图片进行优化，以避免 Docker Desktop 网络问题。生产环境需在 `remotePatterns` 中添加相应的图片 CDN。

---

## Git 工作流

```bash
# 从 main 分支切出功能分支
git checkout -b feat/your-feature

# 遵循 Conventional Commits 规范
git commit -m "feat: 添加某某功能"
git commit -m "fix: 修复某某问题"
git commit -m "perf: 优化某某性能"
git commit -m "refactor: 重构某某模块"

# 合并回 main
git checkout main
git merge feat/your-feature
```

当前分支策略为直接推送 main（单人开发阶段）；团队协作后建议启用 PR Review。
