import { MAIN_USER_NAME, getDemoPerson } from './people';

export type WorkItemStatus = '推进中' | '风险中' | '待填报' | '已完成';
export type WorkItemType = '领导交办' | '专项推进' | '跨部门协同' | '项目事项';
export type WorkItemTeamType = '部门' | '处室' | '项目组' | '项目团队';
export type WorkItemSourceType = '事项填报' | '工作汇报' | '任务执行记录' | '团队评价' | 'OKR' | 'IM' | '会议纪要' | '日程' | '项目系统';

export type WorkItemSourceRef = {
  id: string;
  type: WorkItemSourceType;
  title: string;
  status: '已接入' | '待接入';
};

export type WorkItemExecutionReport = {
  id: string;
  reporter: string;
  submittedAt: string;
  progress: number;
  summary: string;
  risk: string;
};

export type WorkItemTask = {
  id: string;
  parentId?: string;
  title: string;
  assigner: string;
  assignee: string;
  owner: string;
  due: string;
  status: '未开始' | '进行中' | '已完成' | '延期';
  progress: number;
  executionReports: WorkItemExecutionReport[];
};

export type WorkItemReport = {
  id: string;
  source: WorkItemSourceType;
  teamName: string;
  cycle: string;
  relatedTaskIds: string[];
  sourceRef?: WorkItemSourceRef;
  member: string;
  submittedAt: string;
  thisPeriod: string;
  nextPlan: string;
  risk: string;
};

