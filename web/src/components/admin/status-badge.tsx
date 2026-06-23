import { cn } from "@/lib/utils";

const VARIANT_MAP: Record<string, string> = {
  // ArticleStatus
  DRAFT: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  PENDING_REVIEW: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  APPROVED: "bg-green-500/10 text-green-400 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  PUBLISHED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ARCHIVED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  // CompanyStatus
  PENDING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SUSPENDED: "bg-red-500/10 text-red-400 border-red-500/20",
  // EventStatus
  UPCOMING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ONGOING: "bg-green-500/10 text-green-400 border-green-500/20",
  COMPLETED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  // JobStatus
  CLOSED: "bg-red-500/10 text-red-400 border-red-500/20",
  // ApplicationStatus
  REVIEWED: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  INTERVIEWING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ACCEPTED: "bg-green-500/10 text-green-400 border-green-500/20",
  // AdminRole
  SUPER_ADMIN: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  CONTENT_EDITOR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  BUSINESS_OPS: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  REVIEWER: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const LABEL_MAP: Record<string, string> = {
  DRAFT: "草稿",
  PENDING_REVIEW: "待审",
  APPROVED: "已通过",
  REJECTED: "已驳回",
  PUBLISHED: "已发布",
  ARCHIVED: "已归档",
  PENDING: "待处理",
  SUSPENDED: "已冻结",
  UPCOMING: "即将开始",
  ONGOING: "进行中",
  COMPLETED: "已结束",
  CANCELLED: "已取消",
  FULL_TIME: "全职",
  PART_TIME: "兼职",
  INTERNSHIP: "实习",
  CONTRACT: "合同",
  CLOSED: "已关闭",
  REVIEWED: "已查看",
  INTERVIEWING: "面试中",
  ACCEPTED: "已录用",
  SUPER_ADMIN: "超级管理员",
  CONTENT_EDITOR: "内容编辑",
  BUSINESS_OPS: "商务运营",
  REVIEWER: "审核员",
  EXHIBITION: "展会",
  CONFERENCE: "峰会",
  WEBINAR: "线上",
  SALON: "沙龙",
  WORKSHOP: "培训",
};

export default function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        VARIANT_MAP[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20",
        className,
      )}
    >
      {LABEL_MAP[status] || status}
    </span>
  );
}
