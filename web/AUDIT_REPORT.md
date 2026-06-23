# 芯师爷 Web 认证流程与数据库完整性审计报告

生成时间：2026-06-23

---

## 执行摘要

本次审计覆盖了数据库状态、Prisma Schema、Seed 数据质量、认证流程和安全配置。发现的主要问题包括：Demo 账户邮箱域名配置错误、部分文章内短、缺少建议索引、Session Cookie 配置可改进。

---

## 1. 数据库状态统计

| 表名 | 记录数 | 说明 |
|--------|---------|------|
| Company | 17 | 所有企业数据已填充 |
| Article | 18 | 含草稿/待审/归档文章 |
| Event | 12 | 活动数据完整 |
| Job | 19 | 招聘数据完整 |
| Report | 10 | 报告数据完整 |
| Product | 14 | 产品数据完整 |
| Ad | 3 | 广告位数据完整 |
| SoftArticle | 0 | **空表** - 软文功能未初始化 |
| MediaChannel | 0 | **空表** - 媒体渠道未初始化 |
| AwardVote | 0 | 评选投票数据为空 |
| User | 5 | 所有 Demo 账户已创建 |
| AwardCampaign | 4 | 评选活动数据完整 |
| PageSection | 12 | 页面板块数据完整 |
| Setting | 6 | 系统设置完整 |

### 发现的问题
- `SoftArticle` 和 `MediaChannel` 表为空 - 软文发布功能可能无法正常使用
- `AwardVote` 表为空 - 评选投票功能无数据

---

## 2. Demo 账户检查

### 重要发现：邮箱域名不一致

**问题描述**：任务描述中指定的 Demo 账户邮箱为 `admin@xinshiye.demo` 和 `enterprise@xinshiye.demo`，但实际 Seed 脚本创建的是 `@xinshiye.dev` 域名。

**实际创建的账户**：
| 邮箱 | 角色 | Admin 角色 | 关联企业 |
|------|------|------------|----------|
| admin@xinshiye.dev | ADMIN | SUPER_ADMIN | N/A |
| editor@xinshiye.dev | ADMIN | CONTENT_EDITOR | N/A |
| business@xinshiye.dev | ADMIN | BUSINESS_OPS | N/A |
| reviewer@xinshiye.dev | ADMIN | REVIEWER | N/A |
| enterprise@xinshiye.dev | ENTERPRISE | N/A | 华芯精密微电子 |

**建议**：
1. 更新 `.env` 文件或文档，明确 Demo 账户的正确邮箱域名
2. 或者修改 Seed 脚本使用 `@xinshiye.demo` 域名

---

## 3. Prisma Schema 验证

### 3.1 关系完整性 - ✅ 通过

所有模型关系定义正确：
- User → Company（多对一，onDelete: SetNull）
- Company → Products/Articles/Events/Jobs（一对多，级联删除配置合理）
- Session → User（多对一，onDelete: Cascade）

### 3.2 索引检查 - ⚠️ 建议改进

**已正确配置的索引**：
- User: email (unique), companyId
- Company: name (unique), slug (unique)
- Article: slug (unique), status+publishedAt, category, companyId, isFeatured+status
- Event: companyId, status
- Job: companyId+status, type, city

**建议添加的索引**：
1. **User(email, role)** - 复合索引，加速登录时的角色验证
2. **Company(status)** - 用于查询已审核/待审企业列表
3. **Article(status, publishedAt, category)** - 优化首页资讯列表查询

### 3.3 枚举值一致性 - ✅ 通过

所有枚举定义在 schema 中一致，代码中使用的枚举值与 Prisma Client 生成类型匹配。

---

## 4. Seed 数据质量检查

### 4.1 图片路径 - ✅ 通过

所有企业 Logo 和文章封面图均使用本地路径（`/images/...`），无外部 Unsplash URL。

### 4.2 企业数据 - ✅ 通过

- 17 家企业均有完整的名称、描述、行业信息
- 描述长度均超过 20 字符，内容专业且符合半导体行业背景

### 4.3 文章数据 - ⚠️ 部分问题

