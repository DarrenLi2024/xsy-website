# 安全文档

---

## 已实施的安全措施

### 1. HTTP 安全头

配置在 `next.config.ts` 中，生产环境自动生效：

| 头部 | 值 | 作用 |
|------|----|------|
| `X-Frame-Options` | `SAMEORIGIN` | 防止点击劫持 |
| `X-Content-Type-Options` | `nosniff` | 禁止 MIME 类型嗅探 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 控制 Referer 头信息泄露 |
| `X-DNS-Prefetch-Control` | `on` | DNS 预取优化 |
| `Content-Security-Policy` | 见下 | 内容安全策略 |
| `Strict-Transport-Security` | 2 年 + preload | 强制 HTTPS |

**CSP 策略（生产环境）：**

```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob: https: http:
font-src 'self' data:
connect-src 'self' https: http:
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

### 2. 认证与会话

- 密码使用 **bcryptjs** 哈希存储（非明文）
- 会话使用 **JWT (HS256)** 签名，`jose` 库实现
- Cookie 配置：`httpOnly`、`sameSite: "lax"`、生产环境 `secure`
- 会话有效期：7 天，不可刷新
- 开发环境回退到进程内临时密钥（每次重启失效）
- 生产环境要求 `SESSION_SECRET` 至少 32 字符

### 3. 访问控制（RBAC）

**4 种内置角色：**

| 角色 | 权限范围 |
|------|----------|
| `SUPER_ADMIN` | 全部 24 种操作权限 |
| `CONTENT_EDITOR` | 文章/活动/报告/评选 CRUD + 页面板块管理 |
| `BUSINESS_OPS` | 企业/产品/活动/职位/广告 CRUD |
| `REVIEWER` | 只读 + 审核权限（文章审核、企业审核） |

**权限检查层级：**

```
Middleware → API Route → checkPermitOrDeny(user, permit)
```

### 4. CSRF 防护

对 `/api/admin` 的 POST / PUT / PATCH / DELETE 请求，中间件校验 `Origin` 或 `Referer` 头是否在允许列表中：

```typescript
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3002",
  process.env.NEXT_PUBLIC_SITE_URL,
];
```

### 5. Rate Limiting

登录接口 `/api/auth/login`：
- 算法：内存滑动窗口
- 窗口：60 秒
- 上限：每个 IP 5 次请求
- 清理：每 5 分钟清理过期条目

### 6. 开放重定向防护

登录成功后的 `redirect` 参数经过 `isSafeRedirect()` 校验：

```typescript
function isSafeRedirect(target: string): boolean {
  if (!target.startsWith("/")) return false;         // 必须相对路径
  if (target.startsWith("//")) return false;         // 禁止协议相对
  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(target)) return false;  // 禁止绝对 URL
  return true;
}
```

### 7. 数据库安全

- 参数化查询（Prisma ORM + raw query 使用参数占位符 `$1` 等）
- 软删除通过 `deletedAt` 字段实现，非物理删除
- 安全查询包装器 `safeQuery` 捕获异常降级，不泄露数据库错误细节

### 8. 敏感信息保护

- `.env` 文件不在版本控制中（`.gitignore` 已配置）
- 错误响应不包含堆栈信息
- CSP 限制 `connect-src` 防止数据外泄

---

## 需改进的安全措施

### 高优先级

1. **Cookie 设置 `SameSite=Strict` 而非 `Lax`**
   - 当前使用 `lax` 以兼容后台管理跳转
   - 改为 `strict` 可更好防止 CSRF，但需确认登入后跳转流程不受影响

2. **Rate Limiting 改为持久化存储**
   - 当前内存 Map 在单实例工作正常，但多实例（Vercel 多区域）下不共享
   - 建议迁移到 Redis / Vercel KV 实现分布式限流

3. **登录接口添加 CAPTCHA**
   - 建议在连续 3 次失败后启用 CAPTCHA 验证

### 中优先级

4. **API 请求频率限制扩展到所有 Admin API**
   - 目前仅登录接口有限流
   - 建议对所有 Admin API 添加基于 API Key 或用户 ID 的限流

5. **文件上传安全**
   - 当前 `/api/admin/upload` 未做文件类型白名单校验
   - 建议限制允许的 MIME 类型、大小，并使用单独域名存储上传文件

6. **完善审计日志**
   - 目前审计日志已记录操作类型和资源 ID
   - 建议补充：变更前后的数据 diff、IP 地址、User-Agent

### 低优先级

7. **Secrets 轮换策略**
   - 建议定期轮换 `SESSION_SECRET`

8. **日志脱敏**
   - 审计日志中不应包含原始密码或令牌

---

## 数据隐私

- 用户密码仅存储 bcrypt hash，不可逆
- IP 地址在投票功能中以 SHA-256 哈希存储
- 不收集非必要的个人数据

---

## 安全最佳实践清单

- [x] 密码哈希（bcrypt）
- [x] JWT 签名验证
- [x] HttpOnly Cookie
- [x] CSRF Origin 校验
- [x] 安全 HTTP 头（CSP，HSTS，X-Frame-Options）
- [x] 登录频率限制
- [x] 开放重定向防护
- [x] 软删除
- [x] 参数化查询
- [x] 角色权限控制（RBAC）
- [x] 错误信息不泄露
- [ ] 文件上传类型校验
- [ ] 分布式限流
- [ ] CAPTCHA 验证
- [ ] 完善的 CORS 策略
- [ ] Rate limiting 扩展至所有 API
