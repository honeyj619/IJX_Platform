import { useState } from 'react';
import { 
  Menu, X, Shield, Lock, GitBranch, LayoutDashboard, 
  Globe, Network, Palette, ChevronRight, User, FolderTree,
  Plus, Edit2, Trash2, GripVertical, Info, Moon, Sun, ChevronDown
} from 'lucide-react';
import { SIDEBAR } from '../constants/layout';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'system',
    label: '系统管理',
    icon: <Shield size={18} />,
    children: [
      { id: 'system-user', label: '用户管理', icon: <User size={16} /> },
      { id: 'system-role', label: '角色管理', icon: <Lock size={16} /> },
      { id: 'system-permission', label: '权限管理', icon: <Shield size={16} /> },
    ]
  },
  {
    id: 'basic',
    label: '基础管理',
    icon: <LayoutDashboard size={18} />,
    children: [
      { id: 'basic-navbar', label: '导航栏配置', icon: <Menu size={16} /> },
    ]
  },
  {
    id: 'security',
    label: '安全管理',
    icon: <Lock size={18} />,
    children: [
      { id: 'security-log', label: '操作日志', icon: <GitBranch size={16} /> },
      { id: 'security-audit', label: '安全审计', icon: <Shield size={16} /> },
    ]
  },
  {
    id: 'version',
    label: '版本管理',
    icon: <GitBranch size={18} />,
    children: [
      { id: 'version-list', label: '版本列表', icon: <GitBranch size={16} /> },
      { id: 'version-release', label: '发布记录', icon: <Globe size={16} /> },
    ]
  },
  {
    id: 'workspace',
    label: '工作台',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'portal',
    label: '门户基础管理',
    icon: <Globe size={18} />,
  },
  {
    id: 'business',
    label: '业务系统管理',
    icon: <FolderTree size={18} />,
  },
  {
    id: 'theme',
    label: '主题装扮管理',
    icon: <Palette size={18} />,
  },
];

