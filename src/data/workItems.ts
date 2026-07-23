import { MAIN_USER_NAME, getDemoPerson } from './people';

export type WorkItemStatus = '推进中' | '风险中' | '待填报' | '已完成';
export type WorkItemType = '领导交办' | '专项推进' | '跨部门协同' | '项目事项';

export type WorkItemTask = {
  id: string;
  title: string;
  owner: string;
  due: string;
  status: '未开始' | '进行中' | '已完成' | '延期';
  progress: number;
};

export type WorkItemReport = {
  id: string;
  member: string;
  submittedAt: string;
  thisPeriod: string;
  nextPlan: string;
  risk: string;
};

export type WorkItemTimeline = {
  id: string;
  actor: string;
  action: string;
  time: string;
};

export type WorkItem = {
  id: string;
  title: string;
  type: WorkItemType;
  status: WorkItemStatus;
  owner: string;
  members: string[];
  deadline: string;
  progress: number;
  riskLevel: '正常' | '关注' | '风险';
  description: string;
  okrLink?: string;
  latestReport: string;
  tasks: WorkItemTask[];
  reports: WorkItemReport[];
  timeline: WorkItemTimeline[];
};

export const workItemTypes: WorkItemType[] = ['领导交办', '专项推进', '跨部门协同', '项目事项'];
export const workItemStatuses: WorkItemStatus[] = ['推进中', '风险中', '待填报', '已完成'];

