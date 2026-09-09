import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Menu, X, Shield, Lock, GitBranch, LayoutDashboard,
  Globe, Network, Palette, ChevronRight, User, Users, FolderTree,
  Route, Wand2, FileText, Edit3, Image as ImageIcon, Type, AlignJustify, Plus, Search, Upload,
  Database, Briefcase, RefreshCw, CheckCircle2, Layers, Smartphone, ClipboardList
} from 'lucide-react';
import NavigationConfig from '../components/NavigationConfig';
import { MAIN_USER_NAME, getDemoPerson } from '../data/people';

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
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [toast, setToast] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState('2026-07-01 09:30');
  const selectedGroup = groups.find(group => group.id === selectedGroupId) || groups[0];
  const manualGroups = groups.filter(group => group.source === 'manual' && group.name.includes(keyword.trim()));
  const syncedGroups = groups.filter(group => group.source === 'sync' && group.name.includes(keyword.trim()));
  const isManual = selectedGroup.source === 'manual';
  const departmentCount = new Set(selectedGroup.members.map(member => member.department)).size;

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
    const newGroup: UserGroupRecord = {
      id: `manual-${groups.length + 1}`,
      name: `新建用户组${manualGroups.length + 1}`,
      source: 'manual',
      description: '手动创建的用户组，可按业务场景维护成员和授权范围。',
      updatedAt: '2026-07-01 10:35',
      owner: MAIN_USER_NAME,
      members: [],
    };
    setGroups(current => [newGroup, ...current]);
    setSelectedGroupId(newGroup.id);
    setEditing(true);
    setDraftName(newGroup.name);
    setDraftDescription(newGroup.description);
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
            <div className="flex items-center gap-2 text-gray-600"><ChevronRight size={14} /><span>未分组（0）</span></div>
          </div>
        </aside>

        <section className="min-w-0 p-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-4">
                {editing && isManual ? (
                  <input value={draftName} onChange={(event) => setDraftName(event.target.value)} className="h-9 w-72 rounded border border-gray-300 px-3 text-lg font-semibold text-gray-900 outline-none focus:border-[#2f75b5]" />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-900">{selectedGroup.name}</h3>
                )}
                <span className="text-gray-500">成员 <b className="ml-1 text-gray-900">{selectedGroup.members.length}</b></span>
                <span className="h-4 w-px bg-gray-200" />
                <span className="text-gray-500">部门 <b className="ml-1 text-gray-900">{departmentCount}</b></span>
                <span className={`rounded px-2 py-1 text-xs ${isManual ? 'bg-blue-50 text-[#2f75b5]' : 'bg-gray-100 text-gray-500'}`}>{isManual ? '手动管理' : '系统同步'}</span>
              </div>
              {editing && isManual ? (
                <textarea value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} rows={2} className="mt-3 w-full max-w-3xl resize-none rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#2f75b5]" />
              ) : (
                <p className="mt-2 max-w-3xl text-sm text-gray-500">{selectedGroup.description}</p>
              )}
            </div>
            <div className="text-right text-xs text-gray-500">
              <div>来源：{isManual ? '后台手动维护' : '主数据员工层级'}</div>
              <div className="mt-1">负责人：{selectedGroup.owner}</div>
              <div className="mt-1">更新时间：{isManual ? selectedGroup.updatedAt : lastSyncTime}</div>
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

type AppPortalTab = 'App员工工作台' | 'App外部人员工作台' | 'PC工作台';
type ManagedAppSource = '系统内置' | '管理员创建' | '流程审批' | '业务系统';
type ManagedAppRange = '全员可用' | '指定部门' | '指定用户组' | '指定人员';
type ManagedAppStatus = '启用' | '停用';
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
  iconTone: string;
  sort: number;
};

const appPortalTabs: AppPortalTab[] = ['App员工工作台', 'App外部人员工作台', 'PC工作台'];
const appCategories = ['全部', '协同办公', '综合服务', '员工服务', '数据服务', 'AI助手', '数据卡片', '应用卡片', '常用功能', '财务系统', '人力系统', '综合系统', '运行系统', '营销系统'];
const appRanges: Array<'全部' | ManagedAppRange> = ['全部', '全员可用', '指定部门', '指定用户组', '指定人员'];

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
  iconTone: 'bg-[#2f75b5]',
  sort: 1,
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
    setAppDraft(app);
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
                    <td colSpan={6} className="px-4 py-14 text-center text-gray-400">暂无应用数据</td>
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
            <div className={activeSubMenu === 'ai-template' || activeSubMenu === 'report-template' || activeSubMenu === 'system-user-groups' || activeSubMenu === 'system-nav' || activeSubMenu === 'app-management' ? 'w-full min-w-0' : 'max-w-4xl mx-auto'}>
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
                  {activeSubMenu === 'system-dictionary' && <ContentPlaceholder title="字典管理" icon="📘" />}
                  {activeSubMenu === 'system-external-user' && <ContentPlaceholder title="外部人员管理" icon="👥" />}
                  {activeSubMenu === 'system-user-groups' && <UserGroupManagement />}
                  {activeSubMenu === 'system-nav' && <NavigationConfig />}
                  {activeSubMenu === 'security-log' && <ContentPlaceholder title="操作日志" icon="📋" />}
                  {activeSubMenu === 'security-audit' && <ContentPlaceholder title="安全审计" icon="🔍" />}
                  {activeSubMenu === 'version-list' && <ContentPlaceholder title="版本列表" icon="📦" />}
                  {activeSubMenu === 'version-release' && <ContentPlaceholder title="发布记录" icon="🚀" />}
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
                  {activeSubMenu === 'version-list' && <ContentPlaceholder title="版本列表" icon="📦" />}
                  {activeSubMenu === 'version-release' && <ContentPlaceholder title="发布记录" icon="🚀" />}
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


