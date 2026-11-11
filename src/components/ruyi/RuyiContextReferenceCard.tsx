import { useState } from "react";
import type { RuyiContextReference } from "../../types/ruyi";
import { Link } from "react-router-dom";
import { Calendar, Video, FileText, CheckSquare, ClipboardList, X, Unlink } from "lucide-react";

const typeIcon = {
  calendar: <Calendar size={15} />,
  meeting: <Video size={15} />,
  document: <FileText size={15} />,
  approval: <CheckSquare size={15} />,
  "work-item": <ClipboardList size={15} />,
};

const typeLabel = {
  calendar: "日历",
  meeting: "会议",
  document: "文档",
  approval: "审批",
  "work-item": "事项",
};

interface RuyiContextReferenceCardProps {
  reference: RuyiContextReference;
  /** 提供时显示"取消引用"（带二次确认） */
  onRemove?: () => void;
  compact?: boolean;
}

export default function RuyiContextReferenceCard({ reference, onRemove, compact = false }: RuyiContextReferenceCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div
      className={`rounded-xl border border-theme-100 bg-theme-50/60 dark:border-theme-900/40 dark:bg-theme-900/10 ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
      data-requirement-id="ruyi-cross-device-context"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-theme-100 text-theme-600 dark:bg-theme-900/30 dark:text-theme-300">
          {typeIcon[reference.type]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-theme-600 dark:text-theme-300">{typeLabel[reference.type]}</span>
            <Link
              to={reference.sourceRoute}
              className="truncate text-sm font-semibold text-gray-900 hover:underline dark:text-white"
            >
              {reference.title}
            </Link>
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{reference.summary}</p>
        </div>
        {onRemove && (
          <div className="relative flex-shrink-0">
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-red-200 hover:text-red-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
              title="取消引用该业务对象"
            >
              <Unlink size={12} />
              取消引用
            </button>
            {confirming && (
              <div className="absolute right-0 top-9 z-10 w-56 rounded-xl border border-gray-200 bg-white p-3.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">取消引用「{reference.title}」？</p>
                <p className="mt-1 text-[11px] leading-4 text-gray-500 dark:text-gray-400">
                  取消后该会话不再携带此业务对象，再次使用需重新关联。
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-md px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirming(false); onRemove(); }}
                    className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600"
                  >
                    确认取消
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
