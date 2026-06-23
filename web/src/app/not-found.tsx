import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fbfbfd] px-5">
      <p className="text-[4.5rem] font-semibold leading-none tracking-tight text-[#d2d2d7]">404</p>
      <h1 className="mt-6 text-[1.25rem] font-semibold text-[#1d1d1f]">页面未找到</h1>
      <p className="mt-2 max-w-sm text-center text-[15px] text-[#6e6e73]">
        链接可能已失效，或页面已被移动。
      </p>
      <Link
        href="/"
        className="mt-10 text-[15px] font-semibold text-[var(--accent)] transition hover:opacity-75"
      >
        返回首页
      </Link>
    </div>
  );
}
