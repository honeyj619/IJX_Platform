import { MAIN_USER_NAME } from './people';
import { getFeedbackRecord, type FeedbackRecord } from './feedback';

/**
 * 反馈沟通会话数据层（前端模拟）：
 * - 每条反馈最多绑定一个会话（feedbackConversationId 稳定 ID，不重复创建）；
 * - 会话标题「反馈服务 · FB编号」；
 * - 管理员受理/解决反馈时自动追加状态系统消息；
 * - PC 客户端消息页与 App 消息模块通过 getFeedbackConversations 读取同一份模拟数据。
 */

export type FeedbackConversationMessage = {
  id: string;
  /** system=系统消息 / admin=管理员 / user=用户 */
  from: 'system' | 'admin' | 'user';
  text: string;
  time: string;
  /** 系统消息类型：created=会话创建 / accepted=已受理 / resolved=已解决 */
  kind?: 'created' | 'accepted' | 'resolved';
  /** 关联反馈编号（系统消息展示用） */
  feedbackNo?: string;
};

export type FeedbackConversation = {
  /** 稳定会话 ID：fb-conv-{feedbackId}，与反馈一一绑定 */
  id: string;
  /** 会话标题：反馈服务 · FB编号 */
  title: string;
  feedbackId: string;
  feedbackNo: string;
  /** 反馈提交人（会话对方） */
  userName: string;
  messages: FeedbackConversationMessage[];
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'ijx-feedback-conversations-v1';
export const FEEDBACK_CONVERSATIONS_EVENT = 'ijx-feedback-conversations-change';

const pad = (value: number) => String(value).padStart(2, '0');
const nowText = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export const feedbackConversationId = (feedbackId: string) => `fb-conv-${feedbackId}`;
export const feedbackConversationTitle = (feedbackNo: string) => `反馈服务 · ${feedbackNo}`;

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const readAll = (): FeedbackConversation[] => {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FeedbackConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeAll = (conversations: FeedbackConversation[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  window.dispatchEvent(new Event(FEEDBACK_CONVERSATIONS_EVENT));
};

export const getFeedbackConversations = (): FeedbackConversation[] => readAll();

export const getFeedbackConversation = (feedbackId: string): FeedbackConversation | null =>
  readAll().find(conversation => conversation.feedbackId === feedbackId) || null;

/**
 * 创建或打开反馈会话（幂等）：
 * 已存在直接返回；不存在则创建并写入首条系统消息（编号/类型/摘要）。
 */
export const ensureFeedbackConversation = (
  feedback: FeedbackRecord,
  operator = MAIN_USER_NAME,
): FeedbackConversation => {
  const conversations = readAll();
  const existing = conversations.find(conversation => conversation.feedbackId === feedback.id);
  if (existing) return existing;
  const time = nowText();
  const conversation: FeedbackConversation = {
    id: feedbackConversationId(feedback.id),
    title: feedbackConversationTitle(feedback.feedbackNo),
    feedbackId: feedback.id,
    feedbackNo: feedback.feedbackNo,
    userName: feedback.userName,
    messages: [{
      id: `${feedbackConversationId(feedback.id)}-created`,
      from: 'system',
      kind: 'created',
      feedbackNo: feedback.feedbackNo,
      text: [
        `已建立反馈沟通会话（${feedback.feedbackNo}）`,
        `类型：${feedback.category}`,
        `问题摘要：${feedback.content.length > 80 ? `${feedback.content.slice(0, 80)}…` : feedback.content}`,
      ].join('\n'),
      time,
    }],
    createdAt: time,
    updatedAt: time,
  };
  writeAll([conversation, ...conversations]);
  return conversation;
};

/** 追加系统消息（受理/解决等状态变化）；会话不存在时静默忽略 */
export const appendFeedbackConversationMessage = (
  feedbackId: string,
  message: Omit<FeedbackConversationMessage, 'id' | 'time'>,
): FeedbackConversation | null => {
  const conversations = readAll();
  const target = conversations.find(conversation => conversation.feedbackId === feedbackId);
  if (!target) return null;
  const time = nowText();
  const updated: FeedbackConversation = {
    ...target,
    messages: [...target.messages, { ...message, id: `${target.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time }],
    updatedAt: time,
  };
  writeAll(conversations.map(conversation => conversation.id === updated.id ? updated : conversation));
  return updated;
};

/** 管理员发送普通消息（联系用户后续沟通） */
export const sendFeedbackConversationMessage = (
  feedbackId: string,
  text: string,
  from: 'admin' | 'user' = 'admin',
): FeedbackConversation | null =>
  appendFeedbackConversationMessage(feedbackId, { from, text });

export const subscribeFeedbackConversations = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(FEEDBACK_CONVERSATIONS_EVENT, listener);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(FEEDBACK_CONVERSATIONS_EVENT, listener);
  };
};

/** 供会话视图使用的反馈快照（详情互跳） */
export const getConversationFeedback = (feedbackId: string): FeedbackRecord | null => getFeedbackRecord(feedbackId);
