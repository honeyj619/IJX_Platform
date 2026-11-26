import { contactDirectory } from './contactDirectory';

export const GLOBAL_SEARCH_CATEGORY_ORDER = [
  'people',
  'groups',
  'chat-records',
  'calendar',
  'documents',
  'processes',
  'business-systems',
  'system-apps',
] as const;

export type GlobalSearchCategory = (typeof GLOBAL_SEARCH_CATEGORY_ORDER)[number];
export type SystemAppAnchor = 'common' | 'agents';

export const GLOBAL_SEARCH_CATEGORY_LABELS: Record<GlobalSearchCategory, string> = {
  people: '人员',
  groups: '群聊',
  'chat-records': '聊天记录',
  calendar: '日程',
  documents: '文档',
  processes: '流程',
  'business-systems': '业务系统',
  'system-apps': '系统应用',
};

export type GlobalSearchTarget =
  | {
      type: 'message';
      conversationId?: number;
      conversationName: string;
      conversationKind: 'person' | 'group' | 'assistant';
      messageId?: number;
    }
  | {
      type: 'route';
      path: string;
      entityId?: string | number;
    };

export interface GlobalSearchItem {
  id: string;
  category: GlobalSearchCategory;
  title: string;
  description: string;
  keywords: string[];
  target: GlobalSearchTarget;
  anchor?: SystemAppAnchor;
}

export interface GlobalSearchNavigationState {
  globalSearch?: {
    requestId: string;
    query: string;
    target: GlobalSearchTarget;
    assistantQuery?: string;
  };
}

const peopleItems: GlobalSearchItem[] = contactDirectory.slice(0, 8).map(person => ({
  id: `person-${person.id}`,
  category: 'people',
  title: person.name,
  description: `${person.department} · ${person.title}`,
  keywords: [person.email, person.department, person.title, '人员', '联系人'],
  target: {
    type: 'message',
    conversationName: person.name,
    conversationKind: 'person',
  },
}));

