# API 参考文档

> 芯师爷官网全栈 API 文档。所有 API 基于 Next.js App Router Route Handlers 实现。

**基础 URL：** `http://localhost:3002`（开发）/ `https://<production-domain>`（生产）

---

## 目录

- [认证 API](#认证-api)
- [前台 API](#前台-api)
- [管理后台 API](#管理后台-api)
- [企业门户 API](#企业门户-api)
- [搜索 API](#搜索-api)

---

## 认证 API

### POST /api/auth/register

注册新用户（企业用户）。

**Request Body：**

```json
{
  "name": "企业名称",
  "email": "user@company.com",
  "password": "secure_password",
  "companyName": "公司全称"
}
```

**Responses：**

| 状态码 | 说明 |
|--------|------|
| 201 | 注册成功，返回 `{ ok: true }` |
| 400 | 邮箱已存在或校验失败 |
| 500 | 服务器错误 |

---

### POST /api/auth/login

用户登录（管理员 & 企业用户）。

**Request Body：**

```json
{
  "email": "admin@xinshiye.dev",
  "password": "your_password",
  "redirect": "/admin/dashboard"
}
```

`redirect` 可选；服务端将自动根据角色决定跳转目标。

**Rate Limit：** 每个 IP 5 次/分钟（中间件层）

**Responses：**

| 状态码 | 说明 |
|--------|------|
| 200 | 登录成功，Set-Cookie 会话 Token |
| 400 | JSON 解析失败或校验失败 |
| 401 | 邮箱或密码错误 |
| 403 | 无权进入目标后台（角色不匹配） |
| 429 | 请求过于频繁 |

**Response：**

```json
{
  "ok": true,
  "redirect": "/admin/dashboard"
}
```

---

### POST /api/auth/logout

登出。清除会话 Cookie。

**Responses：**

| 状态码 | 说明 |
|--------|------|
| 200 | `{ ok: true }` |

---

## 前台 API

### GET /api/search

全站搜索（Meilisearch）。

**Query Parameters：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `q` | string | — | 搜索关键词（**必填**） |
| `type` | string | `"all"` | 搜索范围：`all` / `companies` / `articles` / `products` |
| `limit` | number | `20` | 每类结果上限（max: 50） |

**Response：**

```json
{
  "companies": [{ "id": "cuid", "name": "公司名", "slug": "company-slug", "industry": "半导体", "city": "深圳" }],
  "articles": [{ "id": "cuid", "title": "文章标题", "slug": "article-slug", "category": "行业趋势", "summary": "摘要..." }],
  "products": [{ "id": "cuid", "name": "产品名", "category": "MCU", "companyId": "cuid" }]
}
```

搜索服务不可用时仍返回 200，但携带 `error: "搜索服务暂不可用"` 字段。

---

### POST /api/awards/[id]/vote

评选投票。

**Request Body：**

```json
{
  "companyId": "cuid"
}
```

防重复策略：同一 Campaign 下，同一 IP 只能投一票（`ipHash` 字段）。

**Responses：**

| 状态码 | 说明 |
|--------|------|
| 200 | 投票成功 |
| 400 | 已投票、评选未开放、参数有误 |
| 404 | 评选或企业不存在 |

---

## 管理后台 API

> 所有 Admin API 需携带 `xinshiye_session` Cookie。中间件自动校验 Session 有效性。

### 命名规范

- `GET` 请求列表（支持分页/search 参数）
- `POST` 创建资源，返回 201
- `PUT` 完整更新资源
- `PATCH` 部分更新（仅 status 变更用独立路由）
- `DELETE` 删除资源（软删除 via `deletedAt`）

### 通用错误响应

```json
{ "error": "Unauthorized" }         // 401
{ "error": "Forbidden" }            // 403
{ "error": "Company not found" }    // 404
{ "error": "Bad request" }          // 400
{ "error": "Internal server error" } // 500
```

### 控制台

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/stats` | 图表统计数据（12 月趋势、行业分布、文章/企业状态分布） | 任意管理员 |
| GET | `/api/admin/dashboard` | 控制台数字概览（总文章 / 企业 / 待审核数量等） | 任意管理员 |

*注意：`/api/admin/dashboard` 路由由 `src/app/admin/(app)/dashboard/page.tsx` 的 Server Component 直接调用数据层而非通过 API，因此 `/api/admin/dashboard` 不存在于路由文件中。仪表盘数据由 `getAdminDashboardStats()` 直接提供。*

### 文章管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/articles` | 文章列表（支持 `search` / `status` / `category` 筛选） | `content:read` |
| POST | `/api/admin/articles` | 创建文章 | `content:write` |
| GET | `/api/admin/articles/[id]` | 获取单篇文章 | `content:read` |
| PUT | `/api/admin/articles/[id]` | 更新文章 | `content:write` |
| DELETE | `/api/admin/articles/[id]` | 删除文章（软删除） | `content:write` |
| PATCH | `/api/admin/articles/[id]/status` | 更新文章状态（审核流） | `content:review` |

### 企业管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/companies` | 企业列表（支持 `search` / `status` 筛选） | `company:read` |
| POST | `/api/admin/companies` | 创建企业 | `company:write` |
| GET | `/api/admin/companies/[id]` | 获取企业详情（含产品/文章/职位） | `company:read` |
| PUT | `/api/admin/companies/[id]` | 更新企业 | `company:write` |
| DELETE | `/api/admin/companies/[id]` | 删除企业（软删除） | `company:write` |
| PATCH | `/api/admin/companies/[id]/status` | 审核企业状态 | `company:review` |

### 产品管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/products` | 产品列表 | `product:read` |
| POST | `/api/admin/products` | 创建产品 | `product:write` |
| GET | `/api/admin/products/[id]` | 获取单个产品 | `product:read` |
| PUT | `/api/admin/products/[id]` | 更新产品 | `product:write` |
| DELETE | `/api/admin/products/[id]` | 删除产品 | `product:write` |

### 活动管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/events` | 活动列表 | `event:read` |
| POST | `/api/admin/events` | 创建活动 | `event:write` |
| GET | `/api/admin/events/[id]` | 获取单个活动 | `event:read` |
| PUT | `/api/admin/events/[id]` | 更新活动 | `event:write` |
| DELETE | `/api/admin/events/[id]` | 删除活动 | `event:write` |
| GET | `/api/admin/events/[id]/registrations` | 活动报名列表 | `event:read` |

### 职位管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/jobs` | 职位列表 | `job:read` |
| POST | `/api/admin/jobs` | 创建职位 | `job:write` |
| GET | `/api/admin/jobs/[id]` | 获取单个职位 | `job:read` |
| PUT | `/api/admin/jobs/[id]` | 更新职位 | `job:write` |
| DELETE | `/api/admin/jobs/[id]` | 删除职位 | `job:write` |
| GET | `/api/admin/jobs/[id]/applicants` | 职位求职者列表 | `job:read` |

### 报告管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/reports` | 报告列表 | `report:read` |
| POST | `/api/admin/reports` | 创建报告 | `report:write` |
| GET | `/api/admin/reports/[id]` | 获取单个报告 | `report:read` |
| PUT | `/api/admin/reports/[id]` | 更新报告 | `report:write` |
| DELETE | `/api/admin/reports/[id]` | 删除报告 | `report:write` |

### 评选管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/awards` | 评选活动列表 | `award:read` |
| POST | `/api/admin/awards` | 创建评选活动 | `award:write` |
| GET | `/api/admin/awards/[id]` | 获取单个评选 | `award:read` |
| PUT | `/api/admin/awards/[id]` | 更新评选 | `award:write` |
| DELETE | `/api/admin/awards/[id]` | 删除评选 | `award:write` |

### 广告管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/ads` | 广告列表 | `ad:read` |
| POST | `/api/admin/ads` | 创建广告 | `ad:write` |
| GET | `/api/admin/ads/[id]` | 获取单个广告 | `ad:read` |
| PUT | `/api/admin/ads/[id]` | 更新广告 | `ad:write` |
| DELETE | `/api/admin/ads/[id]` | 删除广告 | `ad:write` |
| GET | `/api/admin/ads/slots` | 广告位列表 | `ad:read` |
| POST | `/api/admin/ads/slots` | 创建广告位 | `ad:write` |
| GET | `/api/admin/ads/slots/[id]` | 获取单个广告位 | `ad:read` |
| PUT | `/api/admin/ads/slots/[id]` | 更新广告位 | `ad:write` |
| DELETE | `/api/admin/ads/slots/[id]` | 删除广告位 | `ad:write` |

### 页面板块管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/page-sections` | 板块列表 | `page:read` |
| POST | `/api/admin/page-sections` | 创建板块 | `page:write` |
| GET | `/api/admin/page-sections/[id]` | 获取单个板块 | `page:read` |
| PUT | `/api/admin/page-sections/[id]` | 更新板块 | `page:write` |
| DELETE | `/api/admin/page-sections/[id]` | 删除板块 | `page:write` |
| PATCH | `/api/admin/page-sections/[id]/toggle` | 切换板块启用状态 | `page:write` |
| GET | `/api/admin/page-sections/[id]/items` | 板块项目列表 | `page:read` |
| POST | `/api/admin/page-sections/[id]/items` | 创建板块项目 | `page:write` |
| GET | `/api/admin/page-sections/items/[itemId]` | 获取单个板块项目 | `page:read` |
| PUT | `/api/admin/page-sections/items/[itemId]` | 更新板块项目 | `page:write` |
| DELETE | `/api/admin/page-sections/items/[itemId]` | 删除板块项目 | `page:write` |

### 媒体频道管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/media` | 媒体频道列表 | `page:read` |
| POST | `/api/admin/media` | 创建媒体频道 | `page:write` |
| GET | `/api/admin/media/[id]` | 获取单个频道 | `page:read` |
| PUT | `/api/admin/media/[id]` | 更新频道 | `page:write` |
| DELETE | `/api/admin/media/[id]` | 删除频道 | `page:write` |

### 用户管理

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/users` | 用户列表 | `user:read` |
| GET | `/api/admin/users/[id]` | 获取单个用户 | `user:read` |
| PUT | `/api/admin/users/[id]` | 更新用户（角色/权限） | `user:write` |

### 系统

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/admin/settings` | 获取所有系统设置 | `settings:read` |
| PUT | `/api/admin/settings` | 更新系统设置（全量替换） | `settings:write` |
| GET | `/api/admin/logs` | 操作审计日志 | `log:read` |
| POST | `/api/admin/upload` | 文件上传 | — |

---

## 企业门户 API

> 企业 API 需携带 `xinshiye_session` Cookie，用户角色须为 `ENTERPRISE` 或 `ADMIN`。

### 企业资料

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/enterprise/company` | 获取本企业资料 |
| PUT | `/api/enterprise/company` | 更新本企业资料 |

### 产品管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/enterprise/products` | 本企业产品列表 |
| POST | `/api/enterprise/products` | 创建产品 |
| GET | `/api/enterprise/products/[id]` | 获取单个产品 |
| PUT | `/api/enterprise/products/[id]` | 更新产品 |
| DELETE | `/api/enterprise/products/[id]` | 删除产品 |

### 职位管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/enterprise/jobs` | 本企业职位列表 |
| POST | `/api/enterprise/jobs` | 创建职位 |
| GET | `/api/enterprise/jobs/[id]` | 获取单个职位 |
| PUT | `/api/enterprise/jobs/[id]` | 更新职位 |
| DELETE | `/api/enterprise/jobs/[id]` | 删除职位 |
| GET | `/api/enterprise/jobs/[id]/applicants` | 职位求职者列表 |

### 软文（品牌内容）管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/enterprise/soft-articles` | 本企业软文列表 |
| POST | `/api/enterprise/soft-articles` | 创建软文 |
| GET | `/api/enterprise/soft-articles/[id]` | 获取单篇软文 |
| PUT | `/api/enterprise/soft-articles/[id]` | 更新软文 |
| DELETE | `/api/enterprise/soft-articles/[id]` | 删除软文 |

### 统计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/enterprise/stats` | 企业控制台统计数据 |

---

## 数据契约

### 通用分页参数

列表 API 支持的通用查询参数：

| 参数 | 类型 | 说明 |
|------|------|------|
| `search` | string | 模糊搜索（按标题/名称等） |
| `status` | string | 按状态筛选 |
| `category` | string | 按分类筛选 |
| `page` | number | 页码（部分接口支持） |
| `pageSize` | number | 每页条数 |

### Pagination Response Shape

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

---

## 错误码速查

| HTTP Status | 含义 | 常见原因 |
|-------------|------|----------|
| 200 | 成功 | — |
| 201 | 创建成功 | POST 请求 |
| 400 | 请求参数错误 | JSON 格式错误、字段校验失败 |
| 401 | 未认证 | Cookie 缺失或 Session 过期 |
| 403 | 无权限 | 角色不允许执行该操作 |
| 404 | 资源不存在 | ID 无效或已被删除 |
| 429 | 请求过频 | 登录频率限制 |
| 500 | 服务器内部错误 | 数据库异常或未捕获的错误 |
