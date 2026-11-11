import type { RuyiTaskEvent } from "../../types/ruyi";
import { RUYI_DEVICE_LABELS } from "../../types/ruyi";
import { Clock } from "lucide-react";

const eventDot: Record<RuyiTaskEvent["type"], string> = {
  created: "bg-gray-300 dark:bg-gray-500",
  "parameter-updated": "bg-blue-400",
  interrupted: "bg-orange-400",
  resumed: "bg-sky-400",
  confirmed: "bg-blue-500",
  executing: "bg-sky-500",
  failed: "bg-red-400",
  retried: "bg-amber-400",
  completed: "bg-emerald-500",
  cancelled: "bg-gray-400",
  "context-attached": "bg-theme-400",
  "context-removed": "bg-gray-400",
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }) + " " + d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

export default function RuyiTaskTimeline({ events }: { events: RuyiTaskEvent[] }) {
  if (events.length === 0) {
    return <p className="px-1 py-3 text-xs text-gray-400 dark:text-gray-500">暂无状态记录。</p>;
  }
  const ordered = [...events].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return (
    <ol className="relative ml-1.5 space-y-4 border-l border-gray-200 pl-5 dark:border-gray-700">
      {ordered.map((event) => (
        <li key={event.id} className="relative">
          <span className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ${eventDot[event.type] ?? "bg-gray-300"}`} />
          <p className="text-sm leading-6 text-gray-800 dark:text-gray-200">{event.label}</p>
          <p className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400 dark:text-gray-500">
            <Clock size={11} />
            {formatTime(event.createdAt)}
            <span>· {RUYI_DEVICE_LABELS[event.device]}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}
