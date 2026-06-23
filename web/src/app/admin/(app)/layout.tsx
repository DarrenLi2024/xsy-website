import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import SideNav from "@/components/admin/side-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { ToastProvider } from "@/components/admin/toast";

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-950">
        <SideNav adminRole={user.adminRole} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-end gap-4 border-b border-white/10 px-4 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                <p className="text-xs text-slate-500">{user.adminRole === "SUPER_ADMIN" ? "超级管理员" : user.adminRole === "CONTENT_EDITOR" ? "内容编辑" : user.adminRole === "BUSINESS_OPS" ? "商务运营" : user.adminRole === "REVIEWER" ? "审核员" : "管理员"}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600/20 text-sm font-semibold text-cyan-400">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
              <LogoutButton />
            </div>
          </header>
          <div className="flex-1 p-4 md:p-8">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
