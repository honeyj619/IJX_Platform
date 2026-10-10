import { useState, type RefObject, type Dispatch, type SetStateAction } from "react";
import { Check, FileText, X } from "lucide-react";
import { presentationParamOptions, presentationTemplateList } from "../data/presentation";
import PresentationTemplatePreview from "./PresentationTemplatePreview";

interface Props {
  attachments: string[];
  setAttachments: Dispatch<SetStateAction<string[]>>;
  inputRef: RefObject<HTMLInputElement>;
  files: Map<string, File>;
  template: string;
  setTemplate: (value: string) => void;
  values: Record<string, string>;
  setters: Record<string, (value: string) => void>;
}
const extensions = ["txt", "md", "markdown", "pdf", "xlsx", "xls", "docx"];
const control = "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

export default function PresentationSettings({ attachments, setAttachments, inputRef, files, template, setTemplate, values, setters }: Props) {
  const [error, setError] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const upload = (selected: FileList | null) => {
    if (!selected) return;
    const batch = Array.from(selected);
    if (batch.some(file => !extensions.includes(file.name.split(".").pop()?.toLowerCase() || ""))) {
      setError("文件格式不支持，请选择 TXT、MD、MARKDOWN、PDF、XLSX、XLS 或 DOCX。"); return;
    }
    if (batch.reduce((sum, file) => sum + file.size, 0) > 10 * 1024 * 1024) {
      setError("参考附件总大小不能超过 10 MB，请重新选择。"); return;
    }
    const next = [...new Set([...attachments, ...batch.map(file => file.name)])];
    if (next.length > 10) { setError("附件合计最多 10 个，请减少后再添加。"); return; }
    batch.forEach(file => files.set(file.name, file));
    setAttachments(next); setError("");
  };

  return (
    <div className="mt-4 space-y-4 rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
      <section aria-label="文件/附件输入" className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/60">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">已上传附件 <span className="text-red-500">*</span></h3>
          <span className="text-xs text-gray-500">{attachments.length} / 10</span>
        </div>
        <input ref={inputRef} type="file" multiple accept={extensions.map(ext => `.${ext}`).join(",")} className="hidden" aria-label="选择PPT参考文档" onChange={event => { upload(event.target.files); event.target.value = ""; }} />
        {attachments.length > 0 ? <ul className="mt-2 space-y-1.5">
          {attachments.map(item => <li key={item} className="flex min-w-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm dark:bg-gray-800">
            <FileText size={15} className="shrink-0 text-theme-500" />
            <span title={item} className="min-w-0 flex-1 truncate text-gray-700 dark:text-gray-200">{item}</span>
            <button type="button" aria-label={`移除 ${item}`} className="rounded p-1 text-gray-400 hover:text-red-500" onClick={() => {
              if (!window.confirm("确认移除此参考资料？")) return;
              setAttachments(current => current.filter(value => value !== item)); files.delete(item); setError("");
            }}><X size={14} /></button>
          </li>)}
        </ul> : <div className="mt-2 rounded-lg bg-white px-3 py-3 text-xs text-gray-400 dark:bg-gray-800">必填：请点击需求输入框下方的回形针上传参考文档。</div>}
        <p className="mt-2 text-xs leading-5 text-gray-400">支持 TXT、MD、MARKDOWN、PDF、XLSX、XLS、DOCX；总大小不超过 10 MB，合计最多 10 个（必填）。</p>
        {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      </section>
      <section>
        <h3 className="mb-2 text-sm text-gray-500 dark:text-gray-400">详细配置</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {["pageCount", "textStyle", "audience", "scene", "tone", "language"].map(key => <label key={key} className="block min-w-0 text-xs text-gray-500 dark:text-gray-400">
            {presentationParamOptions[key].label}
            <select value={values[key]} onChange={event => setters[key](event.target.value)} className={`${control} mt-1.5`}>
              {presentationParamOptions[key].options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>)}
        </div>
      </section>
      <section>
        <h3 className="mb-2 text-sm text-gray-500 dark:text-gray-400">选择 PPT 模板</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {presentationTemplateList.map(tpl => {
            const selected = template === tpl.name;
            return (
              <button key={tpl.id} type="button" onClick={() => setTemplate(tpl.name)} className={`group relative overflow-hidden rounded-lg border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 ${selected ? `${tpl.border} ring-2 ring-theme-100` : 'border-gray-200 dark:border-gray-700'}`}>
                <div className={`relative h-20 p-3 ${tpl.surface} dark:bg-gray-700/70`}>
                  <div className={`mb-2 h-1.5 w-14 rounded-full ${tpl.accent}`} />
                  <div className="mx-auto w-24 rounded bg-white p-2 shadow-sm">
                    <div className={`mb-1.5 h-1 w-12 rounded ${tpl.accent}`} />
                    <div className={`mb-1 h-1 rounded ${tpl.line}`} />
                    <div className="h-1 w-2/3 rounded bg-gray-200" />
                  </div>
                  {/* 悬停预览按钮（参考公文模板卡片） */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/0 opacity-0 transition-all group-hover:bg-gray-900/35 group-hover:opacity-100">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={event => { event.stopPropagation(); setPreviewId(tpl.id); }}
                      onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setPreviewId(tpl.id); } }}
                      className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow-md hover:bg-white"
                    >
                      预览
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{tpl.name}</span>
                    <span className="block truncate text-[11px] text-gray-400">{tpl.desc}</span>
                  </div>
                  {selected && <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-theme-600 text-white"><Check size={12} /></span>}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 模板预览弹窗（共享组件） */}
      <PresentationTemplatePreview
        previewId={previewId}
        onClose={() => setPreviewId(null)}
        onSwitch={setPreviewId}
        onUse={name => { setTemplate(name); setPreviewId(null); }}
      />
    </div>
  );
}
