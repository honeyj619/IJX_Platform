/**
 * 如意统一能力面板——数据与选项
 * 收编自旧版 RuYiZone 对话插件（2026-11-12 GPT WIP），按 V3 统一能力面板方案扩展。
 * V3.1 定位整改：插件只保留公文/PPT/参谋/翻译（查询工作、IT服务移回快捷能力体系，见 ruyiQuickPrompts.ts）。
 */

import type { RuyiCapability } from '../types/ruyi';

/** V3.1：如意空间插件清单（输入框下方的插件入口行；查询/IT 不属于插件） */
export const ruyiPluginCapabilityIds: RuyiCapability['id'][] = [
  'document',
  'presentation',
  'advisor',
  'translation',
];

export const lengthOptions = [
  "300-500",
  "500-800",
  "600-1200",
  "1000-1500",
  "1500-2000",
];

export interface RuyiDocumentTemplate {
  id: string;
  name: string;
  desc: string;
  accent: string;
  border: string;
  category: string;
  subCategory: string;
}

export const documentTemplates: RuyiDocumentTemplate[] = [
  { id: "official-red", name: "红头通知", desc: "适合正式通知、制度发布", accent: "bg-red-500", border: "border-red-200", category: "通知", subCategory: "公司通知" },
  { id: "policy-notice", name: "制度通知", desc: "适合规章制度、执行要求", accent: "bg-rose-500", border: "border-rose-200", category: "通知", subCategory: "制度发布" },
  { id: "party-study", name: "党群学习", desc: "适合学习教育、主题活动", accent: "bg-red-600", border: "border-red-200", category: "党群", subCategory: "学习教育" },
  { id: "party-activity", name: "党群活动", desc: "适合活动方案、组织安排", accent: "bg-orange-500", border: "border-orange-200", category: "党群", subCategory: "活动方案" },
  { id: "meeting-minutes", name: "项目纪要", desc: "适合项目会议、任务纪要", accent: "bg-sky-500", border: "border-sky-200", category: "会议纪要", subCategory: "项目会议" },
  { id: "meeting-summary", name: "专题纪要", desc: "适合专题讨论、决策记录", accent: "bg-indigo-500", border: "border-indigo-200", category: "会议纪要", subCategory: "专题会议" },
  { id: "brief-blue", name: "蓝色简报", desc: "适合工作汇报、会议材料", accent: "bg-blue-500", border: "border-blue-200", category: "工作简报", subCategory: "周报简报" },
  { id: "report-green", name: "经营报告", desc: "适合数据总结、经营分析", accent: "bg-emerald-500", border: "border-emerald-200", category: "工作简报", subCategory: "经营简报" },
];

export const templateCategories = ["通知", "党群", "会议纪要", "工作简报"];

export const templateFilterOptions: Record<string, string[]> = {
  通知: ["全部", "公司通知", "制度发布"],
  党群: ["全部", "学习教育", "活动方案"],
  会议纪要: ["全部", "项目会议", "专题会议"],
  工作简报: ["全部", "周报简报", "经营简报"],
};

/** 如意参谋轻量配置选项 */
export const advisorReportTypes = ["项目周报", "个人周报", "经营分析", "专题汇报"];
export const advisorReportCycles = ["本周", "上周", "本月", "上月", "本季度"];
/** V3.1：参谋数据来源选项 */
export const advisorDataSources = ["项目管理平台", "日历日程", "流程审批", "会议纪要", "手动补充"];

/** 智能翻译选项 */
export const translationTargetLanguages = ["英文", "日文", "韩文", "法文", "德文", "俄文"];
/** V3.1：源语言选项（自动检测 + 常用语言） */
export const translationSourceLanguages = ["自动检测", ...translationTargetLanguages, "中文"];
export const translationTones = ["正式", "日常", "商务", "学术"];

/** IT 服务问题类型 */
export const itServiceIssueTypes = ["账号登录", "VPN 网络", "办公软件", "硬件设备", "系统故障", "其他问题"];

/** 查询工作信息示例入口（点击直接发送） */
export const workQuerySamples = [
  { id: "todo", label: "查看我的待办", prompt: "我还有哪些待办流程？" },
  { id: "schedule", label: "查询今日日程", prompt: "帮我查一下今天的日程安排" },
  { id: "approval", label: "查询未处理流程", prompt: "我还有哪些流程没有处理？" },
  { id: "attendance", label: "查询考勤情况", prompt: "我的考勤情况怎么样？" },
];

/** 公文附件扩展名 */
export const documentAttachmentExtensions = ["doc", "docx", "pdf", "txt", "md"];

/** 参数摘要展示（提交后消息 + 助手确认共用；不参与业务判断） */
export function formatSubmissionParams(
  capabilityId: string,
  params: Record<string, unknown>,
): Array<{ label: string; value: string }> {
  const pick = (key: string): string => {
    const value = params[key];
    if (value === undefined || value === null || value === "") return "";
    return String(value);
  };
  switch (capabilityId) {
    case "document":
      return [
        { label: "公文类型", value: pick("docType") },
        { label: "篇幅", value: pick("docLength") ? `${pick("docLength")} 字` : "" },
        { label: "模板", value: pick("templateName") },
      ].filter((item) => item.value);
    case "presentation":
      return [
        { label: "页数", value: pick("pageCount") },
        { label: "文本量", value: pick("textStyle") },
        { label: "受众", value: pick("audience") },
        { label: "场景", value: pick("scene") },
        { label: "语气", value: pick("tone") },
        { label: "模板", value: pick("template") },
      ].filter((item) => item.value);
    case "advisor":
      return [
        { label: "汇报类型", value: pick("reportType") },
        { label: "汇报周期", value: pick("reportCycle") },
        { label: "分析对象", value: pick("analysisTarget") },
        { label: "数据来源", value: pick("dataSource") },
      ].filter((item) => item.value);
    case "translation":
      return [
        { label: "源语言", value: pick("sourceLanguage") },
        { label: "目标语言", value: pick("targetLanguage") },
        { label: "翻译语气", value: pick("tone") },
      ].filter((item) => item.value);
    default:
      return [];
  }
}
