import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, Shield, Download, CircleHelp, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { Skin } from "../store/themeStore";
import { MAIN_USER_AVATAR, MAIN_USER_NAME } from "../data/people";
import { createFeedbackPageContext, saveFeedbackPageContext } from "../utils/feedbackPageContext";
import { usePrototypeSessionStore } from "../store/prototypeSessionStore";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  divider?: boolean;
  children?: MenuItem[];
}

interface UserMenuProps {
  collapsed?: boolean;
  feedbackPageTitle?: string;
}

export function UserMenu({ collapsed = false, feedbackPageTitle = '' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, skin, setMode, setSkin } = useThemeStore();
  const logoutChannel = usePrototypeSessionStore(state => state.logoutChannel);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems: MenuItem[] = [
    {
      id: "profile",
      label: "个人信息",
      icon: <User size={16} />,
      path: "/pc_client/profile"
    },
    {
      id: "download",
      label: "下载应用",
      icon: <Download size={16} />,
      path: "/download"
    },
    {
      id: "help-feedback",
      label: "帮助与反馈",
      icon: <CircleHelp size={16} />,
      path: "/pc_client/help-feedback"
    },
    { id: "divider1", label: "", icon: null, divider: true },
    {
      id: "settings",
      label: "系统设置",
      icon: <Settings size={16} />,
      path: "/pc_client/settings"
    },
    {
      id: "admin",
      label: "管理后台",
      icon: <Shield size={16} />,
      path: "/admin"
    },
    { id: "divider2", label: "", icon: null, divider: true },
    {
      id: "logout",
      label: "退出登录",
      icon: <LogOut size={16} />,
      action: () => setConfirmLogout(true)
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    setIsOpen(false);
    if (item.id === 'help-feedback' && item.path) {
      if (!location.pathname.includes('/help-feedback')) {
        const context = createFeedbackPageContext(feedbackPageTitle, `${location.pathname}${location.search}`, 'PC_CLIENT');
        saveFeedbackPageContext(context);
        navigate(item.path, { state: { feedbackPageContext: context, feedbackOrigin: { source: 'PC客户端用户菜单', clientKind: 'PC_CLIENT' } } });
      } else {
        navigate(item.path);
      }
      return;
    }
    if (item.action) {
      item.action();
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  const skins: { value: Skin; name: string; color: string }[] = [
    { value: 'pink', name: '樱花粉', color: '#ec4899' },
    { value: 'blue', name: '天空蓝', color: '#3b82f6' },
    { value: 'purple', name: '紫罗兰', color: '#a855f7' },
    { value: 'green', name: '薄荷绿', color: '#22c55e' },
    { value: 'orange', name: '日落橙', color: '#f97316' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* 头像按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-lg hover:bg-white/10 transition-colors ${collapsed ? 'justify-center p-1' : 'gap-2 p-2 w-full'}`}
      >
        <img
          src={MAIN_USER_AVATAR}
          alt="用户头像"
          className={`flex-shrink-0 cursor-pointer rounded-lg border-0 transition-opacity hover:opacity-90 ${collapsed ? 'w-9 h-9' : 'w-10 h-10'}`}
        />
        {!collapsed && <span className="hidden truncate text-lg font-bold text-black md:block dark:text-white">{MAIN_USER_NAME}</span>}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="fixed mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[65]" style={{
          top: collapsed ? (menuRef.current?.getBoundingClientRect().top || 0) : (menuRef.current?.getBoundingClientRect().bottom || 0) + 8,
          left: collapsed ? (menuRef.current?.getBoundingClientRect().right || 0) + 8 : (menuRef.current?.getBoundingClientRect().left || 0)
        }}>
          {/* 用户信息头部 */}
          <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600">
            <div className="flex items-center gap-3">
              <img
                src={MAIN_USER_AVATAR}
                alt="用户头像"
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <div className="font-bold text-white">{MAIN_USER_NAME}</div>
                <div className="text-xs text-white/80">信息管理部 · 高级工程师</div>
              </div>
            </div>
          </div>

          {/* 菜单列表 */}
          <div className="py-2">
            {menuItems.map((item) => (
              item.divider ? (
                <div key={item.id} className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
              ) : (
                <button
                  key={item.id}
                  data-requirement-id={item.id === 'help-feedback' ? 'client-help-feedback-entry' : undefined}
                  onClick={() => handleMenuClick(item)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              )
            ))}
          </div>
        </div>
      )}

      {/* 退出登录确认弹窗：确认后清除客户端登录态并回到客户端未登录页 */}
      {confirmLogout && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setConfirmLogout(false); }}>
          <div role="dialog" aria-modal="true" aria-label="退出登录" className="w-full max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">退出登录</h3>
              <button type="button" onClick={() => setConfirmLogout(false)} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
            </div>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">退出后当前客户端将回到未登录状态，需要重新登录才能继续使用。</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmLogout(false)} className="rounded-lg border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">取消</button>
              <button type="button" onClick={() => { setConfirmLogout(false); logoutChannel('client'); navigate('/pc_client', { replace: true }); }} className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-medium text-white hover:bg-theme-700">确认退出</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
