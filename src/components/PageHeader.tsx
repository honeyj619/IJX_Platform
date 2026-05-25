import { ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  tabs?: ReactNode;
  actions?: ReactNode;
  /** Extra content below the main row (e.g. filters) */
  extra?: ReactNode;
}

/**
 * 融合式页面头部 — 无硬分割线，渐变过渡融入内容区
 * 使用毛玻璃效果 + 微阴影，视觉上与内容融为一体
 */
export function PageHeader({ icon, title, tabs, actions, extra }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 shrink-0 bg-gradient-to-b from-white via-white/95 to-white/90 backdrop-blur-xl">
      {/* 柔和底阴影 — 替代硬 border-b */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-200/50 to-transparent" />
      <div className="absolute inset-x-0 -bottom-4 h-4 bg-gradient-to-b from-black/[0.02] to-transparent pointer-events-none" />

      <div className="px-6 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 图标 — 保持渐变粉风格 */}
            <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl flex items-center justify-center shadow-sm shadow-pink-200/50">
              {icon}
            </div>
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            {tabs && (
              <div className="ml-2">{tabs}</div>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-3">{actions}</div>
          )}
        </div>
        {extra && (
          <div className="mt-2">{extra}</div>
        )}
      </div>
    </header>
  );
}

/** 页面头部内嵌的 Tab 切换组件 */
export function HeaderTabs({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center bg-gray-100/80 rounded-lg p-0.5">
      {children}
    </div>
  );
}

/** 单个 Tab 按钮 */
export function HeaderTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
        active
          ? 'bg-white text-gray-800 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}
