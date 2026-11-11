import { messagePreview, isMentionMessage, searchableText, dateKey } from './data/utils';
import type {
  Contact, Group, ImApp, JoinRequest, Message, SearchFilters, SearchHit, Session, SessionFilter,
  ServiceAccount, ServiceTicket, Topic,
} from './data/types';

/** Store 快照：所有派生数据只能从这里读，页面禁止直接引用静态种子常量 */
export interface ImSnapshot {
  sessions: Session[];
  messages: Record<string, Message[]>;
  groups: Group[];
  contacts: Contact[];
  serviceAccounts: ServiceAccount[];
  serviceTickets: ServiceTicket[];
  imApps: ImApp[];
  topics: Record<string, Topic>;
  drafts: Record<string, string>;
  notes: Record<string, string>;
  joinRequests: JoinRequest[];
}

export const FILE_HELPER_ID = 'file-helper';
export const ME_ID = 'me';

export function getSession(state: ImSnapshot, id: string): Session | undefined {
  return state.sessions.find((s) => s.id === id);
}

export function getGroup(state: ImSnapshot, id: string): Group | undefined {
  return state.groups.find((g) => g.id === id);
}

export function getContact(state: ImSnapshot, id: string): Contact | undefined {
  return state.contacts.find((c) => c.id === id);
}

export function getApp(state: ImSnapshot, id: string): ImApp | undefined {
  return state.imApps.find((a) => a.id === id);
}

export function displayName(state: ImSnapshot, id: string): string {
  if (id === ME_ID) return getContact(state, ME_ID)?.name ?? '我';
  const note = state.notes[id];
  if (note) return note;
  const group = getGroup(state, id);
  if (group) return group.nicks?.[id] ?? group.name;
  return getContact(state, id)?.name
    ?? state.serviceAccounts.find((a) => a.id === id)?.name
    ?? getApp(state, id)?.name
    ?? id;
}

export function sessionTitle(state: ImSnapshot, session: Session): string {
  switch (session.type) {
    case 'group': return getGroup(state, session.targetId)?.name ?? '群聊';
    case 'im-app': return getApp(state, session.targetId)?.name ?? '应用消息';
    case 'service-inbox': return `员工服务-${state.serviceAccounts.find((a) => a.id === session.targetId)?.name ?? ''}`;
    case 'service-ticket': {
      const ticket = state.serviceTickets.find((t) => t.id === session.targetId);
      return ticket?.fromName ?? '服务咨询';
    }
    default: return displayName(state, session.targetId);
  }
}

export function sessionBadge(state: ImSnapshot, session: Session): string {
  if (session.type === 'group') {
    const group = getGroup(state, session.targetId);
    return group ? `${group.members.length} 人` : '';
  }
  return '';
}

export function sessionAvatarLabel(state: ImSnapshot, session: Session): string {
  return sessionTitle(state, session);
}

export function sessionIcon(state: ImSnapshot, session: Session): string {
  if (session.type === 'im-app') return getApp(state, session.targetId)?.icon ?? '应';
  if (session.type === 'service-inbox' || session.type === 'service-ticket') return '服';
  if (session.targetId === FILE_HELPER_ID) return '文';
  return '';
}

export function sessionMessages(state: ImSnapshot, sessionId: string): Message[] {
  return state.messages[sessionId] ?? [];
}

/** 最后一条可展示消息（阅后即焚未销毁时也展示占位） */
export function lastMessage(state: ImSnapshot, sessionId: string): Message | undefined {
  const list = sessionMessages(state, sessionId);
  return list.length ? list[list.length - 1] : undefined;
}

export function sessionPreview(state: ImSnapshot, sessionId: string): string {
  const session = getSession(state, sessionId);
  const msg = lastMessage(state, sessionId);
  if (!msg) {
    if (session?.type === 'service-inbox') {
      const tickets = ticketsOf(state, session.targetId);
      return tickets.length ? `${tickets.length} 条服务咨询 · ${tickets[0].lastText}` : '暂无服务咨询';
    }
    return '';
  }
  const text = messagePreview(msg);
  if (msg.type === 'system' || msg.recalled) return text;
  const prefix = msg.from === ME_ID
    ? '我：'
    : session?.type === 'group' || session?.type === 'service-ticket'
      ? `${displayName(state, msg.from)}：`
      : '';
  return `${prefix}${text}`;
}

