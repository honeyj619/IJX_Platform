/** App 日程 mock 数据（结构参照截图 IMG2 月历 + IMG3/IMG4 任务页） */

export interface ScheduleTask {
  id: string;
  title: string;
  remindAt?: string;
  creator?: string;
  participants?: string[];
  done: boolean;
}

/** 任务列表：姓名仅取三国人名与主用户梁吉力（截图原创建人为演示名，按规范替换） */
export const SCHEDULE_TASKS: ScheduleTask[] = [
  { id: 't1', title: '确认 POC 参与方', remindAt: '2026-03-26 14:30', creator: '刘备', participants: ['梁吉力'], done: true },
  { id: 't2', title: '通知 POC 线下安排', remindAt: '2026-03-31 16:33', creator: '关羽', done: true },
  { id: 't3', title: 'i吉祥 push 流程地址修改', remindAt: '2026-04-01 09:43', creator: '张飞', done: true },
  { id: 't4', title: 'i吉祥日程需求设计', creator: '诸葛亮', participants: ['梁吉力'], done: true },
  { id: 't5', title: '运维需求沟通', remindAt: '2024-07-12 09:22', creator: '赵云', done: true },
  { id: 't6', title: '三季度绩效', remindAt: '2024-07-10 13:20', creator: '马超', done: true },
  { id: 't7', title: '酒店公寓项目结项材料', creator: '黄忠', participants: ['梁吉力'], done: true },
];

/** 月历年份/月份（对应截图 2026 年 11 月） */
export const SCHEDULE_MONTH = { year: 2026, month: 11 };

/** 今日标记（原型演示日 2026-11-05） */
export const SCHEDULE_TODAY = 5;

/** 农历/节气标注：{ 日: 标签 }（2026 年 11 月） */
export const SCHEDULE_LUNAR: Record<number, string> = {
  1: '廿三', 2: '廿四', 3: '廿五', 4: '廿六', 5: '廿七', 6: '廿八', 7: '廿九', 8: '三十',
  9: '初一', 10: '初二', 11: '初三', 12: '初四', 13: '初五', 14: '初六', 15: '初七',
  16: '初八', 17: '初九', 18: '初十', 19: '十一', 20: '十二', 21: '十三',
  22: '小雪', 23: '十五', 24: '十六', 25: '十七', 26: '十八', 27: '十九', 28: '二十',
  29: '廿一', 30: '廿二',
};

/** 任务入口徽标（截图：任务 100） */
export const SCHEDULE_TASK_BADGE = '100';
