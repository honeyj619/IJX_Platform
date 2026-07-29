import { ReactNode, useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MessageSquare, Bell, Calendar, Folder, Hexagon, User, X, XCircle, Search, Menu, ChevronRight, ChevronLeft, Plus, Link as LinkIcon } from 'lucide-react';
import { create } from 'zustand';
import { useThemeStore } from '../store/themeStore';
import { useLayoutStore } from '../store/layoutStore';
import { UserMenu } from './UserMenu';
import { SIDEBAR } from '../constants/layout';
import { getDemoPerson, getInitialsAvatar } from '../data/people';

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
  '/enterprise': '工作门户',
  '/calendar': '日历',
  '/knowledge': '知识库',
  '/ekb': '知识库',
  '/business': '业务系统',
  '/work-report': '工作汇报',
  '/work-items': '事项协同',
  '/okr': 'OKR',
  '/ruyi-zone': '如意空间',
  '/agent-square': '智能体广场',
  '/profile': '个人信息',
  '/settings': '系统设置'
};

const WEB_CLIENT_BASE = '/web_client';
const clientPath = (path: string) => path === '/' ? WEB_CLIENT_BASE : `${WEB_CLIENT_BASE}${path}`;
const stripClientBase = (path: string) => {
  if (path === WEB_CLIENT_BASE) return '/';
  return path.startsWith(`${WEB_CLIENT_BASE}/`) ? path.slice(WEB_CLIENT_BASE.length) : path;
};

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pages, addPage, removePage, removeAllPages, isPageOpen } = usePagesStore();
  const { mode, skin } = useThemeStore();
  const { showNavigation, toggleNavigation, isResponsive, setIsResponsive } = useLayoutStore();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarWidth, setSidebarWidth] = useState<number>(SIDEBAR.EXPANDED_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [isManuallyCollapsed, setIsManuallyCollapsed] = useState(false);
  const [showAddLinkPopup, setShowAddLinkPopup] = useState(false);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const addLinkBtnRef = useRef<HTMLButtonElement>(null);

  // 拖动调整左侧导航栏宽度
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!showNavigation) {
        const expandedWidth = Math.min(SIDEBAR.MAX_DRAG_WIDTH, e.clientX);
        if (expandedWidth > SIDEBAR.COLLAPSED_WIDTH) {
          setSidebarWidth(expandedWidth);
          setIsManuallyCollapsed(false);
          toggleNavigation();
          setSidebarWidth(Math.max(SIDEBAR.COLLAPSED_WIDTH + 10, expandedWidth));
        }
        return;
      }
      
      const newWidth = Math.max(SIDEBAR.COLLAPSED_WIDTH, Math.min(SIDEBAR.MAX_DRAG_WIDTH, e.clientX));
      setSidebarWidth(newWidth);
      
      if (newWidth <= SIDEBAR.COLLAPSED_WIDTH && showNavigation) {
        setIsManuallyCollapsed(true);
        toggleNavigation();
        setIsDragging(false);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (!showNavigation && sidebarWidth <= SIDEBAR.COLLAPSED_WIDTH) {
        setIsManuallyCollapsed(true);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, showNavigation, toggleNavigation]);
  
  // 响应式检测 - 简化版本
  useEffect(() => {
    let initialCheck = true;
    
    const checkResponsive = () => {
      const width = window.innerWidth;
      const isNarrow = width < 1024; // 更低的断点，避免过度响应
      setIsResponsive(isNarrow);
      
      // 只在首次加载和小屏幕情况下自动折叠，避免循环
      if (initialCheck && width < 1024) {
        initialCheck = false;
        if (showNavigation) {
          setIsManuallyCollapsed(true);
          toggleNavigation();
        }
      }
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    
    return () => window.removeEventListener('resize', checkResponsive);
  }, [setIsResponsive]); // 移除会导致循环的依赖
  
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
    { icon: <MessageSquare size={20} />, label: '消息', to: clientPath('/'), badge: 8, badgeTitle: '8条未读消息', badgeTone: 'message' },
    { icon: <Bell size={20} />, label: '工作门户', to: clientPath('/enterprise'), badge: 21, badgeTitle: '21项未办事项', badgeTone: 'work' },
    { icon: <Calendar size={20} />, label: '日历', to: clientPath('/calendar') },
    { icon: <Folder size={20} />, label: '知识库', to: clientPath('/ekb') },
    { icon: <Hexagon size={20} />, label: '业务系统', to: clientPath('/business') },
    { icon: <Bell size={20} />, label: '如意空间', to: clientPath('/ruyi-zone') },
  ];

  const navPaths = navItems.map(item => item.to);
  
  useEffect(() => {
    const currentPath = location.pathname;
    const pageTitle = pageTitles[stripClientBase(currentPath)] || currentPath;
    
    if (pageTitle && !navPaths.includes(currentPath)) {
      addPage({ title: pageTitle, path: currentPath });
    }
  }, [location.pathname, addPage, navPaths]);

  const handleClosePage = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removePage(path);
    
    if (location.pathname === path) {
      navigate(WEB_CLIENT_BASE);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* 响应式侧边栏遮罩 - 移动端 */}
      {isResponsive && showNavigation && (
        <div 
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => {
            setIsManuallyCollapsed(true);
            toggleNavigation();
          }}
        />
      )}
      
      {/* 左侧导航栏 - 简化响应式逻辑 */}
      <div 
        className={`
          bg-gradient-to-theme text-white flex flex-col transition-all duration-300 ease-in-out
          ${isDragging ? 'select-none' : ''}
        `}
        style={{ 
          width: showNavigation ? `${sidebarWidth}px` : SIDEBAR.COLLAPSED,
          // 响应式模式下处理侧边栏位置
          ...(isResponsive && {
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            zIndex: 50,
            transform: showNavigation ? 'translateX(0)' : 'translateX(-100%)'
          })
        }}
      >
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
                active={location.pathname === item.to || (item.to !== WEB_CLIENT_BASE && location.pathname.startsWith(`${item.to}/`))}
                collapsed={!showNavigation}
                badge={item.badge}
                badgeTitle={item.badgeTitle}
                badgeTone={item.badgeTone}
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
                        navigate(WEB_CLIENT_BASE);
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

        <div className={`border-t border-white/20 ${showNavigation ? 'p-3' : 'p-2 flex flex-col items-center gap-2'} flex-shrink-0`}>
          <div className={`${showNavigation ? 'flex items-center justify-between' : 'flex flex-col items-center gap-2'}`}>
            {/* 添加链接按钮 */}
            <div className="relative">
              <button
                ref={addLinkBtnRef}
                onClick={() => setShowAddLinkPopup(!showAddLinkPopup)}
                className={`
                  ${showNavigation ? 'inline-flex items-center gap-1.5' : 'flex justify-center'}
                  p-2 rounded-lg hover:bg-white/20 transition-all duration-300
                  text-white/80 hover:text-white
                `}
                title="添加链接"
              >
                <Plus size={18} />
                {showNavigation && <span className="text-xs font-medium">添加</span>}
              </button>

              {/* 添加链接弹框 */}
              {showAddLinkPopup && (
                <>
                  <div className="fixed inset-0 z-[60]" onClick={() => setShowAddLinkPopup(false)} />
                  <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-[65]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">添加链接</h3>
                      <button
                        onClick={() => setShowAddLinkPopup(false)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X size={16} className="text-gray-400" />
                      </button>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">标签名</label>
                        <input
                          type="text"
                          value={linkLabel}
                          onChange={(e) => setLinkLabel(e.target.value)}
                          placeholder="输入标签名称"
                          className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-transparent focus:border-theme-500 focus:ring-1 focus:ring-theme-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">跳转地址</label>
                        <input
                          type="text"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="输入链接地址"
                          className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-transparent focus:border-theme-500 focus:ring-1 focus:ring-theme-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (linkLabel && linkUrl) {
                            setLinkLabel('');
                            setLinkUrl('');
                            setShowAddLinkPopup(false);
                          }
                        }}
                        disabled={!linkLabel || !linkUrl}
                        className="w-full py-2 text-sm font-medium bg-theme-500 text-white rounded-lg hover:bg-theme-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        确认添加
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 折叠/展开按钮 */}
            <button
              onClick={() => {
                if (!showNavigation && isManuallyCollapsed) {
                  setSidebarWidth(SIDEBAR.EXPANDED_WIDTH);
                  setIsManuallyCollapsed(false);
                }
                toggleNavigation();
              }}
              className={`
                ${showNavigation ? 'inline-flex justify-end' : 'flex justify-center'}
                p-2 rounded-lg hover:bg-white/20 transition-all duration-300
                text-white/80 hover:text-white
              `}
              title={showNavigation ? "收起导航栏" : "展开导航栏"}
            >
              {showNavigation ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* 拖动条 - 左侧导航栏 (仅在非响应式模式下显示) */}
      {!isResponsive && (
        <div
          className={`fixed top-0 w-1 h-full cursor-col-resize z-[55] group transition-opacity ${
            isDragging ? 'bg-theme-300' : 'hover:bg-theme-300'
          } ${!showNavigation && !isDragging ? 'opacity-0' : 'opacity-100'}`}
          style={{ left: `${showNavigation ? sidebarWidth : SIDEBAR.COLLAPSED_WIDTH}px` }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-16 bg-white/50 rounded-full"></div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div 
        className="flex-1 overflow-hidden flex flex-col h-full transition-all duration-300"
        style={{ height: '100%' }}
      >
        {/* 移动端顶部导航栏 - 包含菜单按钮 */}
        {isResponsive && (
          <div className="lg:hidden h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 shrink-0">
            <button 
              onClick={() => {
                setIsManuallyCollapsed(false);
                toggleNavigation();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
            <span className="font-semibold text-gray-900 dark:text-white">工作空间</span>
            <div className="w-10"></div> {/* 占位，保持居中 */}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0">
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
                          <img src={getInitialsAvatar(getDemoPerson(0), '3b82f6')} alt={getDemoPerson(0)} className="w-14 h-14 rounded-full mb-2" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{getDemoPerson(0)}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">项目管理工程师</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <img src={getInitialsAvatar(getDemoPerson(1), 'ec4899')} alt={getDemoPerson(1)} className="w-14 h-14 rounded-full mb-2" />
                          <span className="text-xs text-gray-700 dark:text-gray-300">{getDemoPerson(1)}</span>
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
                          <div className="text-xs text-gray-400 dark:text-gray-500">责任人：{getDemoPerson(4)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700 dark:text-gray-300 text-sm mb-1">敏捷项目管理助手</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">责任人：{getDemoPerson(5)}</div>
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

function NavItem({ icon, label, to, active = false, collapsed = false, badge, badgeTitle, badgeTone }: { icon: React.ReactNode | null; label: string; to: string; active?: boolean; collapsed?: boolean; badge?: number; badgeTitle?: string; badgeTone?: string }) {
  return (
    <Link
      to={to}
      className={`
        relative rounded-md transition-colors text-left
        ${active ? 'bg-white/30 font-bold' : 'hover:bg-white/20'}
        ${collapsed ? 'w-12 flex flex-col items-center justify-center py-2 gap-0.5' : 'w-full flex items-center gap-3 px-3 py-3'}
      `}
      title={badgeTitle || label}
    >
      {icon && <span className="text-white flex-shrink-0">{icon}</span>}
      <span className={`text-white ${collapsed ? 'text-2xs leading-tight text-center w-full truncate' : 'flex-1 min-w-0 truncate'}`}>
        {label}
      </span>
      {badge ? (
        <span
          title={badgeTitle}
          className={`flex items-center justify-center rounded-full font-semibold text-white shadow-sm ${badgeTone === 'work' ? 'bg-amber-500' : 'bg-red-500'} ${collapsed ? 'absolute right-0.5 top-0.5 h-4 min-w-4 px-1 text-[10px] leading-none' : 'ml-auto h-5 min-w-5 px-1.5 text-xs'}`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );
}

