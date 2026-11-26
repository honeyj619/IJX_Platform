export type ScheduleTaskMode = 'calendar' | 'meeting';

export interface ScheduleTaskPreset { date?: string; startTime?: string; endTime?: string; roomId?: string; source?: string; }

type ScheduleTaskTarget =
  | { mode: ScheduleTaskMode; action: 'create'; preset?: ScheduleTaskPreset }
  | { mode: ScheduleTaskMode; action: 'edit'; id: string };

const basePath = () => import.meta.env.BASE_URL.replace(/\/$/, '');

export const buildTaskWindowPath = (target: ScheduleTaskTarget) => {
  if (target.action === 'edit') {
    return target.mode === 'calendar'
      ? `/pc_client/calendar/events/${encodeURIComponent(target.id)}/edit`
      : `/pc_client/meetings/${encodeURIComponent(target.id)}/edit`;
  }
  const path = target.mode === 'calendar' ? '/pc_client/calendar/create' : '/pc_client/meetings/create';
  const params = new URLSearchParams();
  const preset = target.preset;
  if (preset?.date) params.set('date', preset.date);
  if (preset?.startTime) params.set('start', preset.startTime);
  if (preset?.endTime) params.set('end', preset.endTime);
  if (preset?.roomId) params.set('roomId', preset.roomId);
  if (preset?.source) params.set('source', preset.source);
  return `${path}${params.size ? `?${params.toString()}` : ''}`;
};

export const openScheduleTaskWindow = (target: ScheduleTaskTarget) => {
  const path = buildTaskWindowPath(target);
  const base = basePath();
  const currentPath = base && window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length) || '/'
    : window.location.pathname;
  const returnTo = `${currentPath}${window.location.search}`;
  const separator = path.includes('?') ? '&' : '?';
  const href = `${base}${path}${separator}returnTo=${encodeURIComponent(returnTo)}`;

  // Web 原型在同一应用视口中绘制客户端任务窗口，避免把浏览器弹窗误认为真实客户端多窗口能力。
  window.location.assign(href);
  return null;
};

