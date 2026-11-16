import { useEffect, useRef } from "react";
import type {
  RuyiConversation,
  RuyiMessage,
  RuyiCapability,
  RuyiMessageActionType,
  RuyiCapabilitySubmission,
} from "../../types/ruyi";
import type { RuyiAgent } from "../../data/ruyiCapabilities";
import RuyiMessageRenderer from "./RuyiMessageRenderer";
import RuyiCapabilityStatus from "./RuyiCapabilityStatus";
import RuyiEmptyState from "./RuyiEmptyState";
import RuyiConversationComposer from "./RuyiConversationComposer";
import type { RuyiPanelDrafts } from "./capability/RuyiCapabilityPanel";

/**
 * V3.2 会话工作区：
 * 历史消息列表 + 统一输入容器（RuyiConversationComposer，与首页空白工作区同一组件）。
 * 插件配置是当前输入状态（随 Composer），不插入旧消息内部。
 */

interface RuyiConversationViewProps {
  conversation: RuyiConversation;
  messages: RuyiMessage[];
  activeCapability: RuyiCapability | null;
  agent: RuyiAgent;
  onExitCapability: () => void;
  /** 全量内置能力（Composer 插件入口取四插件用） */
  capabilities: RuyiCapability[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  /** 插件入口选择（选中/切换/收起由父层统一处理） */
  onSelectPlugin: (capabilityId: RuyiCapability["id"]) => void;
  onUploadAttachment?: () => void;
  onAction: (type: RuyiMessageActionType, message: RuyiMessage) => void;
  /** 统一插件面板（会话内选中插件时显示在 Composer 内） */
  panelDrafts: RuyiPanelDrafts;
  onPanelDraftChange: (patch: Partial<RuyiPanelDrafts>) => void;
  onSubmitCapability?: (submission: RuyiCapabilitySubmission) => void;
  capabilitySubmitting?: boolean;
}

export default function RuyiConversationView({
  conversation,
  messages,
  activeCapability,
  agent,
  onExitCapability,
  capabilities,
  input,
  onInputChange,
  onSend,
  onSelectPlugin,
  onUploadAttachment,
  onAction,
  panelDrafts,
  onPanelDraftChange,
  onSubmitCapability,
  capabilitySubmitting,
}: RuyiConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden" data-requirement-id="ruyi-capability-routing">
      {/* 智能体切换统一在左侧导航栏；右侧留出 pr-32 避开需求模式浮标，仅保留内置能力状态 */}
      <header className="flex h-16 flex-shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white/80 pl-6 pr-32 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
        <h2 className="truncate text-base font-semibold text-gray-900 dark:text-white">{conversation.title}</h2>
        <RuyiCapabilityStatus capability={activeCapability} onExit={onExitCapability} />
      </header>

      {/* 历史消息（独立滚动） */}
      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8">
        <div className="mx-auto max-w-4xl space-y-8" data-requirement-id="ruyi-single-task-poc">
          {messages.length === 0 ? (
            <RuyiEmptyState variant="no-messages" />
          ) : (
            messages.map((message) => (
              <RuyiMessageRenderer key={message.id} message={message} onAction={onAction} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 统一输入容器（输入 + 插件入口 + 插件配置一体化；与首页共用） */}
      <div className="flex-shrink-0 px-6 py-4 md:px-8" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        <div className="mx-auto max-w-4xl">
          <RuyiConversationComposer
            capabilities={capabilities}
            activePluginId={activeCapability?.id ?? null}
            activePlugin={activeCapability}
            onSelectPlugin={onSelectPlugin}
            input={input}
            onInputChange={onInputChange}
            onSend={onSend}
            onSubmitPlugin={(submission) => onSubmitCapability?.(submission)}
            onUploadAttachment={onUploadAttachment}
            panelDrafts={panelDrafts}
            onPanelDraftChange={onPanelDraftChange}
            submitting={capabilitySubmitting}
            placeholder={`继续向${agent.name}提问...`}
          />
          <div className="mt-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
            内容AI辅助生成，请谨慎识别
          </div>
        </div>
      </div>
    </div>
  );
}
