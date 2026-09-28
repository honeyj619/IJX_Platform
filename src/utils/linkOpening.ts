export const TRUSTED_ROUTE_DICTIONARY_NAME = '客户端授信 URL';
export const TRUSTED_ROUTE_DICTIONARY_TYPE = 'client_trusted_routes';
export const TRUSTED_ROUTE_STORAGE_KEY = 'clientTrustedRouteDictionary';

export type LinkOpenMode = 'auto' | 'browser' | 'native';
export type LinkOpenDestination = 'internal' | 'client-webview' | 'browser' | 'native' | 'invalid';

export type TrustedRouteDictionaryItem = {
  id: string;
  label: string;
  origin: string;
  paths: string;
  sort?: number;
  status?: 'normal' | 'disabled';
  createdAt?: string;
};

export type TrustedRouteRule = {
  itemId: string;
  label: string;
  origin: string;
  path: string;
};

export type TrustedRouteValidation = {
  valid: boolean;
  normalizedOrigin: string;
  normalizedPaths: string[];
  errors: string[];
  warnings: string[];
};

type ClientBridge = {
  openWebView?: (url: string, policy?: {
    dictionaryType: string;
    revalidateOnNavigation: boolean;
    fallback: 'external-browser';
  }) => void;
  openExternal?: (url: string) => void;
  openNative?: (target: string) => void;
};

type ClientWindow = Window & {
  ijxDesktopBridge?: ClientBridge;
  ijxClient?: ClientBridge;
};

export type OpenPortalLinkOptions = {
  url?: string;
  label?: string;
  mode?: LinkOpenMode;
  navigate: (url: string) => void;
  onFeedback?: (message: string) => void;
  runtime?: 'web' | 'client';
  trustedItems?: TrustedRouteDictionaryItem[];
};

export type OpenPortalLinkResult = {
  destination: LinkOpenDestination;
  trusted: boolean;
  reason: string;
};

const splitConfiguredPaths = (value: string) => value
  .split(/[;；]/)
  .map(path => path.trim())
  .filter(Boolean);

const normalizeConfiguredPath = (path: string, origin: string) => {
  const parsed = new URL(path, `${origin}/`);
  if (parsed.search || parsed.hash) return '';
  const normalized = parsed.pathname || '/';
  return normalized === '/' ? normalized : normalized.replace(/\/+$/, '');
};

export function validateTrustedRouteItem(
  item: Pick<TrustedRouteDictionaryItem, 'label' | 'origin' | 'paths'>,
): TrustedRouteValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const label = item.label.trim();
  const originValue = item.origin.trim();
  let normalizedOrigin = '';

  if (!label) errors.push('请输入数据标签');
  if (!originValue) {
    errors.push('请输入数据键值');
  } else {
    try {
      const parsed = new URL(originValue);
      if (!['http:', 'https:'].includes(parsed.protocol)) errors.push('数据键值仅支持 HTTP 或 HTTPS Origin');
      if (parsed.username || parsed.password) errors.push('数据键值不能包含用户名或密码');
      if (parsed.hostname.includes('*')) errors.push('数据键值不支持通配符域名');
      if (parsed.pathname !== '/' || parsed.search || parsed.hash) errors.push('数据键值只能填写 Origin，不能包含路径、参数或锚点');
      normalizedOrigin = parsed.origin;
    } catch {
      errors.push('数据键值必须是包含协议的完整 Origin');
    }
  }

  const rawPaths = splitConfiguredPaths(item.paths);
  if (rawPaths.length === 0) errors.push('备注中至少填写一个应用根路径');

  const normalizedPaths = rawPaths.map(path => {
    if (!path.startsWith('/')) {
      errors.push(`路径“${path}”必须以 / 开头`);
      return '';
    }
    if (path.startsWith('//')) {
      errors.push(`路径“${path}”不能以 // 开头`);
      return '';
    }
    if (path.includes('?') || path.includes('#')) {
      errors.push(`路径“${path}”不能包含查询参数或锚点`);
      return '';
    }
    if (!normalizedOrigin) return '';
    return normalizeConfiguredPath(path, normalizedOrigin);
  }).filter(Boolean);

  if (new Set(normalizedPaths).size !== normalizedPaths.length) errors.push('备注中存在重复的应用根路径');
  if (normalizedPaths.includes('/')) warnings.push('根路径 / 将授信该 Origin 下的全部页面，请确认确有必要');

  return {
    valid: errors.length === 0,
    normalizedOrigin,
    normalizedPaths,
    errors,
    warnings,
  };
}

