import type { Session } from './types';

/** 演示会话（参照 store.js DEFAULT_SESSIONS） */
export const SESSIONS: Session[] = [
  { id: 's-g-fe', type: 'group', targetId: 'g-fe', unread: 2, pinned: true, mute: false, lastTime: '10:30' },
  { id: 's-file-helper', type: 'single', targetId: 'file-helper', unread: 0, pinned: false, mute: false, lastTime: '09:00' },
  { id: 's-jy-p5', type: 'single', targetId: 'jy-p5', unread: 1, pinned: false, mute: false, lastTime: '09:48' },
  { id: 's-jy-p7', type: 'single', targetId: 'jy-p7', unread: 0, pinned: false, mute: false, lastTime: '昨天' },
  { id: 's-g-all', type: 'group', targetId: 'g-all', unread: 0, pinned: false, mute: true, lastTime: '周一' },
  { id: 's-g-six', type: 'group', targetId: 'g-six', unread: 0, pinned: false, mute: false, lastTime: '周二' },
  { id: 's-g-pair', type: 'group', targetId: 'g-pair', unread: 0, pinned: false, mute: false, lastTime: '昨天' },
  { id: 's-g-solo', type: 'group', targetId: 'g-solo', unread: 0, pinned: false, mute: false, lastTime: '上周' },
  { id: 's-jy-p2', type: 'single', targetId: 'jy-p2', unread: 0, pinned: false, mute: false, lastTime: '上周' },
];

export function getSession(id: string): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}
