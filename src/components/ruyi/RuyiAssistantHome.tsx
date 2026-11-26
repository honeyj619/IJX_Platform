import { useEffect, useRef } from 'react';
import { RUYI_ASSISTANT_AVATAR } from '../../data/people';
import type { RuyiCapability, RuyiCapabilitySubmission } from "../../types/ruyi";
import type { RuyiAgent } from "../../data/ruyiCapabilities";
import { Sparkles, X } from "lucide-react";
import RuyiConversationComposer from "./RuyiConversationComposer";
import RuyiPluginBar from "./capability/RuyiPluginBar";
import type { RuyiPanelDrafts } from "./capability/RuyiCapabilityPanel";

/**
 * V6 如意空间「新对话空白工作区」：
 * - 简洁欢迎语 + 一句能力说明 + 插件选择 tab（吸顶）+ 统一对话输入容器
 * - 插件选择入口从对话框移出，由首页插件 tab 承载：
 *   激活插件后页面定位上移，以插件 tab 吸顶，配置面板随输入容器在其下方展开
 * - 视觉焦点是对话输入容器，与会话页共用 Composer
 */

interface RuyiAssistantHomeProps {
  ownerName: string;
  /** 全量内置能力（插件 tab 取四插件用） */
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pluginTabsRef = useRef<HTMLDivElement>(null);
  const isPluginActive = !!activeCapability && activeCapability.mode !== "agent";

  // V6：插件激活后页面定位上移——滚动容器定位到插件 tab（tab 在容器内 sticky 吸顶）
  useEffect(() => {
    if (!isPluginActive) return;
    const container = scrollContainerRef.current;
    const tabs = pluginTabsRef.current;
    if (!container || !tabs) return;
    const containerRect = container.getBoundingClientRect();
    const tabsRect = tabs.getBoundingClientRect();
    const target = container.scrollTop + (tabsRect.top - containerRect.top) - 8;
    container.scrollTo({ top: Math.max(target, 0), behavior: "smooth" });
  }, [isPluginActive, activeCapabilityId]);

  return (
    <div ref={scrollContainerRef} className="flex flex-1 flex-col overflow-y-auto px-6 py-8 md:px-8" data-requirement-id="ruyi-unified-entry">
      <div className={`mx-auto flex w-full max-w-4xl flex-1 flex-col ${isPluginActive ? "justify-start" : "justify-center"}`}>
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
            我是如意助手，可以直接描述工作需求，或在下方选择公文、PPT、参谋、翻译插件配置参数后一起发送。
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

        {/* V6 插件选择 tab（激活后吸顶：sticky + 页面上移定位到此行） */}
        <div
          ref={pluginTabsRef}
          className="sticky top-0 z-10 -mx-2 mb-3 flex justify-center rounded-xl bg-white/95 px-2 py-2 shadow-sm backdrop-blur dark:bg-gray-900/95"
          data-requirement-id="ruyi-home-plugin-tabs"
        >
          <RuyiPluginBar
            capabilities={capabilities}
            activePluginId={activeCapability?.id ?? null}
            onSelect={onSelectCapability}
          />
        </div>

        {/* 统一对话输入容器（输入 + 已选插件配置一体化；插件选择在上方 tab） */}
        <RuyiConversationComposer
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
