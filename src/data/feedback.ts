import { MAIN_USER_NAME, getDemoPerson } from './people';

export type FeedbackCategory = '功能异常' | '使用咨询' | '体验建议' | '其他';
export type FeedbackSource = '页面提交' | '消息页如意助手' | '如意空间' | '企业门户';
export type FeedbackStatus = '待处理' | '处理中' | '已解决';

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
  status: FeedbackStatus;
  sourceUrl: string;
  sourcePageTitle?: string;
  sourcePagePath?: string;
  sourcePageCapturedAt?: string;
  /** 用户手动录入的功能入口（如"工作台-应用管理-配置"），与系统反显的相关页面互补 */
  featureEntry?: string;
  conversationId?: string;
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
};

const STORAGE_KEY = 'ijx-feedback-records-v1';
export const FEEDBACK_RECORDS_EVENT = 'ijx-feedback-records-change';

const pad = (value: number) => String(value).padStart(2, '0');
const nowText = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const buildSeedRecords = (): FeedbackRecord[] => [
  {
    id: 'feedback-seed-1', feedbackNo: 'FB202610240001', userId: 'seed-user-1', userName: getDemoPerson(18), departmentName: '航空安保部 / 安全员中队',
    category: '功能异常', content: '新手机下载不了，下载页面一直提示网络异常。', attachments: [], source: '页面提交', status: '待处理',
    sourceUrl: '/pc_client/help-feedback', clientType: 'Windows 客户端', browserInfo: 'Edge 130', clientRequestId: 'seed-1', createdAt: '2026-10-24 20:09', updatedAt: '2026-10-24 20:09',
    timeline: [{ id: 'timeline-seed-1', title: '提交反馈', operator: getDemoPerson(18), createdAt: '2026-10-24 20:09' }],
  },
  {
    id: 'feedback-seed-2', feedbackNo: 'FB202610240002', userId: 'seed-user-2', userName: getDemoPerson(17), departmentName: '车辆管理处',
    category: '功能异常', content: 'i吉祥客户端打不开，启动后停留在白屏。', attachments: [], source: '消息页如意助手', status: '处理中',
    sourceUrl: '/pc_client', conversationId: 'ruyi-assistant', clientType: 'Windows 客户端', browserInfo: '应用内核 130', handlerName: MAIN_USER_NAME, clientRequestId: 'seed-2', createdAt: '2026-10-24 19:11', updatedAt: '2026-10-25 09:20',
    timeline: [
      { id: 'timeline-seed-2a', title: '提交反馈', operator: getDemoPerson(17), createdAt: '2026-10-24 19:11' },
      { id: 'timeline-seed-2b', title: '已受理', description: '正在排查客户端启动日志。', operator: MAIN_USER_NAME, createdAt: '2026-10-25 09:20' },
    ],
  },
  {
    id: 'feedback-seed-3', feedbackNo: 'FB202610190003', userId: 'main-user', userName: MAIN_USER_NAME, departmentName: '信息管理部 / 管理支撑产品处',
    category: '体验建议', content: '建议日历增加批量调整重复日程的能力，减少逐条修改。', attachments: [], source: '如意空间', status: '已解决',
    sourceUrl: '/pc_client/ruyi-zone', conversationId: 'ruyi-zone-feedback', clientType: 'PC 网页', browserInfo: 'Chrome 130 / Windows 11', handlerName: getDemoPerson(11), resolution: '需求已纳入日历体验优化清单，将在后续版本统一评估。', clientRequestId: 'seed-3', createdAt: '2026-10-19 10:47', updatedAt: '2026-10-22 16:30', resolvedAt: '2026-10-22 16:30',
    timeline: [
      { id: 'timeline-seed-3a', title: '提交反馈', operator: MAIN_USER_NAME, createdAt: '2026-10-19 10:47' },
      { id: 'timeline-seed-3b', title: '已受理', operator: getDemoPerson(11), createdAt: '2026-10-20 09:15' },
      { id: 'timeline-seed-3c', title: '已解决', description: '需求已纳入日历体验优化清单，将在后续版本统一评估。', operator: getDemoPerson(11), createdAt: '2026-10-22 16:30' },
    ],
  },
];

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

export const getFeedbackRecords = (): FeedbackRecord[] => {
  if (!canUseStorage()) return buildSeedRecords();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = buildSeedRecords();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const records = JSON.parse(raw) as FeedbackRecord[];
    return Array.isArray(records) ? records.map(record => ({
      ...record,
      status: record.status === ('已处理' as FeedbackStatus) ? '已解决' : record.status,
      attachments: record.attachments || [],
      timeline: record.timeline || [],
    })) : buildSeedRecords();
  } catch {
    return buildSeedRecords();
  }
};

const persist = (records: FeedbackRecord[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new Event(FEEDBACK_RECORDS_EVENT));
};

const createFeedbackNo = (records: FeedbackRecord[]) => {
  const now = new Date();
  const prefix = `FB${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const sequence = records.filter(record => record.feedbackNo.startsWith(prefix)).length + 1;
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

export const createFeedback = (input: CreateFeedbackInput): FeedbackRecord => {
  const records = getFeedbackRecords();
  const duplicate = records.find(record => record.clientRequestId === input.clientRequestId);
  if (duplicate) return duplicate;
  const createdAt = nowText();
  const id = `feedback-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
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
    status: '待处理',
    sourceUrl: input.pageContext?.path || input.sourceUrl || '',
    sourcePageTitle: input.pageContext?.title,
    sourcePagePath: input.pageContext?.path,
    sourcePageCapturedAt: input.pageContext?.capturedAt,
    featureEntry: input.featureEntry?.trim() || undefined,
    conversationId: input.conversationId,
    clientType: 'PC 网页',
    browserInfo: typeof navigator !== 'undefined' ? `${navigator.platform || 'Windows'} / ${navigator.userAgent.includes('Edg') ? 'Edge' : 'Chrome'}` : 'PC 网页',
    clientRequestId: input.clientRequestId,
    createdAt,
    updatedAt: createdAt,
    timeline: [{ id: `${id}-created`, title: '提交反馈', operator: MAIN_USER_NAME, createdAt }],
  };
  persist([record, ...records]);
  return record;
};

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

export const subscribeFeedbackRecords = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(FEEDBACK_RECORDS_EVENT, listener);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(FEEDBACK_RECORDS_EVENT, listener);
  };
};

export const createFeedbackRequestId = (scope = 'feedback') => `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
