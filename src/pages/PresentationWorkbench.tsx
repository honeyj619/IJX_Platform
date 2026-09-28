import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, CheckCircle2, ChevronDown, ChevronRight, Copy, Download,
  FileText, GripVertical, LoaderCircle, Paperclip, Plus, Presentation, Redo2,
  RefreshCw, Save, Search, Sparkles, Trash2, Undo2, X,
} from "lucide-react";
import {
  presentationParamOptions, presentationSlides, presentationTemplates,
  type PresentationModeId, type PresentationSlide,
} from "../data/presentation";

export interface PresentationRouteState {
  mode?: PresentationModeId;
  title?: string;
  prompt?: string;
  pageCount?: string;
  audience?: string;
  scene?: string;
  tone?: string;
  language?: string;
  textStyle?: string;
  template?: string;
  attachments?: string[];
}

interface PresentationWorkbenchProps {
  initialState?: PresentationRouteState;
  onBack?: () => void;
}

type WorkbenchStage = "requirement" | "outlineGenerating" | "outlineReview" | "contentGenerating" | "contentReview";
type GenerationStatus = "pending" | "processing" | "completed" | "failed";
type FinalFileStatus = "idle" | "generating" | "ready";

interface OutlinePage {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  expanded: boolean;
}

interface SavedPresentation {
  id: string;
  title: string;
  mode: string;
  template: string;
  pages: number;
  updatedAt: string;
  updatedDate: string;
  finalReady: boolean;
}

const acceptedExtensions = ["txt", "md", "markdown", "pdf", "xlsx", "xls", "docx"];
const generationSteps = [
  { title: "理解主题需求", detail: ["提炼演示目标与核心观点", "确认受众、场景和表达方式"] },
  { title: "设计视觉风格", detail: ["匹配所选演示模板", "确定页面层级和视觉节奏"] },
  { title: "收集相关内容", detail: ["分析参考附件与需求描述", "整理支撑观点和内容依据"] },
  { title: "生成PPT大纲", detail: ["组织章节和页面顺序", "生成页面标题、摘要和内容要点"] },
];

const initialHistory: SavedPresentation[] = [
  { id: "annual-summary", title: "2026年度数字化建设总结", mode: "AI智能生成", template: "吉祥品牌", pages: 12, updatedAt: "今天 14:20", updatedDate: "2026-09-26", finalReady: true },
  { id: "project-report", title: "如意空间项目阶段汇报", mode: "文档生成PPT", template: "简约商务", pages: 8, updatedAt: "昨天 16:10", updatedDate: "2026-09-25", finalReady: false },
  { id: "research-share", title: "智能办公应用研究分享", mode: "AI智能生成", template: "清新学术", pages: 15, updatedAt: "9月20日", updatedDate: "2026-09-20", finalReady: true },
];

const createOutline = (variant = 0): OutlinePage[] => presentationSlides.map((slide, index) => ({
  id: `outline-${variant}-${index + 1}`,
  title: variant > 0 && index > 0 ? `${slide.title}（优化版）` : slide.title,
  summary: slide.subtitle,
  bullets: [...slide.bullets],
  expanded: index < 2,
}));

const outlineToSlides = (outline: OutlinePage[]): PresentationSlide[] => outline.map((item, index) => ({
  id: index + 1,
  title: item.title,
  subtitle: item.summary,
  bullets: item.bullets,
}));

