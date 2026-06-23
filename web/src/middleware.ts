import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3002",
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean) as string[];

// --- Simple in-memory rate limiter for login endpoint ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 attempts per minute

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// Periodically clean up expired entries
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of rateLimitMap) {
      if (now > v.resetAt) rateLimitMap.delete(k);
    }
  }, 300_000);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply rate limiting for login endpoint
  if (pathname === "/api/auth/login" && req.method === "POST") {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试" },
        { status: 429 }
      );
    }
  }

  // CSRF: validate Origin for mutating admin API requests
  if (
    pathname.startsWith("/api/admin") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  ) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const allowed = ALLOWED_ORIGINS.some(
      (o) => origin === o || referer?.startsWith(o)
    );
    if (origin && !allowed) {
      return NextResponse.json({ error: "CSRF: forbidden origin" }, { status: 403 });
    }
  }

  // Auth pages: don't check session
  if (
    pathname.startsWith("/enterprise/login") ||
    pathname.startsWith("/enterprise/register") ||
    pathname.startsWith("/admin/login")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    const session = await verifySessionToken(token);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/enterprise")) {
    if (!token) {
      return NextResponse.redirect(new URL("/enterprise/login", req.url));
    }
    const session = await verifySessionToken(token);
    if (!session || (session.role !== "ENTERPRISE" && session.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/enterprise/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/enterprise", "/enterprise/:path*", "/api/auth/login"],
};
