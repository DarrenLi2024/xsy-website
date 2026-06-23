"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function MarketingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Marketing page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          出错了
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
          页面加载异常
        </h1>
        <p className="mt-3 text-base text-slate-500">
          抱歉，页面在加载过程中遇到了问题。请稍后重试。
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            重新加载
          </button>
          <Link
            href="/"
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
