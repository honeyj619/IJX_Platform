import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Building2,
  CalendarDays,
  ChevronRight,
  FileText,
  MessageCircle,
  MessagesSquare,
  Search,
  Sparkles,
  UserRound,
  Workflow,
  X,
} from 'lucide-react';
import {
  GLOBAL_SEARCH_CATEGORY_LABELS,
  GLOBAL_SEARCH_CATEGORY_ORDER,
  searchGlobalItems,
  type GlobalSearchCategory,
  type GlobalSearchItem,
  type GlobalSearchNavigationState,
  type GlobalSearchTarget,
  type SystemAppAnchor,
} from '../data/globalSearch';

interface GlobalSearchDialogProps {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
}

type SearchFilter = 'all' | GlobalSearchCategory;
type AppAnchorFilter = 'all' | SystemAppAnchor;

const categoryIcons: Record<GlobalSearchCategory, typeof Search> = {
  people: UserRound,
  groups: MessagesSquare,
  'chat-records': MessageCircle,
  calendar: CalendarDays,
  documents: FileText,
  processes: Workflow,
  'business-systems': Building2,
  'system-apps': Sparkles,
};

const createNavigationState = (
  query: string,
  target: GlobalSearchTarget,
  assistantQuery?: string,
): GlobalSearchNavigationState => ({
  globalSearch: {
    requestId: `search-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    query,
    target,
    assistantQuery,
  },
});

function HighlightedText({ text, query }: { text: string; query: string }) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return <>{text}</>;
  const index = text.toLocaleLowerCase().indexOf(normalized);
  if (index < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-amber-100 px-0.5 text-inherit">{text.slice(index, index + normalized.length)}</mark>
      {text.slice(index + normalized.length)}
    </>
  );
}

function ResultRow({ item, query, onClick }: { item: GlobalSearchItem; query: string; onClick: () => void }) {
  const Icon = categoryIcons[item.category];
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-theme-50 group-hover:text-theme-600">
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-gray-900">
          <HighlightedText text={item.title} query={query} />
        </span>
        <span className="mt-0.5 block truncate text-xs text-gray-500">
          <HighlightedText text={item.description} query={query} />
        </span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-gray-300 group-hover:text-theme-500" />
    </button>
  );
}

function ResultSection({
  category,
  items,
  query,
  onItemClick,
  onMore,
  totalCount,
}: {
  category: GlobalSearchCategory;
  items: GlobalSearchItem[];
  query: string;
  onItemClick: (item: GlobalSearchItem) => void;
  onMore?: () => void;
  totalCount?: number;
}) {
  if (items.length === 0) return null;
  const Icon = categoryIcons[category];
  return (
    <section className="overflow-hidden border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 bg-gray-50/70 px-4 py-2.5">
        <Icon size={15} className="text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-800">{GLOBAL_SEARCH_CATEGORY_LABELS[category]}</h3>
        <span className="text-xs text-gray-400">{totalCount ?? items.length} 条</span>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map(item => <ResultRow key={item.id} item={item} query={query} onClick={() => onItemClick(item)} />)}
      </div>
      {onMore && (
        <button
          type="button"
          onClick={onMore}
          className="flex w-full items-center justify-between border-t border-gray-100 px-4 py-2.5 text-sm font-medium text-theme-600 hover:bg-theme-50/60"
        >
          <span>在{GLOBAL_SEARCH_CATEGORY_LABELS[category]}中搜索更多</span>
          <ChevronRight size={15} />
        </button>
      )}
    </section>
  );
}

export default function GlobalSearchDialog({ query, onQueryChange, onClose }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [appAnchor, setAppAnchor] = useState<AppAnchorFilter>('all');
  const normalizedQuery = query.trim();
  const results = useMemo(() => searchGlobalItems(query), [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const groupedResults = useMemo(() => new Map(
    GLOBAL_SEARCH_CATEGORY_ORDER.map(category => [
      category,
      results.filter(item => item.category === category),
    ]),
  ), [results]);

  const visibleFilteredResults = useMemo(() => {
    if (filter === 'all') return [];
    const categoryResults = groupedResults.get(filter) ?? [];
    if (filter !== 'system-apps' || appAnchor === 'all') return categoryResults;
    return categoryResults.filter(item => item.anchor === appAnchor);
  }, [appAnchor, filter, groupedResults]);

  const openTarget = (target: GlobalSearchTarget, assistantQuery?: string) => {
    const path = target.type === 'message' ? '/web_client' : target.path;
    navigate(path, { state: createNavigationState(normalizedQuery, target, assistantQuery) });
    onClose();
  };

  const handleItemClick = (item: GlobalSearchItem) => openTarget(item.target);
  const selectFilter = (nextFilter: SearchFilter) => {
    setFilter(nextFilter);
    if (nextFilter !== 'system-apps') setAppAnchor('all');
  };

  let body: ReactNode;
  if (!normalizedQuery) {
    body = (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
          <Search size={22} />
        </span>
        <p className="text-sm font-medium text-gray-700">输入关键词搜索协同平台内容</p>
        <p className="mt-1 text-xs text-gray-400">支持人员、消息、日程、文档、流程和系统应用</p>
      </div>
    );
  } else if (results.length === 0) {
    body = (
      <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium text-gray-700">未找到与“{normalizedQuery}”相关的结果</p>
        <p className="mt-1 text-xs text-gray-400">可以换个关键词，或直接问问如意助手</p>
      </div>
    );
  } else if (filter === 'all') {
    body = (
      <div>
        {GLOBAL_SEARCH_CATEGORY_ORDER.map(category => {
          const categoryResults = groupedResults.get(category) ?? [];
          return (
            <ResultSection
              key={category}
              category={category}
              items={categoryResults.slice(0, 3)}
              query={normalizedQuery}
              onItemClick={handleItemClick}
              totalCount={categoryResults.length}
              onMore={categoryResults.length > 3 ? () => selectFilter(category) : undefined}
            />
          );
        })}
      </div>
    );
  } else {
    body = visibleFilteredResults.length > 0 ? (
      <ResultSection
        category={filter}
        items={visibleFilteredResults}
        query={normalizedQuery}
        onItemClick={handleItemClick}
      />
    ) : (
      <div className="flex min-h-[260px] items-center justify-center text-sm text-gray-500">当前分类暂无匹配结果</div>
    );
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/35 p-6 pt-[8vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="全局搜索"
        className="flex max-h-[84vh] w-full max-w-[820px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="shrink-0 border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <Search size={19} className="shrink-0 text-gray-400" />
            <input
              type="search"
              placeholder="搜索人员、消息、日程、文档、流程或系统"
              className="h-10 min-w-0 flex-1 border-0 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
              value={query}
              onChange={event => onQueryChange(event.target.value)}
              autoFocus
            />
            <button type="button" onClick={onClose} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="关闭">
              <X size={18} />
            </button>
          </div>

          <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5">
            <button
              type="button"
              onClick={() => selectFilter('all')}
              className={`h-8 shrink-0 rounded-md px-3 text-sm font-medium ${filter === 'all' ? 'bg-theme-50 text-theme-700' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              全部
            </button>
            {GLOBAL_SEARCH_CATEGORY_ORDER.map(category => (
              <button
                type="button"
                key={category}
                onClick={() => selectFilter(category)}
                className={`h-8 shrink-0 rounded-md px-3 text-sm font-medium ${filter === category ? 'bg-theme-50 text-theme-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                {GLOBAL_SEARCH_CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>

          {filter === 'system-apps' && (
            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400">应用类型</span>
              {([
                ['all', '全部'],
                ['common', '常用功能'],
                ['agents', '智能体'],
              ] as const).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setAppAnchor(value)}
                  className={`h-7 rounded-md px-2.5 text-xs font-medium ${appAnchor === value ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {normalizedQuery && (
          <button
            type="button"
            onClick={() => openTarget({ type: 'message', conversationId: 1, conversationName: '如意助手', conversationKind: 'assistant' }, normalizedQuery)}
            className="group mx-5 mt-4 flex shrink-0 items-center gap-3 rounded-lg border border-theme-200 bg-theme-50/60 px-4 py-3 text-left hover:border-theme-300 hover:bg-theme-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-theme-600 text-white">
              <Bot size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-900">问问如意助手</span>
              <span className="block truncate text-xs text-gray-500">发送“{normalizedQuery}”并开始对话</span>
            </span>
            <ChevronRight size={16} className="text-theme-500" />
          </button>
        )}

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto border-t border-gray-100">{body}</div>
      </div>
    </div>
  );
}
