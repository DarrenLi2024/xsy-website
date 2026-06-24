/**
 * Next.js 16 Instrumentation Hook
 *
 * 在服务器启动时运行，用于预热数据库连接等一次性初始化。
 * 减少首个请求的冷启动延迟。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { warmPrismaConnection } = await import("@/lib/prisma");
    await warmPrismaConnection();
  }
}
