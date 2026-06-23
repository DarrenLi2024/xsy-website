"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="text-sm text-slate-400 transition hover:text-white"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
      }}
    >
      退出登录
    </button>
  );
}
