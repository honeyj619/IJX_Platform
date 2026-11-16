import { MAIN_USER_NAME, getDemoPerson } from './people';

export type FeedbackCategory = '功能异常' | '使用咨询' | '体验建议' | '其他';
export type FeedbackSource =
  | 'PC客户端全局入口'
  | 'PC客户端用户菜单'
  | 'PC Web悬浮栏'
  | 'App我的-帮助与反馈'
  | '消息页如意助手'
  | '如意空间';
/** 反馈提交终端：决定管理后台「终端 → 页面路由」展示 */
export type FeedbackClientKind = 'PC_CLIENT' | 'PC_WEB' | 'APP';
export type FeedbackPlatform = 'windows' | 'macos' | 'ios' | 'android' | 'web';
export type FeedbackStatus = '待处理' | '处理中' | '已解决';

/** 终端展示名（管理后台与详情页统一使用） */
export const FEEDBACK_CLIENT_KIND_LABEL: Record<FeedbackClientKind, string> = {
  PC_CLIENT: 'PC 客户端',
  PC_WEB: 'PC Web',
  APP: 'App',
};
export const clientKindLabel = (kind?: FeedbackClientKind): string =>
  (kind && FEEDBACK_CLIENT_KIND_LABEL[kind]) || '未知终端';

export type FeedbackAttachment = {
  id: string;
  name: string;
  size: string;
};

export type FeedbackTimelineItem = {
  id: string;
  title: string;
  description?: string;
  operator: string;
  createdAt: string;
};

export type FeedbackPageContext = {
  title: string;
  path: string;
  capturedAt: string;
  clientKind?: FeedbackClientKind;
  platform?: FeedbackPlatform;
};

export type FeedbackRecord = {
  id: string;
  feedbackNo: string;
  userId: string;
  userName: string;
  departmentName: string;
  category: FeedbackCategory;
  content: string;
  attachments: FeedbackAttachment[];
  source: FeedbackSource;
  /** 提交终端枚举，供管理后台「终端 → 页面路由」展示 */
  clientKind?: FeedbackClientKind;
  /** 提交平台（windows/macos/ios/android/web），App 与客户端演示环境可区分 */
  platform?: FeedbackPlatform;
  status: FeedbackStatus;
  sourceUrl: string;
  sourcePageTitle?: string;
  sourcePagePath?: string;
  sourcePageCapturedAt?: string;
  /** 用户手动录入的功能入口（如"工作台-应用管理-配置"），与系统反显的相关页面互补 */
  featureEntry?: string;
  /** 如意助手来源对话编号（source 为消息页如意助手/如意空间时存在） */
  assistantConversationId?: string;
  /** 反馈绑定的 IM 沟通会话编号（管理员「联系用户」创建） */
  feedbackConversationId?: string;
  /** 提交端版本（演示环境填写，如 i吉祥 2.4.0） */
  clientVersion?: string;
  /** 运行环境补充描述 */
  runtimeInfo?: string;
  /** 兼容旧展示字段：等价于 clientKindLabel(clientKind) */
  clientType: string;
  browserInfo: string;
  handlerName?: string;
  resolution?: string;
  clientRequestId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  timeline: FeedbackTimelineItem[];
};

export type CreateFeedbackInput = Pick<FeedbackRecord, 'category' | 'content' | 'source' | 'clientRequestId'> & {
  attachments?: FeedbackAttachment[];
  sourceUrl?: string;
  conversationId?: string;
  pageContext?: FeedbackPageContext | null;
  featureEntry?: string;
  clientKind?: FeedbackClientKind;
  platform?: FeedbackPlatform;
  clientVersion?: string;
  runtimeInfo?: string;
};

/**
 * 路由脱敏：pathname 规范化 + 查询参数白名单 + 丢弃 hash。
 * 白名单外的参数（token、手机号、邮箱、搜索词、临时授权等）一律不进入反馈记录。
 */
