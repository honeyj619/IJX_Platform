import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileUp,
  Layers,
  Presentation,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { PresentationModeId, PresentationSlide } from "../data/presentation";
import { presentationModes, presentationOutline, presentationSlides } from "../data/presentation";

interface PresentationEditorProps {
  mode: PresentationModeId;
  title: string;
  prompt: string;
  pageCount: string;
  audience: string;
  scene: string;
  tone: string;
  language: string;
  textStyle: string;
  attachments?: string[];
  embedded?: boolean;
  onBack?: () => void;
}

export default function PresentationEditor({
  mode,
  title,
  prompt,
  pageCount,
  audience,
  scene,
  tone,
  language,
  textStyle,
  attachments = [],
  embedded = false,
  onBack,
}: PresentationEditorProps) {
  const [selectedSlideId, setSelectedSlideId] = useState(1);
  const [stage, setStage] = useState<"outline" | "draft" | "final">("draft");
  const [finalReady, setFinalReady] = useState(false);

  const modeName = presentationModes.find((item) => item.id === mode)?.name || "AI智能生成";
  const slideItems = mode === "single" ? presentationSlides.slice(0, 1) : presentationSlides;
  const selectedSlide = slideItems.find((slide) => slide.id === selectedSlideId) || slideItems[0];
  const resolvedTitle = title || prompt || "AI赋能：企业效率革新与未来";

  const stageLabel = useMemo(() => {
    if (stage === "outline") return "方案确认";
    if (stage === "draft") return "草稿预览";
    return "最终文件";
  }, [stage]);

  const handleRegenerateOutline = () => {
    setStage("outline");
    setFinalReady(false);
  };

  const handleGenerateDraft = () => {
    setStage("draft");
    setFinalReady(false);
  };

  const handleGenerateFinal = () => {
    setStage("final");
    setFinalReady(true);
  };

  return (
    <div className={`${embedded ? "h-full" : "min-h-screen"} flex flex-col bg-gray-50 text-gray-950`}>
      <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-theme-200 hover:text-theme-700"
            title="返回"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Presentation size={14} />
              如意PPT创作 · {stageLabel}
            </div>
            <h1 className="truncate text-lg font-semibold text-gray-950">{resolvedTitle}</h1>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-theme-50 px-3 py-1.5 text-xs font-semibold text-theme-700 md:flex">
          <Sparkles size={14} />
          内容AI辅助生成，请谨慎识别
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-4 md:p-5">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
          <aside className="scrollbar-hover min-h-0 overflow-y-auto rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-900">页面缩略图</div>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{slideItems.length}页</span>
            </div>
            <div className="space-y-2">
              {slideItems.map((slide) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setSelectedSlideId(slide.id)}
                  className={`w-full rounded-lg border p-2 text-left transition-all ${
                    selectedSlideId === slide.id
                      ? "border-theme-200 bg-theme-50/70 shadow-sm"
                      : "border-gray-100 bg-white hover:border-theme-100 hover:bg-gray-50"
                  }`}
                >
                  <div className="mb-2 aspect-video rounded-md bg-gradient-to-br from-theme-50 via-white to-blue-50 p-2">
                    <div className="mb-2 h-1.5 w-12 rounded-full bg-theme-500" />
                    <div className="space-y-1">
                      <div className="h-1.5 rounded bg-gray-300" />
                      <div className="h-1.5 w-3/4 rounded bg-gray-200" />
                      <div className="h-1.5 w-1/2 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="line-clamp-1 text-xs font-semibold text-gray-900">
                    {slide.id}. {slide.title}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">当前页面预览</div>
                <div className="mt-0.5 text-xs text-gray-500">按所选风格生成，可继续调整方案或生成最终文件</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRegenerateOutline}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-theme-200 hover:text-theme-700"
                >
                  <RefreshCw size={15} />
                  重新生成方案
                </button>
                <button
                  type="button"
                  onClick={handleGenerateDraft}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition-colors hover:border-theme-200 hover:text-theme-700"
                >
                  <Layers size={15} />
                  生成PPT草稿
                </button>
                <button
                  type="button"
                  onClick={handleGenerateFinal}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-theme-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-theme-700"
                >
                  <CheckCircle2 size={15} />
                  生成最终文件
                </button>
              </div>
            </div>

            <div className="scrollbar-hover min-h-0 flex-1 overflow-y-auto p-5">
              {stage === "outline" ? (
                <div className="rounded-xl border border-theme-100 bg-theme-50/60 p-5">
                  <div className="mb-3 text-sm font-semibold text-theme-800">PPT执行方案</div>
                  <ol className="space-y-2 text-sm leading-6 text-gray-700">
                    {presentationOutline.map((item) => (
                      <li key={item} className="rounded-lg bg-white px-3 py-2 shadow-sm">
                        {item}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <SlidePreview slide={selectedSlide} finalReady={finalReady} />
              )}
            </div>
          </section>

          <aside className="scrollbar-hover min-h-0 overflow-y-auto rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <div className="text-sm font-semibold text-gray-900">创作要求</div>
              <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-600">
                {prompt || "围绕企业效率革新主题，生成适合内部汇报的PPT。"}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
              {[
                ["创建方式", modeName],
                ["页数", mode === "single" ? "单页" : pageCount],
                ["受众", audience],
                ["场景", scene],
                ["语气", tone],
                ["语言", language],
                ["文本", textStyle],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-gray-100 bg-white px-3 py-2">
                  <div className="text-gray-400">{label}</div>
                  <div className="mt-1 font-semibold text-gray-800">{value}</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                <FileUp size={15} />
                参考文件
              </div>
              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((attachment) => (
                    <div key={attachment} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                      {attachment}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
                  无参考文件
                </div>
              )}
            </div>

            <div className={`rounded-lg border p-3 ${finalReady ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
              <div className={`text-sm font-semibold ${finalReady ? "text-green-800" : "text-gray-800"}`}>
                {finalReady ? "PPT最终文件已生成" : "待生成最终PPT文件"}
              </div>
              <p className={`mt-1 text-xs leading-5 ${finalReady ? "text-green-700" : "text-gray-500"}`}>
                {finalReady ? "可下载演示文件，后续接入真实生成接口。" : "确认草稿无误后生成最终文件。"}
              </p>
              <button
                type="button"
                disabled={!finalReady}
                className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-semibold text-theme-700 shadow-sm transition-colors hover:bg-theme-50 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                <Download size={14} />
                下载文件
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function SlidePreview({ slide, finalReady }: { slide: PresentationSlide; finalReady: boolean }) {
  return (
    <div className="mx-auto flex min-h-[460px] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-theme-50/30 to-blue-50 shadow-sm">
      <div className="flex items-center justify-between border-b border-white/80 px-8 py-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-theme-600">JUNEYAO AIR</div>
        <div className="text-xs text-gray-400">{finalReady ? "Final" : "Draft"}</div>
      </div>
      <div className="grid flex-1 grid-cols-1 gap-8 p-8 md:grid-cols-[1fr_260px]">
        <div className="flex flex-col justify-center">
          <div className="mb-4 h-1.5 w-20 rounded-full bg-theme-600" />
          <h2 className="text-3xl font-bold leading-tight text-gray-950">{slide.title}</h2>
          <p className="mt-4 text-base leading-7 text-gray-500">{slide.subtitle}</p>
          <div className="mt-8 space-y-3">
            {slide.bullets.map((bullet) => (
              <div key={bullet} className="flex items-center gap-3 rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-gray-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-theme-500" />
                {bullet}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center rounded-2xl bg-white/70 p-5 shadow-inner">
          <div className="grid h-48 w-full grid-cols-2 gap-3">
            <div className="rounded-xl bg-theme-100" />
            <div className="rounded-xl bg-blue-100" />
            <div className="rounded-xl bg-amber-100" />
            <div className="rounded-xl bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
