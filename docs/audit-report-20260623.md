# 芯师爷全站一致性检查与功能链路验证报告

> 检查时间: 2026-06-23 09:00-10:30  
> 检查范围: 前台 + 管理后台 + 企业后台 全部页面  
> 检查方式: 代码审计 (3个Agent) + API路由审计 (50个) + 实时HTTP验证 + 图片水印处理

---

## 一、已完成修复

| 修复项 | 状态 | 说明 |
|--------|------|------|
| AIGC图片水印去除 | ✅ | 49张图片分批裁剪底部140px，水印已完全清除 |
| Dev Server运行 | ✅ | localhost:3002 正常运行 |

---

## 二、Issue清单 (按严重程度排序)

### 🔴 P0 — 阻塞性问题 (2项)

| # | Issue | 文件 | 影响 |
|---|-------|------|------|
| **1** | **React Hooks 规则违反** | `src/components/home/home-hero.tsx:14-16` | `if (slides.length === 0) return null` 在 `useState(0)` 之前，违反 Hooks 必须无条件调用的规则。当 slides 从非空变为空时可能导致运行时崩溃 |
| **2** | **企业注册页不可访问 (307重定向)** | `src/middleware.ts:47-55` | `/enterprise/register` 被中间件认证拦截，重定向到登录页，注册功能完全不可用 |

### 🟠 P1 — 高优先级 (5项)

| # | Issue | 文件 | 影响 |
|---|-------|------|------|
| **3** | **全项目零 error.tsx 文件** | 全部路由组 | 运行时错误显示 Next.js 默认错误页，用户体验差，无重试/返回机制 |
| **4** | **全项目零 loading.tsx 文件** | 全部路由组 | 服务端组件数据获取期间无加载状态，用户看到白屏 |
| **5** | **后台侧边栏活跃状态精确匹配** | `src/components/admin/side-nav.tsx` | 子页面(如 `/admin/articles/new`)不会高亮父级菜单项(文章) |
| **6** | **Marketing 页面无数据获取安全包装** | 企业/文章/活动/招聘/报告 list/detail | 数据库故障直接500，需参照首页的 `getHomePageDataSafe()` 模式 |
| **7** | **10处 `window.location.href` 滥用** | admin events/awards/jobs/logs 页面 | 筛选器变更时整页刷新，浪费资源且体验差，应改用 `router.push()` |

### 🟡 P2 — 中优先级 (7项)

| # | Issue | 文件 | 影响 |
|---|-------|------|------|
| **8** | **`cn` 工具函数重复定义** | `src/lib/cn.ts` + `src/lib/utils.ts` | 两文件内容完全相同，约6个组件从不同路径导入，维护风险 |
| **9** | **移动端导航硬编码** | `src/components/layout/mobile-nav.tsx` | 桌面端导航从CMS动态获取，移动端硬编码，两者可能不同步；且缺少"入驻"入口 |
| **10** | **19处空 alt 文本** | 前台 + 后台共12个文件 | 无障碍访问不合格，图片无有意义的描述文本 |
| **11** | **404页面主题冲突** | `src/app/not-found.tsx` | 使用浅色主题，但后台/企业端是深色主题，深色页面中出现浅色404不协调 |
| **12** | **图片 remotePatterns 配置不全** | `next.config.ts` | 仅白名单 `images.unsplash.com`，生产环境下用户上传的其他域名图片无法被Next.js Image优化 |
| **13** | **企业端跨模块依赖** | `src/app/enterprise/(app)/layout.tsx` | Import `@/components/admin/toast`，违反模块边界 |
| **14** | **Enterprise settings 为空壳页面** | `src/app/enterprise/(app)/settings/page.tsx` | 仅展示静态文本占位，无实际设置功能 |

### 🟢 P3 — 低优先级 (6项)

| # | Issue | 文件 | 影响 |
|---|-------|------|------|
| **15** | **后台/企业端侧边栏90%代码重复** | `src/components/admin/side-nav.tsx` + `src/components/enterprise/side-nav.tsx` | 应抽取为共享组件，减少维护成本 |
| **16** | **登录页代码重复** | admin/login + enterprise/login | 两个登录页几乎完全相同，可合并 |
| **17** | **CSS变量定义与使用脱节** | `globals.css` | 定义了 `--background`, `--foreground` 等但很少使用，大量硬编码 `#fbfbfd` 等色值 |
| **18** | **强调色体系不统一** | 全局 | 营销页用 `#0071e3` (Apple蓝)，后台用 `cyan-500` |
| **19** | **无现代 favicon** | `public/` | 仅 `favicon.ico`，缺 `icon.png`、`apple-touch-icon.png`、`manifest.json` |
| **20** | **无 og-image** | `app/layout.tsx` | OpenGraph 无默认分享图片 |

