import { MAIN_USER_NAME, getDemoPerson } from './people';
import type { BusinessMessageCardData } from '../types/businessMessageCard';

export const attendanceMessageCard: BusinessMessageCardData = {
  id: 'attendance-monthly-summary',
  category: 'attendance',
  source: '人力资源 E-HR',
  title: '10 月考勤月报',
  subtitle: '统计周期：2026-10-01 至 2026-10-31',
  summary: '本月考勤整体正常，无异常缺勤；有 2 次迟到和 1 天年假记录。',
  status: { label: '总体正常', tone: 'success' },
  metrics: [
    { label: '应出勤', value: '22', unit: '天' },
    { label: '实际出勤', value: '21', unit: '天' },
    { label: '迟到', value: '2', unit: '次', tone: 'warning' },
    { label: '出勤率', value: '95.5', unit: '%', tone: 'success' },
  ],
  fields: [
    { label: '早退', value: '0 次' },
    { label: '请假', value: '年假 1 天' },
  ],
  tags: ['考勤', '月报'],
  timestamp: '昨天 18:00',
  href: '/pc_client/business?system=ehr&view=attendance',
  actions: [
    { id: 'attendance-detail', label: '查看考勤详情', href: '/pc_client/business?system=ehr&view=attendance', variant: 'primary' },
    { id: 'attendance-leave', label: '发起请假', href: '/pc_client/business?system=ehr&action=leave', variant: 'secondary' },
    { id: 'attendance-policy', label: '查看考勤制度', href: '/pc_client/knowledge?doc=attendance-policy', variant: 'link' },
  ],
};

export const approvalMessageCard: BusinessMessageCardData = {
  id: 'approval-pending-summary',
  category: 'approval',
  source: '流程中心',
  title: '待处理流程提醒',
  subtitle: '截至今天 12:21',
  summary: '您有 3 项流程需要处理，其中 2 项已等待超过 24 小时。',
  status: { label: '3 项待处理', tone: 'warning' },
  metrics: [
    { label: '待审批', value: '1', unit: '项', tone: 'warning' },
    { label: '待填写', value: '1', unit: '项' },
    { label: '待确认', value: '1', unit: '项' },
  ],
  items: [
    { id: 'approval-project', title: '项目立项申请', description: `${MAIN_USER_NAME} · 智能办公系统升级`, status: { label: '待审批', tone: 'warning' }, href: '/pc_client/process?processId=1' },
    { id: 'approval-budget', title: '预算调整申请', description: `${getDemoPerson(3)} · Q2 季度预算追加`, status: { label: '待填写', tone: 'info' }, href: '/pc_client/process?processId=3' },
    { id: 'approval-device', title: '设备采购申请', description: `${getDemoPerson(1)} · 新风系统采购`, status: { label: '待确认', tone: 'brand' }, href: '/pc_client/process?processId=4' },
  ],
  tags: ['流程', '待办'],
  timestamp: '12:21',
  href: '/pc_client/process',
  actions: [
    { id: 'approval-open', label: '进入流程中心', href: '/pc_client/process', variant: 'primary' },
  ],
};

export const scheduleMessageCard: BusinessMessageCardData = {
  id: 'schedule-today-summary',
  category: 'schedule',
  source: '日程',
  title: '今明两日日程',
  summary: '今天有 2 个日程，明天有 1 个日程。',
  status: { label: '3 个日程', tone: 'info' },
  items: [
    { id: 'schedule-1', title: '测试2', description: '今天 · 全天', href: '/pc_client/calendar' },
    { id: 'schedule-2', title: '测试', description: '今天 11:30 - 12:00', href: '/pc_client/calendar' },
    { id: 'schedule-3', title: '测试3', description: '明天 · 全天', href: '/pc_client/calendar' },
  ],
  timestamp: '12:00',
  href: '/pc_client/calendar',
  actions: [
    { id: 'schedule-detail', label: '查看日程', href: '/pc_client/calendar', variant: 'primary' },
    { id: 'schedule-create', label: '添加日程', href: '/pc_client/calendar?create=1', variant: 'secondary' },
  ],
};

