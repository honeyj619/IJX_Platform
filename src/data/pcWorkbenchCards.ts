import type { ContactSelection } from '../components/ContactPicker';

/** 卡片图标配置（预设图标+颜色；图片上传为预留） */
export type CardIconConfig = {
  /** 预设图标名（前端注册表内） */
  preset: string;
  /** 背景色 class */
  tone: string;
};

/** PC 工作台卡片配置（后台与个人门户共享） */
export type PcWorkbenchCardConfig = {
  id: string;
  /** 绑定前端注册的组件模板，创建后不可改 */
  componentKey: string;
  title: string;
  description: string;
  icon: CardIconConfig;
  groupId: string;
  availability: 'all' | 'scoped';
  rangeTargets: ContactSelection[];
  /** 卡片主入口（标题/模板主操作），为空不提供 */
  entryUrl?: string;
  /** 右上角"更多"目标，为空隐藏更多按钮 */
  detailUrl?: string;
  openMode: 'auto' | 'browser' | 'native';
  /** 首次获得权限且无个人偏好的用户是否默认勾选 */
  defaultVisible: boolean;
  enabled: boolean;
  sort: number;
};

/** 卡片分组 */
export type PcCardGroupRecord = {
  id: string;
  name: string;
  order: number;
};

/** 前端组件模板注册项（由个人门户维护，后台只读引用） */
export type PcCardTemplate = {
  componentKey: string;
  name: string;
  description: string;
  defaultIcon: CardIconConfig;
  /** 支持的操作能力 */
  capabilities: Array<'entry' | 'detail' | 'edit-count' | 'create'>;
};

/** 已注册卡片模板（与个人门户七卡对应；componentKey 不可重复添加） */
export const PC_CARD_TEMPLATES: PcCardTemplate[] = [
  { componentKey: 'stats', name: '数据概览', description: '流程审批、待办、事项进度等数据指标汇总', defaultIcon: { preset: 'trending-up', tone: 'bg-pink-600' }, capabilities: ['entry'] },
  { componentKey: 'documents', name: '今日未读文档', description: '最新未读公文与通知列表', defaultIcon: { preset: 'file-text', tone: 'bg-purple-500' }, capabilities: ['detail', 'edit-count'] },
  { componentKey: 'calendar', name: '周历', description: '本周日程与会议安排', defaultIcon: { preset: 'calendar', tone: 'bg-pink-700' }, capabilities: ['detail', 'create'] },
  { componentKey: 'systems', name: '常用系统', description: '按使用频率排序的业务系统入口', defaultIcon: { preset: 'layout', tone: 'bg-amber-500' }, capabilities: ['entry'] },
  { componentKey: 'officeApps', name: '常用功能', description: '高频办公功能快捷入口', defaultIcon: { preset: 'clipboard-list', tone: 'bg-indigo-500' }, capabilities: ['entry'] },
  { componentKey: 'duty', name: '今日值班', description: '当日值班岗位与人员', defaultIcon: { preset: 'bell', tone: 'bg-teal-500' }, capabilities: ['detail'] },
  { componentKey: 'courses', name: '临期课程', description: '即将到期的必修课程提醒', defaultIcon: { preset: 'file-text', tone: 'bg-rose-500' }, capabilities: ['detail', 'edit-count'] },
];

export const PC_CARD_GROUPS: PcCardGroupRecord[] = [
  { id: 'pc-group-core', name: '核心卡片', order: 1 },
  { id: 'pc-group-work', name: '办公协同', order: 2 },
  { id: 'pc-group-data', name: '数据与提醒', order: 3 },
];

const STORAGE_KEY = 'ijx-pc-workbench-cards-v1';
const EVENT_NAME = 'ijx-pc-workbench-cards-change';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

