import type { ProjectWeeklyData } from './projectWeeklyReport';
import type { PersonalReportSnapshot, ReportRecordType } from './reportSendRecords';

export type SavedReportRecord = {
  id: string;
  reportKey: string;
  reportType: ReportRecordType;
  title: string;
  sender: string;
  savedAt: string;
  period: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  projectOwner?: string;
  projectMembers: string[];
  reportTo: string[];
  copyTo: string[];
  sourceLabels: string[];
  contentHash: string;
  htmlContent: string;
  weeklyData?: ProjectWeeklyData;
  personalSnapshot?: PersonalReportSnapshot;
};

type ReportKeyInput = {
  sender: string;
  reportType: ReportRecordType;
  period: string;
  projectId?: string;
  projectName?: string;
};

const STORAGE_KEY = 'ijx-saved-reports-v1';
const ACTIVE_REPORT_KEY = 'ijx-advisor-active-saved-report-v1';
export const SAVED_REPORTS_EVENT = 'ijx-saved-reports-change';

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

/** 演示种子：首次使用且无任何已保存记录时注入一条，便于查看详情与保存/提交流程 */
const SEED_SAVED_REPORT: SavedReportRecord = {
  id: 'seed-saved-report-1',
  reportKey: JSON.stringify(['梁吉力', '工作汇报', '', '2026-10-12至2026-10-16']),
  reportType: '工作汇报',
  title: '第41周个人工作汇报',
  sender: '梁吉力',
  savedAt: '2026-10-14 09:30',
  period: '2026-10-12 至 2026-10-16',
  projectMembers: [],
  reportTo: ['接总'],
  copyTo: ['任总'],
  sourceLabels: ['OKR', '日程 / 会议'],
  contentHash: 'seed41',
  htmlContent: `<div style="font-family: inherit;">
    <h2 style="margin:0 0 12px;font-size:18px;">第41周个人工作汇报（2026-10-12 至 2026-10-16）</h2>
    <p style="margin:0 0 10px;color:#374151;">本周聚焦如意工作台统一方案落地与工作门户体验优化，完成三个工作台骨架对齐与汇报详情保存/提交闭环。</p>
    <h3 style="margin:14px 0 8px;font-size:15px;">本周进展</h3>
    <ul style="margin:0;padding-left:20px;color:#374151;line-height:1.8;">
      <li>完成如意工作台功能与设计统一方案执行（公文 / PPT / 参谋师三台骨架一致）</li>
      <li>已保存汇报详情支持保存与两级确认提交（发送确认 → 再次确认）</li>
      <li>常用系统 / 常用功能按 7 日点击频率排序上线</li>
    </ul>
    <h3 style="margin:14px 0 8px;font-size:15px;">风险与支持</h3>
    <p style="margin:0;color:#374151;">暂无新增风险，需要设计侧确认右栏 320px 规范在 1024px 视口的最终表现。</p>
  </div>`,
};

export const ensureSeedSavedReport = () => {
  if (!canUseStorage()) return;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return;
    } catch { /* 落入下方注入 */ }
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([SEED_SAVED_REPORT]));
};

export const createReportBusinessKey = ({ sender, reportType, period, projectId, projectName }: ReportKeyInput) => JSON.stringify([
  sender.trim(),
  reportType,
  (projectId || projectName || '').trim(),
  period.replace(/\s+/g, ''),
]);

export const hashReportContent = (value: unknown) => {
  const source = typeof value === 'string' ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

export const getSavedReportRecords = (): SavedReportRecord[] => {
  if (!canUseStorage()) return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed as SavedReportRecord[] : [];
  } catch {
    return [];
  }
};

export const upsertSavedReportRecords = (records: SavedReportRecord[]) => {
  if (!canUseStorage() || records.length === 0) return;
  const incomingKeys = new Set(records.map(record => record.reportKey));
  const existing = getSavedReportRecords().filter(record => !incomingKeys.has(record.reportKey));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...records, ...existing]));
  window.localStorage.setItem(ACTIVE_REPORT_KEY, records[0].reportKey);
  window.dispatchEvent(new CustomEvent(SAVED_REPORTS_EVENT));
};

export const getActiveSavedReport = () => {
  if (!canUseStorage()) return null;
  const reportKey = window.localStorage.getItem(ACTIVE_REPORT_KEY);
  return reportKey ? getSavedReportRecords().find(record => record.reportKey === reportKey) || null : null;
};

export const clearActiveSavedReport = () => {
  if (canUseStorage()) window.localStorage.removeItem(ACTIVE_REPORT_KEY);
};

export const subscribeSavedReports = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(SAVED_REPORTS_EVENT, listener);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(SAVED_REPORTS_EVENT, listener);
  };
};

export const createSavedReportId = () => `saved-report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
