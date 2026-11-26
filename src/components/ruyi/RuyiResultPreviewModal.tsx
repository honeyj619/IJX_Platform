import { X, Download, FileText, Presentation, BarChart3, Languages, ListChecks, Settings2 } from "lucide-react";
import type { RuyiResultReference } from "../../types/ruyi";
import { buildRuyiResultPreviewContent, RUYI_RESULT_TYPE_LABELS } from "../../utils/ruyiResultDownload";

const typeIcon: Record<RuyiResultReference["type"], React.ReactNode> = {
  document: <FileText size={16} />,
  presentation: <Presentation size={16} />,
  report: <BarChart3 size={16} />,
  translation: <Languages size={16} />,
};

/**
 * V4：成果预览弹框（成果中心与会话内成果卡共用）
 * 展示生成快照（参数/模板/大纲）+ 只读正文预览 + 下载入口；不跳工作台。
 */
interface RuyiResultPreviewModalProps {
  result: RuyiResultReference;
  onClose: () => void;
  onDownload?: (result: RuyiResultReference) => void;
}

export default function RuyiResultPreviewModal({ result, onClose, onDownload }: RuyiResultPreviewModalProps) {
  const snapshot = result.snapshot;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      data-requirement-id="ruyi-result-preview"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-700">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-theme-50 text-theme-600 dark:bg-theme-900/20 dark:text-theme-300">
              {typeIcon[result.type]}
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">{result.title}</h3>
              <p className="mt-0.5 text-xs text-gray-400">
                {RUYI_RESULT_TYPE_LABELS[result.type]} · 已完成 · 生成于{" "}
                {new Date(result.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            {onDownload && (
              <button
                type="button"
                onClick={() => onDownload(result)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Download size={13} />
                下载
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="关闭预览"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 快照区（参数/模板/大纲） */}
        {snapshot && (snapshot.paramsSummary.length > 0 || snapshot.templateName || (snapshot.outline?.length ?? 0) > 0) && (
          <div className="flex-shrink-0 space-y-3 border-b border-gray-100 bg-gray-50 px-5 py-3.5 dark:border-gray-700 dark:bg-gray-900/40">
            {snapshot.paramsSummary.length > 0 && (
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {snapshot.paramsSummary.map((p) => (
                  <span key={p.label} className="text-xs text-gray-500 dark:text-gray-400">
                    {p.label}：<span className="font-medium text-gray-700 dark:text-gray-200">{p.value}</span>
                  </span>
                ))}
              </div>
            )}
            {snapshot.templateName && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Settings2 size={12} className="text-theme-500" />
                模板：<span className="font-medium text-gray-700 dark:text-gray-200">{snapshot.templateName}</span>
              </div>
            )}
            {(snapshot.outline?.length ?? 0) > 0 && (
              <div>
                <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <ListChecks size={12} className="text-theme-500" />
                  大纲
                </div>
                <ol className="ml-5 list-decimal space-y-0.5 text-xs leading-5 text-gray-600 dark:text-gray-300">
                  {snapshot.outline!.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* 正文预览 */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-gray-700 dark:text-gray-200">
            {buildRuyiResultPreviewContent(result)}
          </pre>
        </div>
      </div>
    </div>
  );
}