---

## 三、API路由问题 (3项)

| # | Issue | 路由 | 影响 |
|---|-------|------|------|
| **21** | **文件上传API为占位符** | `/api/admin/upload` | 仅回显URL，无实际上传功能 |
| **22** | **Enterprise路由90%无Zod验证** | `/api/enterprise/*` | 仅 soft-articles 使用Zod，其余路由手动逐字段检查，存在安全隐患 |
| **23** | **Enterprise soft-articles访问admin API** | `/api/admin/media` | 企业端直接调用admin媒体API，可能存在越权风险 |

---

## 四、代码质量问题 (3项)

| # | Issue | 文件 | 说明 |
|---|-------|------|------|
| **24** | **状态标签重复定义** | 多个文件 | 事件类型/职位类型/行业列表在至少3个文件中重复硬编码 |
| **25** | **`ui/card.tsx` 不必要的"use client"** | `src/components/ui/card.tsx` | 纯展示组件不应标记"use client"，会感染所有引用它的组件 |
| **26** | **Admin page-sections 模式不一致** | 所有page-section页面 | 与其他模块(用服务端组件)不同，全部用客户端组件 |

---

## 五、功能链路验证结果

### 前台页面 (全200 OK) ✅
| 页面 | 状态 | 大小 |
|------|------|------|
| 首页 `/` | 200 | 188.9KB |
| 关于 `/about` | 200 | 30.6KB |
| 企业列表 `/companies` | 200 | 64.7KB |
| 搜索 `/search` | 200 | 29.8KB |
| 文章列表 `/articles` | 200 | 67.1KB |
| 活动列表 `/events` | 200 | 83.1KB |
| 评选列表 `/awards` | 200 | 36.0KB |
| 招聘列表 `/jobs` | 200 | 62.1KB |
| 报告列表 `/reports` | 200 | 55.5KB |
| 企业详情 `/companies/[slug]` | 200 | ~35.8KB |
| 404页面 | 200 | 11.0KB |

### 认证页面 ✅
| 页面 | 状态 | 
|------|------|
| `/admin/login` | 200 | 
| `/enterprise/login` | 200 |

### 阻塞页面 ❌
| 页面 | 状态 | 原因 |
|------|------|------|
| `/enterprise/register` | **307** | 中间件认证拦截 |

---

## 六、修复方案

### 阶段一：阻塞性修复 (预计30分钟)

1. **修复 React Hooks 违规** (`home-hero.tsx`)
   - 将 `useState` 移到条件返回之前
   
2. **修复注册页中间件** (`middleware.ts`)
   - 在路由保护前增加 `/enterprise/register` 白名单跳过

3. **修复侧边栏活跃状态** (`admin/side-nav.tsx`)
   - 将精确匹配改为前缀匹配（与enterprise保持一致）

### 阶段二：体验优化 (预计1小时)

4. **添加 error.tsx** — 三个路由组各一个
5. **添加 loading.tsx** — 关键页面
6. **替换 `window.location.href`** — 改用 `router.push()`
7. **合并 `cn` 工具函数** — 统一为 `@/lib/utils`
8. **修复图片 alt 文本** — 19处有意义的描述

### 阶段三：架构完善 (预计2小时)

9. **数据获取安全包装** — 参照 `getHomePageDataSafe()` 模式
10. **图片 remotePatterns** — 添加用户上传域名
11. **移动端导航动态化** — 与桌面端共用CMS数据
12. **404页面主题适配** — 根据路由组显示不同主题

### 阶段四：技术债清理 (待排期)

13. Enterprise路由Zod验证补齐
14. 侧边栏组件合并
15. 状态标签提取为常量
16. CSS变量体系重构
17. favicon/og-image补充

---

## 七、修复优先级建议

**本日必须修复**: Issue #1, #2 (阻塞性bug)  
**本周内修复**: Issue #3-#7, #21 (体验与功能缺口)  
**下迭代修复**: Issue #8-#14 (一致性与规范)  
**技术债**: Issue #15-#26  
