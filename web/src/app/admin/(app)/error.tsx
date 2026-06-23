"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          系统异常
        </p>
        <h1 className="mt-3 text-2xl font-bold text-white">
          页面加载出错
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          操作未能完成，请检查网络连接后重试。
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-slate-600">
            Error ID: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
          >
            重新加载
          </button>
          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            返回控制台
          </Link>
        </div>
      </div>
    </div>
  );
}
