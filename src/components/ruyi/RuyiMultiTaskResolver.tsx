import type { RuyiTaskMock } from "../../types/ruyi";
import RuyiTaskStatusBadge from "./RuyiTaskStatusBadge";
import { ChevronRight } from "lucide-react";

interface RuyiMultiTaskResolverProps {
  tasks: RuyiTaskMock[];
  /** 选择后回调（由消息层追加"继续：任务名"用户消息并恢复所选任务） */
  onSelect: (taskId: string) => void;
  /** 已选择后禁用（操作置为已完成，避免重复选择） */
  disabled?: boolean;
  selectedTaskId?: string | null;
}

/**
 * 多任务歧义选择卡片：会话内"继续刚才的任务"存在多个候选时，
 * 列出名称/状态/更新时间/下一步，由用户明确选择，不自动恢复最近任务。
 */
export default function RuyiMultiTaskResolver({ tasks, onSelect, disabled = false, selectedTaskId }: RuyiMultiTaskResolverProps) {
  return (
    <div
      className="max-w-2xl rounded-xl border border-theme-100 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      data-requirement-id="ruyi-multi-task-resolution"
    >
      <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
        当前会话有 {tasks.length} 个可继续的任务，请选择要继续的哪一个：
      </p>
      <div className="space-y-2">
        {tasks.map((task) => {
          const chosen = selectedTaskId === task.id;
          const done = disabled || !!selectedTaskId;
          return (
            <button
              key={task.id}
              type="button"
              disabled={done}
              onClick={() => onSelect(task.id)}
              className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors ${
                chosen
                  ? "border-theme-300 bg-theme-50 dark:border-theme-800 dark:bg-theme-900/20"
                  : done
                    ? "cursor-default border-gray-100 opacity-60 dark:border-gray-700"
                    : "border-gray-100 hover:border-theme-200 hover:bg-theme-50/50 dark:border-gray-700 dark:hover:bg-gray-700/40"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{task.title ?? "未命名任务"}</span>
                  <RuyiTaskStatusBadge status={task.status} />
                  {chosen && <span className="text-[11px] font-medium text-theme-600 dark:text-theme-300">已选择</span>}
                </div>
                <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                  更新于 {new Date(task.updatedAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {task.nextAction ? ` · 下一步：${task.nextAction}` : ""}
                </p>
              </div>
              {!done && <ChevronRight size={15} className="flex-shrink-0 text-gray-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
