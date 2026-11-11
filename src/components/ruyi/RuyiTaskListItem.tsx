import { Link } from "react-router-dom";
import type { RuyiTaskMock, RuyiResultReference } from "../../types/ruyi";
import { RUYI_DEVICE_LABELS } from "../../types/ruyi";
import { getRuyiResultDisplayTitle } from "../../utils/ruyiResultPresentation";
import RuyiTaskStatusBadge from "./RuyiTaskStatusBadge";
import { ChevronRight } from "lucide-react";

interface RuyiTaskListItemProps {
  task: RuyiTaskMock;
  /** 任务关联成果（用于列表摘要） */
  results?: RuyiResultReference[];
  to: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return `今天 ${d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
  return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }) + ` ${d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
}

export default function RuyiTaskListItem({ task, results = [], to }: RuyiTaskListItemProps) {
  const linkedResults = (task.resultIds ?? []).map((id) => results.find((r) => r.id === id)).filter(Boolean) as RuyiResultReference[];
  return (
    <Link
      to={to}
      className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 transition-colors hover:bg-theme-50/50 dark:border-gray-700/60 dark:hover:bg-gray-700/30"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {task.title ?? "未命名任务"}
          </span>
          <RuyiTaskStatusBadge status={task.status} />
        </div>
        <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">{task.goal || "（无目标描述）"}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400 dark:text-gray-500">
          <span>来源：{task.source?.label ?? "如意空间对话"}</span>
          <span>更新：{formatTime(task.updatedAt)}</span>
          {task.lastOperatedDevice && <span>最后操作端：{RUYI_DEVICE_LABELS[task.lastOperatedDevice]}</span>}
          {linkedResults.length > 0 && (
            <span className="text-theme-600 dark:text-theme-300">
              成果：{linkedResults.map((r) => getRuyiResultDisplayTitle(r)).join("、")}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="mt-2 flex-shrink-0 text-gray-300 dark:text-gray-600" />
    </Link>
  );
}
