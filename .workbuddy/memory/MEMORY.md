# 芯师爷项目记忆

## 项目概况
- 这是一个半导体行业 B2B 平台（Next.js 16 + Prisma + PostgreSQL + Redis）
- 本地开发端口: 3002
- Docker Compose 服务: postgres (5432), redis (6379), meilisearch (7700)

## 构建与部署
- Next.js 16.2.6，Turbopack 中文路径（芯师爷）panics → 强制 `--webpack`
- `pnpm dev` 已含 `--webpack`，`pnpm build` 已添加 `--webpack`
- 生产构建: `cd web && pnpm build` → `.next` 输出
- Dev 端口: 3002

## 安全配置
- Session cookie: 开发 `xinshiye_session`，生产 `__Host-xinshiye_session`
- 安全头: next.config.ts 管理 CSP/HSTS/X-Frame-Options/Referrer-Policy
- 登录限流: 中间件内存 5次/分钟/IP
- CSRF: 中间件校验 admin API 的 Origin header
- 管理后台API使用 `src/lib/admin-api.ts` 的统一响应工具 (ok/created/badRequest/unauthorized/notFound)
- 企业端API使用 `src/lib/enterprise-api.ts` 的统一响应工具
- Zod 校验错误使用 `parsed.error.issues[0]?.message` 获取第一个错误信息
- PageHeader 组件接受 `actions` prop 而非 `children`
- Prisma enum 值必须精确匹配（如 MediaChannelType: WECHAT_MP, TOUTIAO, ZHIHU, WEIBO, LINKEDIN, BILIBILI）

## 已完成的工作
- [x] 前端公共页面（首页、企业列表、文章列表、活动、评选、搜索）
- [x] 认证系统（admin/enterprise登录、session管理、logout）
- [x] 管理后台（企业CRUD、文章CRUD、活动CRUD、广告管理、报告管理、页面板块管理）
- [x] 企业后台（资料编辑、产品管理、职位管理、文章管理）
- [x] 企业入驻注册流程（前台注册 + 管理后台审核通过/驳回）
- [x] 软文发布系统（SoftArticle + SoftArticleMetric + MediaChannel 模型，企业端提交，管理后台媒体渠道管理）
- [x] 评选投票功能（AwardVote 模型 + IP限制防刷 + 前台投票组件）
- [x] 运营数据看板（Chart.js 图表：文章发布趋势、企业入驻趋势、行业分布、文章状态分布）
- [x] Meilisearch 全文搜索（Docker 部署 + 索引同步脚本 + 搜索API替换Prisma LIKE查询）
- [x] 测试体系（Vitest 单元测试9个 + Playwright E2E 配置）
- [x] AIGC 全站图片替换（49张高质量专业图片，7个类别，全部本地化）

## AIGC 图片体系
- 图片目录: `public/images/` (7个分类：hero/logos/covers/topics/testimonials/cta/ads)
- 总计49张PNG图片 (~62MB)，涵盖 Hero轮播(3)、Logo标识(10)、文章/活动/报告封面(20)、专题卡片(6)、客户头像(5)、广告(3)、CTA背景(2)
- 种子数据文件 `prisma/seed-data.ts` 中所有 Unsplash URL 已替换为本地 AIGC 图片路径
- 图片映射函数 `unsplash()` 和 `logo()` 现直接返回本地路径
- `src/lib/brand/editorial-hero.ts` 硬编码 URL 也已替换

## 种子数据
- 演示账号密码见 .env 的 SEED_DEMO_PASSWORD
- 17家企业、18篇资讯、12场活动等种子数据已预填
- 企业logo使用独立同风格的 AI 生成矢量风格图标
