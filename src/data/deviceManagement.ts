/**
 * 设备管理共享演示数据（原型）
 * 由 Admin「安全管理 · 设备管理」与统一登录原型共享；
 * 数据文件不得引用 Store 或 React 组件，避免循环依赖。
 */

export type DeviceType = 'PC客户端' | '移动APP' | '网页浏览器';
export type DeviceStatus = '在线' | '离线';
export type SecurityStatus = '合规' | '存在风险';

export type DeviceSession = {
  id: string;
  deviceId: string;
  loginAt: string;
  lastActiveAt: string;
  ip: string;
  location: string;
  status: '有效' | '已退出';
};

export type UserDevice = {
  id: string;
  type: DeviceType;
  name: string;
  manufacturer: string;
  model: string;
  identifier: string;
  serialNumber: string;
  os: string;
  architecture: string;
  clientVersion: string;
  clientChannel: string;
  installedAt: string;
  lastActiveAt: string;
  lastIp?: string;
  status: DeviceStatus;
  bound: boolean;
  trusted: boolean;
  securityStatus: SecurityStatus;
  securityMessage: string;
  diskEncrypted: boolean;
  screenLockEnabled: boolean;
  antivirusEnabled: boolean;
  sessions: DeviceSession[];
};

export type DeviceUser = {
  id: string;
  name: string;
  account: string;
  company: string;
  department: string;
  employmentStatus: '在职' | '离职';
  accountStatus: '正常' | '停用';
  devices: UserDevice[];
};

export type DeviceFilters = {
  keyword: string;
  department: string;
  employmentStatus: string;
  deviceOwnership: string;
  deviceCondition: string;
};

export const DEFAULT_FILTERS: DeviceFilters = {
  keyword: '',
  department: '全部',
  employmentStatus: '全部',
  deviceOwnership: '全部设备',
  deviceCondition: '全部状态',
};

/** 主用户（梁吉力）：统一登录原型固定演示账号与设备 */
export const PROTOTYPE_MAIN_USER_ID = 'user-liang';
/** Web 登录复用的稳定网页浏览器设备 */
export const PROTOTYPE_WEB_DEVICE_ID = 'device-web-liang-1';
/** PC 客户端登录复用的稳定 PC 设备 */
export const PROTOTYPE_CLIENT_DEVICE_ID = 'device-pc-liang';

