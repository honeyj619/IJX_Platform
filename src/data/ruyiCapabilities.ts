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
];

export const ruyiCapabilityMap = new Map<string, RuyiCapability>(
  ruyiCapabilities.map((cap) => [cap.id, cap]),
);

export function getRuyiCapability(id: string): RuyiCapability | undefined {
  return ruyiCapabilityMap.get(id);
}