export const globalSearchItems: GlobalSearchItem[] = [
  ...peopleItems,
  {
    id: 'group-duty-20250521',
    category: 'groups',
    title: '20250521公司值班沟通群（86人）',
    description: '',
    keywords: ['值班', '公司', '沟通', '群聊', '保障', '86人'],
    target: { type: 'message', conversationId: 7, conversationName: '20250521公司值班沟通群', conversationKind: 'group' },
  },
  {
    id: 'group-project-platform',
    category: 'groups',
    title: '旅游度假平台项目群（24人）',
    description: '',
    keywords: ['项目', '旅游', '度假', '平台', '群聊', '24人'],
    target: { type: 'message', conversationName: '旅游度假平台项目群', conversationKind: 'group' },
  },
  {
    id: 'group-it',
    category: 'groups',
    title: '信息技术部大群（158人）',
    description: '',
    keywords: ['信息技术部', '技术', '部门', '群聊', '158人'],
    target: { type: 'message', conversationName: '信息技术部大群', conversationKind: 'group' },
  },
  {
    id: 'group-pmo',
    category: 'groups',
    title: 'IT-PMO 协作群（12人）',
    description: '',
    keywords: ['项目', '周报', 'pmo', '协作', '群聊', '12人'],
    target: { type: 'message', conversationName: 'IT-PMO 协作群', conversationKind: 'group' },
  },
  {
    id: 'chat-project-process',
    category: 'chat-records',
    title: '如意助手',
    description: '12 条相关消息',
    keywords: ['项目', '立项', '申请', '流程', '如意助手', '项目立项申请流程'],
    target: { type: 'message', conversationId: 1, conversationName: '如意助手', conversationKind: 'assistant', messageId: 3 },
  },
  {
    id: 'chat-project-form',
    category: 'chat-records',
    title: '如意助手',
    description: '8 条相关消息',
    keywords: ['项目', '立项', '表单', '预算', '负责人', '如意助手', '项目立项申请表单'],
    target: { type: 'message', conversationId: 1, conversationName: '如意助手', conversationKind: 'assistant', messageId: 4 },
  },
  {
    id: 'chat-operation-data',
    category: 'chat-records',
    title: '如意助手',
    description: '5 条相关消息',
    keywords: ['运营', '数据', '公司', '指标', '如意助手', '公司近期运营数据'],
    target: { type: 'message', conversationId: 1, conversationName: '如意助手', conversationKind: 'assistant', messageId: 5 },
  },
  {
    id: 'chat-project-status',
    category: 'chat-records',
    title: '项目管理',
    description: '6 条相关消息',
    keywords: ['项目', '进度', '智能办公', '管理', '项目管理', '智能办公系统项目进度'],
    target: { type: 'message', conversationId: 5, conversationName: '项目管理', conversationKind: 'assistant' },
  },
  {
    id: 'calendar-project-kickoff',
    category: 'calendar',
    title: '项目立项会议',
    description: '诸葛亮 · 2025-05-01 14:00-16:00',
    keywords: ['项目', '立项', '会议', '日程'],
    target: { type: 'route', path: '/pc_client/calendar', entityId: 1 },
  },
  {
    id: 'calendar-duty',
    category: 'calendar',
    title: '值班',
    description: '梁吉力 · 2025-05-22 09:00-18:00',
    keywords: ['值班', '日程', '工作'],
    target: { type: 'route', path: '/pc_client/calendar', entityId: 4 },
  },
  {
    id: 'calendar-beijing',
    category: 'calendar',
    title: 'H01253 北京',
    description: '梁吉力 · 2025-05-04 08:00-10:30',
    keywords: ['北京', '出差', '航班', '日程'],
    target: { type: 'route', path: '/pc_client/calendar', entityId: 2 },
  },
  {
    id: 'calendar-shanghai',
    category: 'calendar',
    title: 'H01253 上海',
    description: '梁吉力 · 2025-05-22 13:00-15:30',
    keywords: ['上海', '出差', '航班', '日程'],
    target: { type: 'route', path: '/pc_client/calendar', entityId: 5 },
  },
  ...[
    ['doc-1', '03-人力资源手册', '人力资源', 1],
    ['doc-2', '上海吉祥航空股份有限公司奖励客运运输说明2024年3月版', '客运服务', 2],
    ['doc-3', '上海吉祥航空股份有限公司行李运输规定2024年3月版', '行李运输', 3],
    ['doc-4', '吉祥航空2026航空器引进工作方案', '战略文件', 4],
    ['doc-5', '上海吉祥航空股份有限公司旅客、行李国际运输总条件2024年7月版', '客运服务', 5],
  ].map(([id, title, description, entityId]) => ({
    id: String(id),
    category: 'documents' as const,
    title: String(title),
    description: String(description),
    keywords: ['文档', '知识库', '项目', String(title)],
    target: { type: 'route' as const, path: '/pc_client/ekb', entityId: Number(entityId) },
  })),
  ...[
    [1, '项目立项申请', '待审批 · 梁吉力'],
    [2, '合同签署授权委托书', '待审批 · 郭嘉'],
    [3, '预算调整申请', '已通过 · 关羽'],
    [4, '设备采购申请', '已拒绝 · 曹操'],
  ].map(([entityId, title, description]) => ({
    id: `process-${entityId}`,
    category: 'processes' as const,
    title: String(title),
    description: String(description),
    keywords: ['流程', '审批', '申请', '项目', String(title)],
    target: { type: 'route' as const, path: '/pc_client/process', entityId: Number(entityId) },
  })),
  // 业务系统名称与类别对齐 Business 页 systems 数据（categoryGroups：财务系统/人力系统/综合系统/运行系统/营销系统）
  ...[
    [1, 'BIP系统', '财务系统'],
    [4, '合同管理系统', '财务系统'],
    [6, '致远系统', '财务系统'],
    [19, '企业项目管理平台', '综合系统'],
    [24, '综合数据分析平台', '综合系统'],
    [31, '车辆管理系统', '综合系统'],
  ].map(([entityId, title, description]) => ({
    id: `business-${entityId}`,
    category: 'business-systems' as const,
    title: String(title),
    description: String(description),
    keywords: ['业务系统', String(title), String(description)],
    target: { type: 'route' as const, path: '/pc_client/business', entityId: Number(entityId) },
  })),
  {
    id: 'app-work-report',
    category: 'system-apps',
    anchor: 'common',
    title: '工作汇报',
    description: '常用功能',
    keywords: ['系统应用', '常用功能', '项目周报', '汇报', '查看', '编写', '发送'],
    target: { type: 'route', path: '/pc_client/work-report' },
  },
  {
    id: 'app-calendar',
    category: 'system-apps',
    anchor: 'common',
    title: '日历',
    description: '常用功能',
    keywords: ['系统应用', '常用功能', '会议', '日程', '会议室'],
    target: { type: 'route', path: '/pc_client/calendar' },
  },
  {
    id: 'app-work-portal',
    category: 'system-apps',
    anchor: 'common',
    title: '工作门户',
    description: '常用功能',
    keywords: ['系统应用', '常用功能', '门户', '待办', '审批', '工作事项'],
    target: { type: 'route', path: '/pc_client/enterprise' },
  },
  {
    id: 'app-knowledge',
    category: 'system-apps',
    anchor: 'common',
    title: '知识门户',
    description: '常用功能',
    keywords: ['系统应用', '常用功能', '知识', '文档', '检索', '阅读'],
    target: { type: 'route', path: '/pc_client/ekb' },
  },
  {
    id: 'agent-advisor',
    category: 'system-apps',
    anchor: 'agents',
    title: '如意参谋师',
    description: '智能体',
    keywords: ['系统应用', '智能体', '项目', '汇报', '参谋师', '个人汇报', '生成'],
    target: { type: 'route', path: '/pc_client/ruyi-zone/advisor' },
  },
  {
    id: 'agent-document',
    category: 'system-apps',
    anchor: 'agents',
    title: '如意公文创作',
    description: '智能体',
    keywords: ['系统应用', '智能体', '公文', '写作', '生成', '编辑'],
    target: { type: 'route', path: '/pc_client/ruyi-zone/document' },
  },
  {
    id: 'agent-knowledge',
    category: 'system-apps',
    anchor: 'agents',
    title: '企业知识专家',
    description: '智能体',
    keywords: ['系统应用', '智能体', '知识', '问答', '企业知识'],
    target: { type: 'route', path: '/pc_client/ruyi-zone' },
  },
  {
    id: 'agent-it',
    category: 'system-apps',
    anchor: 'agents',
    title: 'IT服务助手',
    description: '智能体',
    keywords: ['系统应用', '智能体', 'it', '服务', '问题', '咨询'],
    target: { type: 'route', path: '/pc_client/ruyi-zone' },
  },
];

export const searchGlobalItems = (query: string): GlobalSearchItem[] => {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  return globalSearchItems.filter(item =>
    [item.title, item.description, ...item.keywords]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalized),
  );
};
