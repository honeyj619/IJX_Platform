import type { OrgNode } from './types';

/** 组织架构树（参照 store.js ORG_TREE） */
export const ORG_TREE: OrgNode[] = [
  {
    id: 'root',
    name: '吉祥航空',
    children: [
      {
        id: 'it',
        name: '信息管理部',
        children: [
          { id: 'fe', name: '前端组' },
          { id: 'be', name: '后端组' },
          { id: 'qa', name: '测试组' },
        ],
      },
      { id: 'ops', name: '运营中心' },
    ],
  },
];
