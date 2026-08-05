import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Undo, 
  Redo,
  Copy,
  ChevronDown,
  Sparkles,
  Wand2,
  Lightbulb,
  CheckSquare,
  GitCompare,
  Bot,
  Palette,
  RefreshCw,
  Type,
  FileText,
  X,
  Loader2,
  Download,
  CheckCircle2,
  Paperclip,
  Search
} from "lucide-react";
import {
  documentValidationIssues as defaultValidationIssues,
  documentValidationRules,
  validationSampleContent,
  type DocumentMode,
  type DocumentValidationIssue,
} from "../data/documentValidation";

type ValidationTextToken =
  | { type: "text"; value: string }
  | { type: "issue"; value: string; issue: DocumentValidationIssue };

type ValidationIssuePosition = {
  start: number;
  end: number;
  excerptStart: number;
  issue: DocumentValidationIssue;
};

const getValidationIssueRangeInExcerpt = (issue: DocumentValidationIssue) => {
  const typoMatch = issue.suggestion.match(/将“([^”]+)”修改/);
  if (typoMatch) {
    const start = issue.excerpt.indexOf(typoMatch[1]);
    if (start >= 0) return { start, end: start + typoMatch[1].length };
  }

  if (issue.suggestion.includes("英文逗号")) {
    const start = issue.excerpt.indexOf(",");
    if (start >= 0) return { start, end: start + 1 };
  }

  const deleteDunhaoMatch = issue.suggestion.match(/删除“([^”]+)”后的顿号/);
  if (deleteDunhaoMatch) {
    const anchorStart = issue.excerpt.indexOf(deleteDunhaoMatch[1]);
    const start = issue.excerpt.indexOf("、", anchorStart + deleteDunhaoMatch[1].length);
    if (start >= 0) return { start, end: start + 1 };
  }

  return { start: 0, end: issue.excerpt.length };
};

const getValidationIssuePositions = (text: string, issues: DocumentValidationIssue[]): ValidationIssuePosition[] => (
  issues
    .map((issue) => {
      const excerptStart = text.indexOf(issue.excerpt);
      if (excerptStart < 0) return null;
      const range = getValidationIssueRangeInExcerpt(issue);
      return {
        start: excerptStart + range.start,
        end: excerptStart + range.end,
        excerptStart,
        issue,
      };
    })
    .filter((range): range is ValidationIssuePosition => Boolean(range))
    .sort((a, b) => a.excerptStart - b.excerptStart || a.start - b.start)
);

const createValidationTextTokens = (text: string, issues: DocumentValidationIssue[]): ValidationTextToken[] => {
  const ranges = getValidationIssuePositions(text, issues);

  const tokens: ValidationTextToken[] = [];
  let cursor = 0;

  ranges.forEach((range) => {
    if (range.start < cursor) return;
    if (range.start > cursor) tokens.push({ type: "text", value: text.slice(cursor, range.start) });
    tokens.push({ type: "issue", value: text.slice(range.start, range.end), issue: range.issue });
    cursor = range.end;
  });

  if (cursor < text.length) tokens.push({ type: "text", value: text.slice(cursor) });
  return tokens.length > 0 ? tokens : [{ type: "text", value: text }];
};

const getValidationReplacement = (issue: DocumentValidationIssue) => {
  const replaceMatch = issue.suggestion.match(/将“([^”]+)”修改为“([^”]+)”/);
  if (replaceMatch) return replaceMatch[2];
  if (issue.suggestion.includes("英文逗号")) return "，";
  if (issue.suggestion.includes("删除") && issue.suggestion.includes("顿号")) return "";
  return null;
};

const getValidationCorrectedExcerpt = (issue: DocumentValidationIssue) => {
  const replacement = getValidationReplacement(issue);
  if (replacement === null) return issue.excerpt;

  const range = getValidationIssueRangeInExcerpt(issue);
  return `${issue.excerpt.slice(0, range.start)}${replacement}${issue.excerpt.slice(range.end)}`;
};

const applyValidationIssueToText = (text: string, issue: DocumentValidationIssue, correctedExcerpt = getValidationCorrectedExcerpt(issue)) => {
  const excerptStart = text.indexOf(issue.excerpt);
  if (excerptStart < 0) return text;

  return `${text.slice(0, excerptStart)}${correctedExcerpt}${text.slice(excerptStart + issue.excerpt.length)}`;
};

interface DocumentEditorProps {
  docType: string;
  docTitle: string;
  docLength: string;
  docContent: string;
  attachments?: string[];
  documentMode?: DocumentMode;
  validationFileName?: string;
  validationIssues?: DocumentValidationIssue[];
  startInRequirements?: boolean;
  startInOutline?: boolean;
  embedded?: boolean;
  onRemoveAttachment?: (attachment: string) => void;
  onBack: () => void;
}

const documentTypes = [
  { id: 'meeting-minutes', name: '会议纪要', category: 'business' },
  { id: 'plan', name: '方案', category: 'business' },
  { id: 'work-summary', name: '工作总结', category: 'business' },
  { id: 'work-report', name: '工作报告', category: 'business' },
  { id: 'system', name: '制度', category: 'business' },
  { id: 'rectification', name: '整改报告', category: 'business' },
  { id: 'speech', name: '讲话稿', category: 'business' },
  { id: 'research', name: '调研报告', category: 'business' },
  { id: 'notice', name: '通报', category: 'official' },
  { id: 'report', name: '述职报告', category: 'business' },
  { id: 'thanks', name: '感谢信', category: 'business' },
  { id: 'praise', name: '表扬信', category: 'business' },
  { id: 'circular', name: '通报', category: 'official' },
  { id: 'request', name: '情况报告', category: 'official' },
  { id: 'news', name: '新闻稿', category: 'business' },
  { id: 'inspection', name: '考察报告', category: 'business' },
  { id: 'agenda', name: '日程议程', category: 'business' },
  { id: 'learning', name: '学习体会', category: 'business' },
  { id: 'leave', name: '请假条', category: 'business' },
  { id: 'other', name: '其他', category: 'business' },
];

const aiTools = [
  { id: 'rewrite', name: '改写', icon: <Wand2 size={18} />, color: 'bg-theme-100 text-theme-600' },
  { id: 'polish', name: '润色', icon: <Sparkles size={18} />, color: 'bg-gray-100 text-gray-500' },
  { id: 'decolor', name: '消色', icon: <Palette size={18} />, color: 'bg-gray-100 text-gray-500' },
  { id: 'inspiration', name: '灵感', icon: <Lightbulb size={18} />, color: 'bg-gray-100 text-gray-500' },
  { id: 'proofread', name: '校对', icon: <CheckSquare size={18} />, color: 'bg-gray-100 text-gray-500' },
  { id: 'compare', name: '比对', icon: <GitCompare size={18} />, color: 'bg-gray-100 text-gray-500' },
  { id: 'assistant', name: 'AI助理', icon: <Bot size={18} />, color: 'bg-gray-100 text-gray-500' },
];

const sampleContent = `为深入推进智能化办公体系建设，全面提升工作效率与用户体验，现决定依托如意助手平台，全面打造"如意空间"智能操作环境。如意空间以AI为核心驱动，融合自然语言处理、智能推荐与多模态交互技术，构建集信息整合、任务管理、协同办公于一体的智慧工作生态。正如《礼记·中庸》所言："致中和，天地位焉，万物育焉。"如意空间正是通过技术中和，实现人机协同、效率与体验的和谐统一。

如意空间将实现三大核心功能：一是智能信息中枢，自动聚合邮件、日程、文档等多源数据，实现"一屏尽览"；二是任务自适应调度，基于用户行为习惯与优先级设定，动态优化任务执行顺序；三是跨平台无缝协同，支持多终端实时同步，打破信息孤岛。通过引入深度学习算法，如意助手将持续学习用户偏好，实现"越用越懂你"的个性化服务。

各部门须于2026年6月15日前完成系统接入与人员培训，确保如意空间全面落地。请各单位高度重视，指定专人负责推进，确保系统平稳运行。特此通知。`;

