import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Copy, Minus, Square, X } from 'lucide-react';
import Modal from './Modal';

interface TaskWindowShellProps {
  title: string;
  children: ReactNode;
  isDirty: boolean;
  submitLabel: string;
  submitDisabled?: boolean;
  submitting?: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

export default function TaskWindowShell({ title, children, isDirty, submitLabel, submitDisabled = false, submitting = false, onSubmit, onClose }: TaskWindowShellProps) {
  const [confirmClose, setConfirmClose] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const requestClose = useCallback(() => { if (isDirty) setConfirmClose(true); else onClose(); }, [isDirty, onClose]);

  useEffect(() => { document.title = `${title} - i吉祥`; }, [title]);
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !confirmClose) requestClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmClose, requestClose]);

  return (
    <div className="task-window-stage text-[#303133] dark:text-[#e5eaf3]">
      <section className={`task-window-frame ${maximized ? 'task-window-frame--maximized' : ''}`} aria-label={`${title}任务窗口`}>
        <header className="flex h-10 shrink-0 items-center border-b border-[#dcdfe6] bg-[#f7f7f7] pl-3 dark:border-[#414243] dark:bg-[#202020]">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-theme-600 text-[11px] font-semibold text-white" aria-hidden="true">吉</span>
            <h1 className="truncate text-sm font-medium">{title}</h1>
          </div>
          <div className="flex h-full items-stretch" aria-label="窗口控制">
            <button type="button" disabled title="最小化由真实客户端提供" className="flex w-11 cursor-not-allowed items-center justify-center text-[#606266] opacity-45 dark:text-[#cfd3dc]"><Minus size={14} /></button>
            <button type="button" onClick={() => setMaximized((value) => !value)} title={maximized ? '还原窗口' : '最大化窗口'} aria-pressed={maximized} className="flex w-11 items-center justify-center text-[#606266] hover:bg-[#e7e7e7] dark:text-[#cfd3dc] dark:hover:bg-[#343434]">{maximized ? <Copy size={13} /> : <Square size={12} />}</button>
            <button type="button" onClick={requestClose} title="关闭窗口" className="flex w-11 items-center justify-center text-[#606266] hover:bg-[#c42b1c] hover:text-white dark:text-[#cfd3dc]"><X size={16} /></button>
          </div>
        </header>
        <main className="min-h-0 flex-1 bg-[#f2f4f7] p-2 dark:bg-[#262727]">{children}</main>
        <footer className="flex h-16 shrink-0 items-center justify-end gap-3 border-t border-[#e4e7ed] bg-white px-6 dark:border-[#414243] dark:bg-[#141414]">
          <button type="button" onClick={requestClose} className="h-9 min-w-20 rounded border border-[#dcdfe6] bg-white px-5 text-sm font-medium text-[#303133] hover:bg-[#f5f7fa] dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800">取消</button>
          <button type="button" onClick={onSubmit} disabled={submitDisabled || submitting} className="h-9 min-w-20 rounded bg-theme-600 px-5 text-sm font-semibold text-white hover:bg-theme-700 disabled:cursor-not-allowed disabled:bg-gray-300">{submitting ? '提交中…' : submitLabel}</button>
        </footer>
      </section>
      <Modal open={confirmClose} title="放弃未保存的修改？" onClose={() => setConfirmClose(false)} footer={<div className="flex justify-end gap-3"><button type="button" onClick={() => setConfirmClose(false)} className="h-9 rounded border border-gray-200 px-5 text-sm text-gray-600">继续编辑</button><button type="button" onClick={onClose} className="h-9 rounded bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700">放弃修改</button></div>}>
        <p className="px-6 py-5 text-sm leading-6 text-gray-600 dark:text-gray-300">当前内容尚未保存，关闭窗口后本次修改将丢失。</p>
      </Modal>
    </div>
  );
}

