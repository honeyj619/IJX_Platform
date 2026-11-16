import type { RuyiCapability, RuyiCapabilitySubmission } from "../../../types/ruyi";
import RuyiDocumentPanel, {
  createInitialDocumentPanelState,
  type DocumentPanelState,
} from "./RuyiDocumentPanel";
import RuyiPresentationPanel, {
  createInitialPresentationPanelState,
  type PresentationPanelState,
} from "./RuyiPresentationPanel";
import RuyiAdvisorPanel, {
  createInitialAdvisorPanelState,
  type AdvisorPanelState,
} from "./RuyiAdvisorPanel";
import RuyiTranslationPanel, {
  createInitialTranslationPanelState,
  type TranslationPanelState,
} from "./RuyiTranslationPanel";
import { documentTemplates } from "../../../data/ruyiToolPanel";

/**
 * 统一插件面板入口（如意空间首页/会话共用；V3.1 定位整改）：
 * - 只承载四插件：公文 / PPT / 参谋 / 翻译（查询/IT 归快捷能力，不在面板体系）
 * - 插件面板只负责收集结构化参数；发送统一走对话框（没有面板内提交按钮）
 * - 状态受控：草稿由父层按插件分槽持有（切换插件保留各自草稿）
 * - getSubmission() 产出统一 RuyiCapabilitySubmission；validate() 统一必填校验
 */

export type RuyiCapabilityPanelVariant = "compact" | "full";

/** 各插件草稿集合（父层持有，按插件分槽） */
export interface RuyiPanelDrafts {
  document: DocumentPanelState;
  presentation: PresentationPanelState;
  advisor: AdvisorPanelState;
  translation: TranslationPanelState;
}

export function createInitialPanelDrafts(): RuyiPanelDrafts {
  return {
    document: createInitialDocumentPanelState(),
    presentation: createInitialPresentationPanelState(),
    advisor: createInitialAdvisorPanelState(),
    translation: createInitialTranslationPanelState(),
  };
}

interface RuyiCapabilityPanelProps {
  capability: RuyiCapability;
  variant: RuyiCapabilityPanelVariant;
  drafts: RuyiPanelDrafts;
  /** 主需求文本来自统一输入框，由父层传入 */
  promptText: string;
  onDraftChange: (patch: Partial<RuyiPanelDrafts>) => void;
}

/** 校验必填：返回错误文案；空串表示通过 */
export function validatePanelSubmission(
  capability: RuyiCapability,
  drafts: RuyiPanelDrafts,
  promptText: string,
): string {
  switch (capability.id) {
    case "document": {
      if (!drafts.document.docTitle.trim()) return "请填写文章标题";
      if (!promptText.trim() && !drafts.document.docRequirement.trim()) return "请补充需求描述或内容要求";
      return "";
    }
    case "presentation": {
      if (!drafts.presentation.topic.trim() && !promptText.trim()) return "请填写PPT主题或需求描述";
      return "";
    }
    case "advisor": {
      if (!drafts.advisor.analysisTarget.trim()) return "请填写分析对象";
      if (!promptText.trim() && !drafts.advisor.extraRequirement.trim()) return "请补充需求或补充要求";
      return "";
    }
    case "translation": {
      if (!drafts.translation.sourceText.trim()) return "请输入待翻译内容";
      return "";
    }
    default:
      return "";
  }
}

/** 产出统一提交结构（调用前应先通过 validatePanelSubmission） */
export function buildPanelSubmission(
  capability: RuyiCapability,
  drafts: RuyiPanelDrafts,
  promptText: string,
): RuyiCapabilitySubmission {
  const base = { capabilityId: capability.id };
  switch (capability.id) {
    case "document": {
      const d = drafts.document;
      const template = documentTemplates.find((t) => t.id === d.selectedTemplate);
      return {
        ...base,
        // 需求文本：输入框优先，其次面板内容要求
        prompt: promptText.trim() || d.docRequirement.trim(),
        title: d.docTitle.trim() || undefined,
        attachments: [...d.attachments],
        confirmedParams: {
          docType: d.docType,
          docLength: d.docLength,
          docRequirement: d.docRequirement,
          templateId: d.selectedTemplate,
          templateName: template?.name ?? "",
        },
      };
    }
    case "presentation": {
      const p = drafts.presentation;
      return {
        ...base,
        prompt: promptText.trim() || p.topic.trim(),
        title: p.topic.trim() || undefined,
        attachments: [...p.attachments],
        confirmedParams: { topic: p.topic, ...p.values, template: p.template },
      };
    }
    case "advisor": {
      const a = drafts.advisor;
      return {
        ...base,
        prompt: promptText.trim() || a.extraRequirement.trim(),
        title: [a.reportType, a.reportCycle, a.analysisTarget.trim()].filter(Boolean).join(" · "),
        attachments: [],
        confirmedParams: {
          reportType: a.reportType,
          reportCycle: a.reportCycle,
          analysisTarget: a.analysisTarget.trim(),
          dataSource: a.dataSource,
          extraRequirement: a.extraRequirement,
        },
      };
    }
    case "translation": {
      const t = drafts.translation;
      return {
        ...base,
        prompt: t.sourceText.trim(),
        attachments: [],
        confirmedParams: {
          sourceLanguage: t.sourceLanguage,
          targetLanguage: t.targetLanguage,
          tone: t.tone,
        },
      };
    }
    default:
      return { ...base, prompt: promptText.trim(), attachments: [], confirmedParams: {} };
  }
}

export default function RuyiCapabilityPanel({
  capability,
  variant,
  drafts,
  onDraftChange,
}: RuyiCapabilityPanelProps) {
  void variant; // 展示模式保留参数（full/compact 版式差异由父层容器控制）
  void drafts; // 草稿由各子面板经 onDraftChange 受控更新；此处仅做路由分发

  const renderBody = () => {
    switch (capability.id) {
      case "document":
        return (
          <RuyiDocumentPanel
            variant={variant}
            documentState={drafts.document}
            onDocumentChange={(patch) => onDraftChange({ document: { ...drafts.document, ...patch } })}
          />
        );
      case "presentation":
        return (
          <RuyiPresentationPanel
            variant={variant}
            pptState={drafts.presentation}
            onPptChange={(patch) => onDraftChange({ presentation: { ...drafts.presentation, ...patch } })}
          />
        );
      case "advisor":
        return (
          <RuyiAdvisorPanel
            variant={variant}
            advisorState={drafts.advisor}
            onAdvisorChange={(patch) => onDraftChange({ advisor: { ...drafts.advisor, ...patch } })}
          />
        );
      case "translation":
        return (
          <RuyiTranslationPanel
            variant={variant}
            translationState={drafts.translation}
            onTranslationChange={(patch) => onDraftChange({ translation: { ...drafts.translation, ...patch } })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div data-requirement-id="ruyi-capability-panel">
      {renderBody()}
    </div>
  );
}
