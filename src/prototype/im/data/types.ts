/** IM 模块数据类型：静态数据只负责初始化，运行时状态全部由 imStore 持有 */

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'voice'
  | 'file'
  | 'card'
  | 'article'
  | 'emoji'
  | 'call'
  | 'vote'
  | 'chain'
  | 'merge'
  | 'system';

export type MessageStatus = 'sending' | 'sent' | 'failed' | 'read';

export type SessionType = 'single' | 'group' | 'service-inbox' | 'service-ticket' | 'im-app';

export type SessionFilter = 'all' | 'unread' | 'mention';

export interface Contact {
  id: string;
  name: string;
  job?: string;
  dept?: string;
  deptPath?: string;
  phone?: string;
  landline?: string;
  email?: string;
  account?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  company?: string;
  signature?: string;
  isFileHelper?: boolean;
  isServiceAccount?: boolean;
  desc?: string;
  note?: string;
  starred?: boolean;
}

export interface OrgNode {
  id: string;
  name: string;
  children?: OrgNode[];
  members?: string[];
}

export interface GroupFile {
  id: string;
  name: string;
  size: string;
  from: string;
  time: string;
  ts?: number;
}

export type JoinSetting = 'all' | 'approve' | 'admin-only' | 'member-invite';

export interface Group {
  id: string;
  name: string;
  owner: string;
  admins: string[];
  notice: string;
  members: string[];
  type: '普通群' | '部门群' | '公开群';
  joinMode: 'approve' | 'qr';
  joinSetting?: JoinSetting;
  searchable?: boolean;
  memberCap?: number;
  muteAll: boolean;
  muted: string[];
  allowlist?: string[];
  blacklist: string[];
  nicks?: Record<string, string>;
  files: GroupFile[];
}

export interface PinItem {
  msgId: string;
  pinnedAt: number;
}

export interface Session {
  id: string;
  type: SessionType;
  targetId: string;
  unread: number;
  pinned?: boolean;
  starred?: boolean;
  mute?: boolean;
  hidden?: boolean;
  receive?: boolean;
  lastTime: string;
  /** 排序用时间戳；旧种子没有，由 store 初始化补齐 */
  lastTs?: number;
  accountId?: string;
  pins?: PinItem[];
  /** 最近一次已读位置，用于 @消息只看未读区间 */
  lastReadTs?: number;
}

export interface VoteOption {
  id: string;
  text: string;
  voters: string[];
}

export interface VoteData {
  title: string;
  multiple?: boolean;
  anonymous?: boolean;
  ended?: boolean;
  options: VoteOption[];
}

export interface ChainItem {
  id: string;
  from: string;
  text: string;
}

export interface ChainData {
  chainId: string;
  title: string;
  example?: string;
  starter: string;
  items: ChainItem[];
}

export interface MergeItem {
  from?: string;
  fromName?: string;
  type?: MessageType;
  text?: string;
  time?: string;
  merge?: MergeData;
}

export interface MergeData {
  title: string;
  depth?: number;
  items: MergeItem[];
}

export interface QuoteRef {
  id: string;
  from: string;
  type: string;
  text?: string;
}

export interface Message {
  id: string;
  from: string;
  type: MessageType;
  text?: string;
  time?: string;
  ts?: number;
  status?: MessageStatus;
  size?: string;
  duration?: number;
  tone?: 'sky' | 'violet' | 'slate' | 'amber';
  w?: number;
  h?: number;
  card?: { kind: string; id: string };
  url?: string;
  title?: string;
  desc?: string;
  mode?: 'voice' | 'video';
  result?: 'ended' | 'rejected' | 'missed' | 'canceled' | 'ignored';
  vote?: VoteData;
  chain?: ChainData;
  merge?: MergeData;
  quote?: QuoteRef;
  reactions?: Record<string, string[]>;
  readBy?: string[];
  mentions?: string[];
  mentionAll?: boolean;
  edited?: boolean;
  recalled?: boolean;
  burn?: boolean;
  burnRevealed?: boolean;
  burned?: boolean;
  scheduled?: boolean;
  scheduleAt?: string;
  topicId?: string;
}

export interface ServiceAccount {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface ServiceTicket {
  id: string;
  accountId: string;
  fromName: string;
  subject: string;
  lastText: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

export interface ImAppMenu {
  id: string;
  label: string;
  type: 'link' | 'message';
  url?: string;
  text?: string;
  children?: { id: string; label: string; text: string }[];
}

export interface ImApp {
  id: string;
  name: string;
  icon: string;
  desc: string;
  menus: ImAppMenu[];
  receive: boolean;
}

export interface TopicReply {
  id: string;
  from: string;
  text: string;
  time: string;
  ts: number;
}

export interface Topic {
  id: string;
  groupId: string;
  sessionId: string;
  sourceMsgId: string;
  title: string;
  creator: string;
  members: string[];
  replies: TopicReply[];
}

export interface JoinRequest {
  id: string;
  groupId: string;
  userId: string;
  reason: string;
  time: string;
  ts: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SearchFilters {
  sender?: string;
  member?: string;
  chatType?: 'all' | 'single' | 'group';
  msgType?: 'all' | MessageType;
  group?: string;
  date?: string;
  at?: boolean;
}

export interface SearchHit {
  sessionId: string;
  msgId: string;
  from: string;
  text: string;
  time?: string;
  title: string;
}
