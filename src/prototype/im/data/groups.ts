import type { Group } from './types';

/** 演示群（参照 store.js DEFAULT_GROUPS，成员含主用户 me） */
export const GROUPS: Group[] = [
  {
    id: 'g-fe',
    name: '前端组项目群',
    owner: 'me',
    admins: ['jy-p7'],
    notice: '本周五 16:00 对齐迭代范围，请提前准备演示。',
    members: ['me', 'jy-p5', 'jy-p7', 'jy-p1'],
    type: '普通群',
    joinMode: 'approve',
    muteAll: false,
    muted: [],
    files: [
      { id: 'f1', name: '迭代评审纪要.docx', size: '128 KB', from: 'jy-p7', time: '10:24' },
      { id: 'f2', name: '原型截图.png', size: '860 KB', from: 'me', time: '昨天' },
    ],
    blacklist: [],
  },
  {
    id: 'g-all',
    name: '专题项目讨论群',
    owner: 'jy-p1',
    admins: ['jy-p2'],
    notice: '请及时更新周报。',
    members: ['me', 'jy-p1', 'jy-p2', 'jy-p3', 'jy-p5', 'jy-p6', 'jy-p7', 'jy-p8', 'jy-p9'],
    type: '部门群',
    joinMode: 'qr',
    muteAll: false,
    muted: [],
    files: [{ id: 'f3', name: '考勤说明.pdf', size: '240 KB', from: 'jy-p1', time: '周一' }],
    blacklist: [],
  },
  {
    id: 'g-six',
    name: '测试部门群',
    owner: 'jy-p1',
    admins: ['jy-p5'],
    notice: '',
    members: ['me', 'jy-p5', 'jy-p7', 'jy-p1', 'jy-p2', 'jy-p8'],
    type: '部门群',
    joinMode: 'approve',
    muteAll: false,
    muted: [],
    files: [],
    blacklist: [],
  },
  {
    id: 'g-pair',
    name: '产品前端双人组',
    owner: 'jy-p7',
    admins: [],
    notice: '',
    members: ['me', 'jy-p7'],
    type: '普通群',
    joinMode: 'approve',
    muteAll: false,
    muted: [],
    files: [],
    blacklist: [],
  },
  {
    id: 'g-solo',
    name: '工作助手',
    owner: 'me',
    admins: [],
    notice: '',
    members: ['me'],
    type: '普通群',
    joinMode: 'approve',
    muteAll: false,
    muted: [],
    files: [],
    blacklist: [],
  },
];

const GROUP_MAP = new Map(GROUPS.map((g) => [g.id, g]));

export function getGroup(id: string): Group | undefined {
  return GROUP_MAP.get(id);
}
