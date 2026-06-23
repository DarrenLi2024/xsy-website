import Link from "next/link";

export const dynamic = "force-dynamic";

export default function EnterpriseSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">账号设置</h1>
      <p className="mt-2 text-sm text-slate-400">管理您的账号信息。</p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold text-white">账号信息</h2>
        <p className="mt-1 text-sm text-slate-500">
          如需修改密码或邮箱，请联系运营团队。
        </p>
      </div>

      <div className="mt-4">
        <Link
          href="/enterprise/profile"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors"
        >
          前往编辑企业资料
        </Link>
      </div>
    </div>
  );
}
