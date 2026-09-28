import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Menu, X, Shield, Lock, GitBranch, LayoutDashboard,
  Globe, Network, Palette, ChevronRight, User, Users, FolderTree,
  Route, Wand2, FileText, Edit3, Image as ImageIcon, Type, AlignJustify, Plus, Search, Upload,
  Database, Briefcase, RefreshCw, CheckCircle2, Layers, Smartphone, ClipboardList, ChevronLeft
} from 'lucide-react';
import NavigationConfig from '../components/NavigationConfig';
import { MAIN_USER_NAME, getDemoPerson } from '../data/people';
import {
  TRUSTED_ROUTE_DICTIONARY_NAME,
  TRUSTED_ROUTE_DICTIONARY_TYPE,
  buildTrustedRouteRules,
  loadTrustedRouteItems,
  saveTrustedRouteItems,
  validateTrustedRouteItem,
  type TrustedRouteDictionaryItem,
} from '../utils/linkOpening';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'system',
    label: '系统',
    icon: <Shield size={18} />,
    children: [
      {
        id: 'security-management',
        label: '安全管理',
        icon: <Shield size={16} />,
        children: [
          { id: 'security-log', label: '操作日志', icon: <GitBranch size={15} /> },
          { id: 'security-audit', label: '安全审计', icon: <Shield size={15} /> },
        ]
      },
      {
        id: 'system-management',
        label: '系统管理',
        icon: <FolderTree size={16} />,
        children: [
          { id: 'system-user', label: '用户管理', icon: <User size={15} /> },
          { id: 'system-user-groups', label: '用户组管理', icon: <Layers size={15} /> },
          { id: 'system-role', label: '角色管理', icon: <Lock size={15} /> },
          { id: 'system-menu', label: '菜单管理', icon: <Menu size={15} /> },
          { id: 'system-dictionary', label: '字典管理', icon: <Database size={15} /> },
          { id: 'system-external-user', label: '外部人员管理', icon: <Users size={15} /> },
        ]
      },
      {
        id: 'version-management',
        label: '版本管理',
        icon: <GitBranch size={16} />,
        children: [
          { id: 'version-list', label: '版本列表', icon: <GitBranch size={15} /> },
          { id: 'version-release', label: '发布记录', icon: <Globe size={15} /> },
        ]
      },
      {
        id: 'workspace-management',
        label: '工作台',
        icon: <LayoutDashboard size={16} />,
        children: [
          { id: 'app-management', label: '应用管理', icon: <Briefcase size={15} /> },
          { id: 'system-nav', label: '导航栏管理', icon: <Route size={15} /> },
          { id: 'mobile-download', label: '移动应用下载管理', icon: <Smartphone size={15} /> },
        ]
      },
      { id: 'portal-admin', label: '门户基础管理', icon: <Globe size={16} /> },
      { id: 'business-admin', label: '业务系统管理', icon: <FolderTree size={16} /> },
      { id: 'theme-admin', label: '主题装扮管理', icon: <Palette size={16} /> },
    ]
  },
  {
    id: 'initial',
    label: 'i吉祥初始功能',
    icon: <LayoutDashboard size={18} />,
    children: [
      {
        id: 'report-management',
        label: '汇报管理',
        icon: <ClipboardList size={16} />,
        children: [
          { id: 'report-template', label: '模板管理', icon: <FileText size={15} /> },
        ],
      },
    ],
  },
  {
    id: 'ai',
    label: 'AI辅助功能',
    icon: <Wand2 size={18} />,
    children: [
      { id: 'ai-template', label: '公文模板管理', icon: <FileText size={16} /> },
    ]
  },
  {
    id: 'business-feature',
    label: '业务功能',
    icon: <FolderTree size={18} />,
  },
];

const findMenuItemById = (items: MenuItem[], id: string | null): MenuItem | null => {
  if (!id) return null;
  for (const item of items) {
    if (item.id === id) return item;
    const matched = findMenuItemById(item.children || [], id);
    if (matched) return matched;
  }
  return null;
};

const topLevelSystemSections = menuItems.find(item => item.id === 'system')?.children || [];

const adminSectionMap: Record<string, { menu: string; subMenu: string }> = {
  'ai-template': { menu: 'ai', subMenu: 'ai-template' },
  'report-template': { menu: 'initial', subMenu: 'report-template' },
  'system-nav': { menu: 'system', subMenu: 'system-nav' },
  'system-dictionary': { menu: 'system', subMenu: 'system-dictionary' },
};

const adminTheme = {
  brand: '#d51f5c',
  primaryMenu: '#32091f',
  primaryMenuHover: '#48102d',
  nestedBg: '#061523',
  nestedBgSoft: '#08243b',
  nestedBgActive: '#07263f',
  activeBlue: '#2f7fbd',
  collapsedFooter: '#041421',
};

