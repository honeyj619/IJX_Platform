import type { Message, Session } from './types';

/** 纯工具函数：不读取任何静态业务数据，避免运行时状态与种子数据脱节 */

export function nowTime(d: Date = new Date()): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function timeLabel(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return nowTime(d);
  const yesterday = new Date(today.getTime() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return '昨天';
  if (today.getTime() - ts < 7 * 86400000) {
    return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
  }
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function dateKey(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function totalUnread(sessions: Session[]): number {
  return sessions.reduce((sum, s) => sum + (s.hidden ? 0 : s.unread || 0), 0);
}

/** 消息在列表/搜索/置顶条中的纯文本预览 */
export function messagePreview(msg: Message): string {
  if (msg.burned) return '[阅后即焚已销毁]';
  if (msg.recalled) return msg.from === 'me' ? '你撤回了一条消息' : '对方撤回了一条消息';
  if (msg.burn) return '[阅后即焚]';
  if (msg.scheduled) return `[定时消息] ${msg.text ?? ''}`;
  switch (msg.type) {
    case 'text': return msg.text ?? '';
    case 'image': return '[图片]';
    case 'video': return '[视频]';
    case 'voice': return `[语音] ${msg.duration ?? 0}"`;
    case 'file': return `[文件] ${msg.text ?? ''}`;
    case 'card': return `[名片] ${msg.text ?? ''}`;
    case 'article': return `[图文] ${msg.title ?? msg.text ?? ''}`;
    case 'emoji': return msg.text ?? '[表情]';
    case 'call': return msg.mode === 'video' ? '[视频通话]' : '[语音通话]';
    case 'vote': return `[投票] ${msg.vote?.title ?? msg.text ?? ''}`;
    case 'chain': return `[接龙] ${msg.chain?.title ?? msg.text ?? ''}`;
    case 'merge': return `[聊天记录] ${msg.merge?.title ?? ''}`;
    case 'system': return msg.text ?? '';
    default: return msg.text ?? '';
  }
}

export function isMentionMessage(msg: Message, meId = 'me'): boolean {
  if (msg.from === meId || msg.recalled || msg.type === 'system') return false;
  if (msg.mentionAll) return true;
  if (msg.mentions?.includes(meId)) return true;
  return typeof msg.text === 'string' && msg.text.includes('@所有人');
}

export function isForwardable(msg: Message): boolean {
  if (msg.recalled || msg.burned || msg.type === 'system') return false;
  return ['text', 'emoji', 'image', 'video', 'voice', 'file', 'card', 'article', 'merge', 'vote', 'chain'].includes(msg.type);
}

export function isPinnable(msg: Message): boolean {
  return !msg.recalled && !msg.burned && !msg.burn && msg.type !== 'system';
}

export function canRecall(msg: Message): boolean {
  if (msg.from !== 'me' || msg.recalled || msg.type === 'system') return false;
  if (!msg.ts) return true;
  return Date.now() - msg.ts < 2 * 60 * 1000 || msg.ts > Date.now();
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function searchableText(msg: Message, senderName?: string): string {
  return [msg.text, msg.title, msg.desc, messagePreview(msg), senderName].filter(Boolean).join(' ').toLowerCase();
}
