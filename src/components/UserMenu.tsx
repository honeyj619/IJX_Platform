import { useState, useRef, useEffect } from "react";
import { User, Settings, LogOut, Shield, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MAIN_USER_AVATAR, MAIN_USER_NAME } from "../data/people";

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
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
      path: "/web_client/profile"
    },
    {
      id: "download",
      label: "下载应用",
      icon: <Download size={16} />,
      path: "/download"
    },
    { id: "divider1", label: "", icon: null, divider: true },
    {
      id: "settings",
      label: "系统设置",
      icon: <Settings size={16} />,
      path: "/web_client/settings"
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
      label: "退出",
      icon: <LogOut size={16} />,
      action: () => console.log("退出登录")
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    setIsOpen(false);
    if (item.action) {
      item.action();
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* 头像按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center rounded-lg text-[var(--ui-text-title)] hover:bg-white/70 dark:text-[var(--ui-text-title)] dark:hover:bg-white/10 transition-colors ${collapsed ? 'justify-center p-1' : 'gap-2 p-2 w-full'}`}
      >
        <img
          src={MAIN_USER_AVATAR}
          alt="用户头像"
          className={`rounded-full border-2 border-white flex-shrink-0 cursor-pointer hover:border-[var(--ui-brand-primary)] transition-all ${collapsed ? 'w-9 h-9' : 'w-10 h-10'}`}
        />
        {!collapsed && <span className="font-semibold text-sm truncate hidden md:block">{MAIN_USER_NAME}</span>}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="fixed mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[65]" style={{
          top: collapsed ? (menuRef.current?.getBoundingClientRect().top || 0) : (menuRef.current?.getBoundingClientRect().bottom || 0) + 8,
          left: collapsed ? (menuRef.current?.getBoundingClientRect().right || 0) + 8 : (menuRef.current?.getBoundingClientRect().left || 0)
        }}>
          {/* 用户信息头部 */}
          <div className="p-4 bg-[var(--ui-brand-primary)]">
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
    </div>
  );
}