export const projectMessageCard: BusinessMessageCardData = {
  id: 'project-progress-summary',
  category: 'project',
  source: '项目管理',
  title: '项目进度提醒',
  summary: '您负责的 3 个项目均按计划进行，智能办公系统升级项目当前进度为 60%。',
  status: { label: '进展正常', tone: 'success' },
  metrics: [
    { label: '负责项目', value: '3', unit: '个' },
    { label: '重点项目进度', value: '60', unit: '%', tone: 'success' },
  ],
  timestamp: '昨天 17:30',
  href: '/pc_client/work-items',
  actions: [
    { id: 'project-detail', label: '查看项目', href: '/pc_client/work-items', variant: 'primary' },
  ],
};

export const knowledgeMessageCard: BusinessMessageCardData = {
  id: 'knowledge-recommendation',
  category: 'knowledge',
  source: '知识助手',
  title: '为您推荐 3 篇知识',
  summary: '根据您的搜索和工作内容，推荐以下智能办公相关文章。',
  items: [
    { id: 'knowledge-1', title: '智能办公系统使用指南', description: `${MAIN_USER_NAME} 发布 · 浏览 1,234`, href: '/pc_client/knowledge' },
    { id: 'knowledge-2', title: '2026 年 IT 部门工作计划', description: `${getDemoPerson(0)} 发布 · 浏览 987`, href: '/pc_client/knowledge' },
    { id: 'knowledge-3', title: '企业数据安全最佳实践', description: `${getDemoPerson(1)} 发布 · 浏览 756`, href: '/pc_client/knowledge' },
  ],
  timestamp: '昨天 16:45',
  href: '/pc_client/knowledge',
  actions: [
    { id: 'knowledge-open', label: '进入知识库', href: '/pc_client/knowledge', variant: 'primary' },
  ],
};

/** V3.4：IT 服务排查卡（notice 类；复用 BusinessMessageCard，不新增卡片类型系统） */
export const itServiceMessageCard: BusinessMessageCardData = {
  id: 'it-service-vpn-troubleshoot',
  category: 'notice',
  source: 'IT 服务台',
  title: 'VPN 连接故障排查',
  subtitle: '工单号 #IT-20261118-001 · 处理中',
  summary: '已收到 VPN 无法连接反馈，建议按以下步骤排查；仍未解决可提交帮助与反馈。',
  status: { label: '排查中', tone: 'info' },
  fields: [
    { label: '排查一', value: '检查网络连接与客户端版本' },
    { label: '排查二', value: '重新登录账号后重试' },
    { label: '排查三', value: '清理缓存或更换网络环境' },
  ],
  tags: ['IT', 'VPN'],
  timestamp: '今天 09:41',
  href: '/pc_client/help-feedback',
  actions: [
    { id: 'it-service-detail', label: '查看工单进度', href: '/pc_client/help-feedback', variant: 'primary' },
    { id: 'it-service-feedback', label: '仍未解决，提交反馈', href: '/pc_client/help-feedback?create=1', variant: 'secondary' },
  ],
};

/** V3.5：运营指标卡（metric 结构；复用 BusinessMessageCard） */
export const operationsMessageCard: BusinessMessageCardData = {
  id: 'operations-monthly-metrics',
  category: 'notice',
  source: '运营数据平台',
  title: '本月运营指标概览',
  subtitle: '统计周期：2026 年 11 月',
  summary: '销售额与客户满意度环比上升，交付及时率小幅回落。',
  status: { label: '整体向好', tone: 'success' },
  metrics: [
    { label: '销售额', value: '1,286', unit: '万元', tone: 'success' },
    { label: '环比', value: '+12.5', unit: '%', tone: 'success' },
    { label: '客户满意度', value: '96.8', unit: '%', tone: 'success' },
    { label: '交付及时率', value: '89.2', unit: '%', tone: 'warning' },
  ],
  tags: ['运营', '月报'],
  timestamp: '今天 10:20',
  href: '/pc_client/business?system=ops&view=dashboard',
  actions: [
    { id: 'operations-detail', label: '查看运营看板', href: '/pc_client/business?system=ops&view=dashboard', variant: 'primary' },
  ],
};

