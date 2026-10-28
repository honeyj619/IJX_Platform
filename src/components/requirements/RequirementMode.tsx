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
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  ClipboardList,
  Crosshair,
  ListChecks,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { prototypeRequirements, type PrototypeRequirement } from '../../data/prototypeRequirements';

const STORAGE_KEY = 'ijx-prototype-requirement-mode';
const OVERRIDES_STORAGE_KEY = 'ijx-prototype-requirement-overrides-v2';
const OVERRIDES_DISMISS_KEY = 'ijx-prototype-requirement-overrides-v2-dismissed';
const LOCATOR_SELECTOR = '[trae-inspector-file-path][trae-inspector-start-line][trae-inspector-start-column]';
const NEW_SURFACE_VALUE = '__new_surface__';
const isMaintenanceEnabled = import.meta.env.DEV;

interface RequirementLocator {
  filePath: string;
  line: number;
  column: number;
}

type ManagedRequirement = PrototypeRequirement;

interface RequirementDraft {
  surface: string;
  title: string;
  functionalRequirement: string;
  businessRulesText: string;
}

interface LegacyImportCandidate {
  raw: string;
  overrides: Record<string, unknown>;
}

interface RequirementModeContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}

interface MountedRequirement {
  requirement: ManagedRequirement;
  element: HTMLElement;
  rect: DOMRect;
  visible: boolean;
  displayOrder: number;
}

type FormMode = 'create' | 'edit' | null;
type SelectionMode = { type: 'create' } | { type: 'rebind'; id: string } | null;

interface SelectionTarget {
  element: HTMLElement;
  rect: DOMRect;
  locator: RequirementLocator | null;
}

const RequirementModeContext = createContext<RequirementModeContextValue | null>(null);

function asManagedRequirements(value: unknown): ManagedRequirement[] {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { requirements?: unknown }).requirements)) {
    throw new Error('服务返回的需求列表格式不正确');
  }
  return (value as { requirements: ManagedRequirement[] }).requirements;
}

async function requestRequirements(path = '', init?: RequestInit): Promise<ManagedRequirement[]> {
  const response = await fetch(`/__ijx/requirements${path}`, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json', ...init.headers } : init?.headers,
  });
  if (!response.ok) {
    let message = `请求失败（${response.status}）`;
    try {
      const payload = await response.json() as { message?: string; error?: string };
      message = payload.message || payload.error || message;
    } catch {
      // Keep the status-based fallback when the response is not JSON.
    }
    throw new Error(message);
  }
  return asManagedRequirements(await response.json());
}

function getLocator(element: HTMLElement): RequirementLocator | null {
  const filePath = element.getAttribute('trae-inspector-file-path');
  const line = Number(element.getAttribute('trae-inspector-start-line'));
  const column = Number(element.getAttribute('trae-inspector-start-column'));
  if (!filePath || !Number.isInteger(line) || !Number.isInteger(column) || line < 1 || column < 0) return null;
  return { filePath, line, column };
}

function routeDefaultSurface(pathname: string) {
  const routeLabels: Array<[string, string]> = [
    ['/web_client/ruyi-zone', '如意空间'],
    ['/web_client/agent-square', '智能体广场'],
    ['/web_client/work-report', '工作汇报'],
    ['/web_client/enterprise', '个人门户'],
    ['/web_client/assistant', '智能助手'],
    ['/web_client/process', '流程中心'],
    ['/web_client/ekb', '企业知识库'],
    ['/web_client/profile', '个人中心'],
    ['/web_client/calendar', '日历'],
    ['/web_client/business', '商务中心'],
    ['/web_client/okr', 'OKR'],
    ['/web_client/settings', '设置'],
    ['/admin', '管理后台'],
  ];
  return routeLabels.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? '当前页面';
}

function getLegacyImportCandidate(): LegacyImportCandidate | null {
  if (!isMaintenanceEnabled) return null;
  try {
    const raw = window.localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (!raw || window.localStorage.getItem(OVERRIDES_DISMISS_KEY) === raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || Object.keys(parsed).length === 0) return null;
    return { raw, overrides: parsed as Record<string, unknown> };
  } catch {
    return null;
  }
}

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

