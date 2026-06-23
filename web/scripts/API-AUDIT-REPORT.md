# API 端点审计报告

## 执行摘要

- **审计时间**: 2026-06-23
- **审计范围**: `/Users/lirundong/Code/work/芯师爷/web/src/app/api/` 目录下所有 API 路由
- **路由文件总数**: 50 个
- **发现问题数**: 2 个（其中 1 个需要修复）

## API 端点概览

### 按类别分类
| 类别 | 路由数 | 说明 |
|------|---------|------|
| Admin | 35 | 需要管理员认证的运营后台 API |
| Enterprise | 10 | 需要企业认证的 JWT 企业后台 API |
| Auth | 3 | 登录、注册、登出认证 API |
| Public | 2 | 公开可访问的 API（搜索、投票查询） |

### 按 HTTP 方法分类
| 方法 | 端点数 |
|------|---------|
| GET | 43 |
| POST | 21 |
| PUT | 18 |
| PATCH | 3 |
| DELETE | 14 |

## 实现质量统计

| 指标 | 数量 | 百分比 |
|------|------|--------|
| 使用 Prisma 数据库调用 | 47 | 94% |
| 包含错误处理 (try-catch) | 41 | 82% |
| 包含认证检查 | 44 | 88% |
| 使用 ok() 响应辅助函数 | 45 | 90% |

## 发现的问题

### 🟡 中等问题

#### 1. `/api/admin/upload` - 占位符实现
- **文件**: `/admin/upload/route.ts`
- **问题**: 第 19 行包含 TODO 注释，当前实现只是返回传入的 URL 而没有实际处理文件上传
- **当前代码**:
```typescript
// Placeholder: for now just return the same URL
return ok({ url: parsed.data.url });
```
- **建议**: 实现真正的文件上传逻辑（上传到云存储如 COS/OSS，返回真实的可访问 URL）

---

### 🟢 轻微问题

#### 2. 错误响应格式不一致
- **问题**: 虽然大部分端点使用 `{ error: "..." }` 格式返回错误，但成功响应中有些使用 `{ message: "..." }` 而有些不使用
- **示例**:
  - `/api/awards/[id]/vote` POST 成功: `{ ok: true, message: "投票成功！", voteCount }`
  - 其他成功响应: 直接返回数据，没有 `message` 字段
- **建议**: 统一成功响应的格式（可选，当前方式也可接受）

---

## 响应格式分析

### 错误响应格式
- **使用 `{ error: "..." }` 的端点**: 4 个
  - 主要是 `/api/auth/login` 和 `/api/auth/register`
  - 以及 `/api/awards/[id]/vote`
  
- **使用 admin-api 辅助函数的端点**: 45 个
  - `unauthorized()` -> `{ error: "Unauthorized" }`
  - `badRequest(msg)` -> `{ error: msg }`
  - `notFound(entity)` -> `{ error: "entity not found" }`

### 成功响应格式
- **使用 ok() 辅助函数**: 直接返回数据（推荐）
- **直接返回 NextResponse.json()**: 少数端点

### 格式一致性评价
✅ **良好**: 错误响应基本统一使用 `{ error: "..." }` 格式
⚠️ **可改进**: 成功响应的 `message` 字段使用不一致（但这是可选的）

## 所有 API 路由清单

