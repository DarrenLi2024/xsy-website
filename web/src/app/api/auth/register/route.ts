import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/lib/auth/session";
import type { UserRole } from "@prisma/client";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const registerSchema = z.object({
  companyName: z.string().min(2, "企业名称至少 2 个字符"),
  contactName: z.string().min(2, "联系人姓名至少 2 个字符"),
  email: z.string().email("邮箱格式不正确"),
  phone: z.string().optional(),
  password: z.string().min(8, "密码至少 8 个字符"),
  industry: z.string().optional(),
  city: z.string().optional(),
  website: z.string().optional(),
  description: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "无效的 JSON 数据" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "校验失败";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { companyName, contactName, email, phone, password, industry, city, website, description } =
    parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "该邮箱已被注册" }, { status: 409 });
  }

  const nameConflict = await prisma.company.findFirst({
    where: { name: companyName, deletedAt: null },
  });
  if (nameConflict) {
    return NextResponse.json({ error: "该企业名称已被使用" }, { status: 409 });
  }

  let slug = slugify(companyName);
  const slugConflict = await prisma.company.findUnique({ where: { slug } });
  if (slugConflict) {
    slug = `${slug}-${Date.now()}`;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: contactName,
      role: "ENTERPRISE" as UserRole,
      company: {
        create: {
          name: companyName,
          slug,
          website: website || null,
          industry: industry || null,
          city: city || null,
          description: description || null,
          status: "PENDING",
        },
      },
    },
    include: { company: true },
  });

  // Company contact phone stored as socialLinks for now (we don't have a phone field on Company)
  if (phone && user.company) {
    await prisma.company.update({
      where: { id: user.company.id },
      data: {
        socialLinks: {
          phone,
        },
      } as Parameters<typeof prisma.company.update>[0]["data"],
    });
  }

  const token = await signSessionToken({
    sub: user.id,
    role: user.role,
    email: user.email,
    adminRole: null,
    companyId: user.companyId,
  });

  const res = NextResponse.json({
    ok: true,
    message: "注册成功！请等待管理员审核您的企业入驻申请。",
    redirect: "/enterprise/dashboard",
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