const editorTemplates = [
  { id: 'official-red', name: '红头通知', desc: '适合正式通知、制度发布', accent: 'bg-red-500', border: 'border-red-200', category: '通知', subCategory: '公司通知' },
  { id: 'policy-notice', name: '制度通知', desc: '适合规章制度、执行要求', accent: 'bg-rose-500', border: 'border-rose-200', category: '通知', subCategory: '制度发布' },
  { id: 'party-study', name: '党群学习', desc: '适合学习教育、主题活动', accent: 'bg-red-600', border: 'border-red-200', category: '党群', subCategory: '学习教育' },
  { id: 'party-activity', name: '党群活动', desc: '适合活动方案、组织安排', accent: 'bg-orange-500', border: 'border-orange-200', category: '党群', subCategory: '活动方案' },
  { id: 'meeting-minutes', name: '项目纪要', desc: '适合项目会议、任务纪要', accent: 'bg-sky-500', border: 'border-sky-200', category: '会议纪要', subCategory: '项目会议' },
  { id: 'meeting-summary', name: '专题纪要', desc: '适合专题讨论、决策记录', accent: 'bg-indigo-500', border: 'border-indigo-200', category: '会议纪要', subCategory: '专题会议' },
  { id: 'brief-blue', name: '蓝色简报', desc: '适合工作汇报、会议材料', accent: 'bg-blue-500', border: 'border-blue-200', category: '工作简报', subCategory: '周报简报' },
  { id: 'report-green', name: '经营报告', desc: '适合数据总结、经营分析', accent: 'bg-emerald-500', border: 'border-emerald-200', category: '工作简报', subCategory: '经营简报' },
];

const templateCategories = ['通知', '党群', '会议纪要', '工作简报'];

const templateFilterOptions: Record<string, string[]> = {
  通知: ['全部', '公司通知', '制度发布'],
  党群: ['全部', '学习教育', '活动方案'],
  会议纪要: ['全部', '项目会议', '专题会议'],
  工作简报: ['全部', '周报简报', '经营简报'],
};

const lengthOptions = ['300-500', '500-800', '600-1200', '1000-1500', '1500-2000'];

const templateLayoutRules = [
  { label: '主标题', value: '二号方正小标宋，居中，段前 0 行、段后 1 行' },
  { label: '一级标题', value: '三号黑体，序号使用“一、”，段前 0.5 行' },
  { label: '二级标题', value: '三号楷体，序号使用“（一）”，段前 0.25 行' },
  { label: '三级标题', value: '三号仿宋加粗，序号使用“1.”，与正文同段缩进' },
  { label: '正文', value: '三号仿宋，首行缩进 2 字符' },
  { label: '行间距', value: '固定值 28 磅，段落间距 0.5 行' },
  { label: '字间距', value: '标准字距，重点标题加宽 0.5 磅' },
  { label: '页眉页脚', value: '页眉显示单位名称，页脚居中显示页码' },
  { label: '页数规则', value: '首页不显示页码，正文第 2 页起连续编号' },
];

const defaultOutline = [
  { title: '一、背景说明', desc: '结合当前公文要求，说明事项背景和发文必要性。' },
  { title: '二、主要内容', desc: '提炼核心任务、建设内容和协同要求。' },
  { title: '三、推进安排', desc: '明确时间节点、责任分工和落地路径。' },
  { title: '四、工作要求', desc: '强调组织保障、执行反馈和后续优化。' },
];

const formatOutlineText = (items: typeof defaultOutline) => (
  items.map(item => `${item.title}\n${item.desc}`).join('\n\n')
);

const initialSavedDocuments = [
  {
    id: 'smart-office-notice',
    title: '如意空间智能办公建设通知',
    type: '通知',
    words: '1280',
    updatedAt: '今天 14:20',
    updatedDate: '2026-08-04',
    hasFinalFile: true,
    source: 'writing',
    validationStatus: undefined,
    validationIssueCount: undefined,
    content: sampleContent,
    outline: formatOutlineText(defaultOutline),
  },
  {
    id: 'project-meeting-minutes',
    title: '项目推进会议纪要',
    type: '会议纪要',
    words: '960',
    updatedAt: '昨天 16:10',
    updatedDate: '2026-08-03',
    hasFinalFile: false,
    source: 'writing',
    validationStatus: undefined,
    validationIssueCount: undefined,
    content: `会议时间：2026年6月15日 14:00\n会议地点：总部会议室A\n参会人员：项目组、业务代表、技术支持团队\n\n一、会议议题\n围绕项目当前推进情况、关键节点风险和后续协同事项进行讨论。\n\n二、会议结论\n项目整体进度可控，需重点跟进接口联调、上线验证和用户培训安排。\n\n三、待办事项\n1. 技术团队于本周内完成联调问题清单闭环。\n2. 业务团队补充试点部门反馈意见。\n3. 项目经理同步更新项目计划并提交评审。`,
    outline: `一、会议基本信息\n记录会议时间、地点、参会人员和会议背景。\n\n二、项目推进情况\n概述当前进度、已完成事项和主要风险。\n\n三、会议结论与待办\n明确结论、责任人和完成时间。`,
  },
  {
    id: 'party-study-plan',
    title: '党群学习活动方案',
    type: '党群',
    words: '1520',
    updatedAt: '6月12日',
    updatedDate: '2026-06-12',
    hasFinalFile: true,
    source: 'writing',
    validationStatus: undefined,
    validationIssueCount: undefined,
    content: `为进一步强化理论学习成效，提升党群活动组织质量，拟开展主题学习活动。\n\n一、活动主题\n围绕理论学习、岗位实践和团队交流，组织专题学习与分享。\n\n二、活动安排\n活动分为集中学习、交流研讨和成果总结三个环节。\n\n三、工作要求\n各相关部门应高度重视，做好组织发动和材料准备，确保活动取得实效。`,
    outline: `一、活动背景\n说明开展学习活动的意义和目标。\n\n二、活动安排\n明确活动时间、对象、形式和主要环节。\n\n三、工作要求\n提出组织保障、材料归档和成果总结要求。`,
  },
  {
    id: 'validated-upload-notice',
    title: '如意空间智能办公建设通知-校验稿',
    type: '通知',
    words: '420',
    updatedAt: '刚刚',
    updatedDate: '2026-08-04',
    hasFinalFile: false,
    source: 'validation',
    validationStatus: '待修复',
    validationIssueCount: defaultValidationIssues.length,
    content: validationSampleContent,
    outline: formatOutlineText(defaultOutline),
  },
];

