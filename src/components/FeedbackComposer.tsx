import { useRef, useState } from 'react';
import { FileText, MapPin, Paperclip, Send, X } from 'lucide-react';
import {
  createFeedback,
  createFeedbackRequestId,
  type FeedbackAttachment,
  type FeedbackCategory,
  type FeedbackRecord,
  type FeedbackPageContext,
  type FeedbackSource,
} from '../data/feedback';

const categories: FeedbackCategory[] = ['功能异常', '使用咨询', '体验建议', '其他'];

type FeedbackComposerProps = {
  source: FeedbackSource;
  initialCategory?: FeedbackCategory;
  initialContent?: string;
  conversationId?: string;
  pageContext?: FeedbackPageContext | null;
  compact?: boolean;
  onCancel?: () => void;
  onSubmitted: (record: FeedbackRecord) => void;
};

export default function FeedbackComposer({
  source,
  initialCategory = '功能异常',
  initialContent = '',
  conversationId,
  pageContext = null,
  compact = false,
  onCancel,
  onSubmitted,
}: FeedbackComposerProps) {
  const [category, setCategory] = useState<FeedbackCategory>(initialCategory);
  const [content, setContent] = useState(initialContent);
  const [attachments, setAttachments] = useState<FeedbackAttachment[]>([]);
  const [error, setError] = useState('');
  const [relatedPage, setRelatedPage] = useState<FeedbackPageContext | null>(pageContext);
  const [featureEntry, setFeatureEntry] = useState('');
  const requestId = useRef(createFeedbackRequestId(source));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map((file, index) => ({
      id: `attachment-${Date.now()}-${index}`,
      name: file.name,
      size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`,
    }));
    setAttachments(current => [...current, ...next]);
  };

  const submit = () => {
    if (!content.trim()) {
      setError('请填写具体的反馈内容');
      return;
    }
    try {
      const record = createFeedback({
        category,
        content,
        attachments,
        source,
        clientRequestId: requestId.current,
        conversationId,
        pageContext: relatedPage,
        featureEntry,
      });
      setError('');
      onSubmitted(record);
    } catch {
      setError('提交失败，当前内容已保留，请重试');
    }
  };

  return (
    <div className={compact ? 'overflow-hidden rounded-lg border border-theme-100 bg-white' : 'space-y-5'}>
      {compact && (
        <div className="flex items-center gap-2 border-b border-theme-100 bg-theme-50 px-4 py-3">
          <FileText size={16} className="text-theme-600" />
          <span className="text-sm font-semibold text-gray-900">反馈表单</span>
          <span className="ml-auto text-xs text-gray-400">提交前可修改</span>
        </div>
      )}
      <div className={compact ? 'space-y-4 p-4' : 'space-y-5'}>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">相关页面</label>
          {relatedPage ? (
            <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-theme-500" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-gray-700">{relatedPage.title}</div>
                <div className="mt-0.5 truncate text-xs text-gray-400" title={relatedPage.path}>{relatedPage.path}</div>
              </div>
              <button type="button" title="移除页面关联" onClick={() => setRelatedPage(null)} className="rounded p-1 text-gray-400 hover:bg-white hover:text-red-500"><X size={14} /></button>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 px-3 py-2.5 text-sm text-gray-400">未关联具体页面</div>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">功能入口</label>
          <input
            type="text"
            value={featureEntry}
            onChange={event => setFeatureEntry(event.target.value)}
            placeholder="请填写反馈对应的功能入口，如：工作台-应用管理-卡片配置"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-theme-400 focus:ring-2 focus:ring-theme-100"
          />
          <p className="mt-1 text-xs text-gray-400">选填。填写后便于快速定位问题入口，与系统记录的相关页面互为补充。</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">反馈类型</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${category === item ? 'border-theme-500 bg-theme-50 font-medium text-theme-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">反馈内容 <span className="text-red-500">*</span></label>
          <textarea
            value={content}
            onChange={event => { setContent(event.target.value); setError(''); }}
            rows={compact ? 4 : 7}
            placeholder="请描述遇到的问题、发生场景或希望改进的地方"
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm leading-6 text-gray-800 outline-none transition focus:border-theme-400 focus:ring-2 focus:ring-theme-100"
          />
          <div className="mt-1 text-right text-xs text-gray-400">{content.length}/1000</div>
        </div>
        <div>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={event => handleFiles(event.target.files)} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            <Paperclip size={15} /> 添加图片或附件
          </button>
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {attachments.map(item => (
                <div key={item.id} className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <FileText size={14} className="text-gray-400" />
                  <span className="min-w-0 flex-1 truncate">{item.name}</span>
                  <span className="text-xs text-gray-400">{item.size}</span>
                  <button type="button" title="移除附件" onClick={() => setAttachments(current => current.filter(entry => entry.id !== item.id))} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
      <div className={`flex justify-end gap-2 ${compact ? 'border-t border-gray-100 bg-gray-50 px-4 py-3' : ''}`}>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>}
        <button type="button" onClick={submit} className="inline-flex items-center gap-1.5 rounded-md bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700">
          <Send size={15} /> 提交反馈
        </button>
      </div>
    </div>
  );
}
