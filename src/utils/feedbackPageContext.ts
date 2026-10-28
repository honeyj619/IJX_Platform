import type { FeedbackPageContext } from '../data/feedback';

export const FEEDBACK_PAGE_CONTEXT_KEY = 'ijx-feedback-page-context-v1';

const sensitiveParams = new Set([
  'access_token',
  'auth',
  'code',
  'id_token',
  'password',
  'refresh_token',
  'ticket',
  'token',
]);

export const sanitizeFeedbackPagePath = (rawPath: string) => {
  const [pathAndQuery] = rawPath.split('#');
  const [pathname, query = ''] = pathAndQuery.split('?');
  if (!query) return pathname.slice(0, 500);
  const params = new URLSearchParams(query);
  Array.from(params.keys()).forEach(key => {
    if (sensitiveParams.has(key.toLowerCase())) params.delete(key);
  });
  const safeQuery = params.toString();
  return `${pathname}${safeQuery ? `?${safeQuery}` : ''}`.slice(0, 500);
};

export const createFeedbackPageContext = (title: string, rawPath: string): FeedbackPageContext => ({
  title: title.trim() || '未命名页面',
  path: sanitizeFeedbackPagePath(rawPath),
  capturedAt: new Date().toISOString(),
});

export const saveFeedbackPageContext = (context: FeedbackPageContext) => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(FEEDBACK_PAGE_CONTEXT_KEY, JSON.stringify(context));
};

export const consumeFeedbackPageContext = (): FeedbackPageContext | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(FEEDBACK_PAGE_CONTEXT_KEY);
  window.sessionStorage.removeItem(FEEDBACK_PAGE_CONTEXT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<FeedbackPageContext>;
    if (!parsed.title || !parsed.path || !parsed.capturedAt) return null;
    return { title: parsed.title, path: sanitizeFeedbackPagePath(parsed.path), capturedAt: parsed.capturedAt };
  } catch {
    return null;
  }
};