**发现 6 篇文章内容较短（<100 字符）**：
- `draft-wafer-bonding-defect-methods` (草稿）
- `pending-riscv-security-vehicle-gateway` (待审）
- `archived-2025-top-10-keywords` (归档）

**说明**：这些是后台演示用的特殊状态文章，内容短是预期行为。但建议：
1. 为草稿和待审文章添加更有意义的占位内容
2. 归档文章应保留完整内容

### 4.4 数据真实性 - ✅ 通过

- 所有文章作者、来源标注清晰
- 企业信息真实可信（虚构但符合行业背景）
- 不存在暴露真实用户隐私的问题

---

## 5. 登录 API 测试

### 5.1 API 端点

**注意**：登录 API 路径为 `/api/auth/login`（不是任务描述中的 `/api/auth/admin/login` 和 `/api/auth/enterprise/login`）

单端点处理所有用户类型，通过 `role` 字段区分权限。

### 5.2 服务器状态

**开发服务器未运行**（端口 3002 无响应），无法完成实时 API 测试。

### 5.3 代码审查 - ✅ 通过

登录逻辑 (`src/app/api/auth/login/route.ts`)：
- 使用 bcryptjs 进行密码比对 - ✅
- 对重定向路径进行安全验证（`isSafeRedirect`）- ✅
- 根据角色限制访问路径 - ✅
- 使用 JWT 签名 Session Token - ✅

---

## 6. 安全检查

### 6.1 密码哈希 - ✅ 通过

所有 5 个用户的密码哈希均以 `$2` 开头（bcrypt 格式），无明文密码或弱哈希。

### 6.2 Session Cookie 配置 - ⚠️ 需要改进

当前配置 (`src/lib/auth/session.ts` + `src/app/api/auth/login/route.ts`)：

```typescript
res.cookies.set(SESSION_COOKIE_NAME, token, {
  httpOnly: true,      // ✅ 防 XSS
  sameSite: "lax",    // ⚠️ 建议 admin 路由使用 "strict"
  secure: process.env.NODE_ENV === "production",  // ⚠️ 见下文
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});
```

**发现的问题**：

1. **`secure` 标志依赖 NODE_ENV**：
   - 开发环境（HTTP）无法设置 Secure 标志
   - 如果生产环境使用 HTTPS，确保 `NODE_ENV=production`

2. **缺少 `__Host-` 前缀**：
   - 建议 Cookie 名改为 `__Host-xinshiye_session`
   - 防止 Cookie Tossing 攻击

3. **SameSite 可以更严格**：
   - 对于 admin 路由，建议使用 `SameSite=strict`
   - 当前 `lax` 允许跨站 POST（如第三方链接）

4. **SESSION_SECRET 验证**：
   - `.env` 中已配置 64 字符的密钥 - ✅
   - 开发环境缺少时会生成临时密钥并有警告 - ✅

### 6.3 JWT Token 签名 - ✅ 通过

使用 `jose` 库进行 HS256 签名：
- Secret 长度验证（≥32 字符）- ✅
- Token 包含必要载荷（sub, role, email, adminRole）- ✅
- 设置过期时间（7 天）- ✅

---

## 7. 其他发现

### 7.1 数据库表命名问题

任务描述中提及的表名与实际 Schema 不一致：
- `Admin` 表 → 不存在，用户存储在 `User` 表
- `Enterprise` 表 → 不存在，用户存储在 `User` 表
- `Award` 表 → 不存在，只有 `AwardCampaign` 和 `AwardVote`

### 7.2 Prisma 版本过旧

当前使用 Prisma 6.19.0，最新版本为 7.8.0。
- 存在主版本更新警告
- `package.json#prisma` 配置已弃用，建议迁移到 `prisma.config.ts`

---

## 8. 建议改进项

### 高优先级
1. **修正 Demo 账户邮箱域名**：统一 `@xinshiye.dev` 或 `@xinshiye.demo`
2. **添加数据库索引**：User(email+role), Company(status)
3. **初始化 SoftArticle 和 MediaChannel 数据**：确保软文功能可用

### 中优先级
4. **改进 Session Cookie 安全配置**：
   - 添加 `__Host-` 前缀
   - Admin 路由使用 `SameSite=strict`
   - 确保生产环境 `secure=true`
5. **优化文章 Seed 数据**：为草稿/待审文章添加更有意义的占位内容

### 低优先级
6. **升级 Prisma 到 v7**：获取新功能和安全更新
7. **添加数据库约束**：如文章 `publishedAt` 在 `status=PUBLISHED` 时必填

---

## 9. 审计结论

**总体评分**：⭐⭐⭐⭐ (4/5)

**优势**：
- 数据库架构设计合理，关系完整
- Seed 数据质量高，图片使用本地资源
- 密码存储安全（bcrypt）
- Session 管理使用标准 JWT 实践

**需要改进**：
- Demo 账户配置不清晰
- 部分数据表为空（功能不可用）
- Session Cookie 安全标志可加强
- 缺少部分推荐索引

**下一步**：
1. 修复 Demo 账户邮箱域名问题
2. 运行 `npx prisma db push` 添加建议索引
3. 初始化 SoftArticle 和 MediaChannel 种子数据
4. 启动开发服务器后重新运行登录 API 测试
