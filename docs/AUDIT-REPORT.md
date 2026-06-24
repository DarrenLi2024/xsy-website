# 全栈审计报告

> **日期：** 2026-06-24
> **范围：** 前端组件、API 路由、后端逻辑、数据层、数据库 Schema
> **总发现：** 24 高 / 50 中 / 32 低

---

## 严重性分布

| 层级 | 🔴 高 | 🟡 中 | 🟢 低 | 总计 |
|------|-------|-------|-------|------|
| 前端组件 | 18 | 35 | 20 | 73 |
| API 路由与后端 | 3 | 11 | 8 | 22 |
| 数据层与数据库 | 3 | 4 | 4 | 11 |
| **总计** | **24** | **50** | **32** | **106** |

---

## 🔴 高严重性问题（按优先级排序）

### H1. RBAC 权限系统未实际启用

**文件：** `src/lib/admin-auth.ts` + 所有 `/api/admin/*` 路由
**层级：** 后端

**问题：** 已定义完整的 RBAC 系统（`AdminPermit` 类型、`ROLE_PERMISSIONS` 映射、`checkPermitOrDeny()`），但没有任何一个 admin API 路由实际调用这些权限检查函数。所有路由仅验证用户是 ADMIN 角色，不做细粒度权限判断。

这意味着：
- 内容编辑员 (`CONTENT_EDITOR`) 可访问用户管理、设置等敏感接口
- 审核员 (`REVIEWER`) 可修改企业数据
- 运行时无 403 响应的实际来源

**修复：** 在每个路由中增加 `checkPermitOrDeny()` 调用。✅ **已在本次审计中修复**

---

### H2. 首页 Hero 轮播空图片 src 导致加载错误

**文件：** `src/components/home/home-hero.tsx:37`
**层级：** 前端

**问题：** `src={slide.image || ""}` 当 `slide.image` 为 `null/undefined` 时，Next.js `<Image>` 收到空字符串作为 src，触发图片加载错误，控制台报 400。

**修复：** 条件渲染 `<Image>` 组件，仅在 `slide.image` 有效时渲染。

---

### H3. Carousel 自动轮播无暂停机制（WCAG 2.2.2 违规）

**文件：** `src/components/home/home-hero.tsx`、`src/components/home/home-feed.tsx`
**层级：** 前端

**问题：** 两个轮播组件均每 5 秒自动切换，用户无法暂停。违反 WCAG 2.2.1 自动播放要求。非可见幻灯片仍保留在 DOM 中，屏幕阅读器可聚焦到隐藏内容。

**修复：** 添加 `onMouseEnter`/`onMouseLeave` 暂停、`onFocus`/`onBlur` 暂停、使用 `aria-hidden` 隐藏非当前幻灯片。

---

### H4. Toast 通知无 ARIA live region

**文件：** `src/components/admin/toast.tsx`
**层级：** 前端

**问题：** Toast 容器无 `aria-live="polite"` 或 `role="status"`，屏幕阅读器完全不感知 Toast 消息。`setTimeout` 清理函数缺失，组件卸载时触发状态更新警告。

**修复：** 添加 `aria-live` 属性和 timeout 清理。

---

### H5. 搜索结果输入框无防抖且无 aria-label

**文件：** `src/components/admin/search-input.tsx`
**层级：** 前端

**问题：** `debounceMs` 参数完全未使用（`void debounceMs` 主动忽略），每次按键立即触发路由导航。缺少 `aria-label`，屏幕阅读器无法识别输入框用途。

**修复：** 实现真实防抖逻辑，添加 `aria-label`。

---

### H6. 分页组件缺少无障碍结构

**文件：** `src/components/admin/pagination.tsx`
**层级：** 前端

**问题：** 无 `<nav>` 或 `role="navigation"`、当前页无 `aria-current="page"`、缺少 `rel="prev"` 和 `rel="next"`。

**修复：** 添加语义化导航结构和 ARIA 属性。

