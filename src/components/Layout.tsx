import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Bell, Calendar, Folder, Hexagon, User, X, XCircle, Search, Menu, ChevronRight, ChevronLeft } from 'lucide-react';
import { create } from 'zustand';
import { useThemeStore } from '../store/themeStore';
import { useLayoutStore } from '../store/layoutStore';
import { UserMenu } from './UserMenu';

interface LayoutProps {
  children: ReactNode;
}

interface Page {
  id: string;
  title: string;
  path: string;
}

interface PagesStore {
  pages: Page[];
  addPage: (page: Omit<Page, 'id'>) => void;
  removePage: (path: string) => void;
  removeAllPages: () => void;
  isPageOpen: (path: string) => boolean;
}

const usePagesStore = create<PagesStore>((set, get) => ({
  pages: [],
  addPage: (page) => {
    const existingPage = get().pages.find(p => p.path === page.path);
    if (!existingPage) {
      set(state => ({
        pages: [...state.pages, { ...page, id: Date.now().toString() }]
      }));
    }
  },
  removePage: (path) => {
    set(state => ({
      pages: state.pages.filter(page => page.path !== path)
    }));
  },
  removeAllPages: () => {
    set({ pages: [] });
  },
  isPageOpen: (path) => {
    return get().pages.some(page => page.path === path);
  }
}));