export const initialDeviceUsers: DeviceUser[] = [
  {
    id: 'user-liang', name: '梁吉力', account: 'liangjie', company: '上海吉祥航空股份有限公司', department: '信息技术部', employmentStatus: '在职', accountStatus: '正常',
    devices: [
      {
        id: 'device-pc-liang', type: 'PC客户端', name: 'LJLI-WORK-PC', manufacturer: 'Lenovo', model: 'ThinkPad T14 Gen 5', identifier: 'PC-7F32-18D0-A921', serialNumber: 'PF5Q2J9A', os: 'Windows 11 企业版 24H2', architecture: 'x64', clientVersion: '3.8.2', clientChannel: '正式版', installedAt: '2026-08-12 09:20:15', lastActiveAt: '2026-10-15 15:34:44', status: '在线', bound: true, trusted: true, securityStatus: '合规', securityMessage: '符合公司 PC 终端安全基线', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true,
        sessions: [
          { id: 'SES-PC-83A1', deviceId: 'device-pc-liang', loginAt: '2026-10-15 08:42:10', lastActiveAt: '2026-10-15 15:34:44', ip: '172.29.123.124', location: '上海虹桥', status: '有效' },
          { id: 'SES-PC-71B4', deviceId: 'device-pc-liang', loginAt: '2026-10-14 08:50:03', lastActiveAt: '2026-10-14 18:21:35', ip: '172.29.123.124', location: '上海虹桥', status: '已退出' },
        ],
      },
      {
        id: 'device-app-liang', type: '移动APP', name: '梁吉力的手机', manufacturer: 'Apple', model: 'iPhone 16 Pro', identifier: '5066e275-d070-3dbc-a6f1-91a2df19d228', serialNumber: 'H7QK21F9Y3', os: 'iOS 19.0.1', architecture: 'arm64', clientVersion: '6.7.3', clientChannel: '企业分发', installedAt: '2026-06-02 13:18:09', lastActiveAt: '2026-10-15 15:07:05', status: '在线', bound: true, trusted: true, securityStatus: '合规', securityMessage: '符合移动终端安全策略', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true,
        sessions: [{ id: 'SES-APP-3D91', deviceId: 'device-app-liang', loginAt: '2026-10-15 09:03:27', lastActiveAt: '2026-10-15 15:07:05', ip: '10.21.64.36', location: '上海虹桥', status: '有效' }],
      },
      { id: 'device-app-liang-2', type: '移动APP', name: '备用工作手机', manufacturer: 'Huawei', model: 'Mate 70 Pro', identifier: 'APP-74C1-9E22-18A0', serialNumber: 'HU70P29112', os: 'HarmonyOS 5.1', architecture: 'arm64', clientVersion: '6.7.2', clientChannel: '企业分发', installedAt: '2026-08-03 10:21:08', lastActiveAt: '2026-10-14 20:15:33', status: '离线', bound: false, trusted: false, securityStatus: '合规', securityMessage: '符合移动终端安全策略', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-APP-1C12', deviceId: 'device-app-liang-2', loginAt: '2026-10-14 07:59:21', lastActiveAt: '2026-10-14 20:15:33', ip: '10.21.82.19', location: '上海虹桥', status: '已退出' }] },
      { id: 'device-app-liang-3', type: '移动APP', name: '测试手机', manufacturer: 'Samsung', model: 'Galaxy S25 Ultra', identifier: 'APP-9C81-3F22-81B0', serialNumber: 'R5CX31A0ZZ', os: 'Android 16', architecture: 'arm64', clientVersion: '6.7.2', clientChannel: '企业分发', installedAt: '2026-09-18 16:42:51', lastActiveAt: '2026-10-12 17:33:20', status: '离线', bound: false, trusted: false, securityStatus: '合规', securityMessage: '符合移动终端安全策略', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-APP-7A20', deviceId: 'device-app-liang-3', loginAt: '2026-10-12 09:03:17', lastActiveAt: '2026-10-12 17:33:20', ip: '10.21.71.52', location: '上海浦东', status: '已退出' }] },
      { id: 'device-pc-liang-2', type: 'PC客户端', name: 'LJLI-HOME-PC', manufacturer: 'Dell', model: 'Latitude 7450', identifier: 'PC-9A20-71C2-D114', serialNumber: 'DL7450P028', os: 'Windows 11 企业版 24H2', architecture: 'x64', clientVersion: '3.8.2', clientChannel: '正式版', installedAt: '2026-09-02 18:14:32', lastActiveAt: '2026-10-14 22:08:41', status: '离线', bound: false, trusted: false, securityStatus: '合规', securityMessage: '符合公司 PC 终端安全基线', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-PC-2F91', deviceId: 'device-pc-liang-2', loginAt: '2026-10-14 19:02:18', lastActiveAt: '2026-10-14 22:08:41', ip: '116.233.18.71', location: '上海', status: '已退出' }] },
      { id: 'device-web-liang-1', type: '网页浏览器', name: 'Chrome', manufacturer: 'Google', model: 'Chrome 141', identifier: 'WEB-CHROME-7F12', serialNumber: '—', os: 'Windows 11', architecture: 'x64', clientVersion: '141.0.7390.55', clientChannel: '浏览器', installedAt: '—', lastActiveAt: '2026-10-15 15:34:44', lastIp: '172.29.123.124', status: '在线', bound: true, trusted: true, securityStatus: '合规', securityMessage: '网页登录环境与会话校验正常', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-WEB-7F12', deviceId: 'device-web-liang-1', loginAt: '2026-10-15 08:42:10', lastActiveAt: '2026-10-15 15:34:44', ip: '172.29.123.124', location: '上海虹桥', status: '有效' }] },
      { id: 'device-web-liang-2', type: '网页浏览器', name: 'Edge', manufacturer: 'Microsoft', model: 'Edge 141', identifier: 'WEB-EDGE-1A27', serialNumber: '—', os: 'Windows 11', architecture: 'x64', clientVersion: '141.0.3537.71', clientChannel: '浏览器', installedAt: '—', lastActiveAt: '2026-10-15 15:13:57', lastIp: '172.29.123.243', status: '离线', bound: false, trusted: false, securityStatus: '合规', securityMessage: '网页登录环境与会话校验正常', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-WEB-1A27', deviceId: 'device-web-liang-2', loginAt: '2026-10-15 10:03:11', lastActiveAt: '2026-10-15 15:13:57', ip: '172.29.123.243', location: '上海虹桥', status: '已退出' }] },
      { id: 'device-web-liang-3', type: '网页浏览器', name: 'Chrome', manufacturer: 'Google', model: 'Chrome 140', identifier: 'WEB-CHROME-6D18', serialNumber: '—', os: 'macOS 16', architecture: 'arm64', clientVersion: '140.0.7339.214', clientChannel: '浏览器', installedAt: '—', lastActiveAt: '2026-10-13 18:26:09', lastIp: '172.29.163.54', status: '离线', bound: false, trusted: false, securityStatus: '合规', securityMessage: '网页登录环境与会话校验正常', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-WEB-6D18', deviceId: 'device-web-liang-3', loginAt: '2026-10-13 09:21:40', lastActiveAt: '2026-10-13 18:26:09', ip: '172.29.163.54', location: '上海浦东', status: '已退出' }] },
      { id: 'device-web-liang-4', type: '网页浏览器', name: 'Firefox', manufacturer: 'Mozilla', model: 'Firefox 143', identifier: 'WEB-FIREFOX-0B92', serialNumber: '—', os: 'Windows 11', architecture: 'x64', clientVersion: '143.0.1', clientChannel: '浏览器', installedAt: '—', lastActiveAt: '2026-10-10 11:42:30', lastIp: '10.31.18.92', status: '离线', bound: false, trusted: false, securityStatus: '存在风险', securityMessage: '浏览器版本需要升级', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-WEB-0B92', deviceId: 'device-web-liang-4', loginAt: '2026-10-10 08:51:08', lastActiveAt: '2026-10-10 11:42:30', ip: '10.31.18.92', location: '外部网络', status: '已退出' }] },
    ],
  },
  {
    id: 'user-liubei', name: '刘备', account: 'liubei', company: '上海吉祥航空股份有限公司', department: '公司领导', employmentStatus: '在职', accountStatus: '正常',
    devices: [{
      id: 'device-pc-liubei', type: 'PC客户端', name: 'LIUBEI-NB01', manufacturer: 'Huawei', model: 'MateBook X Pro', identifier: 'PC-81C0-24E7-B110', serialNumber: 'MXL6T00K21', os: 'Windows 11 专业版 24H2', architecture: 'x64', clientVersion: '3.8.1', clientChannel: '正式版', installedAt: '2026-09-08 10:02:41', lastActiveAt: '2026-10-15 14:58:21', status: '在线', bound: true, trusted: false, securityStatus: '存在风险', securityMessage: '客户端版本落后，磁盘加密未开启', diskEncrypted: false, screenLockEnabled: true, antivirusEnabled: true,
      sessions: [{ id: 'SES-PC-19AC', deviceId: 'device-pc-liubei', loginAt: '2026-10-15 08:33:11', lastActiveAt: '2026-10-15 14:58:21', ip: '172.29.118.73', location: '上海浦东', status: '有效' }],
    }],
  },
  {
    id: 'user-guanyu', name: '关羽', account: 'guanyu', company: '上海吉祥航空股份有限公司', department: '市场部', employmentStatus: '在职', accountStatus: '正常',
    devices: [
      { id: 'device-pc-guanyu', type: 'PC客户端', name: 'GUANYU-DESKTOP', manufacturer: 'Dell', model: 'OptiPlex 7020', identifier: 'PC-01A7-84D1-C052', serialNumber: 'DL7020J811', os: 'Windows 10 企业版 22H2', architecture: 'x64', clientVersion: '3.7.9', clientChannel: '正式版', installedAt: '2026-04-18 15:24:09', lastActiveAt: '2026-10-14 18:42:12', status: '离线', bound: true, trusted: true, securityStatus: '存在风险', securityMessage: '操作系统版本即将停止支持', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-PC-7F12', deviceId: 'device-pc-guanyu', loginAt: '2026-10-14 08:15:39', lastActiveAt: '2026-10-14 18:42:12', ip: '172.29.96.51', location: '上海虹桥', status: '已退出' }] },
      { id: 'device-app-guanyu', type: '移动APP', name: 'Mate 70 Pro', manufacturer: 'Huawei', model: 'Mate 70 Pro', identifier: 'APP-74C1-9E22-18A0', serialNumber: 'HU70P29112', os: 'HarmonyOS 5.1', architecture: 'arm64', clientVersion: '6.7.2', clientChannel: '企业分发', installedAt: '2026-05-11 14:21:08', lastActiveAt: '2026-10-13 21:15:33', status: '离线', bound: true, trusted: true, securityStatus: '合规', securityMessage: '符合移动终端安全策略', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-APP-1C12', deviceId: 'device-app-guanyu', loginAt: '2026-10-13 07:59:21', lastActiveAt: '2026-10-13 21:15:33', ip: '10.21.82.19', location: '上海虹桥', status: '已退出' }] },
    ],
  },
  {
    id: 'user-zhangfei', name: '张飞', account: 'zhangfei', company: '上海吉祥航空股份有限公司', department: '信息技术部', employmentStatus: '在职', accountStatus: '正常',
    devices: [{ id: 'device-app-zhangfei', type: '移动APP', name: 'SM-S9380', manufacturer: 'Samsung', model: 'Galaxy S25 Ultra', identifier: '899e8e72-5c31-4ba4-a4e0-ef851d6a3fb2', serialNumber: 'R5CX31A0ZZ', os: 'Android 16', architecture: 'arm64', clientVersion: '6.7.2', clientChannel: '企业分发', installedAt: '2026-07-22 11:38:56', lastActiveAt: '2026-10-15 13:21:09', status: '离线', bound: true, trusted: true, securityStatus: '合规', securityMessage: '符合移动终端安全策略', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-APP-6B22', deviceId: 'device-app-zhangfei', loginAt: '2026-10-15 07:55:43', lastActiveAt: '2026-10-15 13:21:09', ip: '10.21.72.18', location: '上海虹桥', status: '已退出' }] }],
  },
  {
    id: 'user-caocao', name: '曹操', account: 'caocao', company: '上海吉祥航空股份有限公司', department: 'IT-PMO', employmentStatus: '在职', accountStatus: '正常',
    devices: [{ id: 'device-pc-caocao', type: 'PC客户端', name: 'CAOCAO-MAC', manufacturer: 'Apple', model: 'MacBook Pro 14', identifier: 'PC-29F0-11BE-1A70', serialNumber: 'C02Y91KQMD6T', os: 'macOS 16.0', architecture: 'arm64', clientVersion: '3.8.2', clientChannel: '正式版', installedAt: '2026-08-28 16:04:32', lastActiveAt: '2026-10-15 12:46:18', status: '在线', bound: false, trusted: false, securityStatus: '合规', securityMessage: '符合公司 PC 终端安全基线', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-PC-42CE', deviceId: 'device-pc-caocao', loginAt: '2026-10-15 09:12:06', lastActiveAt: '2026-10-15 12:46:18', ip: '172.29.130.22', location: '上海浦东', status: '有效' }] }],
  },
];

export const latestActiveAt = (user: DeviceUser) => [...user.devices].sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt))[0]?.lastActiveAt || '—';
export const onlineDeviceCount = (user: DeviceUser) => user.devices.filter(device => device.status === '在线').length;
export const riskDeviceCount = (user: DeviceUser) => user.devices.filter(device => device.securityStatus === '存在风险').length;
export const deviceTypeCount = (user: DeviceUser, type: DeviceType) => user.devices.filter(device => device.type === type).length;

/** 当前时间格式化为演示数据统一的 `YYYY-MM-DD HH:mm:ss` */
export const formatPrototypeTimestamp = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
