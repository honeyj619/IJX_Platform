import { useMemo, useRef, useState } from "react";
import { FileText, X } from "lucide-react";
import {
  documentTemplates,
  templateCategories,
  lengthOptions,
  documentAttachmentExtensions,
  type RuyiDocumentTemplate,
} from "../../../data/ruyiToolPanel";

/**
 * 如意公文 / 如意PPT 能力面板（full / compact 双模式）。
 * 从旧版 RuYiZone 对话插件恢复（2026-11-12），V3 收编进统一能力面板体系：
 * - 状态完全受控（草稿由父层按能力分槽持有，切换能力不丢草稿）
 * - 提交由统一入口 RuyiCapabilityPanel 编排，本组件只产出面板 UI
 */

export interface DocumentPanelState {
  docType: string;
  docLength: string;
  docTitle: string;
  /** V3：公文内容要求（旧版恢复项） */
  docRequirement: string;
  attachments: string[];
  selectedTemplate: string;
}

export function createInitialDocumentPanelState(): DocumentPanelState {
  return {
    docType: "通知",
    docLength: "600-1200",
    docTitle: "",
    docRequirement: "",
    attachments: [],
    selectedTemplate: documentTemplates[0]?.id ?? "official-red",
  };
}

interface RuyiDocumentPanelProps {
  variant: "compact" | "full";
  documentState: DocumentPanelState;
  onDocumentChange: (patch: Partial<DocumentPanelState>) => void;
}

