import { MAIN_USER_NAME, MAIN_USER_AVATAR, getPersonAvatar } from './people';
import type { Contact } from './types';

/** 当前用户：复用项目主用户梁吉力 */
export const ME: Contact = {
  id: 'me',
  name: MAIN_USER_NAME,
  job: '产品经理',
  dept: '信息管理部-管理支撑产品处',
  deptPath: '吉祥航空 / 信息管理部 / 管理支撑产品处',
  phone: '17610960613',
  email: 'liangjili@juneyao.com',
  account: 'liangjili',
  status: 'online',
  company: '吉祥航空',
};

export const FILE_HELPER_ID = 'file-helper';
export const FILE_HELPER: Contact = {
  id: FILE_HELPER_ID,
  name: '文件传输助手',
  job: '文件传输',
  account: 'filehelper',
  status: 'online',
  isFileHelper: true,
};

/** 演示联系人（姓名仅取 THREE_KINGDOMS_NAMES 中的名字，非真实人员） */
export const CONTACTS: Contact[] = [
  ME,
  { id: 'jy-p1', name: '刘备', job: '负责人', dept: '吉祥航空', deptPath: '吉祥航空', phone: '17610960612', email: 'liubei@juneyao.com', account: 'liubei', status: 'busy', company: '吉祥航空' },
  { id: 'jy-p2', name: '关羽', job: '行政专员', dept: '吉祥航空', deptPath: '吉祥航空', phone: '17610960616', email: 'guanyu@juneyao.com', account: 'guanyu', status: 'online', company: '吉祥航空' },
  { id: 'jy-p3', name: '张飞', job: '助理', dept: '吉祥航空', deptPath: '吉祥航空', phone: '17610960617', email: 'zhangfei@juneyao.com', account: 'zhangfei', status: 'offline', company: '吉祥航空' },
  { id: 'jy-p5', name: '诸葛亮', job: '测试工程师', dept: '测试组', deptPath: '吉祥航空 / 测试部门 / 测试组', phone: '17610960614', email: 'zhugeliang@juneyao.com', account: 'zhugeliang', status: 'online', company: '吉祥航空' },
  { id: 'jy-p6', name: '赵云', job: '运营专员', dept: '运营中心', deptPath: '吉祥航空 / 运营中心', phone: '17610960615', email: 'zhaoyun@juneyao.com', account: 'zhaoyun', status: 'away', company: '吉祥航空' },
  { id: 'jy-p7', name: '马超', job: '产品经理', dept: '前端组', deptPath: '吉祥航空 / 测试部门 / 前端组', phone: '13800001005', email: 'machao@juneyao.com', account: 'machao', status: 'online', company: '吉祥航空' },
  { id: 'jy-p8', name: '黄忠', job: '后端工程师', dept: '后端组', deptPath: '吉祥航空 / 测试部门 / 后端组', phone: '13800001003', email: 'huangzhong@juneyao.com', account: 'huangzhong', status: 'offline', company: '吉祥航空' },
  { id: 'jy-p9', name: '司马懿', job: '设计师', dept: '前端组', deptPath: '吉祥航空 / 测试部门 / 前端组', phone: '13800001009', email: 'simayi@juneyao.com', account: 'simayi', status: 'online', company: '吉祥航空' },
];

const CONTACT_MAP = new Map(CONTACTS.map((c) => [c.id, c]));

export function getContact(id: string): Contact | undefined {
  return CONTACT_MAP.get(id);
}

/** 头像：主用户用本地版本化图片，其他人走首字母占位（P1-4 已移除远程头像服务） */
export function contactAvatar(c: Contact | undefined): string {
  if (!c) return getPersonAvatar('未知');
  if (c.isFileHelper) return '';
  if (c.name === MAIN_USER_NAME) return MAIN_USER_AVATAR;
  return getPersonAvatar(c.name);
}
