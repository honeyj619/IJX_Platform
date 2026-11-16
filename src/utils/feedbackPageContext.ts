import { captureFeedbackPageContext, type FeedbackClientKind, type FeedbackPageContext, type FeedbackPlatform } from '../data/feedback';

export const FEEDBACK_PAGE_CONTEXT_KEY = 'ijx-feedback-page-context-v1';

/**
 * 兼容封装：采集反馈页面上下文并写入 sessionStorage。
 * 路由脱敏（白名单参数）统一在 data/feedback.ts 的 captureFeedbackPageContext / sanitizeFeedbackPath。
 */
export const createFeedbackPageContext = (
  title: string,
  rawPath: string,
  clientKind?: FeedbackClientKind,
  platform?: FeedbackPlatform,
): FeedbackPageContext => captureFeedbackPageContext(title, rawPath, clientKind, platform);

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
    return captureFeedbackPageContext(parsed.title, parsed.path, parsed.clientKind, parsed.platform);
  } catch {
    return null;
  }
};

/** App 端「最近业务页面」上下文（Vue 子应用路由切换时写入，反馈页消费） */
export const FEEDBACK_LAST_BUSINESS_KEY = 'ijx-feedback-last-business-page';

export const saveLastBusinessPage = (context: { title: string; path: string }) => {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(FEEDBACK_LAST_BUSINESS_KEY, JSON.stringify(context));
  } catch { /* 存储失败不阻断 */ }
};

export const getLastBusinessPage = (): { title: string; path: string } | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(FEEDBACK_LAST_BUSINESS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.title && parsed.path) return { title: String(parsed.title), path: String(parsed.path) };
    return null;
  } catch {
    return null;
  }
};
