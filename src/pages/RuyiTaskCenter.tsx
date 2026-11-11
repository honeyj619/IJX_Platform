import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRuyiStore, RUYI_MAIN_OWNER_ID } from "../store/ruyiStore";
import type { RuyiTaskStatus } from "../types/ruyi";
import RuyiTaskListItem from "../components/ruyi/RuyiTaskListItem";
import RuyiTaskEmptyState from "../components/ruyi/RuyiTaskEmptyState";

type TabId = "pending" | "executing" | "completed" | "all";

const tabs: Array<{ id: TabId; label: string; statuses?: RuyiTaskStatus[] }> = [
  { id: "pending", label: "待我处理", statuses: ["collecting", "interrupted", "awaiting-confirmation", "failed"] },
  { id: "executing", label: "执行中", statuses: ["executing"] },
  { id: "completed", label: "已完成", statuses: ["completed"] },
  { id: "all", label: "全部" },
];

interface RuyiTaskCenterProps {
  demoId?: string | null;
}

/**
 * V2 AI 任务中心：只展示如意助手协助任务（store 任务域），
 * 不混入普通事项、项目任务、日程或审批数据。
 */
export default function RuyiTaskCenter({ demoId }: RuyiTaskCenterProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("pending");
  const [loading, setLoading] = useState(true);
  // error 状态仅由 v2-task-error demo 触发；重载后进入确定性正常列表
  const [errored, setErrored] = useState(false);
  const getOwnerTasks = useRuyiStore((s) => s.getOwnerTasks);
  const getOwnerResults = useRuyiStore((s) => s.getOwnerResults);
  const ownerId = useRuyiStore((s) => s.currentOwnerId) ?? RUYI_MAIN_OWNER_ID;

  // v2-task-error：首次进入显示错误态（确定性触发，不用随机数）
  const isErrorDemo = demoId === "v2-task-error";

  useEffect(() => {
    if (isErrorDemo && !sessionStorage.getItem("ijx-task-error-reloaded")) {
      setErrored(true);
    }
    const t = window.setTimeout(() => setLoading(false), 400); // 模拟首屏加载骨架
    return () => window.clearTimeout(t);
  }, [isErrorDemo]);

  const allTasks = useMemo(() => getOwnerTasks(ownerId), [getOwnerTasks, ownerId]);
  const allResults = useMemo(() => getOwnerResults(ownerId), [getOwnerResults, ownerId]);

  const filteredTasks = useMemo(() => {
    const tabConfig = tabs.find((t) => t.id === tab);
    if (!tabConfig?.statuses) return allTasks;
    const allowed = new Set(tabConfig.statuses);
    return allTasks.filter((t) => allowed.has(t.status));
  }, [allTasks, tab]);

  const pendingCount = useMemo(
    () => allTasks.filter((t) => ["collecting", "interrupted", "awaiting-confirmation", "failed"].includes(t.status)).length,
    [allTasks],
  );

  const reloadFixture = () => {
    sessionStorage.setItem("ijx-task-error-reloaded", "1");
    setErrored(false);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 400);
  };

  const taskHref = (taskId: string) =>
    demoId ? `/pc_client/ruyi-zone/tasks/${taskId}?demo=${demoId}` : `/pc_client/ruyi-zone/tasks/${taskId}`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/80">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">AI 任务</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">如意助手协助您处理的任务，按状态分类跟踪</p>
        </div>
      </header>

      <div className="flex flex-shrink-0 items-center gap-1 border-b border-gray-100 bg-white px-6 dark:border-gray-700 dark:bg-gray-900" data-requirement-id="ruyi-task-list">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`relative -mb-px border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-theme-600 text-theme-700 dark:border-theme-400 dark:text-theme-300"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {t.label}
            {t.id === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-theme-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
        {loading ? (
          <div className="space-y-3 px-5 py-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-xl border border-gray-100 px-5 py-4 dark:border-gray-700/60">
                <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-700" />
                <div className="mt-2.5 h-3 w-72 rounded bg-gray-100 dark:bg-gray-700" />
                <div className="mt-2 h-3 w-56 rounded bg-gray-100 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        ) : errored ? (
          <RuyiTaskEmptyState variant="error" onAction={reloadFixture} />
        ) : allTasks.length === 0 ? (
          <RuyiTaskEmptyState variant="empty" demoId={demoId} onReloadFixture={reloadFixture} />
        ) : filteredTasks.length === 0 ? (
          <RuyiTaskEmptyState variant="filtered" onAction={() => setTab("all")} />
        ) : (
          <div>
            {filteredTasks.map((task) => (
              <RuyiTaskListItem key={task.id} task={task} results={allResults} to={taskHref(task.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
