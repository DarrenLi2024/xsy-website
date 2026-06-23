import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "企业入驻",
};

export default function EnterpriseRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="border-b border-white/10 px-6 py-4">
        <Link href="/" className="text-lg font-bold text-white">
          芯师爷
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <RegisterForm />
      </div>
    </div>
  );
}
