import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleHelp, Maximize2, MessageCircleQuestion, Minus, Square, X } from 'lucide-react';
import FeedbackComposer from './FeedbackComposer';
import {
  captureFeedbackPageContext,
  createFeedbackRequestId,
  type FeedbackPageContext,
  type FeedbackRecord,
} from '../data/feedback';

type ClientWindowBarProps = {
  /** 当前页面标题（反馈上下文采集用） */
  pageTitle: string;
  /** macOS 演示模式：交通灯在左、帮助在工具栏右侧 */
  platform?: 'windows' | 'macos';
};

/**
 * PC 客户端原生标题栏模拟：
 * - 右侧：帮助入口 + 分隔线 + 最小化/最大化/关闭（仅提示原生能力，不真实关闭浏览器）；
 * - 帮助点击立即采集当前页面上下文，打开统一入口面板（问如意助手/反馈当前页面/查看我的反馈）。
 */
export default function ClientWindowBar({ pageTitle, platform = 'windows' }: ClientWindowBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [submitted, setSubmitted] = useState<FeedbackRecord | null>(null);
  /** 打开面板瞬间采集的上下文（点击时立即采集，而非打开表单后） */
  const [captured, setCaptured] = useState<FeedbackPageContext | null>(null);
  const requestIdRef = useRef(createFeedbackRequestId('client-bar'));

  // 路由切换时关闭面板，避免上下文与页面错位
  useEffect(() => {
    setPanelOpen(false);
    setComposerOpen(false);
    setSubmitted(null);
  }, [location.pathname]);

  const openPanel = () => {
    setSubmitted(null);
    setCaptured(captureFeedbackPageContext(pageTitle, `${location.pathname}${location.search}`, 'PC_CLIENT', platform === 'macos' ? 'macos' : 'windows'));
    setPanelOpen(true);
  };

  const openComposer = () => {
    setPanelOpen(false);
    setComposerOpen(true);
  };

  const handleSubmit = (record: FeedbackRecord) => {
    setSubmitted(record);
    setComposerOpen(false);
    requestIdRef.current = createFeedbackRequestId('client-bar');
  };

  return (
    <div className="relative flex h-9 shrink-0 items-center gap-2 px-3 select-none">
      {/* macOS 演示：左侧交通灯 */}
      {platform === 'macos' && (
        <div className="flex items-center gap-2">
          <button type="button" title="关闭（演示）" onClick={() => window.alert('演示环境：关闭窗口能力由真实客户端提供')} className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <button type="button" title="最小化（演示）" onClick={() => window.alert('演示环境：最小化能力由真实客户端提供')} className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <button type="button" title="最大化（演示）" onClick={() => window.alert('演示环境：最大化能力由真实客户端提供')} className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
      )}

      {/* 左侧占位（标题栏透明融入页面） */}
      <div className="min-w-0 flex-1" />

      {/* 帮助入口（立即采集当前页面） */}
      <button
        type="button"
        onClick={openPanel}
        title="帮助与反馈"
        data-requirement-id="client-window-help"
        className="flex h-6 w-6 items-center justify-center rounded text-[var(--ui-text-body)] transition-colors hover:bg-[var(--ui-surface-selected)] hover:text-[var(--ui-brand-primary)]"
      >
        <CircleHelp size={15} />
      </button>

      <div className="mx-1 h-4 w-px bg-[var(--ui-border)]" />

      {/* 窗口控制（Windows 右侧布局；macOS 已在左侧交通灯） */}
      {platform === 'windows' && (
        <div className="flex items-center">
          <button type="button" title="最小化（演示）" onClick={() => window.alert('演示环境：最小化能力由真实客户端提供')} className="flex h-6 w-8 items-center justify-center text-[var(--ui-text-body)] hover:bg-[var(--ui-surface-selected)]"><Minus size={13} /></button>
          <button type="button" title="最大化（演示）" onClick={() => window.alert('演示环境：最大化能力由真实客户端提供')} className="flex h-6 w-8 items-center justify-center text-[var(--ui-text-body)] hover:bg-[var(--ui-surface-selected)]"><Square size={11} /></button>
          <button type="button" title="关闭（演示）" onClick={() => window.alert('演示环境：关闭窗口能力由真实客户端提供')} className="flex h-6 w-8 items-center justify-center text-[var(--ui-text-body)] hover:bg-red-500 hover:text-white"><X size={14} /></button>
        </div>
      )}

      {/* 统一入口面板 */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 z-[70]" onClick={() => setPanelOpen(false)} />
          <div
            role="dialog"
            aria-label="帮助与反馈"
            data-requirement-id="client-help-panel"
            className="absolute right-3 top-10 z-[71] w-64 overflow-hidden rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-card)] shadow-xl"
          >
            <button type="button" onClick={() => { setPanelOpen(false); navigate('/pc_client?tab=assistant'); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[var(--ui-text-body)] hover:bg-[var(--ui-surface-selected)]">
              <MessageCircleQuestion size={16} className="text-[var(--ui-brand-primary)]" />
              <span className="flex-1">问如意助手</span>
            </button>
            <button type="button" onClick={openComposer} className="flex w-full items-center gap-3 border-t border-[var(--ui-border)] px-4 py-3 text-left text-sm text-[var(--ui-text-body)] hover:bg-[var(--ui-surface-selected)]">
              <CircleHelp size={16} className="text-[var(--ui-brand-primary)]" />
              <span className="flex-1">反馈当前页面</span>
              <span className="max-w-[110px] truncate text-[10px] text-[var(--ui-text-weak)]">{captured?.path}</span>
            </button>
            <button type="button" onClick={() => { setPanelOpen(false); navigate('/pc_client/help-feedback'); }} className="flex w-full items-center gap-3 border-t border-[var(--ui-border)] px-4 py-3 text-left text-sm text-[var(--ui-text-body)] hover:bg-[var(--ui-surface-selected)]">
              <Maximize2 size={16} className="text-[var(--ui-brand-primary)]" />
              <span className="flex-1">查看我的反馈</span>
            </button>
          </div>
        </>
      )}

      {/* 反馈弹窗（不跳转，保留当前页面） */}
      {composerOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setComposerOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-label="反馈当前页面" className="flex max-h-[86vh] w-[min(760px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">反馈当前页面</h2>
                <p className="mt-0.5 text-xs text-gray-400">页面和客户端环境将自动随反馈提交</p>
              </div>
              <button type="button" onClick={() => setComposerOpen(false)} className="ml-auto rounded-md p-1.5 text-gray-400 hover:bg-gray-100"><X size={19} /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <FeedbackComposer
                source="PC客户端全局入口"
                clientKind="PC_CLIENT"
                pageContext={captured}
                onCancel={() => setComposerOpen(false)}
                onSubmitted={handleSubmit}
              />
            </div>
          </div>
        </div>
      )}

      {/* 提交成功提示 */}
      {submitted && (
        <div className="fixed inset-0 z-[81] flex items-center justify-center bg-black/40 p-4">
          <div className="rounded-lg border border-emerald-200 bg-white p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-emerald-800">反馈已提交</h3>
            <p className="mt-2 text-sm leading-6 text-emerald-700">我们已收到你的反馈（{submitted.feedbackNo}），可在“我的反馈”中查看处理进度。</p>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setSubmitted(null)} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">继续浏览</button>
              <button type="button" onClick={() => navigate(`/pc_client/help-feedback/${submitted.id}`)} className="rounded-md bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700">查看反馈详情</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
