import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, LayoutGrid, MessageSquare, User, Signal, Wifi, BatteryFull } from 'lucide-react';
import { resolveAppPlatform, type AppPlatform } from './appPlatform';
import { useImStore } from '@/store/imStore';
import { totalUnread } from '@/data/im/utils';

/** App 端平台上下文：子页面通过 useAppPlatform() 读取当前平台 */
const AppPlatformContext = createContext<AppPlatform>('android');

export function useAppPlatform(): AppPlatform {
  return useContext(AppPlatformContext);
}

/** App 顶层 5 Tab（首页/日程/工作台/消息/我的） */
const TABS = [
  { key: 'home', label: '首页', root: '/home', icon: Home },
  { key: 'schedule', label: '日程', root: '/schedule', icon: CalendarDays },
  { key: 'workbench', label: '工作台', root: '/workbench', icon: LayoutGrid },
  { key: 'messages', label: '消息', root: '/messages', icon: MessageSquare },
  { key: 'me', label: '我的', root: '/me', icon: User },
] as const;

/** 归一化路径：去掉 /app 前缀与平台段，/app/android/home → /home */
function normalizeAppPath(pathname: string): string {
  const platformMatch = pathname.match(/^\/app\/(android|ios)/);
  if (platformMatch) return pathname.slice(platformMatch[0].length);
  const rest = pathname.replace(/^\/app/, '');
  return rest || '/';
}

function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const active = TABS.find((t) => t.root === normalizeAppPath(location.pathname))?.key ?? '';
  const unread = useImStore((s) => totalUnread(s.sessions));

  return (
    <nav className="flex min-h-14 shrink-0 items-stretch border-t border-[#ebedf0] bg-white pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => navigate(`/app${tab.root}`)}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 ${isActive ? 'text-[#f53a71]' : 'text-[#969799]'}`}
          >
            <span className="relative">
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              {tab.key === 'messages' && unread > 0 && (
                <span className="absolute -right-2.5 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#f53a71] px-1 text-[10px] font-medium leading-none text-white">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </span>
            <span className="text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

/**
 * App 端独立移动端布局（手机壳）
 * - 桌面浏览器以手机壳宽度（max-w 430px）居中呈现
 * - 顶层 5 Tab 栏仅在 Tab 根路径显示；IM 等子页全屏展示、自带返回头部
 * - 视觉按 docs/APP_UI_GUIDELINES.md（Vant 中性色 + 玫红 MR）
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const platform = useMemo(
    () => resolveAppPlatform(location.pathname, location.search),
    [location.pathname, location.search],
  );
  const normalized = normalizeAppPath(location.pathname);
  const isTabRoot = TABS.some((t) => t.root === normalized);

  return (
    <div className="flex h-full w-full justify-center bg-[#f2f3f5]">
      <div className="relative flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-[#f7f8fa] shadow-xl">
        <AppPlatformContext.Provider value={platform}>
          {/* 状态栏占位（骨架，设计稿后替换） */}
          <div className="flex h-8 shrink-0 items-center justify-between bg-white px-5 text-[#969799]">
            <span className="text-[11px] font-medium">9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal size={12} />
              <Wifi size={12} />
              <BatteryFull size={14} />
            </div>
          </div>

          {/* 内容区：页面自行管理内部滚动 */}
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>

          {isTabRoot && <TabBar />}
        </AppPlatformContext.Provider>
      </div>
    </div>
  );
}
