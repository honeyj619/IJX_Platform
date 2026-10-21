import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronRight, ClipboardList, ListChecks, Pencil, RotateCcw, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  prototypeRequirementById,
  type PrototypeRequirement,
} from '../../data/prototypeRequirements';

const STORAGE_KEY = 'ijx-prototype-requirement-mode';
const OVERRIDES_STORAGE_KEY = 'ijx-prototype-requirement-overrides-v2';

interface RequirementOverride {
  title: string;
  functionalRequirement: string;
  businessRules: string[];
}

type RequirementOverrides = Record<string, RequirementOverride>;

interface RequirementDraft {
  title: string;
  functionalRequirement: string;
  businessRulesText: string;
}

interface RequirementModeContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

interface MountedRequirement {
  requirement: PrototypeRequirement;
  element: HTMLElement;
  rect: DOMRect;
  visible: boolean;
  displayOrder: number;
}

const RequirementModeContext = createContext<RequirementModeContextValue | null>(null);

export function RequirementModeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [enabled, setEnabledState] = useState(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const setEnabled = useCallback((nextEnabled: boolean) => {
    setEnabledState(nextEnabled);
    if (!nextEnabled) setSelectedId(null);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(nextEnabled));
    } catch {
      // The prototype remains usable when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    setSelectedId(null);
  }, [location.pathname, location.search, location.hash]);

  const value = useMemo(
    () => ({ enabled, setEnabled, selectedId, setSelectedId }),
    [enabled, setEnabled, selectedId],
  );

  return <RequirementModeContext.Provider value={value}>{children}</RequirementModeContext.Provider>;
}

function useRequirementMode() {
  const context = useContext(RequirementModeContext);
  if (!context) throw new Error('RequirementModeLayer must be rendered inside RequirementModeProvider');
  return context;
}

function parseRequirementOverrides(value: string | null): RequirementOverrides {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([id, override]) => {
      if (!prototypeRequirementById.has(id) || !override || typeof override !== 'object' || Array.isArray(override)) return false;
      const candidate = override as Partial<RequirementOverride>;
      return typeof candidate.title === 'string'
        && typeof candidate.functionalRequirement === 'string'
        && Array.isArray(candidate.businessRules)
        && candidate.businessRules.every((rule) => typeof rule === 'string');
    })) as RequirementOverrides;
  } catch {
    return {};
  }
}

function collectMountedRequirements(requirementById: Map<string, PrototypeRequirement>): MountedRequirement[] {
  const mounted = new Map<string, MountedRequirement>();
  document.querySelectorAll<HTMLElement>('[data-requirement-id]').forEach((element) => {
    const id = element.dataset.requirementId;
    if (!id || mounted.has(id)) return;
    const requirement = requirementById.get(id);
    if (!requirement) return;
    const rect = element.getBoundingClientRect();
    mounted.set(id, {
      requirement,
      element,
      rect,
      visible: rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth,
      displayOrder: 0,
    });
  });
  const surfaceOrder = new Map<string, number>();
  const displayOrderById = new Map<string, number>();
  const requirementsBySurface = new Map<string, PrototypeRequirement[]>();
  prototypeRequirementById.forEach((requirement) => {
    if (!surfaceOrder.has(requirement.surface)) surfaceOrder.set(requirement.surface, surfaceOrder.size);
    const group = requirementsBySurface.get(requirement.surface) ?? [];
    group.push(requirement);
    requirementsBySurface.set(requirement.surface, group);
  });
  requirementsBySurface.forEach((requirements) => {
    requirements
      .sort((a, b) => a.order - b.order)
      .forEach((requirement, index) => displayOrderById.set(requirement.id, index + 1));
  });
  const sorted = [...mounted.values()].sort((a, b) => {
    const surfaceDifference = (surfaceOrder.get(a.requirement.surface) ?? 0) - (surfaceOrder.get(b.requirement.surface) ?? 0);
    return surfaceDifference || a.requirement.order - b.requirement.order;
  });
  return sorted.map((item) => ({
    ...item,
    displayOrder: displayOrderById.get(item.requirement.id) ?? item.requirement.order,
  }));
}