const pageTitles: Record<string, string> = {
  '/': '消息',
  '/enterprise': '企业门户',
  '/calendar': '日历',
  '/knowledge': '知识库',
  '/ekb': '知识库',
  '/business': '业务系统',
  '/ruyi-zone': '如意空间',
  '/agent-square': '智能体广场',
  '/profile': '个人设置',
  '/settings': '应用设置'
};

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pages, addPage, removePage, removeAllPages, isPageOpen } = usePagesStore();
  const { mode, skin } = useThemeStore();
  const { showNavigation, toggleNavigation, isResponsive, setIsResponsive } = useLayoutStore();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 响应式检测
  useEffect(() => {
    const checkResponsive = () => {
      const isNarrow = window.innerWidth < 1400;
      setIsResponsive(isNarrow);
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    
    return () => window.removeEventListener('resize', checkResponsive);
  }, [setIsResponsive]);
  
  useEffect(() => {
    const applyTheme = () => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(mode);
      
      document.documentElement.classList.remove('skin-pink', 'skin-blue', 'skin-purple', 'skin-green', 'skin-orange');
      document.documentElement.classList.add(`skin-${skin}`);
    };
    
    applyTheme();
  }, [mode, skin]);
  
  const navItems = [
    { icon: <MessageSquare size={20} />, label: '消息', to: '/' },
    { icon: <Bell size={20} />, label: '企业门户', to: '/enterprise' },
    { icon: <Calendar size={20} />, label: '日历', to: '/calendar' },
    { icon: <Folder size={20} />, label: '知识库', to: '/ekb' },
    { icon: <Hexagon size={20} />, label: '业务系统', to: '/business' },
    { icon: <Bell size={20} />, label: '如意空间', to: '/ruyi-zone' },
  ];

  const navPaths = navItems.map(item => item.to);
  
  useEffect(() => {
    const currentPath = location.pathname;
    const pageTitle = pageTitles[currentPath] || currentPath;
    
    if (pageTitle && !navPaths.includes(currentPath)) {
      addPage({ title: pageTitle, path: currentPath });
    }
  }, [location.pathname, addPage, navPaths]);

  const handleClosePage = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removePage(path);
    
    if (location.pathname === path) {
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* 左侧导航栏 */}
      <div className={`
        bg-gradient-to-theme text-white flex flex-col fixed h-full z-50 transition-all duration-300 ease-in-out
        ${showNavigation ? 'w-64' : 'w-16'}
      `}>
        <div className={`${showNavigation ? 'p-4 space-y-4' : 'p-2 pt-3 space-y-3 flex flex-col items-center'}`}>
          <UserMenu collapsed={!showNavigation} />

          {showNavigation ? (
            <div className="relative group">
              <input
                type="text"
                placeholder="搜索..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-white/15 text-white text-sm placeholder-white/50 focus:outline-none focus:bg-white/25 focus:ring-1 focus:ring-white/40 transition-all duration-300"
                onClick={() => setIsSearchOpen(true)}
              />
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 group-focus-within:text-white/80 transition-colors" />
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors"
            >
              <Search size={16} className="text-white/80" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <nav className={`${showNavigation ? 'space-y-1 px-3' : 'space-y-1 px-1 flex flex-col items-center'}`}>
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                icon={item.icon}
                label={item.label}
                to={item.to}
                active={location.pathname === item.to}
                collapsed={!showNavigation}
              />
            ))}
          </nav>

          {/* 打开的页面 - 展开态 */}
          {showNavigation && (
            <div className="mt-6 px-3">
              <div className="h-px bg-white/40 my-4"></div>
              <div className="flex items-center justify-between text-sm font-semibold mb-2">
                <span>打开的页面</span>
                {pages.filter(page => !navPaths.includes(page.path)).length > 0 && (
                  <button
                    onClick={() => {
                      removeAllPages();
                      if (!navPaths.includes(location.pathname)) {
                        navigate('/');
                      }
                    }}
                    className="text-xs hover:text-white/80 transition-colors flex items-center gap-1"
                  >
                    <X size={14} />
                    全部关闭
                  </button>
                )}
              </div>
              <div className="space-y-1">
                {pages.filter(page => !navPaths.includes(page.path)).length === 0 ? (
                  <div className="px-3 py-3 rounded-md text-white/60 text-sm italic">
                    暂无打开的页面
                  </div>
                ) : (
                  pages
                    .filter(page => !navPaths.includes(page.path))
                    .map((page) => (
                      <div
                        key={page.id}
                        className={`relative flex items-center gap-3 px-3 py-3 rounded-md transition-colors group ${location.pathname === page.path ? 'bg-white/30 font-bold' : 'hover:bg-white/20'}`}
                      >
                        <Link to={page.path} className="flex-1 min-w-0 truncate">
                          {page.title}
                        </Link>
                        <button
                          onClick={(e) => handleClosePage(page.path, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-white"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* 打开的页面 - 折叠态 */}
          {!showNavigation && (
            <div className="flex flex-col items-center mt-4">
              <div className="h-px bg-white/40 w-8 mb-4"></div>
              {pages.filter(page => !navPaths.includes(page.path)).length > 0 ? (
                <div
                  className="relative flex flex-col items-center py-1"
                  title={`${pages.filter(page => !navPaths.includes(page.path)).length} 个打开的页面`}
                >
                  <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center text-sm font-bold text-white">
                    {pages.filter(page => !navPaths.includes(page.path)).length}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className={`border-t border-white/20 ${showNavigation ? 'p-4 space-y-2' : 'p-2 flex flex-col items-center'}`}>
        </div>
      </div>

      {/* 切换按钮 */}
      <button
        onClick={toggleNavigation}
        className={`
          fixed top-4 z-[60] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm
          rounded-full p-2 shadow-lg border border-gray-200 dark:border-gray-700
          hover:bg-white dark:hover:bg-gray-700 transition-all duration-300
          ${showNavigation ? 'left-60' : 'left-14'}
        `}
      >
        {showNavigation ? <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" /> : <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />}
      </button>

      {/* 主内容区域 */}
      <div className={`
        flex-1 overflow-hidden flex flex-col transition-all duration-300
        ${showNavigation ? 'ml-64' : 'ml-16'}
      `}>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
        
        {isSearchOpen && (
          <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
              <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-700 px-5 py-4 z-10">
                <div className="flex items-center gap-3">
                  <button 
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => setIsSearchOpen(false)}
                  >
                    <X size={18} />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="搜索..."
                      className="w-full pl-4 pr-10 py-2 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 ring-theme-400 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                  <button className="px-4 py-1.5 bg-theme-100 text-theme-700 rounded-full text-sm font-medium whitespace-nowrap">全部</button>
                  <button className="px-4 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">用户</button>
                  <button className="px-4 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">文档</button>
                  <button className="px-4 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">流程</button>
                  <button className="px-4 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">聊天记录</button>
                  <button className="px-4 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">智能搜索</button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 text-sm">用户</h3>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <img src="https://api.dicebear.com/7.x/initials/svg?seed=张三&backgroundColor=3b82f6" alt="张三" className="w-14 h-14 rounded-full mb-2" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">张三</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">项目管理工程师</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <img src="https://api.dicebear.com/7.x/initials/svg?seed=王肯豆&backgroundColor=ec4899" alt="王肯豆" className="w-14 h-14 rounded-full mb-2" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">王肯豆</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">项目管理工程师</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 text-sm">搜索结果</h3>
                      <div className="space-y-4">
                        <div className="border-b border-gray-200 dark:border-gray-600 pb-3">
                          <div className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">[流程] 项目管理平台立项流程</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">立项时间2024-12-1 项目编号LX178651-1</div>
                        </div>
                        <div className="border-b border-gray-200 dark:border-gray-600 pb-3">
                          <div className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">[文档] 项目管理平台使用手册</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">立项时间2024-12-1 项目编号LX178651-1</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">[课程] 项目管理 - 敏捷教学</div>                          <div className="text-xs text-gray-500 dark:text-gray-400">立项时间2024-12-1 项目编号LX178651-1</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-gradient-to-br-theme rounded-xl p-4">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2 text-sm">搜索总结</h3>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        相关搜索结果共 12 条，包含流程 3 条，文档 5 条，课程 4 条。
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 text-sm">业务系统</h3>
                      <div className="space-y-3">
                        <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                          <div className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">[管理] 项目管理平台</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">发布时间2024-12-1</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">[数据] 项目管理大屏</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">发布时间2024-12-1</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                      <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3 text-sm">智能体</h3>
                      <div className="space-y-3">
                        <div className="border-b border-gray-200 dark:border-gray-600 pb-2">
                          <div className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">项目管理助手</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">责任人：赵子龙</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">敏捷项目管理助手</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">责任人：凉凉</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavItem({ icon, label, to, active = false, collapsed = false }: { icon: React.ReactNode | null; label: string; to: string; active?: boolean; collapsed?: boolean }) {
  return (
    <Link
      to={to}
      className={`
        rounded-md transition-colors text-left
        ${active ? 'bg-white/30 font-bold' : 'hover:bg-white/20'}
        ${collapsed ? 'w-12 flex flex-col items-center justify-center py-2 gap-0.5' : 'w-full flex items-center gap-3 px-3 py-3'}
      `}
      title={label}
    >
      {icon && <span className="text-white flex-shrink-0">{icon}</span>}
      <span className={`text-white ${collapsed ? 'text-[10px] leading-tight text-center w-full truncate' : 'flex-1 min-w-0 truncate'}`}>
        {label}
      </span>
    </Link>
  );
}
