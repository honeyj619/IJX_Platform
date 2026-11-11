import { useState } from "react";
import { RUYI_ASSISTANT_AVATAR } from '../../data/people';
import type { RuyiMessage, RuyiMessageActionType } from "../../types/ruyi";
import { useRuyiStore } from "../../store/ruyiStore";
import { Loader2, Copy, RotateCcw, ThumbsUp, ThumbsDown, ExternalLink, Check, X, Play, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import RuyiResultCard from "./RuyiResultCard";
import RuyiConfirmationMessage from "./RuyiConfirmationMessage";
import RuyiTaskResumeMessage from "./RuyiTaskResumeMessage";
import RuyiMultiTaskResolver from "./RuyiMultiTaskResolver";

/** V2：action payload 透传类型（兼容 reason/taskId 及 confirm-date 的 resolvedDate/dateText） */
export type RuyiActionPayload = Record<string, unknown> & {
  reason?: '答非所问' | '信息不准确' | '操作失败' | '其他原因';
  taskId?: string;
};

interface RuyiMessageRendererProps {
  message: RuyiMessage;
  onAction: (type: RuyiMessageActionType, message: RuyiMessage, payload?: RuyiActionPayload) => void;
}

const actionIcons: Partial<Record<RuyiMessageActionType, React.ReactNode>> = {
  copy: <Copy size={14} />,
  regenerate: <RotateCcw size={14} />,
  "feedback-useful": <ThumbsUp size={14} />,
  "feedback-useless": <ThumbsDown size={14} />,
  "open-result": <ExternalLink size={14} />,
  "open-workbench": <ExternalLink size={14} />,
  "confirm-task": <Check size={14} />,
  "modify-task": <Pencil size={14} />,
  "cancel-task": <X size={14} />,
  "resume-task": <Play size={14} />,
};

const uselessReasons = ['答非所问', '信息不准确', '操作失败', '其他原因'] as const;

export default function RuyiMessageRenderer({ message, onAction }: RuyiMessageRendererProps) {
  const result = message.resultId ? useRuyiStore.getState().getResultById(message.resultId) : null;
  const [showReasons, setShowReasons] = useState(false);

  const renderActions = () => {
    if (!message.actions || message.actions.length === 0) return null;
    // 锚点：反馈操作区父节点；含工作台导航操作时该区域承载工作台导航锚点（fixture 中常驻）
    const hasWorkbenchNav = message.actions.some((action) => action.type === 'open-workbench');
    return (
      <div
        className="mt-3 text-sm text-gray-500 dark:text-gray-400"
        data-requirement-id={hasWorkbenchNav ? 'ruyi-workbench-navigation' : 'ruyi-response-feedback'}
      >
        <div className="flex flex-wrap items-center gap-3">
          {message.actions.map((action, index) => {
            const isUseful = action.type === 'feedback-useful';
            const isUseless = action.type === 'feedback-useless';
            const usefulSelected = isUseful && message.feedback?.rating === 'useful';
            const uselessSelected = isUseless && message.feedback?.rating === 'useless';
            return (
              <button
                key={`${action.type}-${index}`}
                type="button"
                onClick={() => {
                  if (isUseless && !message.feedback?.reason) setShowReasons(true);
                  onAction(action.type, message);
                }}
                className={`inline-flex items-center gap-1 transition-colors hover:text-theme-600 dark:hover:text-theme-300 ${(usefulSelected || uselessSelected) ? 'font-semibold text-theme-600 dark:text-theme-300' : ''}`}
              >
                {actionIcons[action.type]}
                {usefulSelected ? '已记录有用' : uselessSelected ? (message.feedback?.reason ? `已记录 · ${message.feedback.reason}` : '已记录没用') : action.label}
              </button>
            );
          })}
        </div>
        {showReasons && message.feedback?.rating === 'useless' && !message.feedback.reason && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {uselessReasons.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => { setShowReasons(false); onAction('feedback-useless', message, { reason }); }}
                className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-theme-400 hover:text-theme-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                {reason}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (message.sender === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl rounded-2xl bg-theme-50 px-5 py-4 text-gray-900 shadow-sm dark:bg-theme-900/20 dark:text-white">
          <div className="whitespace-pre-line leading-7">{message.content}</div>
        </div>
      </div>
    );
  }

  // V2：多任务歧义选择消息（候选列表 + 用户选择；已选择后置灰保留历史）
  if (message.multiTaskCandidates && message.multiTaskCandidates.length > 0) {
    const candidateTasks = message.multiTaskCandidates
      .map((c) => useRuyiStore.getState().getTaskById(c.taskId))
      .filter((t): t is NonNullable<typeof t> => !!t);
    return (
      <div className="flex gap-4">
        <div className="mt-1 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-theme-100">
          <img src={RUYI_ASSISTANT_AVATAR} alt="如意助手" className="h-full w-full object-cover" />
        </div>
        <div className="max-w-3xl flex-1">
          <div className="mb-2 whitespace-pre-line leading-7 text-gray-900 dark:text-gray-100">{message.content}</div>
          {candidateTasks.length > 0 ? (
            <RuyiMultiTaskResolver
              tasks={candidateTasks}
              selectedTaskId={message.selectionResolved ?? null}
              disabled={!!message.selectionResolved}
              onSelect={(taskId) => onAction("select-task", message, { taskId })}
            />
          ) : (
            <p className="text-xs text-gray-400">候选任务已失效。</p>
          )}
        </div>
      </div>
    );
  }

  if (message.kind === "loading") {
    return (
      <div className="flex gap-4">
        <div className="mt-1 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-theme-100">
          <img
            src={RUYI_ASSISTANT_AVATAR}
            alt="如意助手"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex max-w-3xl items-center gap-2 text-gray-700 dark:text-gray-200">
          <Loader2 size={16} className="animate-spin text-theme-600" />
          <span className="text-sm">{message.content}</span>
        </div>
      </div>
    );
  }

  if (message.kind === "capability-status") {
    return (
      <div className="flex justify-center py-2">
        <div className="rounded-full border border-theme-100 bg-theme-50 px-4 py-1.5 text-xs font-medium text-theme-700 dark:border-theme-800 dark:bg-theme-900/20 dark:text-theme-300">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.kind === "result" && result) {
    return (
      <div className="flex gap-4">
        <div className="mt-1 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-theme-100">
          <img
            src={RUYI_ASSISTANT_AVATAR}
            alt="如意助手"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="max-w-3xl flex-1">
          <p className="mb-3 leading-7 text-gray-900 dark:text-gray-100">{message.content}</p>
          <RuyiResultCard result={result} onOpen={() => onAction("open-result", message)} />
          {renderActions()}
        </div>
      </div>
    );
  }

  if (message.kind === "confirmation") {
    return (
      <div className="flex gap-4">
        <div className="mt-1 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-theme-100">
          <img
            src={RUYI_ASSISTANT_AVATAR}
            alt="如意助手"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="max-w-3xl flex-1">
          <RuyiConfirmationMessage
            message={message}
            onAction={(action) => onAction(action.type, message, action.payload as RuyiActionPayload | undefined)}
          />
        </div>
      </div>
    );
  }

  if (message.kind === "resume-task") {
    return (
      <div className="flex gap-4">
        <div className="mt-1 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-theme-100">
          <img
            src={RUYI_ASSISTANT_AVATAR}
            alt="如意助手"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="max-w-3xl flex-1">
          <RuyiTaskResumeMessage message={message} onResume={() => onAction("resume-task", message)} />
        </div>
      </div>
    );
  }

  if (message.kind === "error") {
    return (
      <div className="flex justify-center py-2">
        <div className="max-w-3xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-200">
          <div className="whitespace-pre-line">{message.content}</div>
          {renderActions()}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="mt-1 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-theme-100">
        <img
          src={RUYI_ASSISTANT_AVATAR}
          alt="如意助手"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="max-w-3xl flex-1">
        <div className="whitespace-pre-line leading-7 text-gray-900 dark:text-gray-100">{message.content}</div>
        {message.sourceLabel && message.sourceHref && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            来源：
            <Link
              to={message.sourceHref}
              className="font-medium text-theme-700 hover:underline dark:text-theme-300"
            >
              {message.sourceLabel}
            </Link>
          </div>
        )}
        {renderActions()}
      </div>
    </div>
  );
}
