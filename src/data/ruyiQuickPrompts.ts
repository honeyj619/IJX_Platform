/**
 * V3.1 统一快捷提问配置
 * 定位整改（2026-11-16）：快捷能力 = 预设问题直发，与插件（结构化参数收集）彻底分离。
 * - 如意空间快捷能力区 / 消息页如意助手快捷入口共用本配置，分别控制展示数量与布局
 * - 插件定义见 ruyiToolPanel.ts / ruyiCapabilities.ts，禁止把插件列表当快捷能力列表用
 */

import type { RuyiCapability } from '../types/ruyi';

export interface RuyiQuickPrompt {
  id: string;
  /** 展示文案 */
  label: string;
  /** 点击后实际发送的预设问题 */
  prompt: string;
  /** 图标键（与 RuyiAssistantHome/RuyiConversationSidebar 的图标映射对齐） */
  icon: string;
  /** 展示入口：如意空间 / PC消息页 */
  visibleIn: Array<'ruyi-zone' | 'pc-im'>;
  /** 关联能力（可选；用于创作类回复附带"前往如意空间继续创作"跳转预选插件） */
  targetCapabilityId?: RuyiCapability['id'];
}

export const ruyiQuickPrompts: RuyiQuickPrompt[] = [
  // 查询类：直接发送问题
  { id: 'q-todo', label: '查询我的待办', prompt: '帮我查询当前待处理的事项', icon: 'search', visibleIn: ['ruyi-zone', 'pc-im'] },
  { id: 'q-schedule', label: '查看今日日程', prompt: '帮我查看今天的日程安排', icon: 'calendar', visibleIn: ['ruyi-zone', 'pc-im'] },
  { id: 'q-approval', label: '查询未处理流程', prompt: '查询我还有哪些流程未处理', icon: 'clipboard', visibleIn: ['ruyi-zone'] },
  { id: 'q-attendance', label: '查询考勤', prompt: '帮我查询最近的考勤情况', icon: 'clock', visibleIn: ['ruyi-zone'] },
  { id: 'q-knowledge', label: '搜索企业知识', prompt: '帮我搜索企业知识库中关于差旅报销标准的内容', icon: 'book', visibleIn: ['ruyi-zone'] },
  // 业务操作类：发送问题后由助手回复卡片/跳转入口
  { id: 'q-meeting', label: '发起会议', prompt: '帮我预约一个会议', icon: 'video', visibleIn: ['ruyi-zone'] },
  { id: 'q-it', label: '提交IT问题', prompt: '我遇到了IT问题，请帮我排查', icon: 'monitor', visibleIn: ['ruyi-zone', 'pc-im'] },
  { id: 'q-feedback', label: '帮助与反馈', prompt: '我想提交一个问题反馈', icon: 'help', visibleIn: ['ruyi-zone', 'pc-im'] },
  // 创作类（消息页入口 → 预设问题；如意空间走插件，不出现在快捷能力区）
  { id: 'q-document', label: '写公文', prompt: '我想起草一份公文，请告诉我需要提供哪些信息', icon: 'file', visibleIn: ['pc-im'], targetCapabilityId: 'document' },
  { id: 'q-presentation', label: '做PPT', prompt: '我想制作一份PPT，请帮我梳理需求', icon: 'presentation', visibleIn: ['pc-im'], targetCapabilityId: 'presentation' },
  { id: 'q-report', label: '工作汇报', prompt: '帮我整理一份工作汇报', icon: 'target', visibleIn: ['pc-im'], targetCapabilityId: 'advisor' },
  { id: 'q-translation', label: '智能翻译', prompt: '我需要翻译一段内容', icon: 'languages', visibleIn: ['pc-im'], targetCapabilityId: 'translation' },
];

/** 按入口过滤 */
export function getQuickPromptsFor(surface: 'ruyi-zone' | 'pc-im'): RuyiQuickPrompt[] {
  return ruyiQuickPrompts.filter((item) => item.visibleIn.includes(surface));
}

export function getQuickPromptById(id: string): RuyiQuickPrompt | undefined {
  return ruyiQuickPrompts.find((item) => item.id === id);
}
