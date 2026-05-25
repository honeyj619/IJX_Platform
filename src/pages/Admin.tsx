import { useState } from 'react';
import { 
  Menu, X, Shield, Lock, GitBranch, LayoutDashboard, 
  Globe, Network, Palette, ChevronRight, User, FolderTree
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

export default function Admin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  const handleMenuClick = (menuId: string, hasChildren: boolean) => {
    if (hasChildren) {
      setActiveMenu(activeMenu === menuId ? null : menuId);
    } else {
      setActiveMenu(menuId);
      setActiveSubMenu(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <div className={`
        ${sidebarOpen ? 'w-64' : 'w-16'} 
        bg-gradient-to-b from-red-600 to-red-800 flex flex-col transition-all duration-300
      `}>
        {/* Logo区域 */}
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

        {/* 菜单按钮 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-64 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          style={{ left: sidebarOpen ? SIDEBAR.EXPANDED : SIDEBAR.COLLAPSED }}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* 菜单列表 */}
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

        {/* 底部版权 */}
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
              <span className="text-sm font-medium text-gray-700">梁劼</span>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* 欢迎页面 */}
          <div className="max-w-4xl mx-auto">
            {/* 主卡片 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
              <div className="text-center">
                {/* 插图区域 */}
                <div className="relative mb-8">
                  {/* 飞机装饰 */}
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

                  {/* 主图标 */}
                  <div className="inline-block relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                      <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-1">💼</div>
                          <div className="text-xs text-gray-500">管理后台</div>
                        </div>
                      </div>
                    </div>

                    {/* 装饰元素 */}
                    <div className="absolute -right-4 top-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm">✓</span>
                    </div>
                  </div>

                  {/* 云朵装饰 */}
                  <div className="absolute -bottom-2 -right-4">
                    <svg viewBox="0 0 64 32" className="w-16 h-8">
                      <ellipse cx="20" cy="24" rx="16" ry="8" fill="#f0f0f0" />
                      <ellipse cx="36" cy="20" rx="14" ry="10" fill="#f0f0f0" />
                      <ellipse cx="48" cy="24" rx="12" ry="6" fill="#f0f0f0" />
                    </svg>
                  </div>
                </div>

                {/* 文字内容 */}
                <h1 className="text-2xl font-bold text-gray-900 mb-2">欢迎使用管理后台</h1>
                <p className="text-gray-500 mb-8">系统管理、安全管理、版本管理等功能入口</p>

                {/* 快捷入口卡片 */}
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
        </div>
      </div>
    </div>
  );
}