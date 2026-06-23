import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export type EnterpriseApiUser = {
  id: string;
  email: string;
  role: "ENTERPRISE" | "ADMIN";
  companyId: string | null;
};

export async function getEnterpriseFromRequest(req: Request): Promise<EnterpriseApiUser | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  const session = await verifySessionToken(match[1]);
  if (!session || (session.role !== "ENTERPRISE" && session.role !== "ADMIN")) return null;
  return {
    id: session.sub,
    email: session.email,
    role: session.role as "ENTERPRISE" | "ADMIN",
    companyId: session.companyId ?? null,
  };
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const enterpriseUnauthorized = unauthorized;

export function notFound(entity = "Resource") {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function badRequest(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function ok<T>(data: T) {
  return NextResponse.json(data);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}
