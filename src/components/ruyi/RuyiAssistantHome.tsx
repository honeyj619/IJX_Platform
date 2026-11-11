import { RUYI_ASSISTANT_AVATAR } from '../../data/people';
import type { RuyiCapability } from "../../types/ruyi";
import { Sparkles, Search, FileText, PresentationIcon, Target, Languages, MonitorCog } from "lucide-react";
import { Send, Paperclip, X } from "lucide-react";

interface RuyiAssistantHomeProps {
  ownerName: string;
  capabilities: RuyiCapability[];
  activeCapabilityId?: string | null;
  suggestedPrompts: string[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSelectCapability: (capabilityId: RuyiCapability["id"]) => void;
  onUploadAttachment?: () => void;
}

const capabilityIcons: Record<string, React.ReactNode> = {
  "work-query": <Search size={18} />,
  document: <FileText size={18} />,
  presentation: <PresentationIcon size={18} />,
  advisor: <Target size={18} />,
  translation: <Languages size={18} />,
  "it-service": <MonitorCog size={18} />,
};

export default function RuyiAssistantHome({
  ownerName,
  capabilities,
  activeCapabilityId,
  suggestedPrompts,
  input,
  onInputChange,
  onSend,
  onSelectCapability,
  onUploadAttachment,
}: RuyiAssistantHomeProps) {
  const activeCapability = capabilities.find((c) => c.id === activeCapabilityId);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8 md:px-8" data-requirement-id="ruyi-unified-entry">
      <div className="mx-auto w-full max-w-4xl" data-requirement-id="ruyi-plugin-state">
        {/* 问候 */}
        <div className="mb-10 flex flex-col items-center text-center md:flex-row md:justify-between md:text-left">
          <div className="mb-6 md:mb-0">
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Hi，{ownerName}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              欢迎回到如意空间，有什么可以帮您的吗？
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-theme-200 to-theme-100 opacity-60 blur-md" />
            <img
              src={RUYI_ASSISTANT_AVATAR}
              alt="如意助手"
              className="relative h-28 w-28 rounded-full border-4 border-white object-cover shadow-xl dark:border-gray-700"
            />
          </div>
        </div>

        {/* 快捷能力 */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
            <Sparkles size={14} className="text-theme-500" />
            快捷能力
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {capabilities.map((capability) => {
              const active = activeCapabilityId === capability.id;
              return (
                <button
                  key={capability.id}
                  type="button"
                  onClick={() => onSelectCapability(capability.id)}
                  className={`group flex flex-col items-center gap-2 rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                    active
                      ? "border-theme-200 bg-theme-50 text-theme-700 dark:border-theme-800 dark:bg-theme-900/20 dark:text-theme-300"
                      : "border-gray-100 bg-white text-gray-700 hover:border-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-theme-600 text-white"
                        : "bg-gray-100 text-gray-500 group-hover:bg-theme-50 group-hover:text-theme-600 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {capabilityIcons[capability.id] ?? <Sparkles size={18} />}
                  </div>
                  <span className="text-xs font-semibold">{capability.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 统一输入 */}
        <div className="relative rounded-2xl border-2 border-gray-100 bg-white p-5 shadow-sm transition-all focus-within:border-theme-200 focus-within:ring-1 focus-within:ring-theme-100 dark:border-gray-700 dark:bg-gray-800 md:p-6">
          {activeCapability && (
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-50 px-3 py-1 text-xs font-semibold text-theme-700 dark:bg-theme-900/20 dark:text-theme-300">
                {capabilityIcons[activeCapability.id] ?? <Sparkles size={12} />}
                {activeCapability.name}
              </span>
              <button
                type="button"
                onClick={() => onSelectCapability(activeCapability.id)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500"
                title="关闭能力"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <textarea
           
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={activeCapability?.promptPlaceholder ?? "你想问我什么呢？"}
            className="min-h-[112px] w-full resize-none border-none bg-transparent pr-24 text-lg font-medium leading-8 text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder-gray-500"/>
          <div className="absolute bottom-5 right-5 flex items-center gap-2">
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

        {/* 猜你想问 */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-theme-100/70 bg-white/75 shadow-[0_14px_36px_rgba(148,76,126,0.08)] backdrop-blur dark:border-theme-900/40 dark:bg-gray-800/75">
          <div className="grid gap-0 md:grid-cols-[140px_1fr]">
            <div className="flex items-center gap-2 border-b border-theme-50 bg-gradient-to-br from-theme-50 to-white px-4 py-3 md:border-b-0 md:border-r dark:border-theme-900/40 dark:from-theme-900/25 dark:to-gray-800">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-theme-600 text-white shadow-sm">
                <Sparkles size={14} />
              </span>
              <div>
                <div className="text-xs font-semibold text-theme-700 dark:text-theme-300">猜你想问</div>
                <div className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">快速开始</div>
              </div>
            </div>
            <div className="grid gap-px bg-theme-50/80 p-px dark:bg-gray-700/60 sm:grid-cols-2 xl:grid-cols-4">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => onInputChange(prompt)}
                  className="group flex min-h-[52px] items-center bg-white px-3 py-2 text-left text-xs font-medium leading-5 text-gray-600 transition-colors hover:bg-theme-50 hover:text-theme-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-theme-900/25 dark:hover:text-theme-300"
                >
                  <span className="line-clamp-2">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