function requirementRouteMatches(configuredRoute: string, pathname: string) {
  if (!configuredRoute.endsWith('/*')) return configuredRoute === pathname;
  const prefix = configuredRoute.slice(0, -2);
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function collectMountedRequirements(
  requirementById: Map<string, ManagedRequirement>,
  requirements: ManagedRequirement[],
  pathname: string,
): MountedRequirement[] {
  const mounted = new Map<string, MountedRequirement>();
  const addMounted = (requirement: ManagedRequirement, element: HTMLElement) => {
    if (mounted.has(requirement.id)) return;
    const rect = element.getBoundingClientRect();
    mounted.set(requirement.id, {
      requirement,
      element,
      rect,
      visible: rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth,
      displayOrder: 0,
    });
  };

  document.querySelectorAll<HTMLElement>('[data-requirement-id]').forEach((element) => {
    const requirement = requirementById.get(element.dataset.requirementId ?? '');
    if (requirement && requirementRouteMatches(requirement.route, pathname)) addMounted(requirement, element);
  });

  const surfaceOrder = new Map<string, number>();
  const displayOrderById = new Map<string, number>();
  const requirementsBySurface = new Map<string, ManagedRequirement[]>();
  requirements.forEach((requirement) => {
    if (!surfaceOrder.has(requirement.surface)) surfaceOrder.set(requirement.surface, surfaceOrder.size);
    const moduleKey = `${requirement.route}\0${requirement.surface}`;
    const group = requirementsBySurface.get(moduleKey) ?? [];
    group.push(requirement);
    requirementsBySurface.set(moduleKey, group);
  });
  requirementsBySurface.forEach((items) => {
    items.sort((a, b) => a.order - b.order).forEach((requirement, index) => {
      displayOrderById.set(requirement.id, index + 1);
    });
  });

  return [...mounted.values()]
    .sort((a, b) => {
      const surfaceDifference = (surfaceOrder.get(a.requirement.surface) ?? 0) - (surfaceOrder.get(b.requirement.surface) ?? 0);
      return surfaceDifference || a.requirement.order - b.requirement.order;
    })
    .map((item) => ({ ...item, displayOrder: displayOrderById.get(item.requirement.id) ?? item.requirement.order }));
}

export function RequirementModeLayer() {
  const { enabled, setEnabled, selectedId, setSelectedId } = useRequirementMode();
  const location = useLocation();
  const supportedRoute = location.pathname === '/admin' || location.pathname.startsWith('/web_client');
  const [requirements, setRequirements] = useState<ManagedRequirement[]>(prototypeRequirements);
  const [mounted, setMounted] = useState<MountedRequirement[]>([]);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [draft, setDraft] = useState<RequirementDraft | null>(null);
  const [draftLocator, setDraftLocator] = useState<RequirementLocator | null>(null);
  const [newSurface, setNewSurface] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>(null);
  const [selectionTarget, setSelectionTarget] = useState<SelectionTarget | null>(null);
  const [legacyImport, setLegacyImport] = useState<LegacyImportCandidate | null>(getLegacyImportCandidate);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const frameRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const observedElementsRef = useRef<Set<HTMLElement>>(new Set());

  const requirementById = useMemo(
    () => new Map(requirements.map((requirement) => [requirement.id, requirement])),
    [requirements],
  );

  const refresh = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const next = collectMountedRequirements(requirementById, requirements, location.pathname);
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
  }, [location.pathname, requirementById, requirements]);

  useEffect(() => {
    if (!enabled || !supportedRoute || !isMaintenanceEnabled) return undefined;
    let cancelled = false;
    requestRequirements()
      .then((next) => {
        if (!cancelled) {
          setRequirements(next);
          setLoadWarning(null);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled && isMaintenanceEnabled) {
          setLoadWarning(error instanceof Error ? error.message : '需求维护服务暂不可用');
        }
      });
    return () => { cancelled = true; };
  }, [enabled, supportedRoute]);

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
      if (event.key === 'Escape' && !selectionMode) setSelectedId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, selectedId, selectionMode, setSelectedId]);

  // 需求模式 UI（角标/面板/工具栏）上的 mousedown 不冒泡到 document：
  // 避免触发业务组件的"点击外部关闭"逻辑（如个人卡片菜单），导致锚点元素被卸载、角标点不到
  useEffect(() => {
    if (!enabled) return undefined;
    const swallowOutsideClose = (event: MouseEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('[data-requirement-ui]')) event.stopPropagation();
    };
    document.addEventListener('mousedown', swallowOutsideClose, true);
    return () => document.removeEventListener('mousedown', swallowOutsideClose, true);
  }, [enabled]);

  useEffect(() => {
    if (selectedId && !requirementById.has(selectedId)) setSelectedId(null);
  }, [requirementById, selectedId, setSelectedId]);

  useEffect(() => {
    setFormMode(null);
    setDraft(null);
    setDraftLocator(null);
    setSelectionMode(null);
    setSelectionTarget(null);
    setFeedback(null);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (enabled) return;
    setFormMode(null);
    setDraft(null);
    setDraftLocator(null);
    setSelectionMode(null);
    setSelectionTarget(null);
    setFeedback(null);
  }, [enabled]);

  const selected = selectedId ? requirementById.get(selectedId) ?? null : null;
  const selectedMounted = mounted.find((item) => item.requirement.id === selectedId) ?? null;
  const surfaces = useMemo(
    () => [...new Set(requirements.filter((item) => requirementRouteMatches(item.route, location.pathname)).map((item) => item.surface))],
    [location.pathname, requirements],
  );
  const mountedSurfaces = useMemo(() => [...new Set(mounted.map((item) => item.requirement.surface))], [mounted]);
  const surfaceLabel = mountedSurfaces.length === 1 ? mountedSurfaces[0] : '当前视图';

  const inferSurface = useCallback((element: HTMLElement) => {
    const owner = element.closest<HTMLElement>('[data-requirement-id]');
    const ownerRequirement = owner ? requirementById.get(owner.dataset.requirementId ?? '') : undefined;
    if (ownerRequirement) return ownerRequirement.surface;
    if (mountedSurfaces.length === 1) return mountedSurfaces[0];
    return routeDefaultSurface(location.pathname);
  }, [location.pathname, mountedSurfaces, requirementById]);

  const applyResponse = useCallback((next: ManagedRequirement[]) => {
    setRequirements(next);
    setLoadWarning(null);
    window.setTimeout(refresh, 0);
  }, [refresh]);

  const rebindRequirement = useCallback(async (id: string, locator: RequirementLocator) => {
    setBusyAction('rebind');
    setFeedback(null);
    try {
      const next = await requestRequirements(`/${encodeURIComponent(id)}/rebind`, {
        method: 'POST',
        body: JSON.stringify({ locator }),
      });
      applyResponse(next);
      setSelectedId(id);
      setSelectionMode(null);
      setSelectionTarget(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '重新定位失败');
    } finally {
      setBusyAction(null);
    }
  }, [applyResponse, setSelectedId]);

  useEffect(() => {
    if (!enabled || !isMaintenanceEnabled || !selectionMode) return undefined;
    const updateTarget = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target || target.closest('[data-requirement-ui]')) return;
      setSelectionTarget({ element: target, rect: target.getBoundingClientRect(), locator: getLocator(target) });
    };
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!target || target.closest('[data-requirement-ui]')) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const locator = getLocator(target);
      if (!locator) {
        setSelectionTarget({ element: target, rect: target.getBoundingClientRect(), locator: null });
        setFeedback('所选元素缺少源码 locator，无法保存。请选择带开发定位信息的页面元素。');
        return;
      }
      if (selectionMode.type === 'rebind') {
        void rebindRequirement(selectionMode.id, locator);
        return;
      }
      const surface = inferSurface(target);
      setDraft({ surface, title: '', functionalRequirement: '', businessRulesText: '' });
      setDraftLocator(locator);
      setNewSurface(!surfaces.includes(surface));
      setFormMode('create');
      setSelectedId(null);
      setSelectionMode(null);
      setSelectionTarget(null);
      setFeedback(null);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setSelectionMode(null);
      setSelectionTarget(null);
      setFeedback('已取消点选');
    };
    document.addEventListener('pointerover', updateTarget, true);
    document.addEventListener('click', handleClick, true);
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('pointerover', updateTarget, true);
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [enabled, inferSurface, rebindRequirement, selectionMode, setSelectedId, surfaces]);

  const selectRequirement = (item: MountedRequirement, scroll = false) => {
    setSelectedId(item.requirement.id);
    setFormMode(null);
    setDraft(null);
    setFeedback(null);
    if (scroll) {
      item.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(refresh, 350);
    }
  };

  const beginCreate = () => {
    setFormMode(null);
    setDraft(null);
    setDraftLocator(null);
    setSelectionMode({ type: 'create' });
    setSelectionTarget(null);
    setFeedback('请在页面中点选需要录入需求的元素，按 Esc 取消');
  };

  const startEditing = () => {
    if (!selected || !isMaintenanceEnabled) return;
    setDraft({
      surface: selected.surface,
      title: selected.title,
      functionalRequirement: selected.functionalRequirement,
      businessRulesText: selected.businessRules.join('\n'),
    });
    setNewSurface(false);
    setFormMode('edit');
    setFeedback(null);
  };

  const cancelForm = () => {
    setFormMode(null);
    setDraft(null);
    setDraftLocator(null);
    setFeedback(null);
  };

  const saveDraft = async () => {
    if (!draft || !formMode) return;
    const surface = draft.surface.trim();
    const title = draft.title.trim();
    if (!surface || !title) {
      setFeedback('功能模块和标题不能为空');
      return;
    }
    if (formMode === 'create' && !draftLocator) {
      setFeedback('当前元素缺少 locator，无法保存');
      return;
    }
    setBusyAction('save');
    setFeedback(null);
    try {
      const existingIds = new Set(requirements.map((item) => item.id));
      const businessRules = draft.businessRulesText.split('\n').map((rule) => rule.trim()).filter(Boolean);
      const next = formMode === 'create'
        ? await requestRequirements('/create', {
          method: 'POST',
          body: JSON.stringify({
            surface,
            route: location.pathname,
            title,
            functionalRequirement: draft.functionalRequirement.trim(),
            businessRules,
            locator: draftLocator,
          }),
        })
        : await requestRequirements(`/${encodeURIComponent(selected!.id)}`, {
          method: 'PUT',
          body: JSON.stringify({ surface, title, functionalRequirement: draft.functionalRequirement.trim(), businessRules }),
        });
      const savedId = formMode === 'edit'
        ? selected!.id
        : next.find((item) => !existingIds.has(item.id))?.id;
      applyResponse(next);
      setFormMode(null);
      setDraft(null);
      setDraftLocator(null);
      if (savedId) setSelectedId(savedId);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '保存失败');
    } finally {
      setBusyAction(null);
    }
  };

  const deleteSelected = async () => {
    if (!selected || !window.confirm(`确定删除“${selected.title}”吗？此操作不可撤销。`)) return;
    setBusyAction('delete');
    setFeedback(null);
    try {
      const next = await requestRequirements(`/${encodeURIComponent(selected.id)}`, { method: 'DELETE' });
      applyResponse(next);
      setSelectedId(null);
      cancelForm();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '删除失败');
    } finally {
      setBusyAction(null);
    }
  };

  const reorderSelected = async (direction: 'up' | 'down') => {
    if (!selected) return;
    setBusyAction(direction);
    setFeedback(null);
    try {
      const next = await requestRequirements(`/${encodeURIComponent(selected.id)}/reorder`, {
        method: 'POST',
        body: JSON.stringify({ direction }),
      });
      applyResponse(next);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '排序失败');
    } finally {
      setBusyAction(null);
    }
  };

  const beginRebind = () => {
    if (!selected || !window.confirm(`确定重新定位“${selected.title}”吗？确认后请在页面中点选新的绑定元素。`)) return;
    setFormMode(null);
    setDraft(null);
    setSelectionMode({ type: 'rebind', id: selected.id });
    setSelectionTarget(null);
    setFeedback('请点选新的绑定元素，按 Esc 取消');
  };

  const importLegacyOverrides = async () => {
    if (!legacyImport || !window.confirm('确定将旧版本的本地需求修改导入需求服务吗？导入成功后会清理本地旧数据。')) return;
    setBusyAction('import');
    setFeedback(null);
    try {
      const next = await requestRequirements('/import-overrides', {
        method: 'POST',
        body: JSON.stringify({ overrides: legacyImport.overrides }),
      });
      applyResponse(next);
      window.localStorage.removeItem(OVERRIDES_STORAGE_KEY);
      window.localStorage.removeItem(OVERRIDES_DISMISS_KEY);
      setLegacyImport(null);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '导入失败');
    } finally {
      setBusyAction(null);
    }
  };

  const dismissLegacyImport = () => {
    if (!legacyImport) return;
    try {
      window.localStorage.setItem(OVERRIDES_DISMISS_KEY, legacyImport.raw);
    } catch {
      // Dismiss for this session even when storage is unavailable.
    }
    setLegacyImport(null);
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

  const selectedSurfaceItems = selected ? requirements
    .filter((item) => item.surface === selected.surface && item.route === selected.route)
    .sort((a, b) => a.order - b.order) : [];
  const selectedSurfaceIndex = selected ? selectedSurfaceItems.findIndex((item) => item.id === selected.id) : -1;
  const panelVisible = enabled && Boolean(selected || formMode || legacyImport);

  if (!supportedRoute) return null;

  return (
    <>
      <div data-requirement-ui className="fixed right-4 top-3 z-[10030] flex items-center gap-2">
        {enabled && isMaintenanceEnabled && (
          <button type="button" onClick={beginCreate} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gray-200 bg-white/95 px-2.5 text-xs font-semibold text-gray-600 shadow-lg backdrop-blur-sm hover:border-theme-200 hover:text-theme-700 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200" title="新增原型需求">
            <Plus size={15} /><span>新增</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold shadow-lg backdrop-blur-sm transition-colors ${enabled ? 'border-theme-200 bg-theme-600 text-white hover:bg-theme-700' : 'border-gray-200 bg-white/95 text-gray-600 hover:border-theme-200 hover:text-theme-700 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-200'}`}
          title={enabled ? '关闭需求模式' : '开启需求模式'}
          aria-pressed={enabled}
        >
          <ListChecks size={15} /><span>需求模式</span>
          {enabled && <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px]">{mounted.length}</span>}
        </button>
      </div>

      {enabled && (
        <div data-requirement-ui className="pointer-events-none fixed inset-0 z-[10010]">
          {mounted.filter((item) => item.visible).map((item) => (
            <button
              type="button"
              key={item.requirement.id}
              className="pointer-events-auto fixed flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-theme-600 px-1 text-[11px] font-bold text-white shadow-lg transition-transform hover:scale-110"
              style={{ left: Math.max(6, Math.min(window.innerWidth - 34, item.rect.left - 10)), top: Math.max(48, Math.min(window.innerHeight - 34, item.rect.top - 10)) }}
              onClick={() => selectRequirement(item)}
              title={item.requirement.title}
              aria-label={`${item.requirement.surface}需求 ${item.displayOrder}：${item.requirement.title}`}
            >
              {item.displayOrder}
            </button>
          ))}
          {selectedMounted?.visible && (
            <div className="fixed rounded-md border-2 border-theme-500 bg-theme-100/10 shadow-[0_0_0_3px_rgba(184,41,113,0.14)]" style={{ left: selectedMounted.rect.left - 3, top: selectedMounted.rect.top - 3, width: selectedMounted.rect.width + 6, height: selectedMounted.rect.height + 6 }} />
          )}
          {selectionMode && selectionTarget && (
            <div className={`fixed border-2 ${selectionTarget.locator ? 'border-emerald-500 bg-emerald-100/10' : 'border-red-500 bg-red-100/10'}`} style={{ left: selectionTarget.rect.left - 2, top: selectionTarget.rect.top - 2, width: selectionTarget.rect.width + 4, height: selectionTarget.rect.height + 4 }} />
          )}
        </div>
      )}

      {enabled && selectionMode && (
        <div data-requirement-ui className="fixed left-1/2 top-4 z-[10040] flex -translate-x-1/2 items-center gap-2 rounded-md border border-gray-200 bg-gray-950 px-3 py-2 text-xs font-medium text-white shadow-xl">
          <Crosshair size={15} />
          <span>{feedback || (selectionMode.type === 'create' ? '点选元素以新增需求' : '点选新的绑定元素')} · Esc 取消</span>
          <button type="button" onClick={() => { setSelectionMode(null); setSelectionTarget(null); }} className="ml-1 rounded p-0.5 text-gray-300 hover:bg-white/10 hover:text-white" title="取消点选"><X size={14} /></button>
        </div>
      )}

      {panelVisible && (
        <aside data-requirement-ui className="fixed bottom-4 right-4 top-16 z-[10020] flex w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-theme-600 dark:text-theme-300"><ClipboardList size={14} /><span className="truncate">{surfaceLabel}</span><span className="text-gray-400">{mounted.length} 项</span></div>
              <h2 className="mt-1 text-base font-semibold text-gray-950 dark:text-white">原型需求</h2>
            </div>
            <button type="button" onClick={() => { setSelectedId(null); cancelForm(); }} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200" title="关闭需求面板"><X size={18} /></button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {legacyImport && isMaintenanceEnabled && (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
                <div className="flex gap-2 text-xs leading-5 text-amber-800 dark:text-amber-200"><Upload size={15} className="mt-0.5 shrink-0" /><span>检测到旧版本的本地需求修改，可以一次性导入到需求服务。</span></div>
                <div className="mt-2 flex justify-end gap-2">
                  <button type="button" onClick={dismissLegacyImport} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40"><X size={13} />忽略</button>
                  <button type="button" onClick={() => void importLegacyOverrides()} disabled={busyAction === 'import'} className="inline-flex items-center gap-1 rounded-md bg-amber-700 px-2 py-1.5 text-xs font-semibold text-white hover:bg-amber-800 disabled:opacity-50"><Upload size={13} />导入</button>
                </div>
              </div>
            )}

            {mounted.length > 0 && (
              <nav className="border-b border-gray-100 px-3 py-3 dark:border-gray-800" aria-label="当前视图需求目录">
                {mountedBySurface.map(([surface, items]) => (
                  <div key={surface} className="mb-3 last:mb-0">
                    <div className="px-3 pb-1 pt-1 text-[11px] font-semibold text-gray-400">{surface}</div>
                    {items.map((item) => {
                      const active = item.requirement.id === selectedId;
                      return (
                        <button type="button" key={item.requirement.id} onClick={() => selectRequirement(item, true)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-theme-50 text-theme-700 dark:bg-theme-900/30 dark:text-theme-200' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'}`}>
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${active ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300'}`}>{item.displayOrder}</span>
                          <span className="min-w-0 flex-1 truncate">{item.requirement.title}</span><ChevronRight size={14} className="shrink-0 opacity-50" />
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>
            )}

            <div className="space-y-4 px-5 py-5">
              {(feedback || loadWarning) && (
                <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"><AlertCircle size={15} className="mt-0.5 shrink-0" /><span>{feedback || `维护服务未连接：${loadWarning}`}</span></div>
              )}

              {formMode && draft ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">功能模块</span>
                    <select value={newSurface ? NEW_SURFACE_VALUE : draft.surface} onChange={(event) => { const createSurface = event.target.value === NEW_SURFACE_VALUE; setNewSurface(createSurface); setDraft({ ...draft, surface: createSurface ? '' : event.target.value }); }} className="h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                      {surfaces.map((surface) => <option key={surface} value={surface}>{surface}</option>)}
                      <option value={NEW_SURFACE_VALUE}>+ 新建模块</option>
                    </select>
                  </label>
                  {newSurface && <label className="block"><span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">新模块名称</span><input value={draft.surface} onChange={(event) => setDraft({ ...draft, surface: event.target.value })} className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>}
                  <label className="block"><span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">标题</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="h-10 w-full rounded-md border border-gray-200 px-3 text-sm text-gray-900 outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                  <label className="block"><span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">功能需求</span><textarea value={draft.functionalRequirement} onChange={(event) => setDraft({ ...draft, functionalRequirement: event.target.value })} rows={5} className="w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm leading-6 text-gray-900 outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                  <label className="block"><span className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">业务规则</span><textarea value={draft.businessRulesText} onChange={(event) => setDraft({ ...draft, businessRulesText: event.target.value })} rows={8} placeholder="每行一条业务规则" className="w-full resize-y rounded-md border border-gray-200 px-3 py-2 text-sm leading-6 text-gray-900 outline-none focus:border-theme-400 focus:ring-2 focus:ring-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white" /></label>
                  <div className="flex justify-end gap-2"><button type="button" onClick={cancelForm} className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"><X size={14} />取消</button><button type="button" onClick={() => void saveDraft()} disabled={busyAction === 'save'} className="inline-flex items-center gap-1 rounded-md bg-theme-600 px-3 py-2 text-sm font-semibold text-white hover:bg-theme-700 disabled:opacity-50"><Save size={14} />保存</button></div>
                </div>
              ) : selected ? (
                <>
                  <div>
                    <div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold text-gray-950 dark:text-white">{selected.title}</h3>{isMaintenanceEnabled && <button type="button" onClick={startEditing} className="inline-flex shrink-0 items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-theme-200 hover:text-theme-700 dark:border-gray-700 dark:text-gray-300" title="编辑需求"><Pencil size={13} />编辑</button>}</div>
                    <h4 className="mb-1 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">功能需求</h4><p className="whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">{selected.functionalRequirement || '暂无'}</p>
                  </div>
                  <section>
                    <h4 className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">业务规则</h4>
                    {selected.businessRules.length > 0 ? <div className="divide-y divide-gray-100 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-700">{selected.businessRules.map((rule, index) => <div key={`${index}-${rule}`} className="flex gap-2.5 px-3 py-3 text-sm leading-5 text-gray-700 dark:text-gray-200"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-theme-500" /><span>{rule}</span></div>)}</div> : <p className="text-sm text-gray-400">暂无</p>}
                  </section>
                  {isMaintenanceEnabled && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
                      <button type="button" onClick={() => void reorderSelected('up')} disabled={selectedSurfaceIndex <= 0 || busyAction !== null} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-600 hover:text-theme-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300" title="在模块内上移"><ArrowUp size={13} />上移</button>
                      <button type="button" onClick={() => void reorderSelected('down')} disabled={selectedSurfaceIndex < 0 || selectedSurfaceIndex >= selectedSurfaceItems.length - 1 || busyAction !== null} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-600 hover:text-theme-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300" title="在模块内下移"><ArrowDown size={13} />下移</button>
                      <button type="button" onClick={beginRebind} disabled={busyAction !== null} className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1.5 text-xs text-gray-600 hover:text-theme-700 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300" title="重新定位需求元素"><Crosshair size={13} />重新定位</button>
                      <button type="button" onClick={() => void deleteSelected()} disabled={busyAction !== null} className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/30" title="删除需求"><Trash2 size={13} />删除</button>
                    </div>
                  )}
                </>
              ) : !legacyImport && !feedback && !loadWarning ? (
                <div className="flex items-center justify-center py-8 text-sm text-gray-400"><Check size={16} className="mr-2" />请选择页面上的需求标记</div>
              ) : null}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
