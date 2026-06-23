"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <div className="mx-auto max-w-md">
            <h1 className="text-2xl font-bold text-slate-900">系统异常</h1>
            <p className="mt-3 text-base text-slate-500">
              抱歉，系统遇到了未预期的错误，请稍后重试。
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={reset}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
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
      </body>
    </html>
  );
}