interface NavApp {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface UserGroup {
  id: string;
  name: string;
}

const userGroups: UserGroup[] = [
  { id: 'admin', name: '管理层' },
  { id: 'staff', name: '员工层' },
  { id: 'trainee', name: '实习生' },
];

const defaultApps: NavApp[] = [
  { id: 'message', name: '消息', icon: '💬', color: 'bg-blue-500' },
  { id: 'knowledge', name: '知识问答', icon: '🧠', color: 'bg-purple-500' },
  { id: 'calendar', name: '日历', icon: '📅', color: 'bg-orange-500' },
  { id: 'docs', name: '云文档', icon: '📄', color: 'bg-blue-600' },
  { id: 'table', name: '多维表格', icon: '📊', color: 'bg-purple-600' },
  { id: 'meeting', name: '视频会议', icon: '📹', color: 'bg-blue-500' },
  { id: 'workspace', name: '工作台', icon: '🎯', color: 'bg-teal-500' },
  { id: 'contacts', name: '通讯录', icon: '👥', color: 'bg-yellow-500' },
  { id: 'doubao', name: '豆包', icon: '🤖', color: 'bg-gray-500' },
  { id: 'rights', name: '权益升级', icon: '✨', color: 'bg-blue-500' },
  { id: 'incentive', name: '企业推荐激励', icon: '🎉', color: 'bg-indigo-500' },
  { id: 'feishu', name: '飞书 aily', icon: '👤', color: 'bg-gray-400' },
  { id: 'travel', name: '飞行社', icon: '✈️', color: 'bg-blue-500' },
];

const moreApps: NavApp[] = [
  { id: 'task', name: '任务', icon: '✅', color: 'bg-blue-600' },
  { id: 'favorite', name: '收藏', icon: '⭐', color: 'bg-yellow-500' },
  { id: 'library', name: '知识库', icon: '📚', color: 'bg-purple-500' },
  { id: 'appcenter', name: '应用中心', icon: '🛍️', color: 'bg-blue-500' },
];

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>('basic');
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>('basic-navbar');
  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop' | 'name' | 'cache'>('desktop');
  const [activeConfigTab, setActiveConfigTab] = useState<'default' | 'custom'>('custom');
  const [selectedUserGroup, setSelectedUserGroup] = useState('admin');
  const [isEditing, setIsEditing] = useState(false);
  const [isUserGroupDropdownOpen, setIsUserGroupDropdownOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [activeApps, setActiveApps] = useState<NavApp[]>(defaultApps);
  const [moreAppsList, setMoreAppsList] = useState<NavApp[]>(moreApps);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleMenuClick = (menuId: string, hasChildren: boolean) => {
    if (hasChildren) {
      setActiveMenu(activeMenu === menuId ? null : menuId);
    } else {
      setActiveMenu(menuId);
      setActiveSubMenu(null);
    }
  };

  const renderNavbarConfig = () => (
    <div className="max-w-6xl mx-auto">
      {/* 顶部标签页 */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-8">
          {[
            { id: 'mobile', label: '移动端' },
            { id: 'desktop', label: '桌面端' },
            { id: 'name', label: '应用名称配置' },
            { id: 'cache', label: '管理应用缓存' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-4 px-1 text-lg font-medium transition-colors relative
                ${activeTab === tab.id 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'}
              `}
            >
              {tab.label}
              {tab.id === 'name' && (
                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">增值版本</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 桌面端内容 */}
      {activeTab === 'desktop' && (
        <div>
          {/* 标题区域 */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-8 bg-blue-600 rounded"></div>
            <h2 className="text-xl font-bold text-gray-900">桌面端导航栏配置</h2>
          </div>

          {/* 提示信息 */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-gray-700">
                <p className="mb-1">1.成员可自行增删导航栏应用及调整应用顺序，因此其客户端展示的应用及顺序可能和你配置的不同</p>
                <p>2.你可以将最重要的一个应用固定在成员导航栏首位，成员将无法调整该应用</p>
              </div>
            </div>
          </div>

          {/* 配置标签页 */}
          <div className="flex gap-8 border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveConfigTab('default')}
              className={`
                pb-3 text-lg font-medium transition-colors
                ${activeConfigTab === 'default' 
                  ? 'text-gray-900 border-b-2 border-gray-400' 
                  : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              默认配置
            </button>
            <button
              onClick={() => setActiveConfigTab('custom')}
              className={`
                pb-3 text-lg font-medium transition-colors
                ${activeConfigTab === 'custom' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              基于用户组自定义配置
            </button>
          </div>

          {activeConfigTab === 'custom' && (
            <div className="space-y-8">
              {/* 用户组选择 */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setIsUserGroupDropdownOpen(!isUserGroupDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-lg text-gray-900 hover:bg-gray-50 min-w-[280px] justify-between"
                  >
                    <span>{userGroups.find(g => g.id === selectedUserGroup)?.name}</span>
                    <ChevronDown size={20} className={`transition-transform ${isUserGroupDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isUserGroupDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                      <div className="p-2">
                        <div className="text-sm text-gray-500 px-3 py-2">为用户组自定义导航栏，优先级从高到低</div>
                        {userGroups.map((group) => (
                          <button
                            key={group.id}
                            onClick={() => {
                              setSelectedUserGroup(group.id);
                              setIsUserGroupDropdownOpen(false);
                            }}
                            className={`
                              w-full flex items-center gap-2 px-3 py-3 rounded-lg text-left transition-colors
                              ${selectedUserGroup === group.id 
                                ? 'bg-gray-100 text-gray-900' 
                                : 'text-gray-700 hover:bg-gray-50'}
                            `}
                          >
                            {group.name}
                            {selectedUserGroup === group.id && (
                              <div className="ml-auto text-blue-600">✓</div>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 p-2 flex gap-2">
                        <button className="flex-1 flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                          <Plus size={16} />
                          <span>新建用户组</span>
                        </button>
                        <button className="flex-1 flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                          <Edit2 size={16} />
                          <span>编辑用户组</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>可为不同用户组配置不同的应用</span>
                  <Info size={18} className="text-gray-400" />
                </div>
                <div className="ml-auto">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-xl text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <Edit2 size={18} />
                      <span>编辑导航</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 rounded-xl text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        取消
                      </button>
                      <button className="px-8 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                        保存
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作区域和预览 */}
              <div className="flex gap-12">
                {/* 左侧：操作区域 */}
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">操作区域</h3>
                  
                  {/* 应用区 */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-gray-500 text-sm">
                        {isEditing ? (
                          <>
                            <span className="text-gray-400">（</span>
                            <span>数量限制：2-25个</span>
                            <span className="text-gray-400">）</span>
                          </>
                        ) : null}
                      </span>
                    </div>
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6">
                      <div className="grid grid-cols-5 gap-4">
                        {activeApps.map((app, index) => (
                          <div
                            key={app.id}
                            className={`
                              relative group bg-gray-50 rounded-xl p-4 text-center cursor-default
                              ${isEditing ? 'border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50' : ''}
                            `}
                          >
                            {isEditing && (
                              <div className="absolute -top-3 -left-3">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white cursor-grab">
                                  <GripVertical size={14} />
                                </div>
                              </div>
                            )}
                            {isEditing && index === 0 && (
                              <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-500 rounded-tr-xl rounded-bl-xl flex items-center justify-center">
                                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                                  <path d="M4 4L10 4L4 10L4 4Z" />
                                </svg>
                              </div>
                            )}
                            <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-xl flex items-center justify-center">
                              <span className="text-2xl">{app.icon}</span>
                            </div>
                            <div className="text-sm text-gray-700">{app.name}</div>
                            {isEditing && (
                              <button className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                                <span className="text-xs">✕</span>
                              </button>
                            )}
                          </div>
                        ))}
                        {isEditing && (
                          <div className="relative bg-gray-50 rounded-xl p-4 text-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer">
                            <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                              <Plus size={24} className="text-gray-400" />
                            </div>
                            <div className="text-xs text-gray-500">3个应用可选择</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 更多区域 */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-gray-900 font-medium">更多</span>
                      <span className="text-gray-500 text-sm">
                        {isEditing ? (
                          <>
                            <span className="text-gray-400">（</span>
                            <span>数量限制：0-30个</span>
                            <span className="text-gray-400">）</span>
                          </>
                        ) : null}
                      </span>
                    </div>
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6">
                      <div className="grid grid-cols-5 gap-4">
                        {moreAppsList.map((app) => (
                          <div
                            key={app.id}
                            className={`
                              relative group bg-gray-50 rounded-xl p-4 text-center cursor-default
                              ${isEditing ? 'border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50' : ''}
                            `}
                          >
                            {isEditing && (
                              <div className="absolute -top-3 -left-3">
                                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white cursor-grab">
                                  <GripVertical size={14} />
                                </div>
                              </div>
                            )}
                            <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-xl flex items-center justify-center">
                              <span className="text-2xl">{app.icon}</span>
                            </div>
                            <div className="text-sm text-gray-700">{app.name}</div>
                            {isEditing && (
                              <button className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                                <span className="text-xs">✕</span>
                              </button>
                            )}
                          </div>
                        ))}
                        {isEditing && (
                          <div className="relative bg-gray-50 rounded-xl p-4 text-center border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer">
                            <div className="w-12 h-12 mx-auto mb-2 bg-white rounded-xl flex items-center justify-center border border-gray-200">
                              <Plus size={24} className="text-gray-400" />
                            </div>
                            <div className="text-xs text-gray-500">3个应用可选择</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6 flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-l-2 border-t-2 border-b-2 border-dashed border-gray-300 rounded-l-full mb-2"></div>
                        <div className="text-sm text-gray-600 text-center">
                          <div>拖动图标</div>
                          <div>改变分组</div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <button className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 text-gray-600">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-r-2 border-t-2 border-b-2 border-dashed border-gray-300 rounded-r-full mb-2"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 右侧：预览区域 */}
                <div className="w-80 flex flex-col">
                  <div className="flex items-center gap-6 mb-6 ml-auto">
                    <button
                      onClick={() => setPreviewMode('light')}
                      className={`
                        pb-2 text-lg font-medium transition-colors
                        ${previewMode === 'light' 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-600 hover:text-gray-900'}
                      `}
                    >
                      浅色模式
                    </button>
                    <button
                      onClick={() => setPreviewMode('dark')}
                      className={`
                        pb-2 text-lg font-medium transition-colors
                        ${previewMode === 'dark' 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-600 hover:text-gray-900'}
                      `}
                    >
                      深色模式
                    </button>
                  </div>

                  {/* 预览框 */}
                  <div className={`
                    flex-1 rounded-2xl border overflow-hidden
                    ${previewMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}
                  `}>
                    {/* 模拟桌面端侧边栏 */}
                    <div className={`
                      h-full flex flex-col
                      ${previewMode === 'dark' ? 'bg-gray-900' : 'bg-white'}
                    `}>
                      {/* 顶部区域 */}
                      <div className={`
                        p-4 border-b
                        ${previewMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                      `}>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-3 h-3 rounded-full bg-red-400"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white">
                            <span className="text-lg">👤</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">📅</span>
                          </div>
                          <button className="ml-auto w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                            <Plus size={16} />
                          </button>
                        </div>
                        {/* 搜索框 */}
                        <div className={`
                          mt-3 px-3 py-2 rounded-lg flex items-center gap-2
                          ${previewMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}
                        `}>
                          <div className="text-gray-400">🔍</div>
                          <span className="text-gray-400 text-sm">搜索（⌘K）</span>
                        </div>
                      </div>

                      {/* 导航列表 */}
                      <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {activeApps.slice(0, 6).map((app, index) => (
                          <div
                            key={app.id}
                            className={`
                              flex items-center gap-3 px-3 py-2.5 rounded-lg
                              ${index === 0 
                                ? (previewMode === 'dark' ? 'bg-gray-700 text-white' : 'bg-blue-50 text-blue-600')
                                : (previewMode === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50')
                              }
                            `}
                          >
                            <span className="text-lg">{app.icon}</span>
                            <span className="font-medium">{app.name}</span>
                          </div>
                        ))}
                        {/* 用户头像和豆包 */}
                        <div className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-lg
                          ${previewMode === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}
                        `}>
                          <span className="text-lg">👤</span>
                          <span className="font-medium">豆包</span>
                        </div>
                        {activeApps.slice(6).map((app) => (
                          <div
                            key={app.id}
                            className={`
                              flex items-center gap-3 px-3 py-2.5 rounded-lg
                              ${previewMode === 'dark' ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-50'}
                            `}
                          >
                            <span className="text-lg">{app.icon}</span>
                            <span className="font-medium">{app.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* 底部更多区域 */}
                      <div className={`
                        border-t p-3
                        ${previewMode === 'dark' ? 'border-gray-700' : 'border-gray-200'}
                      `}>
                        <button
                          onClick={() => setShowMoreMenu(!showMoreMenu)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                            ${previewMode === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
                            transition-colors
                          `}
                        >
                          <div className="text-lg">⠿</div>
                          <span className="font-medium">更多</span>
                        </button>
                      </div>
                    </div>

                    {/* 弹出的更多菜单预览 */}
                    {showMoreMenu && (
                      <div 
                        className="absolute inset-0 bg-black/20 flex items-center justify-center"
                        onClick={() => setShowMoreMenu(false)}
                      >
                        <div 
                          className={`
                            w-64 rounded-2xl p-4 shadow-2xl
                            ${previewMode === 'dark' ? 'bg-gray-800' : 'bg-white'}
                          `}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="grid grid-cols-3 gap-4">
                            {moreAppsList.slice(0, 3).map((app) => (
                              <div key={app.id} className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-xl flex items-center justify-center">
                                  <span className="text-2xl">{app.icon}</span>
                                </div>
                                <div className={`text-xs ${previewMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{app.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeConfigTab === 'default' && (
            <div className="py-12 text-center text-gray-500">
              默认配置内容待开发...
            </div>
          )}
        </div>
      )}

      {/* 其他标签页占位 */}
      {activeTab !== 'desktop' && (
        <div className="py-12 text-center text-gray-500">
          该功能开发中...
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (activeSubMenu === 'basic-navbar') {
      return renderNavbarConfig();
    }

    // 默认欢迎页面
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="text-center">
            <div className="relative mb-8">
              <div className="absolute -top-4 -left-8 w-32 h-16">
                <svg viewBox="0 0 128 64" className="w-full h-full">
                  <path 
                    d="M10 32 L100 32 L90 22 L95 32 L90 42 Z" 
                    fill="#333"
                    className="animate-pulse"
                  />
                  <path 
                    d="M95 32 L120 32" 
                    stroke="#ddd" 
                    strokeWidth="2" 
                    strokeDasharray="4 4"
                  />
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
            <p className="text-gray-500 mb-8">系统管理、安全管理、版本管理等功能入口</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {[
                { icon: '🔐', label: '系统管理', color: 'bg-blue-50 text-blue-600' },
                { icon: '🛡️', label: '安全管理', color: 'bg-green-50 text-green-600' },
                { icon: '📦', label: '版本管理', color: 'bg-purple-50 text-purple-600' },
                { icon: '📊', label: '工作台', color: 'bg-orange-50 text-orange-600' },
              ].map((item, index) => (
                <div 
                  key={index}
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
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <div className={`
        ${sidebarOpen ? 'w-64' : 'w-16'} 
        bg-gradient-to-b from-red-600 to-red-800 flex flex-col transition-all duration-300
      `}>
        <div className="p-4 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🐉</span>
            </div>
            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-white font-bold text-sm">JUNEYAO AIR</span>
                <span className="text-white/80 text-xs">吉祥航空</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-64 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          style={{ left: sidebarOpen ? SIDEBAR.EXPANDED : SIDEBAR.COLLAPSED }}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            <div className="text-xs text-red-200/60 px-3 py-2 font-medium uppercase tracking-wider">
              系统
            </div>
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id, !!item.children)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${activeMenu === item.id ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                      {item.children && (
                        <ChevronRight 
                          size={14} 
                          className={`transition-transform ${activeMenu === item.id ? 'rotate-90' : ''}`} 
                        />
                      )}
                    </>
                  )}
                </button>
                {sidebarOpen && item.children && activeMenu === item.id && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => setActiveSubMenu(subItem.id)}
                        className={`
                          w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                          ${activeSubMenu === subItem.id ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/5'}
                        `}
                      >
                        <span>{subItem.icon}</span>
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {sidebarOpen && (
          <div className="p-4 border-t border-red-500/30">
            <div className="text-xs text-red-200/60 text-center">
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
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {activeSubMenu === 'basic-navbar' ? '导航栏配置' : '首页'}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">梁劼</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
