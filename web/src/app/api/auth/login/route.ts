import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/lib/auth/session";

function isSafeRedirect(target: string): boolean {
  // 必须是相对路径（站内）
  if (!target.startsWith("/")) return false;
  // 不能是 "//evil.com" 协议相对路径
  if (target.startsWith("//")) return false;
  // 不能含有 proto://host
  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:\/\//.test(target)) return false;
  return true;
}

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  redirect: z.string().optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "校验失败" }, { status: 400 });
  }

  const { email, password, redirect } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
  }

  const target = redirect && isSafeRedirect(redirect) ? redirect : "/";
  if (target.startsWith("/admin") && user.role !== "ADMIN") {
    return NextResponse.json({ error: "无权进入运营后台" }, { status: 403 });
  }
  if (
    target.startsWith("/enterprise") &&
    user.role !== "ENTERPRISE" &&
    user.role !== "ADMIN"
  ) {
    return NextResponse.json({ error: "无权进入企业后台" }, { status: 403 });
  }

  const token = await signSessionToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    adminRole: user.role === "ADMIN" ? user.adminRole : null,
  });

  const res = NextResponse.json({
    ok: true,
    redirect: target,
  });

  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
