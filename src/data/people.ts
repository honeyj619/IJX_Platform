export const MAIN_USER_NAME = '梁吉力';
export const MAIN_USER_SHORT_NAME = '梁';
export const MAIN_USER_TITLE = '梁工';
export const MAIN_USER_AVATAR = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20beautiful%20woman%20avatar%2C%20modern%20style%2C%20confident%20expression%2C%20soft%20lighting%2C%20elegant%20appearance&image_size=square_hd';

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

export function getInitialsAvatar(name: string, backgroundColor = '8b5cf6') {
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=${backgroundColor}`;
}