export function buildTrustedRouteRules(items: TrustedRouteDictionaryItem[]): TrustedRouteRule[] {
  const rules: TrustedRouteRule[] = [];
  items.forEach(item => {
    if (item.status === 'disabled') return;
    const validation = validateTrustedRouteItem(item);
    if (!validation.valid) return;
    validation.normalizedPaths.forEach(path => {
      rules.push({
        itemId: item.id,
        label: item.label.trim(),
        origin: validation.normalizedOrigin,
        path,
      });
    });
  });
  return rules;
}

export function isTrustedClientUrl(targetUrl: string, items: TrustedRouteDictionaryItem[]): boolean {
  let target: URL;
  try {
    target = new URL(targetUrl);
  } catch {
    return false;
  }

  if (!['http:', 'https:'].includes(target.protocol)) return false;
  return buildTrustedRouteRules(items).some(rule => {
    if (target.origin !== rule.origin) return false;
    if (rule.path === '/') return true;
    return target.pathname === rule.path || target.pathname.startsWith(`${rule.path}/`);
  });
}

export function loadTrustedRouteItems(): TrustedRouteDictionaryItem[] {
  try {
    const saved = window.localStorage.getItem(TRUSTED_ROUTE_STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is TrustedRouteDictionaryItem => {
      if (!item || typeof item !== 'object') return false;
      const candidate = item as Partial<TrustedRouteDictionaryItem>;
      return typeof candidate.id === 'string'
        && typeof candidate.label === 'string'
        && typeof candidate.origin === 'string'
        && typeof candidate.paths === 'string';
    });
  } catch {
    return [];
  }
}

export function saveTrustedRouteItems(items: TrustedRouteDictionaryItem[]) {
  try {
    window.localStorage.setItem(TRUSTED_ROUTE_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}

export function isDesktopClientEnvironment() {
  const clientWindow = window as ClientWindow;
  return Boolean(
    clientWindow.ijxDesktopBridge
    || clientWindow.ijxClient
    || /IJXClient|JuneyaoClient|Electron/i.test(window.navigator.userAgent),
  );
}

const getClientBridge = () => {
  const clientWindow = window as ClientWindow;
  return clientWindow.ijxDesktopBridge || clientWindow.ijxClient;
};

const openExternal = (url: string) => {
  const bridge = getClientBridge();
  if (bridge?.openExternal) {
    bridge.openExternal(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

export function openPortalLink({
  url,
  label = '该入口',
  mode = 'auto',
  navigate,
  onFeedback,
  runtime,
  trustedItems,
}: OpenPortalLinkOptions): OpenPortalLinkResult {
  const target = url?.trim();

  if (mode === 'native') {
    const bridge = getClientBridge();
    bridge?.openNative?.(target || label);
    onFeedback?.(bridge?.openNative ? `正在调用客户端原生能力：${label}` : `${label} 为客户端原生能力`);
    return { destination: 'native', trusted: false, reason: 'native-mode' };
  }

  if (!target) {
    onFeedback?.(`${label} 暂未配置入口地址`);
    return { destination: 'invalid', trusted: false, reason: 'missing-url' };
  }

  if (target.startsWith('/') && !target.startsWith('//')) {
    navigate(target);
    return { destination: 'internal', trusted: true, reason: 'relative-route' };
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    onFeedback?.(`${label} 的入口地址无效`);
    return { destination: 'invalid', trusted: false, reason: 'invalid-url' };
  }

  const clientRuntime = runtime ? runtime === 'client' : isDesktopClientEnvironment();
  if (!clientRuntime || mode === 'browser' || !['http:', 'https:'].includes(parsed.protocol)) {
    openExternal(parsed.href);
    onFeedback?.(`${label} 将在默认浏览器打开`);
    return { destination: 'browser', trusted: false, reason: mode === 'browser' ? 'forced-browser' : 'web-or-non-http' };
  }

  const configuredItems = trustedItems ?? loadTrustedRouteItems();
  const trusted = isTrustedClientUrl(parsed.href, configuredItems);
  const bridge = getClientBridge();

  if (trusted && bridge?.openWebView) {
    bridge.openWebView(parsed.href, {
      dictionaryType: TRUSTED_ROUTE_DICTIONARY_TYPE,
      revalidateOnNavigation: true,
      fallback: 'external-browser',
    });
    onFeedback?.(`${label} 将在客户端内打开`);
    return { destination: 'client-webview', trusted: true, reason: 'trusted-route' };
  }

  openExternal(parsed.href);
  onFeedback?.(trusted ? `${label} 缺少客户端内嵌能力，已改用默认浏览器` : `${label} 未命中授信路由，将在默认浏览器打开`);
  return { destination: 'browser', trusted, reason: trusted ? 'missing-client-bridge' : 'untrusted-route' };
}
