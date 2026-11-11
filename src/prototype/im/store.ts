import { shallowRef, onScopeDispose } from 'vue';
import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { SESSIONS } from './data/sessions';
import { MESSAGES } from './data/messages';
import { GROUPS } from './data/groups';
import { CONTACTS, ME } from './data/contacts';
import { SERVICE_ACCOUNTS, SERVICE_TICKETS, IM_APPS, IM_APP_MESSAGES } from './data/services';
import { nowTime, timeLabel, messagePreview, uid } from './data/utils';
import { displayName, sessionTitle, inboxSessionId, appSessionId, ticketSessionId, FILE_HELPER_ID, ME_ID } from './selectors';
import type { ImSnapshot } from './selectors';
import type {
  ChainData, Group, GroupFile, ImApp, JoinRequest, JoinSetting, Message, PinItem,
  ServiceTicket, Session, Topic, VoteData,
} from './data/types';

export const IM_STORAGE_KEY = 'ijx-vue-im-store-v1';
export const IM_STORAGE_VERSION = 1;

export interface ImState extends ImSnapshot {
  joinRequests: JoinRequest[];
  markRead: (sessionId: string) => void;
  togglePin: (sessionId: string) => void;
  toggleStar: (sessionId: string) => void;
  toggleMute: (sessionId: string) => void;
  setSessionHidden: (sessionId: string, hidden: boolean) => void;
  removeSession: (sessionId: string) => void;
  setAppReceive: (sessionId: string, receive: boolean) => void;
  setDraft: (sessionId: string, text: string) => void;
  createSingleSession: (contactId: string) => string;
  openServiceTicket: (accountId: string, ticketId: string) => string;
  sendMessage: (sessionId: string, payload: Partial<Message>) => string;
  simulateIncoming: (sessionId: string, payload: Partial<Message>) => string;
  editMessage: (sessionId: string, msgId: string, text: string) => void;
  recallMessage: (sessionId: string, msgId: string) => void;
  deleteMessage: (sessionId: string, msgId: string) => void;
  toggleReaction: (sessionId: string, msgId: string, emoji: string) => void;
  forwardMessages: (fromSessionId: string, msgIds: string[], toSessionIds: string[], mode: 'single' | 'merge') => void;
  pinMessage: (sessionId: string, msgId: string) => void;
  unpinMessage: (sessionId: string, msgId: string) => void;
  unpinAll: (sessionId: string) => void;
  clearSession: (sessionId: string) => void;
  revealBurn: (sessionId: string, msgId: string) => void;
  burnMessage: (sessionId: string, msgId: string) => void;
  markMessageRead: (sessionId: string, msgId: string, userId: string) => void;
  appendCallRecord: (sessionId: string, mode: 'voice' | 'video', result: Message['result'], duration: number) => void;
  publishVote: (sessionId: string, vote: VoteData) => string;
  submitVote: (sessionId: string, msgId: string, optionIds: string[]) => void;
  endVote: (sessionId: string, msgId: string) => void;
  publishChain: (sessionId: string, chain: ChainData) => string;
  upsertChainItem: (sessionId: string, msgId: string, text: string) => void;
  createTopic: (sessionId: string, msgId: string, title?: string) => string;
  replyTopic: (topicId: string, text: string) => void;
  updateTopicTitle: (topicId: string, title: string) => void;
  leaveTopic: (topicId: string) => void;
  destroyTopic: (topicId: string) => void;
  addTopicMembers: (topicId: string, userIds: string[]) => void;
  createGroup: (name: string, memberIds: string[]) => { groupId: string; sessionId: string };
  updateGroup: (groupId: string, patch: Partial<Group>) => void;
  addGroupMembers: (groupId: string, userIds: string[]) => void;
  removeGroupMember: (groupId: string, userId: string) => void;
  setGroupAdmin: (groupId: string, userId: string, on: boolean) => void;
  transferOwner: (groupId: string, userId: string) => void;
  toggleMuteAll: (groupId: string) => void;
  muteGroupMember: (groupId: string, userId: string, on: boolean) => void;
  setGroupNick: (groupId: string, userId: string, nick: string) => void;
  setGroupJoinSetting: (groupId: string, patch: { joinSetting?: JoinSetting; searchable?: boolean; memberCap?: number }) => void;
  addGroupFile: (groupId: string, file: Omit<GroupFile, 'id' | 'ts'>) => void;
  removeGroupFile: (groupId: string, fileId: string) => void;
  leaveGroup: (groupId: string) => void;
  dissolveGroup: (groupId: string) => void;
  approveJoinRequest: (id: string) => void;
  rejectJoinRequest: (id: string) => void;
  setContactNote: (contactId: string, note: string) => void;
  toggleContactStar: (contactId: string) => void;
  resetDemoData: () => void;
}