/** 初始卡片目录：七张个人门户卡片（pc-stat-* 四条合并为一张"数据概览"） */
const seedCards = (): PcWorkbenchCardConfig[] => [
  { id: 'pc-card-stats', componentKey: 'stats', title: '数据概览', description: '流程审批、待办、事项进度等数据指标汇总', icon: { preset: 'trending-up', tone: 'bg-pink-600' }, groupId: 'pc-group-data', availability: 'all', rangeTargets: [], openMode: 'auto', defaultVisible: true, enabled: true, sort: 1 },
  { id: 'pc-card-documents', componentKey: 'documents', title: '今日未读文档', description: '最新未读公文与通知列表', icon: { preset: 'file-text', tone: 'bg-purple-500' }, groupId: 'pc-group-work', availability: 'all', rangeTargets: [], detailUrl: '/web_client/business', openMode: 'auto', defaultVisible: true, enabled: true, sort: 2 },
  { id: 'pc-card-calendar', componentKey: 'calendar', title: '周历', description: '本周日程与会议安排', icon: { preset: 'calendar', tone: 'bg-pink-700' }, groupId: 'pc-group-core', availability: 'all', rangeTargets: [], detailUrl: '/web_client/calendar', openMode: 'auto', defaultVisible: true, enabled: true, sort: 3 },
  { id: 'pc-card-systems', componentKey: 'systems', title: '常用系统', description: '按使用频率排序的业务系统入口', icon: { preset: 'layout', tone: 'bg-amber-500' }, groupId: 'pc-group-work', availability: 'all', rangeTargets: [], openMode: 'auto', defaultVisible: true, enabled: true, sort: 4 },
  { id: 'pc-card-office-apps', componentKey: 'officeApps', title: '常用功能', description: '高频办公功能快捷入口', icon: { preset: 'clipboard-list', tone: 'bg-indigo-500' }, groupId: 'pc-group-work', availability: 'all', rangeTargets: [], openMode: 'auto', defaultVisible: true, enabled: true, sort: 5 },
  { id: 'pc-card-duty', componentKey: 'duty', title: '今日值班', description: '当日值班岗位与人员', icon: { preset: 'bell', tone: 'bg-teal-500' }, groupId: 'pc-group-data', availability: 'all', rangeTargets: [], openMode: 'auto', defaultVisible: true, enabled: true, sort: 6 },
  { id: 'pc-card-courses', componentKey: 'courses', title: '临期课程', description: '即将到期的必修课程提醒', icon: { preset: 'file-text', tone: 'bg-rose-500' }, groupId: 'pc-group-data', availability: 'all', rangeTargets: [], openMode: 'auto', defaultVisible: true, enabled: true, sort: 7 },
];

/** 读取卡片目录（首次落种子） */
export const getPcCards = (): PcWorkbenchCardConfig[] => {
  if (!canUseStorage()) return seedCards();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeds = seedCards();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
      return seeds;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedCards();
    return parsed as PcWorkbenchCardConfig[];
  } catch {
    return seedCards();
  }
};

const persist = (cards: PcWorkbenchCardConfig[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const subscribePcCards = (listener: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
};

export const upsertPcCards = (cards: PcWorkbenchCardConfig[]) => {
  const current = getPcCards();
  const incomingKeys = new Set(cards.map(card => card.id));
  persist([...cards, ...current.filter(card => !incomingKeys.has(card.id))]);
};

export const updatePcCard = (id: string, patch: Partial<PcWorkbenchCardConfig>): PcWorkbenchCardConfig[] => {
  const next = getPcCards().map(card => card.id === id ? { ...card, ...patch } : card);
  persist(next);
  return next;
};

export const deletePcCard = (id: string): PcWorkbenchCardConfig[] => {
  const next = getPcCards().filter(card => card.id !== id);
  persist(next);
  return next;
};

/** 当前用户是否有权限（原型：全员可用；scoped 时按用户名在目标中判定） */
export const canUserAccessCard = (card: PcWorkbenchCardConfig, userName: string): boolean => {
  if (card.availability === 'all') return true;
  return card.rangeTargets.some(target => target.name === userName);
};

/**
 * 与个人门户偏好（dashboardCards）合并：
 * - 目录为准过滤停用/无权限/未注册
 * - 有个人偏好（按 componentKey 对齐 id）回填 visible/order
 * - 无偏好按 defaultVisible
 */
export const resolvePortalCards = <T,>(
  cards: PcWorkbenchCardConfig[],
  userName: string,
  preference: Array<{ id: string; visible: boolean; order: number }>,
  buildCard: (card: PcWorkbenchCardConfig, visible: boolean, order: number) => T,
): T[] => {
  return cards
    .filter(card => card.enabled && canUserAccessCard(card, userName))
    .filter(card => PC_CARD_TEMPLATES.some(template => template.componentKey === card.componentKey))
    .map(card => {
      const pref = preference.find(item => item.id === card.componentKey);
      const visible = pref ? pref.visible : card.defaultVisible;
      const order = pref ? pref.order : card.sort - 1;
      return buildCard(card, visible, order);
    })
    .sort((a, b) => (a as { order: number }).order - (b as { order: number }).order);
};
