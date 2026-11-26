import { Share2, Star, TriangleAlert } from 'lucide-react';

interface ContactMoreMenuProps {
  open: boolean;
  starred: boolean;
  onClose: () => void;
  onToggleStar: () => void;
  onShare: () => void;
  onReport: () => void;
}

/** 名片右上角「...」菜单：分享 / 星标 / 举报（参考图手机菜单；分享与举报无真实能力） */
export default function ContactMoreMenu({ open, starred, onClose, onToggleStar, onShare, onReport }: ContactMoreMenuProps) {
  if (!open) return null;
  const itemClassName = 'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-[var(--ui-text-body)] transition hover:bg-gray-50 dark:hover:bg-gray-800';
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div
        role="menu"
        aria-label="联系人更多操作"
        className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-900"
      >
        <button type="button" role="menuitem" onClick={onShare} className={itemClassName}>
          <Share2 size={16} className="shrink-0 text-[var(--ui-text-weak)]" /> 分享
        </button>
        <button type="button" role="menuitem" onClick={onToggleStar} className={itemClassName}>
          <Star size={16} className={`shrink-0 ${starred ? 'fill-amber-400 text-amber-400' : 'text-[var(--ui-text-weak)]'}`} />
          {starred ? '取消星标' : '设为星标联系人'}
        </button>
        <button type="button" role="menuitem" onClick={onReport} className={itemClassName}>
          <TriangleAlert size={16} className="shrink-0 text-[var(--ui-text-weak)]" /> 举报该用户
        </button>
      </div>
    </>
  );
}
