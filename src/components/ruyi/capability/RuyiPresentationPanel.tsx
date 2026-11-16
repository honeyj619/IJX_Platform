import { useRef } from "react";
import PresentationSettings from "../../PresentationSettings";
import { presentationParamOptions } from "../../../data/presentation";

/**
 * 如意PPT 能力面板：PPT主题 + 复用工作台 PresentationSettings（附件+六项配置+模板）。
 * 模板预览由 PresentationSettings 内置（悬停"预览"按钮）。
 * V3.1：主题独立输入框（PresentationSettings 无该字段，置于其上）。
 */

export interface PresentationPanelState {
  /** V3.1：PPT 主题（独立于需求文本的结构化字段） */
  topic: string;
  attachments: string[];
  values: Record<string, string>;
  template: string;
}

export function createInitialPresentationPanelState(): PresentationPanelState {
  return {
    topic: "",
    attachments: [],
    values: Object.fromEntries(
      Object.keys(presentationParamOptions).map((key) => [key, presentationParamOptions[key].options[0]]),
    ),
    template: "",
  };
}

interface RuyiPresentationPanelProps {
  variant: "compact" | "full";
  pptState: PresentationPanelState;
  onPptChange: (patch: Partial<PresentationPanelState>) => void;
}

export default function RuyiPresentationPanel({ pptState, onPptChange }: RuyiPresentationPanelProps) {
  const pptFileInputRef = useRef<HTMLInputElement>(null);
  const pptFilesRef = useRef(new Map<string, File>());

  return (
    <div data-requirement-id="ruyi-presentation-tool-panel">
      {/* V3.1：PPT 主题 */}
      <div className="rounded-xl border border-gray-100 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-800/70">
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">PPT 主题</span>
          <input
            value={pptState.topic}
            onChange={(e) => onPptChange({ topic: e.target.value })}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="例如：AI办公效率提升汇报"
          />
        </label>
      </div>
      <PresentationSettings
        attachments={pptState.attachments}
        setAttachments={(next) => onPptChange({ attachments: typeof next === "function" ? next(pptState.attachments) : next })}
        inputRef={pptFileInputRef}
        files={pptFilesRef.current}
        template={pptState.template}
        setTemplate={(value) => onPptChange({ template: value })}
        values={pptState.values}
        setters={Object.fromEntries(
          Object.keys(presentationParamOptions).map((key) => [key, (value: string) => onPptChange({ values: { ...pptState.values, [key]: value } })]),
        )}
      />
    </div>
  );
}
