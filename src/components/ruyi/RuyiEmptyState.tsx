import { Link } from "react-router-dom";
import { MessageSquarePlus, Inbox, AlertCircle } from "lucide-react";

interface RuyiEmptyStateProps {
  variant?: "not-found" | "empty-history" | "no-messages";
  onAction?: () => void;
}

export default function RuyiEmptyState({ variant = "no-messages", onAction }: RuyiEmptyStateProps) {
  if (variant === "not-found") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <AlertCircle className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">会话不存在</h3>
        <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          该会话可能已被删除或链接已失效。
        </p>
        <Link
          to="/pc_client/ruyi-zone"
          className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-theme-700"
        >
          返回主页
        </Link>
      </div>
    );
  }

  if (variant === "empty-history") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <Inbox className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">暂无历史会话</h3>
        <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">
          点击下方的按钮开始与如意助手对话。
        </p>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-theme-700"
          >
            <MessageSquarePlus size={16} />
            新对话
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-theme-50 dark:bg-theme-900/20">
        <MessageSquarePlus className="h-8 w-8 text-theme-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">开始对话</h3>
      <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
        在下方输入框中描述您的问题，如意助手会即时响应。
      </p>
    </div>
  );
}
