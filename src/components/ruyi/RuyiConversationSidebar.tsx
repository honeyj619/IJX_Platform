import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { RuyiConversation, RuyiCapability } from "../../types/ruyi";
import { FIXED_SYSTEM_CONVERSATION_ID } from "../../data/ruyiDemoScenarios";
import RuyiDemoUserSwitcher from "./RuyiDemoUserSwitcher";
import { Sparkles, Search, FileText, PresentationIcon, Target, Languages, MonitorCog, Plus, MoreHorizontal, Pencil, Trash2, X, Menu, ListTodo, Inbox, Filter } from "lucide-react";
import RuyiConversationDialogs from "./RuyiConversationDialogs";

interface SidebarTaskSummary {
  pendingCount: number;
  byConversation: Record<string, number>;
}

interface SidebarResultSummary {
  byConversation: Record<string, number>;
}

interface RuyiConversationSidebarProps {
  /** 仅 user-isolation 演示显示用户切换器 */
  showDemoUserSwitcher?: boolean;
  ownerId: string;
  conversations: RuyiConversation[];
  capabilities: RuyiCapability[];
  activeConversationId?: string | null;
  activeCapabilityId?: string | null;
  /** V2：任务/成果关联摘要（会话项角标与筛选） */
  taskSummary?: SidebarTaskSummary;
  resultSummary?: SidebarResultSummary;
  /** V2：AI 任务/AI 成果入口高亮 */
  activeNav?: "tasks" | "results" | null;
  onOpenTasks?: () => void;
  onOpenResults?: () => void;
  /** V2：搜索关键词（匹配标题与会话用户消息文本，由父层执行消息匹配） */
  searchMatches?: Set<string> | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onSelectCapability: (capabilityId: RuyiCapability["id"]) => void;
  isMobile?: boolean;
  mobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

const capabilityIcons: Record<string, React.ReactNode> = {
  "work-query": <Search size={14} />,
  document: <FileText size={14} />,
  presentation: <PresentationIcon size={14} />,
  advisor: <Target size={14} />,
  translation: <Languages size={14} />,
  "it-service": <MonitorCog size={14} />,
};

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

type ConversationFilter = "all" | "has-task" | "has-result";

export default function RuyiConversationSidebar({
  showDemoUserSwitcher = false,
  ownerId,
  conversations,
  capabilities,
  activeConversationId,
  activeCapabilityId,
  taskSummary,
  resultSummary,
  activeNav = null,
  onOpenTasks,
  onOpenResults,
  searchMatches = null,
  onNewConversation,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onSelectCapability,
  isMobile,
  mobileMenuOpen,
  onToggleMobileMenu,
}: RuyiConversationSidebarProps) {
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // V2：会话搜索与筛选（只影响列表展示，不修改原始数据）
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");

  const visibleConversations = useMemo(() => {
    let list = conversations;
    const kw = searchKeyword.trim();
    if (kw) {
      list = searchMatches
        ? list.filter((c) => c.title.includes(kw) || searchMatches.has(c.id))
        : list.filter((c) => c.title.includes(kw));
    }
    if (filter === "has-task") {
      list = list.filter((c) => (taskSummary?.byConversation[c.id] ?? 0) > 0);
    } else if (filter === "has-result") {
      list = list.filter((c) => (resultSummary?.byConversation[c.id] ?? 0) > 0);
    }
    return list;
  }, [conversations, searchKeyword, searchMatches, filter, taskSummary, resultSummary]);

  const filterActive = filter !== "all" || !!searchKeyword.trim();

  const startRename = (conversation: RuyiConversation) => {
    setRenameId(conversation.id);
    setRenameTitle(conversation.title);
  };

  const confirmRename = () => {
    if (renameId && renameTitle.trim()) {
      onRenameConversation(renameId, renameTitle.trim());
    }
    setRenameId(null);
    setRenameTitle("");
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDeleteConversation(deleteId);
    }
    setDeleteId(null);
  };

  const deleteConversation = conversations.find((c) => c.id === deleteId);

