import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * 如意工作台统一骨架
 * 统一三个工作台（公文 / PPT / 参谋师）的顶部、工具栏、右栏、底部状态栏规格。
 * 通过插槽承载业务内容，不持有业务状态。
 */
export interface RuyiWorkbenchShellProps {
  /** 面包屑：可点击的上级区域名，如「如意空间」 */
  breadcrumb: string;
  /** 工作台名称，如「公文工作台」「PPT工作台」「参谋师工作台」 */
  workbenchName: string;
  /** 当前内容标题（公文标题 / PPT标题 / 汇报或洞察名称） */
  title: string;
  /** 返回回调 */
  onBack: () => void;
  /** 顶部右侧业务操作 */
  headerActions?: ReactNode;
  /** 顶部下方工具栏（撤回/重做/复制等），无则不渲染该行 */
  toolbar?: ReactNode;
  /** 右侧栏头部（标题区 + 切换） */
  sidebarHeader: ReactNode;
  /** 右侧栏滚动内容区 */
  sidebarContent: ReactNode;
  /** 右侧栏底部主操作区 */
  sidebarFooter: ReactNode;
  /** 底部状态条左：保存或生成状态 */
  statusLeft: ReactNode;
  /** 底部状态条中：AI 提示 */
  statusCenter?: ReactNode;
  /** 底部状态条右：字数/页数/周期等业务摘要 */
  statusRight: ReactNode;
  /** 主工作区内容 */
  children: ReactNode;
}

export default function RuyiWorkbenchShell({
  breadcrumb,
  workbenchName,
  title,
  onBack,
  headerActions,
  toolbar,
  sidebarHeader,
  sidebarContent,
  sidebarFooter,
  statusLeft,
  statusCenter,
  statusRight,
  children,
}: RuyiWorkbenchShellProps) {
  return (
    <div className="relative flex h-full min-h-0 bg-gray-50 text-gray-900">
      {/* 主工作区 */}
      <section className="flex min-w-0 flex-1 flex-col border-r border-gray-200 bg-white">
        {/* 顶部 56px：返回 + 面包屑/标题 + 业务操作 */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-200"
              title={`返回${breadcrumb}`}
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <button
                  type="button"
                  onClick={onBack}
                  className="transition-colors hover:text-theme-700 hover:underline"
                >
                  {breadcrumb}
                </button>
                <span className="text-gray-300">/</span>
                <span className="text-gray-600">{workbenchName}</span>
              </div>
              <div className="truncate text-sm font-semibold text-gray-900">{title}</div>
            </div>
          </div>
          {headerActions && <div className="flex shrink-0 items-center gap-2">{headerActions}</div>}
        </header>

        {/* 工具栏（可选） */}
        {toolbar && (
          <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-2">{toolbar}</div>
        )}

        {/* 主内容：独立滚动 */}
        <div className="scrollbar-hover relative min-h-0 flex-1 overflow-y-auto">{children}</div>

        {/* 底部三栏状态条 */}
        <footer className="grid grid-cols-3 items-center gap-3 border-t border-gray-100 bg-gray-50 px-4 py-2">
          <div className="truncate text-xs text-gray-500">{statusLeft}</div>
          <div className="truncate text-center text-[11px] text-gray-400">{statusCenter ?? '内容AI辅助生成，请谨慎识别'}</div>
          <div className="truncate text-right text-xs text-gray-500">{statusRight}</div>
        </footer>
      </section>

      {/* 右侧栏：桌面 320px / 中等 300px，独立滚动，底部主操作 */}
      <aside className="flex h-full w-80 max-w-[320px] flex-shrink-0 flex-col border-l border-gray-200 bg-gray-50 max-lg:w-[300px]">
        <div className="border-b border-gray-200 bg-white px-4 pb-3 pt-4">{sidebarHeader}</div>
        <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto p-4">{sidebarContent}</div>
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">{sidebarFooter}</div>
      </aside>
    </div>
  );
}
