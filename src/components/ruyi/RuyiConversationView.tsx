import { useEffect, useRef } from "react";
import type { RuyiConversation, RuyiMessage, RuyiCapability, RuyiMessageActionType } from "../../types/ruyi";
import { Send, Paperclip } from "lucide-react";
import RuyiMessageRenderer from "./RuyiMessageRenderer";
import RuyiCapabilityStatus from "./RuyiCapabilityStatus";
import RuyiEmptyState from "./RuyiEmptyState";

interface RuyiConversationViewProps {
  conversation: RuyiConversation;
  messages: RuyiMessage[];
  activeCapability: RuyiCapability | null;
  onExitCapability: () => void;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onUploadAttachment?: () => void;
  onAction: (type: RuyiMessageActionType, message: RuyiMessage) => void;
}

export default function RuyiConversationView({
  conversation,
  messages,
  activeCapability,
  onExitCapability,
  input,
  onInputChange,
  onSend,
  onUploadAttachment,
  onAction,
}: RuyiConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col h-full overflow-hidden">
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white/80 px-6 backdrop-blur dark:border-gray-700 dark:bg-gray-900/80">
        <h2 className="truncate text-base font-semibold text-gray-900 dark:text-white">{conversation.title}</h2>
        <RuyiCapabilityStatus capability={activeCapability} onExit={onExitCapability} />
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 md:px-8" data-requirement-id="ruyi-capability-routing">
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

      <div className="flex-shrink-0 border-t border-gray-100 bg-white/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.04)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-xl border-2 border-gray-100 bg-white p-4 shadow-sm transition-all focus-within:border-theme-200 focus-within:ring-1 focus-within:ring-theme-100 dark:border-gray-700 dark:bg-gray-800">
            <textarea
              data-requirement-id="ruyi-conversation-input"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="继续向如意助手提问..."
              className="min-h-[80px] w-full resize-none border-none bg-transparent pr-24 text-base leading-7 text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder-gray-500"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
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
              <button
                type="button"
                onClick={onSend}
                className="rounded-full bg-gradient-to-r from-theme-500 to-theme-600 p-2 text-white shadow-sm transition-all hover:from-theme-600 hover:to-theme-700 hover:shadow"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          <div className="mt-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
            内容AI辅助生成，请谨慎识别
          </div>
        </div>
      </div>
    </div>
  );
}
