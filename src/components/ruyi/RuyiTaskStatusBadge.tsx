import type { RuyiTaskStatus } from "../../types/ruyi";

const statusConfig: Record<RuyiTaskStatus, { label: string; className: string }> = {
  collecting: { label: "待补参", className: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300" },
  interrupted: { label: "已中断", className: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300" },
  "awaiting-confirmation": { label: "待确认", className: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300" },
  executing: { label: "执行中", className: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300" },
  completed: { label: "已完成", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300" },
  failed: { label: "失败", className: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300" },
  cancelled: { label: "已取消", className: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400" },
};

export default function RuyiTaskStatusBadge({ status }: { status: RuyiTaskStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
