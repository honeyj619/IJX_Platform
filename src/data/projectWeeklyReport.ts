// 项目周报数据模型：按《智能项目周报生成与分发-用户需求说明书-V3.1》口径设计
// 指标计算规则（BR-03）：完成率 = 周期内已完成数 ÷ 周期内计划总数；健康灯按进度偏差与风险判定

export type HealthLight = 'green' | 'yellow' | 'red';

export interface WeeklyStat {
  id: string;
  name: string;
  /** 展示值，如 43.33% */
  value: string;
  /** 分数说明，如 (13/30)；无记录时为 — */
  fraction: string;
}

export interface GanttStage {
  id: string;
  name: string;
  start: string;
  end: string;
  status: 'done' | 'doing' | 'todo';
  progress: number;
  taskSummary: string;
}

export interface WeeklyWorkItem {
  id: string;
  name: string;
  progress: number;
}

export interface ReportIssue {
  id: string;
  name: string;
  type: string;
  result: string;
  description: string;
  solution: string;
  planDate: string;
  assignee: string;
}

export interface ReportRisk {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  measure: string;
  closeDate: string;
  assignee: string;
}

export interface ReportChange {
  id: string;
  title: string;
  changeType: string;
  level: string;
  approval: string;
}

export interface ProjectWeeklyData {
  projectId: string;
  projectName: string;
  projectCode: string;
  projectLevel: string;
  sponsor: string;
  manager: string;
  itManager: string;
  currentStage: string;
  /** 项目周，如 33 */
  weekNumber: number;
  /** 汇报周期，如 2026-08-03 ~ 2026-08-09 */
  period: string;
  healthLight: HealthLight;
  stats: WeeklyStat[];
  overallProgress: number;
  milestoneSummary: string;
  overallDescription: string;
  stages: GanttStage[];
  thisWeekWorks: WeeklyWorkItem[];
  nextWeekWorks: string[];
  issues: ReportIssue[];
  risks: ReportRisk[];
  changes: ReportChange[];
}

