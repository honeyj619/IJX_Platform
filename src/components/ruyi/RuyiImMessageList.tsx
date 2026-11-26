import type { RuyiMessage, RuyiMessageActionType } from "../../types/ruyi";
import { useRuyiStore } from "../../store/ruyiStore";
import { getRuyiResultDisplayTitle, canOpenRuyiResult } from "../../utils/ruyiResultPresentation";
import { Loader2, ExternalLink, Check, X, Play, Pencil, Copy, ArrowRight, Eye } from "lucide-react";
import RuyiCapabilitySummary from "./capability/RuyiCapabilitySummary";
import BusinessMessageCard from '../messages/BusinessMessageCard';
import RuyiMessageToolbar from './RuyiMessageToolbar';
import RuyiMessageBusinessActions from './RuyiMessageBusinessActions';

/** V3.3：日期分组标签——今天 / 昨天 / YYYY年M月D日 */
function formatDayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(d, now)) return '今天';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(d, yesterday)) return '昨天';
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** V3.3：消息时间 HH:mm */
function formatTimeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 分组结果：按自然日切分（保持原顺序） */
function groupByDay(messages: RuyiMessage[]): Array<{ label: string; messages: RuyiMessage[] }> {
  const groups: Array<{ label: string; messages: RuyiMessage[] }> = [];
  for (const message of messages) {
    const label = formatDayLabel(message.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.messages.push(message);
    else groups.push({ label, messages: [message] });
  }
  return groups;
}

interface RuyiImMessageListProps {
  messages: RuyiMessage[];
  onAction: (type: RuyiMessageActionType, message: RuyiMessage, payload?: Record<string, unknown>) => void;
}

const actionIcons: Partial<Record<RuyiMessageActionType, React.ReactNode>> = {
  copy: <Copy size={12} />,
  "open-result": <ExternalLink size={12} />,
  "open-workbench": <ExternalLink size={12} />,
  "continue-in-zone": <ArrowRight size={12} />,
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
    <div
      className="flex flex-1 flex-col space-y-3 overflow-y-auto px-4 py-4"
      data-requirement-id="ruyi-im-capability-showcase"
    >
      {groupByDay(messages).map((group) => (
        <div key={group.label} className="space-y-3">
          {/* 日期分隔条 */}
          <div className="flex justify-center py-1">
            <span className="rounded-full bg-gray-100 px-3 py-0.5 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {group.label}
            </span>
          </div>
          {group.messages.map((message) => (
            <RuyiImMessageBubble key={message.id} message={message} onAction={onAction} />
          ))}
        </div>
      ))}
    </div>
  );
}

function RuyiImMessageBubble({
  message,
  onAction,
}: {
  message: RuyiMessage;
  onAction: (type: RuyiMessageActionType, message: RuyiMessage, payload?: Record<string, unknown>) => void;
}) {
  const result = message.resultId ? useRuyiStore.getState().getResultById(message.resultId) : null;

  // V3.5：业务动作（契约校验）+ 通用功能条（compact，常驻完成态回复）
  const renderActions = () => {
    return (
      <>
        <RuyiMessageBusinessActions
          message={message}
          compact
          onAction={(type, msg, payload) => onAction(type, msg, payload as Record<string, unknown> | undefined)}
        />
        <RuyiMessageToolbar
          message={message}
          compact
          onAction={(type, msg, payload) => onAction(type, msg, payload as Record<string, unknown> | undefined)}
        />
      </>
    );
  };

  if (message.sender === "user") {
    return (
      <div className="flex flex-col items-end">
        <div className="max-w-[80%] rounded-2xl bg-theme-50 px-4 py-2.5 text-sm text-gray-900 dark:bg-theme-900/20 dark:text-white">
          <div className="whitespace-pre-line">{message.content}</div>
          {/* V3：能力提交消息附带参数摘要 */}
          {message.capabilitySubmission && <RuyiCapabilitySummary submission={message.capabilitySubmission} />}
        </div>
        <span className="mt-0.5 mr-1 text-[10px] text-gray-400 dark:text-gray-500">{formatTimeLabel(message.createdAt)}</span>
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
                onClick={() => onAction("preview-result", message)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-theme-600 hover:underline dark:text-theme-300"
              >
                <Eye size={12} />
                预览成果
              </button>
            ) : (
              <span className="mt-1 inline-flex cursor-not-allowed items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                该成果已被删除
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
                disabled={action.disabled}
                onClick={() => { if (!action.disabled) onAction(action.type, message); }}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                  action.disabled
                    ? 'cursor-not-allowed border border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'
                    : action.type === "confirm-task" || action.type === "confirm-date"
                    ? "bg-theme-600 text-white hover:bg-theme-700"
                    : action.type === "cancel-task"
                      ? "border border-gray-200 bg-white text-gray-700 hover:bg-red-50 hover:text-red-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                }`}
              >
                {action.disabled && action.completedLabel ? action.completedLabel : action.label}
              </button>
            ))}
          </div>
          <RuyiMessageToolbar message={message} compact onAction={(type, msg, payload) => onAction(type, msg, payload as Record<string, unknown> | undefined)} />
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
        <RuyiMessageToolbar message={message} compact onAction={(type, msg, payload) => onAction(type, msg, payload as Record<string, unknown> | undefined)} />
      </div>
    );
  }

  // V3.4：业务操作卡片（IM 紧凑布局；与如意空间同一组件）
  if (message.businessCard) {
    return (
      <div className="flex justify-start">
        <div className="w-full max-w-2xl">
          <div className="mb-2 whitespace-pre-line text-sm leading-6 text-gray-700 dark:text-gray-200">{message.content}</div>
          <BusinessMessageCard card={message.businessCard} compact />
          {renderActions()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start">
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
      <span className="mt-0.5 ml-1 text-[10px] text-gray-400 dark:text-gray-500">{formatTimeLabel(message.createdAt)}</span>
    </div>
  );
}
