import { type ReactNode } from 'react';
import { CalendarPlus, LogIn, Video } from 'lucide-react';

export type MeetingShellAction = 'schedule' | 'join' | 'start';

interface Props {
  onAction: (action: MeetingShellAction) => void;
  children: ReactNode;
}

const actions: { key: MeetingShellAction; label: string; icon: typeof Video }[] = [
  { key: 'schedule', label: '预定会议', icon: CalendarPlus },
  { key: 'join', label: '加入会议', icon: LogIn },
  { key: 'start', label: '发起会议', icon: Video },
];

/**
 * 如意会议骨架的第二、三栏：
 * 左侧会议操作栏（232px 白色工作面，独立滚动）+ 右侧内容工作面（头部固定、内容独立滚动）。
 * 两栏间露出 8px 页面底色（对齐消息页三块布局规范）。
 * 内容区顶部由页面内「我的会议 / 回顾文件」Tab 切换视图。
 */
export default function MeetingShell({ onAction, children }: Props) {
  return (
    <div className="flex h-full min-h-0 gap-2">
      {/* 会议操作栏：独立白色工作面 */}
      <aside className="flex w-[232px] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="px-4 pb-2 pt-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">如意会议</h2>
        </div>
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
          {actions.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => onAction(key)}
              className="flex h-12 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-gray-700 transition-colors hover:bg-[#EBEDF0] dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Icon size={18} className="shrink-0 text-gray-500 dark:text-gray-400" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 会议内容工作面：自适应宽度，头部固定内容滚动由 children 内部实现 */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white dark:border-gray-700 dark:bg-gray-800">
        {children}
      </div>
    </div>
  );
}
