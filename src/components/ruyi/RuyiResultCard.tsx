import type { RuyiResultReference } from "../../types/ruyi";
import { FileText, Presentation, BarChart3, Languages, Eye, Download, RotateCcw, Trash2 } from "lucide-react";
import { canOpenRuyiResult } from "../../utils/ruyiResultPresentation";

const typeIcon: Record<RuyiResultReference["type"], React.ReactNode> = {
  document: <FileText size={18} />,
  presentation: <Presentation size={18} />,
  report: <BarChart3 size={18} />,
  translation: <Languages size={18} />,
};

/**
 * V4：会话内成果卡。
 * 打开成果不再跳工作台——操作收敛为 预览（Modal）/ 下载 / 重新生成（工具锁定会话）/ 删除（已完成后允许）。
 * 回流快照（参数/模板/大纲）直接渲染在卡片内。
 */
interface RuyiResultCardProps {
  result: RuyiResultReference;
  onPreview: () => void;
  onDownload: () => void;
  /** 工具锁定会话展示"重新生成"（展开对应工具输入 UI） */
  onRegenerate?: () => void;
  onDelete?: () => void;
}

export default function RuyiResultCard({ result, onPreview, onDownload, onRegenerate, onDelete }: RuyiResultCardProps) {
  const openable = canOpenRuyiResult(result);
  const snapshot = result.snapshot;
  if (!openable) {
    // 已删除成果：保留占位展示，不可操作
    return (
      <div
        className="flex w-full max-w-2xl items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/60"
        data-requirement-id="ruyi-result-reference"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-700">
          {typeIcon[result.type]}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-gray-500 dark:text-gray-400">已删除成果</h4>
          <p className="mt-0.5 text-xs text-gray-400">该成果已被删除，可在 AI 成果中心查看记录。</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className="w-full max-w-2xl overflow-hidden rounded-xl border border-theme-100 bg-white text-left shadow-sm dark:border-gray-700 dark:bg-gray-800"
      data-requirement-id="ruyi-result-reference"
    >
      {/* 快照：参数 / 模板 / 大纲 */}
      {snapshot && (snapshot.paramsSummary.length > 0 || snapshot.templateName || (snapshot.outline?.length ?? 0) > 0) && (
        <div className="space-y-2 border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
          {snapshot.paramsSummary.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {snapshot.paramsSummary.map((p) => (
                <span key={p.label} className="text-[11px] text-gray-500 dark:text-gray-400">
                  {p.label}：<span className="font-medium text-gray-700 dark:text-gray-200">{p.value}</span>
                </span>
              ))}
            </div>
          )}
          {snapshot.templateName && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              模板：<span className="font-medium text-gray-700 dark:text-gray-200">{snapshot.templateName}</span>
            </p>
          )}
          {(snapshot.outline?.length ?? 0) > 0 && (
            <details className="text-[11px] text-gray-500 dark:text-gray-400">
              <summary className="cursor-pointer select-none font-medium">生成大纲（{snapshot.outline!.length} 项）</summary>
              <ol className="ml-5 mt-1 list-decimal space-y-0.5 leading-5">
                {snapshot.outline!.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            </details>
          )}
        </div>
      )}
      <div className="flex items-stretch gap-3 p-4">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-theme-500 to-theme-700 text-white">
          {typeIcon[result.type]}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
              已完成
            </span>
            <h4 className="truncate text-sm font-bold text-gray-950 dark:text-white">{result.title}</h4>
          </div>
          <p className="mt-0.5 text-[11px] text-gray-400">生成于 {new Date(result.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}</p>
        </div>
      </div>
      {/* 操作行：预览 / 下载 / 重新生成 / 删除 */}
      <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 px-4 py-2.5 dark:border-gray-700">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-1 text-xs font-semibold text-theme-700 transition-colors hover:text-theme-800 dark:text-theme-300"
        >
          <Eye size={13} />
          预览
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 transition-colors hover:text-theme-700 dark:text-gray-300 dark:hover:text-theme-300"
        >
          <Download size={13} />
          下载
        </button>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 transition-colors hover:text-theme-700 dark:text-gray-300 dark:hover:text-theme-300"
          >
            <RotateCcw size={13} />
            重新生成
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors hover:text-red-600"
          >
            <Trash2 size={13} />
            删除
          </button>
        )}
      </div>
    </div>
  );
}