const FEEDBACK_PARAM_WHITELIST = new Set(['platform', 'tab', 'view', 'section']);

export const sanitizeFeedbackPath = (rawPath: string): string => {
  if (!rawPath) return '';
  const [pathAndQuery] = rawPath.split('#');
  const [pathname, query = ''] = pathAndQuery.split('?');
  const normalizedPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  if (!query) return normalizedPath.slice(0, 500);
  const params = new URLSearchParams(query);
  Array.from(params.keys()).forEach(key => {
    if (!FEEDBACK_PARAM_WHITELIST.has(key.toLowerCase())) params.delete(key);
  });
  const safeQuery = params.toString();
  return `${normalizedPath}${safeQuery ? `?${safeQuery}` : ''}`.slice(0, 500);
};

/** 统一页面上下文采集：脱敏路由 + 终端 + 平台 + 采集时间 */
export const captureFeedbackPageContext = (
  title: string,
  rawPath: string,
  clientKind?: FeedbackClientKind,
  platform?: FeedbackPlatform,
): FeedbackPageContext => ({
  title: title.trim() || '未命名页面',
  path: sanitizeFeedbackPath(rawPath),
  capturedAt: new Date().toISOString(),
  clientKind,
  platform,
});

const STORAGE_KEY_V2 = 'ijx-feedback-records-v2';
const STORAGE_KEY_V1 = 'ijx-feedback-records-v1';
export const FEEDBACK_RECORDS_EVENT = 'ijx-feedback-records-change';

const pad = (value: number) => String(value).padStart(2, '0');
const nowText = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

/* ===== v1 → v2 迁移映射 ===== */
const CLIENT_KIND_ALIAS: Record<string, FeedbackClientKind> = {
  'PC 客户端': 'PC_CLIENT', PC_CLIENT: 'PC_CLIENT',
  'PC Web': 'PC_WEB', PC_WEB: 'PC_WEB',
  App: 'APP', APP: 'APP',
};
const SOURCE_ALIAS: Record<string, FeedbackSource> = {
  '页面提交': 'PC客户端用户菜单',
  '企业门户': 'PC Web悬浮栏',
  'App 我的-帮助与反馈': 'App我的-帮助与反馈',
};
const PLATFORM_ALIAS: Record<string, FeedbackPlatform> = {
  windows: 'windows', macos: 'macos', ios: 'ios', android: 'android', web: 'web',
};

const migrateClientKind = (raw?: string): FeedbackClientKind | undefined => {
  if (!raw) return undefined;
  if (CLIENT_KIND_ALIAS[raw]) return CLIENT_KIND_ALIAS[raw];
  if (raw.includes('App')) return 'APP';
  if (raw.includes('客户端')) return 'PC_CLIENT';
  if (raw.includes('Web') || raw.includes('网页')) return 'PC_WEB';
  return undefined;
};

const migratePlatform = (raw?: string): FeedbackPlatform | undefined => (raw && PLATFORM_ALIAS[raw]) || undefined;

