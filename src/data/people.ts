export const MAIN_USER_NAME = '梁吉力';
export const MAIN_USER_SHORT_NAME = '梁';
export const MAIN_USER_TITLE = '梁工';
export const MAIN_USER_AVATAR = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20beautiful%20woman%20avatar%2C%20modern%20style%2C%20confident%20expression%2C%20soft%20lighting%2C%20elegant%20appearance&image_size=square_hd';
export const RUYI_ASSISTANT_AVATAR = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20astronaut%20avatar%20in%20space%2C%20clean%20design%2C%20blue%20and%20white%20color%20scheme%2C%20futuristic%20style&image_size=square_hd';

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

export function getPersonAvatar(name: string) {
  if (name === MAIN_USER_NAME) return MAIN_USER_AVATAR;
  const palette = ['f9a8d4', '93c5fd', '86efac', 'fde68a', 'c4b5fd', 'fca5a5'];
  const index = Math.max(0, THREE_KINGDOMS_NAMES.indexOf(name));
  const backgroundColor = palette[index % palette.length];
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=${backgroundColor}`;
}

/**
 * 通讯录渐变头像色板（2026-11-26 通讯录名片改造）。
 * 限定在品牌粉 / 珊瑚 / 金棕色系，不使用蓝色系；同一姓名稳定取色，保证刷新后不变。
 */
const CONTACT_AVATAR_GRADIENTS = [
  ['#e879a8', '#a01f61'],
  ['#e59a7d', '#a8503f'],
  ['#e0b082', '#96603a'],
  ['#d186c6', '#7c2f76'],
  ['#d97fa0', '#8d3f6b'],
] as const;

/** 通讯录头像文字：中文取姓名后两字（对齐名片样式），两字及以下取全名，非中文取前两个字母 */
export function getContactAvatarLabel(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  if (/[\u4e00-\u9fa5]/.test(trimmed)) return trimmed.length <= 2 ? trimmed : trimmed.slice(-2);
  return trimmed.slice(0, 2).toUpperCase();
}

/** 通讯录头像背景：按姓名稳定派生的品牌色系渐变 */
export function getContactAvatarGradient(name: string) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 9973;
  }
  const [from, to] = CONTACT_AVATAR_GRADIENTS[hash % CONTACT_AVATAR_GRADIENTS.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
}