### [ADMIN] 运营后台 API (需要管理员认证)

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/admin/ads` | GET, POST | 广告管理列表、创建 |
| `/api/admin/ads/:id` | GET, PUT, DELETE | 广告详情、更新、删除 |
| `/api/admin/ads/slots` | GET, POST | 广告位管理 |
| `/api/admin/ads/slots/:id` | GET, PUT | 广告位详情、更新 |
| `/api/admin/articles` | GET, POST | 文章管理 |
| `/api/admin/articles/:id` | GET, PUT, DELETE | 文章详情、更新、删除 |
| `/api/admin/articles/:id/status` | PATCH | 文章状态切换 |
| `/api/admin/awards` | GET, POST | 评选活动管理 |
| `/api/admin/awards/:id` | GET, PUT, DELETE | 评选活动详情、更新、删除 |
| `/api/admin/companies` | GET, POST | 企业管理 |
| `/api/admin/companies/:id` | GET, PUT, DELETE | 企业详情、更新、删除 |
| `/api/admin/companies/:id/status` | PUT | 企业状态审核 |
| `/api/admin/events` | GET, POST | 事件/活动管理 |
| `/api/admin/events/:id` | GET, PUT, DELETE | 事件详情、更新、删除 |
| `/api/admin/events/:id/registrations` | GET | 活动报名列表 |
| `/api/admin/jobs` | GET, POST | 招聘职位管理 |
| `/api/admin/jobs/:id` | GET, PUT, DELETE | 职位详情、更新、删除 |
| `/api/admin/jobs/:id/applicants` | GET, PATCH | 职位申请人列表、审核 |
| `/api/admin/logs` | GET | 操作日志 |
| `/api/admin/media` | GET, POST | 媒体管理 |
| `/api/admin/media/:id` | GET, PUT, DELETE | 媒体详情、更新、删除 |
| `/api/admin/page-sections` | GET, POST | 页面板块管理 |
| `/api/admin/page-sections/:id` | GET, PUT, DELETE | 板块详情、更新、删除 |
| `/api/admin/page-sections/:id/items` | GET, POST | 板块内容项管理 |
| `/api/admin/page-sections/:id/toggle` | PATCH | 板块显示/隐藏切换 |
| `/api/admin/page-sections/items/:itemId` | GET, PUT, DELETE | 内容项详情、更新、删除 |
| `/api/admin/products` | GET, POST | 产品管理 |
| `/api/admin/products/:id` | GET, PUT, DELETE | 产品详情、更新、删除 |
| `/api/admin/reports` | GET, POST | 举报管理 |
| `/api/admin/reports/:id` | GET, PUT, DELETE | 举报详情、更新、删除 |
| `/api/admin/settings` | GET, PUT | 系统设置 |
| `/api/admin/stats` | GET | 统计数据 |
| `/api/admin/upload` | POST | ⚠️ 文件上传 (占位符) |
| `/api/admin/users` | GET, POST | 用户管理 |
| `/api/admin/users/:id` | GET, PUT, DELETE | 用户详情、更新、删除 |

### [AUTH] 认证 API (公开访问)

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/logout` | POST | 用户登出 ✅ |
| `/api/auth/register` | POST | 企业注册 |

### [PUBLIC] 公开 API (无需认证)

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/awards/:id/vote` | GET, POST | 投票查询、提交投票 |
| `/api/search` | GET | 全局搜索 (Meilisearch) |

### [ENTERPRISE] 企业后台 API (需要企业认证)

| 路由 | 方法 | 说明 |
|------|------|------|
| `/api/enterprise/articles` | GET | 企业文章列表 |
| `/api/enterprise/company` | GET, PUT | 企业信息查看、更新 |
| `/api/enterprise/jobs` | GET, POST | 企业职位管理 |
| `/api/enterprise/jobs/:id` | GET, PUT, DELETE | 职位详情、更新、删除 |
| `/api/enterprise/jobs/:id/applicants` | GET | 职位申请人列表 |
| `/api/enterprise/products` | GET, POST | 企业产品管理 |
| `/api/enterprise/products/:id` | GET, PUT, DELETE | 产品详情、更新、删除 |
| `/api/enterprise/soft-articles` | GET, POST | 软文管理 |
| `/api/enterprise/soft-articles/:id` | GET | 软文详情 |
| `/api/enterprise/stats` | GET | 企业统计 |

## 安全审计

### 认证保护
✅ **良好**: 所有 Admin 和 Enterprise 路由都正确使用了认证检查
- Admin 路由使用 `getAdminFromRequest()` 辅助函数
- Enterprise 路由使用 `getEnterpriseFromRequest()` 辅助函数

### 错误处理
✅ **良好**: 82% 的端点包含 try-catch 错误处理
⚠️ **建议**: 为剩余 9 个没有错误处理的端点添加 try-catch

### 输入验证
✅ **良好**: 大部分 POST/PUT 端点使用 Zod 进行输入验证

## 性能考虑

### 数据库查询优化
- ✅ 使用了 `include` 来避免 N+1 查询问题
- ✅ 使用了 `select` 来只查询需要的字段
- ⚠️ 建议: 为大型列表添加分页参数验证（当前部分接口没有限制最大页数）

## 推荐改进

### 高优先级
1. **实现 `/api/admin/upload` 的文件上传功能**
   - 集成云存储服务（如腾讯云 COS）
   - 添加文件类型验证
   - 添加文件大小限制

### 中优先级
2. **统一错误响应格式**
   - 虽然当前基本统一，但建议明确文档规范
   
3. **添加请求速率限制**
   - 为公开端点（如 `/api/search`、`/api/awards/:id/vote`）添加 rate limiting
   - 防止滥用

### 低优先级
4. **添加 API 文档**
   - 使用 OpenAPI/Swagger 规范
   - 或添加详细的 JSDoc 注释

5. **添加单元测试**
   - 为关键业务逻辑添加测试用例

## 结论

总体而言，API 代码质量**良好**：
- ✅ 认证保护完善
- ✅ 响应格式基本统一
- ✅ 输入验证充分
- ✅ 数据库操作规范

主要需要修复的问题是 **文件上传接口的占位符实现**。

---
*报告生成时间: 2026-06-23*
*审计脚本: `/Users/lirundong/Code/work/芯师爷/web/scripts/api-audit.mjs`*
