import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3002",
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean) as string[];

// --- Simple in-memory rate limiter for login endpoint ---
// NOTE: In production (multi-instance), use Redis/Vercel KV for distributed rate limiting
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // -------------------------------------------------------
  // 1. Rate limiting (login endpoint only)
  // -------------------------------------------------------
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

  // -------------------------------------------------------
  // 2. CSRF: validate Origin for mutating admin API requests
  // -------------------------------------------------------
  if (
    pathname.startsWith("/api/admin") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  ) {
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    if (origin) {
      const allowed = ALLOWED_ORIGINS.some((o) => origin === o);
      if (!allowed) {
        return NextResponse.json({ error: "CSRF: forbidden origin" }, { status: 403 });
      }
    }
  }

  // -------------------------------------------------------
  // 3. Session check for protected routes
  // -------------------------------------------------------
  // Auth pages: allow without session
  if (
    pathname === "/enterprise/login" ||
    pathname === "/enterprise/register" ||
    pathname === "/admin/login"
  ) {
    return NextResponse.next();
  }

  // API routes under /api/ (except login) — let the route handler deal with auth
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Protected pages: admin and enterprise
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (pathname.startsWith("/enterprise")) {
      return NextResponse.redirect(new URL("/enterprise/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const session = await verifySessionToken(token);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/enterprise")) {
    const session = await verifySessionToken(token);
    if (!session || (session.role !== "ENTERPRISE" && session.role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/enterprise/login", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

/** Rate limiting — simple in-memory sliding window */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

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

export const config = {
  matcher: [
    // 只匹配页面路由和 login API，不匹配静态资源、其他 API
    "/admin/:path*",
    "/enterprise/:path*",
    "/api/auth/login",
  ],
};
