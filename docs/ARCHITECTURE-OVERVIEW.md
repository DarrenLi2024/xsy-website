# 架构总览

> **项目：** 芯师爷官网 — 半导体产业垂直媒体与服务平台
>
> **代码库结构：** Monorepo（根目录规划文档 + `web/` 全栈应用）

---

## 技术栈

| 层 | 技术 | 版本 |
|----|------|------|
| **框架** | Next.js (App Router) | 16.2.6 |
| **UI 库** | React | 19.2.4 |
| **样式** | Tailwind CSS | v4 |
| **语言** | TypeScript | 5.x |
| **ORM** | Prisma | 6.19.0 |
| **数据库** | PostgreSQL 16 (Supabase 生产 / Docker 本地) | — |
| **全文搜索** | Meilisearch | v1.14 |
| **缓存** | Redis 7（预留）/ Next.js `unstable_cache`（ISR） | — |
| **认证** | JWT (jose) + bcryptjs | — |
| **图表** | Chart.js + react-chartjs-2 | — |
| **测试** | Vitest + Playwright | — |
| **部署** | Vercel (Fluid Compute) | — |
| **容器化** | Docker Compose | — |

---

## 目录结构

```
xsy-website/
├── docs/                           # 产品 & 规划文档
│   ├── 01-项目愿景与价值主张.md
│   ├── 02-产品需求规格说明书.md
│   ├── 03-技术架构方案.md
│   ├── 04-前端设计与UX策略.md
│   ├── 05-数据模型设计.md
│   ├── 06-项目开发计划.md
│   ├── 07-部署与运维方案.md
│   ├── 08-首页开发结构说明.md
│   ├── API-REFERENCE.md            # ← API 文档
│   └── ARCHITECTURE-OVERVIEW.md    # ← 本文件
├── web/                            # Next.js 全栈应用
│   ├── prisma/
│   │   ├── schema.prisma           # 数据模型（~520 行）
│   │   ├── seed.ts                 # 种子数据
│   │   └── migrations/             # Prisma 迁移
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # 根布局（字体、SEO metadata）
│   │   │   ├── not-found.tsx       # 全局 404
│   │   │   ├── global-error.tsx    # 全局错误边界
│   │   │   ├── (marketing)/        # 前台展示（Route Group）
│   │   │   │   ├── layout.tsx      # 前台布局（Header + Footer）
│   │   │   │   ├── page.tsx        # 首页（含 ISR 60s）
│   │   │   │   ├── articles/      # 资讯列表/详情
│   │   │   │   ├── companies/     # 企业黄页/详情
│   │   │   │   ├── events/        # 活动日历/详情
│   │   │   │   ├── jobs/          # 招聘列表/详情
│   │   │   │   ├── reports/       # 报告列表/详情
│   │   │   │   ├── awards/        # 评选/详情
│   │   │   │   ├── search/        # 搜索页
│   │   │   │   └── about/         # 关于页
│   │   │   ├── admin/              # 运营后台
│   │   │   │   ├── login/         # 管理员登录
│   │   │   │   ├── (app)/         # 已验证的 Shell（含 SideNav）
│   │   │   │   │   ├── layout.tsx  # 后台布局
│   │   │   │   │   ├── dashboard/ # 控制台首页
│   │   │   │   │   ├── articles/  # 文章 CRUD
│   │   │   │   │   ├── companies/ # 企业 CRUD + 审核
│   │   │   │   │   ├── ...        # 其他实体管理
│   │   │   │   │   └── logs/      # 操作审计
│   │   │   ├── enterprise/         # 企业门户
│   │   │   │   ├── login/         # 企业登录
│   │   │   │   ├── register/      # 企业注册
│   │   │   │   ├── (app)/         # 已验证的 Shell
│   │   │   │   │   ├── layout.tsx  # 企业后台布局
│   │   │   │   │   ├── dashboard/ # 企业控制台
│   │   │   │   │   ├── profile/   # 企业资料
│   │   │   │   │   ├── products/  # 产品管理
│   │   │   │   │   ├── jobs/      # 职位管理
│   │   │   │   │   └── soft-articles/ # 软文管理
│   │   │   └── api/                # API Route Handlers
│   │   │       ├── auth/          # 认证（login/logout/register）
│   │   │       ├── admin/         # 后台管理 API
│   │   │       ├── enterprise/    # 企业门户 API
│   │   │       ├── search/        # 搜索 API
│   │   │       └── awards/        # 评选投票 API
│   │   ├── components/
│   │   │   ├── home/              # 首页组件
│   │   │   ├── layout/            # 布局组件（Header/Footer/MobileNav）
│   │   │   ├── admin/             # 后台通用组件
│   │   │   ├── enterprise/        # 企业门户组件
│   │   │   ├── auth/              # 认证组件
│   │   │   └── ui/                # 基础 UI 组件
│   │   └── lib/
│   │       ├── prisma.ts          # Prisma 客户端单例
│   │       ├── auth/session.ts    # JWT 签发/验证
│   │       ├── admin-auth.ts      # 管理员认证 + RBAC
│   │       ├── enterprise-auth.ts # 企业用户认证
│   │       ├── admin-api.ts       # 管理 API 工具函数
│   │       ├── enterprise-api.ts  # 企业 API 工具函数
│   │       ├── data/              # 数据层（获取/缓存）
│   │       │   ├── home.ts        # 首页数据聚合
│   │       │   ├── layout.ts      # 布局数据
│   │       │   ├── page-sections.ts # 页面板块
│   │       │   ├── safe-query.ts  # 安全查询包装器
│   │       │   ├── public-lists.ts # 前台列表缓存
│   │       │   ├── public-detail.ts # 前台详情缓存
│   │       │   └── admin-*.ts     # 后台数据统计
│   │       ├── search.ts          # Meilisearch 客户端
│   │       ├── revalidate.ts      # 缓存失效工具
│   │       └── brand/             # 品牌文案
│   ├── e2e/                       # Playwright E2E 测试
│   ├── scripts/                   # 工具脚本
│   ├── next.config.ts             # Next.js 配置
│   └── middleware.ts              # 全局中间件
├── docker-compose.yml             # PostgreSQL + Redis + Meilisearch
└── README.md                      # 项目总入口
```

