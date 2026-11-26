import { Star } from 'lucide-react';
import type { ContactPerson } from '@/data/contactDirectory';
import ContactAvatar from './ContactAvatar';

interface ContactPersonRowProps {
  person: ContactPerson;
  active?: boolean;
  starred?: boolean;
  onSelect: (person: ContactPerson) => void;
}

/** 通讯录人员行：渐变头像 + 状态点 + 姓名 + 标签 + 「职位 | 签名」 */
export default function ContactPersonRow({ person, active = false, starred = false, onSelect }: ContactPersonRowProps) {
  const secondary = [person.title, person.signature].filter(Boolean).join(' | ');
  return (
    <button
      type="button"
      onClick={() => onSelect(person)}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${active
        ? 'bg-gray-50 dark:bg-gray-800'
        : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
    >
      <ContactAvatar name={person.name} status={person.status} showStatus size={44} />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-base font-semibold text-[var(--ui-text-title)]">{person.name}</span>
          {person.badges?.map((badge) => (
            <span
              key={badge}
              className="inline-flex h-5 shrink-0 items-center rounded bg-theme-50 px-1.5 text-[11px] font-medium text-theme-600 dark:bg-theme-900/30 dark:text-theme-300"
            >
              {badge}
            </span>
          ))}
          {starred ? <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" aria-label="星标联系人" /> : null}
        </span>
        {secondary ? (
          <span className="mt-0.5 block truncate text-sm text-[var(--ui-text-weak)]">{secondary}</span>
        ) : null}
      </span>
    </button>
  );
}
