export type BusinessMessageCardCategory =
  | 'attendance'
  | 'approval'
  | 'schedule'
  | 'project'
  | 'knowledge'
  | 'notice'
  /** V3.5：创作工作台入口（公文/PPT/周报需求确认后的进入卡片） */
  | 'workbench'
  /** V3.6：会议创建结果（任务执行成功后的会议对象卡） */
  | 'meeting';

export type BusinessMessageCardTone = 'brand' | 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export interface BusinessMessageCardStatus {
  label: string;
  tone: BusinessMessageCardTone;
}

export interface BusinessMessageCardMetric {
  label: string;
  value: string;
  unit?: string;
  tone?: BusinessMessageCardTone;
}

export interface BusinessMessageCardField {
  label: string;
  value: string;
  emphasis?: boolean;
}

export interface BusinessMessageCardItem {
  id: string;
  title: string;
  description?: string;
  status?: BusinessMessageCardStatus;
  href?: string;
}

export interface BusinessMessageCardAction {
  id: string;
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'link';
}

/**
 * 原型业务消息卡片：仅描述展示和前端跳转，不包含接口、回调或后端状态字段。
 * 结构对应飞书卡片的 header / div / column_set / loop / button(open_url) 子集。
 */
export interface BusinessMessageCardData {
  id: string;
  category: BusinessMessageCardCategory;
  source: string;
  title: string;
  subtitle?: string;
  summary?: string;
  status?: BusinessMessageCardStatus;
  metrics?: BusinessMessageCardMetric[];
  fields?: BusinessMessageCardField[];
  items?: BusinessMessageCardItem[];
  tags?: string[];
  timestamp?: string;
  href?: string;
  actions: BusinessMessageCardAction[];
}