/* ------------------------------ 初始化 ------------------------------ */

const MINUTE = 60_000;
const DAY = 86_400_000;

function seedTimestamp(label: string, index: number): number {
  const now = new Date();
  let days = 0;
  if (label.includes('昨天')) days = 1;
  else if (label.includes('周一')) days = 3;
  else if (label.includes('周二')) days = 2;
  else if (label.includes('上周')) days = 7;
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days, 10, 30, 0).getTime();
  return Math.min(Date.now(), base + index * MINUTE);
}

function normalizeGroup(g: Group): Group {
  return {
    ...g,
    admins: [...g.admins],
    members: [...g.members],
    muted: [...g.muted],
    blacklist: [...g.blacklist],
    files: g.files.map((f) => ({ ...f })),
    allowlist: g.allowlist ? [...g.allowlist] : [],
    nicks: g.nicks ? { ...g.nicks } : {},
    joinSetting: g.joinSetting ?? (g.joinMode === 'qr' ? 'all' : 'approve'),
    searchable: g.searchable ?? true,
    memberCap: g.memberCap ?? 500,
  };
}

function buildInitialState(): ImState & { joinRequests: JoinRequest[] } {
  const groups = GROUPS.map(normalizeGroup);
  const contacts = CONTACTS.map((c) => ({ ...c }));
  const sessions: Session[] = SESSIONS.map((s, i) => ({
    ...s,
    pins: s.pins ? [...s.pins] : [],
    lastTs: seedTimestamp(s.lastTime, i),
    lastReadTs: 0,
    hidden: s.hidden ?? s.targetId === FILE_HELPER_ID,
  }));

  const messages: Record<string, Message[]> = {};
  for (const [sid, list] of Object.entries(MESSAGES)) {
    const base = sessions.find((s) => s.id === sid)?.lastTs ?? Date.now() - DAY;
    messages[sid] = list.map((m, i) => ({
      ...m,
      ts: m.ts ?? base - (list.length - i) * MINUTE,
      status: m.status ?? (m.from === ME_ID ? 'read' : 'sent'),
      reactions: m.reactions ? { ...m.reactions } : undefined,
    }));
  }

  // 员工服务收件箱、服务咨询子会话、消息应用
  const serviceAccounts = SERVICE_ACCOUNTS.map((a) => ({ ...a }));
  const serviceTickets: ServiceTicket[] = SERVICE_TICKETS.map((t, i) => ({
    ...t,
    messages: t.messages.map((m, j) => ({ ...m, ts: Date.now() - (i + 2) * DAY - (t.messages.length - j) * MINUTE, status: 'read' as const })),
  }));
  const imApps: ImApp[] = IM_APPS.map((a) => ({ ...a, menus: a.menus.map((m) => ({ ...m })) }));

  for (const account of serviceAccounts) {
    const sid = inboxSessionId(account.id);
    const own = serviceTickets.filter((t) => t.accountId === account.id);
    sessions.push({
      id: sid,
      type: 'service-inbox',
      targetId: account.id,
      unread: own.reduce((sum, t) => sum + t.unread, 0),
      pinned: false,
      mute: false,
      starred: false,
      lastTime: own[0]?.lastTime ?? '09:00',
      lastTs: Date.now() - 2 * 3_600_000,
      lastReadTs: 0,
      pins: [],
    });
    messages[sid] = [];
  }

  for (const ticket of serviceTickets) {
    const sid = ticketSessionId(ticket.id);
    sessions.push({
      id: sid,
      type: 'service-ticket',
      targetId: ticket.id,
      accountId: ticket.accountId,
      unread: 0,
      hidden: true,
      lastTime: ticket.lastTime,
      lastTs: Date.now() - 2 * DAY,
      lastReadTs: Date.now(),
      pins: [],
    });
    messages[sid] = ticket.messages.map((m) => ({ ...m }));
  }

  for (const app of imApps) {
    const sid = appSessionId(app.id);
    const seed = IM_APP_MESSAGES[app.id] ?? [];
    sessions.push({
      id: sid,
      type: 'im-app',
      targetId: app.id,
      unread: app.receive ? 1 : 0,
      receive: app.receive,
      pinned: false,
      mute: false,
      lastTime: seed[seed.length - 1]?.time ?? '09:00',
      lastTs: Date.now() - 4 * 3_600_000,
      lastReadTs: 0,
      pins: [],
    });
    messages[sid] = seed.map((m, i) => ({
      id: `${app.id}-seed-${i}`,
      from: m.from,
      type: m.type ?? 'text',
      text: m.text,
      time: m.time,
      ts: Date.now() - 4 * 3_600_000 + i * MINUTE,
      status: 'read',
    }));
  }

  const joinRequests: JoinRequest[] = [
    { id: 'jr-1', groupId: 'g-fe', userId: 'jy-p6', reason: '希望加入前端组项目群同步迭代进度', time: '昨天', ts: Date.now() - DAY, status: 'pending' },
    { id: 'jr-2', groupId: 'g-six', userId: 'jy-p9', reason: '参与回归测试协作', time: '周一', ts: Date.now() - 3 * DAY, status: 'pending' },
  ];

  return {
    sessions,
    messages,
    groups,
    contacts,
    serviceAccounts,
    serviceTickets,
    imApps,
    topics: {},
    drafts: {},
    notes: {},
    joinRequests,
    ...createActionsPlaceholder(),
  } as ImState & { joinRequests: JoinRequest[] };
}

