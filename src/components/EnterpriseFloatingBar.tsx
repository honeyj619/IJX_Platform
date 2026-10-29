import { useState } from 'react';
import { BarChart3, CircleHelp, Mail, MessageSquare, MoreHorizontal, Smartphone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FeedbackComposer from './FeedbackComposer';
import { createFeedbackPageContext } from '../utils/feedbackPageContext';
import { RUYI_ASSISTANT_AVATAR } from '../data/people';
import type { FeedbackRecord } from '../data/feedback';

interface EnterpriseFloatingBarProps {
  /** 反馈表单反显的来源页面上下文（标题+路径） */
  pageContext: { title: string; path: string };
  /** 提交成功回调（默认展示提交成功态） */
  onFeedbackSubmitted?: (record: FeedbackRecord) => void;
}

/**
 * 企业门户右侧固定悬浮栏（通用组件）：
 * IT提报 / 快捷入口 / 帮助与反馈（弹框）/ 如意助手。
 * 企业门户 tab 与 PC Web 门户（含通讯录页）共用。
 */
export default function EnterpriseFloatingBar({ pageContext, onFeedbackSubmitted }: EnterpriseFloatingBarProps) {
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [submitted, setSubmitted] = useState<FeedbackRecord | null>(null);

  const openFeedback = () => {
    setSubmitted(null);
    setFeedbackOpen(true);
  };

  const handleSubmit = (record: FeedbackRecord) => {
    if (onFeedbackSubmitted) {
      onFeedbackSubmitted(record);
      setFeedbackOpen(false);
      return;
    }
    setSubmitted(record);
  };

  return (
    <>
      <div className="fixed right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col overflow-hidden rounded-l-xl bg-white shadow-lg dark:bg-gray-800">
        {/* IT提报 */}
        <div className="bg-pink-700 p-2 text-white">
          <div className="flex flex-col items-center gap-1">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-white/20">
              <MessageSquare size={14} />
            </div>
            <span className="text-xs font-medium">IT提报</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 p-2">
          <button type="button" onClick={openFeedback} title="帮助与反馈" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" data-requirement-id="custom-20261029-002">
            <CircleHelp size={18} />
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" title="更多">
            <MoreHorizontal size={18} />
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" title="邮件">
            <Mail size={18} />
          </button>
          <button type="button" onClick={() => navigate('/download')} title="客户端下载" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
            <Smartphone size={18} />
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700" title="数据看板">
            <BarChart3 size={18} />
          </button>
        </div>

        {/* 如意助手悬浮 */}
        <div className="border-t border-gray-100 p-2 dark:border-gray-700">
          <div className="relative flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-cyan-400 to-blue-500">
              <img src={RUYI_ASSISTANT_AVATAR} alt="如意助手" className="h-full w-full" />
            </div>
            <span className="mt-0.5 text-[10px] text-pink-500">如意助手</span>
          </div>
        </div>
      </div>

      {/* 帮助与反馈弹框（内容与 client 一致） */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/30" onMouseDown={event => { if (event.target === event.currentTarget) setFeedbackOpen(false); }}>
          <aside className="flex h-full w-[520px] flex-col bg-white shadow-2xl">
            <div className="flex items-center border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">帮助与反馈</h2>
                <p className="mt-1 text-xs text-gray-400">页面和客户端环境将自动随反馈提交</p>
              </div>
              <button type="button" onClick={() => setFeedbackOpen(false)} className="ml-auto rounded-md p-1.5 text-gray-400 hover:bg-gray-100"><X size={19} /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {submitted ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                  <h3 className="text-sm font-semibold text-emerald-800">反馈已提交</h3>
                  <p className="mt-2 text-sm leading-6 text-emerald-700">我们已收到你的反馈（{submitted.feedbackNo}），可在“我的反馈”中查看处理进度。</p>
                  <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => navigate(`/pc_client/help-feedback/${submitted.id}`)} className="rounded-md bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700">查看我的反馈</button>
                    <button type="button" onClick={() => setFeedbackOpen(false)} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">关闭</button>
                  </div>
                </div>
              ) : (
                <FeedbackComposer
                  source="企业门户"
                  pageContext={createFeedbackPageContext(pageContext.title, pageContext.path)}
                  onCancel={() => setFeedbackOpen(false)}
                  onSubmitted={handleSubmit}
                />
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
