import type { RuyiResultReference } from "../../types/ruyi";
import { FileText, Presentation, BarChart3, Languages, ExternalLink, ShieldOff } from "lucide-react";
import { getRuyiResultDisplayTitle, getRuyiResultDisplayReason, canOpenRuyiResult } from "../../utils/ruyiResultPresentation";

interface RuyiResultCardProps {
  result: RuyiResultReference;
  onOpen: () => void;
}

const typeIcon: Record<RuyiResultReference["type"], React.ReactNode> = {
  document: <FileText size={18} />,
  presentation: <Presentation size={18} />,
  report: <BarChart3 size={18} />,
  translation: <Languages size={18} />,
};

const statusLabel: Record<RuyiResultReference["status"], string> = {
  editable: "可编辑",
  completed: "已完成",
  invalid: "已失效",
  forbidden: "无权限",
};

const statusClass: Record<RuyiResultReference["status"], string> = {
  editable: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
  invalid: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
  forbidden: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300",
};

export default function RuyiResultCard({ result, onOpen }: RuyiResultCardProps) {
  const openable = canOpenRuyiResult(result);
  const displayTitle = getRuyiResultDisplayTitle(result);
  const displayReason = getRuyiResultDisplayReason(result);
  return (
    <div
      className="flex w-full max-w-2xl items-stretch overflow-hidden rounded-xl border border-theme-100 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-theme-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      data-requirement-id="ruyi-result-reference"
    >
      <div className={`flex w-20 flex-shrink-0 items-center justify-center text-white ${openable ? "bg-gradient-to-br from-theme-500 to-theme-700" : "bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"}`}>
        {openable ? (typeIcon[result.type] ?? <FileText size={24} />) : <ShieldOff size={22} />}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold ${statusClass[result.status]}`}>
            {statusLabel[result.status]}
          </span>
          <span className="text-xs text-gray-400">{result.capabilityId}</span>
        </div>
        <h4 className="mb-2 text-base font-bold text-gray-950 dark:text-white">{displayTitle}</h4>
        {(result.status === "invalid" || result.status === "forbidden") && displayReason && (
          <p className={`mb-2 rounded-md px-2.5 py-1.5 text-xs leading-5 ${result.status === "invalid" ? "bg-gray-50 text-gray-500 dark:bg-gray-700/50 dark:text-gray-400" : "bg-red-50/70 text-red-600 dark:bg-red-900/20 dark:text-red-300"}`}>
            {displayReason}
          </p>
        )}
        {openable ? (
          <button
            type="button"
            onClick={onOpen}
            className="mt-auto inline-flex items-center gap-1 self-start text-sm font-semibold text-theme-700 transition-colors hover:text-theme-800 dark:text-theme-300"
          >
            <ExternalLink size={14} />
            打开成果
          </button>
        ) : (
          <span className="mt-auto inline-flex items-center gap-1 self-start cursor-not-allowed rounded bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400 dark:bg-gray-700 dark:text-gray-500">
            {result.status === "invalid" ? "成果已失效" : "无权限查看"}
          </span>
        )}
      </div>
    </div>
  );
}
