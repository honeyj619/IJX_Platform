import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRuyiStore, RUYI_MAIN_OWNER_ID } from "../store/ruyiStore";
import type { RuyiResultReference } from "../types/ruyi";
import { getRuyiResultDisplayTitle } from "../utils/ruyiResultPresentation";
import { downloadRuyiResult, RUYI_RESULT_TYPE_LABELS } from "../utils/ruyiResultDownload";
import RuyiResultPreviewModal from "../components/ruyi/RuyiResultPreviewModal";
import { Eye, Download, Trash2, FileText, Presentation, BarChart3, Languages, MessageSquare, Inbox } from "lucide-react";

type TypeFilter = "all" | "document" | "presentation" | "report" | "translation";
type StatusFilter = "all" | "completed" | "deleted";

const typeTabs: Array<{ id: TypeFilter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "document", label: "公文" },
  { id: "presentation", label: "PPT" },
  { id: "report", label: "汇报" },
  { id: "translation", label: "翻译" },
];

const statusTabs: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "completed", label: "已完成" },
  { id: "deleted", label: "已删除" },
];

const typeIcon: Record<RuyiResultReference["type"], React.ReactNode> = {
  document: <FileText size={16} />,
  presentation: <Presentation size={16} />,
  report: <BarChart3 size={16} />,
  translation: <Languages size={16} />,
};

/**
 * V4：AI 成果中心——纯成果列表。
 * 打开成果不跳工作台：每项操作为 预览（Modal）/ 下载 / 删除（确认弹框）。
 */
interface RuyiResultCenterProps {
  demoId?: string | null;
}

export default function RuyiResultCenter({ demoId }: RuyiResultCenterProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [previewResultId, setPreviewResultId] = useState<string | null>(null);
  const [deleteResultId, setDeleteResultId] = useState<string | null>(null);
  const ownerId = useRuyiStore((s) => s.currentOwnerId) ?? RUYI_MAIN_OWNER_ID;
  const getOwnerResults = useRuyiStore((s) => s.getOwnerResults);
  const deleteResult = useRuyiStore((s) => s.deleteResult);
  const conversations = useRuyiStore((s) => s.conversations);

  const results = useMemo(
    () => getOwnerResults(ownerId, { type: typeFilter, status: statusFilter }),
    [getOwnerResults, ownerId, typeFilter, statusFilter],
  );
  const totalCount = useMemo(() => getOwnerResults(ownerId).length, [getOwnerResults, ownerId]);
  const previewResult = previewResultId ? results.find((r) => r.id === previewResultId) ?? null : null;
  const deleteTarget = deleteResultId ? useRuyiStore.getState().results[deleteResultId] : null;

  const withDemo = (to: string) => (demoId ? `${to}${to.includes("?") ? "&" : "?"}demo=${demoId}` : to);

  const handleDeleteConfirm = () => {
    if (deleteResultId) deleteResult(deleteResultId);
    setDeleteResultId(null);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/80">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">AI 成果</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">如意助手生成的公文、PPT、汇报与翻译统一归档</p>
        </div>
      </header>

      <div className="flex flex-col gap-2.5 border-b border-gray-100 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900" data-requirement-id="ruyi-result-center">
        <div className="flex items-center gap-1">
          <span className="mr-1 text-[11px] font-medium text-gray-400">类型</span>
          {typeTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === t.id
                  ? "bg-theme-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-1 text-[11px] font-medium text-gray-400">状态</span>
          {statusTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatusFilter(t.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === t.id
                  ? "bg-theme-600 text-white"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-theme-50 dark:bg-theme-900/20">
              <Inbox className="h-7 w-7 text-theme-500" />
            </div>
            <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">暂无 AI 成果</h3>
            <p className="mb-5 max-w-sm text-sm text-gray-500 dark:text-gray-400">
              在对话中生成的公文、PPT、汇报会自动归档到这里。
            </p>
            <Link
              to={withDemo("/pc_client/ruyi-zone")}
              className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-theme-700"
            >
              前往对话
            </Link>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <h3 className="mb-1.5 text-sm font-semibold text-gray-900 dark:text-white">当前筛选无匹配成果</h3>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">换个类型或状态再试。</p>
            <button
              type="button"
              onClick={() => { setTypeFilter("all"); setStatusFilter("all"); }}
              className="text-sm font-medium text-theme-600 hover:underline dark:text-theme-300"
            >
              清除筛选
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {results.map((result) => {
              const isDeleted = result.status === "deleted";
              const conversationExists = !!result.conversationId && !!conversations[result.conversationId];
              return (
                <div key={result.id} className="flex items-center gap-3.5 px-6 py-4" data-requirement-id="ruyi-result-permission-state">
                  <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${isDeleted ? "bg-gray-100 text-gray-400 dark:bg-gray-800" : "bg-theme-50 text-theme-600 dark:bg-theme-900/20 dark:text-theme-300"}`}>
                    {typeIcon[result.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`truncate text-sm font-semibold ${isDeleted ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                        {getRuyiResultDisplayTitle(result)}
                      </span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        {RUYI_RESULT_TYPE_LABELS[result.type]}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        isDeleted
                          ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                      }`}>
                        {isDeleted ? "已删除" : "已完成"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      创建于 {new Date(result.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
                    </p>
                    {!isDeleted && conversationExists && result.conversationId && (
                      <Link
                        to={withDemo(`/pc_client/ruyi-zone/conversations/${result.conversationId}`)}
                        className="mt-1 inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-theme-600 hover:underline dark:text-gray-400"
                      >
                        <MessageSquare size={11} />
                        来源会话
                      </Link>
                    )}
                  </div>
                  {!isDeleted && (
                    <div className="flex flex-shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewResultId(result.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-theme-200 hover:text-theme-700 dark:border-gray-600 dark:text-gray-200 dark:hover:border-theme-800"
                      >
                        <Eye size={13} />
                        预览
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadRuyiResult(result)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-theme-200 hover:text-theme-700 dark:border-gray-600 dark:text-gray-200 dark:hover:border-theme-800"
                      >
                        <Download size={13} />
                        下载
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteResultId(result.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-400 hover:border-red-200 hover:text-red-600 dark:border-gray-600"
                      >
                        <Trash2 size={13} />
                        删除
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 预览弹框 */}
      {previewResult && (
        <RuyiResultPreviewModal
          result={previewResult}
          onClose={() => setPreviewResultId(null)}
          onDownload={(r) => downloadRuyiResult(r)}
        />
      )}

      {/* 删除确认弹框 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDeleteResultId(null)}>
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">删除成果</h3>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              确定删除成果「{deleteTarget.title}」吗？删除后可在"已删除"筛选中查看记录。
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteResultId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 dark:border-gray-600 dark:text-gray-300"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
