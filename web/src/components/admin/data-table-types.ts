import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
};

export type SortConfig = {
  key: string;
  order: "asc" | "desc";
};

export type Action = {
  label: string;
  href?: string;
  variant?: "default" | "danger";
};
