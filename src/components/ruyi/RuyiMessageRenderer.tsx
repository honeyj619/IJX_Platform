import { useState } from "react";
import { RUYI_ASSISTANT_AVATAR } from '../../data/people';
import type { RuyiMessage, RuyiMessageActionType } from "../../types/ruyi";
import { useRuyiStore } from "../../store/ruyiStore";
import { Loader2, Copy, RotateCcw, ThumbsUp, ThumbsDown, ExternalLink, Check, X, Play, Pencil, BookOpen, Users, ArrowRight } from "lucide-react";
import { getRuyiAgentByCapabilityId } from "../../data/ruyiCapabilities";
import { Link } from "react-router-dom";
import RuyiResultCard from "./RuyiResultCard";
import RuyiConfirmationMessage from "./RuyiConfirmationMessage";
import RuyiTaskResumeMessage from "./RuyiTaskResumeMessage";
import RuyiMultiTaskResolver from "./RuyiMultiTaskResolver";
import RuyiCapabilitySummary from "./capability/RuyiCapabilitySummary";
import RuyiMessageToolbar from "./RuyiMessageToolbar";
import RuyiMessageBusinessActions from "./RuyiMessageBusinessActions";
import BusinessMessageCard from '../messages/BusinessMessageCard';

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
  "continue-in-zone": <ArrowRight size={14} />,
  "confirm-task": <Check size={14} />,
  "modify-task": <Pencil size={14} />,
  "cancel-task": <X size={14} />,
  "resume-task": <Play size={14} />,
};

const uselessReasons = ['答非所问', '信息不准确', '操作失败', '其他原因'] as const;
void uselessReasons;

export default function RuyiMessageRenderer({ message, onAction }: RuyiMessageRendererProps) {
  const result = message.resultId ? useRuyiStore.getState().getResultById(message.resultId) : null;

  // V3.5：业务动作区 + 通用功能条分离。
  // - 业务动作：仅渲染业务类 action（契约校验后）；含工作台导航时承载 ruyi-workbench-navigation 锚点
  // - 通用功能条：每条完成态助手回复常驻（loading/系统态由各分支自行控制不渲染）
  const renderActions = () => {
    const hasWorkbenchNav = (message.actions ?? []).some((action) => action.type === 'open-workbench');
    return (
      <>
        <div data-requirement-id={hasWorkbenchNav ? 'ruyi-workbench-navigation' : undefined}>
          <RuyiMessageBusinessActions
            message={message}
            onAction={(type, msg, payload) => onAction(type, msg, payload as RuyiActionPayload | undefined)}
          />
        </div>
        <RuyiMessageToolbar
          message={message}
          onAction={(type, msg, payload) => onAction(type, msg, payload as RuyiActionPayload | undefined)}
        />
      </>
    );
  };

  if (message.sender === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-2xl rounded-2xl bg-theme-50 px-5 py-4 text-gray-900 shadow-sm dark:bg-theme-900/20 dark:text-white">
          <div className="whitespace-pre-line leading-7">{message.content}</div>
          {/* V3：能力提交消息附带参数摘要 */}
          {message.capabilitySubmission && <RuyiCapabilitySummary submission={message.capabilitySubmission} />}
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
          <RuyiMessageToolbar message={message} onAction={(type, msg, payload) => onAction(type, msg, payload as RuyiActionPayload | undefined)} />
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
          <RuyiMessageToolbar message={message} onAction={(type, msg, payload) => onAction(type, msg, payload as RuyiActionPayload | undefined)} />
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

  // V3.4：业务操作卡片（完整布局；IM 用 compact——两端同一组件）
  if (message.businessCard) {
    return (
      <div className="flex gap-4">
        <div className="mt-1 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-theme-100">
          <img src={RUYI_ASSISTANT_AVATAR} alt="如意助手" className="h-full w-full object-cover" />
        </div>
        <div className="max-w-3xl flex-1">
          <div className="mb-3 whitespace-pre-line leading-7 text-gray-900 dark:text-gray-100">{message.content}</div>
          <BusinessMessageCard card={message.businessCard} />
          {renderActions()}
        </div>
      </div>
    );
  }

  const replyAgent = message.capabilityId ? getRuyiAgentByCapabilityId(message.capabilityId) : null;
  const externalAgent = replyAgent && replyAgent.id !== "ruyi-assistant" ? replyAgent : null;

  return (
    <div className="flex gap-4">
      {externalAgent ? (
        <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-theme-50 text-theme-600 dark:bg-theme-900/30 dark:text-theme-300">
          {externalAgent.iconKey === "book-open" ? <BookOpen size={18} /> : <Users size={18} />}
        </div>
      ) : (
        <div className="mt-1 h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-theme-100">
          <img
            src={RUYI_ASSISTANT_AVATAR}
            alt="如意助手"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="max-w-3xl flex-1">
        {externalAgent && (
          <div className="mb-1 text-xs font-semibold text-theme-700 dark:text-theme-300">{externalAgent.name}</div>
        )}
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
