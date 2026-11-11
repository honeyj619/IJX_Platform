import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRuyiStore, RUYI_MAIN_OWNER_ID } from "../store/ruyiStore";
import type { RuyiResultReference } from "../types/ruyi";
import { getRuyiResultDisplayTitle, getRuyiResultDisplayReason, canOpenRuyiResult } from "../utils/ruyiResultPresentation";
import { ExternalLink, FileText, Presentation, BarChart3, Languages, MessageSquare, ListTodo, Inbox } from "lucide-react";

type TypeFilter = "all" | "document" | "presentation" | "report" | "translation";
type StatusFilter = "all" | "editable" | "completed" | "invalid" | "forbidden";

const typeTabs: Array<{ id: TypeFilter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "document", label: "公文" },
  { id: "presentation", label: "PPT" },
  { id: "report", label: "汇报" },
  { id: "translation", label: "翻译" },
];

const statusTabs: Array<{ id: StatusFilter; label: string }> = [
  { id: "all", label: "全部" },
  { id: "editable", label: "可用" },
  { id: "completed", label: "已完成" },
  { id: "invalid", label: "已失效" },
  { id: "forbidden", label: "无权限" },
];

const typeIcon: Record<RuyiResultReference["type"], React.ReactNode> = {
  document: <FileText size={16} />,
  presentation: <Presentation size={16} />,
  report: <BarChart3 size={16} />,
  translation: <Languages size={16} />,
};

const typeLabel: Record<RuyiResultReference["type"], string> = {
  document: "公文",
  presentation: "PPT",
  report: "汇报",
  translation: "翻译",
};

const statusLabel: Record<RuyiResultReference["status"], string> = {
  editable: "可编辑",
  completed: "已完成",
  invalid: "已失效",
  forbidden: "无权限",
};

interface RuyiResultCenterProps {
  demoId?: string | null;
}

export default function RuyiResultCenter({ demoId }: RuyiResultCenterProps) {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const ownerId = useRuyiStore((s) => s.currentOwnerId) ?? RUYI_MAIN_OWNER_ID;
  const getOwnerResults = useRuyiStore((s) => s.getOwnerResults);
  const conversations = useRuyiStore((s) => s.conversations);
  const tasks = useRuyiStore((s) => s.tasks);

  const results = useMemo(
    () => getOwnerResults(ownerId, { type: typeFilter, status: statusFilter }),
    [getOwnerResults, ownerId, typeFilter, statusFilter],
  );
  const totalCount = useMemo(() => getOwnerResults(ownerId).length, [getOwnerResults, ownerId]);

  const withDemo = (to: string) => (demoId ? `${to}${to.includes("?") ? "&" : "?"}demo=${demoId}` : to);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/80">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">AI 成果</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">如意助手生成的公文、PPT、汇报与翻译统一索引</p>
        </div>
      </header>

      <div className="flex flex-col gap-2.5 border-b border-gray-100 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900" data-requirement-id="ruyi-result-center" >
        <div className="flex items-center gap-1" data-requirement-id="ruyi-result-permission-state">
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
              const openable = canOpenRuyiResult(result);
              const isForbidden = result.status === "forbidden";
              const displayTitle = getRuyiResultDisplayTitle(result);
              const displayReason = getRuyiResultDisplayReason(result);
              const conversationExists = !!result.conversationId && !!conversations[result.conversationId];
              const taskExists = !!result.taskId && !!tasks[result.taskId];
              return (
                <div key={result.id} className="flex items-start gap-3.5 px-6 py-4">
                  <span className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${openable ? "bg-theme-50 text-theme-600 dark:bg-theme-900/20 dark:text-theme-300" : "bg-gray-100 text-gray-400 dark:bg-gray-800"}`}>
                    {isForbidden ? <Inbox size={16} /> : typeIcon[result.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`truncate text-sm font-semibold ${isForbidden ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                        {displayTitle}
                      </span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                        {typeLabel[result.type]}
                      </span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        result.status === "invalid" ? "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        : result.status === "forbidden" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300"
                        : result.status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                      }`}>
                        {statusLabel[result.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">
                      创建于 {new Date(result.createdAt).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
                      {displayReason ? ` · ${displayReason}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      {openable ? (
                        <button
                          type="button"
                          onClick={() => navigate(withDemo(result.workbenchHref))}
                          className="inline-flex items-center gap-1 font-semibold text-theme-600 hover:underline dark:text-theme-300"
                        >
                          <ExternalLink size={12} />
                          打开成果
                        </button>
                      ) : (
                        <span className="inline-flex cursor-not-allowed items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-400 dark:bg-gray-700 dark:text-gray-500">
                          {result.status === "invalid" ? "成果已失效" : "无权限查看"}
                        </span>
                      )}
                      {conversationExists ? (
                        <Link
                          to={withDemo(`/pc_client/ruyi-zone/conversations/${result.conversationId}`)}
                          className="inline-flex items-center gap-1 text-gray-500 hover:text-theme-600 hover:underline dark:text-gray-400"
                        >
                          <MessageSquare size={12} />
                          来源会话
                        </Link>
                      ) : result.conversationId || result.sourceDeleted ? (
                        <span className="text-gray-400 dark:text-gray-500" title="来源会话已删除">
                          来源会话已删除
                        </span>
                      ) : null}
                      {result.taskId && taskExists ? (
                        <Link
                          to={withDemo(`/pc_client/ruyi-zone/tasks/${result.taskId}`)}
                          className="inline-flex items-center gap-1 text-gray-500 hover:text-theme-600 hover:underline dark:text-gray-400"
                        >
                          <ListTodo size={12} />
                          关联任务
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