export type WorkItemComment = {
  id: string;
  author: string;
  targetType: '事项' | '任务' | '事项汇报';
  targetId: string;
  attitude: '建议' | '认可' | '风险' | '疑问';
  content: string;
  createdAt: string;
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
  assistant: string;
  members: string[];
  teamType: WorkItemTeamType;
  teamName: string;
  reportCycle: string;
  deadline: string;
  progress: number;
  riskLevel: '正常' | '关注' | '风险';
  description: string;
  okrLink?: string;
  okrLinks: string[];
  sourceRefs: WorkItemSourceRef[];
  latestReport: string;
  tasks: WorkItemTask[];
  reports: WorkItemReport[];
  comments: WorkItemComment[];
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
    assistant: getDemoPerson(3),
    members: [MAIN_USER_NAME, getDemoPerson(3), getDemoPerson(8), getDemoPerson(16)],
    teamType: '部门',
    teamName: '信息管理部',
    reportCycle: '2026年第31周',
    deadline: '2026-07-31',
    progress: 72,
    riskLevel: '正常',
    description: '围绕员工高频入口、数据卡片和移动适配完成门户体验优化，形成可复用的门户卡片规范。',
    okrLink: 'O1 提升员工数字化办公效率',
    okrLinks: ['O1 提升员工数字化办公效率', 'KR3 接入工作汇报、OKR和AI助手入口'],
    sourceRefs: [
      { id: 'src-portal-report', type: '工作汇报', title: '第31周门户体验优化周报', status: '已接入' },
      { id: 'src-portal-calendar', type: '日程', title: '门户体验评审会议', status: '待接入' },
      { id: 'src-portal-im', type: 'IM', title: '门户入口调整沟通记录', status: '待接入' },
    ],
    latestReport: '已完成常用功能入口梳理，待验证卡片联动配置。',
    tasks: [
      { id: 'task-portal-1', title: '梳理门户卡片配置项', assigner: MAIN_USER_NAME, assignee: MAIN_USER_NAME, owner: MAIN_USER_NAME, due: '今天 18:00', status: '进行中', progress: 80, executionReports: [{ id: 'exec-portal-1', reporter: MAIN_USER_NAME, submittedAt: '2026-07-22 17:20', progress: 80, summary: '已完成卡片配置项和入口联动规则整理。', risk: '暂无' }] },
      { id: 'task-portal-1-1', parentId: 'task-portal-1', title: '补齐待办与进度入口说明', assigner: MAIN_USER_NAME, assignee: MAIN_USER_NAME, owner: MAIN_USER_NAME, due: '今天 16:00', status: '进行中', progress: 65, executionReports: [{ id: 'exec-portal-1-1', reporter: MAIN_USER_NAME, submittedAt: '2026-07-22 16:10', progress: 65, summary: '已补充待办与事项进度入口说明初稿。', risk: '需确认移动端表达' }] },
      { id: 'task-portal-2', title: '验证常用功能固定入口', assigner: MAIN_USER_NAME, assignee: getDemoPerson(3), owner: getDemoPerson(3), due: '明天 12:00', status: '进行中', progress: 60, executionReports: [{ id: 'exec-portal-2', reporter: getDemoPerson(3), submittedAt: '2026-07-22 16:20', progress: 60, summary: '完成常用入口清单核对。', risk: '需确认入口数量' }] },
      { id: 'task-portal-3', title: '补充移动端适配检查', assigner: getDemoPerson(3), assignee: getDemoPerson(8), owner: getDemoPerson(8), due: '周五', status: '未开始', progress: 20, executionReports: [] },
    ],
    reports: [
      { id: 'report-portal-1', source: '事项填报', teamName: '信息管理部', cycle: '2026年第31周', relatedTaskIds: ['task-portal-1', 'task-portal-1-1'], member: MAIN_USER_NAME, submittedAt: '2026-07-22 17:40', thisPeriod: '完成工作门户卡片联动方案，明确待办与事项进度只做摘要入口。', nextPlan: '补齐个人门户内事项交互，联通任务和汇报数据。', risk: '暂无' },
      { id: 'report-portal-2', source: '工作汇报', teamName: '信息管理部', cycle: '2026年第31周', relatedTaskIds: ['task-portal-2'], sourceRef: { id: 'src-portal-report', type: '工作汇报', title: '第31周门户体验优化周报', status: '已接入' }, member: getDemoPerson(3), submittedAt: '2026-07-22 16:20', thisPeriod: '完成常用功能入口清单核对。', nextPlan: '继续补充固定入口配置规则。', risk: '需确认移动端入口数量' },
    ],
    comments: [
      { id: 'comment-portal-1', author: getDemoPerson(8), targetType: '事项', targetId: 'wi-portal-upgrade', attitude: '建议', content: '移动端入口建议保留两个高频动作，避免首屏拥挤。', createdAt: '2026-07-22 18:05' },
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
    assistant: MAIN_USER_NAME,
    members: [MAIN_USER_NAME, getDemoPerson(7), getDemoPerson(12), getDemoPerson(17)],
    teamType: '项目组',
    teamName: '汇报与OKR联动项目组',
    reportCycle: '2026年第31周',
    deadline: '2026-08-08',
    progress: 45,
    riskLevel: '关注',
    description: '以工作汇报和 OKR 为数据来源，验证如意工作参谋的取数、总结和复盘链路。',
    okrLink: 'O2 建立目标到成果表达闭环',
    okrLinks: ['O2 建立目标到成果表达闭环', 'KR1 完成工作汇报与OKR联动能力'],
    sourceRefs: [
      { id: 'src-okr-report', type: '工作汇报', title: 'OKR拆解周报模板样例', status: '已接入' },
      { id: 'src-okr-okr', type: 'OKR', title: 'O2/KR1 目标进展', status: '待接入' },
      { id: 'src-okr-meeting', type: '会议纪要', title: 'OKR数据口径评审纪要', status: '待接入' },
    ],
    latestReport: '本周需补充历史汇报样例和 KR 进度口径。',
    tasks: [
      { id: 'task-report-1', title: '确认 KR 进度字段口径', assigner: getDemoPerson(7), assignee: getDemoPerson(12), owner: getDemoPerson(12), due: '今天 17:00', status: '进行中', progress: 50, executionReports: [{ id: 'exec-report-1', reporter: getDemoPerson(12), submittedAt: '2026-07-21 18:10', progress: 50, summary: '已梳理 OKR 统计视图里 O 与 KR 的层级关系。', risk: '部分系统暂无可用数据' }] },
      { id: 'task-report-2', title: '整理汇报助手取数样例', assigner: getDemoPerson(7), assignee: MAIN_USER_NAME, owner: MAIN_USER_NAME, due: '明天 18:00', status: '未开始', progress: 15, executionReports: [] },
      { id: 'task-report-2-1', parentId: 'task-report-2', title: '补充最近两周汇报样例', assigner: MAIN_USER_NAME, assignee: MAIN_USER_NAME, owner: MAIN_USER_NAME, due: '明天 12:00', status: '未开始', progress: 0, executionReports: [] },
      { id: 'task-report-3', title: '输出参谋总结样式建议', assigner: getDemoPerson(7), assignee: getDemoPerson(17), owner: getDemoPerson(17), due: '周五', status: '进行中', progress: 65, executionReports: [{ id: 'exec-report-3', reporter: getDemoPerson(17), submittedAt: '2026-07-22 11:00', progress: 65, summary: '已输出参谋总结样式建议第一版。', risk: '需和周报入口统一' }] },
    ],
    reports: [
      { id: 'report-okr-1', source: '工作汇报', teamName: '汇报与OKR联动项目组', cycle: '2026年第31周', relatedTaskIds: ['task-report-1'], sourceRef: { id: 'src-okr-report', type: '工作汇报', title: 'OKR拆解周报模板样例', status: '已接入' }, member: getDemoPerson(12), submittedAt: '2026-07-21 18:10', thisPeriod: '已梳理 OKR 统计视图里 O 与 KR 的层级关系。', nextPlan: '补充 KR 当前进展字段。', risk: '部分系统暂无可用数据' },
    ],
    comments: [
      { id: 'comment-okr-1', author: MAIN_USER_NAME, targetType: '事项汇报', targetId: 'report-okr-1', attitude: '建议', content: '取数样例需要和事项汇报字段保持一致，避免后续统计重复。', createdAt: '2026-07-22 09:15' },
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
    assistant: MAIN_USER_NAME,
    members: [MAIN_USER_NAME, getDemoPerson(9), getDemoPerson(14), getDemoPerson(20)],
    teamType: '处室',
    teamName: 'IT服务处',
    reportCycle: '2026年第31周',
    deadline: '2026-07-26',
    progress: 38,
    riskLevel: '风险',
    description: '针对员工 IT 服务需求，建立从受理、派单、处理到反馈的闭环跟踪。',
    okrLinks: [],
    sourceRefs: [
      { id: 'src-it-task', type: '任务执行记录', title: '权限审批接口联调任务记录', status: '已接入' },
      { id: 'src-it-system', type: '项目系统', title: 'ITSM需求响应数据', status: '待接入' },
      { id: 'src-it-im', type: 'IM', title: '审批接口联调沟通记录', status: '待接入' },
    ],
    latestReport: '权限审批接口仍未完成联调，影响本周试运行。',
    tasks: [
      { id: 'task-it-1', title: '补充 VPN 解锁流程说明', assigner: getDemoPerson(9), assignee: getDemoPerson(14), owner: getDemoPerson(14), due: '今天 16:00', status: '已完成', progress: 100, executionReports: [{ id: 'exec-it-1', reporter: getDemoPerson(14), submittedAt: '2026-07-22 15:20', progress: 100, summary: 'VPN解锁流程说明已补充完成。', risk: '暂无' }] },
      { id: 'task-it-2', title: '完成权限审批接口联调', assigner: getDemoPerson(9), assignee: MAIN_USER_NAME, owner: MAIN_USER_NAME, due: '今天 20:00', status: '延期', progress: 35, executionReports: [{ id: 'exec-it-2', reporter: MAIN_USER_NAME, submittedAt: '2026-07-22 19:00', progress: 35, summary: '完成 IT 服务助手入口和建议问题梳理。', risk: '接口联调延期，需协调审批系统窗口' }] },
      { id: 'task-it-2-1', parentId: 'task-it-2', title: '确认审批系统测试窗口', assigner: MAIN_USER_NAME, assignee: MAIN_USER_NAME, owner: MAIN_USER_NAME, due: '今天 18:00', status: '延期', progress: 20, executionReports: [{ id: 'exec-it-2-1', reporter: MAIN_USER_NAME, submittedAt: '2026-07-22 18:00', progress: 20, summary: '已联系审批系统负责人，等待窗口确认。', risk: '测试窗口未锁定' }] },
      { id: 'task-it-3', title: '整理 ITSM 常见问题入口', assigner: MAIN_USER_NAME, assignee: getDemoPerson(20), owner: getDemoPerson(20), due: '明天 12:00', status: '进行中', progress: 45, executionReports: [] },
    ],
    reports: [
      { id: 'report-it-1', source: '事项填报', teamName: 'IT服务处', cycle: '2026年第31周', relatedTaskIds: ['task-it-2', 'task-it-2-1'], member: MAIN_USER_NAME, submittedAt: '2026-07-22 19:00', thisPeriod: '完成 IT 服务助手入口和建议问题梳理。', nextPlan: '推进权限审批接口联调。', risk: '接口联调延期，需协调审批系统窗口' },
    ],
    comments: [
      { id: 'comment-it-1', author: getDemoPerson(9), targetType: '任务', targetId: 'task-it-2', attitude: '风险', content: '请优先同步审批接口窗口，风险说明会在事项汇报中持续更新。', createdAt: '2026-07-22 19:30' },
    ],
    timeline: [
      { id: 'time-it-1', actor: getDemoPerson(9), action: '标记接口联调风险', time: '2026-07-22 15:40' },
      { id: 'time-it-2', actor: MAIN_USER_NAME, action: '提交事项汇报', time: '2026-07-22 19:00' },
    ],
  },
  {
    id: 'wi-knowledge',
    title: '客服知识库质检闭环',
    type: '项目事项',
    status: '推进中',
    owner: getDemoPerson(16),
    assistant: MAIN_USER_NAME,
    members: [getDemoPerson(16), getDemoPerson(17), MAIN_USER_NAME],
    teamType: '项目团队',
    teamName: '客服知识库质检团队',
    reportCycle: '2026年8月',
    deadline: '2026-08-15',
    progress: 68,
    riskLevel: '正常',
    description: '围绕客服知识库内容质量，建立问题样本归类、知识条目补齐和质检回归验证流程。',
    okrLink: 'O1 客服知识库质检闭环',
    okrLinks: ['O1 客服知识库质检闭环'],
    sourceRefs: [
      { id: 'src-kb-report', type: '工作汇报', title: '客服知识库质检周报', status: '已接入' },
      { id: 'src-kb-project', type: '项目系统', title: '知识库质检样本库', status: '待接入' },
    ],
    latestReport: '问题样本已完成归类，知识条目补齐推进中。',
    tasks: [
      { id: 'task-kb-1', title: '问题样本归类', assigner: getDemoPerson(16), assignee: getDemoPerson(16), owner: getDemoPerson(16), due: '已完成', status: '已完成', progress: 100, executionReports: [{ id: 'exec-kb-1', reporter: getDemoPerson(16), submittedAt: '2026-07-22 14:10', progress: 100, summary: '完成首批问题样本归类。', risk: '暂无' }] },
      { id: 'task-kb-2', title: '知识条目补齐', assigner: getDemoPerson(16), assignee: getDemoPerson(17), owner: getDemoPerson(17), due: '2026-08-02', status: '进行中', progress: 70, executionReports: [{ id: 'exec-kb-2', reporter: getDemoPerson(17), submittedAt: '2026-07-22 16:20', progress: 70, summary: '知识条目补齐推进中。', risk: '暂无' }] },
      { id: 'task-kb-2-1', parentId: 'task-kb-2', title: '补齐投诉类高频条目', assigner: getDemoPerson(17), assignee: getDemoPerson(17), owner: getDemoPerson(17), due: '2026-08-02', status: '进行中', progress: 55, executionReports: [] },
      { id: 'task-kb-3', title: '质检回归验证', assigner: getDemoPerson(16), assignee: MAIN_USER_NAME, owner: MAIN_USER_NAME, due: '2026-08-10', status: '进行中', progress: 35, executionReports: [] },
    ],
    reports: [
      { id: 'report-kb-1', source: '工作汇报', teamName: '客服知识库质检团队', cycle: '2026年8月', relatedTaskIds: ['task-kb-1', 'task-kb-2'], sourceRef: { id: 'src-kb-report', type: '工作汇报', title: '客服知识库质检周报', status: '已接入' }, member: getDemoPerson(16), submittedAt: '2026-07-22 14:10', thisPeriod: '完成首批问题样本归类。', nextPlan: '补齐高频问题知识条目。', risk: '暂无' },
    ],
    comments: [
      { id: 'comment-kb-1', author: MAIN_USER_NAME, targetType: '任务', targetId: 'task-kb-3', attitude: '建议', content: '回归验证要覆盖已补齐条目和仍待补齐条目两类样本。', createdAt: '2026-07-22 15:05' },
    ],
    timeline: [
      { id: 'time-kb-1', actor: getDemoPerson(16), action: '同步项目进度', time: '2026-07-22 14:10' },
    ],
  },
];
