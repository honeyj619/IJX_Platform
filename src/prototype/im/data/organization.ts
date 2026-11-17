import type { OrganizationNode } from './types';

/**
 * 组织架构 mock（2026-11-17 通讯录一级入口）。
 * 节点只存联系人 ID（memberIds），人员资料统一由 contacts 状态读取，不复制。
 * id 前缀 org-，与联系人 departmentId 对应。
 */
export const ORGANIZATION_ROOT: OrganizationNode = {
  id: 'org-root',
  name: '吉祥航空',
  type: 'company',
  memberIds: ['jy-p1', 'jy-p2', 'jy-p3'],
  children: [
    {
      id: 'org-it',
      name: '信息管理部',
      parentId: 'org-root',
      type: 'department',
      memberIds: [],
      children: [
        {
          id: 'org-mgmt',
          name: '管理支撑产品处',
          parentId: 'org-it',
          type: 'group',
          memberIds: ['me'],
        },
        {
          id: 'org-fe',
          name: '前端组',
          parentId: 'org-it',
          type: 'group',
          memberIds: ['jy-p7', 'jy-p9'],
        },
        {
          id: 'org-be',
          name: '后端组',
          parentId: 'org-it',
          type: 'group',
          memberIds: ['jy-p8'],
        },
        {
          id: 'org-qa',
          name: '测试组',
          parentId: 'org-it',
          type: 'group',
          memberIds: ['jy-p5'],
        },
      ],
    },
    {
      id: 'org-ops',
      name: '运营中心',
      parentId: 'org-root',
      type: 'department',
      memberIds: ['jy-p6'],
    },
  ],
};

/** 展平组织树 */
export function flattenOrganization(root: OrganizationNode): OrganizationNode[] {
  const out: OrganizationNode[] = [root];
  for (const child of root.children ?? []) out.push(...flattenOrganization(child));
  return out;
}

export function findOrganizationNode(root: OrganizationNode, id: string): OrganizationNode | undefined {
  if (root.id === id) return root;
  for (const child of root.children ?? []) {
    const hit = findOrganizationNode(child, id);
    if (hit) return hit;
  }
  return undefined;
}

/** 部门路径（含自身），用于面包屑展示 */
export function organizationPath(root: OrganizationNode, id: string): OrganizationNode[] {
  if (root.id === id) return [root];
  for (const child of root.children ?? []) {
    const sub = organizationPath(child, id);
    if (sub.length) return [root, ...sub];
  }
  return [];
}

/** 递归统计节点成员数（含子部门） */
export function countMembers(node: OrganizationNode): number {
  return node.memberIds.length + (node.children ?? []).reduce((sum, c) => sum + countMembers(c), 0);
}
