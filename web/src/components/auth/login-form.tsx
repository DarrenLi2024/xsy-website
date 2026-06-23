"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  redirectTo: string;
  title: string;
  subtitle?: string;
};

export function LoginForm({ redirectTo, title, subtitle }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, redirect: redirectTo }),
      });
      const data = (await res.json()) as { ok?: boolean; redirect?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "登录失败");
        return;
      }
      router.push(data.redirect ?? redirectTo);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle ? <p className="mt-2 text-sm text-slate-400">{subtitle}</p> : null}
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
        >
          {loading ? "登录中…" : "登录"}
        </button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">
        还没有企业账号？{" "}
        <a href="/enterprise/register" className="text-cyan-400 hover:underline">
          入驻申请
        </a>
        {" · "}
        演示账号见仓库 README / 种子脚本输出
      </p>
    </div>
  );
}