/* ============ V3.6 工厂：会议创建结果卡 / 创作工作台入口卡 ============ */

import type { MeetingTaskSlots } from '../types/ruyi';

/**
 * V3.6：会议创建结果卡——按任务 slots 动态生成，创建成功后挂载；
 * 内容与确认摘要同源（标题/日期/时间/参会人/地点），保证"确认什么就创建什么"。
 */
export function buildMeetingCreatedCard(slots: Partial<MeetingTaskSlots>, timestamp?: string): BusinessMessageCardData {
  const title = slots.title || '项目沟通会';
  const dateText = slots.dateText || slots.resolvedDate || '明天';
  const start = slots.startTime || '';
  const end = slots.endTime || '';
  const time = start && end ? `${start} - ${end}` : start || '时间待定';
  const attendees = slots.attendeeNames?.length ? slots.attendeeNames : [];
  const location = slots.location || '线上会议';
  return {
    id: 'meeting-created-card',
    category: 'meeting',
    source: '如意会议',
    title,
    subtitle: `${dateText}${start ? ` ${time}` : ''} · ${location}`,
    summary: attendees.length
      ? `会议已创建，邀请已发送给 ${attendees.length} 位参会人。`
      : '会议已创建。',
    status: { label: '已创建', tone: 'success' },
    fields: [
      { label: '日期', value: dateText, emphasis: true },
      { label: '时间', value: time },
      { label: '参会人', value: attendees.join('、') || '仅自己' },
      { label: '地点', value: location },
    ],
    tags: ['会议', '创建成功'],
    timestamp,
    href: '/pc_client/meetings',
    actions: [
      { id: 'meeting-created-detail', label: '查看会议详情', href: '/pc_client/meetings', variant: 'primary' },
      { id: 'meeting-created-invite', label: '再次邀请参会人', href: '/pc_client/meetings/rooms', variant: 'secondary' },
    ],
  };
}

/** 工作台入口卡定制项：按能力补充副标题/参数字段/标签 */
export interface WorkbenchEntryCardOptions {
  /** 目标成果标题（如"本周项目周报"） */
  resultTitle: string;
  /** 参数摘要字段（如 汇报类型/汇报周期/分析对象） */
  fields?: Array<{ label: string; value: string }>;
  /** 额外标签 */
  tags?: string[];
  /** 卡片时间戳 */
  timestamp?: string;
}

/**
 * V3.6：创作工作台入口卡（通用工厂）——需求确认后挂载；
 * href 带 sourceConversationId，工作台打开即从上下文带入参数。
 */
export function buildWorkbenchEntryCard(
  capName: string,
  workbenchPath: string,
  sourceConversationId: string,
  options: WorkbenchEntryCardOptions,
): BusinessMessageCardData {
  const tags = [capName, ...(options.tags ?? [])];
  return {
    id: `workbench-entry-${sourceConversationId}-${capName}`,
    category: 'workbench',
    source: '如意助手',
    title: `${capName}工作台`,
    subtitle: `目标成果：${options.resultTitle}`,
    summary: '需求已确认，可进入工作台继续配置并生成。',
    status: { label: '待生成', tone: 'info' },
    fields: options.fields?.map((f) => ({ label: f.label, value: f.value })),
    tags,
    timestamp: options.timestamp,
    href: `${workbenchPath}?sourceConversationId=${sourceConversationId}`,
    actions: [
      {
        id: `workbench-entry-${sourceConversationId}-${capName}-enter`,
        label: `进入${capName}`,
        href: `${workbenchPath}?sourceConversationId=${sourceConversationId}`,
        variant: 'primary',
      },
    ],
  };
}
