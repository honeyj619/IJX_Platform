import type { RuyiCapability } from '../types/ruyi';

export const ruyiCapabilities: RuyiCapability[] = [
  {
    id: 'work-query',
    name: '查询工作信息',
    shortDescription: '待办、考勤、知识、运营等即时查询',
    promptPlaceholder: '例如：我还有什么流程没有处理？',
    mode: 'qa',
    producesResult: false,
  },
  {
    id: 'document',
    name: '如意公文',
    shortDescription: '会议纪要、通知、报告等公文创作',
    promptPlaceholder: '例如：帮我写一份会议纪要',
    mode: 'creative',
    producesResult: true,
    workbenchPath: '/pc_client/ruyi-zone/document',
  },
  {
    id: 'presentation',
    name: '如意PPT',
    shortDescription: '汇报、培训等演示文稿创作',
    promptPlaceholder: '例如：做一份AI办公汇报PPT',
    mode: 'creative',
    producesResult: true,
    workbenchPath: '/pc_client/ruyi-zone/presentation',
  },
  {
    id: 'advisor',
    name: '如意参谋',
    shortDescription: '周报、汇报、经营分析等结构化参谋',
    promptPlaceholder: '例如：生成如意空间项目周报',
    mode: 'creative',
    producesResult: true,
    workbenchPath: '/pc_client/ruyi-zone/advisor',
  },
  {
    id: 'translation',
    name: '智能翻译',
    shortDescription: '多语言即时翻译',
    promptPlaceholder: '例如：把“会议改到下午三点”翻译成英文',
    mode: 'instant',
    producesResult: false,
  },
  {
    id: 'it-service',
    name: 'IT服务',
    shortDescription: 'IT问题反馈与指引',
    promptPlaceholder: '例如：VPN无法连接，帮我反馈',
    mode: 'instant',
    producesResult: false,
  },
  {
    id: 'iknow',
    name: 'iKnow',
    shortDescription: '企业知识检索与制度问答',
    promptPlaceholder: '例如：差旅报销标准是什么？',
    mode: 'agent',
    producesResult: false,
    sourceLabel: 'iKnow · 企业知识库',
    sourceHref: '/pc_client/ekb',
  },
  {
    id: 'hr-xiaofu',
    name: '人力小福',
    shortDescription: '考勤、休假、薪酬等人资服务',
    promptPlaceholder: '例如：我今年还有几天年假？',
    mode: 'agent',
    producesResult: false,
    sourceLabel: '人力小福 · 人力服务',
    sourceHref: '/pc_client/enterprise',
  },
];

/** 内置专业能力（不含可调用智能体），用于首页/侧栏的「快捷能力」分区 */
export const ruyiBuiltinCapabilities: RuyiCapability[] = ruyiCapabilities.filter(
  (cap) => cap.mode !== 'agent',
);

export const ruyiCapabilityMap = new Map<string, RuyiCapability>(
  ruyiCapabilities.map((cap) => [cap.id, cap]),
);

export function getRuyiCapability(id: string): RuyiCapability | undefined {
  return ruyiCapabilityMap.get(id);
}

/** 如意空间「智能体调用」注册表：同一会话同一时间只调用一个智能体 */
export type RuyiAgentIconKey = 'sparkles' | 'book-open' | 'users';

export interface RuyiAgent {
  id: 'ruyi-assistant' | 'iknow' | 'hr-xiaofu';
  name: string;
  description: string;
  iconKey: RuyiAgentIconKey;
  /** null 表示回到如意助手普通问答（不激活任何专业能力） */
  capabilityId: RuyiCapability['id'] | null;
  promptPlaceholder: string;
  samplePrompts: string[];
}

export const ruyiAgents: RuyiAgent[] = [
  {
    id: 'ruyi-assistant',
    name: '如意助手',
    description: '企业级协同办公助手，统筹调度各类能力',
    iconKey: 'sparkles',
    capabilityId: null,
    promptPlaceholder: '你想问我什么呢？',
    samplePrompts: [
      '我还有什么流程没有处理？',
      '帮我生成本周工作汇报',
      '帮我预约项目会议室',
      '看看我的 OKR 当前进展',
    ],
  },
  {
    id: 'iknow',
    name: 'iKnow',
    description: '企业知识检索与制度问答',
    iconKey: 'book-open',
    capabilityId: 'iknow',
    promptPlaceholder: '例如：差旅报销标准是什么？',
    samplePrompts: [
      '差旅报销标准是什么？',
      '项目立项申请流程是什么？',
      '智能办公平台使用手册在哪？',
      '公司考勤管理制度有哪些要求？',
    ],
  },
  {
    id: 'hr-xiaofu',
    name: '人力小福',
    description: '考勤、休假、薪酬等人资服务',
    iconKey: 'users',
    capabilityId: 'hr-xiaofu',
    promptPlaceholder: '例如：我今年还有几天年假？',
    samplePrompts: [
      '我今年还有几天年假？',
      '上月考勤有异常吗？',
      '如何申请在职证明？',
      '薪资发放时间是几号？',
    ],
  },
];

/** 按会话当前能力反显智能体；普通问答（null / 内置能力）统一归属如意助手 */
export function getRuyiAgentByCapabilityId(
  capabilityId: RuyiCapability['id'] | null | undefined,
): RuyiAgent {
  if (!capabilityId) return ruyiAgents[0];
  return ruyiAgents.find((agent) => agent.capabilityId === capabilityId) ?? ruyiAgents[0];
}

export function getRuyiAgentById(id: RuyiAgent['id']): RuyiAgent {
  return ruyiAgents.find((agent) => agent.id === id) ?? ruyiAgents[0];
}
