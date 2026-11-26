import { useEffect, useRef, type ReactNode } from 'react';

interface PopoverProps { open: boolean; children: ReactNode; onClose: () => void; className?: string; }

export default function Popover({ open, children, onClose, className = '' }: PopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) onClose(); };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('pointerdown', onPointerDown); window.removeEventListener('keydown', onKeyDown); };
  }, [onClose, open]);
  if (!open) return null;
  return <div ref={rootRef} role="dialog" className={className}>{children}</div>;
}

