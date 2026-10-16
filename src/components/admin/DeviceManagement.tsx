import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Laptop,
  Link2,
  Link2Off,
  LogOut,
  Monitor,
  Search,
  ShieldCheck,
  Smartphone,
  UserRound,
  X,
} from 'lucide-react';

type DeviceType = 'PC客户端' | '移动APP' | '网页浏览器';
type DeviceStatus = '在线' | '离线';
type SecurityStatus = '合规' | '存在风险';

type DeviceSession = {
  id: string;
  deviceId: string;
  loginAt: string;
  lastActiveAt: string;
  ip: string;
  location: string;
  status: '有效' | '已退出';
};

type UserDevice = {
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

type DeviceUser = {
  id: string;
  name: string;
  account: string;
  company: string;
  department: string;
  employmentStatus: '在职' | '离职';
  accountStatus: '正常' | '停用';
  devices: UserDevice[];
};

type DeviceFilters = {
  keyword: string;
  department: string;
  employmentStatus: string;
  deviceOwnership: string;
  deviceCondition: string;
};

const DEFAULT_FILTERS: DeviceFilters = {
  keyword: '',
  department: '全部',
  employmentStatus: '全部',
  deviceOwnership: '全部设备',
  deviceCondition: '全部状态',
};

const initialUsers: DeviceUser[] = [
  {
    id: 'user-liang', name: '梁吉力', account: 'liangjie', company: '上海吉祥航空股份有限公司', department: '管理支撑产品处', employmentStatus: '在职', accountStatus: '正常',
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
    id: 'user-liubei', name: '刘备', account: 'liubei', company: '上海吉祥航空股份有限公司', department: '信息管理部', employmentStatus: '在职', accountStatus: '正常',
    devices: [{
      id: 'device-pc-liubei', type: 'PC客户端', name: 'LIUBEI-NB01', manufacturer: 'Huawei', model: 'MateBook X Pro', identifier: 'PC-81C0-24E7-B110', serialNumber: 'MXL6T00K21', os: 'Windows 11 专业版 24H2', architecture: 'x64', clientVersion: '3.8.1', clientChannel: '正式版', installedAt: '2026-09-08 10:02:41', lastActiveAt: '2026-10-15 14:58:21', status: '在线', bound: true, trusted: false, securityStatus: '存在风险', securityMessage: '客户端版本落后，磁盘加密未开启', diskEncrypted: false, screenLockEnabled: true, antivirusEnabled: true,
      sessions: [{ id: 'SES-PC-19AC', deviceId: 'device-pc-liubei', loginAt: '2026-10-15 08:33:11', lastActiveAt: '2026-10-15 14:58:21', ip: '172.29.118.73', location: '上海浦东', status: '有效' }],
    }],
  },
  {
    id: 'user-guanyu', name: '关羽', account: 'guanyu', company: '上海吉祥航空股份有限公司', department: '运行维修产品处', employmentStatus: '在职', accountStatus: '正常',
    devices: [
      { id: 'device-pc-guanyu', type: 'PC客户端', name: 'GUANYU-DESKTOP', manufacturer: 'Dell', model: 'OptiPlex 7020', identifier: 'PC-01A7-84D1-C052', serialNumber: 'DL7020J811', os: 'Windows 10 企业版 22H2', architecture: 'x64', clientVersion: '3.7.9', clientChannel: '正式版', installedAt: '2026-04-18 15:24:09', lastActiveAt: '2026-10-14 18:42:12', status: '离线', bound: true, trusted: true, securityStatus: '存在风险', securityMessage: '操作系统版本即将停止支持', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-PC-7F12', deviceId: 'device-pc-guanyu', loginAt: '2026-10-14 08:15:39', lastActiveAt: '2026-10-14 18:42:12', ip: '172.29.96.51', location: '上海虹桥', status: '已退出' }] },
      { id: 'device-app-guanyu', type: '移动APP', name: 'Mate 70 Pro', manufacturer: 'Huawei', model: 'Mate 70 Pro', identifier: 'APP-74C1-9E22-18A0', serialNumber: 'HU70P29112', os: 'HarmonyOS 5.1', architecture: 'arm64', clientVersion: '6.7.2', clientChannel: '企业分发', installedAt: '2026-05-11 14:21:08', lastActiveAt: '2026-10-13 21:15:33', status: '离线', bound: true, trusted: true, securityStatus: '合规', securityMessage: '符合移动终端安全策略', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-APP-1C12', deviceId: 'device-app-guanyu', loginAt: '2026-10-13 07:59:21', lastActiveAt: '2026-10-13 21:15:33', ip: '10.21.82.19', location: '上海虹桥', status: '已退出' }] },
    ],
  },
  {
    id: 'user-zhangfei', name: '张飞', account: 'zhangfei', company: '上海吉祥航空股份有限公司', department: '业务协同处', employmentStatus: '在职', accountStatus: '正常',
    devices: [{ id: 'device-app-zhangfei', type: '移动APP', name: 'SM-S9380', manufacturer: 'Samsung', model: 'Galaxy S25 Ultra', identifier: '899e8e72-5c31-4ba4-a4e0-ef851d6a3fb2', serialNumber: 'R5CX31A0ZZ', os: 'Android 16', architecture: 'arm64', clientVersion: '6.7.2', clientChannel: '企业分发', installedAt: '2026-07-22 11:38:56', lastActiveAt: '2026-10-15 13:21:09', status: '离线', bound: true, trusted: true, securityStatus: '合规', securityMessage: '符合移动终端安全策略', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-APP-6B22', deviceId: 'device-app-zhangfei', loginAt: '2026-10-15 07:55:43', lastActiveAt: '2026-10-15 13:21:09', ip: '10.21.72.18', location: '上海虹桥', status: '已退出' }] }],
  },
  {
    id: 'user-caocao', name: '曹操', account: 'caocao', company: '上海吉祥航空股份有限公司', department: '数字化中心', employmentStatus: '在职', accountStatus: '正常',
    devices: [{ id: 'device-pc-caocao', type: 'PC客户端', name: 'CAOCAO-MAC', manufacturer: 'Apple', model: 'MacBook Pro 14', identifier: 'PC-29F0-11BE-1A70', serialNumber: 'C02Y91KQMD6T', os: 'macOS 16.0', architecture: 'arm64', clientVersion: '3.8.2', clientChannel: '正式版', installedAt: '2026-08-28 16:04:32', lastActiveAt: '2026-10-15 12:46:18', status: '在线', bound: false, trusted: false, securityStatus: '合规', securityMessage: '符合公司 PC 终端安全基线', diskEncrypted: true, screenLockEnabled: true, antivirusEnabled: true, sessions: [{ id: 'SES-PC-42CE', deviceId: 'device-pc-caocao', loginAt: '2026-10-15 09:12:06', lastActiveAt: '2026-10-15 12:46:18', ip: '172.29.130.22', location: '上海浦东', status: '有效' }] }],
  },
];

const latestActiveAt = (user: DeviceUser) => [...user.devices].sort((a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt))[0]?.lastActiveAt || '—';
const onlineDeviceCount = (user: DeviceUser) => user.devices.filter(device => device.status === '在线').length;
const riskDeviceCount = (user: DeviceUser) => user.devices.filter(device => device.securityStatus === '存在风险').length;
const deviceTypeCount = (user: DeviceUser, type: DeviceType) => user.devices.filter(device => device.type === type).length;

function DeviceTypeIcon({ type, size = 16 }: { type: DeviceType; size?: number }) {
  if (type === 'PC客户端') return <Monitor size={size} className="text-[#2f75b5]" />;
  if (type === '移动APP') return <Smartphone size={size} className="text-pink-600" />;
  return <Globe2 size={size} className="text-emerald-600" />;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="min-w-0"><div className="text-xs text-gray-400">{label}</div><div className="mt-1 break-words text-sm font-medium text-gray-800">{value || '—'}</div></div>;
}

export default function DeviceManagement() {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'devices' | 'sessions'>('devices');
  const [detailDeviceId, setDetailDeviceId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [department, setDepartment] = useState('全部');
  const [employmentStatus, setEmploymentStatus] = useState('全部');
  const [deviceOwnership, setDeviceOwnership] = useState('全部设备');
  const [deviceCondition, setDeviceCondition] = useState('全部状态');
  const [appliedFilters, setAppliedFilters] = useState<DeviceFilters>(DEFAULT_FILTERS);
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; run: () => void } | null>(null);
  const [toast, setToast] = useState('');

  const selectedUser = users.find(user => user.id === selectedUserId) || null;
  const departments = useMemo(() => Array.from(new Set(users.map(user => user.department))), [users]);
  const filteredUsers = useMemo(() => {
    const normalizedKeyword = appliedFilters.keyword.trim().toLowerCase();
    return users.filter(user => {
      const matchesKeyword = !normalizedKeyword || [user.name, user.account, user.company, user.department, ...user.devices.flatMap(device => [device.name, device.model, device.identifier])].some(value => value.toLowerCase().includes(normalizedKeyword));
      const matchesOwnership = appliedFilters.deviceOwnership === '全部设备'
        || (appliedFilters.deviceOwnership === '拥有PC客户端' && deviceTypeCount(user, 'PC客户端') > 0)
        || (appliedFilters.deviceOwnership === '拥有移动APP' && deviceTypeCount(user, '移动APP') > 0)
        || (appliedFilters.deviceOwnership === '拥有网页浏览器' && deviceTypeCount(user, '网页浏览器') > 0)
        || (appliedFilters.deviceOwnership === '同时拥有客户端和APP' && deviceTypeCount(user, 'PC客户端') > 0 && deviceTypeCount(user, '移动APP') > 0);
      const matchesCondition = appliedFilters.deviceCondition === '全部状态'
        || (appliedFilters.deviceCondition === '存在在线设备' && onlineDeviceCount(user) > 0)
        || (appliedFilters.deviceCondition === '存在风险设备' && riskDeviceCount(user) > 0)
        || (appliedFilters.deviceCondition === '存在未绑定设备' && user.devices.some(device => !device.bound));
      return matchesKeyword
        && (appliedFilters.department === '全部' || user.department === appliedFilters.department)
        && (appliedFilters.employmentStatus === '全部' || user.employmentStatus === appliedFilters.employmentStatus)
        && matchesOwnership
        && matchesCondition;
    });
  }, [appliedFilters, users]);

  const allFilteredSelected = filteredUsers.length > 0 && filteredUsers.every(user => selectedUserIds.includes(user.id));

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const updateDevice = (userId: string, deviceId: string, updater: (device: UserDevice) => UserDevice) => {
    setUsers(current => current.map(user => user.id === userId ? { ...user, devices: user.devices.map(device => device.id === deviceId ? updater(device) : device) } : user));
  };

  const logoutDevices = (userIds: string[], deviceId?: string) => setConfirmAction({
    title: deviceId ? '退出该设备登录' : `退出 ${userIds.length} 名用户的全部设备`,
    message: '确认后相关设备的有效会话将立即失效，用户需要重新登录。',
    run: () => {
      setUsers(current => current.map(user => userIds.includes(user.id) ? { ...user, devices: user.devices.map(device => !deviceId || device.id === deviceId ? { ...device, status: '离线', sessions: device.sessions.map(session => ({ ...session, status: '已退出' })) } : device) } : user));
      setSelectedUserIds([]);
      showToast('登录会话已退出');
    },
  });

  const unbindDevice = (userId: string, deviceId: string) => setConfirmAction({
    title: '解绑设备',
    message: '解绑后设备将失去绑定和可信关系，但设备记录与历史登录记录仍会保留。',
    run: () => {
      updateDevice(userId, deviceId, device => ({ ...device, bound: false, trusted: false }));
      showToast('设备已解绑');
    },
  });

  const bindDevice = (userId: string, deviceId: string) => {
    const user = users.find(item => item.id === userId);
    const target = user?.devices.find(item => item.id === deviceId);
    if (!user || !target) return;
    if (user.devices.some(item => item.id !== deviceId && item.type === target.type && item.bound)) {
      showToast(`${target.type}已有绑定设备，请先解绑`);
      return;
    }
    updateDevice(userId, deviceId, item => ({ ...item, bound: true }));
    showToast('设备已绑定');
  };

  const resetFilters = () => {
    setKeyword('');
    setDepartment('全部');
    setEmploymentStatus('全部');
    setDeviceOwnership('全部设备');
    setDeviceCondition('全部状态');
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const applyFilters = () => setAppliedFilters({ keyword: keyword.trim(), department, employmentStatus, deviceOwnership, deviceCondition });

  if (selectedUser) {
    const sessions = selectedUser.devices.flatMap(device => device.sessions.map(session => ({ ...session, deviceName: device.name, deviceType: device.type })));
    const detailDevice = selectedUser.devices.find(device => device.id === detailDeviceId) || null;
    return (
      <div className="min-h-[calc(100vh-9rem)] bg-[#eef1f5] text-sm text-gray-800">
        {toast && <div className="fixed right-8 top-20 z-[80] rounded bg-gray-900 px-4 py-2 text-white shadow-lg">{toast}</div>}
        <header className="border-b border-gray-200 bg-white px-6 py-5">
          <button type="button" onClick={() => setSelectedUserId(null)} className="mb-4 inline-flex items-center gap-1 text-gray-500 hover:text-[#2f75b5]"><ArrowLeft size={16} />返回设备列表</button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-[#2f75b5]"><UserRound size={23} /></span><div><div className="flex items-center gap-2"><h2 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h2><span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">{selectedUser.accountStatus}</span></div><p className="mt-1 text-gray-500">{selectedUser.account} · {selectedUser.department} · {selectedUser.employmentStatus}</p></div></div>
            <button type="button" disabled={onlineDeviceCount(selectedUser) === 0} onClick={() => logoutDevices([selectedUser.id])} className="inline-flex h-9 items-center gap-1.5 rounded border border-gray-300 px-3 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"><LogOut size={15} />退出全部设备</button>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-4 p-5 pb-0 lg:grid-cols-5">
          {[{ label: '设备总数', value: selectedUser.devices.length, icon: <Laptop size={18} />, tone: 'bg-blue-50 text-[#2f75b5]' }, { label: 'PC 客户端', value: deviceTypeCount(selectedUser, 'PC客户端'), icon: <Monitor size={18} />, tone: 'bg-indigo-50 text-indigo-700' }, { label: '移动 APP', value: deviceTypeCount(selectedUser, '移动APP'), icon: <Smartphone size={18} />, tone: 'bg-pink-50 text-pink-700' }, { label: '网页浏览器', value: deviceTypeCount(selectedUser, '网页浏览器'), icon: <Globe2 size={18} />, tone: 'bg-emerald-50 text-emerald-700' }, { label: '风险设备', value: riskDeviceCount(selectedUser), icon: <AlertTriangle size={18} />, tone: 'bg-red-50 text-red-700' }].map(item => <div key={item.label} className="flex items-center gap-3 bg-white p-4 shadow-sm"><span className={`flex h-10 w-10 items-center justify-center rounded ${item.tone}`}>{item.icon}</span><div><div className="text-xs text-gray-500">{item.label}</div><div className="mt-1 text-xl font-semibold text-gray-900">{item.value}</div></div></div>)}
        </div>

        <div className="p-5">
          <section className="bg-white shadow-sm">
            <div className="flex border-b border-gray-200 px-6 pt-2">
              <button type="button" onClick={() => setDetailTab('devices')} className={`mr-8 border-b-2 px-1 py-3 ${detailTab === 'devices' ? 'border-[#2f75b5] font-medium text-[#2f75b5]' : 'border-transparent text-gray-500'}`}>设备列表 ({selectedUser.devices.length})</button>
              <button type="button" onClick={() => setDetailTab('sessions')} className={`border-b-2 px-1 py-3 ${detailTab === 'sessions' ? 'border-[#2f75b5] font-medium text-[#2f75b5]' : 'border-transparent text-gray-500'}`}>登录记录 ({sessions.length})</button>
            </div>

            {detailTab === 'devices' && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">终端类型</th>
                      <th className="px-4 py-3 font-medium">设备名称</th>
                      <th className="px-4 py-3 font-medium">品牌 / 型号</th>
                      <th className="px-4 py-3 font-medium">操作系统</th>
                      <th className="px-4 py-3 font-medium">客户端版本</th>
                      <th className="px-4 py-3 font-medium">绑定 / 可信</th>
                      <th className="px-4 py-3 font-medium">安全状态</th>
                      <th className="px-4 py-3 font-medium">IP 地址</th>
                      <th className="px-4 py-3 font-medium">最后活跃</th>
                      <th className="px-4 py-3 font-medium">状态</th>
                      <th className="w-52 px-4 py-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedUser.devices.map(device => {
                      const validSessions = device.sessions.filter(session => session.status === '有效').length;
                      return (
                        <tr key={device.id} className="hover:bg-[#f5f9fd]">
                          <td className="px-4 py-4"><span className="inline-flex items-center gap-2 text-gray-700"><DeviceTypeIcon type={device.type} />{device.type}</span></td>
                          <td className="px-4 py-4 font-medium text-gray-900">{device.name}</td>
                          <td className="px-4 py-4"><div>{device.manufacturer}</div><div className="mt-1 text-xs text-gray-500">{device.model}</div></td>
                          <td className="px-4 py-4"><div>{device.os}</div><div className="mt-1 text-xs text-gray-500">{device.architecture}</div></td>
                          <td className="px-4 py-4"><div>v{device.clientVersion}</div><div className="mt-1 text-xs text-gray-500">{device.clientChannel}</div></td>
                          <td className="px-4 py-4"><div>{device.bound ? '已绑定' : '未绑定'}</div><div className="mt-1 text-xs text-gray-500">{device.trusted ? '可信设备' : '非可信设备'}</div></td>
                          <td className="px-4 py-4">{device.securityStatus === '合规' ? <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"><CheckCircle2 size={13} />合规</span> : <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs text-red-700"><AlertTriangle size={13} />存在风险</span>}</td>
                          <td className="px-4 py-4 text-gray-600">{device.type === '网页浏览器' ? device.lastIp : '—'}</td>
                          <td className="px-4 py-4">{device.lastActiveAt}</td>
                          <td className="px-4 py-4"><span className={`rounded px-2 py-1 text-xs ${device.status === '在线' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{device.status}</span></td>
                          <td className="px-4 py-4 whitespace-nowrap"><button type="button" onClick={() => setDetailDeviceId(device.id)} className="mr-3 text-[#2f75b5] hover:underline">详情</button><button type="button" disabled={validSessions === 0} onClick={() => logoutDevices([selectedUser.id], device.id)} className="mr-3 text-[#2f75b5] hover:underline disabled:text-gray-300 disabled:no-underline">退出</button>{device.bound ? <button type="button" onClick={() => unbindDevice(selectedUser.id, device.id)} className="text-red-600 hover:underline">解绑</button> : <button type="button" onClick={() => bindDevice(selectedUser.id, device.id)} className="text-[#2f75b5] hover:underline">绑定</button>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {detailTab === 'sessions' && <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead className="bg-gray-50 text-gray-600"><tr><th className="px-5 py-3 font-medium">设备</th><th className="px-5 py-3 font-medium">会话 ID</th><th className="px-5 py-3 font-medium">登录时间</th><th className="px-5 py-3 font-medium">最后活跃</th><th className="px-5 py-3 font-medium">IP / 地点</th><th className="px-5 py-3 font-medium">状态</th></tr></thead><tbody className="divide-y divide-gray-100">{sessions.sort((a, b) => b.loginAt.localeCompare(a.loginAt)).map(session => <tr key={session.id}><td className="px-5 py-4"><div className="font-medium text-gray-800">{session.deviceName}</div><div className="mt-1 text-xs text-gray-400">{session.deviceType}</div></td><td className="px-5 py-4 font-mono text-xs">{session.id}</td><td className="px-5 py-4 text-gray-600">{session.loginAt}</td><td className="px-5 py-4 text-gray-600">{session.lastActiveAt}</td><td className="px-5 py-4"><div>{session.ip}</div><div className="mt-1 text-xs text-gray-400">{session.location}</div></td><td className="px-5 py-4"><span className={session.status === '有效' ? 'text-emerald-700' : 'text-gray-400'}>{session.status}</span></td></tr>)}</tbody></table></div>}
          </section>
        </div>

        {detailDevice && (
          <div className="fixed inset-0 z-[70] flex justify-end bg-black/30" onMouseDown={event => { if (event.target === event.currentTarget) setDetailDeviceId(null); }}>
            <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
                <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-blue-50"><DeviceTypeIcon type={detailDevice.type} size={20} /></span><div className="min-w-0"><h3 className="truncate text-lg font-semibold text-gray-900">{detailDevice.name}</h3><p className="mt-1 text-xs text-gray-500">{detailDevice.type} · {detailDevice.manufacturer} {detailDevice.model}</p></div></div>
                <button type="button" onClick={() => setDetailDeviceId(null)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X size={19} /></button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <section><h4 className="mb-4 font-semibold text-gray-900">设备详情</h4><div className="grid gap-x-8 gap-y-5 sm:grid-cols-2"><Field label="设备标识" value={detailDevice.identifier} /><Field label="序列号" value={detailDevice.serialNumber} /><Field label="操作系统" value={detailDevice.os} /><Field label="系统架构" value={detailDevice.architecture} /><Field label="客户端版本" value={`v${detailDevice.clientVersion}`} /><Field label="发布渠道" value={detailDevice.clientChannel} /><Field label="首次安装" value={detailDevice.installedAt} />{detailDevice.type === '网页浏览器' && <Field label="IP 地址" value={detailDevice.lastIp} />}</div></section>
                <section className="mt-7 border-t border-gray-100 pt-6"><div className="mb-4 flex items-center justify-between"><h4 className="font-semibold text-gray-900">安全基线</h4><span className={`rounded px-2 py-1 text-xs ${detailDevice.securityStatus === '合规' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{detailDevice.securityStatus}</span></div><p className={`mb-4 rounded px-3 py-2 text-xs leading-5 ${detailDevice.securityStatus === '合规' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{detailDevice.securityMessage}</p><div className="divide-y divide-gray-100 border-y border-gray-100">{[{ label: '设备加密', ok: detailDevice.diskEncrypted }, { label: '屏幕锁定', ok: detailDevice.screenLockEnabled }, { label: '安全防护', ok: detailDevice.antivirusEnabled }, { label: '可信设备', ok: detailDevice.trusted }].map(item => <div key={item.label} className="flex items-center justify-between py-3"><span className="text-gray-700">{item.label}</span><span className={`inline-flex items-center gap-1 text-xs ${item.ok ? 'text-emerald-700' : 'text-red-600'}`}>{item.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}{item.ok ? '正常' : '未开启'}</span></div>)}</div></section>
                <section className="mt-7 border-t border-gray-100 pt-6"><h4 className="mb-4 font-semibold text-gray-900">设备会话</h4><div className="space-y-2">{detailDevice.sessions.map(session => <div key={session.id} className="border border-gray-100 bg-gray-50 px-3 py-3"><div className="flex items-center justify-between"><span className="font-mono text-xs text-gray-700">{session.id}</span><span className={session.status === '有效' ? 'text-xs text-emerald-700' : 'text-xs text-gray-400'}>{session.status}</span></div><div className="mt-2 text-xs text-gray-500">{session.ip} · {session.location}</div><div className="mt-1 text-xs text-gray-400">登录 {session.loginAt} · 最后活跃 {session.lastActiveAt}</div></div>)}</div></section>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4"><button type="button" onClick={() => updateDevice(selectedUser.id, detailDevice.id, item => ({ ...item, trusted: !item.trusted }))} className="inline-flex h-9 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-gray-700 hover:bg-gray-50"><ShieldCheck size={15} />{detailDevice.trusted ? '取消可信' : '设为可信'}</button><div className="flex gap-2"><button type="button" disabled={detailDevice.sessions.every(session => session.status !== '有效')} onClick={() => logoutDevices([selectedUser.id], detailDevice.id)} className="inline-flex h-9 items-center gap-1.5 rounded border border-gray-300 bg-white px-3 text-gray-700 hover:bg-gray-50 disabled:opacity-40"><LogOut size={15} />退出登录</button>{detailDevice.bound ? <button type="button" onClick={() => unbindDevice(selectedUser.id, detailDevice.id)} className="inline-flex h-9 items-center gap-1.5 rounded border border-red-200 bg-white px-3 text-red-600 hover:bg-red-50"><Link2Off size={15} />解绑设备</button> : <button type="button" onClick={() => bindDevice(selectedUser.id, detailDevice.id)} className="inline-flex h-9 items-center gap-1.5 rounded border border-blue-200 bg-white px-3 text-[#2f75b5] hover:bg-blue-50"><Link2 size={15} />绑定设备</button>}</div></div>
            </aside>
          </div>
        )}
        {confirmAction && <ConfirmDialog action={confirmAction} onClose={() => setConfirmAction(null)} />}
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-9rem)] bg-[#eef1f5] text-sm text-gray-800">
      {toast && <div className="fixed right-8 top-20 z-[80] rounded bg-gray-900 px-4 py-2 text-white shadow-lg">{toast}</div>}
      <header className="bg-white px-6 py-5"><h2 className="text-2xl font-semibold text-gray-900">设备管理</h2><p className="mt-1 text-gray-500">按人员统一查看移动 APP、PC 客户端与网页浏览器的登录状态和安全风险。</p></header>

      <div className="space-y-4 p-5">
        <section className="border border-gray-200 bg-white px-6 py-5">
          <div className="grid grid-cols-[100px_minmax(220px,1.4fr)_100px_minmax(180px,1fr)_100px_minmax(180px,1fr)] items-center gap-4 max-xl:grid-cols-[100px_1fr]">
            <span className="text-right text-sm text-gray-700 max-xl:text-left">关键词</span>
            <input value={keyword} onChange={event => setKeyword(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') applyFilters(); }} placeholder="姓名、账号、设备名称或标识" className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
            <span className="text-right text-sm text-gray-700 max-xl:text-left">部门</span>
            <select value={department} onChange={event => setDepartment(event.target.value)} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#2f75b5]"><option>全部</option>{departments.map(item => <option key={item}>{item}</option>)}</select>
            <span className="text-right text-sm text-gray-700 max-xl:text-left">在职情况</span>
            <select value={employmentStatus} onChange={event => setEmploymentStatus(event.target.value)} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#2f75b5]"><option>全部</option><option>在职</option><option>离职</option></select>
            <span className="text-right text-sm text-gray-700 max-xl:text-left">设备构成</span>
            <select value={deviceOwnership} onChange={event => setDeviceOwnership(event.target.value)} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#2f75b5]"><option>全部设备</option><option>拥有PC客户端</option><option>拥有移动APP</option><option>拥有网页浏览器</option><option>同时拥有客户端和APP</option></select>
            <span className="text-right text-sm text-gray-700 max-xl:text-left">设备状态</span>
            <select value={deviceCondition} onChange={event => setDeviceCondition(event.target.value)} className="h-10 rounded border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#2f75b5]"><option>全部状态</option><option>存在在线设备</option><option>存在风险设备</option><option>存在未绑定设备</option></select>
            <div className="col-span-2 flex items-center gap-3 max-xl:col-span-2">
              <button type="button" onClick={applyFilters} className="h-10 rounded bg-[#2f75b5] px-5 text-sm font-medium text-white hover:bg-[#28669f]">查询</button>
              <button type="button" onClick={resetFilters} className="h-10 rounded border border-gray-300 bg-white px-5 text-sm text-gray-600 hover:bg-gray-50">重置</button>
            </div>
          </div>
        </section>
        <section className="bg-white shadow-sm">
        <div className="flex min-h-12 items-center justify-between gap-3 border-b border-gray-100 px-5 py-2"><span className="text-xs text-gray-500">共 {filteredUsers.length} 人{selectedUserIds.length > 0 ? `，已选择 ${selectedUserIds.length} 人` : ''}</span>{selectedUserIds.length > 0 && <button type="button" onClick={() => logoutDevices(selectedUserIds)} className="inline-flex h-8 items-center gap-1 rounded border border-gray-300 px-3 text-xs text-gray-700 hover:bg-gray-50"><LogOut size={14} />批量退出全部设备</button>}</div>
        <div className="overflow-x-auto"><table className="w-full min-w-[1180px] text-left"><thead className="bg-gray-50 text-gray-600"><tr><th className="w-12 px-4 py-3"><input type="checkbox" checked={allFilteredSelected} onChange={event => setSelectedUserIds(event.target.checked ? filteredUsers.map(user => user.id) : [])} className="h-4 w-4 accent-[#2f75b5]" /></th><th className="px-4 py-3 font-medium">人员</th><th className="px-4 py-3 font-medium">公司 / 部门</th><th className="px-4 py-3 font-medium">在职情况</th><th className="px-4 py-3 font-medium">设备构成</th><th className="px-4 py-3 font-medium">在线设备</th><th className="px-4 py-3 font-medium">最后活跃</th><th className="px-4 py-3 font-medium">安全状态</th><th className="w-44 px-4 py-3 font-medium">操作</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredUsers.map(user => { const riskCount = riskDeviceCount(user); return <tr key={user.id} className="hover:bg-[#f5f9fd]"><td className="px-4 py-4"><input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={event => setSelectedUserIds(current => event.target.checked ? [...current, user.id] : current.filter(id => id !== user.id))} className="h-4 w-4 accent-[#2f75b5]" /></td><td className="px-4 py-4"><div className="font-medium text-gray-900">{user.name}</div><div className="mt-1 text-xs text-gray-500">{user.account}</div></td><td className="px-4 py-4"><div className="text-gray-800">{user.company}</div><div className="mt-1 text-xs text-gray-500">{user.department}</div></td><td className="px-4 py-4"><span className="rounded bg-emerald-50 px-2 py-1 text-xs text-emerald-700">{user.employmentStatus}</span></td><td className="px-4 py-4"><div className="font-medium">共 {user.devices.length} 台</div><div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-500"><span>PC {deviceTypeCount(user, 'PC客户端')}</span><span>APP {deviceTypeCount(user, '移动APP')}</span><span>网页 {deviceTypeCount(user, '网页浏览器')}</span></div></td><td className="px-4 py-4"><span className="font-medium text-emerald-700">{onlineDeviceCount(user)}</span><span className="text-gray-400"> / {user.devices.length}</span></td><td className="px-4 py-4 text-gray-600">{latestActiveAt(user)}</td><td className="px-4 py-4">{riskCount > 0 ? <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-1 text-xs text-red-700"><AlertTriangle size={13} />{riskCount} 台风险</span> : <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700"><CheckCircle2 size={13} />全部合规</span>}</td><td className="px-4 py-4"><button type="button" onClick={() => { setSelectedUserId(user.id); setDetailTab('devices'); }} className="mr-4 text-[#2f75b5] hover:underline">详情</button><button type="button" disabled={onlineDeviceCount(user) === 0} onClick={() => logoutDevices([user.id])} className="text-[#2f75b5] hover:underline disabled:text-gray-300 disabled:no-underline">全部退出</button></td></tr>; })}{filteredUsers.length === 0 && <tr><td colSpan={9} className="px-4 py-16 text-center text-gray-400"><Search size={28} className="mx-auto mb-3 text-gray-300" />暂无匹配人员</td></tr>}</tbody></table></div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 text-sm text-gray-500"><span>共 {filteredUsers.length} 条</span><span>20 条/页</span></div>
        </section>
      </div>
      {confirmAction && <ConfirmDialog action={confirmAction} onClose={() => setConfirmAction(null)} />}
    </div>
  );
}

function ConfirmDialog({ action, onClose }: { action: { title: string; message: string; run: () => void }; onClose: () => void }) {
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/35 p-4"><div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><h3 className="text-lg font-semibold text-gray-900">{action.title}</h3><button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={19} /></button></div><p className="mt-3 text-sm leading-6 text-gray-500">{action.message}</p><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded border border-gray-300 px-4 py-2 text-gray-700">取消</button><button type="button" onClick={() => { action.run(); onClose(); }} className="rounded bg-red-600 px-4 py-2 font-medium text-white">确认执行</button></div></div></div>;
}
