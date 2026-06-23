/**
 * 安全的 Prisma 查询包装器。
 * 在数据获取失败时返回一个 fallback 值而非抛出异常，
 * 确保页面始终可渲染（优雅降级）。
 */
export async function safeQuery<T>(
  fn: () => Promise<T>,
  fallback: T,
  label: string,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error(`[safeQuery:${label}]`, err instanceof Error ? err.message : err);
    return fallback;
  }
}
