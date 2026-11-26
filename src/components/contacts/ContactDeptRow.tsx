import { Network } from 'lucide-react';
import type { ContactOrgNode } from '@/data/contactDirectory';
import { countContactOrgMembers } from '@/data/contactDirectory';

interface ContactDeptRowProps {
  node: ContactOrgNode;
  onEnter: (node: ContactOrgNode) => void;
}

/** 通讯录部门行：组织图标 + 部门名(直属人数) + 下级入口（参考图市场部形态） */
export default function ContactDeptRow({ node, onEnter }: ContactDeptRowProps) {
  const count = countContactOrgMembers(node);
  return (
    <button
      type="button"
      onClick={() => onEnter(node)}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-theme-50 text-theme-600 dark:bg-theme-900/30 dark:text-theme-300">
        <Network size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-semibold text-[var(--ui-text-title)]">{node.name}({count})</span>
      </span>
      <span className="shrink-0 text-sm font-medium text-theme-600 dark:text-theme-400">下级</span>
    </button>
  );
}
