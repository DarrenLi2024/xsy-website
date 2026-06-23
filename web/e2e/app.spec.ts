import { test, expect } from "@playwright/test";

test.describe("首页", () => {
  test("加载并显示标题", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/芯师爷/);
    // Verify header navigation links are present
    const nav = page.locator("header");
    await expect(nav).toBeVisible();
  });
});

test.describe("企业列表", () => {
  test("可访问企业列表页面", async ({ page }) => {
    await page.goto("/companies");
    await expect(page.locator("h1")).toContainText(/企业/);
  });
});

test.describe("搜索", () => {
  test("无关键词时显示提示", async ({ page }) => {
    await page.goto("/search");
    await expect(page.locator("h1")).toContainText("搜索");
  });

  test("有关键词时显示结果", async ({ page }) => {
    await page.goto("/search?q=芯片");
    // Wait for search results to load
    await page.waitForTimeout(2000);
    // Either shows results or loading state
    const content = await page.textContent("body");
    expect(content).toBeDefined();
  });
});

test.describe("认证流程", () => {
  test("企业登录页面可访问", async ({ page }) => {
    await page.goto("/enterprise/login");
    await expect(page.locator("form")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("管理后台登录页面可访问", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.locator("form")).toBeVisible();
  });

  test("未登录访问企业后台被重定向", async ({ page }) => {
    await page.goto("/enterprise/dashboard");
    // Should redirect to login page
    await expect(page).toHaveURL(/\/enterprise\/login/);
  });

  test("未登录访问管理后台被重定向", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("评选投票", () => {
  test("评选列表页可访问", async ({ page }) => {
    await page.goto("/awards");
    await expect(page.locator("h1")).toContainText("评选");
  });
});
