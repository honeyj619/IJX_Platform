import type { ContactPerson } from '@/data/contactDirectory';

/** 在线状态色点（演示数据，无真实在线服务） */
export const CONTACT_STATUS_DOT: Record<NonNullable<ContactPerson['status']>, string> = {
  online: 'bg-emerald-500',
  busy: 'bg-orange-500',
  away: 'bg-amber-500',
  offline: 'bg-gray-400',
};

/** 在线状态文案（演示数据，无真实在线服务） */
export const CONTACT_STATUS_LABEL: Record<NonNullable<ContactPerson['status']>, string> = {
  online: '在线',
  busy: '忙碌',
  away: '离开',
  offline: '离线',
};
