# Changelog

## [0.1.0] — 2026-06-24

> 芯师爷官网初始公开发布版。完整的全栈 Web 应用，支持前台展示、运营后台管理与企业门户。

### 新增

#### 🏠 首页（前台展示）
- 动态 Hero 区块（支持多 Slide 轮播，后台管理）
- 资讯 Feed（精选 + 最新双列布局）
- 热门文章（Trending）区块
- 企业展示区块（8 家企业卡片，带 Logo/简介）
- 活动日历区块（进行中/即将开始活动）
- 报告区块（行业报告推荐，带分类/定价）
- 评选区块（年度评选投票入口）
- 专题入口（Topic Cards，后台可配）
- CTA 与社证区块（可编辑文案）
- 吸顶副导航条（Sticky SubNav）
- 搜索功能（Meilisearch 全文检索，支持类型筛选）
- 404 / 全局错误页

#### 🏢 企业门户
- 企业注册/登录（JWT + bcrypt）
- 企业资料编辑（名称、Logo、描述、行业、规模、城市、社交链接）
- 产品管理（CRUD、排序）
- 职位管理（CRUD、求职者管理）
- 软文管理（多渠道发布、SEO 关键词、投放指标追踪）
- 企业控制台首页（数据概览）

#### ⚙️ 运营后台（Admin Panel）
- 管理员登录（角色：超级管理员/内容编辑/商务运营/审核员）
- 控制台仪表盘（数据统计图表，12 个月趋势）
- **文章管理**（CRUD、审核流、置顶）
- **企业管理**（CRUD、审核流、软删除）
- **产品管理**（CRUD、关联企业）
- **活动管理**（CRUD、报名管理）
- **职位管理**（CRUD、求职者管理）
- **报告管理**（CRUD、分类)
- **评选管理**（CRUD、投票数据）
- **广告管理**（广告位 + 广告 CRUD）
- **页面板块管理**（首页全动态编辑：Hero、Trending、Feed、企业、活动、报告、评选、专题、社证、CTA）
- **用户管理**（CRUD）
- **系统设置**（Key-Value 配置）
- **操作审计日志**

#### 🛠 基础设施
- PostgreSQL 16（Prisma 6 ORM，`prisma/$queryRaw` 混合使用）
- Meilisearch 全文搜索（3 个索引：企业、文章、产品）
- Redis 7（缓存会话 / 预留）
- Docker Compose 一键本地环境
- ISR 缓存策略（首页 60s、列表页 120s 增量静态再生成）
- 首页缓存穿透保护（空数据降级）
- 权限系统（RBAC：4 种管理员角色 × 24 种许可）
- CSP / HSTS 安全头（生产环境可开关）
- Rate Limiting（登录接口 5 次/分钟/IP）
- CSRF 保护（API 请求 Origin/Referer 校验）
- Docker 健康检查

#### 🧪 测试
- Vitest 单元测试基础框架（含 jsdom 环境）
- Playwright E2E 测试基础框架（含 Web Server 自动启动）
- 搜索单元测试
- 会话验证单元测试

### 变更

- N/A（初始版本）

### 修复

- 首页 ISR 缓存空数据导致区块空白（`getHomePageDataSafe` 空数据检测）
- 管理后台数据库查询超时（批量查询优化 + Prisma raw query）
- 首页数据超时导致区块空白（`safeQuery` 降级机制）

### 性能

- 首页 60s ISR 缓存 + 多查询 Promise.all 并行化
- 列表页 120s ISR 缓存
- 后台全站加载优化（聚合 SQL + 缓存统计）
- 图片质量控制（`unoptimized` 仅限开发环境）
- 控制台 12 个月趋势数据缓存

### 安全

- 密码 bcrypt 哈希存储
- JWT 会话签名（jose，HS256）
- Session Cookie HttpOnly + SameSite=Lax + Secure（生产）
- CSP 内容安全策略（生产环境启用）
- HSTS（生产环境 2 年）
- X-Frame-Options / X-Content-Type-Options / Referrer-Policy
- 登录频率限制（内存滑动窗口）
- CSRF Origin 校验（Admin API 变更请求）
- 开放重定向校验（`isSafeRedirect`）

## 版本格式说明

项目遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

- `MAJOR.MINOR.PATCH`（主版本.次版本.修订号）
- `0.y.z` 表示开发初期，API 不稳定

## 发布记录

| 版本 | 日期 | 说明 |
|------|------|------|
| 0.1.0 | 2026-06-24 | 初始公开发布 |