export function RequirementModeLayer() {
  const { enabled, setEnabled, selectedId, setSelectedId } = useRequirementMode();
  const [mounted, setMounted] = useState<MountedRequirement[]>([]);
  const frameRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const observedElementsRef = useRef<Set<HTMLElement>>(new Set());
  const [overrides, setOverrides] = useState<RequirementOverrides>(() => {
    try {
      return parseRequirementOverrides(window.localStorage.getItem(OVERRIDES_STORAGE_KEY));
    } catch {
      return {};
    }
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RequirementDraft | null>(null);
  const location = useLocation();
  const supportedRoute = location.pathname === '/admin' || location.pathname.startsWith('/web_client');
  const effectiveRequirementById = useMemo(() => new Map(
    [...prototypeRequirementById].map(([id, requirement]) => {
      const override = overrides[id];
      return [id, override ? { ...requirement, ...override } : requirement];
    }),
  ), [overrides]);

  const refresh = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const next = collectMountedRequirements(effectiveRequirementById);
      const nextElements = new Set(next.map((item) => item.element));
      observedElementsRef.current.forEach((element) => {
        if (!nextElements.has(element)) resizeObserverRef.current?.unobserve(element);
      });
      nextElements.forEach((element) => {
        if (!observedElementsRef.current.has(element)) resizeObserverRef.current?.observe(element);
      });
      observedElementsRef.current = nextElements;
      setMounted((current) => {
        const unchanged = current.length === next.length && current.every((item, index) => {
          const candidate = next[index];
          return item.requirement.id === candidate.requirement.id
            && item.requirement === candidate.requirement
            && item.element === candidate.element
            && item.visible === candidate.visible
            && item.displayOrder === candidate.displayOrder
            && item.rect.left === candidate.rect.left
            && item.rect.top === candidate.rect.top
            && item.rect.width === candidate.rect.width
            && item.rect.height === candidate.rect.height;
        });
        return unchanged ? current : next;
      });
      frameRef.current = null;
    });
  }, [effectiveRequirementById]);

  useEffect(() => {
    if (!enabled || !supportedRoute) {
      setMounted([]);
      return undefined;
    }

    resizeObserverRef.current = new ResizeObserver(refresh);
    const mutationObserver = new MutationObserver(refresh);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);
    refresh();

    return () => {
      mutationObserver.disconnect();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      observedElementsRef.current.clear();
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [enabled, refresh, supportedRoute]);

  useEffect(() => {
    if (!enabled || !selectedId) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, selectedId, setSelectedId]);

  useEffect(() => {
    if (selectedId && !mounted.some((item) => item.requirement.id === selectedId)) {
      setSelectedId(null);
    }
  }, [mounted, selectedId, setSelectedId]);

  useEffect(() => {
    setEditing(false);
    setDraft(null);
  }, [selectedId]);

  const selected = mounted.find((item) => item.requirement.id === selectedId) ?? null;
  const surfaces = [...new Set(mounted.map((item) => item.requirement.surface))];
  const surfaceLabel = surfaces.length === 1 ? surfaces[0] : '当前视图';

  const selectRequirement = (item: MountedRequirement, scroll = false) => {
    setSelectedId(item.requirement.id);
    if (scroll) {
      item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(refresh, 350);
    }
  };

  const startEditing = () => {
    if (!selected) return;
    setDraft({
      title: selected.requirement.title,
      functionalRequirement: selected.requirement.functionalRequirement,
      businessRulesText: selected.requirement.businessRules.join('\n'),
    });
    setEditing(true);
  };

  const saveEditing = () => {
    if (!selected || !draft) return;
    const nextOverride: RequirementOverride = {
      title: draft.title.trim() || selected.requirement.title,
      functionalRequirement: draft.functionalRequirement.trim(),
      businessRules: draft.businessRulesText.split('\n').map((rule) => rule.trim()).filter(Boolean),
    };
    const next = { ...overrides, [selected.requirement.id]: nextOverride };
    try {
      window.localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(next));
      setOverrides(next);
      setEditing(false);
      setDraft(null);
    } catch {
      // Keep the draft open if local storage is unavailable.
    }
  };

  const restoreDefault = () => {
    if (!selected || !overrides[selected.requirement.id]) return;
    const next = { ...overrides };
    delete next[selected.requirement.id];
    try {
      window.localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(next));
      setOverrides(next);
      setEditing(false);
      setDraft(null);
    } catch {
      // Keep the current local content if storage is unavailable.
    }
  };

  const mountedBySurface = useMemo(() => {
    const groups = new Map<string, MountedRequirement[]>();
    mounted.forEach((item) => {
      const group = groups.get(item.requirement.surface) ?? [];
      group.push(item);
      groups.set(item.requirement.surface, group);
    });
    return [...groups.entries()];
  }, [mounted]);

  if (!supportedRoute) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className={`fixed right-4 top-3 z-[10030] inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold shadow-lg backdrop-blur-sm transition-colors ${
          enabled
            ? 'border-theme-200 bg-theme-600 text-white hover:bg-theme-700'
            : 'border-gray-200 bg-white/95 text-gray-600 hover:border-theme-200 hover:text-theme-700 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200'
        }`}
        title={enabled ? '关闭需求模式' : '开启需求模式'}
        aria-pressed={enabled}
      >
        <ListChecks size={15} />
        <span>需求模式</span>
        {enabled && <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">{mounted.length}</span>}
      </button>

      {enabled && (
        <div className="pointer-events-none fixed inset-0 z-[10010]">
          {mounted.filter((item) => item.visible).map((item) => (
            <button
              type="button"
              key={item.requirement.id}
              className="pointer-events-auto fixed flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-theme-600 px-1 text-[11px] font-bold text-white shadow-lg transition-transform hover:scale-110"
              style={{
                left: Math.max(6, Math.min(window.innerWidth - 34, item.rect.left - 10)),
                top: Math.max(48, Math.min(window.innerHeight - 34, item.rect.top - 10)),
              }}
              onClick={() => selectRequirement(item)}
              title={item.requirement.title}
              aria-label={`${item.requirement.surface}需求 ${item.displayOrder}：${item.requirement.title}`}
            >
              {item.displayOrder}
            </button>
          ))}

          {selected?.visible && (
            <div
              className="fixed rounded-md border-2 border-theme-500 bg-theme-100/10 shadow-[0_0_0_3px_rgba(184,41,113,0.14)]"
              style={{
                left: selected.rect.left - 3,
                top: selected.rect.top - 3,
                width: selected.rect.width + 6,
                height: selected.rect.height + 6,
              }}
            />
          )}
        </div>
      )}

      {enabled && selected && (
        <aside className="fixed bottom-4 right-4 top-16 z-[10020] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-theme-600 dark:text-theme-300">
                <ClipboardList size={14} />
                <span className="truncate">{surfaceLabel}</span>
                <span className="text-gray-400">{mounted.length} 项</span>
              </div>
              <h2 className="mt-1 text-base font-semibold text-gray-950 dark:text-white">原型需求</h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              title="关闭需求面板"
            >
              <X size={18} />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <nav className="border-b border-gray-100 px-3 py-3 dark:border-gray-800" aria-label="当前视图需求目录">
              {mountedBySurface.map(([surface, items]) => (
                <div key={surface} className="mb-3 last:mb-0">
                  <div className="px-3 pb-1 pt-1 text-[11px] font-semibold text-gray-400">{surface}</div>
                  {items.map((item) => {
                    const active = item.requirement.id === selectedId;
                    return (
                      <button
                        type="button"
                        key={item.requirement.id}
                        onClick={() => selectRequirement(item, true)}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-theme-50 text-theme-700 dark:bg-theme-900/30 dark:text-theme-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${active ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'}`}>
                          {item.displayOrder}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{item.requirement.title}</span>
                        <ChevronRight size={14} className="shrink-0 opacity-50" />
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="space-y-5 px-5 py-5">
              {editing && draft ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">标题</span>
                    <input
                      value={draft.title}
                      onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                      className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">功能需求</span>
                    <textarea
                      value={draft.functionalRequirement}
                      onChange={(event) => setDraft({ ...draft, functionalRequirement: event.target.value })}
                      rows={5}
                      className="w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm leading-6 text-gray-900 outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">业务规则</span>
                    <textarea
                      value={draft.businessRulesText}
                      onChange={(event) => setDraft({ ...draft, businessRulesText: event.target.value })}
                      rows={8}
                      placeholder="每行一条业务规则"
                      className="w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm leading-6 text-gray-900 outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                  </label>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setEditing(false); setDraft(null); }} className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">取消</button>
                    <button type="button" onClick={saveEditing} className="rounded-md bg-theme-600 px-3 py-2 text-sm font-semibold text-white hover:bg-theme-700">保存</button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white">{selected.requirement.title}</h3>
                      <button type="button" onClick={startEditing} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-theme-200 hover:text-theme-700 dark:border-gray-700 dark:text-gray-300" title="编辑需求">
                        <Pencil size={13} />编辑
                      </button>
                    </div>
                    <h4 className="mb-1 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">功能需求</h4>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">{selected.requirement.functionalRequirement || '暂无'}</p>
                  </div>

                  <section>
                    <h4 className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">业务规则</h4>
                    {selected.requirement.businessRules.length > 0 ? (
                      <div className="divide-y divide-gray-100 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                        {selected.requirement.businessRules.map((rule, index) => (
                          <div key={`${index}-${rule}`} className="flex gap-2.5 px-3 py-3 text-sm leading-5 text-gray-700 dark:text-gray-200">
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-theme-500" />
                            <span>{rule}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-gray-400">暂无</p>}
                  </section>

                  {overrides[selected.requirement.id] && (
                    <button type="button" onClick={restoreDefault} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-theme-700" title="删除本地修改并恢复代码中的默认内容">
                      <RotateCcw size={13} />恢复默认
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
