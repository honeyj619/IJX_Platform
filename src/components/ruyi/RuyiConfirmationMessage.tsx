import type { RuyiMessage, RuyiMessageAction } from "../../types/ruyi";
import { Check, CalendarCheck, Pencil, X } from "lucide-react";

interface RuyiConfirmationMessageProps {
  message: RuyiMessage;
  /** 动作驱动：回传完整 action（type + payload），由上层统一分发 */
  onAction: (action: RuyiMessageAction) => void;
}

/** 主/次/危险按钮样式（按 action type 映射） */
const actionStyles: Record<string, string> = {
  primary: "inline-flex items-center gap-1.5 rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-theme-700",
  secondary: "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
  danger: "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-red-50 hover:text-red-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
};

function getActionStyle(type: RuyiMessageAction["type"]): string {
  if (type === "confirm-task" || type === "confirm-date") return actionStyles.primary;
  if (type === "cancel-task") return actionStyles.danger;
  return actionStyles.secondary;
}

function getActionIcon(type: RuyiMessageAction["type"]): React.ReactNode {
  if (type === "confirm-date") return <CalendarCheck size={14} />;
  if (type === "confirm-task") return <Check size={14} />;
  if (type === "modify-task") return <Pencil size={14} />;
  if (type === "cancel-task") return <X size={14} />;
  return <Check size={14} />;
}

export default function RuyiConfirmationMessage({ message, onAction }: RuyiConfirmationMessageProps) {
  // 动作驱动：按 message.actions 顺序渲染；仅旧数据缺 actions 时用 V1 会议确认 fallback
  const actions: RuyiMessageAction[] = message.actions?.length
    ? message.actions
    : [
        { type: "confirm-task", label: "确认创建" },
        { type: "modify-task", label: "修改" },
        { type: "cancel-task", label: "取消" },
      ];

  return (
    <div className="space-y-4">
      <div className="whitespace-pre-line leading-7 text-gray-900 dark:text-gray-100">{message.content}</div>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <button
            key={`${action.type}-${index}`}
            type="button"
            onClick={() => onAction(action)}
            className={getActionStyle(action.type)}
          >
            {getActionIcon(action.type)}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
