import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { adminUserFromSession, type AdminUser } from "@/lib/admin-auth";
import type { AdminRole } from "@prisma/client";

export type AdminApiUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN";
  adminRole: AdminRole | null;
};

export async function getAdminFromRequest(req: NextRequest): Promise<AdminApiUser | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session || session.role !== "ADMIN") return null;
  const user: AdminUser = adminUserFromSession(session);
  return { id: user.id, email: user.email, name: user.name, role: user.role, adminRole: user.adminRole };
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
