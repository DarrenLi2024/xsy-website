# 芯师爷官网

> **半导体产业垂直媒体与服务平台** — 把复杂产业链，讲成可被信任的故事。

本仓库包含 **规划文档** 与可运行的 **全栈 Web 应用**（Next.js 16 + React 19 + Prisma 6 + PostgreSQL）。

**前台：** 资讯、企业黄页、活动、招聘、报告、评选  
**后台：** 运营控制台（含 RBAC）、企业自助门户  
**搜索：** Meilisearch 全文检索

---

## 技术栈总览

| 层 | 技术 | 版本 |
|----|------|------|
| 框架 | Next.js (App Router) | 16.2.6 |
| UI | React + Tailwind CSS v4 | 19.2.4 |
| ORM | Prisma + PostgreSQL 16 | 6.19.0 |
| 搜索 | Meilisearch | v1.14 |
| 认证 | JWT (jose) + bcrypt | — |
| 缓存 | Next.js `unstable_cache` (ISR) | — |
| 测试 | Vitest + Playwright | — |
| 部署 | Vercel (Fluid Compute) | — |

---

## 目录结构

| 路径 | 说明 |
|------|------|
| `docs/` | 产品规划 + 开发者文档（全套 .md） |
| `web/` | Next.js 全栈应用（前台 + 后台 + API） |
| `docker-compose.yml` | 本地 PostgreSQL 16 + Redis 7 + Meilisearch |
| `CHANGELOG.md` | 版本发布记录 |

---

## 快速开始

### 1. 启动基础设施

```bash
docker compose up -d
```

### 2. 配置环境变量

```bash
cd web
cp .env.example .env
# 编辑 .env：必须设置 SESSION_SECRET（>=32 字符）与 SEED_DEMO_PASSWORD（>=12 字符）
```

### 3. 数据库迁移与种子

```bash
cd web
npx prisma migrate deploy
npm run db:seed
```

### 4. 启动开发服务

```bash
cd web
npm run dev
```

浏览器打开 **http://localhost:3002**

### 演示账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 超级管理员 | `admin@xinshiye.dev` | `.env` 的 `SEED_DEMO_PASSWORD` |
| 企业用户 | `enterprise@xinshiye.dev` | `.env` 的 `SEED_DEMO_PASSWORD` |

- 运营后台：http://localhost:3002/admin/login
- 企业后台：http://localhost:3002/enterprise/login

---

## 常用命令（`web/` 下）

```bash
npm run dev              # 开发服务器（Webpack，端口 3002）
npm run dev:turbo        # Turbopack 模式（更快）
npm run build            # 生产构建
npm run test             # 单元测试（Vitest）
npm run test:e2e         # E2E 测试（Playwright）
npm run lint             # ESLint
npm run format           # Prettier
npm run db:studio        # Prisma Studio（数据库可视化）
npm run search:sync      # 同步 Meilisearch 索引
```

---

## 文档索引

### 产品规划文档（`docs/`）

| 文档 | 说明 |
|------|------|
| `01-项目愿景与价值主张.md` | 项目定位与品牌叙事 |
| `02-产品需求规格说明书.md` | 功能需求详细描述 |
| `03-技术架构方案.md` | 技术选型与架构方案 |
| `04-前端设计与UX策略.md` | 设计语言与用户体验策略 |
| `05-数据模型设计.md` | 数据库模型设计说明 |
| `06-项目开发计划.md` | 开发路线图与里程碑 |
| `07-部署与运维方案.md` | 部署架构与运维方案 |
| `08-首页开发结构说明.md` | 首页组件结构与数据流 |
| `09-开发任务清单与优先级.md` | 后续迭代任务 |

### 开发者文档（`docs/`）

| 文档 | 说明 |
|------|------|
| `ARCHITECTURE-OVERVIEW.md` | 架构总览与技术细节 |
| `API-REFERENCE.md` | 完整 REST API 文档（58+ 端点） |
| `DEVELOPMENT-GUIDE.md` | 开发环境搭建与编码规范 |
| `DEPLOYMENT-GUIDE.md` | Vercel 部署与 CI/CD 配置 |
| `SECURITY.md` | 安全措施与改进清单 |
| `TESTING.md` | 测试策略与编写指南 |

### 其他

| 文件 | 说明 |
|------|------|
| `CHANGELOG.md` | 版本发布记录 |
| `docker-compose.yml` | 本地基础设施（PostgreSQL + Redis + Meilisearch） |

---

## 技术说明

- **Prisma**：当前使用 6.19.x，`DATABASE_URL` 环境变量驱动。Prisma Migrate 用于 schema 版本管理。
- **首页 ISR**：60 秒增量静态再生成，含空数据穿透保护（`getHomePageDataSafe`）。
- **搜索**：Meilisearch 全文检索，支持按类型筛选（企业/文章/产品）。
- **无数据库时**：数据层面 `safeQuery` 降级机制确保页面始终可渲染。
- **安全**：bcrypt 密码哈希、JWT 会话、CSRF 保护、速率限制、CSP 安全头。
