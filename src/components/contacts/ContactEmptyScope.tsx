import type { LucideIcon } from 'lucide-react';

interface ContactEmptyScopeProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** 无真实数据源的能力，统一标注「暂未开放」 */
  showSoon?: boolean;
}

/** 通讯录分类空态：外部联系人、服务台等无真实数据源的分区共用 */
export default function ContactEmptyScope({ icon: Icon, title, description, showSoon = false }: ContactEmptyScopeProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-[var(--ui-text-weak)] dark:bg-gray-800">
        <Icon size={24} />
      </span>
      <p className="mt-4 text-base font-medium text-[var(--ui-text-title)]">{title}</p>
      {description ? <p className="mt-1.5 max-w-[280px] text-sm leading-relaxed text-[var(--ui-text-weak)]">{description}</p> : null}
      {showSoon ? (
        <span className="mt-3 inline-flex rounded-full border border-gray-200 px-2.5 py-0.5 text-[11px] text-[var(--ui-text-weak)] dark:border-gray-700">暂未开放</span>
      ) : null}
    </div>
  );
}
