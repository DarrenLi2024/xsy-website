"use client";

import {
  type ElementType,
  type ComponentPropsWithoutRef,
  useEffect,
  useRef,
  useCallback,
} from "react";

/* -------------------------------------------------------------------------- */
/*  AWS 风格卡片 — 周缘辉光样式见 @/styles/aws-card-glow.css（可单独复用）        */
/*                                                                             */
/*  glowPreset "light" | "dark" → .aws-card--light / .aws-card--dark          */
/* -------------------------------------------------------------------------- */

type PolymorphicProps<E extends ElementType> = {
  as?: E;
} & ComponentPropsWithoutRef<E>;

/**
 * CardRoot — AWS 风格卡片包装
 *
 * variant:
 *   "default" — lift + 周缘 conic 光晕 + 彩色 shadow
 *   "glow"    — 同上，内层叠 CardGlow / CardShine 时启用 z 分层
 *   "none"    — 无 lift / 无辉光
 *
 * glowPreset（非 none 时）:
 *   "light" — 浅色页上的内容卡（品红→粉→橙红）
 *   "dark"  — 深色底大图卡（紫→青→浅青→青绿→靛）
 *
 * 辉光与 hover 阴影见 src/styles/aws-card-glow.css（由 globals.css 引入）。
 */
function CardRoot<E extends ElementType = "div">({
  as,
  className = "",
  children,
  variant = "default",
  glowPreset = "light",
  ...props
}: PolymorphicProps<E> & {
  variant?: "default" | "glow" | "none";
  glowPreset?: "light" | "dark";
}) {
  const Tag = as ?? "div";
  const isGlow = variant === "glow";
  const isNone = variant === "none";

  if (isNone) {
    return (
      <Tag
        className={[
          "relative flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </Tag>
    );
  }

  return (
    <div
      className={[
        "aws-card group w-full",
        glowPreset === "dark" ? "aws-card--dark" : "aws-card--light",
      ].join(" ")}
    >
      <span className="aws-card__halo" aria-hidden />
      <Tag
        className={[
          "aws-card__surface",
          isGlow ? "aws-card__surface--glow-stack" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {children}
      </Tag>
    </div>
  );
}

/* ---- 子组件 ---- */

function CardImage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "relative overflow-hidden",
        "[&_img]:transition [&_img]:duration-500 [&_img]:ease-out",
        "group-hover:[&_img]:scale-[1.04]",
        "motion-reduce:group-hover:[&_img]:scale-100",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CardTag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={[
        "w-fit rounded-full border border-black/[0.06] bg-[#f5f5f7]",
        "px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        "text-[#424245] transition-colors duration-300",
        "group-hover:border-[var(--accent)]/20 group-hover:bg-[var(--accent)]/8 group-hover:text-[var(--accent)]",
        "motion-reduce:group-hover:border-black/[0.06] motion-reduce:group-hover:bg-[#f5f5f7] motion-reduce:group-hover:text-[#424245]",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function CardIcon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl",
        "border border-black/[0.06] bg-[#f5f5f7] transition-all duration-300",
        "group-hover:border-[var(--accent)]/20 group-hover:bg-[var(--accent)]/8",
        "motion-reduce:group-hover:border-black/[0.06] motion-reduce:group-hover:bg-[#f5f5f7]",
        "[&_svg]:transition-all [&_svg]:duration-300",
        "group-hover:[&_svg]:text-[var(--accent)]",
        "motion-reduce:group-hover:[&_svg]:text-current",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={["flex flex-1 flex-col p-5 md:p-6", className].join(" ")}>
      {children}
    </div>
  );
}

function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={[
        "text-[17px] font-semibold leading-snug tracking-tight text-[#1d1d1f] transition-colors duration-300",
        "group-hover:text-[var(--accent)] motion-reduce:group-hover:text-[#1d1d1f]",
        className,
      ].join(" ")}
    >
      {children}
    </h3>
  );
}

function CardCta({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={[
        "mt-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)]",
        "transition-all duration-300",
        "group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0",
        className,
      ].join(" ")}
    >
      {children}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  鼠标追踪白色光晕 — glow variant 专用                                        */
/*                                                                             */
/*  白色极淡 radial-gradient，圆心跟随鼠标位置，叠在周缘 conic 光晕之上          */
/* -------------------------------------------------------------------------- */

function CardGlow({
  color = "rgba(255, 255, 255, 0.08)",
  className = "",
}: {
  color?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mouse-x", x + "%");
    el.style.setProperty("--mouse-y", y + "%");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.closest(".group") as HTMLElement | null;
    if (!parent) return;
    parent.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => parent.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <span
      ref={ref}
      data-card-effect="true"
      aria-hidden
      className={[
        "absolute inset-0 z-[1] pointer-events-none",
        "rounded-[inherit]",
        "opacity-0 transition-opacity duration-500 ease-out",
        "group-hover:opacity-100",
        "motion-reduce:opacity-0 motion-reduce:transition-none",
        className,
      ].join(" ")}
      style={{
        background:
          "radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), " +
          color +
          " 0%, transparent 50%)",
      } as React.CSSProperties}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  白色扫光 shimmer                                                           */
/*                                                                             */
/*  120deg 白色斜光，hover 时从左上扫到右下，一次性动画                          */
/* -------------------------------------------------------------------------- */

function CardShine({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      data-card-effect="true"
      aria-hidden
      className={[
        "absolute inset-0 z-[2] pointer-events-none",
        "rounded-[inherit] overflow-hidden",
        // ::after 白色扫光
        "after:absolute after:inset-0",
        "after:bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.20)_40%,rgba(255,255,255,0.30)_45%,rgba(255,255,255,0.20)_50%,transparent_70%)]",
        "after:bg-[length:200%_100%] after:bg-[position:-200%_0]",
        "after:opacity-0",
        "after:transition-all after:duration-[600ms] after:ease-out",
        "group-hover:after:opacity-100",
        "group-hover:after:bg-[position:200%_0]",
        "motion-reduce:after:opacity-0 motion-reduce:after:bg-[position:-200%_0] motion-reduce:after:transition-none",
        className,
      ].join(" ")}
    />
  );
}

export {
  CardRoot,
  CardImage,
  CardTag,
  CardIcon,
  CardBody,
  CardTitle,
  CardCta,
  CardGlow,
  CardShine,
};
