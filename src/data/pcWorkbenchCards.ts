import type { ContactSelection } from '../components/ContactPicker';

/** 卡片图标（预设兜底） */
export type CardIconConfig = {
  /** 预设图标名（前端注册表内） */
  preset: string;
  /** 背景色 class */
  tone: string;
};

/** 内置组件卡片：绑定唯一且不可修改的 componentKey，渲染复杂组件 */
export type ComponentCardConfig = {
  kind: 'component';
  id: string;
  componentKey: string;
  title: string;
  description: string;
  /** 上传图标（Data URL），优先于模板默认图标 */
  iconUrl?: string;
  availability: 'all' | 'scoped';
  rangeTargets: ContactSelection[];
  /** 卡片主入口（标题/模板主操作），为空不提供 */
  entryUrl?: string;
  /** 右上角"更多"目标，为空隐藏更多按钮 */
  detailUrl?: string;
  /** 首次获得权限且无个人偏好的用户是否默认勾选 */
  defaultVisible: boolean;
  enabled: boolean;
  sort: number;
};

/** 应用入口卡片：不绑定模板，可创建多条，紧凑样式打开主地址 */
export type LinkCardConfig = {
  kind: 'link';
  id: string;
  title: string;
  description: string;
  /** 上传图标（Data URL） */
  iconUrl?: string;
  availability: 'all' | 'scoped';
  rangeTargets: ContactSelection[];
  /** 主地址（必填） */
  entryUrl: string;
  /** 详情地址（可选，"更多"目标） */
  detailUrl?: string;
  defaultVisible: boolean;
  enabled: boolean;
  sort: number;
};

/** PC 工作台卡片配置（判别联合） */
export type PcWorkbenchCardConfig = ComponentCardConfig | LinkCardConfig;

/** 前端组件模板注册项（内置组件卡片绑定，后台只读引用） */
export type PcCardTemplate = {
  componentKey: string;
  name: string;
  description: string;
  defaultIcon: CardIconConfig;
  /** 支持的操作能力 */
  capabilities: Array<'entry' | 'detail' | 'edit-count' | 'create'>;
  /** 模板默认"更多"目标（后台未配置 detailUrl 时兜底） */
  defaultDetailUrl?: string;
};

/** 已注册卡片模板（与个人门户七卡对应；一个模板仅允许一个组件卡片实例） */
export const PC_CARD_TEMPLATES: PcCardTemplate[] = [
  { componentKey: 'stats', name: '数据概览', description: '流程审批、待办、事项进度等数据指标汇总', defaultIcon: { preset: 'trending-up', tone: 'bg-pink-600' }, capabilities: ['entry'] },
  { componentKey: 'documents', name: '今日未读文档', description: '最新未读公文与通知列表', defaultIcon: { preset: 'file-text', tone: 'bg-purple-500' }, capabilities: ['detail', 'edit-count'], defaultDetailUrl: '/pc_client/business' },
  { componentKey: 'calendar', name: '周历', description: '本周日程与会议安排', defaultIcon: { preset: 'calendar', tone: 'bg-pink-700' }, capabilities: ['detail', 'create'], defaultDetailUrl: '/pc_client/calendar' },
  { componentKey: 'systems', name: '常用系统', description: '按使用频率排序的业务系统入口', defaultIcon: { preset: 'layout', tone: 'bg-amber-500' }, capabilities: ['entry'] },
  { componentKey: 'officeApps', name: '常用功能', description: '高频办公功能快捷入口', defaultIcon: { preset: 'clipboard-list', tone: 'bg-indigo-500' }, capabilities: ['entry'] },
  { componentKey: 'duty', name: '今日值班', description: '当日值班岗位与人员', defaultIcon: { preset: 'bell', tone: 'bg-teal-500' }, capabilities: ['detail'] },
  { componentKey: 'courses', name: '临期课程', description: '即将到期的必修课程提醒', defaultIcon: { preset: 'file-text', tone: 'bg-rose-500' }, capabilities: ['detail', 'edit-count'] },
];

const STORAGE_KEY = 'ijx-pc-workbench-cards-v2';
const LEGACY_KEY_V1 = 'ijx-pc-workbench-cards-v1';
export const PC_CARDS_EVENT = 'ijx-pc-workbench-cards-change';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

