import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { adminUserFromSession, type AdminUser } from "@/lib/admin-auth";
import type { AdminRole } from "@prisma/client";

export type AdminApiUser = {
  id: string;
  email: string;
  role: "ADMIN";
  adminRole: AdminRole | null;
};

export async function getAdminFromRequest(req: Request): Promise<AdminApiUser | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  const session = await verifySessionToken(match[1]);
  if (!session || session.role !== "ADMIN") return null;
  const user: AdminUser = adminUserFromSession(session);
  return { id: user.id, email: user.email, role: user.role, adminRole: user.adminRole };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function notFound(entity = "Resource") {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function badRequest(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function ok<T>(data: T) {
  return NextResponse.json(data);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}