---

### H7. Modal 确认对话框无焦点管理

**文件：** `src/components/admin/confirm-dialog.tsx`
**层级：** 前端

**问题：** 无焦点陷阱（Focus Trap）、关闭后焦点不恢复、缺少 `role="alertdialog"` 和 `aria-modal="true"`。

**修复：** 实现焦点管理，添加正确 ARIA 角色。

---

### H8. Mobile 导航无焦点陷阱

**文件：** `src/components/layout/mobile-nav.tsx`
**层级：** 前端

**问题：** 移动端菜单打开后，Tab 焦点可跳出到背景页面内容。

**修复：** 实现焦点陷阱，背景添加 `aria-hidden`。

---

### H9. Event 表缺少 [status, endDate] 复合索引

**文件：** `prisma/schema.prisma`
**层级：** 数据库

**问题：** `Event` 表按 `status` 查询后过滤 `endDate`，但仅有 `@@index([status])`。数据增长后日期过滤需扫描大量行。

**修复：** 添加 `@@index([status, endDate])` 和 `@@index([status, startDate])`。

---

### H10. Ad 表缺少涵盖日期范围的索引

**文件：** `prisma/schema.prisma`
**层级：** 数据库

**问题：** Ad 查询涉及 `active + startDate + endDate` 范围过滤，但仅有 `@@index([slotId, active])`。

**修复：** 添加 `@@index([slotId, active, startDate, endDate])`。

---

### H11. public-detail.ts 无任何错误处理

**文件：** `src/lib/data/public-detail.ts`
**层级：** 后端

**问题：** `getPublishedArticleBySlug` 等函数无 try/catch 或 fallback。数据库异常时导致页面 500 崩溃。

**修复：** 使用 `safeQuery` 包装或添加 error boundary。

---

### H12. admin-stats.ts Promise.all 缺乏粒度容错

**文件：** `src/lib/data/admin-stats.ts`
**层级：** 后端

**问题：** 6 个查询使用 `Promise.all`，任一失败导致全量统计丢失。

**修复：** 使用 `Promise.allSettled` 逐个降级。

---

### H13. Settings API 接受任意 JSON

**文件：** `src/app/api/admin/settings/route.ts`
**层级：** 后端

**问题：** `z.record(z.string(), z.unknown())` 接受任意值类型，可能导致存储异常数据。

**修复：** 为每个已知配置键定义具体 Zod schema。

---

### H14. pageSectionItem 使用硬删除

**文件：** `src/app/api/admin/page-sections/items/[itemId]/route.ts`
**层级：** 后端

**问题：** 与其他资源的软删除模式不一致，误删后无法恢复。

**修复：** 改为软删除模式。

---

## 🟡 中严重性问题摘要

### API 路由与后端（11 项）

| # | 问题 | 文件 |
|---|------|------|
| M1 | slugify 函数重复定义 | `register/route.ts` + `admin/companies/route.ts` |
| M2 | 响应辅助函数重复（admin-api.ts vs enterprise-api.ts） | `lib/admin-api.ts` + `lib/enterprise-api.ts` |
| M3 | 内存限流在 Serverless 多实例环境无效 | `middleware.ts` |
| M4 | CSRF origin 校验缺少环境变量时静默降级 | `middleware.ts` |
| M5 | `Record<string, unknown>` 绕过类型安全 | 多处 PUT 路由 |
| M6 | 空字符串 `""` 被 `||` 转为 `null`，数据丢失 | `page-sections/items/[itemId]/route.ts` |
| M7 | sortBy/sortOrder 参数未校验白名单 | `admin/articles/route.ts` |
| M8 | 草稿状态也触发缓存失效 | `admin/articles/route.ts` |
| M9 | 事件列表未过滤已删除记录 | `admin/events/route.ts` |
| M10 | bcrypt 12 轮在 Serverless 延迟较高（≈300ms） | `register/route.ts` |
| M11 | 文件上传仅依赖 Content-Type 校验，可伪造 | `admin/upload/route.ts` |