/** 占位：实际 actions 在 create() 中覆盖，这里只为保证初始对象形状完整 */
function createActionsPlaceholder(): Partial<ImState> {
  return {};
}

/* ------------------------------ 持久化迁移 ------------------------------ */

function persistedOf(state: ImState): ImSnapshot & { joinRequests: JoinRequest[] } {
  return {
    sessions: state.sessions,
    messages: state.messages,
    groups: state.groups,
    contacts: state.contacts,
    serviceAccounts: state.serviceAccounts,
    serviceTickets: state.serviceTickets,
    imApps: state.imApps,
    topics: state.topics,
    drafts: state.drafts,
    notes: state.notes,
    joinRequests: state.joinRequests,
  };
}

function migrateState(persisted: unknown, version: number): ImSnapshot & { joinRequests: JoinRequest[] } {
  const base = buildInitialState();
  const raw = (persisted && typeof persisted === 'object' ? persisted : {}) as Partial<ImSnapshot & { joinRequests: JoinRequest[] }>;
  // v1 无 groups/contacts/serviceAccounts 等分区：用种子补齐，保留用户已有会话与消息
  const merged: ImSnapshot & { joinRequests: JoinRequest[] } = {
    sessions: (raw.sessions ?? base.sessions).map((s) => ({ ...s, pins: s.pins ?? [] })),
    messages: raw.messages ?? base.messages,
    groups: (raw.groups ?? base.groups).map(normalizeGroup),
    contacts: raw.contacts ?? base.contacts,
    serviceAccounts: raw.serviceAccounts ?? base.serviceAccounts,
    serviceTickets: raw.serviceTickets ?? base.serviceTickets,
    imApps: raw.imApps ?? base.imApps,
    topics: raw.topics ?? {},
    drafts: raw.drafts ?? {},
    notes: raw.notes ?? {},
    joinRequests: raw.joinRequests ?? base.joinRequests,
  };
  if (version < 2) {
    merged.sessions = merged.sessions.map((s) => ({ ...s, lastReadTs: 0, hidden: s.hidden ?? s.targetId === FILE_HELPER_ID }));
  }
  return merged;
}

/* ------------------------------ helpers ------------------------------ */

function touch(sessions: Session[], sessionId: string, patch: Partial<Session> = {}): Session[] {
  const ts = Date.now();
  return sessions.map((s) => (s.id === sessionId ? { ...s, lastTime: nowTime(), lastTs: ts, hidden: false, ...patch } : s));
}

