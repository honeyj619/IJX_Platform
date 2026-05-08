import { useState, useRef, useEffect } from "react";
import { User, FileText, Users, Settings, LogOut, Shield, Palette, Moon, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useThemeStore } from "../store/themeStore";
import { Skin } from "../store/themeStore";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  divider?: boolean;
  children?: MenuItem[];
}

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { mode, skin, setMode, setSkin } = useThemeStore();

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
      path: "/profile" 
    },
    { id: "divider1", label: "", icon: null, divider: true },
    { 
      id: "settings", 
      label: "系统设置", 
      icon: <Settings size={16} />, 
      path: "/settings" 
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
    if (item.action) {
      item.action();
    }
    if (item.path) {
      setIsOpen(false);
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
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors w-full"
      >
        <img
          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20beautiful%20woman%20avatar%2C%20modern%20style%2C%20confident%20expression%2C%20soft%20lighting%2C%20elegant%20appearance&image_size=square_hd"
          alt="用户头像"
          className="w-10 h-10 rounded-full border-2 border-white flex-shrink-0 cursor-pointer hover:border-pink-400 transition-all"
        />
        <span className="font-bold text-lg truncate hidden md:block text-white">梁吉力</span>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="fixed left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[65]" style={{ top: (menuRef.current?.getBoundingClientRect().bottom || 0) + 8, left: menuRef.current?.getBoundingClientRect().left || 0 }}>
          {/* 用户信息头部 */}
          <div className="p-4 bg-gradient-to-r from-pink-500 to-purple-600">
            <div className="flex items-center gap-3">
              <img
                src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20beautiful%20woman%20avatar%2C%20modern%20style%2C%20confident%20expression%2C%20soft%20lighting%2C%20elegant%20appearance&image_size=square_hd"
                alt="用户头像"
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <div className="font-bold text-white">梁吉力</div>
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
