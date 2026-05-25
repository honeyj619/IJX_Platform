import { useState } from 'react';
import { useThemeStore, Skin } from '../store/themeStore';
import {
  Sun, Moon, Bell, Lock, Globe, Database, Info, Settings as SettingsIcon,
  Smartphone, Monitor, Trash2, RefreshCw, ExternalLink, Check, X
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';

/* ── Toggle Switch ── */
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-theme-500' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

/* ── Section Card Wrapper ── */
function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{description}</p>}
      {children}
    </div>
  );
}

/* ── Setting Row ── */
function SettingRow({
  label, description, right,
}: {
  label: string; description?: string; right: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0 ml-4">{right}</div>
    </div>
  );
}

/* ── Select ── */
function StyledSelect({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-theme-500 focus:border-transparent"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

/* ── Prompt: 登录设备模拟数据 ── */
const loginDevices = [
  { id: 1, name: 'Windows PC - Edge', location: '上海', ip: '58.37.xxx.xxx', lastActive: '刚刚', current: true },
  { id: 2, name: 'iPhone 16 Pro - App', location: '上海', ip: '114.92.xxx.xxx', lastActive: '2 小时前', current: false },
  { id: 3, name: 'MacBook Pro - Chrome', location: '北京', ip: '123.116.xxx.xxx', lastActive: '3 天前', current: false },
];

const loginHistory = [
  { time: '2026-05-25 14:20', location: '上海', ip: '58.37.xxx.xxx', device: 'Windows PC - Edge' },
  { time: '2026-05-25 09:15', location: '上海', ip: '114.92.xxx.xxx', device: 'iPhone 16 Pro - App' },
  { time: '2026-05-24 18:30', location: '上海', ip: '58.37.xxx.xxx', device: 'Windows PC - Edge' },
];

/* ═══════════════════════ Main Component ═══════════════════════ */
export default function Settings() {
  const { mode, skin, setMode, setSkin } = useThemeStore();

  const [activeTab, setActiveTab] = useState('appearance');

  /* notification */
  const [notifSound, setNotifSound] = useState(true);
  const [notifDesktop, setNotifDesktop] = useState(true);
  const [notifTaskbar, setNotifTaskbar] = useState(true);
  const [callNotify, setCallNotify] = useState(true);
  const [callRing, setCallRing] = useState(true);

  /* language */
  const [language, setLanguage] = useState('zh-CN');
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');

  /* storage */
  const [autoClean, setAutoClean] = useState('never');

  /* privacy */
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [devices, setDevices] = useState(loginDevices);

  /* inline Palette icon (avoids importing from lucide) */
  const PaletteIcon = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" /><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );

  const tabs = [
    { id: 'appearance', label: '外观设置', icon: <PaletteIcon size={20} /> },
    { id: 'notifications', label: '通知设置', icon: <Bell size={20} /> },
    { id: 'privacy', label: '隐私安全', icon: <Lock size={20} /> },
    { id: 'language', label: '语言地区', icon: <Globe size={20} /> },
    { id: 'storage', label: '存储管理', icon: <Database size={20} /> },
    { id: 'about', label: '关于', icon: <Info size={20} /> },
  ];

  const skins: { value: Skin; name: string; color: string }[] = [
    { value: 'pink', name: '樱花粉', color: '#ec4899' },
    { value: 'blue', name: '天空蓝', color: '#3b82f6' },
    { value: 'purple', name: '紫罗兰', color: '#a855f7' },
    { value: 'green', name: '薄荷绿', color: '#22c55e' },
    { value: 'orange', name: '日落橙', color: '#f97316' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      /* ── 外观设置 ── */
      case 'appearance':
        return (
          <div className="space-y-6">
            <SectionCard title="显示模式" description="选择您喜欢的显示模式">
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('light')}
                  className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    mode === 'light'
                      ? 'border-theme-500 bg-theme-50 dark:bg-theme-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    mode === 'light' ? 'bg-theme-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Sun size={32} />
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${mode === 'light' ? 'text-theme-700 dark:text-theme-300' : 'text-gray-900 dark:text-white'}`}>
                      明亮模式
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">适合日间使用</div>
                  </div>
                  {mode === 'light' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-theme-500 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setMode('dark')}
                  className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    mode === 'dark'
                      ? 'border-theme-500 bg-theme-50 dark:bg-theme-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    mode === 'dark' ? 'bg-theme-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Moon size={32} />
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${mode === 'dark' ? 'text-theme-700 dark:text-theme-300' : 'text-gray-900 dark:text-white'}`}>
                      暗黑模式
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">适合夜间使用</div>
                  </div>
                  {mode === 'dark' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-theme-500 rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              </div>
            </SectionCard>

            <SectionCard title="主题颜色" description="选择您喜欢的主题色">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {skins.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSkin(s.value)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      skin === s.value
                        ? 'border-theme-500 bg-theme-50 dark:bg-theme-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                        skin === s.value ? 'scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: s.color }}
                    >
                      {skin === s.value && (
                        <Check size={20} className="text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      skin === s.value ? 'text-theme-700 dark:text-theme-300' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        );

      /* ── 通知设置 ── */
      case 'notifications':
        return (
          <div className="space-y-6">
            <SectionCard title="消息通知">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                <SettingRow label="新消息提示音" right={<Toggle enabled={notifSound} onChange={setNotifSound} />} />
                <SettingRow label="新消息桌面通知" right={<Toggle enabled={notifDesktop} onChange={setNotifDesktop} />} />
                <SettingRow label="新消息任务栏图标" right={<Toggle enabled={notifTaskbar} onChange={setNotifTaskbar} />} />
              </div>
            </SectionCard>

            <SectionCard title="通话通知">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                <SettingRow label="通话通知" description="收到通话时弹窗提醒" right={<Toggle enabled={callNotify} onChange={setCallNotify} />} />
                <SettingRow label="通话铃声" right={<Toggle enabled={callRing} onChange={setCallRing} />} />
              </div>
            </SectionCard>
          </div>
        );

      /* ── 隐私安全 ── */
      case 'privacy':
        return (
          <div className="space-y-6">
            {/* 修改密码 */}
            <SectionCard title="修改密码">
              {!showPwdForm ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">上次修改：3 个月前</span>
                  <button
                    onClick={() => setShowPwdForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-theme-500 hover:bg-theme-600 rounded-lg transition-colors"
                  >
                    修改密码
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">旧密码</label>
                    <input
                      type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-theme-500 focus:border-transparent"
                      placeholder="输入旧密码"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">新密码</label>
                    <input
                      type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-theme-500 focus:border-transparent"
                      placeholder="输入新密码（至少8位）"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">确认新密码</label>
                    <input
                      type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-theme-500 focus:border-transparent"
                      placeholder="再次输入新密码"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 text-sm font-medium text-white bg-theme-500 hover:bg-theme-600 rounded-lg transition-colors">
                      确认修改
                    </button>
                    <button
                      onClick={() => { setShowPwdForm(false); setOldPwd(''); setNewPwd(''); setConfirmPwd(''); }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* 登录设备管理 */}
            <SectionCard title="登录设备管理">
              <div className="space-y-3">
                {devices.map((d) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-theme-100 dark:bg-theme-900/30 flex items-center justify-center">
                        {d.name.includes('PC') || d.name.includes('MacBook') ? (
                          <Monitor size={18} className="text-theme-600" />
                        ) : (
                          <Smartphone size={18} className="text-theme-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{d.name}</span>
                          {d.current && (
                            <span className="px-1.5 py-0.5 text-xs rounded bg-theme-100 dark:bg-theme-900/30 text-theme-700 dark:text-theme-300">
                              当前设备
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {d.location} · IP: {d.ip} · {d.lastActive}
                        </div>
                      </div>
                    </div>
                    {!d.current && (
                      <button
                        onClick={() => setDevices(devices.filter((x) => x.id !== d.id))}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* 最近登录记录 */}
            <SectionCard title="最近登录记录">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">时间</th>
                      <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">地点</th>
                      <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">IP</th>
                      <th className="text-left py-2 font-medium text-gray-500 dark:text-gray-400">设备</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map((log, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2.5 text-gray-900 dark:text-white">{log.time}</td>
                        <td className="py-2.5 text-gray-600 dark:text-gray-400">{log.location}</td>
                        <td className="py-2.5 text-gray-600 dark:text-gray-400 font-mono text-xs">{log.ip}</td>
                        <td className="py-2.5 text-gray-600 dark:text-gray-400">{log.device}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        );

      /* ── 语言地区 ── */
      case 'language':
        return (
          <div className="space-y-6">
            <SectionCard title="语言与地区">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                <SettingRow
                  label="界面语言"
                  right={
                    <StyledSelect value={language} onChange={setLanguage} options={[
                      { value: 'zh-CN', label: '简体中文' },
                      { value: 'zh-TW', label: '繁體中文' },
                      { value: 'en', label: 'English' },
                      { value: 'ja', label: '日本語' },
                    ]} />
                  }
                />
                <SettingRow
                  label="时区"
                  right={
                    <StyledSelect value={timezone} onChange={setTimezone} options={[
                      { value: 'Asia/Shanghai', label: '(UTC+8) 北京' },
                      { value: 'Asia/Tokyo', label: '(UTC+9) 东京' },
                      { value: 'America/New_York', label: '(UTC-5) 纽约' },
                      { value: 'Europe/London', label: '(UTC+0) 伦敦' },
                    ]} />
                  }
                />
                <SettingRow
                  label="日期格式"
                  right={
                    <StyledSelect value={dateFormat} onChange={setDateFormat} options={[
                      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    ]} />
                  }
                />
              </div>
            </SectionCard>
          </div>
        );

      /* ── 存储管理 ── */
      case 'storage':
        return (
          <div className="space-y-6">
            <SectionCard title="缓存数据">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">缓存大小</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">128.6 MB</span>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-theme-600 dark:text-theme-400 bg-theme-50 dark:bg-theme-900/20 hover:bg-theme-100 dark:hover:bg-theme-900/30 rounded-lg transition-colors">
                  <Trash2 size={14} />
                  清除缓存
                </button>
              </div>
            </SectionCard>

            <SectionCard title="聊天文件">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">文件大小</span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">2.3 GB</span>
                </div>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-theme-600 dark:text-theme-400 bg-theme-50 dark:bg-theme-900/20 hover:bg-theme-100 dark:hover:bg-theme-900/30 rounded-lg transition-colors">
                  管理文件
                </button>
              </div>
            </SectionCard>

            <SectionCard title="自动清理">
              <SettingRow
                label="清理策略"
                description="自动清理超过指定天数的缓存文件"
                right={
                  <StyledSelect value={autoClean} onChange={setAutoClean} options={[
                    { value: 'never', label: '从不清理' },
                    { value: '7', label: '7 天' },
                    { value: '30', label: '30 天' },
                    { value: '90', label: '90 天' },
                  ]} />
                }
              />
            </SectionCard>
          </div>
        );

      /* ── 关于 ── */
      case 'about':
        return (
          <div className="space-y-6">
            <SectionCard title="版本信息">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">版本号</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">v1.0.0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">更新日期</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">2026-05-01</span>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-theme-500 hover:bg-theme-600 rounded-lg transition-colors">
                    <RefreshCw size={14} />
                    检查更新
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="法律信息">
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                <a href="#" className="flex items-center justify-between py-3 text-sm text-gray-900 dark:text-white hover:text-theme-600 dark:hover:text-theme-400 transition-colors">
                  <span>用户协议</span>
                  <ExternalLink size={14} className="text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between py-3 text-sm text-gray-900 dark:text-white hover:text-theme-600 dark:hover:text-theme-400 transition-colors">
                  <span>隐私政策</span>
                  <ExternalLink size={14} className="text-gray-400" />
                </a>
              </div>
            </SectionCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <PageHeader
        icon={<SettingsIcon size={20} className="text-white" />}
        title="系统设置"
      />

      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* ── 左侧导航 ── */}
        <div className="w-full lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex-shrink-0 overflow-y-auto">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-theme-50 dark:bg-theme-900/20 text-theme-700 dark:text-theme-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-theme-600' : 'text-gray-400'}>
                  {tab.icon}
                </span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── 右侧内容 ── */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 lg:py-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
