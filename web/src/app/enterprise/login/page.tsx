import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "企业登录",
};

export default function EnterpriseLoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="border-b border-white/10 px-6 py-4">
        <Link href="/" className="text-lg font-bold text-white">
          芯师爷
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <LoginForm
          redirectTo="/enterprise/dashboard"
          title="企业登录"
          subtitle="管理企业主页、内容与投放数据。"
        />
      </div>
    </div>
  );
}