export const workItems: WorkItem[] = [
  {
    id: 'wi-portal-upgrade',
    title: '工作门户常用功能体验优化',
    type: '专项推进',
    status: '推进中',
    owner: MAIN_USER_NAME,
    members: [MAIN_USER_NAME, getDemoPerson(3), getDemoPerson(8), getDemoPerson(16)],
    deadline: '2026-07-31',
    progress: 72,
    riskLevel: '正常',
    description: '围绕员工高频入口、数据卡片和移动适配完成门户体验优化，形成可复用的门户卡片规范。',
    okrLink: 'O1 提升员工数字化办公效率',
    latestReport: '已完成常用功能入口梳理，待验证卡片联动配置。',
    tasks: [
      { id: 'task-portal-1', title: '梳理门户卡片配置项', owner: MAIN_USER_NAME, due: '今天 18:00', status: '进行中', progress: 80 },
      { id: 'task-portal-2', title: '验证常用功能固定入口', owner: getDemoPerson(3), due: '明天 12:00', status: '进行中', progress: 60 },
      { id: 'task-portal-3', title: '补充移动端适配检查', owner: getDemoPerson(8), due: '周五', status: '未开始', progress: 20 },
    ],
    reports: [
      { id: 'report-portal-1', member: MAIN_USER_NAME, submittedAt: '2026-07-22 17:40', thisPeriod: '完成工作门户卡片联动方案，明确待办与事项进度只做摘要入口。', nextPlan: '补齐事项协同页面交互，联通任务和汇报数据。', risk: '暂无' },
      { id: 'report-portal-2', member: getDemoPerson(3), submittedAt: '2026-07-22 16:20', thisPeriod: '完成常用功能入口清单核对。', nextPlan: '继续补充固定入口配置规则。', risk: '需确认移动端入口数量' },
    ],
    timeline: [
      { id: 'time-portal-1', actor: MAIN_USER_NAME, action: '创建事项并关联 O1', time: '2026-07-20 09:30' },
      { id: 'time-portal-2', actor: getDemoPerson(3), action: '提交常用功能入口核对结果', time: '2026-07-22 16:20' },
      { id: 'time-portal-3', actor: MAIN_USER_NAME, action: '更新事项进度至 72%', time: '2026-07-22 17:40' },
    ],
  },
  {
    id: 'wi-report-okr',
    title: '汇报与 OKR 数据联动试点',
    type: '跨部门协同',
    status: '待填报',
    owner: getDemoPerson(7),
    members: [MAIN_USER_NAME, getDemoPerson(7), getDemoPerson(12), getDemoPerson(17)],
    deadline: '2026-08-08',
    progress: 45,
    riskLevel: '关注',
    description: '以工作汇报和 OKR 为数据来源，验证如意工作参谋的取数、总结和复盘链路。',
    okrLink: 'O2 建立目标到成果表达闭环',
    latestReport: '本周需补充历史汇报样例和 KR 进度口径。',
    tasks: [
      { id: 'task-report-1', title: '确认 KR 进度字段口径', owner: getDemoPerson(12), due: '今天 17:00', status: '进行中', progress: 50 },
      { id: 'task-report-2', title: '整理汇报助手取数样例', owner: MAIN_USER_NAME, due: '明天 18:00', status: '未开始', progress: 15 },
      { id: 'task-report-3', title: '输出参谋总结样式建议', owner: getDemoPerson(17), due: '周五', status: '进行中', progress: 65 },
    ],
    reports: [
      { id: 'report-okr-1', member: getDemoPerson(12), submittedAt: '2026-07-21 18:10', thisPeriod: '已梳理 OKR 统计视图里 O 与 KR 的层级关系。', nextPlan: '补充 KR 当前进展字段。', risk: '部分系统暂无可用数据' },
    ],
    timeline: [
      { id: 'time-report-1', actor: getDemoPerson(7), action: '发起跨部门协同事项', time: '2026-07-19 10:00' },
      { id: 'time-report-2', actor: MAIN_USER_NAME, action: '领取汇报助手样例整理任务', time: '2026-07-21 11:25' },
    ],
  },
  {
    id: 'wi-it-demand',
    title: 'IT 服务需求响应闭环',
    type: '领导交办',
    status: '风险中',
    owner: getDemoPerson(9),
    members: [MAIN_USER_NAME, getDemoPerson(9), getDemoPerson(14), getDemoPerson(20)],
    deadline: '2026-07-26',
    progress: 38,
    riskLevel: '风险',
    description: '针对员工 IT 服务需求，建立从受理、派单、处理到反馈的闭环跟踪。',
    latestReport: '权限审批接口仍未完成联调，影响本周试运行。',
    tasks: [
      { id: 'task-it-1', title: '补充 VPN 解锁流程说明', owner: getDemoPerson(14), due: '今天 16:00', status: '已完成', progress: 100 },
      { id: 'task-it-2', title: '完成权限审批接口联调', owner: MAIN_USER_NAME, due: '今天 20:00', status: '延期', progress: 35 },
      { id: 'task-it-3', title: '整理 ITSM 常见问题入口', owner: getDemoPerson(20), due: '明天 12:00', status: '进行中', progress: 45 },
    ],
    reports: [
      { id: 'report-it-1', member: MAIN_USER_NAME, submittedAt: '2026-07-22 19:00', thisPeriod: '完成 IT 服务助手入口和建议问题梳理。', nextPlan: '推进权限审批接口联调。', risk: '接口联调延期，需协调审批系统窗口' },
    ],
    timeline: [
      { id: 'time-it-1', actor: getDemoPerson(9), action: '标记接口联调风险', time: '2026-07-22 15:40' },
      { id: 'time-it-2', actor: MAIN_USER_NAME, action: '提交事项进度填报', time: '2026-07-22 19:00' },
    ],
  },
  {
    id: 'wi-knowledge',
    title: '客服知识库质检闭环',
    type: '项目事项',
    status: '推进中',
    owner: getDemoPerson(16),
    members: [getDemoPerson(16), getDemoPerson(17), MAIN_USER_NAME],
    deadline: '2026-08-15',
    progress: 68,
    riskLevel: '正常',
    description: '围绕客服知识库内容质量，建立问题样本归类、知识条目补齐和质检回归验证流程。',
    okrLink: 'O1 客服知识库质检闭环',
    latestReport: '问题样本已完成归类，知识条目补齐推进中。',
    tasks: [
      { id: 'task-kb-1', title: '问题样本归类', owner: getDemoPerson(16), due: '已完成', status: '已完成', progress: 100 },
      { id: 'task-kb-2', title: '知识条目补齐', owner: getDemoPerson(17), due: '2026-08-02', status: '进行中', progress: 70 },
      { id: 'task-kb-3', title: '质检回归验证', owner: MAIN_USER_NAME, due: '2026-08-10', status: '进行中', progress: 35 },
    ],
    reports: [
      { id: 'report-kb-1', member: getDemoPerson(16), submittedAt: '2026-07-22 14:10', thisPeriod: '完成首批问题样本归类。', nextPlan: '补齐高频问题知识条目。', risk: '暂无' },
    ],
    timeline: [
      { id: 'time-kb-1', actor: getDemoPerson(16), action: '同步项目进度', time: '2026-07-22 14:10' },
    ],
  },
];

export const workItemPortalTodos = [
  { id: 'wi-todo-1', title: '提交“工作门户常用功能体验优化”事项进度', source: '事项协同', owner: MAIN_USER_NAME, due: '今天 18:00', status: '待填报', progress: 40 },
  { id: 'wi-todo-2', title: '处理“IT 服务需求响应闭环”接口联调任务', source: '事项协同', owner: MAIN_USER_NAME, due: '今天 20:00', status: '风险待处理', progress: 35 },
];

export const workItemTrackedItems = workItems.slice(0, 3).map(item => ({
  id: `tracked-${item.id}`,
  title: item.title,
  source: item.okrLink ? 'okr' as const : 'project' as const,
  owner: item.owner,
  progress: item.progress,
  status: item.okrLink ? '关联OKR' : '项目进展',
  tasks: item.tasks.map(task => ({ name: task.title, owner: task.owner, progress: task.progress })),
}));