/** 初始卡片目录：七个内置组件卡片（v2 结构） */
const seedCards = (): PcWorkbenchCardConfig[] => [
  { kind: 'component', id: 'pc-card-stats', componentKey: 'stats', title: '数据概览', description: '流程审批、待办、事项进度等数据指标汇总', iconUrl: '', availability: 'all', rangeTargets: [], entryUrl: '', detailUrl: '', defaultVisible: true, enabled: true, sort: 1 },
  { kind: 'component', id: 'pc-card-documents', componentKey: 'documents', title: '今日未读文档', description: '最新未读公文与通知列表', iconUrl: '', availability: 'all', rangeTargets: [], entryUrl: '', detailUrl: '', defaultVisible: true, enabled: true, sort: 2 },
  { kind: 'component', id: 'pc-card-calendar', componentKey: 'calendar', title: '周历', description: '本周日程与会议安排', iconUrl: '', availability: 'all', rangeTargets: [], entryUrl: '', detailUrl: '', defaultVisible: true, enabled: true, sort: 3 },
  { kind: 'component', id: 'pc-card-systems', componentKey: 'systems', title: '常用系统', description: '按使用频率排序的业务系统入口', iconUrl: '', availability: 'all', rangeTargets: [], entryUrl: '', detailUrl: '', defaultVisible: true, enabled: true, sort: 4 },
  { kind: 'component', id: 'pc-card-office-apps', componentKey: 'officeApps', title: '常用功能', description: '高频办公功能快捷入口', iconUrl: '', availability: 'all', rangeTargets: [], entryUrl: '', detailUrl: '', defaultVisible: true, enabled: true, sort: 5 },
  { kind: 'component', id: 'pc-card-duty', componentKey: 'duty', title: '今日值班', description: '当日值班岗位与人员', iconUrl: '', availability: 'all', rangeTargets: [], entryUrl: '', detailUrl: '', defaultVisible: true, enabled: true, sort: 6 },
  { kind: 'component', id: 'pc-card-courses', componentKey: 'courses', title: '临期课程', description: '即将到期的必修课程提醒', iconUrl: '', availability: 'all', rangeTargets: [], entryUrl: '', detailUrl: '', defaultVisible: true, enabled: true, sort: 7 },
];

/** v1 → v2 迁移：componentKey 记录转 component 卡；blob: 图标回退清空；category/openMode/groupId 丢弃 */
const migrateV1 = (raw: string): PcWorkbenchCardConfig[] | null => {
  try {
    const legacy = JSON.parse(raw);
    if (!Array.isArray(legacy)) return null;
    return legacy
      .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry.componentKey === 'string')
      .map((entry, index) => {
        const iconUrl = typeof entry.iconUrl === 'string' && entry.iconUrl.startsWith('data:') ? entry.iconUrl : '';
        return {
          kind: 'component' as const,
          id: typeof entry.id === 'string' ? entry.id : `pc-card-migrated-${index}`,
          componentKey: entry.componentKey as string,
          title: typeof entry.title === 'string' && entry.title ? entry.title : (entry.componentKey as string),
          description: typeof entry.description === 'string' ? entry.description : '',
          iconUrl,
          availability: entry.availability === 'scoped' ? 'scoped' as const : 'all' as const,
          rangeTargets: Array.isArray(entry.rangeTargets) ? (entry.rangeTargets as ContactSelection[]) : [],
          entryUrl: typeof entry.entryUrl === 'string' ? entry.entryUrl : undefined,
          detailUrl: typeof entry.detailUrl === 'string' ? entry.detailUrl : undefined,
          defaultVisible: entry.defaultVisible !== false,
          enabled: entry.enabled !== false,
          sort: typeof entry.sort === 'number' ? entry.sort : index + 1,
        };
      });
  } catch {
    return null;
  }
};