/** 列表可见会话：隐藏会话、服务咨询子会话、文件传输助手不展示 */
export function isListable(state: ImSnapshot, session: Session): boolean {
  if (session.hidden) return false;
  if (session.type === 'service-ticket') return false;
  if (session.targetId === FILE_HELPER_ID) return false;
  return true;
}

export function sortedSessions(state: ImSnapshot): Session[] {
  return state.sessions
    .filter((s) => isListable(state, s))
    .slice()
    .sort((a, b) => Number(b.pinned ?? false) - Number(a.pinned ?? false) || (b.lastTs ?? 0) - (a.lastTs ?? 0));
}

/** @消息：仅群聊 + 仅当前未读区间；已读后自动消失 */
export function unreadMentionMessages(state: ImSnapshot, session: Session): Message[] {
  if (session.type !== 'group' || session.unread <= 0) return [];
  const list = sessionMessages(state, session.id);
  const unreadSlice = list.slice(-session.unread);
  return unreadSlice.filter((m) => isMentionMessage(m, ME_ID) && (m.ts ?? 0) >= (session.lastReadTs ?? 0));
}

export function hasUnreadMention(state: ImSnapshot, session: Session): boolean {
  return unreadMentionMessages(state, session).length > 0;
}

export function latestMention(state: ImSnapshot, session: Session): Message | undefined {
  const hits = unreadMentionMessages(state, session);
  return hits[hits.length - 1];
}

