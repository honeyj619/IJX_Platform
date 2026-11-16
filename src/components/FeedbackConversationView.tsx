import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, MessageCircle } from 'lucide-react';
import {
  getFeedbackConversation,
  getFeedbackConversations,
  subscribeFeedbackConversations,
  type FeedbackConversation,
  type FeedbackConversationMessage,
} from '../data/feedbackConversations';

type FeedbackConversationViewProps = {
  conversationId: string;
  /** 打开反馈详情（跳转 /pc_client/help-feedback/:id） */
  onOpenDetail: (feedbackId: string) => void;
};

/**
 * 消息页反馈会话视图：
 * 展示「反馈服务 · FB编号」会话的系统/管理员消息，支持发送回复与跳转反馈详情。
 * PC 客户端与 App 消息模块共用同一份数据（feedbackConversations 数据层）。
 */
export default function FeedbackConversationView({ conversationId, onOpenDetail }: FeedbackConversationViewProps) {
  const [conversation, setConversation] = useState<FeedbackConversation | null>(() => getFeedbackConversationById(conversationId));
  const [draft, setDraft] = useState('');

  useEffect(() => subscribeFeedbackConversations(() => setConversation(getFeedbackConversationById(conversationId))), [conversationId]);

  const messages: FeedbackConversationMessage[] = useMemo(() => conversation?.messages ?? [], [conversation]);

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-gray-50 text-sm text-gray-400">
        <MessageCircle size={28} />
        <p>会话不存在或已被清除</p>
      </div>
    );
  }

  const send = (from: 'admin' | 'user') => {
    const text = draft.trim();
    if (!text) return;
    // 动态 import 避免与 Home.tsx 循环依赖（sendFeedbackConversationMessage 来自数据层，无环，直接引亦可）
    void import('../data/feedbackConversations').then(({ sendFeedbackConversationMessage }) => {
      sendFeedbackConversationMessage(conversation.feedbackId, text, from);
      setDraft('');
    });
  };

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* 消息流 */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map(message => (
          <div key={message.id} className={message.from === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                message.from === 'system'
                  ? 'mx-auto max-w-[80%] rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-center text-xs leading-5 whitespace-pre-wrap text-blue-700'
                  : message.from === 'user'
                    ? 'max-w-[70%] rounded-lg bg-theme-600 px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap text-white'
                    : 'max-w-[70%] rounded-lg bg-white px-4 py-2.5 text-sm leading-6 whitespace-pre-wrap text-gray-800 shadow-sm'
              }
            >
              {message.kind === 'created' && <div className="mb-1 font-medium">📋 {message.feedbackNo}</div>}
              {message.kind === 'accepted' && <div className="mb-1 font-medium">✅ 已受理</div>}
              {message.kind === 'resolved' && <div className="mb-1 font-medium">🏁 已解决</div>}
              {message.text}
              <div className={message.from === 'system' ? 'mt-1 text-[10px] text-blue-400' : 'mt-1 text-right text-[10px] opacity-70'}>{message.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 反馈详情入口 + 输入区 */}
      <div className="shrink-0 border-t border-gray-200 bg-white p-3">
        <button
          type="button"
          onClick={() => onOpenDetail(conversation.feedbackId)}
          className="mb-2 inline-flex items-center gap-1.5 rounded-md border border-theme-200 bg-theme-50 px-3 py-1.5 text-xs font-medium text-theme-700 hover:bg-theme-100"
        >
          <ArrowLeftRight size={13} /> 查看反馈详情（{conversation.feedbackNo}）
        </button>
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter') send('user'); }}
            placeholder="输入回复…"
            className="h-10 flex-1 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-theme-400"
          />
          <button type="button" onClick={() => send('user')} className="rounded-lg bg-theme-600 px-4 text-sm font-medium text-white hover:bg-theme-700">发送</button>
        </div>
      </div>
    </div>
  );
}

/** 按 ID 取会话（含 feedbackId 反查：conversationId 形如 fb-conv-{feedbackId}） */
function getFeedbackConversationById(conversationId: string): FeedbackConversation | null {
  if (!conversationId) return null;
  const target = getFeedbackConversationsSafe().find(item => item.id === conversationId);
  if (target) return target;
  // 兼容直接传 feedbackId
  const feedbackId = conversationId.replace(/^fb-conv-/, '');
  return getFeedbackConversation(feedbackId);
}

function getFeedbackConversationsSafe() {
  return getFeedbackConversations();
}

export { getFeedbackConversationById };
