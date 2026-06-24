# 测试策略

---

## 测试层次

```
E2E Tests (Playwright)
    ↑ 模拟真实用户操作
Component Tests (Vitest + Testing Library)
    ↑ 组件交互行为
Unit Tests (Vitest)
    ↑ 纯函数 / utils / 数据层
```

---

## 当前测试覆盖率

| 层次 | 文件 | 框架 | 状态 |
|------|------|------|------|
| 单元测试 | `src/lib/auth/session.test.ts` | Vitest | ✅ 已实现 |
| 单元测试 | `src/lib/search.test.ts` | Vitest | ✅ 已实现 |
| 单元测试 | `src/lib/utils.test.ts` | Vitest | ✅ 已实现 |
| E2E 测试 | `e2e/app.spec.ts` | Playwright | ✅ 已实现 |
| 组件测试 | — | Vitest + Testing Library | ⬜ 未覆盖 |

### 运行测试

```bash
# 所有单元测试
npm run test

# Watch 模式
npm run test:watch

# E2E 测试（需要 dev server 运行）
npm run test:e2e

# Playwright UI 模式（可视化调试）
npm run test:e2e:ui
```

---

## 单元测试指南

### 测试配置

`vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### 测试模式

**纯函数测试：**

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("merges tailwind classes", () => {
    expect(cn("px-4 py-2", "px-6")).toBe("py-2 px-6");
  });
});
```

**异步数据层测试：**

```typescript
// src/lib/auth/session.test.ts
import { describe, it, expect } from "vitest";
import { signSessionToken, verifySessionToken } from "./session";

describe("session", () => {
  it("signs and verifies tokens", async () => {
    const token = await signSessionToken({ sub: "1", role: "ADMIN", email: "a@b.com" });
    expect(token).toBeTruthy();
    const payload = await verifySessionToken(token);
    expect(payload?.sub).toBe("1");
  });
});
```

---

## E2E 测试指南

### 配置

`playwright.config.ts`：

```typescript
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:3002",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3002",
    reuseExistingServer: !process.env.CI,
  },
});
```

### 编写 E2E 测试

```typescript
// e2e/app.spec.ts
import { test, expect } from "@playwright/test";

test("首页正常加载", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
});
```

---

## 新增测试指南

### 何时添加测试

- **Tools / Utils：** 所有公共工具函数
- **Auth / Session：** 关键的认证/授权逻辑
- **数据层查询：** 复杂的聚合查询（Mock Prisma）
- **API Routes：** 关键业务 API（通过 `fetch` 测试）
- **UI 组件：** 交互复杂的 Client Component

### 文件命名

```
src/lib/foo.test.ts        # 单元测试
src/components/bar.test.tsx # 组件测试
e2e/baz.spec.ts            # E2E 测试
```

### 测试建议

1. **优先测试边界条件**（空数据、错误路径、权限不足）
2. **使用 `describe` 嵌套组织测试**
3. **测试命名清晰表达意图**：`"should return empty array when no articles found"`
4. **对 ISR/缓存逻辑**，测试缓存穿透和降级行为
5. **Prisma 查询测试**建议使用 `beforeAll` 创建测试数据

---

## 推荐的后续测试覆盖

| 优先级 | 测试内容 | 类型 | 说明 |
|--------|----------|------|------|
| 🔴 高 | `admin-auth.ts` — RBAC 权限矩阵 | 单元测试 | 验证角色权限分配正确 |
| 🔴 高 | `safe-query.ts` — 错误降级 | 单元测试 | 验证 fallback 机制 |
| 🟡 中 | `public-lists.ts` — 缓存行为 | 集成测试 | 验证 ISR 缓存命中/失效 |
| 🟡 中 | 文章 API CRUD | 集成测试 | 验证完整的增删改查流程 |
| 🟢 低 | UI 组件快照测试 | 组件测试 | 验证组件渲染不意外变化 |
| 🟢 低 | E2E 登录流程 | E2E | 验证完整的登录→跳转→登出流程 |