/** 单条 v1 记录迁移：保留编号与时间线，缺失新字段补兼容默认值 */
const migrateV1Record = (record: Partial<FeedbackRecord> & Record<string, unknown>): FeedbackRecord => {
  const clientKind = migrateClientKind(record.clientKind as string) || migrateClientKind(record.clientType as string);
  const source = SOURCE_ALIAS[record.source as string] || (record.source as FeedbackSource);
  return {
    id: String(record.id || `feedback-migrated-${Math.random().toString(36).slice(2, 9)}`),
    feedbackNo: String(record.feedbackNo || 'FBUNKNOWN'),
    userId: String(record.userId || 'unknown-user'),
    userName: String(record.userName || '未知用户'),
    departmentName: String(record.departmentName || ''),
    category: (record.category as FeedbackCategory) || '其他',
    content: String(record.content || ''),
    attachments: record.attachments || [],
    source,
    clientKind,
    platform: migratePlatform(record.platform as string),
    status: record.status === ('已处理' as FeedbackStatus) ? '已解决' : ((record.status as FeedbackStatus) || '待处理'),
    sourceUrl: String(record.sourceUrl || record.sourcePagePath || ''),
    sourcePageTitle: record.sourcePageTitle,
    sourcePagePath: record.sourcePagePath,
    sourcePageCapturedAt: record.sourcePageCapturedAt,
    featureEntry: record.featureEntry,
    assistantConversationId: record.assistantConversationId || record.conversationId,
    feedbackConversationId: record.feedbackConversationId,
    clientVersion: record.clientVersion,
    runtimeInfo: record.runtimeInfo,
    clientType: clientKind ? FEEDBACK_CLIENT_KIND_LABEL[clientKind] : String(record.clientType || 'PC 网页'),
    browserInfo: String(record.browserInfo || ''),
    handlerName: record.handlerName,
    resolution: record.resolution,
    clientRequestId: String(record.clientRequestId || `migrated-${record.id}`),
    createdAt: String(record.createdAt || ''),
    updatedAt: String(record.updatedAt || record.createdAt || ''),
    resolvedAt: record.resolvedAt,
    timeline: record.timeline || [],
  } as FeedbackRecord;
};

const buildSeedRecords = (): FeedbackRecord[] => [
  {
    id: 'feedback-seed-1', feedbackNo: 'FB202610240001', userId: 'seed-user-1', userName: getDemoPerson(18), departmentName: '航空安保部 / 安全员中队',
    category: '功能异常', content: '新手机下载不了，下载页面一直提示网络异常。', attachments: [], source: 'PC客户端用户菜单', status: '待处理',
    sourceUrl: '/pc_client/help-feedback', clientKind: 'PC_CLIENT', platform: 'windows', clientType: 'PC 客户端', browserInfo: 'Windows 客户端 / Edge 130', clientVersion: 'i吉祥 2.4.0', clientRequestId: 'seed-1', createdAt: '2026-10-24 20:09', updatedAt: '2026-10-24 20:09',
    timeline: [{ id: 'timeline-seed-1', title: '提交反馈', operator: getDemoPerson(18), createdAt: '2026-10-24 20:09' }],
  },
  {
    id: 'feedback-seed-2', feedbackNo: 'FB202610240002', userId: 'seed-user-2', userName: getDemoPerson(17), departmentName: '车辆管理处',
    category: '功能异常', content: 'i吉祥客户端打不开，启动后停留在白屏。', attachments: [], source: '消息页如意助手', status: '处理中',
    sourceUrl: '/pc_client', assistantConversationId: 'ruyi-assistant', clientKind: 'PC_CLIENT', platform: 'windows', clientType: 'PC 客户端', browserInfo: '应用内核 130', clientVersion: 'i吉祥 2.4.0', handlerName: MAIN_USER_NAME, clientRequestId: 'seed-2', createdAt: '2026-10-24 19:11', updatedAt: '2026-10-25 09:20',
    timeline: [
      { id: 'timeline-seed-2a', title: '提交反馈', operator: getDemoPerson(17), createdAt: '2026-10-24 19:11' },
      { id: 'timeline-seed-2b', title: '已受理', description: '正在排查客户端启动日志。', operator: MAIN_USER_NAME, createdAt: '2026-10-25 09:20' },
    ],
  },
  {
    id: 'feedback-seed-3', feedbackNo: 'FB202610190003', userId: 'main-user', userName: MAIN_USER_NAME, departmentName: '信息管理部 / 管理支撑产品处',
    category: '体验建议', content: '建议日历增加批量调整重复日程的能力，减少逐条修改。', attachments: [], source: '如意空间', status: '已解决',
    sourceUrl: '/pc_client/ruyi-zone', assistantConversationId: 'ruyi-zone-feedback', clientKind: 'PC_WEB', platform: 'web', clientType: 'PC Web', browserInfo: 'Chrome 130 / Windows 11', handlerName: getDemoPerson(11), resolution: '需求已纳入日历体验优化清单，将在后续版本统一评估。', clientRequestId: 'seed-3', createdAt: '2026-10-19 10:47', updatedAt: '2026-10-22 16:30', resolvedAt: '2026-10-22 16:30',
    timeline: [
      { id: 'timeline-seed-3a', title: '提交反馈', operator: MAIN_USER_NAME, createdAt: '2026-10-19 10:47' },
      { id: 'timeline-seed-3b', title: '已受理', operator: getDemoPerson(11), createdAt: '2026-10-20 09:15' },
      { id: 'timeline-seed-3c', title: '已解决', description: '需求已纳入日历体验优化清单，将在后续版本统一评估。', operator: getDemoPerson(11), createdAt: '2026-10-22 16:30' },
    ],
  },
  {
    id: 'feedback-seed-4', feedbackNo: 'FB202611120004', userId: 'seed-user-4', userName: getDemoPerson(19), departmentName: '地面服务部 / 值机服务处',
    category: '功能异常', content: 'App 日程页点进任务详情后返回会回到首页，希望保留在日程页。', attachments: [], source: 'App我的-帮助与反馈', status: '待处理',
    sourceUrl: '/app/prototype/schedule', sourcePageTitle: '日程', sourcePagePath: '/app/prototype/schedule', sourcePageCapturedAt: '2026-11-12T18:20:00.000Z', clientKind: 'APP', platform: 'ios', clientType: 'App', browserInfo: 'i吉祥 App / iOS 18 WebView', clientVersion: 'i吉祥 2.3.6', clientRequestId: 'seed-4', createdAt: '2026-11-12 18:20', updatedAt: '2026-11-12 18:20',
    timeline: [{ id: 'timeline-seed-4a', title: '提交反馈', operator: getDemoPerson(19), createdAt: '2026-11-12 18:20' }],
  },
];

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

