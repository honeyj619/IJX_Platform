import type {
  RuyiCapability,
  RuyiCapabilitySubmission,
} from "../../types/ruyi";
import { Send, Paperclip } from "lucide-react";
import RuyiPluginBar from "./capability/RuyiPluginBar";
import RuyiCapabilityPanel, {
  validatePanelSubmission,
  buildPanelSubmission,
  type RuyiPanelDrafts,
} from "./capability/RuyiCapabilityPanel";

/**
 * V3.2 统一对话输入容器（如意空间首页空白工作区 + 会话页共用）：
 *
 * ┌──────────────────────────────┐
 * │ [插件chip ×] 多行文字输入     │
 * │                附件  发送     │
 * ├──────────────────────────────┤ ← 分隔线（同一容器内）
 * │ 插件：公文 PPT 参谋 翻译      │
 * ├──────────────────────────────┤
 * │ 当前插件配置（向下展开）       │
 * └──────────────────────────────┘
 *
 * - 输入区 / 插件入口 / 插件配置同属一个工作容器
 * - 普通发送与插件提交在此分流（单一发送按钮）
 * - 首页和会话页不得各自实现输入框
 */

interface RuyiConversationComposerProps {
  /** 全量内置能力（插件入口取四插件用） */
  capabilities: RuyiCapability[];
  /** 当前选中插件 id（null = 普通对话） */
  activePluginId: RuyiCapability["id"] | null;
  /** 当前能力完整定义（会话页取会话激活能力；首页取本地选中） */
  activePlugin: RuyiCapability | null;
  onSelectPlugin: (capabilityId: RuyiCapability["id"]) => void;
  input: string;
  onInputChange: (value: string) => void;
  /** 普通问答发送（无插件时） */
  onSend: () => void;
  /** 插件提交（有插件且校验通过时） */
  onSubmitPlugin: (submission: RuyiCapabilitySubmission) => void;
  onUploadAttachment?: () => void;
  /** 插件草稿（按插件分槽） */
  panelDrafts: RuyiPanelDrafts;
  onPanelDraftChange: (patch: Partial<RuyiPanelDrafts>) => void;
  /** 提交中（防重复点击） */
  submitting?: boolean;
  /** 输入框提示语（普通对话随智能体/会话变化） */
  placeholder?: string;
}

export default function RuyiConversationComposer({
  capabilities,
  activePluginId,
  activePlugin,
  onSelectPlugin,
  input,
  onInputChange,
  onSend,
  onSubmitPlugin,
  onUploadAttachment,
  panelDrafts,
  onPanelDraftChange,
  submitting,
  placeholder,
}: RuyiConversationComposerProps) {
  // 插件面板：仅四插件（agent 能力不出现）
  const panelCapability = activePlugin && activePlugin.mode !== "agent" ? activePlugin : null;
  const validationError = panelCapability
    ? validatePanelSubmission(panelCapability, panelDrafts, input)
    : "";
  const sendDisabled = !!panelCapability && (!!validationError || !!submitting);

  const handleSend = () => {
    if (panelCapability) {
      const error = validatePanelSubmission(panelCapability, panelDrafts, input);
      if (error) return; // 校验失败不发送（配置区下方已提示）
      onSubmitPlugin(buildPanelSubmission(panelCapability, panelDrafts, input));
      return;
    }
    onSend();
  };

  return (
    <div data-requirement-id="ruyi-conversation-composer">
      {/* ===== 插件入口行（输入容器外，文本框上方独立一行） ===== */}
      <div className="mb-2 px-1">
        <RuyiPluginBar
          capabilities={capabilities}
          activePluginId={activePluginId}
          onSelect={onSelectPlugin}
        />
      </div>

      {/* ===== 输入容器 ===== */}
      <div
        className="rounded-2xl border-2 border-gray-100 bg-white shadow-sm transition-all focus-within:border-theme-200 focus-within:ring-1 focus-within:ring-theme-100 dark:border-gray-700 dark:bg-gray-800"
        data-requirement-id="ruyi-conversation-input-box"
      >
      {/* ===== 输入区 ===== */}
      <div className="p-4 md:p-5">
        {/* 已选插件 chip（关闭=收起面板，恢复普通输入） */}
        {panelCapability && (
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-theme-600 px-2.5 py-1 text-xs font-semibold text-white">
              {panelCapability.name}创作
              <button
                type="button"
                onClick={() => onSelectPlugin(panelCapability.id)}
                className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-white/20"
                aria-label={`收起${panelCapability.name}插件`}
                title="收起插件，恢复普通对话"
              >
                <span className="text-xs leading-none">×</span>
              </button>
            </span>
            <span className="text-[11px] text-gray-400">插件参数将随发送一起提交</span>
          </div>
        )}
        <textarea
          data-requirement-id="ruyi-conversation-input"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={panelCapability?.promptPlaceholder ?? placeholder ?? "请输入你的问题或工作要求"}
          className="min-h-[96px] w-full resize-none border-none bg-transparent pr-2 text-base leading-7 text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder-gray-500"
        />
        {/* 操作行：附件 + 发送（单一发送按钮） */}
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            {onUploadAttachment && (
              <button
                type="button"
                onClick={onUploadAttachment}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-theme-50 hover:text-theme-500 dark:text-gray-500 dark:hover:bg-theme-900/20"
                title="上传附件"
              >
                <Paperclip size={18} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={sendDisabled}
            title={sendDisabled && validationError ? validationError : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all ${
              sendDisabled
                ? "cursor-not-allowed bg-gray-300 shadow-none dark:bg-gray-600"
                : "bg-gradient-to-r from-theme-500 to-theme-600 hover:from-theme-600 hover:to-theme-700 hover:shadow"
            }`}
          >
            <Send size={16} />
            发送
          </button>
        </div>
      </div>

      {/* ===== 当前插件配置区（输入容器内、输入区下方展开） ===== */}
      {panelCapability && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 dark:border-gray-700 md:px-5">
          <RuyiCapabilityPanel
            capability={panelCapability}
            variant="full"
            drafts={panelDrafts}
            promptText={input}
            onDraftChange={onPanelDraftChange}
          />
          {validationError && (
            <div className="mt-2 text-xs text-red-500" role="alert">
              {validationError}
            </div>
          )}
          <p className="mt-2 text-[11px] leading-4 text-gray-400">
            插件负责收集参数；在上方输入框补充需求后点击「发送」一起提交。
          </p>
        </div>
      )}
      </div>
    </div>
  );
}