  return (
    <>
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/30" onClick={onToggleMobileMenu} />
      )}

      <div
        className={`
          ${isMobile ? "fixed inset-y-0 right-0 z-40 w-64" : "w-[240px] lg:w-[280px] flex-shrink-0"}
          ${isMobile && !mobileMenuOpen ? "hidden" : "flex"}
          flex-col border-l border-gray-100 bg-white shadow-lg transition-transform duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800
          ${isMobile && mobileMenuOpen ? "translate-x-0" : ""}
        `}
      >
        <div className="border-b border-gray-100 p-5 dark:border-gray-700">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-theme-500 to-theme-600">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">如意空间</span>
            {isMobile && (
              <button
                type="button"
                onClick={onToggleMobileMenu}
                className="ml-auto rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onNewConversation}

            className="mb-3 flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-theme-100 hover:bg-theme-50 hover:text-theme-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700">
            <span>新对话</span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-theme-600 text-sm leading-none text-white">
              <Plus size={12} />
            </span>
          </button>

          {/* V2：AI 任务 / AI 成果 入口（同一主工作面，非一级导航） */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenTasks}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                activeNav === "tasks"
                  ? "border-theme-200 bg-theme-50 text-theme-700 dark:border-theme-800 dark:bg-theme-900/20 dark:text-theme-300"
                  : "border-gray-100 bg-white text-gray-700 hover:border-theme-100 hover:text-theme-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              <ListTodo size={14} className="flex-shrink-0" />
              <span className="flex-1 truncate">AI 任务</span>
              {(taskSummary?.pendingCount ?? 0) > 0 && (
                <span className="flex h-4.5 min-w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-theme-600 px-1 text-[10px] font-bold leading-none text-white">
                  {taskSummary!.pendingCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={onOpenResults}
              className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs font-semibold transition-colors ${
                activeNav === "results"
                  ? "border-theme-200 bg-theme-50 text-theme-700 dark:border-theme-800 dark:bg-theme-900/20 dark:text-theme-300"
                  : "border-gray-100 bg-white text-gray-700 hover:border-theme-100 hover:text-theme-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              <Inbox size={14} className="flex-shrink-0" />
              <span className="flex-1 truncate">AI 成果</span>
            </button>
          </div>

          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">快捷能力</h4>
            <span className="rounded-full bg-theme-50 px-2 py-0.5 text-[10px] font-medium text-theme-600 dark:bg-theme-900/30 dark:text-theme-300">
              智能体
            </span>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {capabilities.map((capability) => (
              <button
                key={capability.id}
                type="button"
                onClick={() => onSelectCapability(capability.id)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm ${
                  activeCapabilityId === capability.id
                    ? "border-theme-200 bg-theme-50 text-theme-700 dark:border-theme-800 dark:bg-theme-900/20 dark:text-theme-300"
                    : "border-gray-100 bg-white text-gray-700 hover:border-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <span
                  className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${
                    activeCapabilityId === capability.id
                      ? "bg-theme-600 text-white"
                      : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                  }`}
                >
                  {capabilityIcons[capability.id] ?? <Sparkles size={12} />}
                </span>
                <span className="truncate">{capability.name}</span>
              </button>
            ))}
          </div>

          <Link
            to="/pc_client/agent-square"
            className="block w-full rounded-lg bg-gradient-to-r from-theme-500 to-theme-600 py-2.5 text-center text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
          >
            前往智能体广场
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4" data-requirement-id="ruyi-conversation-management">
          {/* 用户隔离演示切换器：仅 ?demo=user-isolation 场景由父层控制渲染 */}
          {showDemoUserSwitcher && <RuyiDemoUserSwitcher />}

          {/* V2：会话搜索与筛选 */}
          <div className="relative mb-2.5">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜索会话标题或内容…"
              className="w-full rounded-lg border border-gray-100 bg-gray-50 py-1.5 pl-7.5 pr-3 text-xs text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-theme-200 focus:bg-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:bg-gray-700"
              style={{ paddingLeft: "28px" }}
            />
          </div>
          <div className="mb-2.5 flex items-center gap-1">
            {([
              { id: "all", label: "全部" },
              { id: "has-task", label: "含进行中任务" },
              { id: "has-result", label: "含成果" },
            ] as Array<{ id: ConversationFilter; label: string }>).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  filter === f.id
                    ? "bg-theme-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mb-3 flex items-center justify-between px-1">
            <h4 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">历史对话</h4>
            <span className="text-[10px] text-gray-400">{visibleConversations.length} 条</span>
          </div>
          {visibleConversations.length === 0 ? (
            filterActive ? (
              <div className="px-1 py-4 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">没有匹配的会话</p>
                <button
                  type="button"
                  onClick={() => { setSearchKeyword(""); setFilter("all"); }}
                  className="mt-1.5 text-[11px] font-medium text-theme-600 hover:underline dark:text-theme-300"
                >
                  清除筛选
                </button>
              </div>
            ) : (
              <div className="px-1 py-4 text-center text-xs text-gray-400 dark:text-gray-500">
                暂无历史会话
              </div>
            )
          ) : (
            <div className="space-y-1">
              {visibleConversations.map((conversation) => {
                const taskCount = taskSummary?.byConversation[conversation.id] ?? 0;
                const resultCount = resultSummary?.byConversation[conversation.id] ?? 0;
                return (
                <div
                  key={conversation.id}
                  className={`group relative rounded-lg px-2.5 py-2 transition-all ${
                    activeConversationId === conversation.id
                      ? "bg-theme-50 text-theme-700 dark:bg-theme-900/20 dark:text-theme-300"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectConversation(conversation.id)}
                    className="w-full text-left"
                  >
                    <div className="min-w-0 pr-14">
                      <h5 className="truncate text-xs font-medium leading-5">{conversation.title}</h5>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 dark:text-gray-500">
                          {formatUpdatedAt(conversation.updatedAt)}
                        </span>
                        {taskCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-theme-50 px-1 py-px text-[10px] font-medium text-theme-600 dark:bg-theme-900/30 dark:text-theme-300" title={`${taskCount} 个进行中任务`}>
                            <ListTodo size={9} />
                            {taskCount}
                          </span>
                        )}
                        {resultCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 px-1 py-px text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300" title={`${resultCount} 个成果`}>
                            <Inbox size={9} />
                            {resultCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  {conversation.id !== FIXED_SYSTEM_CONVERSATION_ID && (
                  <div className="absolute right-1 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 group-hover:flex">
                    <button
                      type="button"
                      onClick={() => startRename(conversation)}
                      className="rounded p-1 text-gray-400 hover:bg-theme-100 hover:text-theme-600 dark:hover:bg-gray-600"
                      title="重命名"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(conversation.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-600"
                      title="删除"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  )}
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <RuyiConversationDialogs
        renameOpen={!!renameId}
        renameTitle={renameTitle}
        onRenameTitleChange={setRenameTitle}
        onRenameConfirm={confirmRename}
        onRenameCancel={() => {
          setRenameId(null);
          setRenameTitle("");
        }}
        deleteOpen={!!deleteId}
        deleteConversationTitle={deleteConversation?.title ?? ""}
        onDeleteConfirm={confirmDelete}
        onDeleteCancel={() => setDeleteId(null)}
      />
    </>
  );
}