function patchMessages(
  state: ImState,
  sessionId: string,
  fn: (list: Message[]) => Message[],
): Record<string, Message[]> {
  return { ...state.messages, [sessionId]: fn(state.messages[sessionId] ?? []) };
}

function systemMessage(text: string, topicId?: string): Message {
  return { id: uid('sys'), from: 'system', type: 'system', text, time: nowTime(), ts: Date.now(), topicId, status: 'read' };
}

function newMessage(payload: Partial<Message>): Message {
  return {
    ...payload,
    id: payload.id ?? uid('m'),
    from: payload.from ?? ME_ID,
    type: payload.type ?? 'text',
    time: payload.time ?? nowTime(),
    ts: payload.ts ?? Date.now(),
    status: payload.status ?? 'sent',
  };
}

function withoutPins(pins: PinItem[] | undefined, msgId: string): PinItem[] {
  return (pins ?? []).filter((p) => p.msgId !== msgId);
}

/* ------------------------------ Store ------------------------------ */

export const imStore = createStore<ImState>()(
  persist(
    (set, get) => ({
      ...buildInitialState(),

      markRead: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, unread: 0, lastReadTs: Date.now() } : s)),
      })),

      togglePin: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, pinned: !s.pinned } : s)),
      })),

      toggleStar: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, starred: !s.starred } : s)),
      })),

      toggleMute: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, mute: !s.mute } : s)),
      })),

      setSessionHidden: (sessionId, hidden) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, hidden } : s)),
      })),

      removeSession: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, hidden: true, unread: 0 } : s)),
      })),

      setAppReceive: (sessionId, receive) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, receive } : s)),
        imApps: state.imApps.map((a) => (appSessionId(a.id) === sessionId ? { ...a, receive } : a)),
      })),

      setDraft: (sessionId, text) => set((state) => ({ drafts: { ...state.drafts, [sessionId]: text } })),

      createSingleSession: (contactId) => {
        const existing = get().sessions.find((s) => s.type === 'single' && s.targetId === contactId);
        if (existing) {
          set((state) => ({ sessions: state.sessions.map((s) => (s.id === existing.id ? { ...s, hidden: false } : s)) }));
          return existing.id;
        }
        const id = `s-${contactId}`;
        const session: Session = {
          id,
          type: 'single',
          targetId: contactId,
          unread: 0,
          pinned: false,
          starred: false,
          mute: false,
          hidden: false,
          lastTime: nowTime(),
          lastTs: Date.now(),
          lastReadTs: Date.now(),
          pins: [],
        };
        set((state) => ({ sessions: [session, ...state.sessions], messages: { ...state.messages, [id]: state.messages[id] ?? [] } }));
        return id;
      },

      openServiceTicket: (accountId, ticketId) => {
        const sid = ticketSessionId(ticketId);
        const state = get();
        const ticket = state.serviceTickets.find((t) => t.id === ticketId);
        const existing = state.sessions.find((s) => s.id === sid);
        if (!existing && ticket) {
          const session: Session = {
            id: sid,
            type: 'service-ticket',
            targetId: ticketId,
            accountId,
            unread: 0,
            hidden: true,
            lastTime: ticket.lastTime,
            lastTs: Date.now(),
            lastReadTs: Date.now(),
            pins: [],
          };
          set((s) => ({
            sessions: [...s.sessions, session],
            messages: { ...s.messages, [sid]: ticket.messages.map((m) => ({ ...m })) },
          }));
        }
        set((s) => ({
          serviceTickets: s.serviceTickets.map((t) => (t.id === ticketId ? { ...t, unread: 0 } : t)),
          sessions: s.sessions.map((item) =>
            item.type === 'service-inbox' && item.targetId === accountId
              ? { ...item, unread: s.serviceTickets.filter((t) => t.accountId === accountId && t.id !== ticketId).reduce((sum, t) => sum + t.unread, 0) }
              : item),
        }));
        return sid;
      },

      sendMessage: (sessionId, payload) => {
        const msg = newMessage(payload);
        set((state) => ({
          messages: { ...state.messages, [sessionId]: [...(state.messages[sessionId] ?? []), msg] },
          sessions: touch(state.sessions, sessionId, { unread: 0, lastReadTs: Date.now() }),
          drafts: { ...state.drafts, [sessionId]: '' },
          groups: payload.type === 'file' && payload.text
            ? state.groups.map((g) => state.sessions.find((s) => s.id === sessionId)?.targetId === g.id
              ? { ...g, files: [...g.files, { id: uid('f'), name: payload.text ?? '', size: payload.size ?? '1 KB', from: ME_ID, time: nowTime(), ts: msg.ts }] }
              : g)
            : state.groups,
        }));
        return msg.id;
      },

      simulateIncoming: (sessionId, payload) => {
        const ts = Date.now();
        const msg = newMessage({ ...payload, from: payload.from ?? 'jy-p7', ts, status: 'sent' });
        set((state) => ({
          messages: { ...state.messages, [sessionId]: [...(state.messages[sessionId] ?? []), msg] },
          sessions: state.sessions.map((s) => (s.id === sessionId
            ? { ...s, unread: (s.unread ?? 0) + 1, lastTime: nowTime(), lastTs: ts, hidden: false }
            : s)),
        }));
        return msg.id;
      },

      editMessage: (sessionId, msgId, text) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.map((m) =>
          m.id === msgId && m.from === ME_ID && !m.recalled ? { ...m, text, edited: true, ts: Date.now() } : m)),
        sessions: touch(state.sessions, sessionId),
      })),

      recallMessage: (sessionId, msgId) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.map((m) =>
          m.id === msgId && m.from === ME_ID ? { ...m, recalled: true, reactions: undefined, text: '' } : m)),
        sessions: touch(state.sessions, sessionId).map((s) => (s.id === sessionId ? { ...s, pins: withoutPins(s.pins, msgId) } : s)),
      })),

      deleteMessage: (sessionId, msgId) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.filter((m) => m.id !== msgId)),
        sessions: touch(state.sessions, sessionId).map((s) => (s.id === sessionId ? { ...s, pins: withoutPins(s.pins, msgId) } : s)),
      })),

      toggleReaction: (sessionId, msgId, emoji) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.map((m) => {
          if (m.id !== msgId) return m;
          const reactions = { ...(m.reactions ?? {}) };
          const users = reactions[emoji] ?? [];
          const next = users.includes(ME_ID) ? users.filter((u) => u !== ME_ID) : [...users, ME_ID];
          if (next.length) reactions[emoji] = next;
          else delete reactions[emoji];
          return { ...m, reactions };
        })),
      })),

      forwardMessages: (fromSessionId, msgIds, toSessionIds, mode) => {
        const state = get();
        const src = state.messages[fromSessionId] ?? [];
        const picked = msgIds.map((id) => src.find((m) => m.id === id)).filter((m): m is Message => !!m);
        if (!picked.length || !toSessionIds.length) return;
        const ts = Date.now();
        set((s) => {
          const messages = { ...s.messages };
          for (const sid of toSessionIds) {
            const list = [...(messages[sid] ?? [])];
            if (mode === 'merge') {
              list.push({
                ...newMessage({ type: 'merge', text: '[聊天记录]', ts }),
                merge: {
                  title: `${sessionTitle(s, getSessionOrFallback(s, fromSessionId))} 的聊天记录`,
                  depth: 1,
                  items: picked.map((m) => ({ from: m.from, fromName: displayName(s, m.from), type: m.type, text: messagePreview(m), time: m.time })),
                },
              });
            } else {
              for (const m of picked) {
                list.push({
                  ...newMessage({ ...m, id: undefined, quote: undefined, reactions: undefined, readBy: undefined, ts, status: 'sent', from: ME_ID }),
                });
              }
            }
            messages[sid] = list;
          }
          let sessions = s.sessions;
          for (const sid of toSessionIds) sessions = touch(sessions, sid);
          return { messages, sessions };
        });
      },

      pinMessage: (sessionId, msgId) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId && !(s.pins ?? []).some((p) => p.msgId === msgId)
          ? { ...s, pins: [...(s.pins ?? []), { msgId, pinnedAt: Date.now() }] }
          : s)),
      })),

      unpinMessage: (sessionId, msgId) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, pins: withoutPins(s.pins, msgId) } : s)),
      })),

      unpinAll: (sessionId) => set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, pins: [] } : s)),
      })),

      clearSession: (sessionId) => set((state) => ({
        messages: { ...state.messages, [sessionId]: [] },
        sessions: touch(state.sessions, sessionId, { unread: 0, pins: [] }),
      })),

      revealBurn: (sessionId, msgId) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.map((m) => (m.id === msgId ? { ...m, burnRevealed: true } : m))),
      })),

      burnMessage: (sessionId, msgId) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.map((m) => (m.id === msgId ? { ...m, burned: true, burnRevealed: false, text: '' } : m))),
        sessions: touch(state.sessions, sessionId),
      })),

      markMessageRead: (sessionId, msgId, userId) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.map((m) => (m.id === msgId
          ? { ...m, readBy: Array.from(new Set([...(m.readBy ?? []), userId])) }
          : m))),
      })),

      appendCallRecord: (sessionId, mode, result, duration) => {
        const label = result === 'ended' ? `通话时长 ${duration}s` : result === 'missed' ? '未接听' : '已取消';
        set((state) => ({
          messages: { ...state.messages, [sessionId]: [...(state.messages[sessionId] ?? []), newMessage({ type: 'call', mode, result, duration, text: label })] },
          sessions: touch(state.sessions, sessionId),
        }));
      },

      publishVote: (sessionId, vote) => {
        const id = uid('m');
        set((state) => ({
          messages: { ...state.messages, [sessionId]: [...(state.messages[sessionId] ?? []), newMessage({ id, type: 'vote', text: vote.title, vote })] },
          sessions: touch(state.sessions, sessionId),
        }));
        return id;
      },

      submitVote: (sessionId, msgId, optionIds) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.map((m) => {
          if (m.id !== msgId || !m.vote || m.vote.ended) return m;
          const options = m.vote.options.map((o) => ({
            ...o,
            voters: optionIds.includes(o.id)
              ? Array.from(new Set([...o.voters.filter((v) => v !== ME_ID), ME_ID]))
              : o.voters.filter((v) => v !== ME_ID),
          }));
          return { ...m, vote: { ...m.vote, options } };
        })),
      })),

      endVote: (sessionId, msgId) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.map((m) => (m.id === msgId && m.vote ? { ...m, vote: { ...m.vote, ended: true } } : m))),
      })),

      publishChain: (sessionId, chain) => {
        const id = uid('m');
        set((state) => ({
          messages: { ...state.messages, [sessionId]: [...(state.messages[sessionId] ?? []), newMessage({ id, type: 'chain', text: chain.title, chain })] },
          sessions: touch(state.sessions, sessionId),
        }));
        return id;
      },

      upsertChainItem: (sessionId, msgId, text) => set((state) => ({
        messages: patchMessages(state, sessionId, (list) => list.map((m) => {
          if (m.id !== msgId || !m.chain) return m;
          const items = m.chain.items.filter((i) => i.from !== ME_ID);
          items.push({ id: uid('c'), from: ME_ID, text });
          return { ...m, chain: { ...m.chain, items } };
        })),
      })),

      createTopic: (sessionId, msgId, title) => {
        const state = get();
        const session = state.sessions.find((s) => s.id === sessionId);
        const source = (state.messages[sessionId] ?? []).find((m) => m.id === msgId);
        const topicId = uid('topic');
        if (!session || session.type !== 'group' || !source) return '';
        const name = (title ?? source.text ?? messagePreview(source)).slice(0, 30);
        const topic: Topic = {
          id: topicId,
          groupId: session.targetId,
          sessionId,
          sourceMsgId: msgId,
          title: name,
          creator: ME_ID,
          members: Array.from(new Set([ME_ID, source.from])),
          replies: [],
        };
        set((s) => ({
          topics: { ...s.topics, [topicId]: topic },
          messages: patchMessages(s, sessionId, (list) => list
            .map((m) => (m.id === msgId ? { ...m, topicId } : m))
            .concat(systemMessage(`${displayName(s, ME_ID)} 创建了话题「${name}」`, topicId))),
          sessions: touch(s.sessions, sessionId),
        }));
        return topicId;
      },

      replyTopic: (topicId, text) => set((state) => {
        const topic = state.topics[topicId];
        if (!topic || !topic.members.includes(ME_ID)) return {};
        return {
          topics: {
            ...state.topics,
            [topicId]: {
              ...topic,
              replies: [...topic.replies, { id: uid('r'), from: ME_ID, text, time: nowTime(), ts: Date.now() }],
            },
          },
        };
      }),

      updateTopicTitle: (topicId, title) => set((state) => ({
        topics: state.topics[topicId] ? { ...state.topics, [topicId]: { ...state.topics[topicId], title: title.slice(0, 30) } } : state.topics,
      })),

      leaveTopic: (topicId) => set((state) => ({
        topics: state.topics[topicId]
          ? { ...state.topics, [topicId]: { ...state.topics[topicId], members: state.topics[topicId].members.filter((m) => m !== ME_ID) } }
          : state.topics,
      })),

      destroyTopic: (topicId) => set((state) => {
        const topic = state.topics[topicId];
        if (!topic) return {};
        const next = { ...state.topics };
        delete next[topicId];
        return {
          topics: next,
          messages: patchMessages(state, topic.sessionId, (list) => list.map((m) => (m.topicId === topicId ? { ...m, topicId: undefined } : m))),
        };
      }),

      addTopicMembers: (topicId, userIds) => set((state) => ({
        topics: state.topics[topicId]
          ? { ...state.topics, [topicId]: { ...state.topics[topicId], members: Array.from(new Set([...state.topics[topicId].members, ...userIds])) } }
          : state.topics,
      })),

      createGroup: (name, memberIds) => {
        const groupId = uid('g');
        const sessionId = `s-${groupId}`;
        const members = Array.from(new Set([ME_ID, ...memberIds]));
        const group: Group = normalizeGroup({
          id: groupId,
          name: name.trim() || '新建群聊',
          owner: ME_ID,
          admins: [],
          notice: '',
          members,
          type: '普通群',
          joinMode: 'approve',
          joinSetting: 'approve',
          searchable: true,
          memberCap: 500,
          muteAll: false,
          muted: [],
          allowlist: [],
          blacklist: [],
          nicks: {},
          files: [],
        });
        const session: Session = {
          id: sessionId,
          type: 'group',
          targetId: groupId,
          unread: 0,
          pinned: false,
          starred: false,
          mute: false,
          hidden: false,
          lastTime: nowTime(),
          lastTs: Date.now(),
          lastReadTs: Date.now(),
          pins: [],
        };
        set((state) => ({
          groups: [...state.groups, group],
          sessions: [session, ...state.sessions],
          messages: {
            ...state.messages,
            [sessionId]: [systemMessage(`${displayName(state, ME_ID)} 创建了群聊「${group.name}」，成员 ${members.length} 人`)],
          },
        }));
        return { groupId, sessionId };
      },

      updateGroup: (groupId, patch) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, ...patch } : g)),
      })),

      addGroupMembers: (groupId, userIds) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId
          ? { ...g, members: Array.from(new Set([...g.members, ...userIds.filter((id) => !g.blacklist.includes(id))])) }
          : g)),
        messages: addGroupSystem(state, groupId, `邀请 ${userIds.length} 位成员加入群聊`),
      })),

      removeGroupMember: (groupId, userId) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId && g.owner !== userId
          ? { ...g, members: g.members.filter((id) => id !== userId), admins: g.admins.filter((id) => id !== userId) }
          : g)),
      })),

      setGroupAdmin: (groupId, userId, on) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId
          ? { ...g, admins: on ? Array.from(new Set([...g.admins, userId])) : g.admins.filter((id) => id !== userId) }
          : g)),
      })),

      transferOwner: (groupId, userId) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId
          ? { ...g, owner: userId, admins: Array.from(new Set([...g.admins.filter((id) => id !== userId), ME_ID])) }
          : g)),
      })),

      toggleMuteAll: (groupId) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, muteAll: !g.muteAll } : g)),
      })),

      muteGroupMember: (groupId, userId, on) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId && g.owner !== userId
          ? { ...g, muted: on ? Array.from(new Set([...g.muted, userId])) : g.muted.filter((id) => id !== userId) }
          : g)),
      })),

      setGroupNick: (groupId, userId, nick) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, nicks: { ...(g.nicks ?? {}), [userId]: nick } } : g)),
      })),

      setGroupJoinSetting: (groupId, patch) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId
          ? { ...g, ...patch, joinMode: patch.joinSetting === 'all' ? 'qr' : 'approve' }
          : g)),
      })),

      addGroupFile: (groupId, file) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId
          ? { ...g, files: [...g.files, { ...file, id: uid('f'), ts: Date.now() }] }
          : g)),
        messages: addGroupSystem(state, groupId, `上传了群文件「${file.name}」`),
      })),

      removeGroupFile: (groupId, fileId) => set((state) => ({
        groups: state.groups.map((g) => (g.id === groupId ? { ...g, files: g.files.filter((f) => f.id !== fileId) } : g)),
      })),

      leaveGroup: (groupId) => set((state) => {
        const group = state.groups.find((g) => g.id === groupId);
        if (!group || group.owner === ME_ID) return {};
        return {
          groups: state.groups.map((g) => (g.id === groupId
            ? { ...g, members: g.members.filter((id) => id !== ME_ID), admins: g.admins.filter((id) => id !== ME_ID) }
            : g)),
          sessions: state.sessions.map((s) => (s.targetId === groupId ? { ...s, hidden: true, unread: 0 } : s)),
          messages: addGroupSystem(state, groupId, `${displayName(state, ME_ID)} 退出了群聊`),
        };
      }),

      dissolveGroup: (groupId) => set((state) => ({
        groups: state.groups.filter((g) => g.id !== groupId),
        sessions: state.sessions.map((s) => (s.targetId === groupId ? { ...s, hidden: true, unread: 0 } : s)),
      })),

      approveJoinRequest: (id) => set((state) => {
        const req = state.joinRequests.find((r) => r.id === id);
        if (!req || req.status !== 'pending') return {};
        return {
          joinRequests: state.joinRequests.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)),
          groups: state.groups.map((g) => (g.id === req.groupId ? { ...g, members: Array.from(new Set([...g.members, req.userId])) } : g)),
          messages: addGroupSystem(state, req.groupId, `${displayName(state, req.userId)} 通过申请加入群聊`),
        };
      }),

      rejectJoinRequest: (id) => set((state) => ({
        joinRequests: state.joinRequests.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)),
      })),

      setContactNote: (contactId, note) => set((state) => ({ notes: { ...state.notes, [contactId]: note } })),

      toggleContactStar: (contactId) => set((state) => ({
        contacts: state.contacts.map((c) => (c.id === contactId ? { ...c, starred: !c.starred } : c)),
      })),

      resetDemoData: () => set(() => ({ ...buildInitialState() })),
    }),
    {
      name: IM_STORAGE_KEY,
      version: IM_STORAGE_VERSION,
      migrate: migrateState,
      partialize: persistedOf,
    },
  ),
);

function getSessionOrFallback(state: ImState, sessionId: string): Session {
  return state.sessions.find((s) => s.id === sessionId) ?? {
    id: sessionId, type: 'single', targetId: sessionId, unread: 0, lastTime: '', pins: [],
  };
}

function addGroupSystem(state: ImState, groupId: string, text: string): Record<string, Message[]> {
  const sid = state.sessions.find((s) => s.type === 'group' && s.targetId === groupId)?.id;
  if (!sid) return state.messages;
  return { ...state.messages, [sid]: [...(state.messages[sid] ?? []), systemMessage(text)] };
}

/** 供非 React 环境读取当前快照 */
export function imSnapshot(): ImSnapshot {
  return persistedOf(imStore.getState());
}

export function sessionLastLabel(ts?: number): string {
  return timeLabel(ts);
}

export const ME_NAME = ME.name;

/** Vue 组件订阅：返回响应式 state，selectors 全部以 state.value 为输入 */
export function useImState() {
  const state = shallowRef<ImState>(imStore.getState());
  const unsubscribe = imStore.subscribe((next) => { state.value = next; });
  onScopeDispose(unsubscribe);
  return state;
}
