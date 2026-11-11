export const MAIN_USER_NAME = '梁吉力';
export const MAIN_USER_SHORT_NAME = '梁';
export const MAIN_USER_TITLE = '梁工';
import liangjieAvatar from '../../assets/profile/avatar-liangjie.png'

/** 本地版本化头像；其它联系人统一走 ImAvatar 首字母占位，不请求远程头像服务 */
export const MAIN_USER_AVATAR = liangjieAvatar;
export const RUYI_ASSISTANT_AVATAR = '';

export const THREE_KINGDOMS_NAMES = [
  '刘备',
  '关羽',
  '张飞',
  '诸葛亮',
  '赵云',
  '马超',
  '黄忠',
  '曹操',
  '司马懿',
  '郭嘉',
  '荀彧',
  '夏侯惇',
  '张辽',
  '许褚',
  '孙权',
  '周瑜',
  '鲁肃',
  '陆逊',
  '吕蒙',
  '甘宁',
  '黄盖',
  '吕布',
  '貂蝉',
  '董卓',
  '袁绍',
  '袁术',
  '庞统',
  '姜维',
  '魏延',
  '徐庶',
];

export const AVAILABLE_PERSON_NAMES = [MAIN_USER_NAME, ...THREE_KINGDOMS_NAMES];

export function getDemoPerson(index: number) {
  return THREE_KINGDOMS_NAMES[index % THREE_KINGDOMS_NAMES.length];
}

export function getInitialsAvatar(name: string, backgroundColor = 'f53a71') {
  if (!name || !backgroundColor) return '';
  return '';
}

export function getPersonAvatar(name: string) {
  if (name === MAIN_USER_NAME) return MAIN_USER_AVATAR;
  return '';
}
