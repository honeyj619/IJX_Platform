/**
 * 首页运营演示数据（阶段三）：公文、快捷应用、商品、旅行推荐
 * 与人员数据分离；全部为虚构演示内容
 */

export const todoEntries = [
  { key: 'docs', label: '未读公文', count: 62, icon: 'doc' },
  { key: 'flow', label: '待办流程', count: 7, icon: 'flow' },
  { key: 'schedule', label: '今日日程', count: null, icon: 'cal' },
  { key: 'course', label: '我的课程', count: 99, icon: 'course' },
]

export const quickApps = [
  { key: 'meeting', label: '会议室' },
  { key: 'contacts', label: '通讯录' },
  { key: 'process', label: '流程中心' },
  { key: 'activity', label: '员工活动室' },
  { key: 'duty', label: '公司值班' },
  { key: 'all', label: '全部' },
]

export const docTabs = [
  { key: 'company', label: '公司文件' },
  { key: 'minutes', label: '会议纪要' },
  { key: 'notice', label: '通知公告' },
  { key: 'more', label: '更多' },
]

export const docLists = {
  company: [
    { id: 'c1', title: '关于印发《吉祥航空2026年度安全管理工作要点》的通知', docNo: '吉航发〔2026〕15号' },
    { id: 'c2', title: '关于开展2026年第一季度安全生产大检查的通知', docNo: '吉航发〔2026〕12号' },
    { id: 'c3', title: '关于调整公司组织架构的通知', docNo: '吉航发〔2026〕10号' },
    { id: 'c4', title: '关于印发《员工差旅费管理办法（修订版）》的通知', docNo: '吉航发〔2026〕8号' },
    { id: 'c5', title: '关于2026年春节期间值班安排的通知', docNo: '吉航发〔2026〕5号' },
  ],
  minutes: [
    { id: 'm1', title: '公司2026年第一次经营分析会会议纪要', docNo: '吉航纪要〔2026〕3号' },
    { id: 'm2', title: '一季度安全委员会会议纪要', docNo: '吉航纪要〔2026〕2号' },
    { id: 'm3', title: '信息化建设专项推进会会议纪要', docNo: '吉航纪要〔2026〕1号' },
  ],
  notice: [
    { id: 'n1', title: '关于系统升级维护的通知', docNo: '' },
    { id: 'n2', title: '关于开展员工体检的通知', docNo: '' },
    { id: 'n3', title: '办公区域网络优化完成公告', docNo: '' },
  ],
  more: [
    { id: 'x1', title: '更多企业信息（原型占位）', docNo: '' },
  ],
}

export const aboutEntries = [
  { key: 'fly', title: '如意飞翔', sub: '美好吉祥' },
  { key: 'info', title: '信息通知', sub: '内部招聘' },
  { key: 'food', title: '花吉食', sub: '今日菜单' },
]

export const welfareCards = [
  { key: 'union', title: '工会福利专区' },
  { key: 'birthday', title: '生日福利' },
]

export const mallGoods = [
  { id: 'g1', title: '吉祥航空模型 1:200', price: '55.00 起' },
  { id: 'g2', title: '机长熊公仔', price: '68.00 起' },
  { id: 'g3', title: '联名保温杯', price: '88.00 起' },
]

export const travelPicks = [
  { id: 't1', title: '三亚 5 日自由行', tag: '机票+酒店', price: '¥1,299 起' },
  { id: 't2', title: '成都 4 日品质游', tag: '机票+酒店', price: '¥1,599 起' },
  { id: 't3', title: '昆明大理丽江 6 日', tag: '机票+酒店', price: '¥2,199 起' },
  { id: 't4', title: '厦门鼓浪屿 4 日', tag: '机票+酒店', price: '¥1,399 起' },
]