export function filterSessions(state: ImSnapshot, filter: SessionFilter, query = ''): Session[] {
  const q = query.trim().toLowerCase();
  return sortedSessions(state).filter((s) => {
    if (filter === 'unread' && s.unread <= 0) return false;
    if (filter === 'mention' && !hasUnreadMention(state, s)) return false;
    if (q) {
      const hay = [sessionTitle(state, s), sessionPreview(state, s.id), state.notes[s.targetId] ?? ''].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function searchContacts(state: ImSnapshot, q: string): Contact[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return state.contacts.filter((c) => c.id !== ME_ID && c.id !== FILE_HELPER_ID && [c.name, c.job, c.account, c.phone, c.dept, state.notes[c.id]].some((v) => v && v.toLowerCase().includes(query)));
}

export function searchGroups(state: ImSnapshot, q: string): Group[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return state.groups.filter((g) => [g.name, g.notice].some((v) => v && v.toLowerCase().includes(query)));
}

function messageMatchesFilters(state: ImSnapshot, session: Session, msg: Message, filters: SearchFilters): boolean {
  if (filters.at && !isMentionMessage(msg, ME_ID)) return false;
  if (filters.sender) {
    const name = displayName(state, msg.from).toLowerCase();
    if (!name.includes(filters.sender.toLowerCase())) return false;
  }
  if (filters.member && session.type === 'group') {
    const group = getGroup(state, session.targetId);
    if (!group?.members.includes(filters.member)) return false;
  }
  if (filters.chatType && filters.chatType !== 'all') {
    if (filters.chatType === 'group' && session.type !== 'group') return false;
    if (filters.chatType === 'single' && session.type !== 'single') return false;
  }
  if (filters.msgType && filters.msgType !== 'all' && msg.type !== filters.msgType) return false;
  if (filters.group && session.type !== 'group') return false;
  if (filters.group) {
    const group = getGroup(state, session.targetId);
    if (!group?.name.toLowerCase().includes(filters.group.toLowerCase())) return false;
  }
  if (filters.date && dateKey(msg.ts) !== filters.date) return false;
  return true;
}

/** 全局聊天记录搜索：结果带 msgId，供聊天页精确定位高亮 */
export function searchRecords(state: ImSnapshot, q: string, filters: SearchFilters = {}, scopeSessionId?: string): SearchHit[] {
  const query = q.trim().toLowerCase();
  const hits: SearchHit[] = [];
  for (const session of state.sessions) {
    if (scopeSessionId && session.id !== scopeSessionId) continue;
    if (!scopeSessionId && !isListable(state, session)) continue;
    const title = sessionTitle(state, session);
    for (const msg of sessionMessages(state, session.id)) {
      if (msg.recalled || msg.burned || msg.type === 'system') continue;
      if (!messageMatchesFilters(state, session, msg, filters)) continue;
      const hay = [msg.text, msg.title, msg.desc, messagePreview(msg), displayName(state, msg.from), title].filter(Boolean).join(' ').toLowerCase();
      if (query && !hay.includes(query) && !searchableText(msg, displayName(state, msg.from)).includes(query)) continue;
      hits.push({
        sessionId: session.id,
        msgId: msg.id,
        from: msg.from,
        text: messagePreview(msg),
        time: msg.time,
        title,
      });
    }
  }
  return hits.reverse().slice(0, 80);
}

export function searchSessions(state: ImSnapshot, q: string): Session[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return sortedSessions(state).filter((s) =>
    [sessionTitle(state, s), sessionPreview(state, s.id)].join(' ').toLowerCase().includes(query));
}

export function pinnedMessages(state: ImSnapshot, sessionId: string): { msg: Message; pinnedAt: number }[] {
  const session = getSession(state, sessionId);
  if (!session?.pins?.length) return [];
  const list = sessionMessages(state, sessionId);
  return session.pins
    .map((p) => ({ msg: list.find((m) => m.id === p.msgId), pinnedAt: p.pinnedAt }))
    .filter((x): x is { msg: Message; pinnedAt: number } => !!x.msg)
    .sort((a, b) => b.pinnedAt - a.pinnedAt);
}

export function isPinned(state: ImSnapshot, sessionId: string, msgId: string): boolean {
  return !!getSession(state, sessionId)?.pins?.some((p) => p.msgId === msgId);
}

export function groupReceipt(state: ImSnapshot, sessionId: string, msg: Message): { read: string[]; unread: string[]; total: number } {
  const session = getSession(state, sessionId);
  const group = session?.type === 'group' ? getGroup(state, session.targetId) : undefined;
  const others = group ? group.members.filter((id) => id !== ME_ID && id !== msg.from) : [];
  const readBy = msg.readBy ?? [];
  const read = others.filter((id) => readBy.includes(id));
  const unread = others.filter((id) => !readBy.includes(id));
  return { read, unread, total: others.length };
}

export function groupRole(state: ImSnapshot, groupId: string, userId = ME_ID): 'owner' | 'admin' | 'member' | 'none' {
  const group = getGroup(state, groupId);
  if (!group) return 'none';
  if (group.owner === userId) return 'owner';
  if (group.admins.includes(userId)) return 'admin';
  return group.members.includes(userId) ? 'member' : 'none';
}

export function isMutedInGroup(state: ImSnapshot, groupId: string, userId = ME_ID): boolean {
  const group = getGroup(state, groupId);
  if (!group) return false;
  if (!group.muteAll) return group.muted.includes(userId);
  const role = groupRole(state, groupId, userId);
  return role === 'member' && !group.allowlist?.includes(userId);
}

export function myGroups(state: ImSnapshot): Group[] {
  return state.groups.filter((g) => g.members.includes(ME_ID));
}

export function ticketsOf(state: ImSnapshot, accountId: string): ServiceTicket[] {
  return state.serviceTickets.filter((t) => t.accountId === accountId);
}

export function ticketSessionId(ticketId: string): string {
  return `s-sa-ticket-${ticketId}`;
}

export function inboxSessionId(accountId: string): string {
  return `s-sa-inbox-${accountId}`;
}

export function appSessionId(appId: string): string {
  return `s-im-${appId}`;
}