export default function PresentationWorkbench({ initialState, onBack }: PresentationWorkbenchProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = initialState || (location.state || {}) as PresentationRouteState;
  const [stage, setStage] = useState<WorkbenchStage>("requirement");
  const [workspaceTab, setWorkspaceTab] = useState<"current" | "mine">("current");
  const [title, setTitle] = useState(state.title || "");
  const [prompt, setPrompt] = useState(state.prompt || "");
  const [pageCount, setPageCount] = useState(state.pageCount || "6-10页");
  const [audience, setAudience] = useState(state.audience || "大众");
  const [scene, setScene] = useState(state.scene || "通用");
  const [tone, setTone] = useState(state.tone || "专业");
  const [language, setLanguage] = useState(state.language || "中文");
  const [textStyle, setTextStyle] = useState(state.textStyle || "简洁");
  const [template, setTemplate] = useState(state.template || presentationTemplates[0]);
  const [attachments, setAttachments] = useState(state.attachments || []);
  const [outline, setOutline] = useState<OutlinePage[]>(createOutline());
  const [outlineEditing, setOutlineEditing] = useState(false);
  const [outlineVersion, setOutlineVersion] = useState(0);
  const [activeGenerationStep, setActiveGenerationStep] = useState(0);
  const [expandedGenerationStep, setExpandedGenerationStep] = useState<number | null>(0);
  const [generationFailed, setGenerationFailed] = useState(false);
  const [slides, setSlides] = useState<PresentationSlide[]>(presentationSlides);
  const [selectedSlideId, setSelectedSlideId] = useState(1);
  const [finalFileStatus, setFinalFileStatus] = useState<FinalFileStatus>("idle");
  const [isSaved, setIsSaved] = useState(true);
  const [history, setHistory] = useState(initialHistory);
  const [historySearch, setHistorySearch] = useState("");
  const [historyMode, setHistoryMode] = useState("全部");
  const [historyTemplate, setHistoryTemplate] = useState("全部");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [toast, setToast] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [draggedOutlineId, setDraggedOutlineId] = useState<string | null>(null);
  const [draggedSlideId, setDraggedSlideId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvedTitle = title.trim() || prompt.trim().replace(/^(请|帮我|生成|做一份|制作)/, "").slice(0, 32) || "未命名演示文稿";
  const selectedSlide = slides.find((slide) => slide.id === selectedSlideId) || slides[0];
  const contentStage = stage === "contentGenerating" || stage === "contentReview";
  const filteredHistory = useMemo(() => history.filter((item) => (
    item.title.toLowerCase().includes(historySearch.trim().toLowerCase())
    && (historyMode === "全部" || item.mode === historyMode)
    && (historyTemplate === "全部" || item.template === historyTemplate)
    && (!historyStartDate || item.updatedDate >= historyStartDate)
    && (!historyEndDate || item.updatedDate <= historyEndDate)
  )), [history, historyEndDate, historyMode, historySearch, historyStartDate, historyTemplate]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (stage !== "outlineGenerating" || generationFailed) return;
    if (activeGenerationStep >= generationSteps.length) {
      setOutline(createOutline(outlineVersion));
      setOutlineEditing(false);
      setStage("outlineReview");
      setExpandedGenerationStep(null);
      setIsSaved(false);
      return;
    }
    setExpandedGenerationStep(activeGenerationStep);
    const timer = window.setTimeout(() => setActiveGenerationStep((current) => current + 1), 650);
    return () => window.clearTimeout(timer);
  }, [activeGenerationStep, generationFailed, outlineVersion, stage]);

  useEffect(() => {
    if (stage !== "contentGenerating") return;
    const timer = window.setTimeout(() => {
      const nextSlides = outlineToSlides(outline);
      setSlides(nextSlides);
      setSelectedSlideId(nextSlides[0]?.id || 1);
      setStage("contentReview");
      setFinalFileStatus("idle");
      setIsSaved(false);
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [outline, stage]);

  useEffect(() => {
    if (finalFileStatus !== "generating") return;
    const timer = window.setTimeout(() => {
      setFinalFileStatus("ready");
      setIsSaved(true);
      setToast("最终PPT文件已生成");
    }, 1300);
    return () => window.clearTimeout(timer);
  }, [finalFileStatus]);

  const markChanged = () => {
    setIsSaved(false);
    if (finalFileStatus === "ready") setFinalFileStatus("idle");
  };

  const startOutlineGeneration = (outlineOnly = false) => {
    if (!prompt.trim()) return;
    setGenerationFailed(false);
    setActiveGenerationStep(outlineOnly ? generationSteps.length - 1 : 0);
    setExpandedGenerationStep(outlineOnly ? generationSteps.length - 1 : 0);
    setStage("outlineGenerating");
  };

  const requestRegenerateOutline = () => setConfirmAction({
    title: "重新生成大纲",
    message: "重新生成后将覆盖当前大纲，但会保留PPT需求、模板和参考附件。",
    onConfirm: () => {
      setOutlineVersion((current) => current + 1);
      setOutlineEditing(false);
      startOutlineGeneration(true);
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const selected = Array.from(files);
    if (selected.some((file) => !acceptedExtensions.includes(file.name.split(".").pop()?.toLowerCase() || ""))) {
      setUploadError("文件格式不支持");
      return;
    }
    if (selected.some((file) => file.size > 50 * 1024 * 1024)) {
      setUploadError("单个文件不能超过 50 MB");
      return;
    }
    const next = [...new Set([...attachments, ...selected.map((file) => file.name)])];
    if (next.length > 10) {
      setUploadError("附件最多上传 10 个");
      return;
    }
    setAttachments(next);
    setUploadError("");
    markChanged();
  };

  const updateOutlinePage = (id: string, patch: Partial<OutlinePage>) => {
    setOutline((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
    markChanged();
  };

  const updateOutlineBullet = (id: string, bulletIndex: number, value: string) => {
    setOutline((current) => current.map((item) => item.id === id ? {
      ...item, bullets: item.bullets.map((bullet, index) => index === bulletIndex ? value : bullet),
    } : item));
    markChanged();
  };

  const addOutlinePage = () => {
    setOutline((current) => [...current, {
      id: `outline-new-${Date.now()}`,
      title: "新增页面",
      summary: "请输入本页需要表达的核心信息",
      bullets: ["新增内容要点"],
      expanded: true,
    }]);
    setOutlineEditing(true);
    markChanged();
  };

  const deleteOutlinePage = (id: string) => setConfirmAction({
    title: "删除大纲页面",
    message: "删除后页面编号将自动更新，确定继续吗？",
    onConfirm: () => {
      setOutline((current) => current.filter((item) => item.id !== id));
      markChanged();
    },
  });

  const reorderOutline = (targetId: string) => {
    if (!draggedOutlineId || draggedOutlineId === targetId) return;
    setOutline((current) => {
      const next = [...current];
      const from = next.findIndex((item) => item.id === draggedOutlineId);
      const to = next.findIndex((item) => item.id === targetId);
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setDraggedOutlineId(null);
    markChanged();
  };

  const reorderSlides = (targetId: number) => {
    if (!draggedSlideId || draggedSlideId === targetId) return;
    setSlides((current) => {
      const next = [...current];
      const from = next.findIndex((item) => item.id === draggedSlideId);
      const to = next.findIndex((item) => item.id === targetId);
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((item, index) => ({ ...item, id: index + 1 }));
    });
    setSelectedSlideId(1);
    setDraggedSlideId(null);
    markChanged();
  };

  const updateSelectedSlide = (patch: Partial<PresentationSlide>) => {
    if (!selectedSlide) return;
    setSlides((current) => current.map((item) => item.id === selectedSlide.id ? { ...item, ...patch } : item));
    markChanged();
  };

  const downloadOutline = () => {
    const text = outline.map((item, index) => `${index + 1}. ${item.title}\n${item.summary}\n${item.bullets.map((bullet) => `- ${bullet}`).join("\n")}`).join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${resolvedTitle}-大纲.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("大纲已下载");
  };

  const openHistoryItem = (item: SavedPresentation) => {
    setTitle(item.title);
    setPrompt(`根据历史记录继续完善《${item.title}》的PPT内容。`);
    setTemplate(item.template);
    setSlides(presentationSlides.map((slide) => ({ ...slide, bullets: [...slide.bullets] })));
    setSelectedSlideId(1);
    setFinalFileStatus(item.finalReady ? "ready" : "idle");
    setStage("contentReview");
    setWorkspaceTab("current");
    setIsSaved(true);
  };

  const copyCurrentContent = () => {
    const content = contentStage && selectedSlide
      ? `${selectedSlide.title}\n${selectedSlide.subtitle}\n${selectedSlide.bullets.join("\n")}`
      : `${resolvedTitle}\n${prompt}`;
    navigator.clipboard?.writeText(content);
    setToast("当前内容已复制");
  };

  const generationStatus = (index: number): GenerationStatus => {
    if (generationFailed && index === activeGenerationStep) return "failed";
    if (stage === "outlineReview" || contentStage || index < activeGenerationStep) return "completed";
    if (stage === "outlineGenerating" && index === activeGenerationStep) return "processing";
    return "pending";
  };

  const renderProgress = () => (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {generationSteps.map((step, index) => {
        const status = generationStatus(index);
        const expanded = expandedGenerationStep === index;
        return (
          <div key={step.title} className="border-b border-gray-100 last:border-b-0">
            <button type="button" onClick={() => setExpandedGenerationStep(expanded ? null : index)} className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-gray-50">
              <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${status === "completed" ? "bg-green-50 text-green-600" : status === "processing" ? "bg-theme-50 text-theme-600" : status === "failed" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400"}`}>
                {status === "completed" ? <Check size={13} /> : status === "processing" ? <LoaderCircle size={13} className="animate-spin" /> : status === "failed" ? <X size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </span>
              <span className="min-w-0 flex-1 text-sm font-medium text-gray-700">{step.title}</span>
              {expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            </button>
            {expanded && <div className="space-y-1.5 bg-gray-50 px-12 py-3 text-xs leading-5 text-gray-500">{step.detail.map((item) => <div key={item} className="flex gap-2"><span className="text-green-500">{status === "completed" ? "✓" : "·"}</span>{item}</div>)}</div>}
          </div>
        );
      })}
    </div>
  );

  const renderRequirementCanvas = () => (
    <div className="mx-auto flex aspect-video w-full max-w-4xl flex-col overflow-hidden rounded-sm border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-8 py-5 text-xs text-gray-400"><span className="font-semibold tracking-[0.16em] text-theme-600">JUNEYAO AIR</span><span>{template}</span></div>
      <div className="flex flex-1 flex-col items-center justify-center px-12 text-center"><span className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-theme-50 text-theme-600"><Presentation size={24} /></span><h1 className="text-3xl font-bold text-gray-900">{resolvedTitle}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500">{prompt || "在右侧录入PPT主题、核心内容和使用场景，开始创建演示文稿。"}</p><div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-gray-500">{[pageCount, audience, scene, tone].map((item) => <span key={item} className="rounded bg-gray-50 px-3 py-1.5">{item}</span>)}</div></div>
      <div className="border-t border-gray-100 px-8 py-3 text-center text-[11px] text-gray-400">PPT需求预览</div>
    </div>
  );

  const renderOutlineCanvas = () => (
    <div className="mx-auto max-w-4xl space-y-4">
      <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-semibold text-gray-900">PPT生成进度</h2><p className="mt-1 text-xs text-gray-400">根据已确认的需求生成结构化大纲</p></div>{stage === "outlineReview" && <span className="rounded bg-green-50 px-2 py-1 text-xs text-green-700">已完成</span>}</div>{renderProgress()}</section>
      {stage === "outlineReview" && <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold text-gray-900">PPT大纲</h2><p className="mt-1 text-xs text-gray-400">拖动章节调整顺序，展开后编辑页面内容</p></div><div className="flex gap-2"><button type="button" onClick={() => setOutlineEditing((current) => !current)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">{outlineEditing ? "完成编辑" : "编辑大纲"}</button><button type="button" onClick={downloadOutline} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"><Download size={13} />下载大纲</button></div></div><div className="space-y-3">{outline.map((item, index) => <div key={item.id} draggable={outlineEditing} onDragStart={() => setDraggedOutlineId(item.id)} onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()} onDrop={() => reorderOutline(item.id)} className="overflow-hidden rounded-lg border border-gray-200 bg-white"><div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5"><GripVertical size={15} className={outlineEditing ? "cursor-grab text-gray-400" : "text-gray-200"} /><span className="rounded bg-theme-50 px-2 py-1 text-xs font-semibold text-theme-700">P{index + 1}章节</span><button type="button" onClick={() => updateOutlinePage(item.id, { expanded: !item.expanded })} className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-gray-800">{item.title}</button>{outlineEditing && <button type="button" onClick={() => deleteOutlinePage(item.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600" title="删除页面"><Trash2 size={14} /></button>}<button type="button" onClick={() => updateOutlinePage(item.id, { expanded: !item.expanded })} className="text-gray-400">{item.expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</button></div>{item.expanded && <div className="px-4 py-3"><div className="mb-2 text-[11px] font-medium text-gray-400">页面 {index + 1}</div><input disabled={!outlineEditing} value={item.title} onChange={(event) => updateOutlinePage(item.id, { title: event.target.value })} className="h-9 w-full rounded-lg border border-transparent bg-gray-50 px-3 text-sm font-semibold text-gray-800 outline-none focus:border-theme-200 focus:bg-white disabled:bg-white" /><input disabled={!outlineEditing} value={item.summary} onChange={(event) => updateOutlinePage(item.id, { summary: event.target.value })} className="mt-2 h-9 w-full rounded-lg border border-transparent bg-gray-50 px-3 text-xs text-gray-600 outline-none focus:border-theme-200 focus:bg-white disabled:bg-white" /><div className="mt-3 space-y-2">{item.bullets.map((bullet, bulletIndex) => <div key={`${item.id}-${bulletIndex}`} className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-theme-400" /><input disabled={!outlineEditing} value={bullet} onChange={(event) => updateOutlineBullet(item.id, bulletIndex, event.target.value)} className="h-8 min-w-0 flex-1 border-b border-gray-100 bg-transparent text-xs text-gray-600 outline-none focus:border-theme-300" />{outlineEditing && <button type="button" onClick={() => updateOutlinePage(item.id, { bullets: item.bullets.filter((_, bulletItemIndex) => bulletItemIndex !== bulletIndex) })} className="text-gray-300 hover:text-red-500"><X size={13} /></button>}</div>)}{outlineEditing && <button type="button" onClick={() => updateOutlinePage(item.id, { bullets: [...item.bullets, "新增内容要点"] })} className="inline-flex items-center gap-1 text-xs font-medium text-theme-700"><Plus size={13} />添加内容要点</button>}</div></div>}</div>)}</div><button type="button" onClick={addOutlinePage} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-200 py-2.5 text-xs font-medium text-gray-500 hover:border-theme-200 hover:text-theme-700"><Plus size={14} />新增页面</button><div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400"><span>共 {outline.length} 页</span><span>AI生成内容，仅供参考</span></div></section>}
    </div>
  );

  const renderSlideCanvas = () => {
    if (!selectedSlide) return null;
    return <div className="flex h-full min-h-0"><aside className="scrollbar-hover w-48 flex-shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50 p-3 max-xl:hidden"><div className="mb-3 flex items-center justify-between text-xs font-semibold text-gray-700"><span>页面缩略图</span><span className="text-gray-400">{slides.length}页</span></div><div className="space-y-2">{slides.map((slide, index) => <button key={slide.id} type="button" draggable onDragStart={() => setDraggedSlideId(slide.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => reorderSlides(slide.id)} onClick={() => setSelectedSlideId(slide.id)} className={`w-full rounded-lg border p-2 text-left ${selectedSlideId === slide.id ? "border-theme-200 bg-theme-50" : "border-gray-200 bg-white"}`}><div className="mb-2 aspect-video rounded bg-white p-2 shadow-inner"><div className="mb-2 h-1 w-8 rounded bg-theme-500" /><div className="space-y-1"><div className="h-1 rounded bg-gray-300" /><div className="h-1 w-3/4 rounded bg-gray-200" /></div></div><div className="truncate text-[11px] font-medium text-gray-700">{index + 1}. {slide.title}</div></button>)}</div></aside><div className="scrollbar-hover min-w-0 flex-1 overflow-y-auto p-5">{stage === "contentGenerating" ? <div className="flex min-h-[480px] flex-col items-center justify-center"><LoaderCircle size={30} className="animate-spin text-theme-600" /><div className="mt-4 text-sm font-semibold text-gray-700">正在根据大纲生成PPT内容</div><div className="mt-2 text-xs text-gray-400">正在组织页面结构、标题和内容要点...</div></div> : <div className="mx-auto flex aspect-video w-full max-w-4xl flex-col overflow-hidden rounded-sm border border-gray-100 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-gray-100 px-8 py-4"><span className="text-xs font-semibold tracking-[0.16em] text-theme-600">JUNEYAO AIR</span><span className="text-xs text-gray-400">{finalFileStatus === "ready" ? "FINAL" : "DRAFT"}</span></div><div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_34%] gap-8 p-8"><div className="flex min-w-0 flex-col justify-center"><div className="mb-4 h-1.5 w-16 rounded bg-theme-600" /><input value={selectedSlide.title} onChange={(event) => updateSelectedSlide({ title: event.target.value })} className="w-full border-none bg-transparent text-3xl font-bold text-gray-900 outline-none" /><input value={selectedSlide.subtitle} onChange={(event) => updateSelectedSlide({ subtitle: event.target.value })} className="mt-3 w-full border-none bg-transparent text-sm text-gray-500 outline-none" /><div className="mt-6 space-y-2">{selectedSlide.bullets.map((bullet, index) => <div key={index} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"><span className="h-1.5 w-1.5 rounded-full bg-theme-500" /><input value={bullet} onChange={(event) => updateSelectedSlide({ bullets: selectedSlide.bullets.map((item, bulletIndex) => bulletIndex === index ? event.target.value : item) })} className="min-w-0 flex-1 bg-transparent text-xs text-gray-700 outline-none" /></div>)}</div></div><div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4"><div className="rounded-lg bg-theme-100" /><div className="rounded-lg bg-blue-100" /><div className="rounded-lg bg-amber-100" /><div className="rounded-lg bg-gray-200" /></div></div><div className="border-t border-gray-100 px-8 py-3 text-center text-[11px] text-gray-400">第 {selectedSlide.id} 页</div></div>}</div></div>;
  };

  const renderAttachmentPanel = (editable = true) => <div className="rounded-lg border border-gray-200 bg-white p-3"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-medium text-gray-700">参考附件</span>{editable && <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1 text-xs font-medium text-theme-700"><Paperclip size={13} />上传</button>}<input ref={fileInputRef} type="file" multiple accept={acceptedExtensions.map((extension) => `.${extension}`).join(",")} className="hidden" onChange={(event) => { handleFiles(event.target.files); event.target.value = ""; }} /></div>{attachments.length > 0 ? <div className="space-y-2">{attachments.map((item) => <div key={item} className="flex min-w-0 items-center gap-2 rounded bg-gray-50 px-2 py-2 text-xs text-gray-600"><FileText size={13} className="flex-shrink-0 text-theme-500" /><span className="truncate">{item}</span>{editable && <button type="button" onClick={() => { setAttachments((current) => current.filter((value) => value !== item)); markChanged(); }} className="ml-auto text-gray-400 hover:text-red-500"><X size={13} /></button>}</div>)}</div> : <div className="rounded bg-gray-50 px-2 py-4 text-center text-xs text-gray-400">暂无参考附件</div>}{uploadError && <div className="mt-2 text-xs text-red-500">{uploadError}</div>}{editable && <div className="mt-2 text-[11px] leading-5 text-gray-400">支持 TXT、MD、PDF、Excel、Word；单文件不超过50MB，最多10个。</div>}</div>;

  const renderRequirementPanel = () => <div className="space-y-4"><div className="rounded-lg border border-gray-200 bg-white p-3"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-medium text-gray-700">PPT要求</span><span className="rounded bg-theme-50 px-2 py-0.5 text-xs text-theme-700">可编辑</span></div><div className="space-y-3"><label className="block text-xs text-gray-400">演示标题<input value={title} onChange={(event) => { setTitle(event.target.value); markChanged(); }} placeholder="请输入演示标题（选填）" className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-theme-100" /></label><label className="block text-xs text-gray-400">需求描述 <span className="text-red-500">*</span><textarea value={prompt} onChange={(event) => { setPrompt(event.target.value); markChanged(); }} rows={5} placeholder="描述演示主题、核心内容和使用场景" className="scrollbar-hover mt-1 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-6 text-gray-800 outline-none focus:ring-2 focus:ring-theme-100" /></label>{([['pageCount', pageCount, setPageCount], ['textStyle', textStyle, setTextStyle], ['audience', audience, setAudience], ['scene', scene, setScene], ['tone', tone, setTone], ['language', language, setLanguage]] as Array<[string, string, (value: string) => void]>).map(([key, value, setter]) => <label key={key} className="block text-xs text-gray-400">{presentationParamOptions[key].label}<select value={value} onChange={(event) => { setter(event.target.value); markChanged(); }} className="mt-1 h-9 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-theme-100">{presentationParamOptions[key].options.map((option) => <option key={option}>{option}</option>)}</select></label>)}</div></div><div className="rounded-lg border border-gray-200 bg-white p-3"><div className="mb-3 flex items-center justify-between"><span className="text-sm font-medium text-gray-700">模板选择与预览</span><span className="rounded bg-theme-50 px-2 py-0.5 text-xs text-theme-700">可调整</span></div><div className="grid grid-cols-3 gap-2">{presentationTemplates.map((item) => <button type="button" key={item} onClick={() => { setTemplate(item); markChanged(); }} className={`rounded-lg border p-2 text-left ${template === item ? "border-theme-300 bg-theme-50" : "border-gray-200 bg-white"}`}><div className={`mb-2 aspect-video rounded ${item === "吉祥品牌" ? "bg-rose-50" : item === "简约商务" ? "bg-blue-50" : "bg-emerald-50"}`}><div className="p-2"><div className="h-1 w-6 rounded bg-theme-500" /></div></div><div className="truncate text-[11px] font-medium text-gray-700">{item}</div></button>)}</div></div>{renderAttachmentPanel(true)}</div>;

  const renderCurrentPanel = () => {
    if (stage === "requirement") return renderRequirementPanel();
    if (stage === "outlineGenerating") return <div className="space-y-4"><div><h3 className="text-sm font-semibold text-gray-900">生成进度</h3><p className="mt-1 text-xs text-gray-400">正在根据已确认的要求生成大纲</p></div>{renderProgress()}{generationFailed && <button type="button" onClick={() => startOutlineGeneration(activeGenerationStep === generationSteps.length - 1)} className="w-full rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white">重新生成</button>}</div>;
    if (stage === "outlineReview") return <div className="space-y-4"><div className="rounded-lg border border-gray-200 bg-white p-3"><div className="text-sm font-medium text-gray-700">PPT大纲</div><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded bg-gray-50 p-2"><span className="text-gray-400">预计页数</span><div className="mt-1 font-semibold text-gray-800">{outline.length}页</div></div><div className="rounded bg-gray-50 p-2"><span className="text-gray-400">大纲状态</span><div className="mt-1 font-semibold text-green-700">已生成</div></div></div><p className="mt-3 text-xs leading-5 text-gray-400">可在左侧编辑页面标题、摘要和内容要点。</p></div>{renderAttachmentPanel(false)}</div>;
    return <div className="space-y-4"><div className="rounded-lg border border-gray-200 bg-white p-3"><div className="mb-3 text-sm font-medium text-gray-700">PPT摘要</div><div className="space-y-2 text-xs">{[["演示标题", resolvedTitle], ["页数", `${slides.length}页`], ["模板", template], ["受众", audience], ["场景", scene]].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><span className="text-gray-400">{label}</span><span className="truncate text-right font-medium text-gray-700">{value}</span></div>)}</div></div>{renderAttachmentPanel(false)}<div className={`rounded-lg border p-3 ${finalFileStatus === "ready" ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}><div className="flex items-start gap-3"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${finalFileStatus === "ready" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{finalFileStatus === "generating" ? <LoaderCircle size={16} className="animate-spin" /> : finalFileStatus === "ready" ? <CheckCircle2 size={16} /> : <FileText size={16} />}</span><div><div className={`text-sm font-medium ${finalFileStatus === "ready" ? "text-green-800" : "text-gray-800"}`}>{finalFileStatus === "generating" ? "正在生成最终PPT文件" : finalFileStatus === "ready" ? "最终PPT文件已生成" : "待生成最终PPT文件"}</div><p className="mt-1 text-xs leading-5 text-gray-500">{finalFileStatus === "ready" ? "可下载演示文件或继续编辑。" : "确认PPT内容无误后生成最终文件。"}</p></div></div></div></div>;
  };

  const renderHistoryPanel = () => <div className="space-y-3"><div className="rounded-lg border border-gray-200 bg-white p-3"><div className="relative"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" /><input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="搜索PPT文件名" className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs outline-none focus:bg-white" /></div><div className="mt-3 grid grid-cols-2 gap-2"><select value={historyMode} onChange={(event) => setHistoryMode(event.target.value)} className="h-8 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs"><option>全部</option><option>AI智能生成</option><option>文档生成PPT</option></select><select value={historyTemplate} onChange={(event) => setHistoryTemplate(event.target.value)} className="h-8 rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs"><option>全部</option>{presentationTemplates.map((item) => <option key={item}>{item}</option>)}</select></div><div className="mt-2 grid grid-cols-2 gap-2"><input type="date" value={historyStartDate} onChange={(event) => setHistoryStartDate(event.target.value)} className="h-8 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[11px]" /><input type="date" value={historyEndDate} onChange={(event) => setHistoryEndDate(event.target.value)} className="h-8 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[11px]" /></div></div>{filteredHistory.map((item) => <div key={item.id} role="button" tabIndex={0} onClick={() => openHistoryItem(item)} onKeyDown={(event) => { if (event.key === "Enter") openHistoryItem(item); }} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-theme-200"><div className="flex items-start gap-3"><span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-theme-50 text-theme-700"><Presentation size={17} /></span><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-gray-800">{item.title}</div><div className="mt-2 flex flex-wrap gap-1"><span className="rounded bg-theme-50 px-2 py-0.5 text-[11px] text-theme-700">{item.mode}</span><span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{item.pages}页</span><span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{item.updatedAt}</span></div></div></div><div className="mt-3 grid grid-cols-2 gap-2">{item.finalReady ? <button type="button" onClick={(event) => { event.stopPropagation(); setToast("PPT文件下载已开始"); }} className="inline-flex items-center justify-center gap-1 rounded-lg border border-theme-100 bg-theme-50 py-1.5 text-xs font-medium text-theme-700"><Download size={13} />下载</button> : <div className="flex items-center justify-center rounded-lg bg-gray-50 py-1.5 text-xs text-gray-400">待生成</div>}<button type="button" onClick={(event) => { event.stopPropagation(); setConfirmAction({ title: "删除PPT", message: `确定删除《${item.title}》吗？`, onConfirm: () => setHistory((current) => current.filter((value) => value.id !== item.id)) }); }} className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-100 bg-red-50 py-1.5 text-xs text-red-600"><Trash2 size={13} />删除</button></div></div>)}{filteredHistory.length === 0 && <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-8 text-center text-sm text-gray-400">未找到匹配的PPT</div>}</div>;

  const renderBottomActions = () => {
    if (workspaceTab === "mine") return <button type="button" onClick={() => setWorkspaceTab("current")} className="w-full rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white">返回当前PPT</button>;
    if (stage === "requirement") return <button type="button" disabled={!prompt.trim()} onClick={() => startOutlineGeneration(false)} className="w-full rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">确认要求，生成大纲</button>;
    if (stage === "outlineGenerating") return <button type="button" disabled className="flex w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white opacity-90"><LoaderCircle size={15} className="animate-spin" />正在生成大纲</button>;
    if (stage === "outlineReview") return <div className="space-y-2"><button type="button" onClick={() => setStage("contentGenerating")} className="flex w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white"><Sparkles size={15} />确认大纲并生成PPT内容</button><div className="grid grid-cols-2 gap-2"><button type="button" onClick={requestRegenerateOutline} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50">重新生成大纲</button><button type="button" onClick={() => { setIsSaved(true); setToast("大纲已保存"); }} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Save size={14} />保存</button></div></div>;
    if (stage === "contentGenerating") return <button type="button" disabled className="flex w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white opacity-90"><LoaderCircle size={15} className="animate-spin" />正在生成PPT内容</button>;
    return <div className="space-y-2">{finalFileStatus === "ready" ? <button type="button" onClick={() => setToast("PPT文件下载已开始")} className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white"><Download size={15} />下载最终PPT文件</button> : <button type="button" disabled={finalFileStatus === "generating"} onClick={() => setFinalFileStatus("generating")} className="flex w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-80">{finalFileStatus === "generating" ? <LoaderCircle size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}{finalFileStatus === "generating" ? "正在生成最终PPT文件" : "确认PPT内容，生成最终文件"}</button>}<div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setStage("contentGenerating")} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><RefreshCw size={14} />重新生成内容</button><button type="button" onClick={() => { setIsSaved(true); setToast("PPT内容已保存"); }} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"><Save size={14} />保存</button></div></div>;
  };

  return <div className="relative flex h-full min-h-0 bg-gray-50 text-gray-900"><section className="flex min-w-0 flex-1 flex-col border-r border-gray-200 bg-white"><header className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => onBack ? onBack() : navigate("/web_client/ruyi-zone")} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-200" title="返回如意空间"><ArrowLeft size={18} /></button><div className="min-w-0"><div className="flex items-center gap-2 text-xs text-gray-500"><Presentation size={14} />如意PPT工作台</div><div className="truncate text-sm font-medium text-gray-900">{resolvedTitle}</div></div></div></header><div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 px-4 py-2"><button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"><Undo2 size={15} />撤回</button><button type="button" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"><Redo2 size={15} />重做</button><button type="button" onClick={copyCurrentContent} className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-200"><Copy size={15} />复制当前内容</button></div><div className="min-h-0 flex-1 overflow-hidden">{contentStage ? renderSlideCanvas() : <div className="scrollbar-hover h-full overflow-y-auto px-5 py-6 md:px-8">{stage === "requirement" ? renderRequirementCanvas() : renderOutlineCanvas()}</div>}</div><footer className="grid grid-cols-3 items-center gap-3 border-t border-gray-100 bg-gray-50 px-4 py-2"><div className="text-xs text-gray-500">{isSaved ? "已保存" : "有未保存内容"}</div><div className="text-center text-[11px] text-gray-400">内容AI辅助生成，请谨慎识别</div><div className="text-right text-xs text-gray-500">{contentStage ? `${slides.length} 页` : stage === "outlineReview" ? `${outline.length} 页` : pageCount}</div></footer></section><aside className="flex h-full w-80 flex-shrink-0 flex-col border-l border-gray-200 bg-gray-50 max-lg:w-[300px]"><div className="border-b border-gray-200 bg-white px-4 pb-3 pt-4"><div className="mb-3 flex items-center gap-2 text-theme-700"><Presentation size={18} /><span className="text-sm font-semibold">PPT工作台</span></div><div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1 text-sm">{[{ id: "current", label: "当前PPT" }, { id: "mine", label: "我的PPT" }].map((item) => <button key={item.id} type="button" onClick={() => setWorkspaceTab(item.id as "current" | "mine")} className={`rounded-md px-3 py-2 font-semibold ${workspaceTab === item.id ? "bg-theme-600 text-white shadow-sm" : "text-gray-500 hover:bg-white"}`}>{item.label}</button>)}</div><div className="mt-2 text-xs leading-5 text-gray-500">{workspaceTab === "current" ? "查看并处理当前PPT的生成流程" : "查看历史保存的PPT"}</div></div><div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto p-4">{workspaceTab === "current" ? renderCurrentPanel() : renderHistoryPanel()}</div><div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">{renderBottomActions()}</div></aside>{toast && <div className="absolute bottom-16 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white shadow-xl">{toast}</div>}{confirmAction && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/35 p-4"><div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"><div className="text-base font-semibold text-gray-900">{confirmAction.title}</div><p className="mt-2 text-sm leading-6 text-gray-500">{confirmAction.message}</p><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setConfirmAction(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600">取消</button><button type="button" onClick={() => { confirmAction.onConfirm(); setConfirmAction(null); }} className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white">确认</button></div></div></div>}</div>;
}