---

## 三层架构

### 1. 前台展示层 `(marketing)/`

面向公众的媒体站点，通过 ISR 增量静态再生成实现高性能。

**数据流：**

```
Page Component → getXxxDataSafe() → unstable_cache → Prisma → PostgreSQL
                                      ↓ cache miss / fallback
                                  safeQuery(fallback value)
```

**缓存策略：**

| 数据 | 缓存 TTL | 缓存 Tag | 失效触发 |
|------|----------|----------|----------|
| 首页数据 | 60s | `home` | 后台内容变更时 `invalidateHomeCache()` |
| 布局（导航/页脚） | 120s | `layout` | 板块变更时 `invalidateLayoutCache()` |
| 前台列表 | 120s | `home` | 同首页 |
| 页面板块详情 | — | — | 单条查询，react cache |

### 2. 运营后台层 `admin/`

全功能内容管理系统。

**架构模式：**

- **Pages（Server Components）：** 直接调用 `lib/data/*` 或 Prisma 获取数据
- **API Routes：** 客户端提交的变更操作通过 REST API
- **权限控制：** 中间件校验 JWT → 路由层 `requireAdmin()` → 操作层 `checkPermitOrDeny()`
- **UI 组件：** `data-table` 统一列表渲染、`forms/` 表单组件、`toast` 消息反馈

**权限矩阵（4 角色 × 24 权限）：**

| 权限域 | SUPER_ADMIN | CONTENT_EDITOR | BUSINESS_OPS | REVIEWER |
|--------|-------------|----------------|--------------|----------|
| Content CRUD + Review | ✅ | ✅ (CRUD + Review) | ❌ | ✅ (Read + Review) |
| Company CRUD + Review | ✅ | ❌ | ✅ (CRUD) | ✅ (Read + Review) |
| Product / Event / Job | ✅ | ✅（Event） | ✅ | ❌ |
| Report / Award | ✅ | ✅ | ✅（Award） | ❌ |
| Ad / User / Settings | ✅ | ❌ | ✅（Ad） | ❌ |
| Page Section | ✅ | ✅ | ❌ | ❌ |
| Log Read | ✅ | ✅ | ✅ | ✅ |

### 3. 企业门户层 `enterprise/`

企业客户自助管理入口。

**身份验证：**
- 中间件校验 JWT → 页面层通过 `getEnterpriseUser()`（含数据库查企业资料）
- API 层通过 `getEnterpriseFromRequest()` 解析 Cookie

**企业隔离：**
- 所有查询按 `companyId` 过滤
- API 路由中的 `[id]` 参数会验证是否属于本企业

---

## 认证架构