### 数据层与数据库（4 项）

| # | 问题 | 文件 |
|---|------|------|
| D1 | 缓存标签粒度过粗（全部用 `"home"`） | `lib/data/public-lists.ts` |
| D2 | `revalidate.ts` 未覆盖 admin 缓存标签 | `lib/revalidate.ts` |
| D3 | `looksLikeTransientEmpty` 判断条件过严 | `lib/data/home.ts` |
| D4 | COUNT 聚合缺少 `deletedAt` 部分索引 | `prisma/schema.prisma` |

### 前端组件（35 项-详见各组件审计）

关键项：

| # | 问题 | 文件 |
|---|------|------|
| F1 | `group-hover` 因缺少 `group` 类而失效 | `home-companies.tsx` |
| F2 | `home-events.tsx` 中的死代码 | `home-events.tsx:52-53` |
| F3 | `FeaturedCarousel` 的 `setInterval` 清理可能不完整 | `home-feed.tsx` |
| F4 | 非首屏组件未使用懒加载 / Suspense 流式加载 | `page.tsx` |
| F5 | 颜色体系硬编码，未主题化 | 多处 |
| F6 | `hero-slide` 中的不安全的类型断言 | `home-cta.tsx` |
| F7 | Footer 中的不安全的类型断言 | `site-footer.tsx` |
| F8 | 移动端导航项硬编码，与桌面端不同步 | `mobile-nav.tsx` |
| F9 | 轮播指示器按钮 aria-label 缺少总数信息 | `home-hero.tsx`、`home-feed.tsx` |

---

## 🟢 低严重性问题摘要

| # | 问题 | 文件/层级 |
|---|------|-----------|
| L1 | `forbidden()` 函数已定义但未使用 | 后端 |
| L2 | 分页参数缺乏上限校验 | 后端 |
| L3 | AuditLog 日期参数未校验 `dateFrom <= dateTo` | 后端 |
| L4 | `enterprise-auth.ts` 中的不安全类型断言 | 后端 |
| L5 | Settings upsert 后重新获取全部设置，不必要 | 后端 |
| L6 | 文件删除 IO 错误被静默吞掉 | 后端 |
| L7 | PrismaClient 未配置查询日志/连接池 | 数据层 |
| L8 | seed.ts 批量创建使用逐条 `create()` | 数据层 |
| L9 | `search.ts` 属性更新缺少错误处理 | 数据层 |
| L10-32 | 前端剩余低优问题（motion-reduce 处理、cn 导入不一致、空状态 ARIA 等） | 前端 |

---

## 修复行动

### 第一阶段：已修复（本次）

1. **H1 — RBAC 权限系统**：已在所有 admin API 路由中注入 `checkPermitOrDeny()`
2. **H2 — Hero 空图片 src**：条件渲染 `<Image>`
3. **H9 — Event 表复合索引**：添加 `[status, endDate]` 和 `[status, startDate]`
4. **H10 — Ad 表复合索引**：添加 `[slotId, active, startDate, endDate]`

### 第二阶段：建议近期修复

- H3-H8 前端无障碍问题（WCAG A/AA 违规）
- H11-H12 后端容错强化
- M1-M2 代码重复清理
- M3 分布式限流
- M6 空字符串数据丢失修复

### 第三阶段：建议持续改进

- M4-M11 后端安全性加固
- D1-D4 缓存策略优化
- F1-F9 前端代码质量提升
- 颜色体系主题化
- 测试覆盖率增加（参照 `TESTING.md`）

---

## 审计方法

- **静态代码分析：** 逐文件阅读关键代码路径
- **模式分析：** 检查 API 设计一致性、数据流完整性
- **安全审计：** 认证、授权、输入校验、输出编码
- **性能审计：** 查询 N+1、索引覆盖、缓存策略
- **可访问性审计：** WCAG 2.2 AA 标准
