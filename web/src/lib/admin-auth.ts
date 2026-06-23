import { cache } from "react";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME, type SessionPayload } from "@/lib/auth/session";
import type { AdminRole } from "@prisma/client";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN";
  adminRole: AdminRole | null;
};

export type AdminPermit =
  | "content:read"
  | "content:write"
  | "content:review"
  | "company:read"
  | "company:write"
  | "company:review"
  | "product:read"
  | "product:write"
  | "event:read"
  | "event:write"
  | "job:read"
  | "job:write"
  | "report:read"
  | "report:write"
  | "award:read"
  | "award:write"
  | "ad:read"
  | "ad:write"
  | "user:read"
  | "user:write"
  | "settings:read"
  | "settings:write"
  | "log:read"
  | "page:read"
  | "page:write";

const ROLE_PERMISSIONS: Record<string, AdminPermit[]> = {
  SUPER_ADMIN: [
    "content:read", "content:write", "content:review",
    "company:read", "company:write", "company:review",
    "product:read", "product:write",
    "event:read", "event:write",
    "job:read", "job:write",
    "report:read", "report:write",
    "award:read", "award:write",
    "ad:read", "ad:write",
    "user:read", "user:write",
    "settings:read", "settings:write",
    "log:read",
    "page:read", "page:write",
  ],
  CONTENT_EDITOR: [
    "content:read", "content:write", "content:review",
    "event:read", "event:write",
    "report:read", "report:write",
    "award:read", "award:write",
    "log:read",
    "page:read", "page:write",
  ],
  BUSINESS_OPS: [
    "company:read", "company:write",
    "product:read", "product:write",
    "event:read", "event:write",
    "job:read", "job:write",
    "ad:read", "ad:write",
    "award:read", "award:write",
    "log:read",
  ],
  REVIEWER: [
    "content:read", "content:review",
    "company:read", "company:review",
    "log:read",
  ],
};

export function hasPermit(adminRole: AdminRole | null, permit: AdminPermit): boolean {
  if (!adminRole) return false;
  const permits = ROLE_PERMISSIONS[adminRole];
  if (!permits) return false;
  return permits.includes(permit);
}

/** 从 JWT 构建管理员对象，避免每次请求都查库 */
export function adminUserFromSession(session: SessionPayload): AdminUser {
  return {
    id: session.sub,
    email: session.email,
    name: null,
    role: "ADMIN",
    adminRole: session.adminRole ?? null,
  };
}

export const getAdminUser = cache(async (): Promise<AdminUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session || session.role !== "ADMIN") return null;
  return adminUserFromSession(session);
});

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) {
    throw new Error("Unauthorized - redirect to /admin/login");
  }
  return user;
}

export function checkPermitOrDeny(user: AdminUser, permit: AdminPermit): void {
  if (!hasPermit(user.adminRole, permit)) {
    throw new Error("Forbidden");
  }
}
