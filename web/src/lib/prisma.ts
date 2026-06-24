import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["error", "warn"],
  });
};

export const prisma =
  globalForPrisma.prisma ??
  prismaClientSingleton();

globalForPrisma.prisma = prisma;

/**
 * 预连接 — 在应用启动时建立数据库连接池，
 * 减少第一个请求等待连接建立的时间。
 *
 * 在 next.config.ts 的 onStart 或 server start 时调用。
 */
export async function warmPrismaConnection() {
  try {
    await prisma.$connect();
    console.log("[prisma] Database connection established");
  } catch (err) {
    console.error("[prisma] Failed to connect to database:", err);
  }
}
