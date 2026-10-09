import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { presentationTemplateList, type PresentationTemplate } from "../data/presentation";

/** 单页 16:9 预览：按模板配色渲染示例页 */
const SlidePreview = ({ tpl, slide, cover }: { tpl: PresentationTemplate; slide: { title: string; bullets: string[] }; cover?: boolean }) => (
  <div className="flex h-full w-full flex-col overflow-hidden rounded-lg bg-white shadow-lg">
    {cover ? (
      <>
        <div className={`flex h-1/3 items-end ${tpl.surface} px-6 pb-4`}>
          <div className={`mb-2 h-1.5 w-16 rounded-full ${tpl.accent}`} />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="text-base font-bold tracking-normal text-gray-900 sm:text-lg">{slide.title}</div>
          <div className="mt-3 flex gap-2">
            {slide.bullets.map(bullet => <span key={bullet} className={`rounded-full px-2.5 py-0.5 text-[10px] ${tpl.surface} text-gray-600`}>{bullet}</span>)}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-2 text-[9px] text-gray-400">
          <span>i吉祥 · 如意PPT</span><span>1</span>
        </div>
      </>
    ) : (
      <>
        <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-3">
          <span className={`h-4 w-1 rounded-full ${tpl.accent}`} />
          <span className="text-sm font-semibold text-gray-900">{slide.title}</span>
        </div>
        <div className="flex-1 space-y-2.5 px-6 py-4">
          {slide.bullets.map(bullet => (
            <div key={bullet} className="flex items-center gap-2.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tpl.accent}`} />
              <span className="text-xs text-gray-700">{bullet}</span>
            </div>
          ))}
          <div className="space-y-1.5 pt-1">
            <div className={`h-1.5 w-4/5 rounded ${tpl.line}`} />
            <div className="h-1.5 w-3/5 rounded bg-gray-100" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-2 text-[9px] text-gray-400">
          <span>i吉祥 · 如意PPT</span><span>2</span>
        </div>
      </>
    )}
  </div>
);

interface PresentationTemplatePreviewProps {
  /** 当前预览的模板 id，null 关闭 */
  previewId: string | null;
  onClose: () => void;
  /** 切换预览的模板 */
  onSwitch: (templateId: string) => void;
  /** 选中模板（回调模板名） */
  onUse: (templateName: string) => void;
}

/** PPT 模板预览弹窗（工作台 / 需求配置共用） */
export default function PresentationTemplatePreview({ previewId, onClose, onSwitch, onUse }: PresentationTemplatePreviewProps) {
  const [slideIndex, setSlideIndex] = useState(0);

  const template = presentationTemplateList.find(tpl => tpl.id === previewId) || null;
  if (!template) return null;

  const slides = template.sampleSlides;
  const currentSlide = slides[Math.min(slideIndex, Math.max(slides.length - 1, 0))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3 sm:p-4" onClick={onClose}>
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white p-4 shadow-2xl sm:p-5" onClick={event => event.stopPropagation()}>
        <div className="mb-4 flex flex-shrink-0 items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">模板预览 · {template.name}</div>
            <div className="mt-1 text-sm text-gray-500">{template.desc} · 分类：{template.category}</div>
          </div>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="关闭预览"><X size={18} /></button>
        </div>

        {/* 顶部模板切换 */}
        <div className="scrollbar-hover flex flex-shrink-0 gap-2 overflow-x-auto border-b border-gray-100 pb-4">
          {presentationTemplateList.map(tpl => (
            <button
              key={tpl.id}
              onClick={() => { onSwitch(tpl.id); setSlideIndex(0); }}
              className={`flex min-w-[150px] items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-gray-50 ${template.id === tpl.id ? `${tpl.border} bg-theme-50/40` : 'border-gray-200'}`}
            >
              <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${tpl.accent}`} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-gray-900">{tpl.name}</div>
                <div className="truncate text-xs text-gray-500">{tpl.category}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden py-4 pr-1 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* 16:9 页面预览 + 翻页 */}
          <div className="flex min-h-0 flex-col rounded-lg bg-gray-50 p-3 sm:p-5">
            <div className="mx-auto flex min-h-0 w-full max-w-[560px] flex-1 items-center">
              <div className="aspect-video w-full">
                <SlidePreview tpl={template} slide={currentSlide} cover={slideIndex === 0} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button type="button" disabled={slideIndex === 0} onClick={() => setSlideIndex(index => Math.max(0, index - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="上一页"><ChevronLeft size={16} /></button>
              <div className="flex items-center gap-1.5">
                {slides.map((slide, index) => (
                  <button key={slide.title} type="button" onClick={() => setSlideIndex(index)} aria-label={`第 ${index + 1} 页`} className={`h-1.5 rounded-full transition-all ${index === slideIndex ? `w-5 ${template.accent}` : 'w-1.5 bg-gray-300 hover:bg-gray-400'}`} />
                ))}
              </div>
              <button type="button" disabled={slideIndex >= slides.length - 1} onClick={() => setSlideIndex(index => Math.min(slides.length - 1, index + 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40" aria-label="下一页"><ChevronRight size={16} /></button>
              <span className="ml-2 text-xs text-gray-400">{slideIndex + 1} / {slides.length} 页</span>
            </div>
          </div>

          {/* 模板规范 */}
          <div className="flex min-h-0 flex-col rounded-lg border border-gray-100 bg-white p-3">
            <div className="mb-3 flex-shrink-0 text-sm font-semibold text-gray-700">模板规范</div>
            <div className="scrollbar-hover min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {template.rules.map(rule => (
                <div key={rule.label} className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-500">{rule.label}</div>
                  <div className="mt-1 text-sm leading-5 text-gray-800">{rule.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <span className="text-xs text-gray-400">示例页仅为版式示意，实际内容按需求生成</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
            <button onClick={() => onUse(template.name)} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${template.accent} hover:opacity-90`}>使用此模板</button>
          </div>
        </div>
      </div>
    </div>
  );
}
