# 全栈性能优化经验文档

> **本文档记录了芯师爷官网项目全栈性能优化的全部经验教训，供后续 AI 工具和开发者参考复用。**
>
> 项目类型：Next.js 16 App Router + React 19 + Prisma 6 + PostgreSQL 全栈应用

---

## 目录

1. [跨层级性能规范](#1-跨层级性能规范)
2. [前端渲染规范](#2-前端渲染规范)
3. [后端/API 规范](#3-后端api-规范)
4. [数据库规范](#4-数据库规范)
5. [Middleware 规范](#5-middleware-规范)
6. [已验证的优化模式速查表](#6-已验证的优化模式速查表)
7. [已修复的典型反模式](#7-已修复的典型反模式)

---

## 1. 跨层级性能规范

### 1.1 ISR 缓存策略

> **适用场景：** 所有前台展示页（列表页、详情页）

```typescript
// ✅ 正确 — 每次页面顶部声明的 ISR 策略
export const revalidate = 60;    // 增量静态再生成间隔（秒）
export const maxDuration = 30;   // Serverless Function 超时（秒）
```

**存量页面检查清单：**
- [ ] `src/app/(marketing)/articles/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/articles/[slug]/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/companies/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/companies/[slug]/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/events/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/events/[id]/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/jobs/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/jobs/[id]/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/reports/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/reports/[id]/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/awards/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/(marketing)/awards/[slug]/page.tsx` — `revalidate = 60` ✅
- [ ] `src/app/admin/(app)/dashboard/page.tsx` — `revalidate = 30` ✅

### 1.2 数据获取错误处理

> **适用场景：** 所有服务端数据获取

```typescript
// ✅ 正确 — safeQuery 包装器
const data = await safeQuery(
  () => prisma.article.findMany({ ... }),
  [],                          // fallback 值
  "articles-list",             // 标签（日志用）
);

// ❌ 错误 — 裸 Prisma/API 调用无 try/catch
const data = await prisma.article.findMany({ ... });
```

`safeQuery` 的职责：
- `try/catch` 捕获异常
- 记录日志（含标签便于定位）
- 返回 fallback 值确保页面永远可渲染

> **注意：** `safeQuery` 当前定义在 `src/lib/data/safe-query.ts`

### 1.3 查询去重

> **适用场景：** 存在 `generateMetadata` + 页面组件各查一次的场景

```typescript
// ✅ 正确 — React.cache() 同请求内共享
export const getPublishedArticleBySlug = cache(async (slug: string) =>
  safeQuery(() => prisma.article.findFirst({ ... }), null, "public-article"),
);
```

**Principle：** `generateMetadata` 和 Page 组件如果调用同一数据函数，务必确保该函数被 React `cache()` 包裹。否则同一个请求会执行两次相同的 DB 查询。

### 1.4 并行查询

> **适用场景：** 一个页面需要多个独立数据

```typescript
// ✅ 正确 — Promise.all 并行
const [articles, companies, events] = await Promise.all([
  getArticles(),
  getCompanies(),
  getEvents(),
]);

// ❌ 错误 — 串行等待
const articles = await getArticles();     // 等2s
const companies = await getCompanies();   // 再等2s
const events = await getEvents();         // 再等2s
// 总计 6s vs 并行 2s
```

---

## 2. 前端渲染规范

### 2.1 优先 Server Component

> **原则：** 能不 "use client" 就不 client。纯展示+数据获取的组件应是 Server Component。

```typescript
// ✅ 正确 — 服务端组件（默认）
export default async function Page() {
  const data = await getData();
  return <div>{data.map(...)}</div>;
}

// ❌ 只做数据获取就标记 "use client" — 增加了客户端 JS 体积
```

**决定是否用 client 的判断：**
- 需要 `useState/useEffect/onClick` → Client Component
- 纯数据获取 + 渲染 → Server Component
- 纯展示的列表/详情页 → Server Component

### 2.2 移除 `setTimeout(0)` 反模式

> **警告：** Next.js 中永远不要在 `useEffect` 中使用 `setTimeout(() => fetchX(), 0)`

```typescript
// ❌ 错误 — 多余的 0ms 微任务延迟
useEffect(() => {
  const timer = setTimeout(() => {
    void fetchData();
  }, 0);
  return () => clearTimeout(timer);
}, [fetchData]);

// ✅ 正确 — 直接调用
useEffect(() => {
  void fetchData();
}, [fetchData]);
```

`setTimeout(0)` 将任务推到下一个事件循环周期，在 React 18+ 中完全没有必要，只会让用户看到多一次 loading 态闪烁。

### 2.3 避免不必要的 Suspense 拆分

> **经验教训：** Suspense 不是免费的。每个 Suspense 边界增加网络分块开销。

```typescript
// ✅ 适合 Suspense 场景：Layout Header/Footer 等非首屏关键区块
<Suspense fallback={<HeaderFallback />}>
  <HeaderLoader />
</Suspense>

// ❌ 不适合 Suspense 场景：首页各区块数据源互相独立但有批量缓存
// 原来一个 getHomePageDataSafe() 中 6 个查询 Promise.all 并行，
// 拆成 10 个独立 Suspense 后各查各的，反而多了重复查询
```

**Suspense 法则：** 
- 对**跨请求共享数据**（都在一次 DB 查询中完成）不要拆分
- 对**确实可独立获取、且非首屏关键**的区块（导航、页脚）才拆分
- 如果拆分导致同一种数据被多次获取（如 articlePool 被两个区块各查一次），就不要拆

### 2.4 Loading 骨架屏

> **适用场景：** 列表页、详情页

骨架屏（Skeleton Screen）应在 `loading.tsx` 中实现，与页面内容结构匹配。骨架屏应尽量还原布局比例以防止布局偏移（CLS）。

---

## 3. 后端/API 规范

### 3.1 Cookie 解析

> **适用场景：** 所有 API 路由

```typescript
// ❌ 错误 — 正则解析 Cookie 头（慢、易错）
const cookieHeader = req.headers.get("cookie") || "";
const match = cookieHeader.match(new RegExp(`...${SESSION_COOKIE_NAME}=([^;]*)`));

// ✅ 正确 — NextRequest.cookies API（快、类型安全）
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
}
```

**性能差异：** 正则解析每次请求消耗约 0.01-0.1ms（请求多时可累积），使用原生 `cookies` API 为 0ms（框架层已解析）。

### 3.2 API 路由认证模式

> **简化原则：** Middleware 只负责页面路由认证。API 路由的认证由路由自身处理。

```typescript
// Middleware matcher — 只匹配页面路由，不匹配 API
export const config = {
  matcher: ["/admin/:path*", "/enterprise/:path*", "/api/auth/login"],
};
```

这样：
- API 路由不会被 Middleware 拦截，减少不必要的 JWT 校验
- 路由自身的认证函数（`getAdminFromRequest`）在真正需要时才被执行
- 减少了一轮中间件→路由的往返

### 3.3 Session 校验缓存

> **场景：** 同请求内多次校验

```typescript
// ✅ 正确 — 使用 React.cache() 避免同请求内重复 JWT 验证
export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  ...
});
```

---

## 4. 数据库规范

### 4.1 Prisma 连接预热

```typescript
// ✅ instrumentation.ts — 在服务器启动时预热数据库连接
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmPrismaConnection } = await import("@/lib/prisma");
    await warmPrismaConnection();
  }
}
```

**效果：** 首个请求不再需要等待数据库连接池建立，节省约 200-500ms。

### 4.2 Prisma 单例

```typescript
// ✅ 正确 — 全局单例 + 开发环境热重载保护
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

globalForPrisma.prisma = prisma;
```

### 4.3 Lead 查询模式

| 模式 | 适用场景 |
|------|---------|
| `prisma.findMany({ select: {...} })` | 列表页 — 只选需要的字段，不使用 `include` 一次性加载所有关联 |
| `prisma.findMany({ include: { relation: { select: {...} } } })` | 需要关联数据的详情页 — 一次 JOIN 代替 N+1 |
| `prisma.$queryRaw` | 复杂统计聚合（后台图表） |
| `prisma.groupBy` | 分组统计（行业分布、状态分布） |

---

## 5. Middleware 规范

### 5.1 避免模块级副作用

```typescript
// ❌ 错误 — 模块级别 setInterval，每次服务器启动/热更新时创建
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
if (typeof setInterval !== "undefined") {
  setInterval(() => { /* 清理过期条目 */ }, 300_000);
}

// ✅ 正确 — 延迟到首次使用时初始化
let rateLimitMap: Map<string, { count: number; resetAt: number }> | undefined;

function getRateLimitMap() {
  if (!rateLimitMap) rateLimitMap = new Map();
  return rateLimitMap;
}
```

**教训：** Middleware 的模块作用域代码在每次服务器冷启动/热更新时执行。`setInterval` 等副作用应延迟到首次使用时再创建。

### 5.2 Middleware matcher 精简原则

```typescript
export const config = {
  // ✅ 只匹配路径最少的必要前缀，让框架做快速前缀匹配
  matcher: ["/admin/:path*", "/enterprise/:path*", "/api/auth/login"],
};
```

避免匹配 `/api/` 等宽泛前缀，让 API 路由自行处理认证。

---

## 6. 已验证的优化模式速查表

| 模式 | 文件位置 | 效果 |
|------|---------|------|
| ISR 缓存 + safeQuery | 所有前台列表/详情页 | 稳定后 <55ms 响应 |
| Layout 流式导航 | `(marketing)/layout.tsx` | 首帧不等待导航数据 |
| instrumentation 预热 | `src/instrumentation.ts` | 冷启动 -200~500ms |
| NextRequest.cookies | `admin-api.ts`, `enterprise-api.ts` | 减少 Cookie 解析延迟 |
| React.cache() 去重 | `public-detail.ts` | 消除 generateMetadata + Page 双查询 |
| Promise.allSettled | `admin-stats.ts` | 单查询失败不丢失全局 |
| Promise.all 并行 | `home.ts` | 6 个查询同时发出 |
| middleware matcher 精简 | `middleware.ts` | 减少 API 路径不必要拦截 |

---

## 7. 已修复的典型反模式

### H1. Middleware 模块级 setInterval
- **发现：** `middleware.ts` 在模块作用域执行 `setInterval(() => {...}, 300_000)`，且 `matcher` 匹配过多路径
- **修复：** 移除 setInterval；checkRateLimit 改为按需调用；matcher 只匹配 `/admin/:path*`、`/enterprise/:path*`、`/api/auth/login`
- **效果：** 消除每次服务器冷启动/热更新的副作用

### H2. Cookie 正则解析
- **发现：** `admin-api.ts` 和 `enterprise-api.ts` 使用 `cookieHeader.match(new RegExp(...))` 手动解析 Cookie
- **修复：** 替换为 `req.cookies.get(SESSION_COOKIE_NAME)?.value`
- **效果：** 消除重复的正则计算，利用框架层预解析

### H3. Prisma 冷启动
- **发现：** 第一个请求需等待 Prisma 建立数据库连接池
- **修复：** 新增 `instrumentation.ts` + `warmPrismaConnection()`
- **效果：** 首个请求节省 200-500ms

### H4. setTimerout(0) 延迟获取
- **发现：** 11 个 Admin/Enterprise 列表页使用 `setTimeout(() => void fetchX(), 0)`
- **修复：** 直接调用 `void fetchX()`
- **效果：** 消除每个列表页 0ms 微任务延迟

### H5. Promise.all → Promise.allSettled
- **发现：** `admin-stats.ts` 6 个查询共用 `Promise.all`，任一失败全量丢失
- **修复：** 切换为 `Promise.allSettled`，逐查询降级
- **效果：** 单查询失败不影响其他统计

### H6. 首页 Suspense 过度拆分
- **发现：** 将首页 10 个区块拆为独立 Suspense，各自独立查库，导致查询重复（`getArticlePool` 查 2 次、`getActivePublicPageSectionsMap` 查 3 次）
- **修复：** 回退到单一 `getHomePageDataSafe()` 调用（内部 `Promise.all` 批量并行）
- **效果：** 首页稳定响应时间从 ~200ms 降至 ~53ms

---

## 附录：性能数据基准

以下是在本地开发环境（PostgreSQL + 本地网络）测得的基准性能：

| 页面类型 | 冷启动 | 路由编译后 | ISR 缓存命中 | 备注 |
|---------|--------|-----------|-------------|------|
| 首页 | 438ms | 79ms | 53ms | 60s ISR |
| 列表页 | — | 184-352ms | 21-32ms | 60s ISR |
| 详情页 | — | 150-300ms | 20-40ms | 60s ISR + React.cache |
| 管理后台 | — | 300-600ms | — | 客户端 fetch (受 API 路由冷启动影响) |
| Admin API | — | 260-650ms | — | 首次调用含 Prisma + route 编译 |
