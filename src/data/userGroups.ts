import type { ReactNode } from 'react';
import { MAIN_USER_NAME, getDemoPerson } from './people';

/** 用户组来源：手动维护 / 主数据同步 */
export type UserGroupSource = 'manual' | 'sync';
export type UserGroupScope = '全员' | '指定部门' | '指定人员';

/** 用户组成员条目：人员或部门 */
export type UserGroupMember = {
  name: string;
  phone: string;
  userId: string;
  department: string;
  position: string;
  /** 条目类型：人员 / 部门 */
  kind?: 'person' | 'department';
  /** 域账号（人员必填，部门为 -） */
  domainAccount?: string;
  /** 员工编号（人员必填，部门为 -） */
  employeeNo?: string;
};

/** 用户组记录（管理后台与通讯录共享） */
export type UserGroupRecord = {
  id: string;
  name: string;
  source: UserGroupSource;
  description: string;
  scope?: UserGroupScope;
  scopeTarget?: string;
  /** 适用功能（如：项目工作台、流程审批） */
  features?: string;
  /** 适用成员范围（全员/指定部门/指定人员的展示值） */
  memberScope?: string;
  updatedAt: string;
  owner: string;
  members: UserGroupMember[];
};

/** 用户组可授权功能池（适用功能可选值，scope 为默认适用范围） */
export const USER_GROUP_FEATURE_POOL = [
  { name: '工作门户 · 协同功能', description: '门户待办、跨部门协同与常用应用入口', scope: '全员' },
  { name: '工作汇报', description: '项目周报/汇报的生成与分发', scope: '信息管理部' },
  { name: '流程审批', description: '发起与审批 OA 流程', scope: '信息管理部' },
  { name: '知识库', description: '知识文档的阅读与贡献权限', scope: '全员' },
  { name: 'AI 公文创作', description: 'AI 辅助公文写作灰度', scope: '信息管理部 / 数字化中心' },
  { name: '如意空间', description: '如意助手与智能体工作台', scope: '全员' },
];

/** 默认种子数据（与用户组管理页面一致） */
export const initialUserGroups: UserGroupRecord[] = [
  {
    id: 'project-collab',
    name: '项目协同组',
    source: 'manual',
    description: '由管理员维护，用于跨部门项目工作台、流程和知识库权限授权。',
    features: '工作门户 · 协同功能 / 工作汇报 / 流程审批 / 知识库',
    memberScope: '指定部门（信息管理部、数字化中心）',
    updatedAt: '2026-06-28 16:20',
    owner: MAIN_USER_NAME,
    members: [
      { name: MAIN_USER_NAME, phone: 'liangjie@juneyao.com', userId: '4de17977', department: '信息管理部 / 管理支撑产品处', position: '产品经理', kind: 'person', domainAccount: 'liangjie', employeeNo: 'HO00-00000001' },
      { name: getDemoPerson(13), phone: 'zhouyu@juneyao.com', userId: '7af32018', department: '信息管理部 / 业务协同处', position: '业务主管', kind: 'person', domainAccount: 'zhouyu', employeeNo: 'HO00-00000002' },
      { name: getDemoPerson(14), phone: 'lusu@juneyao.com', userId: '6bc45190', department: '数字化中心 / 项目管理处', position: '项目经理', kind: 'person', domainAccount: 'lusu', employeeNo: 'HO00-00000003' },
      { name: '信息管理部', phone: '-', userId: 'dept-xxglb', department: '-', position: '-', kind: 'department' },
      { name: '数字化中心', phone: '-', userId: 'dept-szhzx', department: '-', position: '-', kind: 'department' },
    ]
  },
  {
    id: 'document-pilot',
    name: 'AI公文试点组',
    source: 'manual',
    description: '手动添加的试点用户，用于AI公文创作灰度范围配置。',
    features: 'AI 公文创作 / 如意空间',
    memberScope: '指定人员（灰度试点名单）',
    updatedAt: '2026-06-27 11:05',
    owner: getDemoPerson(11),
    members: [
      { name: getDemoPerson(11), phone: 'xunyu@juneyao.com', userId: '1dc90244', department: '信息管理部 / 平台研发处', position: '技术负责人', kind: 'person', domainAccount: 'xunyu', employeeNo: 'HO00-00000004' },
      { name: '陈一航', phone: '+86 13400134033', userId: '8ef67331', department: '市场营销部 / 数字营销处', position: '处长' },
    ]
  },
  {
    id: 'duty-admin',
    name: '值班排班管理员',
    source: 'manual',
    description: '用于值班、排班和移动端通知配置的管理员用户组。',
    updatedAt: '2026-06-25 09:45',
    owner: getDemoPerson(12),
    members: [
      { name: getDemoPerson(12), phone: '+86 13700137011', userId: '9aa78120', department: '航务运行部 / 运行支撑处', position: '高级经理' },
      { name: getDemoPerson(10), phone: '+86 13100131033', userId: '3da77145', department: '信息管理部', position: '部门负责人' },
    ]
  },
  {
    id: 'middle-layer',
    name: '中坚层',
    source: 'sync',
    description: '承接核心项目和跨部门推进的业务骨干，由主数据按员工层级同步。',
    updatedAt: '2026-07-01 09:30',
    owner: '主数据',
    members: [
      { name: MAIN_USER_NAME, phone: 'liangjie@juneyao.com', userId: '4de17977', department: '信息管理部 / 管理支撑产品处', position: '产品经理', kind: 'person', domainAccount: 'liangjie', employeeNo: 'HO00-00000001' },
      { name: getDemoPerson(13), phone: 'zhouyu@juneyao.com', userId: '7af32018', department: '信息管理部 / 业务协同处', position: '业务主管', kind: 'person', domainAccount: 'zhouyu', employeeNo: 'HO00-00000002' },
      { name: getDemoPerson(14), phone: 'lusu@juneyao.com', userId: '6bc45190', department: '数字化中心 / 项目管理处', position: '项目经理', kind: 'person', domainAccount: 'lusu', employeeNo: 'HO00-00000003' },
      { name: '信息管理部', phone: '-', userId: 'dept-xxglb', department: '-', position: '-', kind: 'department' },
      { name: '数字化中心', phone: '-', userId: 'dept-szhzx', department: '-', position: '-', kind: 'department' },
    ]
  },
  {
    id: 'core-layer',
    name: '核心层',
    source: 'sync',
    description: '关键业务线及重点职能的主要负责人，由主数据按员工层级同步。',
    updatedAt: '2026-07-01 09:30',
    owner: '主数据',
    members: [
      { name: getDemoPerson(12), phone: '+86 13700137011', userId: '9aa78120', department: '航务运行部 / 运行支撑处', position: '高级经理' },
      { name: getDemoPerson(11), phone: 'xunyu@juneyao.com', userId: '1dc90244', department: '信息管理部 / 平台研发处', position: '技术负责人', kind: 'person', domainAccount: 'xunyu', employeeNo: 'HO00-00000004' },
      { name: '陈一航', phone: '+86 13400134033', userId: '8ef67331', department: '市场营销部 / 数字营销处', position: '处长' },
    ]
  },
  {
    id: 'decision-layer',
    name: '决策层',
    source: 'sync',
    description: '公司经营决策、重大项目审批及资源协同人员，由主数据按员工层级同步。',
    updatedAt: '2026-07-01 09:30',
    owner: '主数据',
    members: [
      { name: getDemoPerson(0), phone: '+86 13300133011', userId: '2ab88901', department: '总经理办公室', position: '决策委员' },
      { name: getDemoPerson(9), phone: '+86 13200132022', userId: '5cf90213', department: '经营管理部', position: '经营管理负责人' },
      { name: getDemoPerson(10), phone: '+86 13100131033', userId: '3da77145', department: '信息管理部', position: '部门负责人' },
    ]
  },
];

