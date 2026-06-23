# 芯师爷官网项目

本仓库包含 **规划文档** 与可运行的 **Web 应用**（Next.js）。

## 目录结构

| 路径 | 说明 |
|------|------|
| `docs/` | 愿景、PRD、技术架构、首页结构、任务优先级等 |
| `web/` | Next.js 16 + React 19 + Tailwind 4 + Prisma 6 + PostgreSQL |
| `docker-compose.yml` | 本地 PostgreSQL 16 + Redis 7（项目根目录） |

## 快速开始

### 1. 启动数据库

```bash
docker compose up -d
```

（若 Docker 未启动，请先打开 Docker Desktop。）

### 2. 配置环境变量

```bash
cd web
cp .env.example .env
# 必填：SESSION_SECRET（>=32 字符）与 SEED_DEMO_PASSWORD（>=12 字符）
```

默认 `DATABASE_URL` 与 `docker-compose.yml` 中的账号一致。

### 3. 迁移与种子数据

```bash
cd web
npx prisma migrate deploy
npm run db:seed
```

### 4. 开发服务

```bash
npm run dev
```

浏览器打开 <http://localhost:3002>。

### 演示账号（种子脚本创建）

| 角色 | 邮箱 | 密码来源 |
|------|------|------|
| 运营管理员 | `admin@xinshiye.dev` | `.env` 的 `SEED_DEMO_PASSWORD` |
| 企业用户 | `enterprise@xinshiye.dev` | `.env` 的 `SEED_DEMO_PASSWORD` |

- 运营后台：<http://localhost:3002/admin/login>  
- 企业后台：<http://localhost:3002/enterprise/login>  

## 常用命令（在 `web/` 下）

```bash
npm run dev           # 稳定模式（默认）
npm run dev:turbo     # 高性能模式（资源占用更高）
npm run lint          # ESLint
npm run format        # Prettier
npm run build         # 生产构建
npm run db:studio     # Prisma Studio
```

## 技术说明

- **Prisma**：当前锁定 **6.19.x**，在 `schema.prisma` 中使用 `url = env("DATABASE_URL")`，便于本地与 CI 一致迁移；后续可按官方指南评估升级 Prisma 7。
- **首页**：实现见 `docs/08-首页开发结构说明.md` 与 `web/src/app/(marketing)/page.tsx`。
- **无数据库时**：首页数据通过 `getHomePageDataSafe` 降级为空状态，便于 UI 联调；完整体验仍需 PostgreSQL。

## 文档索引

- `docs/09-开发任务清单与优先级.md` — 按优先级排列的后续迭代任务
