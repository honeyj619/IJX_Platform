import { Fragment, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ContactOrgNode } from '@/data/contactDirectory';

interface ContactBrowserProps {
  title: string;
  /** 层级路径（面包屑）：组织内联系人分类才传，其余分类不显示 */
  breadcrumb?: ContactOrgNode[];
  onNavigateCrumb: (nodeId: string) => void;
  footerNote?: string;
  children: ReactNode;
}

/** 通讯录主内容区：固定顶栏（标题 + 面包屑）+ 独立滚动的组织/人员列表 */
export default function ContactBrowser({ title, breadcrumb, onNavigateCrumb, footerNote, children }: ContactBrowserProps) {
  const crumbs = breadcrumb ?? [];
  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white dark:bg-gray-900">
      <header className="shrink-0 border-b border-gray-100 px-5 pb-3 pt-4 dark:border-gray-800">
        <h2 className="min-w-0 truncate text-lg font-semibold text-[var(--ui-text-title)]">{title}</h2>
        {crumbs.length > 0 ? (
          <div className="mt-2 flex min-w-0 items-center gap-1 text-sm">
            {crumbs.map((node, index) => {
              const last = index === crumbs.length - 1;
              return (
                <Fragment key={node.id}>
                  {index > 0 ? <ChevronRight size={12} className="shrink-0 text-[var(--ui-text-weak)]" aria-hidden="true" /> : null}
                  {last ? (
                    <span className="min-w-0 truncate font-medium text-[var(--ui-text-title)]">{node.name}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateCrumb(node.id)}
                      className="min-w-0 shrink-0 truncate text-theme-600 hover:underline dark:text-theme-400"
                    >{node.name}</button>
                  )}
                </Fragment>
              );
            })}
          </div>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">{children}</div>

      {footerNote ? (
        <p className="shrink-0 border-t border-gray-100 px-4 py-1.5 text-center text-[10px] text-[var(--ui-text-weak)] dark:border-gray-800">{footerNote}</p>
      ) : null}
    </section>
  );
}