const STORAGE_KEY = 'ijx-admin-user-groups-v1';
const EVENT_NAME = 'ijx-admin-user-groups-change';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

/** 读取用户组（无持久化数据时落种子） */
export const getUserGroups = (): UserGroupRecord[] => {
  if (!canUseStorage()) return initialUserGroups;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUserGroups));
      return initialUserGroups;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUserGroups));
      return initialUserGroups;
    }
    return parsed as UserGroupRecord[];
  } catch {
    return initialUserGroups;
  }
};

const persist = (groups: UserGroupRecord[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const subscribeUserGroups = (listener: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT_NAME, listener);
  return () => window.removeEventListener(EVENT_NAME, listener);
};

/** 创建用户组 */
export const createUserGroup = (group: UserGroupRecord): UserGroupRecord[] => {
  const next = [group, ...getUserGroups()];
  persist(next);
  return next;
};

/** 更新用户组（按 id） */
export const updateUserGroup = (id: string, patch: Partial<UserGroupRecord>): UserGroupRecord[] => {
  const next = getUserGroups().map(group => group.id === id ? { ...group, ...patch } : group);
  persist(next);
  return next;
};

/** 删除用户组（按 id） */
export const deleteUserGroup = (id: string): UserGroupRecord[] => {
  const next = getUserGroups().filter(group => group.id !== id);
  persist(next);
  return next;
};

/** 维护成员：添加（自动去重 by userId） */
export const appendGroupMembers = (groupId: string, members: UserGroupMember[]): UserGroupRecord[] => {
  const next = getUserGroups().map(group => {
    if (group.id !== groupId) return group;
    const existing = new Set(group.members.map(member => member.userId));
    return { ...group, members: [...group.members, ...members.filter(member => !existing.has(member.userId))] };
  });
  persist(next);
  return next;
};

/** 维护成员：移除（按 userId） */
export const removeGroupMember = (groupId: string, userId: string): UserGroupRecord[] => {
  const next = getUserGroups().map(group => group.id !== groupId ? group : { ...group, members: group.members.filter(member => member.userId !== userId) });
  persist(next);
  return next;
};

/** 同步刷新（演示：更新同步组时间戳） */
export const syncUserGroups = (syncedAt: string): UserGroupRecord[] => {
  const next = getUserGroups().map(group => group.source === 'sync' ? { ...group, updatedAt: syncedAt } : group);
  persist(next);
  return next;
};

/** 占位（保持未来扩展一致性） */
export type _Unused = ReactNode;
