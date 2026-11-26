import { CONTACT_SCOPES, type ContactScope } from '@/constants/contactScopes';

interface ContactCategoryNavProps {
  company: string;
  /** 企业方块标识字（取组织根名称首字，如 吉祥航空 → 吉） */
  companyMark: string;
  scope: ContactScope;
  onScopeChange: (scope: ContactScope) => void;
  onManage: () => void;
}

/** 通讯录左栏：栏标题 + 企业头 + 分类菜单 */
export default function ContactCategoryNav({ company, companyMark, scope, onScopeChange, onManage }: ContactCategoryNavProps) {
  return (
    <aside className="flex w-[264px] min-w-[240px] shrink-0 flex-col overflow-hidden border-r border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="shrink-0 px-5 pb-3 pt-5">
        <h1 className="text-xl font-semibold text-[var(--ui-text-title)]">通讯录</h1>
      </div>

      <div className="shrink-0 px-3 pb-4">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #c9578c, #8f2a63)' }}
            aria-hidden="true"
          >
            {companyMark}
          </span>
          <span className="min-w-0 flex-1 truncate text-base font-semibold text-[var(--ui-text-title)]" title={company}>{company}</span>
          <button type="button" onClick={onManage} className="shrink-0 text-sm font-medium text-theme-600 hover:underline dark:text-theme-400">管理</button>
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-4" aria-label="通讯录分类">
        {CONTACT_SCOPES.map(({ key, label, icon: Icon }) => {
          const active = scope === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onScopeChange(key)}
              aria-current={active ? 'true' : undefined}
              className={`flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-left text-base transition ${active
                ? 'bg-theme-50 font-medium text-theme-600 dark:bg-theme-900/25 dark:text-theme-300'
                : 'text-[var(--ui-text-body)] hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <Icon size={17} className={`shrink-0 ${active ? 'text-theme-600 dark:text-theme-300' : 'text-[var(--ui-text-weak)]'}`} />
              <span className="min-w-0 flex-1 truncate">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
