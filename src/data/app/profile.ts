/** App 我的 mock 数据（参照截图 IMG6：名片 → 三宫格 → 钱包卡 → 吉食GO → 列表 → 退出） */

export interface ProfileMenuItem {
  id: string;
  label: string;
  emoji: string;
  value?: string;
  danger?: boolean;
}

/** 名片信息：主用户梁吉力 */
export const PROFILE_CARD = {
  name: '梁吉力',
  job: '产品经理',
  dept: '信息管理部-管理支撑产品处',
  joinDate: '2023-07-03',
  days: 1221,
};

/** 快捷三宫格：我的薪酬 / 我要打卡 / 我的福利 */
export const PROFILE_QUICK: { id: string; label: string; emoji: string; tone: 'pink' | 'blue' | 'amber' }[] = [
  { id: 'salary', label: '我的薪酬', emoji: '💰', tone: 'pink' },
  { id: 'punch', label: '我要打卡', emoji: '🕐', tone: 'blue' },
  { id: 'welfare', label: '我的福利', emoji: '🎁', tone: 'amber' },
];

/** 我的钱包卡 */
export const PROFILE_WALLET = {
  title: '我的钱包',
  hint: '下次上班也可以凭脸刷卡上啦，快点击连接 Wi-Fi 吧！',
};

/** 吉食GO 卡 */
export const PROFILE_JISHIGO = {
  label: '吉食GO',
  balanceLabel: '钱包余额',
  balance: '¥68.35',
  payLabel: '付款码',
};

/** 功能列表（邮箱/学堂/资源/帮助/安全） */
export const PROFILE_MENU: ProfileMenuItem[] = [
  { id: 'mail', label: '我的邮箱', emoji: '📧' },
  { id: 'school', label: '梧桐云学堂', emoji: '📚' },
  { id: 'resource', label: '我的资源', emoji: '🗂' },
  { id: 'help', label: '帮助与反馈', emoji: '🛟' },
  { id: 'security', label: '账户安全中心', emoji: '🛡' },
];

/** 退出账号 */
export const PROFILE_LOGOUT: ProfileMenuItem = { id: 'logout', label: '退出账号', emoji: '🚪', danger: true };
