import { useState } from "react";
import { Copy, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import type { RuyiMessage, RuyiMessageFeedback } from "../../types/ruyi";

/**
 * V3.5 通用功能条（每条完成态助手回复固定显示）：
 * - 复制 / 有用 / 没用 / 重新生成——由渲染器统一生成，不依赖 message.actions 数据
 * - IM 用 compact 图标布局；如意空间用图标+文本
 * - 有用/没用显示已选状态；没用可展开原因；重新生成追加新回复；复制成功 Toast 由调用方处理
 * - loading / capability-status / 纯系统消息不显示（由调用方控制）
 * - 锚点 ruyi-response-feedback 常驻本组件根节点
 */

export type RuyiToolbarActionType = 'copy' | 'feedback-useful' | 'feedback-useless' | 'regenerate';

export interface RuyiMessageToolbarProps {
  message: RuyiMessage;
  compact?: boolean;
  onAction: (
    type: RuyiToolbarActionType,
    message: RuyiMessage,
    payload?: { reason?: RuyiMessageFeedback['reason'] },
  ) => void;
}

const uselessReasons = ['答非所问', '信息不准确', '操作失败', '其他原因'] as const;

export default function RuyiMessageToolbar({ message, compact = false, onAction }: RuyiMessageToolbarProps) {
  const [showReasons, setShowReasons] = useState(false);
  const [copied, setCopied] = useState(false);

  const usefulSelected = message.feedback?.rating === 'useful';
  const uselessSelected = message.feedback?.rating === 'useless';

  const handleCopy = () => {
    onAction('copy', message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const itemClass = (selected: boolean) =>
    `inline-flex items-center gap-1 transition-colors ${compact ? 'px-1.5 py-0.5 text-[11px]' : 'text-sm px-1 py-0.5'} ${
      selected ? 'font-semibold text-theme-600 dark:text-theme-300' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
    }`;

  return (
    <div
      className={`flex flex-wrap items-center ${compact ? 'gap-2' : 'gap-3'} ${compact ? 'mt-1.5' : 'mt-3'}`}
      data-requirement-id="ruyi-response-feedback"
    >
      <button type="button" onClick={handleCopy} className={itemClass(false)} title="复制回复内容">
        <Copy size={compact ? 12 : 14} />
        {!compact && (copied ? '已复制' : '复制')}
        {compact && copied && <span className="text-theme-500">✓</span>}
      </button>
      <button
        type="button"
        onClick={() => { if (!usefulSelected) onAction('feedback-useful', message); }}
        className={itemClass(usefulSelected)}
        title="这条回复有用"
      >
        <ThumbsUp size={compact ? 12 : 14} />
        {!compact && (usefulSelected ? '已记录有用' : '有用')}
      </button>
      <button
        type="button"
        onClick={() => {
          if (!uselessSelected || !message.feedback?.reason) setShowReasons((v) => !v);
          if (!uselessSelected) onAction('feedback-useless', message);
        }}
        className={itemClass(uselessSelected)}
        title="这条回复没用"
      >
        <ThumbsDown size={compact ? 12 : 14} />
        {!compact && (uselessSelected ? (message.feedback?.reason ? `已记录 · ${message.feedback.reason}` : '已记录没用') : '没用')}
      </button>
      <button type="button" onClick={() => onAction('regenerate', message)} className={itemClass(false)} title="重新生成回复">
        <RotateCcw size={compact ? 12 : 14} />
        {!compact && '重新生成'}
      </button>
      {showReasons && message.feedback?.rating === 'useless' && !message.feedback.reason && (
        <div className="flex flex-wrap gap-1.5">
          {uselessReasons.map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => { setShowReasons(false); onAction('feedback-useless', message, { reason }); }}
              className={`rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-600 transition-colors hover:border-theme-400 hover:text-theme-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 ${compact ? '' : 'text-xs'}`}
            >
              {reason}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
