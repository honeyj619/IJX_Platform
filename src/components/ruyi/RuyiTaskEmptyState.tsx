import { Link } from "react-router-dom";
import { ListTodo, RefreshCw } from "lucide-react";

interface RuyiTaskEmptyStateProps {
  variant: "empty" | "filtered" | "error";
  /** error/filtered 时重试或清除 */
  onAction?: () => void;
  /** demo 场景 id（刷新原型数据入口仅 demo 可见） */
  demoId?: string | null;
  onReloadFixture?: () => void;
}

export default function RuyiTaskEmptyState({ variant, onAction, demoId, onReloadFixture }: RuyiTaskEmptyStateProps) {
  if (variant === "error") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
          <RefreshCw className="h-7 w-7 text-red-500" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">模拟数据加载失败</h3>
        <p className="mb-5 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          原型演示数据暂时不可用，可重新加载模拟数据。
        </p>
        <button
          type="button"
          onClick={onAction}
          className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-theme-700"
        >
          重新加载模拟数据
        </button>
      </div>
    );
  }

  if (variant === "filtered") {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <ListTodo className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-white">当前筛选无匹配任务</h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">换个状态页签或清除筛选条件再试。</p>
        <button
          type="button"
          onClick={onAction}
          className="text-sm font-medium text-theme-600 hover:underline dark:text-theme-300"
        >
          清除筛选
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-theme-50 dark:bg-theme-900/20">
        <ListTodo className="h-7 w-7 text-theme-500" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">暂无 AI 任务</h3>
      <p className="mb-5 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        如意助手协助处理的任务会汇总在这里，从一段对话开始吧。
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/pc_client/ruyi-zone"
          className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-theme-700"
        >
          发起新对话
        </Link>
        {demoId && onReloadFixture && (
          <button
            type="button"
            onClick={onReloadFixture}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-theme-300 hover:text-theme-600 dark:border-gray-600 dark:text-gray-300"
          >
            刷新原型数据
          </button>
        )}
      </div>
    </div>
  );
}
