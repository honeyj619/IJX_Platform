import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRuyiStore, RUYI_MAIN_OWNER_ID } from "../store/ruyiStore";
import type { RuyiTaskMock, RuyiTaskParameter, MeetingTaskSlots } from "../types/ruyi";
import { RUYI_DEVICE_LABELS } from "../types/ruyi";
import RuyiTaskStatusBadge from "../components/ruyi/RuyiTaskStatusBadge";
import RuyiTaskTimeline from "../components/ruyi/RuyiTaskTimeline";
import RuyiContextReferenceCard from "../components/ruyi/RuyiContextReferenceCard";
import { getRuyiResultDisplayTitle, getRuyiResultDisplayReason, canOpenRuyiResult } from "../utils/ruyiResultPresentation";
import { ArrowLeft, ExternalLink, Smartphone, RotateCcw, Pencil, X, Play, RefreshCw } from "lucide-react";

interface RuyiTaskDetailProps {
  taskId: string;
  demoId?: string | null;
  /** 状态推进回调（批次 3 接线；RuYiZone 统一实现事件+消息） */
  onTaskAction?: (action: TaskDetailAction, task: RuyiTaskMock) => void;
}

export type TaskDetailAction = "continue" | "confirm" | "modify" | "cancel" | "retry" | "retry-modified" | "reopen" | "remove-context";

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "numeric", day: "numeric" }) + " " + d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

/** 会议任务 slots → 参数视图（缺失显示"待补充"） */
function slotsToParameters(task: RuyiTaskMock): Array<{ label: string; value: string; missing: boolean }> {
  const s: Partial<MeetingTaskSlots> = task.slots ?? {};
  const missing = new Set(task.missingSlots ?? []);
  const entry = (label: string, value: string | undefined, key?: keyof MeetingTaskSlots) => ({
    label,
    value: value && value.length > 0 ? (Array.isArray(value) ? value.join("、") : value) : "待补充",
    missing: key ? missing.has(key) : !value,
  });
  return [
    entry("标题", s.title, "title"),
    entry("日期", s.dateText ? `${s.dateText}（${s.resolvedDate ?? "待解析"}）` : undefined, "resolvedDate"),
    entry("时间", s.startTime && s.endTime ? `${s.startTime} - ${s.endTime}` : undefined, "startTime"),
    entry("参会人", s.attendeeNames?.length ? s.attendeeNames.join("、") : undefined, "attendeeNames"),
    entry("地点", s.location, "location"),
  ];
}

