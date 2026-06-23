import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SideNav from "@/components/enterprise/side-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { ToastProvider } from "@/components/admin/toast";

export default async function EnterpriseShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) redirect("/enterprise/login");

  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ENTERPRISE" && session.role !== "ADMIN")) {
    redirect("/enterprise/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user) redirect("/enterprise/login");

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-950">
        <SideNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-end gap-4 border-b border-white/10 px-4 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                <p className="text-xs text-slate-500">企业用户</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600/20 text-sm font-semibold text-cyan-400">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <LogoutButton />
            </div>
          </header>
          <div className="flex-1 p-4 md:p-8">
            <Suspense fallback={<div className="text-center text-slate-500 py-12">加载中...</div>}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
