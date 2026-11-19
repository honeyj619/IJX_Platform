import { ExternalLink, Check, X, Play, Pencil, ListTodo, ArrowRight } from "lucide-react";
import type { RuyiMessage, RuyiMessageActionType } from "../../types/ruyi";
import { getRuyiCapability } from "../../data/ruyiCapabilities";

/**
 * V3.5 业务动作区（与通用功能条分离）：
 * - 只渲染业务动作：open-workbench / open-result / open-route / confirm-task / modify-task / cancel-task /
 *   resume-task / retry / confirm-date / open-task-center / select-task / continue-in-zone
 * - 通用功能条（复制/反馈/重新生成）不再依赖 message.actions，由 RuyiMessageToolbar 常驻
 * - 动作契约：open-result 必须有 resultId；open-workbench 必须有带 workbenchPath 的 capability；
 *   open-route 必须有 payload.href——前置条件不满足时隐藏按钮（不渲染点击无反应的入口）
 * - feedback-useful / feedback-useless / copy / regenerate 从这里排除（归 Toolbar）
 */

const BUSINESS_ACTION_TYPES = new Set<RuyiMessageActionType>([
  'open-workbench', 'open-result', 'open-route', 'confirm-task', 'modify-task', 'cancel-task',
  'resume-task', 'retry', 'confirm-date', 'open-task-center', 'select-task', 'continue-in-zone',
]);

const actionIcons: Partial<Record<RuyiMessageActionType, React.ReactNode>> = {
  'open-result': <ExternalLink size={14} />,
  'open-workbench': <ExternalLink size={14} />,
  'open-route': <ArrowRight size={14} />,
  'continue-in-zone': <ArrowRight size={14} />,
  'confirm-task': <Check size={14} />,
  'modify-task': <Pencil size={14} />,
  'cancel-task': <X size={14} />,
  'resume-task': <Play size={14} />,
  'retry': <Play size={14} />,
  'open-task-center': <ListTodo size={14} />,
};

/** 契约校验：返回 false 时隐藏该按钮 */
function isActionValid(type: RuyiMessageActionType, message: RuyiMessage, href?: string): boolean {
  switch (type) {
    case 'open-result':
      return !!message.resultId;
    case 'open-workbench': {
      const capability = message.capabilityId ? getRuyiCapability(message.capabilityId) : null;
      return !!capability?.workbenchPath;
    }
    case 'open-route':
      return !!href && href.startsWith('/pc_client');
    default:
      return true;
  }
}

export interface RuyiMessageBusinessActionsProps {
  message: RuyiMessage;
  compact?: boolean;
  onAction: (type: RuyiMessageActionType, message: RuyiMessage, payload?: Record<string, unknown>) => void;
}

export default function RuyiMessageBusinessActions({ message, compact = false, onAction }: RuyiMessageBusinessActionsProps) {
  const businessActions = (message.actions ?? []).filter(
    (action) => BUSINESS_ACTION_TYPES.has(action.type) && isActionValid(action.type, message, action.payload?.href as string | undefined),
  );
  if (businessActions.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center ${compact ? 'gap-1.5' : 'gap-3'} ${compact ? 'mt-1.5' : 'mt-2'}`}>
      {businessActions.map((action, index) => (
        <button
          key={`${action.type}-${index}`}
          type="button"
          disabled={action.disabled}
          onClick={() => { if (!action.disabled) onAction(action.type, message, action.payload); }}
          className={
            compact
              ? `inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  action.disabled
                    ? 'cursor-not-allowed bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                    : 'bg-theme-50 text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300 dark:hover:bg-theme-900/40'
                }`
              : `inline-flex items-center gap-1 text-sm transition-colors ${action.disabled ? 'cursor-not-allowed text-gray-300 dark:text-gray-600' : 'text-theme-600 hover:text-theme-700 dark:text-theme-300 dark:hover:text-theme-200'}`
          }
        >
          {actionIcons[action.type]}
          {action.disabled && action.completedLabel ? action.completedLabel : action.label}
        </button>
      ))}
    </div>
  );
}