export default function DocumentEditor({ docType, docTitle, docLength, docContent, attachments = [], documentMode = "writing", validationFileName = "", validationIssues = defaultValidationIssues, startInRequirements = false, startInOutline = false, embedded = false, onRemoveAttachment, onBack }: DocumentEditorProps) {
  const [currentDocumentMode, setCurrentDocumentMode] = useState<DocumentMode>(documentMode);
  const [content, setContent] = useState(documentMode === "validation" ? validationSampleContent : startInRequirements || startInOutline ? '' : sampleContent);
  const [requirementTitle, setRequirementTitle] = useState(docTitle || (documentMode === "validation" ? validationFileName.replace(/\.[^.]+$/, "") : '未命名文档'));
  const [requirementType, setRequirementType] = useState(templateCategories.includes(docType) ? docType : templateCategories[0]);
  const [requirementLength, setRequirementLength] = useState(docLength);
  const [requirementContent, setRequirementContent] = useState(docContent || (startInRequirements ? '' : '暂无补充要求'));
  const [selectedTemplate, setSelectedTemplate] = useState(
    (editorTemplates.find(template => template.category === docType) || editorTemplates[0]).id
  );
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [activeTemplateCategory, setActiveTemplateCategory] = useState(templateCategories[0]);
  const [activeTemplateFilter, setActiveTemplateFilter] = useState('全部');
  const [requirementsEditable, setRequirementsEditable] = useState(documentMode === "validation" ? false : startInRequirements);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [outlineEditing, setOutlineEditing] = useState(startInOutline);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingFinalFile, setIsGeneratingFinalFile] = useState(false);
  const [finalFileReady, setFinalFileReady] = useState(false);
  const [requirementsConfirmed, setRequirementsConfirmed] = useState(!startInRequirements);
  const [outlineConfirmed, setOutlineConfirmed] = useState(!startInRequirements && !startInOutline);
  const [outlineItems, setOutlineItems] = useState(defaultOutline);
  const [outlineText, setOutlineText] = useState(formatOutlineText(defaultOutline));
  const [outlineDirty, setOutlineDirty] = useState(false);
  const [documentTab, setDocumentTab] = useState<'current' | 'mine'>('current');
  const [selectedSavedDocumentId, setSelectedSavedDocumentId] = useState<string | null>(null);
  const [savedDocuments, setSavedDocuments] = useState(initialSavedDocuments);
  const [documentPendingDelete, setDocumentPendingDelete] = useState<typeof initialSavedDocuments[number] | null>(null);
  const [documentSearch, setDocumentSearch] = useState('');
  const [documentSourceFilter, setDocumentSourceFilter] = useState('全部');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('全部');
  const [documentStartDate, setDocumentStartDate] = useState('');
  const [documentEndDate, setDocumentEndDate] = useState('');
  const [editorAttachments, setEditorAttachments] = useState(attachments);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeValidationIssueId, setActiveValidationIssueId] = useState('');
  const [validationSuggestionDrafts, setValidationSuggestionDrafts] = useState<Record<string, string>>(() => {
    const issues = validationIssues.length > 0 ? validationIssues : defaultValidationIssues;
    return Object.fromEntries(issues.map((issue) => [issue.id, getValidationCorrectedExcerpt(issue)]));
  });
  const [activeCategory, setActiveCategory] = useState('business');
  const [expandedSections, setExpandedSections] = useState({
    outline: false,
    structure: false,
    contentRef: false,
  });
  const [isSaved, setIsSaved] = useState(true);
  const [appliedValidationIssueIds, setAppliedValidationIssueIds] = useState<string[]>([]);
  const [ignoredValidationIssueIds, setIgnoredValidationIssueIds] = useState<string[]>([]);
  const [userRuleToast, setUserRuleToast] = useState('');
  const effectiveValidationIssues = validationIssues.length > 0 ? validationIssues : defaultValidationIssues;
  const unresolvedValidationIssues = effectiveValidationIssues.filter((issue) => (
    !appliedValidationIssueIds.includes(issue.id) && !ignoredValidationIssueIds.includes(issue.id)
  ));
  const pendingValidationIssuePositions = getValidationIssuePositions(content, unresolvedValidationIssues);
  const pendingValidationIssues = pendingValidationIssuePositions.map((position) => position.issue);
  const activeValidationIssue = pendingValidationIssues.find((issue) => issue.id === activeValidationIssueId) || pendingValidationIssues[0] || null;
  const getValidationRuleIssueCount = (ruleId: string) => (
    pendingValidationIssues.filter((item) => item.type === ruleId).length
  );
  const validationMarkedContent = createValidationTextTokens(content, pendingValidationIssues);

  const toggleSection = (section: 'outline' | 'structure' | 'contentRef') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getSavedDocumentSourceLabel = (source: typeof initialSavedDocuments[number]['source']) => (
    source === 'validation' ? '校验' : '创作'
  );
  const savedDocumentSourceOptions = ['全部', '创作', '校验'];
  const savedDocumentTypeOptions = ['全部', ...Array.from(new Set(
    savedDocuments.filter((document) => document.source === 'writing').map((document) => document.type)
  ))];
  const filteredSavedDocuments = savedDocuments.filter((document) => {
    const keyword = documentSearch.trim().toLowerCase();
    const matchesName = !keyword || document.title.toLowerCase().includes(keyword);
    const matchesSource = documentSourceFilter === '全部' || getSavedDocumentSourceLabel(document.source) === documentSourceFilter;
    const matchesType = documentTypeFilter === '全部' || (document.source === 'writing' && document.type === documentTypeFilter);
    const matchesStartDate = !documentStartDate || document.updatedDate >= documentStartDate;
    const matchesEndDate = !documentEndDate || document.updatedDate <= documentEndDate;
    return matchesName && matchesSource && matchesType && matchesStartDate && matchesEndDate;
  });

  const handleSave = () => {
    const trimmedTitle = requirementTitle.trim() || '未命名文档';
    const nextDocument = {
      id: selectedSavedDocumentId || `saved-${Date.now()}`,
      title: trimmedTitle,
      type: requirementType,
      words: `${content.length}`,
      updatedAt: '刚刚',
      updatedDate: new Date().toISOString().slice(0, 10),
      hasFinalFile: currentDocumentMode === "validation" ? pendingValidationIssues.length === 0 : finalFileReady,
      source: currentDocumentMode === "validation" ? 'validation' : 'writing',
      validationStatus: currentDocumentMode === "validation" ? (pendingValidationIssues.length === 0 ? '已完成' : '待修复') : undefined,
      validationIssueCount: currentDocumentMode === "validation" ? pendingValidationIssues.length : undefined,
      content,
      outline: outlineText,
    };
    setSavedDocuments((current) => {
      const exists = current.some((item) => item.id === nextDocument.id);
      return exists
        ? current.map((item) => (item.id === nextDocument.id ? nextDocument : item))
        : [nextDocument, ...current];
    });
    setSelectedSavedDocumentId(nextDocument.id);
    setIsSaved(true);
  };

  const generateOutlineDraft = () => {
    setContent('');
    setOutlineEditing(true);
    setRequirementsEditable(false);
    setRequirementsConfirmed(true);
    setOutlineConfirmed(false);
    const nextOutline = defaultOutline.map((item, index) => ({
      title: item.title,
      desc: index === 0
        ? `围绕“${requirementTitle || '当前公文'}”补充背景、依据和目标。`
        : item.desc,
    }));
    setOutlineItems(nextOutline);
    setOutlineText(formatOutlineText(nextOutline));
    setIsSaved(false);
  };

  const handleRequestRegenerateOutline = () => {
    if (!requirementsEditable) {
      setShowRegenerateConfirm(true);
      return;
    }
    generateOutlineDraft();
  };

  const handleConfirmRegenerate = () => {
    setShowRegenerateConfirm(false);
    setRequirementsEditable(true);
    setRequirementsConfirmed(false);
    setOutlineConfirmed(false);
    setContent('');
    setOutlineEditing(false);
    setOutlineDirty(false);
    setIsSaved(false);
  };

  const handleEditRequirements = () => {
    if (content || requirementsConfirmed || outlineEditing) {
      setShowRegenerateConfirm(true);
      return;
    }
    setRequirementsEditable(true);
  };

  const handleConfirmRequirements = () => {
    setIsGeneratingOutline(true);
    setRequirementsEditable(false);
    setRequirementsConfirmed(true);
    setOutlineConfirmed(false);
    setFinalFileReady(false);
    setOutlineDirty(false);
    setContent('');
    window.setTimeout(() => {
      generateOutlineDraft();
      setIsGeneratingOutline(false);
    }, 900);
  };

  const handleConfirmOutline = () => {
    setContent(sampleContent);
    setOutlineEditing(false);
    setRequirementsEditable(false);
    setRequirementsConfirmed(true);
    setOutlineConfirmed(true);
    setFinalFileReady(false);
    setOutlineDirty(false);
    setIsSaved(false);
  };

  const handleOutlineTextChange = (value: string) => {
    setOutlineText(value);
    setOutlineDirty(outlineConfirmed);
    setIsSaved(false);
  };

  const handleRegenerateContent = () => {
    setContent(sampleContent);
    setOutlineEditing(false);
    setRequirementsEditable(false);
    setRequirementsConfirmed(true);
    setOutlineConfirmed(true);
    setFinalFileReady(false);
    setOutlineDirty(false);
    setIsSaved(false);
  };

  const handleOpenSavedDocument = (document: typeof savedDocuments[number]) => {
    const nextMode: DocumentMode = document.source === 'validation' ? 'validation' : 'writing';
    setSelectedSavedDocumentId(document.id);
    setCurrentDocumentMode(nextMode);
    setRequirementTitle(document.title);
    setRequirementType(document.type);
    setRequirementLength(document.words);
    setRequirementContent(`${document.title}，来源：我的公文`);
    setContent(document.content);
    setOutlineText(document.outline);
    setRequirementsEditable(false);
    setRequirementsConfirmed(true);
    setOutlineEditing(false);
    setOutlineConfirmed(true);
    setFinalFileReady(document.hasFinalFile);
    setOutlineDirty(false);
    setIsSaved(true);
    if (nextMode === 'validation') {
      const hasPendingIssues = (document.validationIssueCount ?? 0) > 0;
      setAppliedValidationIssueIds(hasPendingIssues ? [] : effectiveValidationIssues.map((issue) => issue.id));
      setIgnoredValidationIssueIds([]);
      setActiveValidationIssueId('');
      setValidationSuggestionDrafts(Object.fromEntries(effectiveValidationIssues.map((issue) => [issue.id, getValidationCorrectedExcerpt(issue)])));
    } else {
      setAppliedValidationIssueIds([]);
      setIgnoredValidationIssueIds([]);
      setActiveValidationIssueId('');
    }
  };

  const handleConfirmDeleteDocument = () => {
    if (!documentPendingDelete) return;
    setSavedDocuments((current) => current.filter((item) => item.id !== documentPendingDelete.id));
    if (selectedSavedDocumentId === documentPendingDelete.id) {
      setSelectedSavedDocumentId(null);
      setFinalFileReady(false);
    }
    setDocumentPendingDelete(null);
  };

  const handleGenerateFinalFile = () => {
    setIsGeneratingFinalFile(true);
    window.setTimeout(() => {
      setIsGeneratingFinalFile(false);
      setFinalFileReady(true);
      if (selectedSavedDocumentId) {
        setSavedDocuments((current) => current.map((item) => (
          item.id === selectedSavedDocumentId
            ? { ...item, hasFinalFile: true, updatedAt: '刚刚', updatedDate: new Date().toISOString().slice(0, 10) }
            : item
        )));
      }
    }, 900);
  };

  const handleUploadReferenceFile = () => {
    setEditorAttachments((current) => [
      ...current,
      `公文参考文件${current.length + 1}.docx`,
    ]);
    setIsSaved(false);
  };

  const handleRemoveReferenceFile = (attachment: string) => {
    setEditorAttachments((current) => current.filter((item) => item !== attachment));
    onRemoveAttachment?.(attachment);
    setIsSaved(false);
  };

  const updateOutlineItem = (index: number, field: 'title' | 'desc', value: string) => {
    setOutlineItems(prev => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
    setIsSaved(false);
  };

  const removeOutlineItem = (index: number) => {
    setOutlineItems(prev => prev.filter((_, itemIndex) => itemIndex !== index));
    setIsSaved(false);
  };

  const filteredTemplates = documentTypes.filter(t => t.category === activeCategory);
  const selectedTemplateMeta = editorTemplates.find(t => t.id === selectedTemplate) || editorTemplates[0];
  const previewTemplateMeta = editorTemplates.find(t => t.id === previewTemplateId) || selectedTemplateMeta;
  const templateShellClass = selectedTemplateMeta.category === '通知'
    ? 'border-t-4 border-red-500'
    : selectedTemplateMeta.category === '会议纪要'
      ? 'border-t-4 border-sky-500'
      : selectedTemplateMeta.category === '工作简报'
        ? 'border-l-4 border-blue-500'
        : 'border-t-4 border-theme-500';
  const templateHeaderLabel = selectedTemplateMeta.category === '通知'
    ? '吉祥航空正式公文'
    : selectedTemplateMeta.category === '会议纪要'
      ? '会议纪要'
      : selectedTemplateMeta.category === '工作简报'
        ? '工作简报'
        : selectedTemplateMeta.category;
  const filteredPreviewTemplates = editorTemplates.filter((template) => (
    template.category === activeTemplateCategory
  ));
  const handleCopyFullText = async () => {
    const fullText = `${requirementTitle || '文档标题'}\n\n${content}`;
    try {
      await navigator.clipboard.writeText(fullText);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopySuccess(true);
    window.setTimeout(() => setCopySuccess(false), 1200);
  };
  const attachmentPanel = (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">参考文件</div>
        <button
          onClick={handleUploadReferenceFile}
          className="inline-flex items-center gap-1.5 rounded-lg border border-theme-200 bg-theme-50 px-2.5 py-1.5 text-xs font-medium text-theme-700 hover:bg-theme-100"
        >
          <Plus size={13} />
          上传参考文件
        </button>
      </div>
      {editorAttachments.length > 0 ? (
        <div className="space-y-2">
        {editorAttachments.map((attachment) => (
          <div key={attachment} className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <Paperclip size={14} className="flex-shrink-0 text-theme-500" />
            <span className="truncate">{attachment}</span>
            <button
              onClick={() => handleRemoveReferenceFile(attachment)}
              className="ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500"
              title="删除附件"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs leading-5 text-gray-400">
          暂无参考文件，可上传制度依据、会议材料或历史公文作为生成参考。
        </div>
      )}
    </div>
  );

  const readonlyAttachmentPanel = (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 text-sm font-medium text-gray-700">参考文件</div>
      {editorAttachments.length > 0 ? (
        <div className="space-y-2">
          {editorAttachments.map((attachment) => (
            <div key={attachment} className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <Paperclip size={14} className="flex-shrink-0 text-theme-500" />
              <span className="truncate">{attachment}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs leading-5 text-gray-400">
          无参考文件
        </div>
      )}
    </div>
  );

  const handleEditorTemplateSelect = (template: typeof editorTemplates[number]) => {
    setSelectedTemplate(template.id);
    setRequirementType(template.category);
    setIsSaved(false);
  };

  const handleRunValidation = () => {
    setAppliedValidationIssueIds([]);
    setIgnoredValidationIssueIds([]);
    setActiveValidationIssueId('');
    setValidationSuggestionDrafts(Object.fromEntries(effectiveValidationIssues.map((issue) => [issue.id, getValidationCorrectedExcerpt(issue)])));
    setFinalFileReady(false);
    setIsSaved(false);
  };

  const handleApplyValidationIssue = (issue: DocumentValidationIssue) => {
    setContent((current) => applyValidationIssueToText(current, issue, validationSuggestionDrafts[issue.id] || getValidationCorrectedExcerpt(issue)));
    setAppliedValidationIssueIds((current) => current.includes(issue.id) ? current : [...current, issue.id]);
    setActiveValidationIssueId((current) => current === issue.id ? pendingValidationIssues.find((item) => item.id !== issue.id)?.id || '' : current);
    setIsSaved(false);
  };

  const handleIgnoreValidationIssue = (issue: DocumentValidationIssue) => {
    setIgnoredValidationIssueIds((current) => current.includes(issue.id) ? current : [...current, issue.id]);
    setActiveValidationIssueId((current) => current === issue.id ? pendingValidationIssues.find((item) => item.id !== issue.id)?.id || '' : current);
    setIsSaved(false);
  };

  const handleApplyAllValidationIssues = () => {
    setContent((current) => pendingValidationIssues.reduce(
      (nextContent, issue) => applyValidationIssueToText(nextContent, issue, validationSuggestionDrafts[issue.id] || getValidationCorrectedExcerpt(issue)),
      current,
    ));
    setAppliedValidationIssueIds(effectiveValidationIssues.map((issue) => issue.id));
    setActiveValidationIssueId('');
    setIsSaved(false);
  };

  const handleExportValidatedDocument = () => {
    const trimmedTitle = requirementTitle.trim() || '未命名文档';
    const nextDocument = {
      id: selectedSavedDocumentId || `saved-${Date.now()}`,
      title: trimmedTitle,
      type: requirementType,
      words: `${content.length}`,
      updatedAt: '刚刚',
      updatedDate: new Date().toISOString().slice(0, 10),
      hasFinalFile: true,
      source: 'validation',
      validationStatus: '已完成',
      validationIssueCount: 0,
      content,
      outline: outlineText,
    };
    setSavedDocuments((current) => {
      const exists = current.some((item) => item.id === nextDocument.id);
      return exists
        ? current.map((item) => (item.id === nextDocument.id ? nextDocument : item))
        : [nextDocument, ...current];
    });
    setSelectedSavedDocumentId(nextDocument.id);
    setFinalFileReady(true);
    setIsSaved(true);
  };

  const handleOpenUserValidationRules = () => {
    setUserRuleToast('将跳转到用户校验规则在线文档');
    window.setTimeout(() => setUserRuleToast(''), 1800);
  };

  const validationCurrentPanel = (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-3 text-sm font-medium text-gray-700">需校验</div>
        <div className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <Paperclip size={14} className="flex-shrink-0 text-theme-500" />
          <span className="truncate">{validationFileName || editorAttachments[0] || `${requirementTitle || '未命名公文'}.docx`}</span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-3 text-sm font-medium text-gray-700">校验规则</div>
        <div className="space-y-2">
          {documentValidationRules.map((rule) => (
            <div key={rule.id} className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <CheckSquare size={14} className="text-theme-600" />
                  AI{rule.title}
                </div>
                <span className="rounded-full bg-theme-50 px-2 py-0.5 text-xs font-medium text-theme-700">
                  {getValidationRuleIssueCount(rule.id)} 处
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-gray-500">{rule.desc}</p>
            </div>
          ))}
          <div className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <CheckSquare size={14} className="text-theme-600" />
                用户规则
              </div>
              <span className="rounded-full bg-theme-50 px-2 py-0.5 text-xs font-medium text-theme-700">
                0 处
              </span>
            </div>
            <button
              type="button"
              onClick={handleOpenUserValidationRules}
              className="mt-1 text-xs font-semibold text-theme-700 underline underline-offset-4 hover:text-theme-800"
            >
              查看规则
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-3">
        <div className="mb-3 text-sm font-medium text-gray-700">校验结果</div>
        <div className="scrollbar-hover max-h-72 space-y-2 overflow-y-auto pr-1">
          {pendingValidationIssues.map((issue) => (
            <div
              key={issue.id}
              role="button"
              tabIndex={0}
              onClick={() => setActiveValidationIssueId(issue.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveValidationIssueId(issue.id);
                }
              }}
              className={`rounded-lg border p-3 text-left transition-colors ${
                activeValidationIssue?.id === issue.id
                  ? 'border-blue-200 bg-blue-50/70 ring-2 ring-blue-100'
                  : 'border-red-100 bg-red-50/40 hover:border-theme-100 hover:bg-theme-50/50'
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600">{issue.label}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleApplyValidationIssue(issue);
                    }}
                    className="rounded-full bg-theme-50 px-2.5 py-1 text-xs font-semibold text-theme-700 transition-colors hover:bg-theme-100"
                  >
                    应用
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleIgnoreValidationIssue(issue);
                    }}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
                  >
                    忽略
                  </button>
                </div>
              </div>
              <div className="text-xs leading-5 text-gray-500">原文：{issue.excerpt}</div>
              <label className="mt-2 block">
                <span className="mb-1 block text-xs font-medium text-gray-500">建议正确版</span>
                <textarea
                  value={validationSuggestionDrafts[issue.id] || getValidationCorrectedExcerpt(issue)}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setValidationSuggestionDrafts((current) => ({ ...current, [issue.id]: nextValue }));
                  }}
                  onClick={(event) => event.stopPropagation()}
                  className="min-h-16 w-full resize-none rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs leading-5 text-gray-700 outline-none focus:border-theme-200 focus:ring-2 focus:ring-theme-100"
                />
              </label>
            </div>
          ))}
          {pendingValidationIssues.length === 0 && (
            <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-5 text-center">
              <div className="text-sm font-semibold text-green-800">所有校验结果已处理</div>
              <div className="mt-1 text-xs text-green-700">可在底部操作区导出修订后的公文。</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  return (
    <>
    <div className={`flex ${embedded ? 'h-full' : 'h-screen'} bg-gray-50`}>
      {/* 左侧编辑区 */}
      <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-900">{requirementTitle || '未命名文档'}</span>
            </div>
          </div>
        </div>

        {/* 编辑工具栏 */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50/50">
          {currentDocumentMode !== "validation" && (
            <>
              <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200">
                <Undo size={16} className="text-gray-600" />
                撤回
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200">
                <Redo size={16} className="text-gray-600" />
                重做
              </button>
            </>
          )}
          <button 
            onClick={handleCopyFullText}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-200"
          >
            <Copy size={16} className="text-gray-600" />
            {copySuccess ? '已复制' : '复制全文'}
          </button>
        </div>

        {/* 编辑区域 */}
        <div className="scrollbar-hover flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-3 text-center text-xs leading-5 text-gray-400">
            {currentDocumentMode === "validation" ? '校验模式下公文内容不可直接编辑，点击右侧问题可定位查看。' : '仅支持编辑内容，版式调整请前往编辑模板。'}
          </div>
          <div className={`mx-auto max-w-3xl rounded-sm bg-white px-10 py-9 shadow-sm ring-1 ring-gray-100 ${templateShellClass}`}>
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-3 text-[11px] text-gray-400">
              <span>{templateHeaderLabel}</span>
              <span>{selectedTemplateMeta.name}</span>
            </div>
            {selectedTemplateMeta.category === '通知' && (
              <div className="mb-6 text-center text-xs font-semibold tracking-[0.28em] text-red-500">
                JUNEYAO AIR
              </div>
            )}
            <h1 className={`mb-8 text-center font-bold text-gray-950 ${selectedTemplateMeta.category === '会议纪要' ? 'text-xl' : 'text-2xl'}`}>
              {requirementTitle || '文档标题'}
            </h1>
            {currentDocumentMode === "validation" ? (
              <div className="min-h-[520px] w-full whitespace-pre-wrap text-[15px] leading-8 text-gray-700 outline-none">
                {validationMarkedContent.map((token, index) => token.type === "issue" ? (
                  <mark
                    key={`${token.issue.id}-${index}`}
                    title={`${token.issue.label}：${token.issue.suggestion}`}
                    className={`rounded px-1 py-0.5 ring-1 transition-colors ${
                      token.issue.id === activeValidationIssue?.id
                        ? 'bg-blue-100 text-blue-800 ring-blue-300'
                        : 'bg-red-100 text-red-700 ring-red-200'
                    }`}
                  >
                    {token.value}
                  </mark>
                ) : (
                  <span key={`text-${index}`}>{token.value}</span>
                ))}
              </div>
            ) : (
              <textarea
                value={content}
                onChange={(event) => {
                  setContent(event.target.value);
                  setIsSaved(false);
                }}
                className="scrollbar-hover min-h-[520px] w-full resize-none border-none bg-transparent text-[15px] leading-8 text-gray-700 outline-none"
                placeholder="正文内容将在这里生成，也可以直接编辑..."
              />
            )}
            <div className="mt-8 border-t border-gray-100 pt-3 text-center text-[11px] text-gray-400">
              第 1 页
            </div>
          </div>
        </div>

        {/* 底部状态栏 */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 grid grid-cols-3 items-center gap-3">
          <div className="text-xs text-gray-500">
            {isSaved ? '已保存' : '有未保存内容'}
          </div>
          <div className="text-center text-[11px] text-gray-400">
            内容AI辅助生成，请谨慎识别
          </div>
          <div className="text-right text-xs text-gray-500">
            {content.length} 个字
          </div>
        </div>
      </div>

      {/* 右侧当前公文信息 */}
      <div className="w-80 flex flex-col bg-gray-50 border-l border-gray-200 h-full">
        <div className="border-b border-gray-200 bg-white px-4 pb-3 pt-4">
          <div className="mb-3 flex items-center gap-2 text-theme-700">
            <FileText size={18} />
            <span className="text-sm font-semibold">公文工作台</span>
          </div>
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1 text-sm">
            {[
              { id: 'current', label: '当前公文' },
              { id: 'mine', label: '我的公文' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setDocumentTab(item.id as 'current' | 'mine')}
                className={`rounded-md px-3 py-2 font-semibold transition-colors ${
                  documentTab === item.id ? 'bg-theme-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white hover:text-gray-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs leading-5 text-gray-500">
            {documentTab === 'current' ? '查看并处理当前文档的生成流程' : '查看历史保存的公文'}
          </div>
        </div>

        <div className="scrollbar-hover flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {documentTab === 'mine' ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-gray-400">文件</span>
                      <span className="text-lg font-bold text-gray-900">{savedDocuments.length}</span>
                    </div>
                    {documentSearch.trim() && (
                      <span className="rounded-full bg-theme-50 px-2 py-0.5 text-[11px] font-medium text-theme-700">
                        {filteredSavedDocuments.length} 个匹配
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={documentSearch}
                      onChange={(event) => setDocumentSearch(event.target.value)}
                      className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-xs text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-theme-200 focus:bg-white focus:ring-2 focus:ring-theme-100"
                      placeholder="搜索文件名"
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-medium text-gray-400">辅助类型</span>
                      <select
                        value={documentSourceFilter}
                        onChange={(event) => {
                          const nextSource = event.target.value;
                          setDocumentSourceFilter(nextSource);
                          if (nextSource === '校验') {
                            setDocumentTypeFilter('全部');
                          }
                        }}
                        className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 outline-none focus:border-theme-200 focus:bg-white focus:ring-2 focus:ring-theme-100"
                      >
                        {savedDocumentSourceOptions.map((source) => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-medium text-gray-400">文章类型</span>
                      <select
                        value={documentTypeFilter}
                        onChange={(event) => setDocumentTypeFilter(event.target.value)}
                        disabled={documentSourceFilter === '校验'}
                        className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 text-xs text-gray-700 outline-none focus:border-theme-200 focus:bg-white focus:ring-2 focus:ring-theme-100 disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        {documentSourceFilter === '校验' ? (
                          <option value="全部">不适用</option>
                        ) : savedDocumentTypeOptions.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="mt-3">
                    <span className="mb-1 block text-[11px] font-medium text-gray-400">时间段</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={documentStartDate}
                        onChange={(event) => setDocumentStartDate(event.target.value)}
                        className="h-8 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[11px] text-gray-700 outline-none focus:border-theme-200 focus:bg-white focus:ring-2 focus:ring-theme-100"
                        title="开始日期"
                      />
                      <input
                        type="date"
                        value={documentEndDate}
                        onChange={(event) => setDocumentEndDate(event.target.value)}
                        className="h-8 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2 text-[11px] text-gray-700 outline-none focus:border-theme-200 focus:bg-white focus:ring-2 focus:ring-theme-100"
                        title="结束日期"
                      />
                    </div>
                  </div>
                </div>
                <div className="hidden rounded-lg border border-gray-200 bg-white p-2.5 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-baseline gap-2">
                      <div className="text-xs text-gray-400">文件总数</div>
                      <div className="text-lg font-bold text-gray-900">{savedDocuments.length}</div>
                    </div>
                    <div className="rounded-full bg-theme-50 px-2.5 py-1 text-xs font-medium text-theme-700">点击文件打开编辑</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredSavedDocuments.map((item) => {
                    const validationResolved = item.source === 'validation' && (item.validationIssueCount ?? 0) === 0;
                    const canDownloadDocument = item.source === 'validation' ? validationResolved : item.hasFinalFile;
                    return (
                    <div
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenSavedDocument(item)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleOpenSavedDocument(item);
                        }
                      }}
                      className={`group w-full rounded-lg border bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-theme-200 hover:shadow-md ${
                        selectedSavedDocumentId === item.id ? 'border-theme-200 ring-2 ring-theme-100' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-theme-50 text-theme-700">
                          <FileText size={17} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-gray-900">{item.title}</div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                              item.source === 'validation' ? 'bg-blue-50 text-blue-700' : 'bg-theme-50 text-theme-700'
                            }`}>
                              {item.source === 'validation' ? '校验' : '创作'}
                            </span>
                            {item.source === 'writing' && (
                              <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{item.type}</span>
                            )}
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{item.words} 字</span>
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{item.updatedAt}</span>
                            {item.source === 'validation' && (
                              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700">{item.validationStatus || '待修复'} · {item.validationIssueCount ?? 0} 处</span>
                            )}

                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {canDownloadDocument ? (
                          <button
                            onClick={(event) => event.stopPropagation()}
                            className="flex items-center justify-center gap-1.5 rounded-lg border border-theme-100 bg-theme-50 px-2 py-1.5 text-xs font-medium text-theme-700 hover:bg-theme-100"
                          >
                            <Download size={13} />
                            下载
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-400">
                            <FileText size={13} />
                            {item.source === 'validation' ? '待修复' : '待生成'}
                          </div>
                        )}
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setDocumentPendingDelete(item);
                          }}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          <X size={13} />
                          删除
                        </button>
                      </div>
                    </div>
                    );
                  })}
                  {filteredSavedDocuments.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-8 text-center text-sm text-gray-400">
                      未找到匹配的公文
                    </div>
                  )}
                </div>
              </div>
            ) : currentDocumentMode === "validation" ? (
              validationCurrentPanel
            ) : (
            <>
            <div className="rounded-lg border border-theme-100 bg-white p-3 shadow-sm">
              <div className="mb-3 text-sm font-medium text-gray-800">生成流程</div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className={`rounded-lg px-2 py-2 ${requirementsEditable ? 'bg-theme-600 text-white' : requirementsConfirmed ? 'bg-theme-50 text-theme-700' : 'bg-gray-100 text-gray-500'}`}>
                  调整要求
                </div>
                <div className={`rounded-lg px-2 py-2 ${outlineEditing || isGeneratingOutline || outlineConfirmed ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {isGeneratingOutline ? '生成中' : '生成正文'}
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">
                {requirementsEditable
                  ? '调整公文要求和模板，确认后进入正文生成。'
                  : isGeneratingOutline
                    ? '如意助手正在根据已确认的要求生成大纲。'
                  : outlineEditing
                    ? '请检查并编辑大纲，确认后将直接生成正文。'
                    : '正文已根据确认后的要求和大纲生成。'}
              </p>
            </div>

            {requirementsEditable && (
              <>
            {/* 公文要求 */}
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">公文要求</div>
                <span className={`rounded px-2 py-0.5 text-xs ${requirementsEditable ? 'bg-theme-50 text-theme-700' : 'bg-gray-100 text-gray-500'}`}>
                  {requirementsEditable ? '可编辑' : '已锁定'}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <label className="block">
                  <span className="mb-1 block text-xs text-gray-400">文章标题</span>
                  <input
                    disabled={!requirementsEditable}
                    value={requirementTitle}
                    onChange={(event) => {
                      setRequirementTitle(event.target.value);
                      setIsSaved(false);
                    }}
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-theme-200 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-gray-400">公文类型</span>
                  <select
                    disabled={!requirementsEditable}
                    value={requirementType}
                    onChange={(event) => {
                      const nextType = event.target.value;
                      setRequirementType(nextType);
                      const nextTemplate = editorTemplates.find(template => template.category === nextType);
                      if (nextTemplate) setSelectedTemplate(nextTemplate.id);
                      setIsSaved(false);
                    }}
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-theme-200 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    {templateCategories.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-gray-400">篇幅</span>
                  <select
                    disabled={!requirementsEditable}
                    value={requirementLength}
                    onChange={(event) => {
                      setRequirementLength(event.target.value);
                      setIsSaved(false);
                    }}
                    className="h-9 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-theme-200 disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    {lengthOptions.map((length) => (
                      <option key={length} value={length}>{length} 字</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs text-gray-400">内容要求</span>
                  <textarea
                    disabled={!requirementsEditable}
                    value={requirementContent}
                    onChange={(event) => {
                      setRequirementContent(event.target.value);
                      setIsSaved(false);
                    }}
                    rows={4}
                    className="scrollbar-hover w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-5 outline-none focus:ring-2 focus:ring-theme-200 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">模板选择与预览</div>
                <span className={`rounded px-2 py-0.5 text-xs ${requirementsEditable ? 'bg-theme-50 text-theme-700' : 'bg-gray-100 text-gray-500'}`}>
                  {requirementsEditable ? '可调整' : '已锁定'}
                </span>
              </div>
              <div className={`group rounded-lg border p-2 ${selectedTemplateMeta.border}`}>
                <div className="flex gap-3">
                  <div className="relative h-20 w-16 flex-shrink-0 rounded bg-gray-50 p-2 shadow-inner">
                    <div className={`mb-2 h-1 w-8 rounded ${selectedTemplateMeta.accent}`} />
                    <div className="space-y-1">
                      <div className="h-1 rounded bg-gray-300" />
                      <div className="h-1 rounded bg-gray-200" />
                      <div className="h-1 rounded bg-gray-200" />
                      <div className="h-1 w-2/3 rounded bg-gray-200" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded bg-gray-900/0 opacity-0 transition-all group-hover:bg-gray-900/35 group-hover:opacity-100">
                      <button
                        disabled={!requirementsEditable}
                        onClick={() => {
                          setActiveTemplateCategory(selectedTemplateMeta.category);
                          setPreviewTemplateId(selectedTemplate);
                        }}
                        className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-gray-800 shadow-md hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {requirementsEditable ? '预览' : '锁定'}
                      </button>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-800">{selectedTemplateMeta.name}</div>
                    <div className="mt-1 text-xs leading-5 text-gray-500">
                      {requirementsEditable ? '可重新选择模板并参与生成大纲' : '模板已随当前正文锁定'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {attachmentPanel}
              </>
            )}

            {(isGeneratingOutline || outlineEditing) && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">{isGeneratingOutline ? '生成大纲' : outlineEditing ? '生成正文 · 大纲确认' : '当前大纲'}</div>
                {!outlineEditing && <span className="text-xs text-gray-400">已确认</span>}
              </div>
              {isGeneratingOutline ? (
                <div className="rounded-lg bg-theme-50 px-3 py-4 text-sm text-theme-700">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    正在分析公文要求、匹配模板并生成大纲...
                  </div>
                </div>
              ) : (
              <div className="space-y-2">
                <textarea
                  value={outlineText}
                  onChange={(event) => handleOutlineTextChange(event.target.value)}
                  rows={12}
                  className="scrollbar-hover w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-6 text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-theme-200"
                />
                <div className="text-xs leading-5 text-gray-400">
                  可直接在文本框中调整章节顺序、标题和说明，确认后将按当前大纲生成正文。
                </div>
              </div>
              )}
            </div>
            )}
            {outlineEditing && readonlyAttachmentPanel}

            {!requirementsEditable && !outlineEditing && !isGeneratingOutline && (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">生成正文 · 大纲编辑</div>
                    {outlineDirty && <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">已调整</span>}
                  </div>
                  <textarea
                    value={outlineText}
                    onChange={(event) => handleOutlineTextChange(event.target.value)}
                    rows={10}
                    className="scrollbar-hover w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-6 text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-theme-200"
                  />
                  <div className="mt-2 text-xs leading-5 text-gray-400">
                    调整大纲后，可在下方重新生成正文。
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="mb-3 text-sm font-medium text-gray-700">正文摘要</div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-400">文章标题</span>
                      <span className="text-right font-medium text-gray-800">{requirementTitle || '未命名文档'}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-400">公文类型</span>
                      <span className="font-medium text-gray-800">{requirementType}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-400">已选模板</span>
                      <span className="font-medium text-gray-800">{selectedTemplateMeta.name}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-400">篇幅</span>
                      <span className="font-medium text-gray-800">{requirementLength} 字</span>
                    </div>
                  </div>
                </div>
                {readonlyAttachmentPanel}
                <div className={`rounded-lg border p-3 ${finalFileReady ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg ${finalFileReady ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {finalFileReady ? <CheckCircle2 size={17} /> : <FileText size={17} />}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${finalFileReady ? 'text-green-800' : 'text-gray-800'}`}>
                        {finalFileReady ? '最终文件已生成' : '待生成最终公文文件'}
                      </div>
                      <div className={`mt-1 text-xs leading-5 ${finalFileReady ? 'text-green-700' : 'text-gray-500'}`}>
                        {finalFileReady ? '最终文件已生成，可下载或进入后续归档流转。' : '确认正文无误后，点击下方操作生成最终文件。'}
                      </div>
                      {finalFileReady && (
                        <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700">
                          <Download size={14} />
                          下载文件
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            </>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
          {documentTab === 'mine' ? (
            <button
              onClick={() => setDocumentTab('current')}
              className="w-full rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-theme-700"
            >
              返回当前公文
            </button>
          ) : currentDocumentMode === "validation" ? (
            <div className="space-y-2">
              {pendingValidationIssues.length === 0 ? (
                <button
                  onClick={handleExportValidatedDocument}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
                >
                  <Download size={15} />
                  导出文档
                </button>
              ) : (
                <button
                  onClick={handleApplyAllValidationIssues}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-theme-700"
                >
                  <CheckCircle2 size={15} />
                  应用所有校验结果
                </button>
              )}
              <button
                onClick={handleRunValidation}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-theme-200 bg-theme-50 px-3 py-2.5 text-sm font-semibold text-theme-700 shadow-sm hover:bg-theme-100"
              >
                <CheckSquare size={15} />
                重新校验
              </button>
              {pendingValidationIssues.length > 0 && (
                <button
                  onClick={handleSave}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Save size={15} />
                  保存修订稿
                </button>
              )}
            </div>
          ) : isGeneratingOutline ? (
            <button
              disabled
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white opacity-90"
            >
              <Loader2 size={16} className="animate-spin" />
              正在生成大纲
            </button>
          ) : requirementsEditable ? (
            <button
              onClick={handleConfirmRequirements}
              className="w-full rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-theme-700"
            >
              确认要求，进入生成正文
            </button>
          ) : outlineEditing ? (
            <div className="space-y-2">
              <button
                onClick={handleConfirmOutline}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-theme-700"
              >
                <Sparkles size={15} />
                确认大纲并生成正文
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={generateOutlineDraft}
                  className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  重新生成大纲
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Save size={15} />
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {finalFileReady && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                  <CheckCircle2 size={16} />
                  最终公文文件已生成
                </div>
              )}
              {outlineDirty && (
                <button
                  onClick={handleRegenerateContent}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-theme-700"
                >
                  <RefreshCw size={15} />
                  重新生成正文
                </button>
              )}
              {!outlineDirty && !finalFileReady && (
                <button
                  onClick={handleGenerateFinalFile}
                  disabled={isGeneratingFinalFile}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isGeneratingFinalFile ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      正在生成最终公文文件
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      生成最终公文文件
                    </>
                  )}
                </button>
              )}
              {!outlineDirty && finalFileReady && (
                <button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-semibold text-gray-400">
                  <CheckCircle2 size={16} />
                  最终公文文件已生成
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Save size={15} />
                  保存
                </button>
                <button
                  onClick={handleEditRequirements}
                  className="rounded-lg border border-theme-200 bg-theme-50 px-3 py-2.5 text-sm font-medium text-theme-700 transition-colors hover:bg-theme-100"
                >
                  调整要求
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {documentPendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <div className="text-lg font-semibold text-gray-900">删除公文</div>
            <p className="mt-3 text-sm leading-6 text-gray-600">是否确认删除该公文所有信息？</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDocumentPendingDelete(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDeleteDocument}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {showRegenerateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl">
            <div className="text-lg font-semibold text-gray-900">调整公文要求</div>
            <p className="mt-3 text-sm leading-6 text-gray-600">是否确认清除当前生成的内容，并重新调整要求后生成大纲？</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowRegenerateConfirm(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmRegenerate}
                className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {previewTemplateId && requirementsEditable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-3 sm:p-4">
          <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex flex-shrink-0 items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-gray-900">模板选择</div>
                <div className="mt-1 text-sm text-gray-500">选择分类并查看模板具体内容</div>
              </div>
              <button onClick={() => setPreviewTemplateId(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-shrink-0 flex-col gap-3 border-b border-gray-100 pb-4">
              <div className="flex flex-wrap gap-2">
                {templateCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveTemplateCategory(category);
                      const nextTemplate = editorTemplates.find(t => t.category === category);
                      if (nextTemplate) setPreviewTemplateId(nextTemplate.id);
                    }}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTemplateCategory === category ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div className="scrollbar-hover flex gap-2 overflow-x-auto pb-1">
                {filteredPreviewTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setPreviewTemplateId(template.id)}
                    className={`flex min-w-[150px] items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-gray-50 ${previewTemplateId === template.id ? `${template.border} bg-theme-50/40` : 'border-gray-200'}`}
                  >
                    <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${template.accent}`} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-gray-900">{template.name}</div>
                      <div className="truncate text-xs text-gray-500">{template.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-4 overflow-hidden py-4 pr-1 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="rounded-lg bg-gray-50 p-3 sm:p-5">
                  <div className="mx-auto h-[52vh] min-h-[330px] max-h-[520px] w-full max-w-[380px] rounded bg-white px-6 py-7 shadow-lg sm:px-9 sm:py-10">
                    <div className="mb-4 text-right text-[10px] text-gray-400">吉祥航空办公规范模板</div>
                    <div className={`mx-auto mb-6 h-1.5 w-28 rounded ${previewTemplateMeta.accent}`} />
                    <div className="mb-6 text-center text-lg font-bold tracking-normal text-gray-900 sm:text-xl">{previewTemplateMeta.name}</div>
                    <div className="mb-6 space-y-3">
                      <div className="h-2.5 rounded bg-gray-300" />
                      <div className="h-2.5 rounded bg-gray-200" />
                      <div className="h-2.5 rounded bg-gray-200" />
                      <div className="h-2.5 w-4/5 rounded bg-gray-200" />
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: '一、一级标题', width: 'w-24', indent: '' },
                        { label: '（一）二级标题', width: 'w-28', indent: 'ml-4' },
                        { label: '1. 三级标题', width: 'w-20', indent: 'ml-8' },
                      ].map((item) => (
                        <div key={item.label} className={item.indent}>
                          <div className={`mb-2 h-2 rounded bg-gray-300 ${item.width}`} />
                          <div className="space-y-2">
                            <div className="h-2 rounded bg-gray-200" />
                            <div className="h-2 rounded bg-gray-200" />
                            <div className="h-2 w-3/4 rounded bg-gray-200" />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-3 text-[10px] text-gray-400">
                      <span>页脚：内部流转</span>
                      <span>第 2 页 / 共 N 页</span>
                    </div>
                  </div>
                </div>
                <div className="flex min-h-0 flex-col rounded-lg border border-gray-100 bg-white p-3">
                  <div className="mb-3 flex-shrink-0 text-sm font-semibold text-gray-700">模板内容</div>
                  <div className="scrollbar-hover min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                    {templateLayoutRules.map((rule) => (
                      <div key={rule.label} className="rounded-lg bg-gray-50 p-3">
                        <div className="text-xs font-semibold text-gray-500">{rule.label}</div>
                        <div className="mt-1 text-sm leading-5 text-gray-800">{rule.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                </div>

            <div className="mt-4 flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <Link to="/admin?section=ai-template" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                编辑模板
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewTemplateId(null)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    handleEditorTemplateSelect(previewTemplateMeta);
                    setPreviewTemplateId(null);
                  }}
                  className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700"
                >
                  使用此模板
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    {userRuleToast && (
      <div className="fixed bottom-6 right-6 z-[90] rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-xl">
        {userRuleToast}
      </div>
    )}
    </>
  );
}





