import type { RuyiMessage, RuyiMessageActionType } from "../../types/ruyi";
import { useRuyiStore } from "../../store/ruyiStore";
import { getRuyiResultDisplayTitle, canOpenRuyiResult } from "../../utils/ruyiResultPresentation";
import { Loader2, ExternalLink, Check, X, Play, Pencil, Copy } from "lucide-react";

interface RuyiImMessageListProps {
  messages: RuyiMessage[];
  onAction: (type: RuyiMessageActionType, message: RuyiMessage) => void;
}

const actionIcons: Partial<Record<RuyiMessageActionType, React.ReactNode>> = {
  copy: <Copy size={12} />,
  "open-result": <ExternalLink size={12} />,
  "open-workbench": <ExternalLink size={12} />,
  "confirm-task": <Check size={12} />,
  "modify-task": <Pencil size={12} />,
  "cancel-task": <X size={12} />,
  "resume-task": <Play size={12} />,
};

export default function RuyiImMessageList({ messages, onAction }: RuyiImMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center text-sm text-gray-400">
        在下方输入框中向如意助手提问
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-3 overflow-y-auto px-4 py-4">
      {messages.map((message) => (
        <RuyiImMessageBubble key={message.id} message={message} onAction={onAction} />
      ))}
    </div>
  );
}

function RuyiImMessageBubble({
  message,
  onAction,
}: {
  message: RuyiMessage;
  onAction: (type: RuyiMessageActionType, message: RuyiMessage) => void;
}) {
  const result = message.resultId ? useRuyiStore.getState().getResultById(message.resultId) : null;

  const renderActions = () => {
    if (!message.actions || message.actions.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-theme-700 dark:text-theme-300">
        {message.actions.map((action, index) => (
          <button
            key={`${action.type}-${index}`}
            type="button"
            onClick={() => onAction(action.type, message)}
            className="inline-flex items-center gap-1 rounded-md bg-theme-50 px-2 py-1 transition-colors hover:bg-theme-100 dark:bg-theme-900/20 dark:hover:bg-theme-900/40"
          >
            {actionIcons[action.type]}
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  if (message.sender === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-theme-50 px-4 py-2.5 text-sm text-gray-900 dark:bg-theme-900/20 dark:text-white">
          <div className="whitespace-pre-line">{message.content}</div>
        </div>
      </div>
    );
  }

  if (message.kind === "loading") {
    return (
      <div className="flex justify-start">
        <div className="flex max-w-[80%] items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
          <Loader2 size={14} className="animate-spin text-theme-600" />
          {message.content}
        </div>
      </div>
    );
  }

  if (message.kind === "capability-status") {
    return (
      <div className="flex justify-center">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {message.content}
        </span>
      </div>
    );
  }

  if (message.kind === "error") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[80%] rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-200">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.kind === "result" && result) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] rounded-2xl bg-white p-3 text-sm shadow-sm dark:bg-gray-800">
          <div className="mb-2 text-gray-700 dark:text-gray-200">{message.content}</div>
          <div className="rounded-lg border border-theme-100 bg-theme-50 p-3 dark:border-theme-900/30 dark:bg-theme-900/20">
            <div className="text-xs font-semibold text-theme-700 dark:text-theme-300">{getRuyiResultDisplayTitle(result)}</div>
            {canOpenRuyiResult(result) ? (
              <button
                type="button"
                onClick={() => onAction("open-result", message)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-theme-600 hover:underline dark:text-theme-300"
              >
                <ExternalLink size={12} />
                打开成果
              </button>
            ) : (
              <span className="mt-1 inline-flex cursor-not-allowed items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                {result.status === "invalid" ? "成果已失效" : "无权限查看"}
              </span>
            )}
          </div>
          {renderActions()}
        </div>
      </div>
    );
  }

  if (message.kind === "confirmation") {
    // F1：动作驱动——按 message.actions 渲染（缺 actions 时用 V1 fallback）
    const confirmActions = message.actions?.length
      ? message.actions
      : [
          { type: "confirm-task" as const, label: "确认" },
          { type: "modify-task" as const, label: "修改" },
          { type: "cancel-task" as const, label: "取消" },
        ];
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] rounded-2xl bg-white p-4 text-sm shadow-sm dark:bg-gray-800">
          <div className="mb-3 whitespace-pre-line text-gray-800 dark:text-gray-100">{message.content}</div>
          <div className="flex flex-wrap gap-2">
            {confirmActions.map((action, index) => (
              <button
                key={`${action.type}-${index}`}
                type="button"
                onClick={() => onAction(action.type, message)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  action.type === "confirm-task" || action.type === "confirm-date"
                    ? "bg-theme-600 text-white hover:bg-theme-700"
                    : action.type === "cancel-task"
                      ? "border border-gray-200 bg-white text-gray-700 hover:bg-red-50 hover:text-red-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (message.kind === "resume-task") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm dark:border-amber-900/30 dark:bg-amber-900/20">
          <div className="mb-2 text-amber-900 dark:text-amber-100">{message.content}</div>
          <button
            type="button"
            onClick={() => onAction("resume-task", message)}
            className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            继续
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-100">
        <div className="whitespace-pre-line">{message.content}</div>
        {message.sourceLabel && message.sourceHref && (
          <div className="mt-1 text-xs text-gray-400">
            来源：
            <span className="text-theme-600 dark:text-theme-300">{message.sourceLabel}</span>
          </div>
        )}
        {renderActions()}
      </div>
    </div>
  );
}
