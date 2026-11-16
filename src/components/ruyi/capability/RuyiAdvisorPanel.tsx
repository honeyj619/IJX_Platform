import { useState } from "react";
import { advisorReportTypes, advisorReportCycles, advisorDataSources } from "../../../data/ruyiToolPanel";

/** 如意参谋轻量配置面板：任务类型/汇报周期/分析对象/数据来源/补充要求 */

export interface AdvisorPanelState {
  reportType: string;
  reportCycle: string;
  analysisTarget: string;
  /** V3.1：数据来源 */
  dataSource: string;
  extraRequirement: string;
}

export function createInitialAdvisorPanelState(): AdvisorPanelState {
  return {
    reportType: advisorReportTypes[0],
    reportCycle: advisorReportCycles[0],
    analysisTarget: "",
    dataSource: advisorDataSources[0],
    extraRequirement: "",
  };
}

const control =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white";

interface RuyiAdvisorPanelProps {
  variant: "compact" | "full";
  advisorState: AdvisorPanelState;
  onAdvisorChange: (patch: Partial<AdvisorPanelState>) => void;
}

export default function RuyiAdvisorPanel({ advisorState, onAdvisorChange }: RuyiAdvisorPanelProps) {
  void useState; // 保持 hooks 形状一致（当前无本地状态）
  return (
    <div
      className="space-y-4"
      data-requirement-id="ruyi-advisor-tool-panel"
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">汇报类型</span>
          <select
            value={advisorState.reportType}
            onChange={(e) => onAdvisorChange({ reportType: e.target.value })}
            className={control}
          >
            {advisorReportTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">汇报周期</span>
          <select
            value={advisorState.reportCycle}
            onChange={(e) => onAdvisorChange({ reportCycle: e.target.value })}
            className={control}
          >
            {advisorReportCycles.map((cycle) => (
              <option key={cycle} value={cycle}>{cycle}</option>
            ))}
          </select>
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">分析对象（项目 / 部门 / 事项）</span>
          <input
            value={advisorState.analysisTarget}
            onChange={(e) => onAdvisorChange({ analysisTarget: e.target.value })}
            className={control}
            placeholder="例如：如意空间智能办公建设项目"
          />
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">数据来源</span>
          <select
            value={advisorState.dataSource}
            onChange={(e) => onAdvisorChange({ dataSource: e.target.value })}
            className={control}
          >
            {advisorDataSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">补充要求</span>
          <textarea
            value={advisorState.extraRequirement}
            onChange={(e) => onAdvisorChange({ extraRequirement: e.target.value })}
            className="min-h-[64px] w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="例如：重点体现进度风险与下周计划"
          />
        </label>
      </div>
      <p className="text-xs leading-5 text-gray-400">提交后可进入参谋师工作台继续编辑与分发。</p>
    </div>
  );
}
