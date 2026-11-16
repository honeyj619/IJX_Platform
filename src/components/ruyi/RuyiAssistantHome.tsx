import { RUYI_ASSISTANT_AVATAR } from '../../data/people';
import type { RuyiCapability, RuyiCapabilitySubmission } from "../../types/ruyi";
import type { RuyiAgent } from "../../data/ruyiCapabilities";
import { Sparkles, X } from "lucide-react";
import RuyiConversationComposer from "./RuyiConversationComposer";
import type { RuyiPanelDrafts } from "./capability/RuyiCapabilityPanel";

/**
 * V3.2 如意空间「新对话空白工作区」：
 * - 简洁欢迎语 + 一句能力说明 + 统一对话输入容器（含插件入口与配置）
 * - 不再渲染快捷能力宫格（非插件功能由左侧固定入口或推荐问题承载）
 * - 视觉焦点是对话输入容器，与会话页共用 Composer
 */

interface RuyiAssistantHomeProps {
  ownerName: string;
  /** 全量内置能力（Composer 插件入口取四插件用） */
  capabilities: RuyiCapability[];
  activeAgent: RuyiAgent;
  activeCapabilityId?: string | null;
  /** 推荐问题（点击填入输入框，不直接发送） */
  suggestedPrompts: string[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSelectCapability: (capabilityId: RuyiCapability["id"]) => void;
  onSelectAgent: (capabilityId: RuyiCapability["id"] | null) => void;
  /** 统一插件提交（插件选中时发送走此链路） */
  panelDrafts: RuyiPanelDrafts;
  onPanelDraftChange: (patch: Partial<RuyiPanelDrafts>) => void;
  onSubmitCapability?: (submission: RuyiCapabilitySubmission) => void;
  capabilitySubmitting?: boolean;
}

export default function RuyiAssistantHome({
  ownerName,
  capabilities,
  activeAgent,
  activeCapabilityId,
  suggestedPrompts,
  input,
  onInputChange,
  onSend,
  onSelectCapability,
  onSelectAgent,
  panelDrafts,
  onPanelDraftChange,
  onSubmitCapability,
  capabilitySubmitting,
}: RuyiAssistantHomeProps) {
  const activeCapability = capabilities.find((c) => c.id === activeCapabilityId);
  const showCapabilityChip = !!activeCapability && activeCapability.mode !== "agent";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8 md:px-8" data-requirement-id="ruyi-unified-entry">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
        {/* 简洁欢迎区 */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-theme-200 to-theme-100 opacity-60 blur-md" />
            <img
              src={RUYI_ASSISTANT_AVATAR}
              alt="如意助手"
              className="relative h-20 w-20 rounded-full border-4 border-white object-cover shadow-xl dark:border-gray-700"
            />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
            你好，{ownerName}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            我是如意助手，可以直接描述工作需求，或在输入框下方选择公文、PPT、参谋、翻译插件配置参数后一起发送。
          </p>
          {/* 当前智能体/能力状态行 */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {activeAgent.id !== "ruyi-assistant" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-50 px-3 py-1 text-xs font-semibold text-theme-700 dark:bg-theme-900/20 dark:text-theme-300">
                当前智能体：{activeAgent.name}
                <button
                  type="button"
                  onClick={() => onSelectAgent(null)}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/40"
                  aria-label="切回如意助手"
                  title="切回如意助手"
                >
                  <X size={11} />
                </button>
              </span>
            )}
            {showCapabilityChip && activeCapability && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                {activeCapability.name}
              </span>
            )}
          </div>
        </div>

        {/* 统一对话输入容器（输入 + 插件入口 + 插件配置一体化） */}
        <RuyiConversationComposer
          capabilities={capabilities}
          activePluginId={activeCapability?.id ?? null}
          activePlugin={activeCapability ?? null}
          onSelectPlugin={onSelectCapability}
          input={input}
          onInputChange={onInputChange}
          onSend={onSend}
          onSubmitPlugin={(submission) => onSubmitCapability?.(submission)}
          panelDrafts={panelDrafts}
          onPanelDraftChange={onPanelDraftChange}
          submitting={capabilitySubmitting}
          placeholder={activeAgent.promptPlaceholder}
        />

        {/* 推荐问题（简短、非插件；点击填入输入框） */}
        <div className="mt-5" data-requirement-id="ruyi-quick-prompts">
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500">
            <Sparkles size={12} className="text-theme-500" />
            试试这样问
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onInputChange(prompt)}
                className="rounded-full border border-gray-100 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-theme-200 hover:bg-theme-50 hover:text-theme-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-theme-800 dark:hover:bg-theme-900/30 dark:hover:text-theme-300"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
