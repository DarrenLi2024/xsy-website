"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import StatusBadge from "./status-badge";
import type { Column, SortConfig, Action } from "./data-table-types";
import { SortableTh, ActionButton } from "./data-table-client";

export type { Column, SortConfig, Action };

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  sortConfig,
  onSort,
  actions,
  emptyMessage = "暂无数据",
}: {
  columns: Column<T>[];
  data: T[];
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  basePath?: string;
  actions?: Action[];
  emptyMessage?: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            {columns.map((col) => (
              <SortableTh
                key={col.key}
                label={col.label}
                sortable={col.sortable}
                className={col.className}
                sortKey={col.key}
                currentSortKey={sortConfig?.key}
                currentSortOrder={sortConfig?.order}
                onSort={onSort}
              />
            ))}
            {actions && actions.length > 0 && (
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item) => (
            <tr
              key={item.id}
              className="transition-colors hover:bg-white/[0.02]"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn("px-4 py-3 text-sm text-slate-300", col.className)}
                >
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {actions.map((action, i) =>
                      action.href ? (
                        <Link
                          key={i}
                          href={action.href}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                            action.variant === "danger"
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-cyan-400 hover:bg-cyan-500/10",
                          )}
                        >
                          {action.label}
                        </Link>
                      ) : (
                        <ActionButton
                          key={i}
                          label={action.label}
                          variant={action.variant}
                        />
                      ),
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { StatusBadge };