/**
 * 读取反馈记录（v2）：
 * - v2 存在 → 直接使用；
 * - v2 不存在且 v1 存在 → 自动迁移（保留编号与时间线）后写入 v2；
 * - 均不存在 → 初始化种子数据；
 * - 存储损坏 → 回退种子数据，不白屏。
 */
export const getFeedbackRecords = (): FeedbackRecord[] => {
  if (!canUseStorage()) return buildSeedRecords();
  try {
    const rawV2 = window.localStorage.getItem(STORAGE_KEY_V2);
    if (rawV2) {
      const records = JSON.parse(rawV2) as FeedbackRecord[];
      if (Array.isArray(records)) return records;
    }
    const rawV1 = window.localStorage.getItem(STORAGE_KEY_V1);
    const migrated = rawV1
      ? (() => {
          try {
            const v1Records = JSON.parse(rawV1);
            if (Array.isArray(v1Records) && v1Records.length) return v1Records.map(migrateV1Record);
          } catch { /* v1 损坏则回退种子 */ }
          return null;
        })()
      : null;
    const seed = migrated || buildSeedRecords();
    window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(seed));
    return seed;
  } catch {
    return buildSeedRecords();
  }
};

const persist = (records: FeedbackRecord[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(records));
  window.dispatchEvent(new Event(FEEDBACK_RECORDS_EVENT));
};

/** 按终端与平台生成运行环境描述 */
const buildClientEnvText = (clientKind?: FeedbackClientKind, platform?: FeedbackPlatform): string => {
  if (clientKind === 'APP') {
    const os = platform === 'android' ? 'Android' : 'iOS';
    return `i吉祥 App / ${os} WebView`;
  }
  if (clientKind === 'PC_CLIENT') {
    const os = platform === 'macos' ? 'macOS' : 'Windows';
    return `${os} 客户端 / 应用内核`;
  }
  if (typeof navigator === 'undefined') return 'PC Web';
  return `${navigator.platform || 'Web'} / ${navigator.userAgent.includes('Edg') ? 'Edge' : 'Chrome'}`;
};

