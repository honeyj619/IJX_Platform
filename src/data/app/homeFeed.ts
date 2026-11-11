/** App 首页 mock 数据（结构参照截图 IMG1 长图条带 OCR） */

export interface BannerEntry {
  id: string;
  name: string;
  emoji: string;
  /** 角标数字：'' 表示无角标 */
  badge: string;
  route?: string;
}

/** banner 快捷服务入口（4 个，带数字角标） */
export const HOME_BANNER_ENTRIES: BannerEntry[] = [
  { id: 'today', name: '今日日程', emoji: '📅', badge: '0', route: '/app/schedule' },
  { id: 'doc', name: '未读公文', emoji: '📄', badge: '55' },
  { id: 'todo', name: '待办流程', emoji: '📋', badge: '100' },
  { id: 'meeting', name: '会议室', emoji: '📹', badge: '00' },
];

export interface HomeAppTile {
  id: string;
  name: string;
  emoji: string;
  badge?: string;
  route?: string;
}

/** 快捷服务宫格（2 行 × 4 列） */
export const HOME_QUICK_APPS: HomeAppTile[] = [
  { id: 'contacts', name: '通讯录', emoji: '👥', route: '/app/messages/contacts' },
  { id: 'todo', name: '待办流程', emoji: '📋', badge: '2' },
  { id: 'process', name: '流程中心', emoji: '🔁' },
  { id: 'activity', name: '员工活动室', emoji: '🎯' },
  { id: 'duty', name: '公司值班', emoji: '🔔' },
  { id: 'company-doc', name: '公司文件', emoji: '🗂' },
  { id: 'minutes', name: '会议纪要', emoji: '🗒' },
  { id: 'notice', name: '通知公告', emoji: '📢' },
];

export interface HomePromo {
  id: string;
  title: string;
  desc: string;
  emoji: string;
  tone: 'pink' | 'blue';
}

/** 运营横幅（宫格区下方 2 张 banner 图） */
export const HOME_PROMOS: HomePromo[] = [
  { id: 'p1', title: '关于 iOS 27 用户更新 i吉祥 app 的小提醒', desc: 'i吉祥 · 官方', emoji: '🍎', tone: 'pink' },
  { id: 'p2', title: '一图读懂「战略规划」', desc: 'i吉祥 · 战略', emoji: '📊', tone: 'blue' },
];

export interface HomeNotice {
  id: string;
  title: string;
  docNo: string;
  time: string;
}

/** 通知公告 */
export const HOME_NOTICES: HomeNotice[] = [
  { id: 'n1', title: '关于发布南京=长治等航线承包时间的通知', docNo: '吉祥航发〔2026〕280号', time: '10-24' },
  { id: 'n2', title: '关于开展吉祥航空第一期 FDE 赋能班的通知', docNo: '吉祥航发〔2026〕279号', time: '10-23' },
  { id: 'n3', title: '关于发布 B-1870 飞机基本重量数据变更的通知', docNo: '吉祥航发〔2026〕278号', time: '10-22' },
  { id: 'n4', title: '关于 2026 年 10 月 25 日 B-8035 号机执行 H01792 航班的提示', docNo: '吉祥航发〔2026〕277号', time: '10-21' },
  { id: 'n5', title: '关于发布吉祥航空机坪业务外包专项排查工作总结的通知', docNo: '吉祥航发〔2026〕276号', time: '10-20' },
];

export interface HomeCulture {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

/** 企业文化（3 个） */
export const HOME_CULTURE: HomeCulture[] = [
  { id: 'c1', name: '如意到家', emoji: '🏡', desc: '让每一程都如意' },
  { id: 'c2', name: '如意飞翔', emoji: '✈️', desc: '服务 · 创新 · 卓越' },
  { id: 'c3', name: '美好吉祥', emoji: '🌸', desc: '与吉祥一起成长' },
];

export interface HomeInfoNotice {
  id: string;
  name: string;
  emoji: string;
  desc: string;
}

/** 信息通知（2 个卡片） */
export const HOME_INFO_NOTICES: HomeInfoNotice[] = [
  { id: 'i1', name: '内部招聘', emoji: '💼', desc: '最新岗位热招中' },
  { id: 'i2', name: '花吉食 · 今日菜单', emoji: '🍱', desc: '今天吃什么？' },
];

export interface HomeWelfare {
  id: string;
  name: string;
  emoji: string;
  tone: 'pink' | 'blue' | 'amber' | 'violet';
}

/** 福利中心（2×2 宫格） */
export const HOME_WELFARE: HomeWelfare[] = [
  { id: 'w1', name: '工会福利专区', emoji: '🎁', tone: 'pink' },
  { id: 'w2', name: '吉祥生活电商平台', emoji: '🛍️', tone: 'blue' },
  { id: 'w3', name: '福利兑换中', emoji: '🎟️', tone: 'amber' },
  { id: 'w4', name: '如意商城', emoji: '🏬', tone: 'violet' },
];

export interface HomeGood {
  id: string;
  name: string;
  tag: string;
  price: string;
  emoji: string;
  tone: 'pink' | 'blue' | 'amber' | 'violet';
}

/** 精品推荐 · 吉祥航空（熊猫公仔一行 3 个） */
export const HOME_GOODS_BRAND: HomeGood[] = [
  { id: 'g1', name: '熊猫公仔 · 凤仙子', tag: '吉祥航空', price: '¥55.00 起', emoji: '🐼', tone: 'pink' },
  { id: 'g2', name: '熊猫公仔 · 灵灵子', tag: '吉祥航空', price: '¥55.00 起', emoji: '🐻', tone: 'violet' },
  { id: 'g3', name: '熊猫公仔 · 小狮弟', tag: '吉祥航空', price: '¥55.00 起', emoji: '🦁', tone: 'amber' },
];

/** 精品推荐 · 休闲度假（横向滚动） */
export const HOME_GOODS_TRAVEL: HomeGood[] = [
  { id: 't1', name: '〖休闲度假〗上海-西双版纳 3-5 天往返机票', tag: '机票+酒店', price: '¥1780.00 起', emoji: '🏝️', tone: 'blue' },
  { id: 't2', name: '〖休闲度假〗上海-槟城 5-6 天往返机票+酒店', tag: '机票+酒店', price: '¥2089.00 起', emoji: '🏖️', tone: 'amber' },
  { id: 't3', name: '上海出发丨济州往返机票+济州维斯酒店', tag: '机票+酒店', price: '¥1801.00 起', emoji: '🌊', tone: 'violet' },
  { id: 't4', name: '〖休闲度假〗上海出发丨探秘玉龙雪山 4 天 3 晚', tag: '机票+酒店', price: '¥1697.00 起', emoji: '🏔️', tone: 'pink' },
];
