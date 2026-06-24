# 部署指南

> 项目当前部署于 **Vercel**（托管）+ **Supabase**（数据库）。

---

## 生产环境架构

```
Vercel (Fluid Compute)
├── Next.js App (ISR + SSR)
├── API Routes (Serverless Functions)
└── Static Assets (CDN)
        │
        ├── Supabase (PostgreSQL)
        ├── Meilisearch (Dedicated Host)
        └── Redis / Vercel KV (Cache — 预留)
```

---

## 环境变量（生产环境）

通过 Vercel Dashboard → Project → Settings → Environment Variables 配置：

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `DATABASE_URL` | Supabase PostgreSQL 连接字符串（含连接池） | ✅ |
| `DIRECT_URL` | Supabase 直连字符串（Prisma Migrate 用） | ✅ |
| `SESSION_SECRET` | JWT 签名密钥（>= 32 字符，随机串） | ✅ |
| `NEXT_PUBLIC_SITE_URL` | 站点公开 URL | ✅ |
| `MEILI_HOST` | Meilisearch 服务地址 | 使用搜索时需要 |
| `MEILI_MASTER_KEY` | Meilisearch API Key | 使用搜索时需要 |

### 获取 Supabase 连接串

1. 打开 Supabase Dashboard → Project Settings → Database
2. 找到 **Connection string** → **URI**
3. `DATABASE_URL` 使用带连接池的字符串（`?pgbouncer=true`）
4. `DIRECT_URL` 使用不带连接池的直连字符串（用于 Prisma Migrate）

---

## Vercel 部署步骤

### 方式一：Git 自动部署

1. 在 Vercel 中导入 GitHub 仓库
2. Framework Preset 选择 **Next.js**
3. Root Directory 设为 `web/`
4. 配置上述环境变量
5. 部署

### 方式二：CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 在 web/ 目录下部署
cd web
vercel --prod
```

### 重要配置

**Build Command：** `prisma generate && next build --webpack`

Vercel 会自动检测 Next.js 框架，但确保 Build Command 包含 `prisma generate`。

**Node.js Version：** 22.x（Vercel 默认）

**Function Region：** 选择靠近目标用户的区域（如 `hkg1` 香港或 `sin1` 新加坡）

---

## 数据库迁移

### 生产环境迁移

```bash
# 在本地准备好迁移文件
npx prisma migrate dev --name your_migration_name

# 提交迁移文件到 Git
git add prisma/migrations
git commit -m "feat: add migration for ..."

# 部署后，角色生产环境运行迁移
npx prisma migrate deploy

# 如果使用 CLI 远程执行
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### 种子数据

生产环境一般不需要重跑种子数据。如需创建初始管理员账号：

```sql
INSERT INTO "User" (id, email, "passwordHash", role, "adminRole", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@yourcompany.com',
  '$2b$10$...',  -- bcrypt hash
  'ADMIN',
  'SUPER_ADMIN',
  NOW(),
  NOW()
);
```

---

## Meilisearch 部署

生产环境的 Meilisearch 建议：

1. **独立部署：** 在云服务器上通过 Docker 部署
2. **或使用 Meilisearch Cloud：** 托管的 SaaS 方案
3. **安全配置：** 务必设置 `MEILI_MASTER_KEY`，并限制访问 IP

```bash
# Docker 部署
docker run -d \
  --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY='your-key' \
  -v meili_data:/meili_data \
  getmeili/meilisearch:v1.14
```

### 搜索索引同步

部署后或在 CI/CD 中运行：

```bash
cd web
npm run search:sync
```

建议通过 Cron Job 定期同步（如每 15 分钟）。

---

## ISR 缓存配置

Vercel 上 ISR（Incremental Static Regeneration）默认启用，通过以下代码配置：

```typescript
// pages:
export const revalidate = 60;    // 首页（60 秒）
export const maxDuration = 30;   // Serverless Function 超时（30 秒）

// unstable_cache:
{ revalidate: 60, tags: ["home"] }
{ revalidate: 120, tags: ["layout"] }
{ revalidate: 30, tags: ["admin-dashboard"] }
```

缓存失效通过后台操作触发：

```typescript
import { invalidateHomeCache, invalidatePublicContentCaches } from "@/lib/revalidate";
```

---

## Vercel 配置参考

`next.config.ts` 中已配置：

```typescript
const nextConfig: NextConfig = {
  images: {
    unoptimized: !isProd,  // 生产环境启用图片优化
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // 生产环境启用安全头
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        // 生产环境自动添加 CSP + HSTS
        ...(isProd ? [
          { key: "Content-Security-Policy", value: "..." },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ] : []),
      ],
    }];
  },
};
```

---

## CI/CD Pipeline（建议）

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: xinshiye
          POSTGRES_PASSWORD: xinshiye_dev
          POSTGRES_DB: xinshiye
        options: --health-cmd pg_isready --health-interval 5s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npm run test
```

---

## 域名与 SSL

- Vercel 自动管理 SSL 证书（Let's Encrypt）
- 自定义域名：Vercel Dashboard → Domains → 添加域名 → 更新 DNS
- 建议启用 Vercel Firewall 和 DDoS 防护

---

## 监控与日志

- **Vercel Dashboard：** 部署状态、Function 调用量、错误率
- **Vercel Logs：** 实时日志查看（支持搜索和筛选）
- **Sentry（建议）：** 前端错误追踪
- **Supabase Logs：** 数据库查询性能监控

---

## 回滚

```bash
# Vercel CLI 回滚
vercel rollback

# 或 Vercel Dashboard → Deployments → 选择上个版本 → Promote to Production
```
