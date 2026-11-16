import type { RuyiCapabilitySubmission } from "../../../types/ruyi";
import { formatSubmissionParams } from "../../../data/ruyiToolPanel";
import { FileText } from "lucide-react";

/** 参数摘要：提交后用户消息下方 / 助手确认消息共用（读取消息上的 capabilitySubmission） */

interface RuyiCapabilitySummaryProps {
  submission: RuyiCapabilitySubmission;
}

export default function RuyiCapabilitySummary({ submission }: RuyiCapabilitySummaryProps) {
  const params = formatSubmissionParams(submission.capabilityId, submission.confirmedParams);
  const hasContent = params.length > 0 || submission.attachments.length > 0;
  if (!hasContent) return null;

  return (
    <div
      className="mt-2 rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs leading-6 text-gray-500 dark:border-gray-600 dark:bg-gray-700/60 dark:text-gray-300"
      data-requirement-id="ruyi-capability-summary"
    >
      {params.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {params.map((item) => (
            <span key={item.label}>
              <span className="text-gray-400 dark:text-gray-400">{item.label}：</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{item.value}</span>
            </span>
          ))}
        </div>
      )}
      {submission.attachments.length > 0 && (
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-gray-400">附件：</span>
          {submission.attachments.map((attachment) => (
            <span key={attachment} className="inline-flex max-w-[220px] items-center gap-1 truncate rounded bg-white px-1.5 py-0.5 text-gray-600 dark:bg-gray-800 dark:text-gray-300" title={attachment}>
              <FileText size={11} className="flex-shrink-0 text-theme-500" />
              <span className="truncate">{attachment}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
