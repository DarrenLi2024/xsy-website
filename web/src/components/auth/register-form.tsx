"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const INDUSTRIES = [
  "IC设计",
  "制造与封测",
  "汽车电子",
  "AI算力芯片",
  "光通信",
  "EDA",
  "半导体设备",
  "医疗电子",
  "互连",
  "材料",
  "市场分析",
  "其他",
];

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const data = {
      companyName: (form.elements.namedItem("companyName") as HTMLInputElement).value.trim(),
      contactName: (form.elements.namedItem("contactName") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim(),
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
      industry: (form.elements.namedItem("industry") as HTMLSelectElement).value,
      city: (form.elements.namedItem("city") as HTMLInputElement).value.trim(),
      website: (form.elements.namedItem("website") as HTMLInputElement).value.trim(),
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value.trim(),
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await res.json()) as {
        ok?: boolean;
        redirect?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        setError(result.error ?? "注册失败");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push(result.redirect ?? "/enterprise/dashboard");
      }, 2000);
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-white">注册成功</h1>
        <p className="mt-4 text-sm text-slate-300">
          您的企业入驻申请已提交，请等待管理员审核。即将跳转到企业控制台...
        </p>
        <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full animate-progress rounded-full bg-cyan-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900/60 p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white">企业入驻</h1>
      <p className="mt-2 text-sm text-slate-400">
        提交企业信息，加入芯师爷半导体行业平台。
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="companyName"
              className="block text-sm font-medium text-slate-300"
            >
              企业名称 <span className="text-red-400">*</span>
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              required
              minLength={2}
              placeholder="如：华芯精密微电子"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="contactName"
              className="block text-sm font-medium text-slate-300"
            >
              联系人 <span className="text-red-400">*</span>
            </label>
            <input
              id="contactName"
              name="contactName"
              type="text"
              required
              minLength={2}
              placeholder="您的姓名"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              邮箱 <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="企业邮箱"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-300">
              手机号
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="您的手机号"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              登录密码 <span className="text-red-400">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="至少 8 个字符"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-slate-300">
              所属行业
            </label>
            <select
              id="industry"
              name="industry"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
            >
              <option value="">请选择</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-slate-300">
              所在城市
            </label>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="如：深圳"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-slate-300">
              企业官网
            </label>
            <input
              id="website"
              name="website"
              type="url"
              placeholder="https://"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">
            企业简介
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            placeholder="简要介绍您的企业（限 500 字）"
            className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none ring-cyan-500/40 focus:ring-2 resize-none"
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 transition-colors"
        >
          {loading ? "提交中..." : "提交入驻申请"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        已有企业账号？{" "}
        <Link href="/enterprise/login" className="text-cyan-400 hover:underline">
          立即登录
        </Link>
      </p>
    </div>
  );
}
