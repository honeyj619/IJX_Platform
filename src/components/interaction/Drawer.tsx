import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps { open: boolean; title: string; children: ReactNode; onClose: () => void; footer?: ReactNode; widthClassName?: string; }

export default function Drawer({ open, title, children, onClose, footer, widthClassName = 'w-[480px]' }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    window.setTimeout(() => drawerRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/25" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <aside ref={drawerRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`ml-auto flex h-full max-w-full ${widthClassName} flex-col bg-white shadow-2xl outline-none dark:bg-gray-900`}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800"><h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2><button type="button" onClick={onClose} title="关闭" className="rounded p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><X size={18} /></button></div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="shrink-0 border-t border-gray-100 px-6 py-4 dark:border-gray-800">{footer}</div>}
      </aside>
    </div>
  );
}