export default function RuyiDocumentPanel({ documentState, onDocumentChange }: RuyiDocumentPanelProps) {
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const [docPreviewId, setDocPreviewId] = useState<string | null>(null);

  const filteredDocumentTemplates = useMemo(
    () => documentTemplates.filter((t) => t.category === documentState.docType),
    [documentState.docType],
  );

  // ---------- 公文附件上传 ----------
  const uploadDoc = (selected: FileList | null) => {
    if (!selected?.length) return;
    const names = Array.from(selected).map((f) => f.name);
    const invalid = names.find((n) => !documentAttachmentExtensions.includes(n.split(".").pop()?.toLowerCase() || ""));
    if (invalid) return;
    const next = Array.from(new Set([...documentState.attachments, ...names]));
    onDocumentChange({ attachments: next });
  };

  const removeDocAttachment = (name: string) => {
    onDocumentChange({ attachments: documentState.attachments.filter((a) => a !== name) });
  };

  const previewTemplate = docPreviewId
    ? documentTemplates.find((t) => t.id === docPreviewId) ?? null
    : null;

  return (
    <div
      className="space-y-4"
      data-requirement-id="ruyi-document-tool-panel"
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">公文类型</span>
          <select
            value={documentState.docType}
            onChange={(e) => {
              const nextCategory = e.target.value;
              const nextTemplate = documentTemplates.find((t) => t.category === nextCategory);
              onDocumentChange({ docType: nextCategory, selectedTemplate: nextTemplate?.id ?? documentState.selectedTemplate });
            }}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {templateCategories.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">字数选择</span>
          <select
            value={documentState.docLength}
            onChange={(e) => onDocumentChange({ docLength: e.target.value })}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {lengthOptions.map((length) => (
              <option key={length} value={length}>{length} 字</option>
            ))}
          </select>
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">文章标题</span>
          <input
            value={documentState.docTitle}
            onChange={(e) => onDocumentChange({ docTitle: e.target.value })}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="请输入文章标题"
          />
        </label>
        {/* V3：内容要求（旧版恢复项） */}
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">内容要求</span>
          <textarea
            value={documentState.docRequirement}
            onChange={(e) => onDocumentChange({ docRequirement: e.target.value })}
            className="min-h-[64px] w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="补充公文的背景、要点、口径等要求（可在输入框继续补充）"
          />
        </label>
      </div>

      {/* 附件区 */}
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/60">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">已上传附件</div>
          <input
            ref={docFileInputRef}
            type="file"
            multiple
            accept={documentAttachmentExtensions.map((e) => `.${e}`).join(",")}
            className="hidden"
            onChange={(e) => { uploadDoc(e.target.files); e.target.value = ""; }}
          />
          <button
            type="button"
            onClick={() => docFileInputRef.current?.click()}
            className="inline-flex items-center gap-1 rounded-lg border border-theme-200 bg-white px-2.5 py-1.5 text-xs font-medium text-theme-700 hover:bg-theme-50 dark:bg-gray-800 dark:hover:bg-theme-900/20"
          >
            <FileText size={13} />
            上传参考文件
          </button>
        </div>
        {documentState.attachments.length > 0 ? (
          <div className="space-y-1.5">
            {documentState.attachments.map((attachment) => (
              <div key={attachment} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <FileText size={14} className="flex-shrink-0 text-theme-500" />
                <span className="truncate" title={attachment}>{attachment}</span>
                <button
                  type="button"
                  onClick={() => removeDocAttachment(attachment)}
                  className="ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500 dark:hover:bg-gray-600"
                  title="删除附件"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-white px-3 py-3 text-xs text-gray-400 dark:bg-gray-800">
            暂无附件，可上传本地文件作为公文参考。
          </div>
        )}
      </div>

      {/* 模板网格 + 预览（V3：模板可预览） */}
      <div>
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">选择公文模板</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {filteredDocumentTemplates.map((template: RuyiDocumentTemplate) => (
            <div
              key={template.id}
              role="button"
              tabIndex={0}
              onClick={() => onDocumentChange({ selectedTemplate: template.id })}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onDocumentChange({ selectedTemplate: template.id });
                }
              }}
              className={`group cursor-pointer overflow-hidden rounded-lg border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 ${
                documentState.selectedTemplate === template.id
                  ? `${template.border} ring-2 ring-theme-200`
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <div className="relative h-24 bg-gray-50 p-3 dark:bg-gray-700/70">
                <div className={`mb-2 h-1.5 w-16 rounded-full ${template.accent}`} />
                <div className="mx-auto h-full max-w-[82px] rounded-sm bg-white p-2 shadow-sm">
                  <div className={`mx-auto mb-2 h-1 w-10 rounded-full ${template.accent}`} />
                  <div className="space-y-1.5">
                    <div className="h-1 rounded bg-gray-300" />
                    <div className="h-1 rounded bg-gray-200" />
                    <div className="h-1 rounded bg-gray-200" />
                    <div className="h-1 w-2/3 rounded bg-gray-200" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/0 opacity-0 transition-all group-hover:bg-gray-900/35 group-hover:opacity-100">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => { event.stopPropagation(); setDocPreviewId(template.id); }}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setDocPreviewId(template.id); } }}
                    className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-md hover:bg-white"
                  >
                    预览模板
                  </span>
                </div>
              </div>
              <div className="p-3 pb-2">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{template.name}</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{template.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 公文模板预览弹窗（版式示意 + 选用） */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3 sm:p-4" onClick={() => setDocPreviewId(null)}>
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white p-4 shadow-2xl sm:p-5 dark:bg-gray-800" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex flex-shrink-0 items-center justify-between gap-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">公文模板预览</div>
              <button onClick={() => setDocPreviewId(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700" aria-label="关闭预览"><X size={18} /></button>
            </div>
            <div className="scrollbar-hover flex flex-shrink-0 gap-2 overflow-x-auto border-b border-gray-100 pb-4 dark:border-gray-700">
              {filteredDocumentTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setDocPreviewId(tpl.id)}
                  className={`flex min-w-[120px] items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                    previewTemplate.id === tpl.id
                      ? "border-theme-600 bg-theme-600 text-white"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className={`h-2 w-2 flex-shrink-0 rounded-full ${previewTemplate.id === tpl.id ? "bg-white" : "bg-theme-400"}`} />
                  <span className="min-w-0 truncate text-sm font-semibold">{tpl.name}</span>
                </button>
              ))}
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto py-4">
              {/* A4 版式示意预览 */}
              <div className="w-full max-w-[520px] rounded-lg bg-white p-8 shadow-lg dark:bg-gray-100">
                <div className={`mx-auto mb-3 h-1.5 w-20 rounded-full ${previewTemplate.accent}`} />
                <div className="mb-6 text-center text-xl font-bold tracking-wide text-gray-900">
                  {documentState.docTitle?.trim() || `${previewTemplate.category}标题示例`}
                </div>
                <div className="mb-4 space-y-1 text-center text-[10px] text-gray-400">
                  <div>各部门、各单位：</div>
                </div>
                <div className="space-y-2 text-[11px] leading-6 text-gray-600">
                  <div className="indent-8">为推进相关工作开展，现将有关事项通知如下。</div>
                  <div className="indent-8 font-semibold text-gray-800">一、总体要求</div>
                  <div className="indent-8">结合当前工作要求，明确目标与推进安排。</div>
                  <div className="indent-8 font-semibold text-gray-800">二、主要内容</div>
                  <div className="indent-8">围绕核心任务，细化措施与责任分工。</div>
                  <div className="indent-8">特此通知。</div>
                </div>
                <div className="mt-6 space-y-1 text-right text-[10px] text-gray-400">
                  <div>二〇二六年十一月</div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 text-center text-[9px] text-gray-300">
                  示例版式仅为示意，实际内容按需求生成 · {previewTemplate.subCategory}
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
              <span className="text-xs text-gray-400">{previewTemplate.desc}</span>
              <div className="flex gap-2">
                <button onClick={() => setDocPreviewId(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">取消</button>
                <button
                  onClick={() => { onDocumentChange({ selectedTemplate: previewTemplate.id }); setDocPreviewId(null); }}
                  className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700"
                >
                  使用此模板
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
