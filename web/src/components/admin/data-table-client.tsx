"use client";

import { cn } from "@/lib/utils";

export type SortableThProps = {
  label: string;
  sortable?: boolean;
  className?: string;
  sortKey: string;
  currentSortKey?: string;
  currentSortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
};

export function SortableTh({
  label,
  sortable,
  className,
  sortKey,
  currentSortKey,
  currentSortOrder,
  onSort,
}: SortableThProps) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500",
        sortable && "cursor-pointer hover:text-slate-300",
        className,
      )}
      onClick={() => sortable && onSort?.(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortable && currentSortKey === sortKey && (
          <span className="text-xs">
            {currentSortOrder === "asc" ? "\u2191" : "\u2193"}
          </span>
        )}
      </span>
    </th>
  );
}

export function ActionButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant?: "default" | "danger";
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
        variant === "danger"
          ? "text-red-400 hover:bg-red-500/10"
          : "text-cyan-400 hover:bg-cyan-500/10",
      )}
    >
      {label}
    </button>
  );
}
