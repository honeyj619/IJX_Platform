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