/** 读取卡片目录（v2；自动迁移 v1；首次落种子） */
export const getPcCards = (): PcWorkbenchCardConfig[] => {
  if (!canUseStorage()) return seedCards();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as PcWorkbenchCardConfig[];
    }
    const legacyRaw = window.localStorage.getItem(LEGACY_KEY_V1);
    if (legacyRaw) {
      const migrated = migrateV1(legacyRaw);
      if (migrated && migrated.length > 0) {
        // 与种子合并：v1 只配置过部分卡时，缺失的内置模板补种，避免组件卡丢失
        const existingKeys = new Set(migrated.filter(card => card.kind === 'component').map(card => card.componentKey));
        const missingSeeds = seedCards().filter(card => card.kind === 'component' && !existingKeys.has(card.componentKey));
        const merged = [...migrated, ...missingSeeds];
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    }
    const seeds = seedCards();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
    return seeds;
  } catch {
    return seedCards();
  }
};

const persist = (cards: PcWorkbenchCardConfig[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  window.dispatchEvent(new Event(PC_CARDS_EVENT));
};

/** 订阅目录变化（自定义事件 + 跨标签 storage 事件） */
export const subscribePcCards = (listener: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener(PC_CARDS_EVENT, listener);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(PC_CARDS_EVENT, listener);
    window.removeEventListener('storage', onStorage);
  };
};

export const upsertPcCards = (cards: PcWorkbenchCardConfig[]) => {
  const current = getPcCards();
  const incomingIds = new Set(cards.map(card => card.id));
  persist([...cards, ...current.filter(card => !incomingIds.has(card.id))]);
};

export const updatePcCard = (id: string, patch: Partial<ComponentCardConfig> | Partial<LinkCardConfig>): PcWorkbenchCardConfig[] => {
  const next = getPcCards().map(card => {
    if (card.id !== id) return card;
    if (card.kind === 'component') return { ...card, ...(patch as Partial<ComponentCardConfig>) } satisfies ComponentCardConfig;
    return { ...card, ...(patch as Partial<LinkCardConfig>) } satisfies LinkCardConfig;
  });
  persist(next);
  return next;
};

export const deletePcCard = (id: string): PcWorkbenchCardConfig[] => {
  const next = getPcCards().filter(card => card.id !== id);
  persist(next);
  return next;
};

// ===== 权限引擎 =====

/** 用户身份上下文（由调用方从通讯录/用户组解析） */
export type UserAccessContext = {
  /** 稳定人员 ID（通讯录 person id） */
  personId: string;
  /** 姓名 */
  name: string;
  /** 当前部门全名（如"信息管理部 / 管理支撑产品处"）及其上级路径片段 */
  departmentPaths: string[];
  /** 用户组数据（含手动组与同步组） */
  userGroups: Array<{ id: string; name: string; members: Array<{ userId?: string; name: string; department?: string; kind?: 'person' | 'department' }> }>;
};

/** 判断用户组是否包含该用户（展开成员与部门） */
const userInGroup = (context: UserAccessContext, group: { members: Array<{ userId?: string; name: string; department?: string; kind?: 'person' | 'department' }> }): boolean => {
  return group.members.some(member => {
    if (member.kind === 'department') {
      return Boolean(member.name) && context.departmentPaths.some(path => path.includes(member.name) || member.name.includes(path));
    }
    if (member.userId) return member.userId === context.personId;
    return member.name === context.name;
  });
};

/** 范围目标是否授权该用户（运行时；失效目标不授权） */
const targetGrantsAccess = (context: UserAccessContext, target: ContactSelection): boolean => {
  if (target.kind === 'person') {
    // ContactSelection id 形如 person:{contactId}
    const contactId = target.id.replace(/^person:/, '');
    return contactId === context.personId || target.name === context.name;
  }
  if (target.kind === 'department') {
    return context.departmentPaths.some(path => path.includes(target.name) || target.name.includes(path));
  }
  if (target.kind === 'user-group') {
    const groupId = target.id.replace(/^group:/, '');
    const group = context.userGroups.find(entry => entry.id === groupId);
    return group ? userInGroup(context, group) : false;
  }
  return false;
};

/** 当前用户是否可访问卡片（all 直通；scoped 需至少一个有效目标授权） */
export const canUserAccessCard = (card: PcWorkbenchCardConfig, context: UserAccessContext): boolean => {
  if (card.availability === 'all') return true;
  return card.rangeTargets.some(target => targetGrantsAccess(context, target));
};

/** 模板查找（component 卡片） */
export const findTemplate = (componentKey: string) => PC_CARD_TEMPLATES.find(template => template.componentKey === componentKey);