export default function RuyiTaskDetail({ taskId, demoId, onTaskAction }: RuyiTaskDetailProps) {
  const navigate = useNavigate();
  const task = useRuyiStore((s) => s.tasks[taskId]);
  const ownerId = useRuyiStore((s) => s.currentOwnerId) ?? RUYI_MAIN_OWNER_ID;
  const conversation = useRuyiStore((s) => (task ? s.conversations[task.conversationId] : undefined));
  const contextRef = useRuyiStore((s) => (task?.contextReferenceId ? s.contextReferences[task.contextReferenceId] : undefined));
  // 注意：不能用返回新数组的 selector（getSnapshot 不缓存会触发无限渲染）——改为订阅原始 map 再投影
  const resultsMap = useRuyiStore((s) => s.results);
  const linkedResults = task?.resultIds ? task.resultIds.map((id) => resultsMap[id]).filter(Boolean) : [];
  const [confirmingAction, setConfirmingAction] = useState<TaskDetailAction | null>(null);

  const withDemo = (to: string) => (demoId ? `${to}${to.includes("?") ? "&" : "?"}demo=${demoId}` : to);

  // 找不到任务或不属于当前用户：不泄露任务内容
  if (!task || task.ownerId !== ownerId) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
          <X className="h-7 w-7 text-gray-400" />
        </div>
        <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-white">任务不存在或无权访问</h3>
        <p className="mb-6 max-w-sm text-sm text-gray-500 dark:text-gray-400">该任务可能已被移除，或不属于当前用户。</p>
        <Link to={withDemo("/pc_client/ruyi-zone/tasks")} className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700">
          返回 AI 任务
        </Link>
      </div>
    );
  }

  const sourceConversationExists = !!conversation;
  const parameters: Array<{ label: string; value: string; missing: boolean }> =
    task.type === "create-meeting" || (task.parameters ?? []).length === 0
      ? slotsToParameters(task)
      : (task.parameters ?? []).map((p: RuyiTaskParameter) => ({
          label: p.label,
          value: p.value || "待补充",
          missing: !p.value,
        }));

  // 操作矩阵（5.2）
  const actions: Array<{ id: TaskDetailAction; label: string; primary?: boolean; danger?: boolean; icon: React.ReactNode; confirm?: boolean }> = [];
  if (task.status === "collecting" || task.status === "interrupted") {
    actions.push({ id: "continue", label: "继续任务", primary: true, icon: <Play size={14} /> });
    actions.push({ id: "cancel", label: "取消任务", danger: true, icon: <X size={14} />, confirm: true });
  } else if (task.status === "awaiting-confirmation") {
    actions.push({ id: "confirm", label: "确认执行", primary: true, icon: <Play size={14} /> });
    actions.push({ id: "modify", label: "修改参数", icon: <Pencil size={14} /> });
    actions.push({ id: "cancel", label: "取消任务", danger: true, icon: <X size={14} />, confirm: true });
  } else if (task.status === "failed") {
    actions.push({ id: "retry", label: "重试", primary: true, icon: <RotateCcw size={14} /> });
    actions.push({ id: "retry-modified", label: "修改后重试", icon: <Pencil size={14} /> });
    actions.push({ id: "cancel", label: "取消任务", danger: true, icon: <X size={14} />, confirm: true });
  } else if (task.status === "completed") {
    if (linkedResults.length > 0) {
      actions.push({ id: "confirm" as never, label: "__noop_open_result__", icon: null } as never); // 占位避免误用；打开成果在成果区
    }
  }
  // 已取消/执行中：无操作按钮

  const runAction = (action: { id: TaskDetailAction; confirm?: boolean }) => {
    if (action.confirm) {
      setConfirmingAction(action.id);
      return;
    }
    onTaskAction?.(action.id, task);
  };

  const confirmLabels: Partial<Record<TaskDetailAction, string>> = {
    cancel: "取消后任务将终止，进行中的参数不会保留为可继续状态。",
    "retry-modified": "将回到参数补充，修改后可重新确认执行。",
  };

  return (
    <div className="flex h-full flex-col overflow-hidden" data-requirement-id="ruyi-task-detail">
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-gray-100 bg-white/80 px-6 py-3.5 dark:border-gray-700 dark:bg-gray-900/80">
        <button
          type="button"
          onClick={() => navigate(withDemo("/pc_client/ruyi-zone/tasks"))}
          className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          title="返回 AI 任务"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-base font-semibold text-gray-900 dark:text-white">{task.title ?? "未命名任务"}</h2>
            <RuyiTaskStatusBadge status={task.status} />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-3xl space-y-5">
          {/* 目标与下一步 */}
          <section className="rounded-xl border border-gray-100 bg-white px-5 py-4 dark:border-gray-700/60 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">任务目标</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">{task.goal || "（无目标描述）"}</p>
                {task.nextAction && (
                  <p className="mt-2 rounded-lg bg-theme-50 px-3 py-1.5 text-xs font-medium text-theme-700 dark:bg-theme-900/20 dark:text-theme-300">
                    下一步：{task.nextAction}
                  </p>
                )}
                {task.status === "failed" && task.failureReason && (
                  <p className="mt-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-300">
                    失败原因:{task.failureReason}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* 参数 */}
          <section className="rounded-xl border border-gray-100 bg-white px-5 py-4 dark:border-gray-700/60 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">已收集参数</h3>
            <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-2.5 text-sm">
              {parameters.map((p) => (
                <div key={p.label} className="contents">
                  <dt className="text-gray-400 dark:text-gray-500">{p.label}</dt>
                  <dd className={p.missing ? "text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200"}>
                    {p.missing && p.value === "待补充" ? (
                      <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">待补充</span>
                    ) : (
                      p.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 来源与跨端 */}
          <section className="rounded-xl border border-gray-100 bg-white px-5 py-4 dark:border-gray-700/60 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">来源与跨端状态</h3>
            <dl className="grid grid-cols-[96px_1fr] gap-x-4 gap-y-2.5 text-sm">
              <dt className="text-gray-400 dark:text-gray-500">来源</dt>
              <dd className="text-gray-800 dark:text-gray-200">
                {task.source?.label ?? "如意空间对话"}
                {task.source && <span className="ml-2 text-xs text-gray-400">（{RUYI_DEVICE_LABELS[task.source.device]}）</span>}
              </dd>
              <dt className="text-gray-400 dark:text-gray-500">最后操作端</dt>
              <dd className="text-gray-800 dark:text-gray-200">{task.lastOperatedDevice ? RUYI_DEVICE_LABELS[task.lastOperatedDevice] : "—"}</dd>
              <dt className="text-gray-400 dark:text-gray-500">最后操作时间</dt>
              <dd className="text-gray-800 dark:text-gray-200">{formatTime(task.lastOperatedAt ?? task.updatedAt)}</dd>
            </dl>
            {/* 跨端模拟提示 + 来源会话入口 */}
            <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3 dark:border-gray-700/60">
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                <Smartphone size={11} />
                该任务可在 App 继续（原型演示，未连接真实同步）
              </span>
              {sourceConversationExists ? (
                <Link
                  to={withDemo(`/pc_client/ruyi-zone/conversations/${task.conversationId}`)}
                  className="text-xs font-medium text-theme-600 hover:underline dark:text-theme-300"
                >
                  返回来源会话 →
                </Link>
              ) : (
                <span className="text-xs text-gray-400 dark:text-gray-500" title="来源会话已删除">
                  来源会话已删除（任务记录保留）
                </span>
              )}
            </div>
          </section>

          {/* 业务上下文（批次 5 完整接线，本批只读展示） */}
          {contextRef && (
            <section className="space-y-2.5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">业务上下文引用</h3>
              <RuyiContextReferenceCard
                reference={contextRef}
                onRemove={onTaskAction ? () => onTaskAction("remove-context", task) : undefined}
              />
              <p className="text-[11px] text-gray-400 dark:text-gray-500">上下文仅对当前会话/任务生效，切换页面不自动沿用（原型演示）。</p>
            </section>
          )}

          {/* 状态时间线 */}
          <section className="rounded-xl border border-gray-100 bg-white px-5 py-4 dark:border-gray-700/60 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">状态记录</h3>
            <RuyiTaskTimeline events={task.events ?? []} />
          </section>

          {/* 关联成果 */}
          {linkedResults.length > 0 && (
            <section className="rounded-xl border border-gray-100 bg-white px-5 py-4 dark:border-gray-700/60 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">关联成果</h3>
              <div className="space-y-2">
                {linkedResults.map((r) => {
                  const openable = canOpenRuyiResult(r);
                  const openHref = openable ? r.workbenchHref : null;
                  return (
                    <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3.5 py-2.5 dark:border-gray-700/60">
                      <div className="min-w-0">
                        <span className={`block truncate text-sm ${r.status === "forbidden" ? "text-gray-500 dark:text-gray-400" : "text-gray-800 dark:text-gray-200"}`}>
                          {getRuyiResultDisplayTitle(r)}
                        </span>
                        {getRuyiResultDisplayReason(r) && (
                          <span className="mt-0.5 block text-[11px] text-gray-400">{getRuyiResultDisplayReason(r)}</span>
                        )}
                      </div>
                      {openHref ? (
                        <button
                          type="button"
                          onClick={() => navigate(withDemo(openHref))}
                          className="inline-flex flex-shrink-0 items-center gap-1 text-xs font-semibold text-theme-600 hover:underline dark:text-theme-300"
                        >
                          <ExternalLink size={12} />
                          打开成果
                        </button>
                      ) : (
                        <span className="flex-shrink-0 text-xs text-gray-400">{r.status === "forbidden" ? "无权限" : "已失效"}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 已完成：再次处理 */}
          {task.status === "completed" && (
            <section className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-5 py-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
              <p className="text-sm text-emerald-800 dark:text-emerald-300">任务已完成。需要基于同一目标重新处理时，将创建新任务并保留本记录。</p>
              <button
                type="button"
                onClick={() => onTaskAction?.("reopen", task)}
                className="flex-shrink-0 rounded-lg border border-emerald-300 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-emerald-700 dark:bg-gray-800 dark:text-emerald-300"
              >
                <RefreshCw size={12} className="mr-1 inline" />
                再次处理
              </button>
            </section>
          )}

          {/* 已取消提示 */}
          {task.status === "cancelled" && (
            <p className="rounded-xl bg-gray-50 px-5 py-3.5 text-center text-xs text-gray-400 dark:bg-gray-800 dark:text-gray-500">
              任务已取消，仅保留记录。
            </p>
          )}
        </div>
      </div>

      {/* 操作栏（执行中/已取消不渲染） */}
      {actions.length > 0 && (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-2.5 border-t border-gray-100 bg-white px-6 py-3.5 dark:border-gray-700 dark:bg-gray-900">
          {actions
            .filter((a) => a.label !== "__noop_open_result__")
            .map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => runAction(action)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  action.primary
                    ? "bg-theme-600 text-white hover:bg-theme-700"
                    : action.danger
                      ? "border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20"
                      : "border border-gray-200 text-gray-700 hover:border-theme-300 hover:text-theme-700 dark:border-gray-600 dark:text-gray-300"
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
        </div>
      )}

      {/* 二次确认弹框 */}
      {confirmingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25" onClick={() => setConfirmingAction(null)}>
          <div className="mx-4 w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {confirmingAction === "cancel" ? "确认取消该任务？" : "确认执行该操作？"}
            </p>
            <p className="mt-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
              {confirmLabels[confirmingAction] ?? "该操作会推进任务状态。"}
            </p>
            <div className="mt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmingAction(null)}
                className="rounded-lg px-3.5 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                再想想
              </button>
              <button
                type="button"
                onClick={() => {
                  const a = confirmingAction;
                  setConfirmingAction(null);
                  onTaskAction?.(a, task);
                }}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold text-white ${confirmingAction === "cancel" ? "bg-red-500 hover:bg-red-600" : "bg-theme-600 hover:bg-theme-700"}`}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
