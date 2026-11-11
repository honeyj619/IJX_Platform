import type { RuyiCapability } from "../../types/ruyi";
import { X } from "lucide-react";

interface RuyiCapabilityStatusProps {
  capability: RuyiCapability | null;
  onExit: () => void;
}

export default function RuyiCapabilityStatus({ capability, onExit }: RuyiCapabilityStatusProps) {
  if (!capability) return null;

  return (
    <div className="flex items-center gap-2 rounded-full border border-theme-200 bg-theme-50 px-3 py-1.5 text-xs font-semibold text-theme-700 shadow-sm dark:border-theme-800 dark:bg-theme-900/20 dark:text-theme-300">
      <span>当前能力：{capability.name}</span>
      <button
        type="button"
        onClick={onExit}
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full text-theme-600 hover:bg-theme-200 hover:text-theme-800 dark:text-theme-300 dark:hover:bg-theme-800"
        title="退出能力"
      >
        <X size={10} />
      </button>
    </div>
  );
}
