import { MAIN_USER_NAME, getDemoPerson } from './people';
import { buildProjectWeeklyData, type HealthLight, type ProjectWeeklyData } from './projectWeeklyReport';
import { workItems } from './workItems';

export type ReportRecordType = '工作汇报' | '项目汇报';
export type ReportSendChannel = 'PC门户' | '邮件' | '企业微信';
export type ReportSendResult = '发送成功' | '部分送达' | '发送失败';

export type ReportSendReceipt = {
  channel: ReportSendChannel;
  target: string;
  time: string;
  success: boolean;
  read?: boolean;
};

export type PersonalReportSnapshot = {
  summary: string;
  completed: string;
  risks: string;
  nextPlan: string;
  support: string;
};

export type ReportSendRecord = {
  id: string;
  reportType: ReportRecordType;
  title: string;
  sender: string;
  sentAt: string;
  period: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  projectOwner?: string;
  projectMembers: string[];
  healthLight?: HealthLight;
  channels: ReportSendChannel[];
  reportTo: string[];
  copyTo: string[];
  result: ReportSendResult;
  receipts: ReportSendReceipt[];
  sourceLabels: string[];
  weeklyData?: ProjectWeeklyData;
  personalSnapshot?: PersonalReportSnapshot;
};

const STORAGE_KEY_V2 = 'ijx-report-send-records-v1-v3';
export const REPORT_SEND_RECORDS_EVENT = 'ijx-report-send-records-change';

const firstProject = workItems[1] || workItems[0];
const secondProject = workItems[0];

const buildSeedProjectRecord = (
  project: typeof workItems[number],
  index: number,
  sender: string,
  sentAt: string,
  period: string,
): ReportSendRecord => {
  const weeklyData = buildProjectWeeklyData({
    projectId: project.id,
    projectName: project.title,
    teamName: project.teamName,
    progress: project.progress,
    riskLevel: project.riskLevel,
    latestReport: project.latestReport,
    period,
  });
  weeklyData.projectCode = `PRJ-2026-${String(index + 1).padStart(3, '0')}`;

  const reportTo = [project.owner, getDemoPerson(0)];
  const copyTo = project.members.filter(name => !reportTo.includes(name)).slice(0, 2);
  const receipts: ReportSendReceipt[] = [...reportTo, ...copyTo].map((target, receiptIndex) => ({
    channel: receiptIndex % 2 === 0 ? 'PC门户' : '企业微信',
    target,
    time: sentAt,
    success: true,
    read: receiptIndex !== 1,
  }));

  return {
    id: `seed-project-${index + 1}`,
    reportType: '项目汇报',
    title: `${project.title}项目汇报`,
    sender,
    sentAt,
    period,
    projectId: project.id,
    projectCode: weeklyData.projectCode,
    projectName: project.title,
    projectOwner: project.owner,
    projectMembers: project.members,
    healthLight: weeklyData.healthLight,
    channels: ['PC门户', '企业微信'],
    reportTo,
    copyTo,
    result: '发送成功',
    receipts,
    sourceLabels: ['项目管理平台', '历史工作汇报', '日程 / 会议'],
    weeklyData,
  };
};

const seedRecords: ReportSendRecord[] = [
  buildSeedProjectRecord(firstProject, 1, firstProject.owner, '2026-10-08 17:42', '2026-10-05 至 2026-10-08'),
  buildSeedProjectRecord(secondProject, 0, MAIN_USER_NAME, '2026-10-07 18:16', '2026-10-05 至 2026-10-07'),
  // 失败留存样例：验证详情内"重新发送"操作
  (() => {
    const record = buildSeedProjectRecord(firstProject, 2, MAIN_USER_NAME, '2026-10-06 09:12', '2026-09-28 至 2026-10-04');
    return { ...record, title: `${firstProject.title}汇报（重发样例）`, result: '发送失败', receipts: record.receipts.map(receipt => ({ ...receipt, success: false })) };
  })(),
];

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const parseRecords = (value: string | null): ReportSendRecord[] | null => {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as ReportSendRecord[] : null;
  } catch {
    return null;
  }
};

export const getReportSendRecords = (): ReportSendRecord[] => {
  if (!canUseStorage()) return seedRecords;
  const stored = parseRecords(window.localStorage.getItem(STORAGE_KEY_V2));
  if (stored) return stored;
  window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(seedRecords));
  return seedRecords;
};

export const replaceReportSendRecords = (records: ReportSendRecord[]) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(REPORT_SEND_RECORDS_EVENT));
};

export const appendReportSendRecords = (records: ReportSendRecord[]) => {
  if (records.length === 0) return;
  const existing = getReportSendRecords();
  const incomingIds = new Set(records.map(record => record.id));
  replaceReportSendRecords([...records, ...existing.filter(record => !incomingIds.has(record.id))]);
};

export const subscribeReportSendRecords = (listener: () => void) => {
  if (typeof window === 'undefined') return () => undefined;
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY_V2) listener();
  };
  window.addEventListener('storage', handleStorage);
  window.addEventListener(REPORT_SEND_RECORDS_EVENT, listener);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(REPORT_SEND_RECORDS_EVENT, listener);
  };
};

export const createReportSendRecordId = (prefix = 'report') =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const splitRecipientNames = (value: string) =>
  [...new Set(value.split(/[,，、;；\n]+/).map(item => item.trim()).filter(Boolean))];

export const canViewReportSendRecord = (record: ReportSendRecord, personName: string) => {
  const viewers = new Set([
    record.sender,
    ...record.reportTo,
    ...record.copyTo,
    ...(record.reportType === '项目汇报'
      ? [record.projectOwner || '', ...record.projectMembers]
      : []),
  ].filter(Boolean));
  return viewers.has(personName);
};

export const deriveSendResult = (receipts: ReportSendReceipt[]): ReportSendResult => {
  if (receipts.length === 0 || receipts.every(receipt => !receipt.success)) return '发送失败';
  if (receipts.some(receipt => !receipt.success)) return '部分送达';
  return '发送成功';
};

export const formatReportRecordTime = (date = new Date()) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
