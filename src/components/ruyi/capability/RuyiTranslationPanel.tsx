import { translationSourceLanguages, translationTargetLanguages, translationTones } from "../../../data/ruyiToolPanel";

/** 智能翻译面板：待翻译内容 + 源语言 + 目标语言 + 翻译语气；提交后在对话中直接返回结果，不进入工作台 */

export interface TranslationPanelState {
  sourceText: string;
  /** V3.1：源语言 */
  sourceLanguage: string;
  targetLanguage: string;
  tone: string;
}

export function createInitialTranslationPanelState(): TranslationPanelState {
  return {
    sourceText: "",
    sourceLanguage: translationSourceLanguages[0],
    targetLanguage: translationTargetLanguages[0],
    tone: translationTones[0],
  };
}

const control =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

interface RuyiTranslationPanelProps {
  variant: "compact" | "full";
  translationState: TranslationPanelState;
  onTranslationChange: (patch: Partial<TranslationPanelState>) => void;
}

export default function RuyiTranslationPanel({ translationState, onTranslationChange }: RuyiTranslationPanelProps) {
  return (
    <div
      className="space-y-4"
      data-requirement-id="ruyi-translation-tool-panel"
    >
      <label className="block">
        <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">待翻译内容</span>
        <textarea
          value={translationState.sourceText}
          onChange={(e) => onTranslationChange({ sourceText: e.target.value })}
          className="min-h-[72px] w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          placeholder="输入或粘贴需要翻译的内容"
        />
      </label>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">源语言</span>
          <select
            value={translationState.sourceLanguage}
            onChange={(e) => onTranslationChange({ sourceLanguage: e.target.value })}
            className={control}
          >
            {translationSourceLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">目标语言</span>
          <select
            value={translationState.targetLanguage}
            onChange={(e) => onTranslationChange({ targetLanguage: e.target.value })}
            className={control}
          >
            {translationTargetLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">翻译语气</span>
          <select
            value={translationState.tone}
            onChange={(e) => onTranslationChange({ tone: e.target.value })}
            className={control}
          >
            {translationTones.map((tone) => (
              <option key={tone} value={tone}>{tone}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs leading-5 text-gray-400">点击对话框发送后，译文直接在对话中返回。</p>
    </div>
  );
}
