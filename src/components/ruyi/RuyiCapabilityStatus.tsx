import type { RuyiCapability } from "../../types/ruyi";
import { X } from "lucide-react";

interface RuyiCapabilityStatusProps {
  /** 当前激活的内置专业能力；智能体切换统一在左侧导航栏，此处不再提供入口 */
  capability: RuyiCapability | null;
  onExit: () => void;
}

export default function RuyiCapabilityStatus({ capability, onExit }: RuyiCapabilityStatusProps) {
  if (!capability || capability.mode === "agent") return null;

  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <span>当前能力：{capability.name}</span>
      <button
        type="button"
        onClick={onExit}
        className="flex h-4 w-4 items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700"
        title="退出能力"
        aria-label="退出能力"
      >
        <X size={10} />
      </button>
    </div>
  );
}
