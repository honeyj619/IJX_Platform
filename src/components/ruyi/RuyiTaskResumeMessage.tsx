import type { RuyiMessage } from "../../types/ruyi";
import { Play } from "lucide-react";

interface RuyiTaskResumeMessageProps {
  message: RuyiMessage;
  onResume: () => void;
}

export default function RuyiTaskResumeMessage({ message, onResume }: RuyiTaskResumeMessageProps) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-100">
      <p className="mb-3">{message.content}</p>
      <button
        type="button"
        onClick={onResume}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
      >
        <Play size={12} />
        继续创建会议
      </button>
    </div>
  );
}