const healthLightMeta: Record<HealthLight, { label: string; dot: string; text: string; bg: string }> = {
  green: { label: '绿灯（正常）', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
  yellow: { label: '黄灯（关注）', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
  red: { label: '红灯（风险）', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
};

export const getHealthLightMeta = (light: HealthLight) => healthLightMeta[light];

/** BR-03-04/05：按完成率与风险判定健康灯 */
export const resolveHealthLight = (params: {
  overallProgress: number;
  planProgress: number;
  openRiskCount: number;
}): HealthLight => {
  const deviation = params.planProgress - params.overallProgress;
  if (deviation >= 15 || params.openRiskCount >= 3) return 'red';
  if (deviation >= 5 || params.openRiskCount >= 1) return 'yellow';
  return 'green';
};

const buildStageSummary = (stages: GanttStage[]): string =>
  stages.map(stage => `${stage.name.replace(/^阶段[一二三四五六七八九十]+ · /, '')} ${stage.progress}%`).join(' / ');

/** 由项目基础数据构造周报（原型阶段以确定数据模拟禅道取数与清洗结果） */
export const buildProjectWeeklyData = (params: {
  projectId: string;
  projectName: string;
  teamName: string;
  progress: number;
  riskLevel: string;
  latestReport: string;
  weekNumber?: number;
  period?: string;
}): ProjectWeeklyData => {
  // 计划进度：正常项目按计划推进（计划=实际）；关注/风险项目存在滞后
  const planProgress = params.riskLevel === '正常' ? params.progress : Math.min(params.progress + 6, 100);
  const openRiskCount = params.riskLevel === '风险' ? 3 : params.riskLevel === '关注' ? 1 : 0;
  const healthLight = resolveHealthLight({ overallProgress: params.progress, planProgress, openRiskCount });
  const doneCount = Math.round((params.progress / 100) * 30);
  const stages: GanttStage[] = [
    { id: 'st-1', name: '阶段一 · 需求分析', start: '06-01', end: '06-19', status: 'done', progress: 100, taskSummary: '2项任务 全部完成' },
    { id: 'st-2', name: '阶段二 · 系统设计', start: '06-08', end: '07-03', status: 'done', progress: 100, taskSummary: '3项任务 全部完成' },
    { id: 'st-3', name: '阶段三 · 原型与UI设计', start: '06-29', end: '07-17', status: 'done', progress: 100, taskSummary: '3项任务 全部完成' },
    {
      id: 'st-4', name: '阶段四 · 开发实施', start: '07-06', end: '08-21', status: 'doing',
      progress: params.progress, taskSummary: `${Math.max(Math.round((params.progress / 100) * 16), 8)}项完成 · ${Math.max(4 - Math.round((params.progress - 85) / 5), 1)}项进行中`,
    },
    { id: 'st-5', name: '阶段五 · 联调测试', start: '08-22', end: '09-11', status: 'todo', progress: 0, taskSummary: '待启动' },
    { id: 'st-6', name: '阶段六 · 上线交付', start: '09-12', end: '09-30', status: 'todo', progress: 0, taskSummary: '待启动' },
  ];
  const rate = `${params.progress.toFixed(2)}%`;

  return {
    projectId: params.projectId,
    projectName: params.projectName,
    projectCode: '—',
    projectLevel: '—',
    sponsor: '刘备',
    manager: '诸葛亮',
    itManager: '司马懿',
    currentStage: '开发实施',
    weekNumber: params.weekNumber ?? 33,
    period: params.period ?? '2026-08-03 ~ 2026-08-09',
    healthLight,
    stats: [
      { id: 'req', name: '用户需求完成率', value: rate, fraction: `(${doneCount}/30)` },
      { id: 'sol', name: '解决方案需求完成率', value: rate, fraction: `(${doneCount}/30)` },
      { id: 'task', name: '任务完成率', value: rate, fraction: `(${doneCount}/30)` },
      { id: 'change', name: '变更管理次数', value: '0 次', fraction: '(0/0)' },
      { id: 'issue', name: '问题消化率', value: '—', fraction: '(0/0)' },
      { id: 'risk', name: '风险消化率', value: '—', fraction: '(0/0)' },
    ],
    overallProgress: params.progress,
    milestoneSummary: `按阶段分解计算：${buildStageSummary(stages)}，加权综合 ${params.progress}%。`,
    overallDescription: `${params.projectName}本周按计划推进（${params.latestReport}）。请在本区域补充项目总体进展描述后再发送。`,
    stages,
    thisWeekWorks: [
      { id: 'w1', name: '订单、工单、退单缺补字段管理', progress: 100 },
      { id: 'w2', name: '国家城市机场基础信息同步功能开发', progress: 100 },
      { id: 'w3', name: '产品详情页功能开发', progress: 100 },
      { id: 'w4', name: '产品相关接口联调与运费查询、机票下单文档梳理', progress: 100 },
      { id: 'w5', name: '分销前端执行发、机票资源库券价格功能', progress: 100 },
      { id: 'w6', name: '资源价格库存保存时过滤航班班次', progress: 100 },
      { id: 'w7', name: '根据经纬度定位城市信息', progress: 100 },
      { id: 'w8', name: '确认资源页功能开发', progress: 90 },
      { id: 'w9', name: '出行人选择、取消及编辑在跨页面间的交互逻辑补全', progress: 85 },
      { id: 'w10', name: '业务传销售问题沟通及原型优化', progress: 80 },
    ],
    nextWeekWorks: [
      '行程确认单原型定稿',
      '测试评审问题确认',
      '机票接口限制问题业务确认',
      '酒店基础信息需求调整',
      '资源域与产品域功能测试',
      '责任人对接真实用户数据、角色添加客服与业务权限',
      '数据库SQL调整',
    ],
    issues: [
      {
        id: '1', name: '测试大要求 - storys/bigen', type: 'story/bigen', result: '已解决',
        description: '系统中项目故事-集成管理-上海吉祥航空实业股份有限公司电话-0000-0019009',
        solution: '已制定解决方案并完成验证', planDate: '2025-12-19', assignee: '赵云',
      },
    ],
    risks: [],
    changes: [],
  };
};
