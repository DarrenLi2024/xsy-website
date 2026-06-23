"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function SearchInput({
  placeholder = "搜索...",
  paramKey = "q",
  debounceMs = 400,
}: {
  placeholder?: string;
  paramKey?: string;
  debounceMs?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  void debounceMs;

  const handleChange = useCallback(
    (value: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set(paramKey, value);
        } else {
          params.delete(paramKey);
        }
        params.set("page", "1");
        router.push(`?${params.toString()}`);
      });
    },
    [router, searchParams, paramKey],
  );

  return (
    <input
      type="search"
      defaultValue={searchParams.get(paramKey) || ""}
      onChange={(e) => handleChange(e.target.value)}
      placeholder={placeholder}
      className="w-full max-w-xs rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-cyan-500/50 focus:bg-white/10"
    />
  );
}