function AdminBrand({ open }: { open: boolean }) {
  return (
    <div
      className={`h-[90px] flex items-center border-b border-white/10 ${open ? 'px-5 justify-start' : 'px-0 justify-center'}`}
      style={{ backgroundColor: adminTheme.brand }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="w-11 h-11 rounded-full border-2 border-[#e7c18d] text-[#f3d2a2] flex items-center justify-center flex-shrink-0 text-lg font-bold">
          吉
        </div>
        {open && (
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-white font-bold text-base tracking-wide">JUNEYAO AIR</span>
              <span className="text-white text-xl font-bold">吉祥航空</span>
            </div>
            <div className="hidden h-11 w-11 flex-shrink-0 items-center justify-center border border-white/45 text-[9px] font-semibold leading-tight text-white/80 xl:flex">
              STAR<br />ALLIANCE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPrimaryMenuButton({
  item,
  open,
  active,
  onClick,
}: {
  item: MenuItem;
  open: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 py-5 transition-colors
        ${open ? 'px-7 justify-start' : 'px-0 justify-center'}
        ${active ? 'text-white' : 'text-white hover:text-white'}
      `}
      style={{ backgroundColor: active ? adminTheme.brand : adminTheme.primaryMenu }}
      onMouseEnter={(event) => {
        if (!active) event.currentTarget.style.backgroundColor = adminTheme.primaryMenuHover;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.backgroundColor = active ? adminTheme.brand : adminTheme.primaryMenu;
      }}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {open && (
        <>
          <span className="flex-1 text-left text-sm font-semibold">{item.label}</span>
          {item.children && (
            <ChevronRight
              size={16}
              className={`transition-transform ${active ? 'rotate-90' : ''}`}
            />
          )}
        </>
      )}
    </button>
  );
}

function AdminNestedMenuTree({
  items,
  depth = 0,
  activeSubMenu,
  expandedMenus,
  onSelect,
}: {
  items: MenuItem[];
  depth?: number;
  activeSubMenu: string | null;
  expandedMenus: Set<string>;
  onSelect: (item: MenuItem) => void;
}) {
  return (
    <>
      {items.map((subItem) => {
    const isActive = activeSubMenu === subItem.id;
    const hasActiveChild = !!findMenuItemById(subItem.children || [], activeSubMenu);
    const isBranchOpen = expandedMenus.has(subItem.id) || hasActiveChild;
    const isLeafActive = isActive && !subItem.children?.length;

        return (
          <div key={subItem.id}>
            <button
              onClick={() => onSelect(subItem)}
              className={`
                w-full flex items-center gap-3 text-sm transition-colors
                ${depth === 0 ? 'h-12 px-7' : 'h-10 pl-14 pr-5'}
                ${isLeafActive ? 'text-white' : ''}
                ${isActive && subItem.children?.length ? 'text-white' : ''}
                ${!isActive && hasActiveChild ? 'text-white' : ''}
                ${!isActive && !hasActiveChild ? 'text-slate-300 hover:text-white' : ''}
              `}
              style={{
                backgroundColor: isLeafActive
                  ? adminTheme.activeBlue
                  : isActive || hasActiveChild
                    ? adminTheme.nestedBgActive
                    : 'transparent',
              }}
              onMouseEnter={(event) => {
                if (!isLeafActive && !isActive && !hasActiveChild) {
                  event.currentTarget.style.backgroundColor = adminTheme.nestedBgSoft;
                }
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor = isLeafActive
                  ? adminTheme.activeBlue
                  : isActive || hasActiveChild
                    ? adminTheme.nestedBgActive
                    : 'transparent';
              }}
            >
              <span className={`flex-shrink-0 ${depth > 0 ? 'opacity-70' : ''}`}>{subItem.icon}</span>
              <span className="flex-1 text-left">{subItem.label}</span>
              {subItem.children?.length && (
                <ChevronRight size={14} className={`transition-transform ${isBranchOpen ? 'rotate-90' : ''}`} />
              )}
            </button>
            {subItem.children?.length && isBranchOpen && (
              <div style={{ backgroundColor: adminTheme.collapsedFooter }}>
                <AdminNestedMenuTree
                  items={subItem.children}
                  depth={depth + 1}
                  activeSubMenu={activeSubMenu}
                  expandedMenus={expandedMenus}
                  onSelect={onSelect}
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}


function ContentPlaceholder({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">此功能模块正在开发中，敬请期待。</p>
    </div>
  );
}

type VersionPlatform = 'android' | 'ios' | 'desktop';
type VersionStatus = '已发布' | '已失效' | '草稿';

type VersionRecord = {
  id: string;
  platform: VersionPlatform;
  versionNo: string;
  buildNo: string;
  forceUpdate: boolean;
  status: VersionStatus;
  content: string;
  description: string;
  updater: string;
  updatedAt: string;
  packageType: string;
  supportedOS: string;
  downloadUrl: string;
};

const versionPlatformTabs: Array<{ id: VersionPlatform; label: string }> = [
  { id: 'android', label: 'android' },
  { id: 'ios', label: 'iOS' },
  { id: 'desktop', label: 'client' },
];

const initialVersionRows: VersionRecord[] = [
  { id: 'android-340', platform: 'android', versionNo: '3.4.0', buildNo: '20251224001', forceUpdate: false, status: '已发布', content: '功能焕新 菜单系统升级：更多客别、更多时间...', description: '优化工作门户与消息提醒体验', updater: MAIN_USER_NAME, updatedAt: '2026-01-30 14:45:53', packageType: 'APK', supportedOS: 'Android 10+', downloadUrl: 'https://download.juneyaoair.com/ijx/android/3.4.0.apk' },
  { id: 'android-321', platform: 'android', versionNo: '3.2.1', buildNo: '20250515004', forceUpdate: true, status: '已失效', content: '账号安全体系加强，本次升级为强制更新，建议...', description: '安全策略更新', updater: MAIN_USER_NAME, updatedAt: '2026-01-30 14:45:50', packageType: 'APK', supportedOS: 'Android 9+', downloadUrl: 'https://download.juneyaoair.com/ijx/android/3.2.1.apk' },
  { id: 'ios-331', platform: 'ios', versionNo: '3.3.1', buildNo: '20251104001', forceUpdate: false, status: '已发布', content: '登录安全优化、个人信息增加个人生...', description: 'App Store 发布版本', updater: MAIN_USER_NAME, updatedAt: '2026-01-30 14:44:11', packageType: 'App Store', supportedOS: 'iOS 15+', downloadUrl: 'https://apps.apple.com/app/ijx' },
  { id: 'ios-320', platform: 'ios', versionNo: '3.2.0', buildNo: '20250428002', forceUpdate: false, status: '已失效', content: 'iJX app now supports English 2. 福利中心：...', description: '双语能力更新', updater: MAIN_USER_NAME, updatedAt: '2025-06-24 22:30:28', packageType: 'App Store', supportedOS: 'iOS 14+', downloadUrl: 'https://apps.apple.com/app/ijx' },
  { id: 'desktop-110', platform: 'desktop', versionNo: '1.1.0', buildNo: '20260915001', forceUpdate: false, status: '已发布', content: '新增 PC 工作门户、桌面端打开外部链接策略配置...', description: 'Windows 桌面客户端安装包', updater: MAIN_USER_NAME, updatedAt: '2026-09-15 18:30:21', packageType: 'EXE', supportedOS: 'Windows 10/11', downloadUrl: 'https://download.juneyaoair.com/ijx/desktop/1.1.0.exe' },
  { id: 'desktop-100', platform: 'desktop', versionNo: '1.0.0', buildNo: '20260818001', forceUpdate: false, status: '已失效', content: '桌面端基础能力：门户入口、消息通知、日历同步...', description: '桌面端首个试运行版本', updater: MAIN_USER_NAME, updatedAt: '2026-08-18 11:05:02', packageType: 'MSI', supportedOS: 'Windows 10+', downloadUrl: 'https://download.juneyaoair.com/ijx/desktop/1.0.0.msi' },
];

const defaultVersionDraft: VersionRecord = {
  id: '',
  platform: 'desktop',
  versionNo: '',
  buildNo: '',
  forceUpdate: false,
  status: '草稿',
  content: '',
  description: '',
  updater: MAIN_USER_NAME,
  updatedAt: '刚刚',
  packageType: 'EXE',
  supportedOS: 'Windows 10/11',
  downloadUrl: '',
};

function VersionManagement({ view }: { view: 'list' | 'release' }) {
  const [activePlatform, setActivePlatform] = useState<VersionPlatform>('android');
  const [rows, setRows] = useState<VersionRecord[]>(initialVersionRows);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'全部' | VersionStatus>('全部');
  const [forceFilter, setForceFilter] = useState<'全部' | '是' | '否'>('全部');
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<VersionRecord>(defaultVersionDraft);
  const [toast, setToast] = useState('');

  const filteredRows = rows
    .filter(item => item.platform === activePlatform)
    .filter(item => statusFilter === '全部' || item.status === statusFilter)
    .filter(item => forceFilter === '全部' || (forceFilter === '是' ? item.forceUpdate : !item.forceUpdate))
    .filter(item => {
      const value = keyword.trim().toLowerCase();
      return !value || item.versionNo.toLowerCase().includes(value) || item.buildNo.toLowerCase().includes(value);
    });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const openCreate = () => {
    setDraft({
      ...defaultVersionDraft,
      id: `${activePlatform}-${Date.now()}`,
      platform: activePlatform,
      packageType: activePlatform === 'desktop' ? 'EXE' : activePlatform === 'ios' ? 'App Store' : 'APK',
      supportedOS: activePlatform === 'desktop' ? 'Windows 10/11' : activePlatform === 'ios' ? 'iOS 15+' : 'Android 10+',
    });
    setEditorOpen(true);
  };

  const openEdit = (item: VersionRecord) => {
    setDraft(item);
    setEditorOpen(true);
  };

  const saveDraft = () => {
    if (!draft.versionNo || !draft.buildNo) {
      showToast('请填写版本号和构建号');
      return;
    }
    setRows(current => {
      const exists = current.some(item => item.id === draft.id);
      if (exists) return current.map(item => item.id === draft.id ? draft : item);
      return [draft, ...current];
    });
    setEditorOpen(false);
    showToast('版本配置已保存');
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] w-full min-w-0 bg-[#eef1f5] pt-3 text-sm text-gray-800">
      <AdminTabs active={view === 'list' ? '版本管理' : '版本更新记录'} />
      {toast && (
        <div className="fixed left-1/2 top-5 z-[80] -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
      <div className="bg-white px-8 py-4">
        <div className="mb-5 text-sm text-gray-500">
          首页 <span className="mx-2">/</span> 版本管理 <span className="mx-2">/</span>
          <span className="text-gray-800">{view === 'list' ? '版本管理' : '版本更新记录'}</span>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap text-gray-700">版本号</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="请输入版本号"
              className="h-9 w-72 rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap text-gray-700">状态</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as '全部' | VersionStatus)} className="h-9 w-64 rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
              <option>全部</option>
              <option>已发布</option>
              <option>已失效</option>
              <option>草稿</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="whitespace-nowrap text-gray-700">是否强制更新</span>
            <select value={forceFilter} onChange={(event) => setForceFilter(event.target.value as '全部' | '是' | '否')} className="h-9 w-72 rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
              <option>全部</option>
              <option>是</option>
              <option>否</option>
            </select>
          </label>
          <div className="ml-auto flex gap-2">
            <button className="rounded bg-[#2f75b5] px-5 py-2 font-medium text-white hover:bg-[#28669f]">查询</button>
            <button onClick={() => { setKeyword(''); setStatusFilter('全部'); setForceFilter('全部'); }} className="rounded border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50">重置</button>
            <button className="px-3 text-[#2f75b5] hover:underline">展开⌄</button>
          </div>
        </div>
        <div className="mt-6 flex gap-8 border-b border-gray-200">
          {versionPlatformTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActivePlatform(tab.id)}
              className={`relative pb-3 text-sm font-semibold ${activePlatform === tab.id ? 'text-[#2f75b5]' : 'text-gray-700 hover:text-[#2f75b5]'}`}
            >
              {tab.label}
              {activePlatform === tab.id && <span className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-[#2f75b5]" />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="bg-white p-5">
          <button onClick={openCreate} className="mb-4 rounded bg-[#2f75b5] px-5 py-2 font-medium text-white hover:bg-[#28669f]">添加</button>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-900">
                  <th className="px-3 py-3 font-medium">版本号</th>
                  <th className="px-3 py-3 font-medium">构建号</th>
                  <th className="px-3 py-3 font-medium">是否强制更新</th>
                  <th className="px-3 py-3 font-medium">状态</th>
                  <th className="px-3 py-3 font-medium">修复内容</th>
                  <th className="px-3 py-3 font-medium">描述</th>
                  {activePlatform === 'desktop' && <th className="px-3 py-3 font-medium">client配置</th>}
                  <th className="px-3 py-3 font-medium">更新人</th>
                  <th className="px-3 py-3 font-medium">更新时间</th>
                  <th className="px-3 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-3 py-3 text-gray-800">{item.versionNo}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">{item.buildNo}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">{item.forceUpdate ? '是' : '否'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-600">{item.status}</td>
                    <td className="max-w-[260px] truncate px-3 py-3 text-gray-700">{item.content}</td>
                    <td className="max-w-[210px] truncate px-3 py-3 text-gray-500">{item.description}</td>
                    {activePlatform === 'desktop' && (
                      <td className="whitespace-nowrap px-3 py-3 text-gray-600">{item.packageType} · {item.supportedOS}</td>
                    )}
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">{item.updater}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-gray-700">{item.updatedAt}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <button onClick={() => showToast('二维码下载已生成')} className="mr-4 text-[#2f75b5] hover:underline">下载二维码</button>
                      <button onClick={() => openEdit(item)} className="mr-4 text-[#2f75b5] hover:underline">编辑</button>
                      <button onClick={() => showToast('更多操作为前端模拟')} className="text-[#2f75b5] hover:underline">更多⌄</button>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={activePlatform === 'desktop' ? 10 : 9} className="px-3 py-12 text-center text-gray-400">暂无版本数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-end gap-2 text-sm text-gray-600">
            <span>共 {filteredRows.length} 条</span>
            <button className="h-8 w-8 rounded border border-gray-200 text-gray-300">‹</button>
            <button className="h-8 w-8 rounded border border-[#2f75b5] text-[#2f75b5]">1</button>
            <button className="h-8 w-8 rounded border border-gray-200">2</button>
            <button className="h-8 w-8 rounded border border-gray-200">›</button>
            <select className="h-8 rounded border border-gray-200 px-2">
              <option>12 条/页</option>
            </select>
            <span>跳至</span>
            <input className="h-8 w-12 rounded border border-gray-200 px-2" />
            <span>页</span>
          </div>
        </div>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4">
          <div className="w-full max-w-2xl rounded bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-base font-bold text-gray-900">{rows.some(item => item.id === draft.id) ? '编辑版本配置' : '新增版本配置'}</h3>
              <button onClick={() => setEditorOpen(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="grid gap-4 px-6 py-5 md:grid-cols-2">
              <label className="text-sm text-gray-700">端类型
                <select value={draft.platform} onChange={(event) => setDraft(prev => ({ ...prev, platform: event.target.value as VersionPlatform }))} className="mt-1 h-9 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                  <option value="android">android</option>
                  <option value="ios">iOS</option>
                  <option value="desktop">client</option>
                </select>
              </label>
              <label className="text-sm text-gray-700">版本号
                <input value={draft.versionNo} onChange={(event) => setDraft(prev => ({ ...prev, versionNo: event.target.value }))} className="mt-1 h-9 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="text-sm text-gray-700">构建号
                <input value={draft.buildNo} onChange={(event) => setDraft(prev => ({ ...prev, buildNo: event.target.value }))} className="mt-1 h-9 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="text-sm text-gray-700">状态
                <select value={draft.status} onChange={(event) => setDraft(prev => ({ ...prev, status: event.target.value as VersionStatus }))} className="mt-1 h-9 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                  <option>草稿</option>
                  <option>已发布</option>
                  <option>已失效</option>
                </select>
              </label>
              <label className="text-sm text-gray-700">安装包类型
                <input value={draft.packageType} onChange={(event) => setDraft(prev => ({ ...prev, packageType: event.target.value }))} className="mt-1 h-9 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="text-sm text-gray-700">支持系统
                <input value={draft.supportedOS} onChange={(event) => setDraft(prev => ({ ...prev, supportedOS: event.target.value }))} className="mt-1 h-9 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="md:col-span-2 text-sm text-gray-700">下载地址
                <input value={draft.downloadUrl} onChange={(event) => setDraft(prev => ({ ...prev, downloadUrl: event.target.value }))} className="mt-1 h-9 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="md:col-span-2 text-sm text-gray-700">修复内容
                <textarea value={draft.content} onChange={(event) => setDraft(prev => ({ ...prev, content: event.target.value }))} className="mt-1 h-20 w-full rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={draft.forceUpdate} onChange={(event) => setDraft(prev => ({ ...prev, forceUpdate: event.target.checked }))} />
                强制更新
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <button onClick={() => setEditorOpen(false)} className="rounded border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={saveDraft} className="rounded bg-[#2f75b5] px-5 py-2 font-medium text-white hover:bg-[#28669f]">保存</button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-7 pt-2 text-center text-xs text-gray-500">
        吉祥航空　如意到家
        <div className="mt-1">Copyright © 2026 吉祥航空版权所有</div>
      </div>
    </div>
  );
}

const reportTemplateRows = [
  { id: 'weekly', name: '工作周报模板', type: '工作汇报', fields: '关联OKR、本周事项、下周计划、汇报对象', updater: MAIN_USER_NAME, updatedAt: '2026-07-02 18:20' },
  { id: 'daily', name: '工作日报模板', type: '工作汇报', fields: '今日总结、明日计划、风险问题、抄送对象', updater: MAIN_USER_NAME, updatedAt: '2026-07-01 16:10' },
  { id: 'okr-weekly', name: 'OKR拆解周报模板', type: 'OKR汇报', fields: 'Objective、Key Result、本周进展、下周计划', updater: MAIN_USER_NAME, updatedAt: '2026-06-28 11:35' },
];

function ReportTemplateManagement() {
  return (
    <div className="min-h-[calc(100vh-7rem)] w-full min-w-0 bg-[#eef1f5] pt-3 text-sm text-gray-800">
      <AdminTabs active="模板管理" />
      <div className="bg-white px-8 py-4">
        <div className="mb-5 text-sm text-gray-500">
          首页 <span className="mx-2">/</span> i吉祥初始功能 <span className="mx-2">/</span> 汇报管理 <span className="mx-2">/</span>
          <span className="text-gray-800">模板管理</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-gray-700">模板名称</span>
            <input placeholder="请输入模板名称" className="h-9 w-64 rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
          </label>
          <button className="rounded bg-[#2f75b5] px-5 py-2 font-medium text-white hover:bg-[#28669f]">查询</button>
          <button className="rounded border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50">重置</button>
        </div>
      </div>

      <div className="p-5">
        <div className="bg-white p-5">
          <button className="mb-4 inline-flex items-center gap-1.5 rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f]">
            <Plus size={15} />
            新增模板
          </button>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="px-3 py-3 font-medium">模板名称</th>
                  <th className="px-3 py-3 font-medium">汇报类型</th>
                  <th className="px-3 py-3 font-medium">模板字段</th>
                  <th className="px-3 py-3 font-medium">更新人</th>
                  <th className="px-3 py-3 font-medium">更新时间</th>
                  <th className="px-3 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {reportTemplateRows.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40">
                    <td className="px-3 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-3 py-3">{item.type}</td>
                    <td className="px-3 py-3 text-gray-600">{item.fields}</td>
                    <td className="px-3 py-3">{item.updater}</td>
                    <td className="px-3 py-3">{item.updatedAt}</td>
                    <td className="px-3 py-3">
                      <button className="mr-4 text-[#2f75b5] hover:underline">编辑</button>
                      <button className="text-[#2f75b5] hover:underline">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}



type UserGroupSource = 'manual' | 'sync';
type UserGroupScope = '全员' | '指定部门' | '指定人员';

type UserGroupMember = {
  name: string;
  phone: string;
  userId: string;
  department: string;
  position: string;
};

type UserGroupRecord = {
  id: string;
  name: string;
  source: UserGroupSource;
  description: string;
  scope?: UserGroupScope;
  scopeTarget?: string;
  updatedAt: string;
  owner: string;
  members: UserGroupMember[];
};

const initialUserGroups: UserGroupRecord[] = [
  {
    id: 'project-collab',
    name: '项目协同组',
    source: 'manual',
    description: '由管理员维护，用于跨部门项目工作台、流程和知识库权限授权。',
    updatedAt: '2026-06-28 16:20',
    owner: MAIN_USER_NAME,
    members: [
      { name: MAIN_USER_NAME, phone: '+86 13611750104', userId: '4de17977', department: '信息管理部 / 管理支撑产品处', position: '产品经理' },
      { name: getDemoPerson(13), phone: '+86 13800138021', userId: '7af32018', department: '信息管理部 / 业务协同处', position: '业务主管' },
      { name: getDemoPerson(14), phone: '+86 13900139032', userId: '6bc45190', department: '数字化中心 / 项目管理处', position: '项目经理' },
    ]
  },
  {
    id: 'document-pilot',
    name: 'AI公文试点组',
    source: 'manual',
    description: '手动添加的试点用户，可编辑成员，用于AI公文创作灰度范围配置。',
    updatedAt: '2026-06-27 11:05',
    owner: getDemoPerson(11),
    members: [
      { name: getDemoPerson(11), phone: '+86 13500135022', userId: '1dc90244', department: '信息管理部 / 平台研发处', position: '技术负责人' },
      { name: '陈一航', phone: '+86 13400134033', userId: '8ef67331', department: '市场营销部 / 数字营销处', position: '处长' },
    ]
  },
  {
    id: 'duty-admin',
    name: '值班排班管理员',
    source: 'manual',
    description: '用于值班、排班和移动端通知配置的管理员用户组。',
    updatedAt: '2026-06-25 09:45',
    owner: getDemoPerson(12),
    members: [
      { name: getDemoPerson(12), phone: '+86 13700137011', userId: '9aa78120', department: '航务运行部 / 运行支撑处', position: '高级经理' },
      { name: getDemoPerson(10), phone: '+86 13100131033', userId: '3da77145', department: '信息管理部', position: '部门负责人' },
    ]
  },
  {
    id: 'middle-layer',
    name: '中坚层',
    source: 'sync',
    description: '承接核心项目和跨部门推进的业务骨干，由主数据按员工层级同步。',
    updatedAt: '2026-07-01 09:30',
    owner: '主数据',
    members: [
      { name: MAIN_USER_NAME, phone: '+86 13611750104', userId: '4de17977', department: '信息管理部 / 管理支撑产品处', position: '产品经理' },
      { name: getDemoPerson(13), phone: '+86 13800138021', userId: '7af32018', department: '信息管理部 / 业务协同处', position: '业务主管' },
      { name: getDemoPerson(14), phone: '+86 13900139032', userId: '6bc45190', department: '数字化中心 / 项目管理处', position: '项目经理' },
    ]
  },
  {
    id: 'core-layer',
    name: '核心层',
    source: 'sync',
    description: '关键业务线及重点职能的主要负责人，由主数据按员工层级同步。',
    updatedAt: '2026-07-01 09:30',
    owner: '主数据',
    members: [
      { name: getDemoPerson(12), phone: '+86 13700137011', userId: '9aa78120', department: '航务运行部 / 运行支撑处', position: '高级经理' },
      { name: getDemoPerson(11), phone: '+86 13500135022', userId: '1dc90244', department: '信息管理部 / 平台研发处', position: '技术负责人' },
      { name: '陈一航', phone: '+86 13400134033', userId: '8ef67331', department: '市场营销部 / 数字营销处', position: '处长' },
    ]
  },
  {
    id: 'decision-layer',
    name: '决策层',
    source: 'sync',
    description: '公司经营决策、重大项目审批及资源协同人员，由主数据按员工层级同步。',
    updatedAt: '2026-07-01 09:30',
    owner: '主数据',
    members: [
      { name: getDemoPerson(0), phone: '+86 13300133011', userId: '2ab88901', department: '总经理办公室', position: '决策委员' },
      { name: getDemoPerson(9), phone: '+86 13200132022', userId: '5cf90213', department: '经营管理部', position: '经营管理负责人' },
      { name: getDemoPerson(10), phone: '+86 13100131033', userId: '3da77145', department: '信息管理部', position: '部门负责人' },
    ]
  },
];

function UserGroupManagement() {
  const [groups, setGroups] = useState<UserGroupRecord[]>(initialUserGroups);
  const [selectedGroupId, setSelectedGroupId] = useState(initialUserGroups[0].id);
  const [keyword, setKeyword] = useState('');
  const [syncOpen, setSyncOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [createScope, setCreateScope] = useState<UserGroupScope>('全员');
  const [createScopeTarget, setCreateScopeTarget] = useState('');
  const [createError, setCreateError] = useState('');
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [toast, setToast] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState('2026-07-01 09:30');
  const selectedGroup = groups.find(group => group.id === selectedGroupId) || groups[0];
  const manualGroups = groups.filter(group => group.source === 'manual' && group.name.includes(keyword.trim()));
  const syncedGroups = groups.filter(group => group.source === 'sync' && group.name.includes(keyword.trim()));
  const isManual = selectedGroup.source === 'manual';

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const handleConfirmSync = () => {
    setSyncOpen(false);
    setLastSyncTime('2026-07-01 10:30');
    showToast('已从主数据同步系统用户组');
  };

  const handleAddGroup = () => {
    setCreateName('');
    setCreateDescription('');
    setCreateScope('全员');
    setCreateScopeTarget('');
    setCreateError('');
    setCreateOpen(true);
  };

  const handleConfirmAddGroup = () => {
    const name = createName.trim();
    if (!name) {
      setCreateError('请输入用户组名称');
      return;
    }
    if (groups.some(group => group.name === name)) {
      setCreateError('用户组名称已存在');
      return;
    }
    if (createScope !== '全员' && !createScopeTarget.trim()) {
      setCreateError(createScope === '指定部门' ? '请输入适用部门' : '请输入适用人员');
      return;
    }
    const newGroup: UserGroupRecord = {
      id: `manual-${Date.now()}`,
      name,
      source: 'manual',
      description: createDescription.trim(),
      scope: createScope,
      scopeTarget: createScope === '全员' ? '' : createScopeTarget.trim(),
      updatedAt: '2026-07-01 10:35',
      owner: MAIN_USER_NAME,
      members: [],
    };
    setGroups(current => [newGroup, ...current]);
    setSelectedGroupId(newGroup.id);
    setEditing(false);
    setCreateOpen(false);
    showToast('已新增手动用户组');
  };

  const handleStartEdit = () => {
    setDraftName(selectedGroup.name);
    setDraftDescription(selectedGroup.description);
    setEditing(true);
  };

  const handleSaveGroup = () => {
    setGroups(current => current.map(group => group.id === selectedGroup.id
      ? { ...group, name: draftName || group.name, description: draftDescription || group.description, updatedAt: '2026-07-01 10:40' }
      : group
    ));
    setEditing(false);
    showToast('用户组信息已保存');
  };

  const handleAddMember = () => {
    const nextMember: UserGroupMember = {
      name: '新增成员',
      phone: '+86 13000000000',
      userId: `new${selectedGroup.members.length + 1}`,
      department: '信息管理部 / 临时授权',
      position: '成员',
    };
    setGroups(current => current.map(group => group.id === selectedGroup.id
      ? { ...group, members: [...group.members, nextMember], updatedAt: '2026-07-01 10:45' }
      : group
    ));
    showToast('已添加成员');
  };

  const handleRemoveMember = (userId: string) => {
    setGroups(current => current.map(group => group.id === selectedGroup.id
      ? { ...group, members: group.members.filter(member => member.userId !== userId), updatedAt: '2026-07-01 10:45' }
      : group
    ));
    showToast('已移除成员');
  };

  const renderGroupButton = (group: UserGroupRecord) => (
    <button
      key={group.id}
      onClick={() => {
        setSelectedGroupId(group.id);
        setEditing(false);
      }}
      className={`flex w-full items-center justify-between rounded px-4 py-3 text-left transition ${selectedGroupId === group.id ? 'bg-blue-50 text-[#2f75b5]' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      <span className="flex min-w-0 items-center gap-2 font-medium">
        <Users size={17} />
        <span className="truncate">{group.name}</span>
      </span>
      <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{group.members.length}</span>
    </button>
  );

  return (
    <div className="min-h-[calc(100vh-12rem)] overflow-hidden bg-white text-sm text-gray-800 shadow-sm">
      {toast && (
        <div className="fixed right-8 top-20 z-50 flex items-center gap-2 rounded bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          <CheckCircle2 size={16} className="text-green-300" />
          {toast}
        </div>
      )}
      <div className="border-b border-gray-200 px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-semibold text-gray-900">用户组管理</h2>
            <p className="mt-2 text-sm text-gray-500">手动用户组支持新增和编辑；系统同步用户组由主数据维护，仅支持同步刷新。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleAddGroup} className="inline-flex h-9 items-center gap-2 rounded bg-[#2f75b5] px-4 text-sm font-medium text-white hover:bg-[#28669f]">
              <Plus size={15} />
              新增用户组
            </button>
            <button onClick={() => setSyncOpen(true)} className="inline-flex h-9 items-center gap-2 rounded border border-gray-300 bg-white px-4 text-sm text-gray-700 hover:bg-gray-50">
              <RefreshCw size={15} />
              从主数据同步
            </button>
          </div>
        </div>
      </div>

      <div className="grid min-h-[620px] grid-cols-[300px_minmax(0,1fr)] max-lg:grid-cols-1">
        <aside className="border-r border-gray-200 bg-white p-5 max-lg:border-b max-lg:border-r-0">
          <div className="relative mb-5">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索用户组" className="h-10 w-full rounded border border-gray-300 pl-10 pr-3 text-sm outline-none focus:border-[#2f75b5]" />
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-2 font-medium"><ChevronRight size={14} className="rotate-90" />手动管理（{manualGroups.length}）</span>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-[#2f75b5]">可编辑</span>
              </div>
              <div className="space-y-2">{manualGroups.map(renderGroupButton)}</div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-gray-700">
                <span className="flex items-center gap-2 font-medium"><ChevronRight size={14} className="rotate-90" />系统同步（{syncedGroups.length}）</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">只读</span>
              </div>
              <div className="space-y-2">{syncedGroups.map(renderGroupButton)}</div>
            </div>
            {manualGroups.length + syncedGroups.length === 0 && <div className="px-4 py-6 text-center text-gray-400">暂无匹配用户组</div>}
          </div>
        </aside>

        <section className="min-w-0 p-6">
          <div className="mb-6">
              <div className="flex items-center">
                {editing && isManual ? (
                  <input value={draftName} onChange={(event) => setDraftName(event.target.value)} className="h-9 w-72 rounded border border-gray-300 px-3 text-lg font-semibold text-gray-900 outline-none focus:border-[#2f75b5]" />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-900">{selectedGroup.name}</h3>
                )}
              </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button className="h-9 rounded border border-gray-300 bg-gray-50 px-4 text-gray-700">搜索成员</button>
            <input className="h-9 w-72 rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" placeholder="请输入成员姓名、邮箱..." />
            {isManual ? (
              <>
                {editing ? (
                  <>
                    <button onClick={handleSaveGroup} className="h-9 rounded bg-[#2f75b5] px-4 text-white hover:bg-[#28669f]">保存</button>
                    <button onClick={() => setEditing(false)} className="h-9 rounded border border-gray-300 bg-white px-4 text-gray-700 hover:bg-gray-50">取消</button>
                  </>
                ) : (
                  <button onClick={handleStartEdit} className="h-9 rounded border border-[#2f75b5] bg-white px-4 text-[#2f75b5] hover:bg-blue-50">编辑用户组</button>
                )}
                <button onClick={handleAddMember} className="h-9 rounded bg-[#2f75b5] px-4 text-white hover:bg-[#28669f]">添加成员</button>
              </>
            ) : (
              <span className="rounded bg-gray-100 px-3 py-2 text-xs text-gray-500">同步组不支持在此编辑成员</span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="px-4 py-3 font-medium">用户组成员</th>
                  <th className="px-4 py-3 font-medium">联系手机号/邮箱</th>
                  <th className="px-4 py-3 font-medium">用户 ID</th>
                  <th className="px-4 py-3 font-medium">部门</th>
                  <th className="px-4 py-3 font-medium">岗位</th>
                  {isManual && <th className="px-4 py-3 font-medium">操作</th>}
                </tr>
              </thead>
              <tbody>
                {selectedGroup.members.map(member => (
                  <tr key={member.userId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-sm font-semibold text-[#2f75b5]">{member.name.slice(0, 1)}</div><span className="font-medium text-gray-900">{member.name}</span></div></td>
                    <td className="px-4 py-4 text-gray-700">{member.phone}</td>
                    <td className="px-4 py-4 text-gray-700">{member.userId}</td>
                    <td className="px-4 py-4 text-gray-700">{member.department}</td>
                    <td className="px-4 py-4 text-gray-700">{member.position}</td>
                    {isManual && <td className="px-4 py-4"><button onClick={() => handleRemoveMember(member.userId)} className="text-[#2f75b5] hover:underline">移除</button></td>}
                  </tr>
                ))}
                {selectedGroup.members.length === 0 && <tr><td className="px-4 py-12 text-center text-gray-400" colSpan={isManual ? 6 : 5}>暂无成员</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {createOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="create-user-group-title" className="w-full max-w-xl rounded bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 id="create-user-group-title" className="text-lg font-semibold text-gray-900">新增用户组</h3>
              <button type="button" aria-label="关闭" onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
            </div>
            <div className="max-h-[min(65vh,540px)] space-y-5 overflow-y-auto px-6 py-5">
              <label className="block text-sm text-gray-700">
                <span>用户组名称 <span className="text-red-500">*</span></span>
                <input autoFocus value={createName} onChange={(event) => { setCreateName(event.target.value); setCreateError(''); }} maxLength={50} placeholder="请输入用户组名称" className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="block text-sm text-gray-700">
                <span>用户组描述</span>
                <textarea value={createDescription} onChange={(event) => setCreateDescription(event.target.value)} maxLength={500} rows={3} placeholder="请输入用户组描述" className="mt-2 w-full resize-y rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="block text-sm text-gray-700">
                <span>用户组所属分组</span>
                <select value="manual" disabled className="mt-2 h-10 w-full rounded border border-gray-300 bg-gray-50 px-3 text-gray-700"><option value="manual">手动管理</option></select>
              </label>
              <label className="block text-sm text-gray-700">
                <span>适用范围</span>
                <select value={createScope} onChange={(event) => { setCreateScope(event.target.value as UserGroupScope); setCreateScopeTarget(''); setCreateError(''); }} className="mt-2 h-10 w-full rounded border border-gray-300 bg-white px-3 outline-none focus:border-[#2f75b5]">
                  <option value="全员">全员</option>
                  <option value="指定部门">指定部门</option>
                  <option value="指定人员">指定人员</option>
                </select>
              </label>
              {createScope !== '全员' && (
                <label className="block text-sm text-gray-700">
                  <span>{createScope === '指定部门' ? '适用部门' : '适用人员'} <span className="text-red-500">*</span></span>
                  <input value={createScopeTarget} onChange={(event) => { setCreateScopeTarget(event.target.value); setCreateError(''); }} placeholder={createScope === '指定部门' ? '请输入部门名称' : '请输入人员姓名'} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
                </label>
              )}
              {createError && <p role="alert" className="text-sm text-red-600">{createError}</p>}
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button type="button" onClick={() => setCreateOpen(false)} className="h-9 rounded border border-gray-300 px-4 text-gray-700 hover:bg-gray-50">取消</button>
              <button type="button" onClick={handleConfirmAddGroup} className="h-9 rounded bg-[#2f75b5] px-4 font-medium text-white hover:bg-[#28669f]">确认</button>
            </div>
          </div>
        </div>
      )}

      {syncOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-xl">
            <div className="mb-3 text-lg font-semibold text-gray-900">从主数据同步</div>
            <p className="text-sm leading-6 text-gray-600">上次更新时间{lastSyncTime}，是否需要再次更新？</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setSyncOpen(false)} className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={handleConfirmSync} className="rounded bg-[#2f75b5] px-4 py-2 text-sm font-medium text-white hover:bg-[#28669f]">确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const emptyTrustedRouteDraft: TrustedRouteDictionaryItem = {
  id: '',
  label: '',
  origin: '',
  paths: '',
  sort: 1,
  status: 'normal',
  createdAt: '',
};

type TrustedRouteDictionaryMeta = {
  id: string;
  name: string;
  type: string;
  status: 'normal' | 'disabled';
  remark: string;
  createdAt: string;
};

const trustedRouteDictionaryMeta: TrustedRouteDictionaryMeta = {
  id: '1',
  name: TRUSTED_ROUTE_DICTIONARY_NAME,
  type: TRUSTED_ROUTE_DICTIONARY_TYPE,
  status: 'normal' as const,
  remark: '客户端内嵌授信 URL 列表',
  createdAt: '2026-09-27 10:00:00',
};

const formatDictionaryDateTime = () => {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

function TrustedRouteDictionaryManagement() {
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [dictionaryMeta, setDictionaryMeta] = useState<TrustedRouteDictionaryMeta>(trustedRouteDictionaryMeta);
  const [dictionaryDeleted, setDictionaryDeleted] = useState(false);
  const [metaEditorOpen, setMetaEditorOpen] = useState(false);
  const [metaDraft, setMetaDraft] = useState<TrustedRouteDictionaryMeta>(trustedRouteDictionaryMeta);
  const [metaErrors, setMetaErrors] = useState<string[]>([]);
  const [items, setItems] = useState<TrustedRouteDictionaryItem[]>(() => loadTrustedRouteItems().map((item, index) => ({
    ...item,
    sort: item.sort ?? index + 1,
    status: item.status ?? 'normal',
    createdAt: item.createdAt || formatDictionaryDateTime(),
  })));
  const [dictionaryNameDraft, setDictionaryNameDraft] = useState('');
  const [dictionaryTypeDraft, setDictionaryTypeDraft] = useState('');
  const [dictionaryFilters, setDictionaryFilters] = useState({ name: '', type: '' });
  const [labelKeywordDraft, setLabelKeywordDraft] = useState('');
  const [labelKeyword, setLabelKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TrustedRouteDictionaryItem>(emptyTrustedRouteDraft);
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  const rules = buildTrustedRouteRules(items);
  const dictionaryVisible = !dictionaryDeleted
    && (!dictionaryFilters.name || dictionaryMeta.name.toLowerCase().includes(dictionaryFilters.name.toLowerCase()))
    && (!dictionaryFilters.type || dictionaryMeta.type.toLowerCase().includes(dictionaryFilters.type.toLowerCase()));
  const filteredItems = items
    .filter(item => !labelKeyword || item.label.toLowerCase().includes(labelKeyword.toLowerCase()))
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const pageSize = 12;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const visibleItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allVisibleSelected = visibleItems.length > 0 && visibleItems.every(item => selectedIds.has(item.id));

  useEffect(() => {
    setCurrentPage(page => Math.min(page, totalPages));
  }, [totalPages]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const openMetaEditor = () => {
    setMetaDraft({ ...dictionaryMeta });
    setMetaErrors([]);
    setMetaEditorOpen(true);
  };

  const saveMetaDraft = () => {
    const nextErrors: string[] = [];
    if (!metaDraft.name.trim()) nextErrors.push('请输入字典名称');
    if (!metaDraft.type.trim()) nextErrors.push('请输入字典类型');
    if (nextErrors.length > 0) {
      setMetaErrors(nextErrors);
      return;
    }
    setDictionaryMeta({
      ...metaDraft,
      name: metaDraft.name.trim(),
      type: metaDraft.type.trim(),
      remark: metaDraft.remark.trim(),
    });
    setMetaEditorOpen(false);
    showToast('字典信息已修改');
  };

  const deleteDictionary = () => {
    if (!window.confirm(`确认删除字典“${dictionaryMeta.name}”及其全部字典数据吗？`)) return;
    if (!saveTrustedRouteItems([])) {
      showToast('删除失败，请检查浏览器存储权限');
      return;
    }
    setItems([]);
    setSelectedIds(new Set());
    setDictionaryDeleted(true);
    showToast('字典已删除');
  };

  const openCreate = () => {
    setEditingId(null);
    setDraft({
      ...emptyTrustedRouteDraft,
      id: `trusted-route-${Date.now()}`,
      sort: Math.max(0, ...items.map(item => item.sort ?? 0)) + 1,
      createdAt: formatDictionaryDateTime(),
    });
    setErrors([]);
    setEditorOpen(true);
  };

  const openEdit = (item: TrustedRouteDictionaryItem) => {
    setEditingId(item.id);
    setDraft({ ...item });
    setErrors([]);
    setEditorOpen(true);
  };

  const saveDraft = () => {
    const validation = validateTrustedRouteItem(draft);
    const duplicateRules = validation.normalizedPaths.filter(path => items.some(item => {
      if (item.id === editingId) return false;
      const current = validateTrustedRouteItem(item);
      return current.valid && current.normalizedOrigin === validation.normalizedOrigin && current.normalizedPaths.includes(path);
    }));
    const nextErrors = [...validation.errors];
    if (duplicateRules.length > 0) nextErrors.push(`已存在相同的授信范围：${duplicateRules.join('、')}`);
    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }
    if (validation.warnings.length > 0 && !window.confirm(`${validation.warnings.join('\n')}\n\n是否继续保存？`)) return;

    const normalized: TrustedRouteDictionaryItem = {
      id: draft.id || `trusted-route-${Date.now()}`,
      label: draft.label.trim(),
      origin: validation.normalizedOrigin,
      paths: validation.normalizedPaths.join(';'),
      sort: Math.max(1, Number(draft.sort) || 1),
      status: draft.status === 'disabled' ? 'disabled' : 'normal',
      createdAt: draft.createdAt || formatDictionaryDateTime(),
    };
    const nextItems = editingId
      ? items.map(item => item.id === editingId ? normalized : item)
      : [...items, normalized];
    if (!saveTrustedRouteItems(nextItems)) {
      setErrors(['保存失败，请检查浏览器存储权限后重试']);
      return;
    }
    setItems(nextItems);
    setEditorOpen(false);
    showToast(editingId ? '授信路由已更新' : '授信路由已新增');
  };

  const deleteItem = (item: TrustedRouteDictionaryItem) => {
    if (!window.confirm(`确认删除“${item.label}”的授信路由吗？`)) return;
    const nextItems = items.filter(current => current.id !== item.id);
    if (!saveTrustedRouteItems(nextItems)) {
      showToast('删除失败，请检查浏览器存储权限');
      return;
    }
    setItems(nextItems);
    setSelectedIds(current => {
      const next = new Set(current);
      next.delete(item.id);
      return next;
    });
    showToast('授信路由已删除');
  };

  const deleteSelectedItems = () => {
    if (selectedIds.size === 0) {
      showToast('请先选择需要删除的字典数据');
      return;
    }
    if (!window.confirm(`确认删除选中的 ${selectedIds.size} 条字典数据吗？`)) return;
    const nextItems = items.filter(item => !selectedIds.has(item.id));
    if (!saveTrustedRouteItems(nextItems)) {
      showToast('删除失败，请检查浏览器存储权限');
      return;
    }
    setItems(nextItems);
    setSelectedIds(new Set());
    showToast('选中字典数据已删除');
  };

  const toggleSelected = (id: string) => {
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelectedIds(current => {
      const next = new Set(current);
      if (allVisibleSelected) visibleItems.forEach(item => next.delete(item.id));
      else visibleItems.forEach(item => next.add(item.id));
      return next;
    });
  };

  return (
    <div className="relative min-w-0">
      {view === 'list' ? (
        <div className="space-y-5">
          <section className="border border-gray-200 bg-white px-6 py-5">
            <div className="grid grid-cols-[120px_minmax(220px,370px)_120px_minmax(220px,370px)_auto] items-center gap-4 max-xl:grid-cols-[110px_1fr]">
              <label className="text-right text-sm text-gray-700 max-xl:text-left">字典名称</label>
              <input value={dictionaryNameDraft} onChange={event => setDictionaryNameDraft(event.target.value)} placeholder="请输入字典名称" className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
              <label className="text-right text-sm text-gray-700 max-xl:text-left">字典类型</label>
              <input value={dictionaryTypeDraft} onChange={event => setDictionaryTypeDraft(event.target.value)} placeholder="请输入字典类型" className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
              <div className="flex items-center justify-end gap-3 max-xl:col-span-2 max-xl:justify-start">
                <button type="button" onClick={() => setDictionaryFilters({ name: dictionaryNameDraft.trim(), type: dictionaryTypeDraft.trim() })} className="h-10 rounded bg-[#2f75b5] px-5 text-sm font-medium text-white hover:bg-[#28669f]">查询</button>
                <button type="button" onClick={() => { setDictionaryNameDraft(''); setDictionaryTypeDraft(''); setDictionaryFilters({ name: '', type: '' }); }} className="h-10 rounded border border-gray-300 bg-white px-5 text-sm text-gray-600 hover:bg-gray-50">重置</button>
              </div>
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-6">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
                <thead className="border-y border-gray-200 bg-gray-50 text-gray-700">
                  <tr>
                    <th className="w-[90px] px-5 py-3 font-medium">字典编号</th>
                    <th className="w-[200px] px-5 py-3 font-medium">字典名称</th>
                    <th className="w-[240px] px-5 py-3 font-medium">字典类型</th>
                    <th className="w-[120px] px-5 py-3 font-medium">状态</th>
                    <th className="px-5 py-3 font-medium">备注</th>
                    <th className="w-[190px] px-5 py-3 font-medium">创建时间</th>
                    <th className="w-[140px] px-5 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dictionaryVisible ? (
                    <tr className="hover:bg-[#f5f9fd]">
                      <td className="px-5 py-4 text-gray-600">{dictionaryMeta.id}</td>
                      <td className="px-5 py-4 font-medium text-gray-800">{dictionaryMeta.name}</td>
                      <td className="px-5 py-4"><button type="button" onClick={() => setView('detail')} className="font-mono text-xs text-[#2f75b5] hover:underline">{dictionaryMeta.type}</button></td>
                      <td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-gray-700"><span className={`h-2 w-2 rounded-full ${dictionaryMeta.status === 'disabled' ? 'bg-gray-400' : 'bg-teal-500'}`} />{dictionaryMeta.status === 'disabled' ? '停用' : '正常'}</span></td>
                      <td className="px-5 py-4 text-gray-600">{dictionaryMeta.remark || '-'}</td>
                      <td className="px-5 py-4 text-gray-600">{dictionaryMeta.createdAt}</td>
                      <td className="px-5 py-4"><div className="flex items-center gap-3 whitespace-nowrap"><button type="button" onClick={openMetaEditor} className="text-[#2f75b5] hover:underline">修改</button><button type="button" onClick={deleteDictionary} className="text-[#2f75b5] hover:underline">删除</button></div></td>
                    </tr>
                  ) : <tr><td colSpan={7} className="px-5 py-14 text-center text-gray-400">暂无字典数据</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex justify-end text-sm text-gray-500">共 {dictionaryVisible ? 1 : 0} 条</div>
          </section>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => { setView('list'); setSelectedIds(new Set()); }} className="inline-flex items-center gap-1 text-sm text-[#2f75b5] hover:underline"><ChevronLeft size={16} />返回字典列表</button>
            <div className="text-sm text-gray-500">共 {items.length} 条，生效规则 {rules.length} 条</div>
          </div>

          <section className="border border-gray-200 bg-white px-6 py-5">
            <div className="grid grid-cols-[120px_minmax(220px,370px)_120px_minmax(220px,370px)_auto] items-center gap-4 max-xl:grid-cols-[110px_1fr]">
              <label className="text-right text-sm text-gray-700 max-xl:text-left">字典名称</label>
              <select value={dictionaryMeta.type} disabled className="h-10 rounded border border-gray-300 bg-white px-3 text-sm text-gray-700 disabled:bg-gray-50">
                <option value={dictionaryMeta.type}>{dictionaryMeta.name}</option>
              </select>
              <label className="text-right text-sm text-gray-700 max-xl:text-left">字典标签</label>
              <input value={labelKeywordDraft} onChange={event => setLabelKeywordDraft(event.target.value)} placeholder="请输入字典标签" className="h-10 rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2f75b5]" />
              <div className="flex items-center justify-end gap-3 max-xl:col-span-2 max-xl:justify-start">
                <button type="button" onClick={() => { setLabelKeyword(labelKeywordDraft.trim()); setCurrentPage(1); }} className="h-10 rounded bg-[#2f75b5] px-5 text-sm font-medium text-white hover:bg-[#28669f]">查询</button>
                <button type="button" onClick={() => { setLabelKeywordDraft(''); setLabelKeyword(''); setCurrentPage(1); }} className="h-10 rounded border border-gray-300 bg-white px-5 text-sm text-gray-600 hover:bg-gray-50">重置</button>
              </div>
            </div>
          </section>

          <section className="border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <button type="button" onClick={openCreate} className="inline-flex h-9 items-center gap-1.5 rounded bg-[#2f75b5] px-4 text-sm font-medium text-white hover:bg-[#28669f]"><Plus size={16} />新增</button>
              <button type="button" onClick={deleteSelectedItems} className="h-9 rounded border border-gray-300 bg-white px-4 text-sm text-gray-600 hover:bg-gray-50">删除</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
                <thead className="border-y border-gray-200 bg-gray-50 text-gray-700">
                  <tr>
                    <th className="w-[52px] px-4 py-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAllVisible} aria-label="选择全部字典数据" /></th>
                    <th className="w-[100px] px-4 py-3 font-medium">字典编码</th>
                    <th className="w-[180px] px-4 py-3 font-medium">字典标签</th>
                    <th className="w-[250px] px-4 py-3 font-medium">字典键值</th>
                    <th className="w-[110px] px-4 py-3 font-medium">字典排序</th>
                    <th className="w-[120px] px-4 py-3 font-medium">字典状态</th>
                    <th className="px-4 py-3 font-medium">备注</th>
                    <th className="w-[180px] px-4 py-3 font-medium">创建时间</th>
                    <th className="w-[140px] px-4 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleItems.map((item, index) => {
                    const validation = validateTrustedRouteItem(item);
                    return (
                      <tr key={item.id} className="hover:bg-[#f5f9fd]">
                        <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelected(item.id)} aria-label={`选择${item.label}`} /></td>
                        <td className="px-4 py-4 text-gray-600">{(currentPage - 1) * pageSize + index + 1}</td>
                        <td className="px-4 py-4 font-medium text-gray-900">{item.label}</td>
                        <td className="px-4 py-4 font-mono text-xs text-gray-700">{item.origin}</td>
                        <td className="px-4 py-4 text-gray-600">{item.sort ?? index + 1}</td>
                        <td className="px-4 py-4"><span className="inline-flex items-center gap-2 text-gray-700"><span className={`h-2 w-2 rounded-full ${item.status === 'disabled' ? 'bg-gray-400' : 'bg-teal-500'}`} />{item.status === 'disabled' ? '停用' : '正常'}</span></td>
                        <td className="px-4 py-4 text-gray-600"><span title={validation.valid ? validation.normalizedPaths.map(path => `${validation.normalizedOrigin}${path}`).join('\n') : validation.errors.join('；')}>{item.paths}</span>{!validation.valid && <span className="ml-2 text-xs text-red-600">配置异常</span>}</td>
                        <td className="px-4 py-4 text-gray-600">{item.createdAt || '-'}</td>
                        <td className="px-4 py-4"><div className="flex items-center gap-3 whitespace-nowrap"><button type="button" onClick={() => openEdit(item)} className="text-[#2f75b5] hover:underline">编辑</button><button type="button" onClick={() => deleteItem(item)} className="text-[#2f75b5] hover:underline">删除</button></div></td>
                      </tr>
                    );
                  })}
                  {visibleItems.length === 0 && <tr><td colSpan={9} className="px-5 py-14 text-center text-gray-400">暂无字典数据</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex items-center justify-end gap-3 text-sm text-gray-500">
              <span>共 {filteredItems.length} 条</span>
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))} className="h-9 w-9 rounded border border-gray-200 text-gray-500 disabled:text-gray-300">‹</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-9 w-9 rounded border ${currentPage === page ? 'border-[#2f75b5] text-[#2f75b5]' : 'border-gray-200 text-gray-500'}`}>{page}</button>)}
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} className="h-9 w-9 rounded border border-gray-200 text-gray-500 disabled:text-gray-300">›</button>
              <span className="rounded border border-gray-200 px-3 py-2">12 条/页</span>
            </div>
          </section>
        </div>
      )}

      {metaEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">修改字典</h3>
              <button type="button" onClick={() => setMetaEditorOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="关闭"><X size={20} /></button>
            </div>
            <div className="space-y-5 px-6 py-5">
              <label className="block text-sm text-gray-700">字典名称 <span className="text-red-500">*</span>
                <input autoFocus value={metaDraft.name} onChange={event => { setMetaDraft(current => ({ ...current, name: event.target.value })); setMetaErrors([]); }} placeholder="请输入字典名称" className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="block text-sm text-gray-700">字典类型 <span className="text-red-500">*</span>
                <input value={metaDraft.type} onChange={event => { setMetaDraft(current => ({ ...current, type: event.target.value })); setMetaErrors([]); }} placeholder="请输入字典类型" className="mt-2 h-10 w-full rounded border border-gray-300 px-3 font-mono outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="block text-sm text-gray-700">状态
                <select value={metaDraft.status} onChange={event => setMetaDraft(current => ({ ...current, status: event.target.value as 'normal' | 'disabled' }))} className="mt-2 h-10 w-full rounded border border-gray-300 bg-white px-3 outline-none focus:border-[#2f75b5]"><option value="normal">正常</option><option value="disabled">停用</option></select>
              </label>
              <label className="block text-sm text-gray-700">备注
                <textarea value={metaDraft.remark} onChange={event => setMetaDraft(current => ({ ...current, remark: event.target.value }))} rows={3} placeholder="请输入备注" className="mt-2 w-full resize-y rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#2f75b5]" />
              </label>
              {metaErrors.length > 0 && <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{metaErrors.map(error => <div key={error}>{error}</div>)}</div>}
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button type="button" onClick={() => setMetaEditorOpen(false)} className="h-9 rounded border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button type="button" onClick={saveMetaDraft} className="h-9 rounded bg-[#2f75b5] px-4 text-sm font-medium text-white hover:bg-[#28669f]">确认</button>
            </div>
          </div>
        </div>
      )}

      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{editingId ? '编辑字典数据' : '新增字典数据'}</h3>
                <p className="mt-1 text-xs text-gray-500">{dictionaryMeta.name}</p>
              </div>
              <button type="button" onClick={() => setEditorOpen(false)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="关闭"><X size={20} /></button>
            </div>
            <div className="space-y-5 px-6 py-5">
              <label className="block text-sm text-gray-700">数据标签 <span className="text-red-500">*</span>
                <input autoFocus value={draft.label} onChange={event => { setDraft(current => ({ ...current, label: event.target.value })); setErrors([]); }} placeholder="例如：OA系统" className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
              </label>
              <label className="block text-sm text-gray-700">数据键值 <span className="text-red-500">*</span>
                <input value={draft.origin} onChange={event => { setDraft(current => ({ ...current, origin: event.target.value })); setErrors([]); }} placeholder="例如：https://oa.example.com" className="mt-2 h-10 w-full rounded border border-gray-300 px-3 font-mono outline-none focus:border-[#2f75b5]" />
                <span className="mt-1 block text-xs text-gray-400">填写具体业务系统的协议、子域名和可选端口；不填写公司母域名、路径或通配符。</span>
              </label>
              <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
                <label className="block text-sm text-gray-700">字典排序
                  <input type="number" min={1} value={draft.sort ?? 1} onChange={event => setDraft(current => ({ ...current, sort: Number(event.target.value) || 1 }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
                </label>
                <label className="block text-sm text-gray-700">字典状态
                  <select value={draft.status || 'normal'} onChange={event => setDraft(current => ({ ...current, status: event.target.value as 'normal' | 'disabled' }))} className="mt-2 h-10 w-full rounded border border-gray-300 bg-white px-3 outline-none focus:border-[#2f75b5]"><option value="normal">正常</option><option value="disabled">停用</option></select>
                </label>
              </div>
              <label className="block text-sm text-gray-700">备注 <span className="text-red-500">*</span>
                <textarea value={draft.paths} onChange={event => { setDraft(current => ({ ...current, paths: event.target.value })); setErrors([]); }} rows={3} placeholder="例如：/test1;/workflow;/approval" className="mt-2 w-full resize-y rounded border border-gray-300 px-3 py-2 font-mono outline-none focus:border-[#2f75b5]" />
                <span className="mt-1 block text-xs text-gray-400">填写稳定的应用根路径；多个路径用分号分隔，不填写查询参数和锚点。</span>
              </label>
              {draft.origin.trim() && draft.paths.trim() && (
                <div className="border-l-4 border-[#2f75b5] bg-blue-50 px-4 py-3 text-sm text-gray-700">
                  <div className="mb-2 font-medium">组合预览</div>
                  <div className="space-y-1 font-mono text-xs">
                    {draft.paths.split(/[;；]/).map(path => path.trim()).filter(Boolean).map((path, index) => <div key={`${path}-${index}`}>{draft.origin.trim()}{path}</div>)}
                  </div>
                </div>
              )}
              {draft.paths.split(/[;；]/).map(path => path.trim()).includes('/') && (
                <div className="rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">高风险：路径 / 会授信该 Origin 下的全部页面，保存时需要再次确认。</div>
              )}
              {errors.length > 0 && (
                <div role="alert" className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errors.map(error => <div key={error}>{error}</div>)}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button type="button" onClick={() => setEditorOpen(false)} className="h-9 rounded border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button type="button" onClick={saveDraft} className="h-9 rounded bg-[#2f75b5] px-4 text-sm font-medium text-white hover:bg-[#28669f]">确认</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded bg-gray-900 px-4 py-2 text-sm text-white shadow-xl">{toast}</div>}
    </div>
  );
}

type AppPortalTab = 'App员工工作台' | 'App外部人员工作台' | 'PC工作台';
type ManagedAppSource = '系统内置' | '管理员创建' | '流程审批' | '业务系统';
type ManagedAppRange = '全员可用' | '指定部门' | '指定用户组' | '指定人员';
type ManagedAppStatus = '启用' | '停用';
type ManagedAppOpenMode = 'auto' | 'browser' | 'native';
type AppEditorMode = 'create' | 'config';

type AppGroupRecord = {
  id: string;
  portal: AppPortalTab;
  name: string;
  order: number;
};

type ManagedAppRecord = {
  id: string;
  appId: string;
  name: string;
  description: string;
  category: string;
  source: ManagedAppSource;
  developerCompany: string;
  developerEmail: string;
  range: ManagedAppRange;
  status: ManagedAppStatus;
  groupId: string;
  entryUrl: string;
  openMode?: ManagedAppOpenMode;
  iconTone: string;
  sort: number;
};

const appPortalTabs: AppPortalTab[] = ['App员工工作台', 'App外部人员工作台', 'PC工作台'];
const appCategories = ['全部', '协同办公', '综合服务', '员工服务', '数据服务', 'AI助手', '数据卡片', '应用卡片', '常用功能', '财务系统', '人力系统', '综合系统', '运行系统', '营销系统'];
const appRanges: Array<'全部' | ManagedAppRange> = ['全部', '全员可用', '指定部门', '指定用户组', '指定人员'];
const appOpenModeLabels: Record<ManagedAppOpenMode, string> = {
  auto: '自动判断',
  browser: '电脑浏览器打开',
  native: '原生能力',
};
const appOpenModes: ManagedAppOpenMode[] = ['auto', 'browser', 'native'];

const initialAppGroups: AppGroupRecord[] = [
  { id: 'app-service', portal: 'App员工工作台', name: '综合服务', order: 1 },
  { id: 'app-document', portal: 'App员工工作台', name: '文档中心', order: 2 },
  { id: 'app-employee', portal: 'App员工工作台', name: '员工服务', order: 3 },
  { id: 'app-data', portal: 'App员工工作台', name: '数据服务', order: 4 },
  { id: 'external-service', portal: 'App外部人员工作台', name: '外部协同', order: 1 },
  { id: 'external-query', portal: 'App外部人员工作台', name: '信息查询', order: 2 },
  { id: 'pc-data-card', portal: 'PC工作台', name: '数据卡片', order: 1 },
  { id: 'pc-app-card', portal: 'PC工作台', name: '门户应用卡片', order: 2 },
  { id: 'pc-common-system', portal: 'PC工作台', name: '常用系统', order: 3 },
  { id: 'pc-common-feature', portal: 'PC工作台', name: '常用功能', order: 4 },
];

const initialManagedApps: ManagedAppRecord[] = [
  {
    id: 'approval',
    appId: 'APP-10001',
    name: '审批',
    description: '简单、高效、开放的审批工具',
    category: '协同办公',
    source: '系统内置',
    developerCompany: '北京飞书科技有限公司',
    developerEmail: 'support@feishu.cn',
    range: '全员可用',
    status: '启用',
    groupId: 'app-service',
    entryUrl: '/web_client/process',
    iconTone: 'bg-orange-500',
    sort: 1,
  },
  {
    id: 'salary',
    appId: 'APP-10002',
    name: '工资单',
    description: '便捷、安全的工资单管理',
    category: '员工服务',
    source: '流程审批',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'it-service@juneyaoair.com',
    range: '指定部门',
    status: '启用',
    groupId: 'app-employee',
    entryUrl: '/web_client/business',
    iconTone: 'bg-blue-500',
    sort: 2,
  },
  {
    id: 'pc-stat-approval',
    appId: 'PC-DATA-001',
    name: '流程审批',
    description: '待批阅流程',
    category: '数据卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-data-card',
    entryUrl: '/web_client/process',
    iconTone: 'bg-pink-700',
    sort: 1,
  },
  {
    id: 'pc-stat-revenue',
    appId: 'PC-DATA-002',
    name: '业务收入',
    description: '业务收入明细',
    category: '数据卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-data-card',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-green-600',
    sort: 2,
  },
  {
    id: 'pc-stat-todo',
    appId: 'PC-DATA-003',
    name: '待办事项',
    description: '我的待办',
    category: '数据卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-data-card',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-amber-500',
    sort: 3,
  },
  {
    id: 'pc-stat-progress',
    appId: 'PC-DATA-004',
    name: '事项进度',
    description: '事项协同看板',
    category: '数据卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-data-card',
    entryUrl: '/web_client/enterprise?tab=work-items',
    iconTone: 'bg-blue-600',
    sort: 4,
  },
  {
    id: 'pc-card-documents',
    appId: 'PC-CARD-001',
    name: '今日未读文档',
    description: '门户应用卡片',
    category: '应用卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-app-card',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-sky-600',
    sort: 1,
  },
  {
    id: 'pc-card-calendar',
    appId: 'PC-CARD-002',
    name: '周历',
    description: '门户应用卡片',
    category: '应用卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-app-card',
    entryUrl: '/web_client/calendar',
    iconTone: 'bg-indigo-600',
    sort: 2,
  },
  {
    id: 'pc-card-systems',
    appId: 'PC-CARD-003',
    name: '常用系统',
    description: '门户应用卡片',
    category: '应用卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-app-card',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-amber-600',
    sort: 3,
  },
  {
    id: 'pc-card-office-apps',
    appId: 'PC-CARD-004',
    name: '常用功能',
    description: '工作汇报、航班动态等入口',
    category: '应用卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-app-card',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-pink-700',
    sort: 4,
  },
  {
    id: 'pc-card-duty',
    appId: 'PC-CARD-005',
    name: '今日值班',
    description: '公司值班岗位与人员',
    category: '应用卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-app-card',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-rose-600',
    sort: 5,
  },
  {
    id: 'pc-card-courses',
    appId: 'PC-CARD-006',
    name: '临期课程',
    description: '门户应用卡片',
    category: '应用卡片',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-app-card',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-violet-600',
    sort: 6,
  },
  {
    id: 'pc-system-oa',
    appId: 'PC-SYS-001',
    name: 'OA',
    description: '办公自动化系统',
    category: '综合系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=oa',
    iconTone: 'bg-purple-500',
    sort: 1,
  },
  {
    id: 'pc-system-bip',
    appId: 'PC-SYS-002',
    name: 'BIP系统',
    description: '财务综合管理平台',
    category: '财务系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=bip',
    iconTone: 'bg-amber-500',
    sort: 2,
  },
  {
    id: 'pc-system-fai',
    appId: 'PC-SYS-003',
    name: '财翼融合智能平台FAI',
    description: '财务智能分析平台',
    category: '财务系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=fai',
    iconTone: 'bg-amber-500',
    sort: 3,
  },
  {
    id: 'pc-system-expense',
    appId: 'PC-SYS-004',
    name: '费控商旅系统',
    description: '费控与商旅管理',
    category: '财务系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=expense',
    iconTone: 'bg-orange-500',
    sort: 4,
  },
  {
    id: 'pc-system-flight',
    appId: 'PC-SYS-005',
    name: '航班动态',
    description: '航班实时动态查询',
    category: '运行系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=flight',
    iconTone: 'bg-cyan-500',
    sort: 5,
  },
  {
    id: 'pc-system-maintenance',
    appId: 'PC-SYS-006',
    name: '机务维修',
    description: '机务维修管理',
    category: '运行系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=maintenance',
    iconTone: 'bg-green-500',
    sort: 6,
  },
  {
    id: 'pc-system-data-portal',
    appId: 'PC-SYS-007',
    name: '公司数据门户',
    description: '公司数据统一入口',
    category: '综合系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=data-portal',
    iconTone: 'bg-blue-500',
    sort: 7,
  },
  {
    id: 'pc-system-pm',
    appId: 'PC-SYS-008',
    name: '企业项目管理平台',
    description: '项目计划和进度管理',
    category: '综合系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=pm',
    iconTone: 'bg-indigo-500',
    sort: 8,
  },
  {
    id: 'pc-system-itops',
    appId: 'PC-SYS-009',
    name: '运维管理平台',
    description: 'IT运维管理平台',
    category: '综合系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=itops',
    iconTone: 'bg-sky-500',
    sort: 9,
  },
  {
    id: 'pc-system-bi',
    appId: 'PC-SYS-010',
    name: '公司BI平台',
    description: '经营分析平台',
    category: '综合系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=bi',
    iconTone: 'bg-cyan-500',
    sort: 10,
  },
  {
    id: 'pc-system-ehr',
    appId: 'PC-SYS-011',
    name: '人力资源E-HR系统',
    description: '员工信息、考勤、薪资等人力服务',
    category: '人力系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=ehr',
    iconTone: 'bg-blue-500',
    sort: 11,
  },
  {
    id: 'pc-system-ioffice',
    appId: 'PC-SYS-012',
    name: 'ioffice',
    description: '办公协同入口',
    category: '人力系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=ioffice',
    iconTone: 'bg-indigo-500',
    sort: 12,
  },
  {
    id: 'pc-system-school',
    appId: 'PC-SYS-013',
    name: '梧桐云学堂',
    description: '企业在线学习平台',
    category: '人力系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=school',
    iconTone: 'bg-violet-500',
    sort: 13,
  },
  {
    id: 'pc-system-revenue',
    appId: 'PC-SYS-014',
    name: '收益管理系统',
    description: '收益管理',
    category: '营销系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=revenue',
    iconTone: 'bg-rose-600',
    sort: 14,
  },
  {
    id: 'pc-system-member',
    appId: 'PC-SYS-015',
    name: '会员管理系统',
    description: '会员管理',
    category: '营销系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=member',
    iconTone: 'bg-rose-500',
    sort: 15,
  },
  {
    id: 'pc-system-knowledge',
    appId: 'PC-SYS-016',
    name: '吉祥知识平台',
    description: '企业知识平台',
    category: '综合系统',
    source: '业务系统',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'business-system@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-system',
    entryUrl: '/web_client/business?system=knowledge',
    iconTone: 'bg-violet-500',
    sort: 16,
  },
  {
    id: 'pc-feature-flight-status',
    appId: 'PC-FUNC-001',
    name: '航班动态',
    description: '常用功能入口',
    category: '常用功能',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-feature',
    entryUrl: '/web_client/business',
    iconTone: 'bg-cyan-600',
    sort: 1,
  },
  {
    id: 'pc-feature-work-report',
    appId: 'PC-FUNC-002',
    name: '工作汇报',
    description: '常用功能入口',
    category: '常用功能',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-feature',
    entryUrl: '/web_client/work-report',
    iconTone: 'bg-pink-600',
    sort: 2,
  },
  {
    id: 'pc-feature-okr',
    appId: 'PC-FUNC-003',
    name: 'OKR',
    description: '常用功能入口',
    category: '常用功能',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-feature',
    entryUrl: '/web_client/okr',
    iconTone: 'bg-blue-600',
    sort: 3,
  },
  {
    id: 'pc-feature-discount-ticket',
    appId: 'PC-FUNC-004',
    name: '优惠票',
    description: '常用功能入口',
    category: '常用功能',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-feature',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-amber-500',
    sort: 4,
  },
  {
    id: 'pc-feature-salary',
    appId: 'PC-FUNC-005',
    name: '我的薪酬',
    description: '常用功能入口',
    category: '常用功能',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-feature',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-emerald-600',
    sort: 5,
  },
  {
    id: 'pc-feature-leave',
    appId: 'PC-FUNC-006',
    name: '我的休假',
    description: '常用功能入口',
    category: '常用功能',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-feature',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-sky-600',
    sort: 6,
  },
  {
    id: 'pc-feature-certificate',
    appId: 'PC-FUNC-007',
    name: '证明开具',
    description: '常用功能入口',
    category: '常用功能',
    source: '系统内置',
    developerCompany: '吉祥航空信息管理部',
    developerEmail: 'portal@juneyaoair.com',
    range: '全员可用',
    status: '启用',
    groupId: 'pc-common-feature',
    entryUrl: '/web_client/enterprise',
    iconTone: 'bg-violet-600',
    sort: 7,
  },
  {
    id: 'data-board',
    appId: 'APP-10006',
    name: '数据看板',
    description: '经营指标、服务指标和项目数据汇总',
    category: '数据服务',
    source: '系统内置',
    developerCompany: '吉祥航空数据平台组',
    developerEmail: 'data@juneyaoair.com',
    range: '指定部门',
    status: '停用',
    groupId: 'app-data',
    entryUrl: '/web_client/work-report',
    iconTone: 'bg-emerald-500',
    sort: 4,
  },
  {
    id: 'external-ticket',
    appId: 'APP-10007',
    name: '外部工单',
    description: '外部合作人员服务请求入口',
    category: '综合服务',
    source: '流程审批',
    developerCompany: '吉祥航空客服中心',
    developerEmail: 'service@juneyaoair.com',
    range: '指定用户组',
    status: '启用',
    groupId: 'external-service',
    entryUrl: '/web_client/business',
    iconTone: 'bg-amber-500',
    sort: 1,
  },
];

const defaultManagedAppDraft: ManagedAppRecord = {
  id: '',
  appId: '',
  name: '',
  description: '',
  category: '协同办公',
  source: '管理员创建',
  developerCompany: '吉祥航空信息管理部',
  developerEmail: 'admin@juneyaoair.com',
  range: '全员可用',
  status: '启用',
  groupId: 'app-service',
  entryUrl: '',
  openMode: 'auto',
  iconTone: 'bg-[#2f75b5]',
  sort: 1,
};

const resolveManagedAppOpenMode = (app: ManagedAppRecord): ManagedAppOpenMode => {
  if (app.openMode) return app.openMode;
  if (app.category === '员工服务') return 'native';
  return 'auto';
};

function ApplicationManagement() {
  const [activePortal, setActivePortal] = useState<AppPortalTab>('App员工工作台');
  const [groups, setGroups] = useState<AppGroupRecord[]>(initialAppGroups);
  const [apps, setApps] = useState<ManagedAppRecord[]>(initialManagedApps);
  const [selectedGroupId, setSelectedGroupId] = useState(initialAppGroups[0].id);
  const [groupKeyword, setGroupKeyword] = useState('');
  const [appKeyword, setAppKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('全部');
  const [rangeFilter, setRangeFilter] = useState<'全部' | ManagedAppRange>('全部');
  const [sortingGroups, setSortingGroups] = useState(false);
  const [toast, setToast] = useState('');
  const [editorMode, setEditorMode] = useState<AppEditorMode | null>(null);
  const [appDraft, setAppDraft] = useState<ManagedAppRecord>(defaultManagedAppDraft);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupDraft, setGroupDraft] = useState('');

  const portalGroups = groups
    .filter(group => group.portal === activePortal)
    .sort((a, b) => a.order - b.order);
  const visibleGroups = portalGroups.filter(group => group.name.includes(groupKeyword.trim()));
  const selectedGroup = portalGroups.find(group => group.id === selectedGroupId) || portalGroups[0];
  const selectedGroupAppCount = selectedGroup ? apps.filter(app => app.groupId === selectedGroup.id).length : 0;
  const filteredApps = apps
    .filter(app => !selectedGroup || app.groupId === selectedGroup.id)
    .filter(app => categoryFilter === '全部' || app.category === categoryFilter)
    .filter(app => rangeFilter === '全部' || app.range === rangeFilter)
    .filter(app => {
      const keyword = appKeyword.trim().toLowerCase();
      return !keyword || app.name.toLowerCase().includes(keyword) || app.appId.toLowerCase().includes(keyword);
    })
    .sort((a, b) => a.sort - b.sort);

  useEffect(() => {
    const firstGroup = groups
      .filter(group => group.portal === activePortal)
      .sort((a, b) => a.order - b.order)[0];
    if (firstGroup && !groups.some(group => group.id === selectedGroupId && group.portal === activePortal)) {
      setSelectedGroupId(firstGroup.id);
    }
  }, [activePortal, groups, selectedGroupId]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const openCreateApp = () => {
    setAppDraft({
      ...defaultManagedAppDraft,
      id: `custom-${Date.now()}`,
      appId: `APP-${Math.floor(20000 + Math.random() * 70000)}`,
      groupId: selectedGroup?.id || portalGroups[0]?.id || 'app-service',
      sort: apps.length + 1,
    });
    setEditorMode('create');
  };

  const openConfigApp = (app: ManagedAppRecord) => {
    setAppDraft({ ...app, openMode: resolveManagedAppOpenMode(app) });
    setEditorMode('config');
  };

  const saveAppDraft = () => {
    if (!appDraft.name.trim()) {
      showToast('请输入应用名称');
      return;
    }
    if (editorMode === 'create') {
      setApps(current => [{ ...appDraft, name: appDraft.name.trim() }, ...current]);
      showToast('应用已创建');
    }
    if (editorMode === 'config') {
      setApps(current => current.map(app => app.id === appDraft.id ? { ...appDraft, name: appDraft.name.trim() } : app));
      showToast('应用配置已保存');
    }
    setEditorMode(null);
  };

  const openAddGroup = () => {
    setEditingGroupId(null);
    setGroupDraft('');
    setGroupDialogOpen(true);
  };

  const openEditGroup = (group: AppGroupRecord) => {
    setEditingGroupId(group.id);
    setGroupDraft(group.name);
    setGroupDialogOpen(true);
  };

  const saveGroupDraft = () => {
    const name = groupDraft.trim() || `新建应用组${portalGroups.length + 1}`;
    if (editingGroupId) {
      setGroups(current => current.map(group => group.id === editingGroupId ? { ...group, name } : group));
      setGroupDraft('');
      setEditingGroupId(null);
      setGroupDialogOpen(false);
      showToast('应用组已保存');
      return;
    }
    const newGroup: AppGroupRecord = {
      id: `group-${Date.now()}`,
      portal: activePortal,
      name,
      order: portalGroups.length + 1,
    };
    setGroups(current => [...current, newGroup]);
    setSelectedGroupId(newGroup.id);
    setGroupDraft('');
    setEditingGroupId(null);
    setGroupDialogOpen(false);
    showToast('应用组已新增');
  };

  const deleteSelectedGroup = () => {
    if (!selectedGroup) return;
    if (selectedGroupAppCount > 0) {
      showToast('当前应用组下存在应用，暂不可删除');
      return;
    }
    setGroups(current => current.filter(group => group.id !== selectedGroup.id));
    showToast('应用组已删除');
  };

  const moveSelectedGroup = (direction: 'up' | 'down') => {
    if (!selectedGroup) return;
    const orderedGroups = portalGroups;
    const currentIndex = orderedGroups.findIndex(group => group.id === selectedGroup.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= orderedGroups.length) return;
    const currentGroup = orderedGroups[currentIndex];
    const targetGroup = orderedGroups[targetIndex];
    setGroups(current => current.map(group => {
      if (group.id === currentGroup.id) return { ...group, order: targetGroup.order };
      if (group.id === targetGroup.id) return { ...group, order: currentGroup.order };
      return group;
    }));
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] w-full min-w-0 bg-[#eef1f5] pt-3 text-sm text-gray-800">
      {toast && (
        <div className="fixed right-8 top-20 z-50 flex items-center gap-2 rounded bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          <CheckCircle2 size={16} className="text-green-300" />
          {toast}
        </div>
      )}
      <AdminTabs active="应用管理" />

      <div className="bg-white px-8 py-5">
        <div className="mb-4 text-sm text-gray-500">
          首页 <span className="mx-2">/</span> 工作台 <span className="mx-2">/</span>
          <span className="text-gray-800">应用管理</span>
        </div>
        <h2 className="mb-5 text-[26px] font-semibold text-gray-900">应用管理</h2>
        <div className="flex border-b border-gray-200">
          {appPortalTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActivePortal(tab)}
              className={`mr-10 border-b-2 px-1 pb-3 text-base transition-colors ${
                activePortal === tab
                  ? 'border-[#2f75b5] font-medium text-[#2f75b5]'
                  : 'border-transparent text-gray-600 hover:text-[#2f75b5]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[320px_minmax(0,1fr)] gap-5 p-5 max-xl:grid-cols-1">
        <aside className="min-h-[640px] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">应用组列表</h3>
            <div className="flex items-center gap-3">
              <button onClick={openAddGroup} className="inline-flex items-center gap-1 text-[#2f75b5] hover:underline">
                <Plus size={16} />
                添加
              </button>
              <button onClick={() => setSortingGroups(value => !value)} className="rounded border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50">
                {sortingGroups ? '完成' : '排序'}
              </button>
            </div>
          </div>
          <div className="relative mb-5">
            <input
              value={groupKeyword}
              onChange={(event) => setGroupKeyword(event.target.value)}
              placeholder="请输入应用组名称"
              className="h-10 w-full rounded border border-gray-300 pl-3 pr-10 outline-none focus:border-[#2f75b5]"
            />
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <div className="overflow-hidden rounded border border-gray-100">
            <div className="grid grid-cols-[minmax(0,1fr)_92px] bg-gray-50 px-4 py-3 font-medium text-gray-700">
              <span>应用组名称</span>
              <span>操作</span>
            </div>
            <div className="divide-y divide-gray-100">
              {visibleGroups.map(group => (
                <div
                  key={group.id}
                  className={`grid w-full grid-cols-[minmax(0,1fr)_92px] items-center px-4 py-3 text-left transition-colors ${
                    selectedGroup?.id === group.id ? 'bg-[#eaf4fc] text-[#2f75b5]' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <button onClick={() => setSelectedGroupId(group.id)} className="min-w-0 text-left">
                    <span className="block truncate font-medium">{group.name}</span>
                  </button>
                  <button onClick={() => openEditGroup(group)} className="text-left text-[#2f75b5] hover:underline">
                    编辑
                  </button>
                </div>
              ))}
              {visibleGroups.length === 0 && (
                <div className="px-4 py-10 text-center text-gray-400">暂无应用组</div>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={!sortingGroups} onClick={() => moveSelectedGroup('up')} className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">上移</button>
            <button disabled={!sortingGroups} onClick={() => moveSelectedGroup('down')} className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">下移</button>
            <button onClick={deleteSelectedGroup} className="rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50">删除应用组</button>
          </div>
        </aside>

        <section className="min-w-0 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedGroup?.name || '应用列表'}</h3>
              <p className="mt-1 text-gray-500">当前应用组共 {selectedGroupAppCount} 个应用，列表筛选仅影响右侧展示。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={openCreateApp} className="rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f]">新增应用</button>
              <button onClick={() => setRulesOpen(true)} className="rounded border border-[#2f75b5] bg-white px-4 py-2 font-medium text-[#2f75b5] hover:bg-[#eef7ff]">设置管理规则</button>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-3 border-y border-gray-100 py-4">
            <label className="flex h-9 items-center rounded border border-gray-300 bg-white px-3">
              <span className="mr-2 text-gray-500">应用类别:</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="border-none bg-transparent outline-none">
                {appCategories.map(category => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="flex h-9 items-center rounded border border-gray-300 bg-white px-3">
              <span className="mr-2 text-gray-500">可用范围:</span>
              <select value={rangeFilter} onChange={(event) => setRangeFilter(event.target.value as '全部' | ManagedAppRange)} className="border-none bg-transparent outline-none">
                {appRanges.map(range => <option key={range} value={range}>{range}</option>)}
              </select>
            </label>
            <div className="relative h-9 w-80">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={appKeyword}
                onChange={(event) => setAppKeyword(event.target.value)}
                placeholder="搜索应用名或 App ID"
                className="h-full w-full rounded border border-gray-300 pl-9 pr-3 outline-none focus:border-[#2f75b5]"
              />
            </div>
            <button onClick={() => { setAppKeyword(''); setCategoryFilter('全部'); setRangeFilter('全部'); }} className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">重置</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                  <th className="w-[300px] px-4 py-3 font-medium">应用</th>
                  <th className="w-[140px] px-4 py-3 font-medium">应用来源</th>
                  <th className="w-[260px] px-4 py-3 font-medium">开发者</th>
                  <th className="w-[150px] px-4 py-3 font-medium">可用范围</th>
                  <th className="w-[150px] px-4 py-3 font-medium">打开方式</th>
                  <th className="w-[110px] px-4 py-3 font-medium">状态</th>
                  <th className="w-[120px] px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-[#f5f9fd]">
                    <td className="px-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded text-base font-bold text-white ${app.iconTone}`}>
                          {app.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate font-medium text-gray-900">{app.name}</div>
                          <div className="mt-1 truncate text-gray-500">{app.description}</div>
                          <div className="mt-1 text-xs text-gray-400">{app.appId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-700">{app.source}</td>
                    <td className="px-4 py-4">
                      <div className="truncate text-gray-800">{app.developerCompany}</div>
                      <div className="mt-1 truncate text-gray-500">{app.developerEmail}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded px-2.5 py-1 text-xs font-medium ${
                        app.range === '全员可用' ? 'bg-blue-50 text-[#2f75b5]' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {app.range}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {appOpenModeLabels[resolveManagedAppOpenMode(app)]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded px-2.5 py-1 text-xs font-medium ${
                        app.status === '启用' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => openConfigApp(app)} className="text-[#2f75b5] hover:underline">配置</button>
                    </td>
                  </tr>
                ))}
                {filteredApps.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-14 text-center text-gray-400">暂无应用数据</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {groupDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-xl">
            <div className="mb-5 text-lg font-semibold text-gray-900">{editingGroupId ? '编辑应用组' : '新增应用组'}</div>
            <label className="block text-sm text-gray-700">
              应用组名称
              <input value={groupDraft} onChange={(event) => setGroupDraft(event.target.value)} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" placeholder="请输入应用组名称" />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setGroupDialogOpen(false)} className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={saveGroupDraft} className="rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f]">确定</button>
            </div>
          </div>
        </div>
      )}

      {editorMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col rounded bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">{editorMode === 'create' ? '新增应用' : '配置应用'}</h3>
              <button onClick={() => setEditorMode(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                <label className="block text-sm text-gray-700">应用名称
                  <input value={appDraft.name} onChange={(event) => setAppDraft(prev => ({ ...prev, name: event.target.value }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
                </label>
                <label className="block text-sm text-gray-700">应用分组
                  <select value={appDraft.groupId} onChange={(event) => setAppDraft(prev => ({ ...prev, groupId: event.target.value }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                    {portalGroups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                  </select>
                </label>
                <label className="block text-sm text-gray-700">入口地址
                  <input value={appDraft.entryUrl} onChange={(event) => setAppDraft(prev => ({ ...prev, entryUrl: event.target.value }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" placeholder="/web_client/..." />
                </label>
                <label className="block text-sm text-gray-700">打开方式
                  <select value={appDraft.openMode || 'auto'} onChange={(event) => setAppDraft(prev => ({ ...prev, openMode: event.target.value as ManagedAppOpenMode }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                    {appOpenModes.map(mode => <option key={mode} value={mode}>{appOpenModeLabels[mode]}</option>)}
                  </select>
                  <span className="mt-1 block text-xs text-gray-400">自动判断：站内地址使用前端路由；外链在客户端命中授信路由时内嵌，否则使用默认浏览器。</span>
                </label>
                <label className="block text-sm text-gray-700">应用类别
                  <select value={appDraft.category} onChange={(event) => setAppDraft(prev => ({ ...prev, category: event.target.value }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                    {appCategories.filter(category => category !== '全部').map(category => <option key={category} value={category}>{category}</option>)}
                  </select>
                </label>
                <label className="block text-sm text-gray-700">图标颜色
                  <select value={appDraft.iconTone} onChange={(event) => setAppDraft(prev => ({ ...prev, iconTone: event.target.value }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                    <option value="bg-[#2f75b5]">后台蓝</option>
                    <option value="bg-[#d51f5c]">品牌玫红</option>
                    <option value="bg-orange-500">橙色</option>
                    <option value="bg-emerald-500">绿色</option>
                    <option value="bg-cyan-600">青色</option>
                  </select>
                </label>
                <label className="block text-sm text-gray-700">排序值
                  <input type="number" value={appDraft.sort} onChange={(event) => setAppDraft(prev => ({ ...prev, sort: Number(event.target.value) || 1 }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]" />
                </label>
                <label className="block text-sm text-gray-700">启用状态
                  <select value={appDraft.status} onChange={(event) => setAppDraft(prev => ({ ...prev, status: event.target.value as ManagedAppStatus }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                    <option value="启用">启用</option>
                    <option value="停用">停用</option>
                  </select>
                </label>
                <label className="block text-sm text-gray-700">可用范围
                  <select value={appDraft.range} onChange={(event) => setAppDraft(prev => ({ ...prev, range: event.target.value as ManagedAppRange }))} className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                    {appRanges.filter(range => range !== '全部').map(range => <option key={range} value={range}>{range}</option>)}
                  </select>
                </label>
              </div>
              <label className="mt-4 block text-sm text-gray-700">描述
                <textarea value={appDraft.description} onChange={(event) => setAppDraft(prev => ({ ...prev, description: event.target.value }))} rows={3} className="mt-2 w-full resize-none rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#2f75b5]" />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button onClick={() => setEditorMode(null)} className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={saveAppDraft} className="rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f]">保存</button>
            </div>
          </div>
        </div>
      )}

      {rulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">设置管理规则</h3>
              <button onClick={() => setRulesOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <label className="block">默认可见范围
                <select className="mt-2 h-10 w-full rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                  <option>全员可用</option>
                  <option>继承应用组范围</option>
                  <option>默认不可见</option>
                </select>
              </label>
              <label className="flex items-center gap-3"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2f75b5]" />允许个人收藏应用</label>
              <label className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-[#2f75b5]" />展示未授权应用入口</label>
              <label className="flex items-center gap-3"><input type="checkbox" defaultChecked className="h-4 w-4 accent-[#2f75b5]" />应用停用后保留历史访问记录</label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setRulesOpen(false)} className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={() => { setRulesOpen(false); showToast('管理规则已保存'); }} className="rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f]">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const documentTemplateRows = [
  { id: 'notice-red', name: '红头通知模板', category: '通知', updater: MAIN_USER_NAME, updatedAt: '2026-06-16 13:20', description: '适用于公司级正式通知、制度发布与跨部门工作安排。', titleLevel: '二号主标题', lineHeight: '28 磅', letterSpacing: '标准' },
  { id: 'party-study', name: '党群学习模板', category: '党群', updater: MAIN_USER_NAME, updatedAt: '2026-06-15 16:40', description: '适用于党群学习活动、主题教育、组织生活等材料。', titleLevel: '三号一级标题', lineHeight: '26 磅', letterSpacing: '加宽 0.3 磅' },
  { id: 'meeting-minutes', name: '会议纪要模板', category: '会议纪要', updater: getDemoPerson(15), updatedAt: '2026-06-14 11:05', description: '适用于项目会议、专题会议、经营分析会等纪要场景。', titleLevel: '小二主标题', lineHeight: '固定值 28 磅', letterSpacing: '标准' },
  { id: 'brief-blue', name: '工作简报模板', category: '工作简报', updater: getDemoPerson(16), updatedAt: '2026-06-12 09:30', description: '适用于周报简报、经营简报和阶段性工作汇报。', titleLevel: '二号主标题', lineHeight: '1.5 倍行距', letterSpacing: '标准' },
];

function TemplatePreviewCard({ accent = 'bg-red-500' }: { accent?: string }) {
  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-2">
      <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded bg-white">
        <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          <ImageIcon size={28} />
          <span className="text-xs">预览图</span>
        </div>
      </div>
    </div>
  );
}

function DocumentTemplateManagement() {
  const [selectedId, setSelectedId] = useState(documentTemplateRows[0].id);
  const selectedTemplate = documentTemplateRows.find(item => item.id === selectedId) || documentTemplateRows[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">公文模板管理</h2>
          <p className="mt-1 text-sm text-gray-500">维护 AI 公文生成时可选的模板样式、排版规则和预览信息。</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
          <FileText size={16} />
          新增模板
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="text-base font-semibold text-gray-900">模板列表</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-5 py-3">模板名称</th>
                  <th className="px-5 py-3">类别</th>
                  <th className="px-5 py-3">更新人</th>
                  <th className="px-5 py-3">更新时间</th>
                  <th className="px-5 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {documentTemplateRows.map((item) => (
                  <tr
                    key={item.id}
                    className={`cursor-pointer transition-colors hover:bg-red-50/40 ${selectedId === item.id ? 'bg-red-50/60' : ''}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-5 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{item.category}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{item.updater}</td>
                    <td className="px-5 py-4 text-gray-500">{item.updatedAt}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(item.id);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        <Edit3 size={13} />
                        编辑模板
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div key={selectedTemplate.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-gray-900">编辑模板</div>
              <div className="mt-1 text-xs text-gray-400">{selectedTemplate.name}</div>
            </div>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">{selectedTemplate.category}</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <ImageIcon size={15} className="text-gray-400" />
                预览图
              </div>
              <TemplatePreviewCard accent={selectedTemplate.category === '通知' ? 'bg-red-500' : selectedTemplate.category === '工作简报' ? 'bg-blue-500' : 'bg-theme-500'} />
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">模板描述</span>
              <textarea
                defaultValue={selectedTemplate.description}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-5 text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Type size={14} className="text-gray-400" />
                  title
                </span>
                <select
                  defaultValue={selectedTemplate.titleLevel}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>二号主标题</option>
                  <option>小二主标题</option>
                  <option>三号一级标题</option>
                  <option>三号二级标题</option>
                  <option>四号正文标题</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <AlignJustify size={14} className="text-gray-400" />
                  行间距
                </span>
                <select
                  defaultValue={selectedTemplate.lineHeight}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>固定值 26 磅</option>
                  <option>固定值 28 磅</option>
                  <option>28 磅</option>
                  <option>1.5 倍行距</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">字间距</span>
              <select
                defaultValue={selectedTemplate.letterSpacing}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
              >
                <option>标准</option>
                <option>加宽 0.3 磅</option>
                <option>加宽 0.5 磅</option>
                <option>紧缩 0.2 磅</option>
              </select>
            </label>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">保存模板</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentTemplateManagementPages() {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const editingTemplate = documentTemplateRows.find(item => item.id === editingTemplateId) || documentTemplateRows[0];

  if (editingTemplateId) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => setEditingTemplateId(null)}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-700"
            >
              <ChevronRight size={14} className="rotate-180" />
              返回模板列表
            </button>
            <h2 className="text-2xl font-bold text-gray-900">编辑模板</h2>
            <p className="mt-1 text-sm text-gray-500">{editingTemplate.name}</p>
          </div>
          <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">{editingTemplate.category}</span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <ImageIcon size={16} className="text-gray-400" />
              预览图
            </div>
            <TemplatePreviewCard accent={editingTemplate.category === '通知' ? 'bg-red-500' : editingTemplate.category === '工作简报' ? 'bg-blue-500' : 'bg-theme-500'} />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 border-b border-gray-100 pb-4">
              <div className="text-base font-semibold text-gray-900">模板信息</div>
              <div className="mt-1 text-xs text-gray-400">调整后将影响 AI 公文生成时的模板选择与预览。</div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <label className="block lg:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">模板名称</span>
                <input
                  defaultValue={editingTemplate.name}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">类别</span>
                <select
                  defaultValue={editingTemplate.category}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>通知</option>
                  <option>党群</option>
                  <option>会议纪要</option>
                  <option>工作简报</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Type size={14} className="text-gray-400" />
                  title
                </span>
                <select
                  defaultValue={editingTemplate.titleLevel}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>二号主标题</option>
                  <option>小二主标题</option>
                  <option>三号一级标题</option>
                  <option>三号二级标题</option>
                  <option>四号正文标题</option>
                </select>
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">模板描述</span>
                <textarea
                  defaultValue={editingTemplate.description}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-5 text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <AlignJustify size={14} className="text-gray-400" />
                  行间距
                </span>
                <select
                  defaultValue={editingTemplate.lineHeight}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>固定值 26 磅</option>
                  <option>固定值 28 磅</option>
                  <option>28 磅</option>
                  <option>1.5 倍行距</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">字间距</span>
                <select
                  defaultValue={editingTemplate.letterSpacing}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>标准</option>
                  <option>加宽 0.3 磅</option>
                  <option>加宽 0.5 磅</option>
                  <option>紧缩 0.2 磅</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => setEditingTemplateId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">保存模板</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">公文模板管理</h2>
          <p className="mt-1 text-sm text-gray-500">维护 AI 公文生成时可选的模板样式、排版规则和预览信息。</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
          <FileText size={16} />
          新增模板
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="text-base font-semibold text-gray-900">模板列表</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
              <tr>
                <th className="px-5 py-3">模板名称</th>
                <th className="px-5 py-3">类别</th>
                <th className="px-5 py-3">更新人</th>
                <th className="px-5 py-3">更新时间</th>
                <th className="px-5 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {documentTemplateRows.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-red-50/40">
                  <td className="px-5 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{item.category}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{item.updater}</td>
                  <td className="px-5 py-4 text-gray-500">{item.updatedAt}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setEditingTemplateId(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <Edit3 size={13} />
                      编辑模板
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminTabs({ active }: { active: string }) {
  const tabs = ['首页', '系统管理', active];
  return (
    <div className="flex h-10 items-end gap-1 border-b border-gray-200 bg-gray-100 px-4">
      {tabs.map((tab, index) => (
        <div
          key={`${tab}-${index}`}
          className={`flex h-10 items-center gap-2 border border-b-0 px-5 text-sm ${
            index === tabs.length - 1
              ? 'bg-white text-[#2f75b5]'
              : 'bg-white/80 text-gray-600'
          }`}
        >
          {index === tabs.length - 1 && <Search size={14} />}
          <span>{tab}</span>
          {index > 0 && <X size={13} className="text-gray-400" />}
        </div>
      ))}
    </div>
  );
}

function DocumentTemplateManagementConsole() {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [titleRules, setTitleRules] = useState([
    { level: '一级标题', description: '主标题使用二号方正小标宋，居中展示，段后 1 行。' },
  ]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const isCreatingTemplate = editingTemplateId === '__new__';
  const editingTemplate = isCreatingTemplate
    ? { id: '__new__', name: '新增公文模板', category: '通知', updater: MAIN_USER_NAME, updatedAt: '刚刚', description: '', titleLevel: '一级标题', lineHeight: '固定值 28 磅', letterSpacing: '标准' }
    : documentTemplateRows.find(item => item.id === editingTemplateId) || documentTemplateRows[0];
  const filteredRows = documentTemplateRows.filter((item) => item.name.includes(templateName.trim()));
  const handleOpenTemplateEditor = (templateId: string) => {
    setEditingTemplateId(templateId);
    setUploadedFile(null);
    setPreviewImageFile(null);
    setTitleRules([{ level: '一级标题', description: '主标题使用二号方正小标宋，居中展示，段后 1 行。' }]);
  };
  const handleAddTitleRule = () => {
    setTitleRules((current) => {
      if (current.length >= 5) return current;
      const labels = ['一级标题', '二级标题', '三级标题', '四级标题', '五级标题'];
      return [...current, { level: labels[current.length], description: '' }];
    });
  };

  if (editingTemplateId) {
    return (
      <div className="min-h-[calc(100vh-7rem)] w-full min-w-0 bg-[#eef1f5] pt-3 text-sm text-gray-800">
        <AdminTabs active={isCreatingTemplate ? "新增模板" : "编辑模板"} />
        <div className="bg-white px-8 py-4">
          <div className="mb-5 text-sm text-gray-500">
            首页 <span className="mx-2">/</span> AI辅助功能 <span className="mx-2">/</span> 公文模板管理 <span className="mx-2">/</span>
            <span className="text-gray-800">{isCreatingTemplate ? '新增模板' : '编辑模板'}</span>
          </div>
          <button
            onClick={() => setEditingTemplateId(null)}
            className="rounded border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            返回
          </button>
        </div>

        <div className="p-5">
          <div className="bg-white p-6">
            <div className="mb-5 border-b border-gray-100 pb-3 text-base font-semibold text-gray-900">模板信息</div>
            <div className="grid min-w-0 gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <div className="mb-2 text-sm text-gray-700">预览图</div>
                {previewImageFile ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(previewImageFile)}
                      alt="预览图"
                      className="w-full max-w-[200px] rounded border border-gray-200 object-cover"
                    />
                    <button
                      onClick={() => setPreviewImageFile(null)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:border-red-400 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex w-full max-w-[200px] cursor-pointer flex-col items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 py-4 hover:border-[#2f75b5] hover:bg-blue-50/30">
                    <ImageIcon size={16} className="text-gray-400" />
                    <span className="mt-1 text-xs text-gray-500">上传预览图</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setPreviewImageFile(file);
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="min-w-0 space-y-5">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-24 text-right text-gray-700"><span className="text-red-500">*</span> 模板名称:</span>
                    <div className="relative w-full max-w-[520px]">
                      <input defaultValue={editingTemplate.name} className="h-9 w-full rounded border border-gray-300 px-3 pr-8 outline-none focus:border-[#2f75b5]" />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-24 text-right text-gray-700"><span className="text-red-500">*</span> 类别:</span>
                    <select defaultValue={editingTemplate.category} className="h-9 w-full max-w-56 rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                      <option>通知</option>
                      <option>党群</option>
                      <option>会议纪要</option>
                      <option>工作简报</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <span className="mt-2 w-24 text-right text-gray-700"><span className="text-red-500">*</span> title格式:</span>
                    <div className="flex-1 space-y-4">
                      {titleRules.map((rule, index) => (
                        <div key={index} className="flex flex-wrap items-center gap-2">
                          <select
                            value={rule.level}
                            onChange={(event) => {
                              const next = [...titleRules];
                              next[index] = { ...next[index], level: event.target.value };
                              setTitleRules(next);
                            }}
                            className="h-9 w-28 rounded border border-gray-300 px-2 outline-none focus:border-[#2f75b5]"
                          >
                            <option>一级标题</option>
                            <option>二级标题</option>
                            <option>三级标题</option>
                            <option>四级标题</option>
                            <option>五级标题</option>
                          </select>
                          <textarea
                            value={rule.description}
                            onChange={(event) => {
                              const next = [...titleRules];
                              next[index] = { ...next[index], description: event.target.value };
                              setTitleRules(next);
                            }}
                            rows={1}
                            placeholder="要求描述"
                            className="min-h-9 w-full max-w-[420px] resize-y rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#2f75b5]"
                          />
                          <button
                            onClick={handleAddTitleRule}
                            disabled={titleRules.length >= 5}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-500 text-lg leading-none text-gray-700 hover:border-[#2f75b5] hover:text-[#2f75b5] disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-300"
                          >
                            +
                          </button>
                          {index > 0 && (
                            <button
                              onClick={() => setTitleRules((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-500 text-lg leading-none text-gray-700 hover:border-[#2f75b5] hover:text-[#2f75b5]"
                            >
                              -
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <span className="mt-2 w-24 text-right text-gray-700"><span className="text-red-500">*</span> 模板上传:</span>
                    <div className="flex-1 max-w-[360px]">
                      {uploadedFile ? (
                        <div className="flex items-center gap-3 rounded border border-gray-300 bg-gray-50 px-3 py-2">
                          <FileText size={16} className="text-[#2f75b5] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm font-medium text-gray-800">{uploadedFile.name}</div>
                            <div className="text-xs text-gray-400">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                          </div>
                          <button
                            onClick={() => setUploadedFile(null)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-gray-300 bg-gray-50 hover:border-[#2f75b5] hover:bg-blue-50/30">
                          <Upload size={18} className="text-gray-400" />
                          <span className="text-sm text-gray-500">上传 Word 模板</span>
                          <input
                            type="file"
                            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) setUploadedFile(file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <span className="mt-2 w-24 text-right text-gray-700">模板描述:</span>
                    <textarea defaultValue={editingTemplate.description} rows={4} className="w-full max-w-[620px] resize-none rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#2f75b5]" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                  <button onClick={() => setEditingTemplateId(null)} className="rounded border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50">取消</button>
                  <button className="rounded bg-[#2f75b5] px-5 py-2 font-medium text-white hover:bg-[#28669f]">保存</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-7 pt-2 text-center text-xs text-gray-500">
          吉祥航空　如意到家
          <div className="mt-1">Copyright © 2026 吉祥航空版权所有</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] w-full min-w-0 bg-[#eef1f5] pt-3 text-sm text-gray-800">
      <AdminTabs active="公文模板管理" />
      <div className="bg-white px-8 py-4">
        <div className="mb-5 text-sm text-gray-500">
          首页 <span className="mx-2">/</span> AI辅助功能 <span className="mx-2">/</span>
          <span className="text-gray-800">公文模板管理</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-gray-800">模板名称</span>
            <input
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="请输入模板名称"
              className="h-9 w-[min(18rem,calc(100vw-20rem))] min-w-0 rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]"
            />
          </label>
          <div className="ml-auto flex gap-2">
            <button className="rounded bg-[#2f75b5] px-5 py-2 font-medium text-white hover:bg-[#28669f]">查询</button>
            <button onClick={() => setTemplateName('')} className="rounded border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50">重置</button>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="bg-white p-5">
          <button onClick={() => handleOpenTemplateEditor('__new__')} className="mb-4 inline-flex items-center gap-1.5 rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f]">
            <Plus size={15} />
            新增模板
          </button>
          <div className="w-full overflow-x-auto">
          <table className="min-w-[760px] w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-900">
                <th className="px-3 py-3 font-medium">模板名称</th>
                <th className="px-3 py-3 font-medium">类别</th>
                <th className="px-3 py-3 font-medium">更新人</th>
                <th className="px-3 py-3 font-medium">更新时间</th>
                <th className="px-3 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-gray-800">{item.name}</td>
                  <td className="px-3 py-3 text-gray-600">{item.category}</td>
                  <td className="px-3 py-3 text-gray-600">{item.updater}</td>
                  <td className="px-3 py-3 text-gray-600">{item.updatedAt}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => handleOpenTemplateEditor(item.id)} className="mr-4 text-[#2f75b5] hover:underline">编辑</button>
                    <button className="text-[#2f75b5] hover:underline">删除</button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td className="px-3 py-10 text-center text-gray-400" colSpan={5}>暂无模板数据</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div className="pb-7 pt-2 text-center text-xs text-gray-500">
        吉祥航空　如意到家
        <div className="mt-1">Copyright © 2026 吉祥航空版权所有</div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const initialSection = searchParams.get('section');
  const initialAdminState = initialSection ? adminSectionMap[initialSection] : null;
  const [activeMenu, setActiveMenu] = useState<string | null>(initialAdminState?.menu || null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(initialAdminState?.subMenu || null);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(() => new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const section = searchParams.get('section');
    const mappedState = section ? adminSectionMap[section] : null;
    if (mappedState) {
      setActiveMenu(mappedState.menu);
      setActiveSubMenu(mappedState.subMenu);
      setExpandedMenus(new Set());
    }
  }, [searchParams]);

  const toggleExpandedMenu = (menuId: string) => {
    setExpandedMenus((current) => {
      const next = new Set(current);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  const handleNestedMenuClick = (item: MenuItem) => {
    if (item.children?.length) {
      toggleExpandedMenu(item.id);
      setActiveSubMenu(item.id);
      return;
    }
    setActiveSubMenu(item.id);
  };

  const renderMenuCards = (items: MenuItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map(sub => (
        <button key={sub.id} onClick={() => handleNestedMenuClick(sub)}
          className="p-6 rounded-xl border border-gray-100 bg-white text-left hover:border-blue-200 hover:shadow-md cursor-pointer transition-all">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 text-[#2f75b5]">{sub.icon}</div>
          <div className="font-medium text-gray-900">{sub.label}</div>
          {sub.children?.length && <div className="mt-2 text-xs text-gray-400">{sub.children.map(child => child.label).join(' / ')}</div>}
        </button>
      ))}
    </div>
  );

  const handleMenuClick = (menuId: string, hasChildren: boolean) => {
    // 工作台跳转至主应用首页
    if (menuId === 'workspace') {
      navigate('/');
      return;
    }
    if (hasChildren) {
      const closingCurrentMenu = activeMenu === menuId;
      setActiveMenu(closingCurrentMenu ? null : menuId);
      setActiveSubMenu(null);
      setExpandedMenus(new Set());
    } else {
      setActiveMenu(menuId);
      setActiveSubMenu(null);
      setExpandedMenus(new Set());
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <div className={`
        ${sidebarOpen ? 'w-64' : 'w-16'} 
        bg-[#061523] flex flex-col transition-all duration-300 shadow-[4px_0_16px_rgba(15,23,42,0.22)]
      `}>
        {/* Logo区域 */}
        <AdminBrand open={sidebarOpen} />

        {/* 菜单列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-0">
            {menuItems.map((item) => (
              <div key={item.id}>
                <AdminPrimaryMenuButton
                  item={item}
                  open={sidebarOpen}
                  active={activeMenu === item.id}
                  onClick={() => handleMenuClick(item.id, !!item.children)}
                />
                {sidebarOpen && item.children && activeMenu === item.id && (
                  <div className="space-y-0" style={{ backgroundColor: adminTheme.nestedBg }}>
                    <AdminNestedMenuTree
                      items={item.children}
                      activeSubMenu={activeSubMenu}
                      expandedMenus={expandedMenus}
                      onSelect={handleNestedMenuClick}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 底部版权 */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/10" style={{ backgroundColor: adminTheme.collapsedFooter }}>
            <div className="text-xs text-slate-500 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span>吉祥航空</span>
                <span>✈️</span>
                <span>如意到家</span>
              </div>
              <div>Copyright © 2026 吉祥航空版权所有</div>
            </div>
          </div>
        )}
      </div>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/web_client/enterprise')}
              className="inline-flex items-center gap-1.5 rounded border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-[#2f75b5] hover:text-[#2f75b5]"
            >
              <LayoutDashboard size={15} />
              回到门户
            </button>
            <span className="text-sm text-gray-500">首页</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{MAIN_USER_NAME}</span>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* 无选中菜单时显示欢迎页 */}
          {!activeMenu && !activeSubMenu ? (
            <div className={`${activeSubMenu === 'ai-template' ? 'max-w-7xl' : 'max-w-4xl'} mx-auto`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                <div className="text-center">
                  {/* 插图区域 */}
                  <div className="relative mb-8">
                    <div className="absolute -top-4 -left-8 w-32 h-16">
                      <svg viewBox="0 0 128 64" className="w-full h-full">
                        <path d="M10 32 L100 32 L90 22 L95 32 L90 42 Z" fill="#333" className="animate-pulse" />
                        <path d="M95 32 L120 32" stroke="#ddd" strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx="115" cy="28" r="3" fill="#ddd" />
                        <circle cx="110" cy="24" r="2" fill="#ddd" />
                      </svg>
                    </div>
                    <div className="inline-block relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-1">💼</div>
                            <div className="text-xs text-gray-500">管理后台</div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -right-4 top-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">✓</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-4">
                      <svg viewBox="0 0 64 32" className="w-16 h-8">
                        <ellipse cx="20" cy="24" rx="16" ry="8" fill="#f0f0f0" />
                        <ellipse cx="36" cy="20" rx="14" ry="10" fill="#f0f0f0" />
                        <ellipse cx="48" cy="24" rx="12" ry="6" fill="#f0f0f0" />
                      </svg>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">欢迎使用管理后台</h1>
                  <p className="text-gray-500 mb-8">系统、i吉祥初始功能、AI辅助功能、业务功能入口</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {[
                      { icon: '🔐', label: '系统', color: 'bg-blue-50 text-blue-600', menuId: 'system' },
                      { icon: '📊', label: 'i吉祥初始功能', color: 'bg-orange-50 text-orange-600', menuId: 'initial' },
                      { icon: '✨', label: 'AI辅助功能', color: 'bg-purple-50 text-purple-600', menuId: 'ai' },
                      { icon: '📁', label: '业务功能', color: 'bg-green-50 text-green-600', menuId: 'business-feature' },
                    ].map((item, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setActiveMenu(item.menuId);
                          setActiveSubMenu(null);
                        }}
                        className={`p-4 rounded-xl ${item.color} hover:shadow-md transition-shadow cursor-pointer`}
                      >
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-sm font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 根据选中菜单展示对应内容 */
            <div className={activeSubMenu === 'ai-template' || activeSubMenu === 'report-template' || activeSubMenu === 'system-user-groups' || activeSubMenu === 'system-nav' || activeSubMenu === 'system-dictionary' || activeSubMenu === 'app-management' || activeSubMenu === 'version-list' || activeSubMenu === 'version-release' ? 'w-full min-w-0' : 'max-w-4xl mx-auto'}>
              {/* 面包屑导航 */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span className="cursor-pointer hover:text-gray-700" onClick={() => { setActiveMenu(null); setActiveSubMenu(null); }}>首页</span>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-medium">
                  {menuItems.find(m => m.id === activeMenu)?.label || ''}
                </span>
                {activeSubMenu && (
                  <>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium">
                      {findMenuItemById(menuItems.find(m => m.id === activeMenu)?.children || [], activeSubMenu)?.label || ''}
                    </span>
                  </>
                )}
              </div>

              {/* 系统管理子页面 */}
              {activeMenu === 'ai' && (
                <div>
                  {!activeSubMenu && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">AI辅助功能</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.find(m => m.id === 'ai')?.children?.map(sub => (
                          <div key={sub.id} onClick={() => setActiveSubMenu(sub.id)}
                            className="p-6 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md cursor-pointer transition-all">
                            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3">{sub.icon}</div>
                            <div className="font-medium text-gray-900">{sub.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSubMenu === 'ai-template' && <DocumentTemplateManagementConsole />}
                </div>
              )}

              {activeMenu === 'system' && (
                <div>
                  {!activeSubMenu && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">系统</h2>
                      {renderMenuCards(topLevelSystemSections)}
                    </div>
                  )}
                  {activeSubMenu && findMenuItemById(topLevelSystemSections, activeSubMenu)?.children && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">{findMenuItemById(topLevelSystemSections, activeSubMenu)?.label}</h2>
                      {renderMenuCards(findMenuItemById(topLevelSystemSections, activeSubMenu)?.children || [])}
                    </div>
                  )}
                  {activeSubMenu === 'system-user' && <ContentPlaceholder title="用户管理" icon="👥" />}
                  {activeSubMenu === 'system-role' && <ContentPlaceholder title="角色管理" icon="🔑" />}
                  {activeSubMenu === 'system-menu' && <ContentPlaceholder title="菜单管理" icon="📋" />}
                  {activeSubMenu === 'system-dictionary' && <TrustedRouteDictionaryManagement />}
                  {activeSubMenu === 'system-external-user' && <ContentPlaceholder title="外部人员管理" icon="👥" />}
                  {activeSubMenu === 'system-user-groups' && <UserGroupManagement />}
                  {activeSubMenu === 'system-nav' && <NavigationConfig />}
                  {activeSubMenu === 'security-log' && <ContentPlaceholder title="操作日志" icon="📋" />}
                  {activeSubMenu === 'security-audit' && <ContentPlaceholder title="安全审计" icon="🔍" />}
                  {activeSubMenu === 'version-list' && <VersionManagement view="list" />}
                  {activeSubMenu === 'version-release' && <VersionManagement view="release" />}
                  {activeSubMenu === 'app-management' && <ApplicationManagement />}
                  {activeSubMenu === 'mobile-download' && <ContentPlaceholder title="移动应用下载管理" icon="📱" />}
                  {activeSubMenu === 'portal-admin' && <ContentPlaceholder title="门户基础管理" icon="🌐" />}
                  {activeSubMenu === 'business-admin' && <ContentPlaceholder title="业务系统管理" icon="📁" />}
                  {activeSubMenu === 'theme-admin' && <ContentPlaceholder title="主题装扮管理" icon="🎨" />}
                </div>
              )}

              {/* 安全管理子页面 */}
              {activeMenu === 'security' && (
                <div>
                  {!activeSubMenu && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">安全管理</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.find(m => m.id === 'security')?.children?.map(sub => (
                          <div key={sub.id} onClick={() => setActiveSubMenu(sub.id)}
                            className="p-6 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md cursor-pointer transition-all">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">{sub.icon}</div>
                            <div className="font-medium text-gray-900">{sub.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSubMenu === 'security-log' && <ContentPlaceholder title="操作日志" icon="📋" />}
                  {activeSubMenu === 'security-audit' && <ContentPlaceholder title="安全审计" icon="🔍" />}
                </div>
              )}

              {/* 版本管理子页面 */}
              {activeMenu === 'version' && (
                <div>
                  {!activeSubMenu && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">版本管理</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.find(m => m.id === 'version')?.children?.map(sub => (
                          <div key={sub.id} onClick={() => setActiveSubMenu(sub.id)}
                            className="p-6 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md cursor-pointer transition-all">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">{sub.icon}</div>
                            <div className="font-medium text-gray-900">{sub.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSubMenu === 'version-list' && <VersionManagement view="list" />}
                  {activeSubMenu === 'version-release' && <VersionManagement view="release" />}
                </div>
              )}

              {activeMenu === 'initial' && (
                <div>
                  {!activeSubMenu && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">i吉祥初始功能</h2>
                      {renderMenuCards(menuItems.find(m => m.id === 'initial')?.children || [])}
                    </div>
                  )}
                  {activeSubMenu && findMenuItemById(menuItems.find(m => m.id === 'initial')?.children || [], activeSubMenu)?.children && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">{findMenuItemById(menuItems.find(m => m.id === 'initial')?.children || [], activeSubMenu)?.label}</h2>
                      {renderMenuCards(findMenuItemById(menuItems.find(m => m.id === 'initial')?.children || [], activeSubMenu)?.children || [])}
                    </div>
                  )}
                  {activeSubMenu === 'report-template' && <ReportTemplateManagement />}
                </div>
              )}

              {activeMenu === 'business-feature' && <ContentPlaceholder title="业务功能" icon="📁" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


