import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { contactAvatar, getContact } from '@/data/im/contacts';
import type { Contact } from '@/data/im/types';

export function ImToast({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-black/75 px-4 py-1.5 text-[13px] text-white">
      {text}
    </div>
  );
}

/** IM 子页头部：深链接也能安全返回消息根页 */
export function ImPageHeader({ title, right, backTo = '/app/messages' }: { title: string; right?: ReactNode; backTo?: string }) {
  const navigate = useNavigate();
  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(backTo);
  };
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#ebedf0] bg-white px-2">
      <button
        onClick={goBack}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[#323233] transition-colors hover:bg-[#f2f3f5]"
        aria-label="返回"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="min-w-0 flex-1 truncate px-2 text-center text-[16px] font-medium text-[#323233]">{title}</div>
      <div className="flex w-9 shrink-0 items-center justify-center">{right}</div>
    </header>
  );
}

/** 头像：外链失败时降级为文字块，保证 360~430px 下不破图 */
export function ImAvatar({ id, name, size = 44, isGroup = false, icon }: { id?: string; name: string; size?: number; isGroup?: boolean; icon?: string }) {
  const [failed, setFailed] = useState(false);
  const src = isGroup
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=ebedf0&textColor=323233`
    : contactAvatar(getContact(id));
  if (icon || failed) {
    return (
      <div
        className="grid shrink-0 place-items-center rounded-[14px] bg-[#f2f3f5] text-[#646566]"
        style={{ width: size, height: size, fontSize: Math.max(14, size * 0.42) }}
        aria-label={name}
      >
        {icon ?? name.slice(0, 1)}
      </div>
    );
  }
  return <img src={src} alt={name} onError={() => setFailed(true)} className="shrink-0 rounded-[14px] object-cover" style={{ width: size, height: size }} />;
}

export function StatusDot({ status }: { status?: Contact['status'] }) {
  const color = status === 'online' ? '#67c23a' : status === 'busy' ? '#f53a71' : status === 'away' ? '#f5bc0e' : '#c8c9cc';
  return <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />;
}

export function ImSheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-[430px] overflow-y-auto rounded-t-2xl bg-white pb-[env(safe-area-inset-bottom)]" onClick={(e) => e.stopPropagation()}>
        {title && <div className="border-b border-[#ebedf0] px-4 py-3 text-center text-[15px] font-medium text-[#323233]">{title}</div>}
        {children}
      </div>
    </div>
  );
}

/** 轻量确认弹窗：标题 / 摘要 / 取消 / 确认 */
export function ImConfirm({ open, title, desc, confirmText = '确认', danger, onCancel, onConfirm }: {
  open: boolean;
  title: string;
  desc: string;
  confirmText?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ImSheet open={open} onClose={onCancel}>
      <div className="p-5 text-center">
        <div className="text-[16px] font-medium text-[#323233]">{title}</div>
        <div className="mt-2 text-[13px] leading-5 text-[#646566]">{desc}</div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="rounded-xl bg-[#f2f3f5] py-2.5 text-[14px] text-[#323233]">取消</button>
          <button onClick={onConfirm} className={`rounded-xl py-2.5 text-[14px] text-white ${danger ? 'bg-[#f35f5f]' : 'bg-[#f53a71]'}`}>{confirmText}</button>
        </div>
      </div>
    </ImSheet>
  );
}

export function ImEmpty({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 py-16 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#f2f3f5] text-[28px] text-[#c8c9cc]">✉</div>
      <div className="text-[15px] text-[#646566]">{title}</div>
      {desc && <div className="mt-1 text-[12px] leading-5 text-[#969799]">{desc}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ImSection({ label, children, extra }: { label: string; children: ReactNode; extra?: ReactNode }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between px-4 pb-1.5 text-[12px] text-[#969799]">
        <span>{label}</span>
        {extra}
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

export function ImRow({ icon, label, value, onClick, danger, right }: {
  icon?: ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  right?: ReactNode;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 px-4 py-3 text-left active:bg-[#f2f3f5]">
      {icon && <span className={danger ? 'text-[#f35f5f]' : 'text-[#646566]'}>{icon}</span>}
      <span className={`min-w-0 flex-1 truncate text-[14px] ${danger ? 'text-[#f35f5f]' : 'text-[#323233]'}`}>{label}</span>
      {value && <span className="max-w-[55%] shrink-0 truncate text-[13px] text-[#969799]">{value}</span>}
      {right ?? <ChevronRight size={16} className="shrink-0 text-[#c8c9cc]" />}
    </button>
  );
}

export function ImToggleRow({ icon, label, checked, onChange }: { icon?: ReactNode; label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="flex w-full items-center justify-between px-4 py-3">
      <span className="flex items-center gap-2 text-[14px] text-[#323233]">
        {icon && <span className="text-[#646566]">{icon}</span>}
        {label}
      </span>
      <span className={`relative h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${checked ? 'bg-[#f53a71]' : 'bg-[#dcdce0]'}`}>
        <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </span>
    </button>
  );
}

export function ImChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1 text-[13px] transition-colors ${active ? 'bg-[#f53a71] text-white' : 'bg-[#f2f3f5] text-[#646566]'}`}
    >
      {label}
    </button>
  );
}

export function ImSearchBar({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-full bg-[#f2f3f5] px-3">
      <Search size={16} className="shrink-0 text-[#969799]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-[#323233] outline-none placeholder:text-[#c8c9cc]"
      />
      {value && <button onClick={() => onChange('')} className="shrink-0 text-[13px] text-[#969799]">清除</button>}
    </div>
  );
}

export function ImCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-3 mt-3 rounded-2xl bg-white ${className}`}>{children}</div>;
}

export function ImPrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-[#f53a71] py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#c8c9cc]"
    >
      {children}
    </button>
  );
}
