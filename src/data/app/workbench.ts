/** App 工作台 mock 数据（参照截图 IMG5：推荐应用 + 综合服务） */

export interface WorkbenchApp {
  id: string;
  name: string;
  emoji: string;
  group: 'recommend' | 'service';
}

export const WORKBENCH_APPS: WorkbenchApp[] = [
  // 推荐应用（一行 4 个）
  { id: 'meeting-room', name: '会议室', emoji: '📹', group: 'recommend' },
  { id: 'duty', name: '公司值班', emoji: '🔔', group: 'recommend' },
  { id: 'activity', name: '员工活动室', emoji: '🎯', group: 'recommend' },
  { id: 'process', name: '流程中心', emoji: '🔁', group: 'recommend' },
  // 综合服务
  { id: 'contacts', name: '通讯录', emoji: '👥', group: 'service' },
  { id: 'mail', name: '我的邮箱', emoji: '📧', group: 'service' },
  { id: 'report', name: '工作汇报', emoji: '📝', group: 'service' },
  { id: 'aviation', name: '航卫管理', emoji: '🩺', group: 'service' },
  { id: 'appraisal', name: '我的考评', emoji: '⭐', group: 'service' },
  { id: 'vehicle', name: '车辆管理', emoji: '🚗', group: 'service' },
  { id: 'aoc', name: 'AOC 大厅', emoji: '🛫', group: 'service' },
  { id: 'smart-meeting', name: '智能会议', emoji: '🤖', group: 'service' },
  { id: 'health', name: '健康云', emoji: '🌿', group: 'service' },
  { id: 'quality', name: '质量管理', emoji: '✅', group: 'service' },
];
