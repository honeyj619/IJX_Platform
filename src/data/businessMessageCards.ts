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