```
登录请求 → /api/auth/login
  → bcrypt 验证密码
  → JWT 签发（HS256, 7 天有效期）
  → Set-Cookie (httpOnly, sameSite=lax, secure=prod)
  → 重定向到角色对应的后台

中间件层（middleware.ts）：
  /admin/*    → 验证 JWT + role=ADMIN
  /enterprise/* → 验证 JWT + role=ENTERPRISE|ADMIN
  /api/auth/login → Rate Limiting (5/min/IP)
  /api/admin/* mutating → CSRF Origin 校验
```

---

## 数据层模式

### 缓存策略

```
unstable_cache(fn, keys, { revalidate, tags })
  ├── revalidate: 秒数（ISR 缓存时长）
  ├── tags: 标签名（结合 revalidateTag() 手动失效）
  └── 穿透保护：空数据检测 + 降级重试 + fallback
```

首页示例：
```typescript
// 1. 先尝试缓存，空数据则抛出
// 2. 捕获异常后直接查库
// 3. 仍空数据则返回 emptyHomePayload
export async function getHomePageDataSafe(): Promise<HomePagePayload> {
  try { return await getCachedHomePageData() }
  catch { /* fall through */ }
  try { return await getHomePageData() }
  catch { /* fall through */ }
  return emptyHomePayload
}
```

### 安全查询包装器

```typescript
// 任何数据层查询都可以安全包裹，失败时返回默认值而非抛异常
const data = await safeQuery(() => prisma.article.findMany(...), [], "label")
```

---

## 搜索架构

```
Meilisearch（Docker 本地 / 生产环境独立部署）
  ├── companies index: name, description, industry, city
  ├── articles index: title, summary, content
  └── products index: name, description

数据同步：scripts/sync-search.ts（手动触发全量同步）
搜索 API：/api/search?q=xxx&type=all
备用策略：搜索异常时降级返回空数组
```

---

## 安全架构层级

```
┌─────────────────────────────────────┐
│ 1. HTTP 安全头（next.config.ts）     │
│    CSP / HSTS / X-Frame-Options     │
│    X-Content-Type-Options           │
│    Referrer-Policy                  │
├─────────────────────────────────────┤
│ 2. 中间件安全层（middleware.ts）      │
│    CSRF Origin 校验 / Rate Limiting  │
├─────────────────────────────────────┤
│ 3. 认证层（JWT + Cookie）            │
│    Session 校验 / 过期 / 角色检查     │
├─────────────────────────────────────┤
│ 4. API 路由权限（admin-auth.ts）     │
│    RBAC / permit 校验                │
├─────────────────────────────────────┤
│ 5. 数据层（safe-query.ts）           │
│    错误降级 / ISR 空数据检测          │
├─────────────────────────────────────┤
│ 6. 输入校验（zod）                   │
│    查询参数 / 请求 Body 类型安全      │
└─────────────────────────────────────┘
```

---

## 第三方服务依赖

| 服务 | 用途 | 生产环境 | 本地开发 |
|------|------|----------|----------|
| PostgreSQL | 主数据库 | Supabase | Docker Compose |
| Meilisearch | 全文搜索 | 独立部署 | Docker Compose |
| Redis | Cache（预留） | Vercel KV / Upstash | Docker Compose |
| Vercel | 托管 / 部署 | 生产部署 | — |
| Unsplash | 图片 CDN | 远程模式 | 开发不优化 |

---

## 性能策略

| 策略 | 说明 |
|------|------|
| ISR（增量静态再生成） | 首页 60s 增量生成，列表 120s |
| 并行查询 | `Promise.all` 聚合首页 / 后台数据 |
| 缓存标签 | `home` / `layout` / `admin-stats` 精准失效 |
| React cache() | 同请求内详情查询共享（public-detail.ts） |
| 空数据穿透保护 | 首页空数据不被写入 ISR 缓存 |
| 降级渲染 | 任何数据库错误不阻止页面渲染 |
| 数据库 Raw Query | 后台统计使用聚合 SQL 替代多次查询 |

---

## 外部文档索引

| 文件 | 内容 |
|------|------|
| `docs/API-REFERENCE.md` | 完整的 REST API 文档 |
| `docs/DEVELOPMENT-GUIDE.md` | 开发环境搭建与编码规范 |
| `docs/DEPLOYMENT-GUIDE.md` | Vercel 部署配置与 CI/CD |
| `docs/SECURITY.md` | 安全配置与最佳实践 |
| `docs/TESTING.md` | 测试策略与运行指南 |
| `CHANGELOG.md` | 版本发布记录 |