const createFeedbackNo = (records: FeedbackRecord[]) => {
  const now = new Date();
  const prefix = `FB${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const sequence = records.filter(record => record.feedbackNo.startsWith(prefix)).length + 1;
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

export const createFeedback = (input: CreateFeedbackInput): FeedbackRecord => {
  const records = getFeedbackRecords();
  // clientRequestId 幂等：重复提交返回已有记录，不产生第二条
  const duplicate = records.find(record => record.clientRequestId === input.clientRequestId);
  if (duplicate) return duplicate;
  const createdAt = nowText();
  const id = `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const safePath = input.pageContext ? sanitizeFeedbackPath(input.pageContext.path) : sanitizeFeedbackPath(input.sourceUrl || '');
  const record: FeedbackRecord = {
    id,
    feedbackNo: createFeedbackNo(records),
    userId: 'main-user',
    userName: MAIN_USER_NAME,
    departmentName: '信息管理部 / 管理支撑产品处',
    category: input.category,
    content: input.content.trim(),
    attachments: input.attachments || [],
    source: input.source,
    clientKind: input.clientKind,
    platform: input.pageContext?.platform || input.platform,
    status: '待处理',
    sourceUrl: safePath,
    sourcePageTitle: input.pageContext?.title,
    sourcePagePath: safePath || undefined,
    sourcePageCapturedAt: input.pageContext?.capturedAt,
    featureEntry: input.featureEntry?.trim() || undefined,
    assistantConversationId: input.conversationId,
    clientVersion: input.clientVersion,
    runtimeInfo: input.runtimeInfo,
    clientType: input.clientKind ? FEEDBACK_CLIENT_KIND_LABEL[input.clientKind] : 'PC Web',
    browserInfo: buildClientEnvText(input.clientKind, input.pageContext?.platform || input.platform),
    clientRequestId: input.clientRequestId,
    createdAt,
    updatedAt: createdAt,
    timeline: [{ id: `${id}-created`, title: '提交反馈', operator: MAIN_USER_NAME, createdAt }],
  };
  persist([record, ...records]);
  return record;
};

export const getFeedbackRecord = (id: string): FeedbackRecord | null =>
  getFeedbackRecords().find(record => record.id === id) || null;

export const updateFeedbackStatus = (id: string, status: FeedbackStatus, resolution = '') => {
  const updatedAt = nowText();
  const records = getFeedbackRecords().map(record => {
    if (record.id !== id) return record;
    const title = status === '处理中' ? '已受理' : status;
    return {
      ...record,
      status,
      handlerName: MAIN_USER_NAME,
      resolution: status === '已解决' ? resolution.trim() : record.resolution,
      updatedAt,
      resolvedAt: status === '已解决' ? updatedAt : record.resolvedAt,
      timeline: [...record.timeline, {
        id: `${id}-${Date.now()}`,
        title,
        description: resolution.trim() || undefined,
        operator: MAIN_USER_NAME,
        createdAt: updatedAt,
      }],
    };
  });
  persist(records);
  return records.find(record => record.id === id) || null;
};

/** 绑定反馈会话编号（管理员「联系用户」创建会话后回写） */
export const bindFeedbackConversation = (feedbackId: string, feedbackConversationId: string): FeedbackRecord | null => {
  const records = getFeedbackRecords().map(record =>
    record.id === feedbackId ? { ...record, feedbackConversationId, updatedAt: nowText() } : record,
  );
  persist(records);
  return records.find(record => record.id === feedbackId) || null;
};

export const subscribeFeedbackRecords = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY_V2) listener();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(FEEDBACK_RECORDS_EVENT, listener);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(FEEDBACK_RECORDS_EVENT, listener);
  };
};

export const createFeedbackRequestId = (scope = 'feedback') => `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
