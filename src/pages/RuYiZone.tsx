import { useState, useEffect } from "react";
import { Paperclip, Send, Sparkles, Clock, Bookmark, Calendar, Menu, X, Brain, Code, FileText as FileTextIcon, PresentationIcon, Languages, Building2, MonitorCog, Target, Copy, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import DocumentEditor from "./DocumentEditor";
import PresentationEditor from "./PresentationEditor";
import { documentValidationIssues, documentValidationRules, documentValidationSummary, type DocumentMode } from "../data/documentValidation";
import { MAIN_USER_AVATAR, MAIN_USER_NAME, getDemoPerson } from "../data/people";
import {
  presentationModes,
  presentationOutline,
  presentationParamOptions,
  presentationSlides,
  type PresentationModeId,
} from "../data/presentation";

interface Assistant {
  id: number;
  name: string;
  isActive: boolean;
  icon: React.ReactNode;
}

interface HistoryItem {
  id: number;
  title: string;
  time: string;
  icon?: React.ReactNode;
  question: string;
  kind: ConversationKind;
}

interface Tool {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface ProcessLink {
  id: number;
  title: string;
  to: string;
}

type ConversationKind =
  | "pending"
  | "meetingMinutes"
  | "feedback"
  | "project"
  | "operations"
  | "schedule"
  | "knowledge"
  | "attendance"
  | "closing"
  | "documentDraft"
  | "documentValidation"
  | "presentationDraft"
  | "goalAssistant";

const defaultAssistants: Assistant[] = [
  { id: 1, name: "企业知识专家", isActive: false, icon: <Building2 size={18} /> },
  { id: 2, name: "IT服务助手", isActive: false, icon: <MonitorCog size={18} /> },
  { id: 3, name: "如意公文创作", isActive: false, icon: <FileTextIcon size={18} /> },
  { id: 4, name: "如意PPT创作", isActive: false, icon: <PresentationIcon size={18} /> },
  { id: 5, name: "如意工作参谋师", isActive: false, icon: <Target size={18} /> },
];

const historyItems: HistoryItem[] = [
  { id: 1, title: "我还有什么流程没有处理？", time: "今天 12:20", icon: <Clock size={16} />, question: "我还有什么流程没有处理？", kind: "pending" },
  { id: 2, title: "如何创建会议纪要？", time: "今天 12:18", icon: <FileTextIcon size={16} />, question: "如何创建会议纪要？", kind: "meetingMinutes" },
  { id: 3, title: "我的使用问题反馈", time: "今天 12:16", icon: <MonitorCog size={16} />, question: "我的VPN有问题，帮我反馈一下", kind: "feedback" },
  { id: 4, title: "项目立项申请流程", time: "今天 10:33", icon: <FileTextIcon size={16} />, question: "项目立项申请流程是什么？", kind: "project" },
  { id: 5, title: "本月运营数据", time: "今天 10:35", icon: <Bookmark size={16} />, question: "我想看看公司近期运营数据", kind: "operations" },
  { id: 6, title: "预约项目会议", time: "今天 10:37", icon: <Calendar size={16} />, question: "帮我预约明天下午2点的项目会议", kind: "schedule" },
  { id: 7, title: "智能办公知识文章", time: "今天 10:42", icon: <Brain size={16} />, question: "帮我搜索关于智能办公的知识文章", kind: "knowledge" },
  { id: 8, title: "上月考勤统计", time: "昨天 15:45", icon: <Clock size={16} />, question: "我想了解一下上个月的考勤统计", kind: "attendance" },
  { id: 9, title: "结束对话提醒", time: "昨天 14:20", icon: <Sparkles size={16} />, question: "谢谢你，今天就到这里吧", kind: "closing" },
];

const tools: Tool[] = [
  { id: 1, name: "公文", icon: <FileTextIcon size={18} />, description: "公文快速撰写", color: "from-cyan-400 to-blue-500" },
  { id: 2, name: "PPT", icon: <PresentationIcon size={18} />, description: "快速演示文稿", color: "from-orange-400 to-amber-500" },
  { id: 3, name: "翻译", icon: <Languages size={18} />, description: "多语言翻译", color: "from-green-400 to-teal-500" },
  { id: 4, name: "代码", icon: <Code size={18} />, description: "编程助手", color: "from-green-400 to-emerald-500" },
];

const docTypes = [
  "工作总结",
  "会议讲话",
  "通知",
  "会议纪要",
  "请示报告",
  "函",
  "批复",
  "决定",
  "公告",
  "通报",
];

const lengthOptions = [
  "300-500",
  "500-800",
  "600-1200",
  "1000-1500",
  "1500-2000",
];

const documentTemplates = [
  {
    id: "official-red",
    name: "红头通知",
    desc: "适合正式通知、制度发布",
    accent: "bg-red-500",
    border: "border-red-200",
    category: "通知",
    subCategory: "公司通知",
  },
  {
    id: "policy-notice",
    name: "制度通知",
    desc: "适合规章制度、执行要求",
    accent: "bg-rose-500",
    border: "border-rose-200",
    category: "通知",
    subCategory: "制度发布",
  },
  {
    id: "party-study",
    name: "党群学习",
    desc: "适合学习教育、主题活动",
    accent: "bg-red-600",
    border: "border-red-200",
    category: "党群",
    subCategory: "学习教育",
  },
  {
    id: "party-activity",
    name: "党群活动",
    desc: "适合活动方案、组织安排",
    accent: "bg-orange-500",
    border: "border-orange-200",
    category: "党群",
    subCategory: "活动方案",
  },
  {
    id: "meeting-minutes",
    name: "项目纪要",
    desc: "适合项目会议、任务纪要",
    accent: "bg-sky-500",
    border: "border-sky-200",
    category: "会议纪要",
    subCategory: "项目会议",
  },
  {
    id: "meeting-summary",
    name: "专题纪要",
    desc: "适合专题讨论、决策记录",
    accent: "bg-indigo-500",
    border: "border-indigo-200",
    category: "会议纪要",
    subCategory: "专题会议",
  },
  {
    id: "brief-blue",
    name: "蓝色简报",
    desc: "适合工作汇报、会议材料",
    accent: "bg-blue-500",
    border: "border-blue-200",
    category: "工作简报",
    subCategory: "周报简报",
  },
  {
    id: "report-green",
    name: "经营报告",
    desc: "适合数据总结、经营分析",
    accent: "bg-emerald-500",
    border: "border-emerald-200",
    category: "工作简报",
    subCategory: "经营简报",
  },
];

const templateCategories = ["通知", "党群", "会议纪要", "工作简报"];

const templateFilterOptions: Record<string, string[]> = {
  通知: ["全部", "公司通知", "制度发布"],
  党群: ["全部", "学习教育", "活动方案"],
  会议纪要: ["全部", "项目会议", "专题会议"],
  工作简报: ["全部", "周报简报", "经营简报"],
};

const userAvatarUrl = MAIN_USER_AVATAR;

const templateLayoutRules = [
  { label: "主标题", value: "二号方正小标宋，居中，段前 0 行、段后 1 行" },
  { label: "一级标题", value: "三号黑体，序号使用“一、”，段前 0.5 行" },
  { label: "二级标题", value: "三号楷体，序号使用“（一）”，段前 0.25 行" },
  { label: "三级标题", value: "三号仿宋加粗，序号使用“1.”，与正文同段缩进" },
  { label: "正文", value: "三号仿宋，首行缩进 2 字符" },
  { label: "行间距", value: "固定值 28 磅，段落间距 0.5 行" },
  { label: "字间距", value: "标准字距，重点标题加宽 0.5 磅" },
  { label: "页眉页脚", value: "页眉显示单位名称，页脚居中显示页码" },
  { label: "页数规则", value: "首页不显示页码，正文第 2 页起连续编号" },
];

const sceneOptions = [
  "通用场景",
  "工作总结",
  "会议讲话",
  "会议纪要",
  "请示报告",
  "通知公告",
  "函件往来",
  "批复决定",
  "通报汇报",
];

const pendingProcessLinks: ProcessLink[] = [
  { id: 1, title: "部门通知", to: "/process?type=department-notice&source=ruyi-zone" },
  { id: 2, title: "部门通知", to: "/process?type=department-notice&source=ruyi-zone" },
  { id: 3, title: "部门通知", to: "/process?type=department-notice&source=ruyi-zone" },
  { id: 4, title: "部门通知", to: "/process?type=department-notice&source=ruyi-zone" },
  { id: 5, title: "休假申请", to: "/process?type=leave-request&source=ruyi-zone" },
];

const approvalLinks: ProcessLink[] = [
  { id: 1, title: "项目立项申请 - 吉祥航空协同平台", to: "/process?approval=project-setup&source=ruyi-zone" },
  { id: 2, title: "预算调整申请 - Q2季度预算追加", to: "/process?approval=budget-adjustment&source=ruyi-zone" },
  { id: 3, title: "设备采购申请 - 新风系统采购", to: "/process?approval=equipment-purchase&source=ruyi-zone" },
];

const knowledgeLinks: ProcessLink[] = [
  { id: 1, title: "智能办公系统功能介绍", to: "/knowledge?doc=smart-office-intro&source=ruyi-zone" },
  { id: 2, title: "协同办公平台使用手册", to: "/knowledge?doc=collaboration-manual&source=ruyi-zone" },
  { id: 3, title: "常见问题 FAQ 汇总", to: "/knowledge?doc=faq&source=ruyi-zone" },
];

const operationsLinks: ProcessLink[] = [
  { id: 1, title: "本月销售额：1,286 万元，较上月 +12.5%", to: "/business?metric=sales&source=ruyi-zone" },
  { id: 2, title: "客户满意度：96.8%，较上月 +2.3%", to: "/business?metric=satisfaction&source=ruyi-zone" },
  { id: 3, title: "项目交付及时率：89.2%，较上月 -1.5%", to: "/business?metric=delivery&source=ruyi-zone" },
];

const reportSubmitTargets = [
  { id: 1, name: getDemoPerson(12), department: "信息管理部", role: "直属上级", type: "汇报对象" },
  { id: 2, name: getDemoPerson(14), department: "信息管理部", role: "项目协同", type: "抄送对象" },
  { id: 3, name: getDemoPerson(11), department: "信息管理部", role: "部门负责人", type: "汇报对象" },
];

const suggestedPrompts = [
  "我还有什么流程没有处理？",
  "帮我生成本周工作汇报",
  "帮我预约项目会议室",
  "看看我的 OKR 当前进展",
];

const itServicePrompts = [
  "解锁VPN账号",
  "吉祥账号重置密码",
  "电脑硬件故障",
  "网络连接问题",
  "办公软件使用",
  "提交ITSM工单报障",
];

export default function RuYiZone() {
  const [input, setInput] = useState("");
  const [assistants, setAssistants] = useState<Assistant[]>(defaultAssistants);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLegacyMode, setIsLegacyMode] = useState(false);
  const [legacyEditorStartsInRequirements, setLegacyEditorStartsInRequirements] = useState(false);
  const [legacyEditorStartsInOutline, setLegacyEditorStartsInOutline] = useState(false);
  const [editorSessionId, setEditorSessionId] = useState(0);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [docType, setDocType] = useState(templateCategories[0]);
  const [docTitle, setDocTitle] = useState("");
  const [docLength, setDocLength] = useState("600-1200");
  const [docContent, setDocContent] = useState("");
  const [docAttachments, setDocAttachments] = useState<string[]>([]);
  const [documentMode, setDocumentMode] = useState<DocumentMode>("writing");
  const [validationFileName, setValidationFileName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [validationReady, setValidationReady] = useState(false);
  const [pptMode, setPptMode] = useState<PresentationModeId>("ai");
  const [pptPageCount, setPptPageCount] = useState("10-15页");
  const [pptAudience, setPptAudience] = useState("大众");
  const [pptScene, setPptScene] = useState("通用");
  const [pptTone, setPptTone] = useState("专业");
  const [pptLanguage, setPptLanguage] = useState("简体中文");
  const [pptTextStyle, setPptTextStyle] = useState("简洁");
  const [pptAttachments, setPptAttachments] = useState<string[]>([]);
  const [presentationReady, setPresentationReady] = useState(false);
  const [presentationPrompt, setPresentationPrompt] = useState("");
  const [presentationTitle, setPresentationTitle] = useState("");
  const [presentationConfirmMessage, setPresentationConfirmMessage] = useState("");
  const [presentationAdjustments, setPresentationAdjustments] = useState<string[]>([]);
  const [showPresentationEditor, setShowPresentationEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(documentTemplates[0].id);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [activeTemplateCategory, setActiveTemplateCategory] = useState(templateCategories[0]);
  const [activeTemplateFilter, setActiveTemplateFilter] = useState("全部");
  const [documentReady, setDocumentReady] = useState(false);
  const [documentPrompt, setDocumentPrompt] = useState("");
  const [documentConfirmMessage, setDocumentConfirmMessage] = useState("");
  const [outlineAdjustments, setOutlineAdjustments] = useState<string[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [embedEditorInRuyiZone, setEmbedEditorInRuyiZone] = useState(false);
  const [hasConversation, setHasConversation] = useState(false);
  const [sentQuestion, setSentQuestion] = useState("");
  const [conversationKind, setConversationKind] = useState<ConversationKind>("pending");
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);
  const [showReportSubmitTargets, setShowReportSubmitTargets] = useState(false);
  const [selectedReportSubmitTargets, setSelectedReportSubmitTargets] = useState<number[]>([1]);
  const [reportSubmitDone, setReportSubmitDone] = useState(false);

  const resolveConversationKind = (question: string): ConversationKind => {
    if (/会议纪要|纪要|录音/.test(question)) return "meetingMinutes";
    if (/反馈|问题|报错|不好用|VPN|服务台/.test(question)) return "feedback";
    if (/立项|项目申请|项目流程/.test(question)) return "project";
    if (/运营|数据|指标|销售|满意度|报表/.test(question)) return "operations";
    if (/日程|会议室|预约|安排|下周会议/.test(question)) return "schedule";
    if (/待办|流程|审批|待审|待审批/.test(question)) return "pending";
    if (/知识|文章|文档|最新发文|手册/.test(question)) return "knowledge";
    if (/考勤|出勤|迟到|早退|休假/.test(question)) return "attendance";
    if (/谢谢|结束|再见|今天就到这里/.test(question)) return "closing";
    return "pending";
  };

  const handleUploadAttachment = () => {
    if (activeTool === "PPT") {
      setPptAttachments((current) => [
        ...current,
        `PPT参考资料${current.length + 1}.pdf`,
      ]);
      return;
    }
    if (activeTool === "公文" && documentMode === "validation") {
      const nextFile = `待校验公文${docAttachments.length + 1}.docx`;
      setValidationFileName(nextFile);
      setDocAttachments([nextFile]);
      setValidationError("");
      return;
    }
    setDocAttachments((current) => [
      ...current,
      `公文参考附件${current.length + 1}.pdf`,
    ]);
  };

  const handleRemoveAttachment = (attachment: string) => {
    setDocAttachments((current) => current.filter((item) => item !== attachment));
    if (validationFileName === attachment) {
      setValidationFileName("");
      setValidationReady(false);
    }
  };

  const handleRemovePptAttachment = (attachment: string) => {
    setPptAttachments((current) => current.filter((item) => item !== attachment));
  };

  const handleSend = () => {
    if (activeTool === 'PPT' && conversationKind === "presentationDraft") {
      const message = input.trim();
      if (!message) return;
      if (/确认|可以|没问题|生成|就这样|通过/.test(message)) {
        setPresentationConfirmMessage(message);
        setPresentationReady(true);
      } else {
        setPresentationReady(false);
        setPresentationAdjustments((current) => [...current, message]);
      }
      setInput("");
      return;
    }

    if (activeTool === 'PPT') {
      const question = input.trim() || "AI赋能：企业效率革新与未来";
      const title = question.replace(/^(请|帮我|生成|做一份|制作|撰写)/, "").slice(0, 32) || "AI赋能企业效率革新";
      setSentQuestion(question);
      setPresentationPrompt(question);
      setPresentationTitle(title);
      setPresentationConfirmMessage("");
      setConversationKind("presentationDraft");
      setSelectedHistoryId(null);
      setHasConversation(true);
      setPresentationReady(false);
      setPresentationAdjustments([]);
      setInput("");
      return;
    }
    if (activeTool === '公文' && conversationKind === "documentValidation") {
      const fileName = validationFileName || docAttachments[0] || docTitle || "当前公文";
      setSentQuestion(`按已配置校验规则重新校验《${fileName.replace(/\.[^.]+$/, "")}》`);
      setValidationReady(true);
      setInput("");
      return;
    }

    if (activeTool === '公文' && conversationKind === "documentDraft") {
      const message = input.trim();
      if (!message) return;
      if (/确认|可以|没问题|生成|就这样|通过/.test(message)) {
        setDocumentConfirmMessage(message);
        setDocumentReady(true);
      } else {
        setDocumentReady(false);
        setOutlineAdjustments(prev => [...prev, message]);
      }
      setInput("");
      return;
    }

    if (activeTool === '公文' && documentMode === "validation") {
      const fileName = validationFileName || docAttachments[0];
      if (!fileName) {
        setValidationError("请先上传待校验公文");
        return;
      }
      const question = `请校验《${fileName}》中的错别字和标点使用问题`;
      setSentQuestion(question);
      setConversationKind("documentValidation");
      setSelectedHistoryId(null);
      setHasConversation(true);
      setDocTitle(fileName.replace(/\.[^.]+$/, ""));
      setDocContent(question);
      setValidationReady(true);
      setInput("");
      return;
    }

    if (activeTool === '公文') {
      const question = input.trim() || "帮我生成一篇关于推进如意空间智能办公建设的通知";
      const title = docTitle.trim() || question.replace(/^(请|帮我|生成|写一篇|撰写)/, "").slice(0, 32) || "如意空间智能办公建设通知";
      setSentQuestion(question);
      setDocumentPrompt(question);
      setDocumentConfirmMessage("");
      setConversationKind("documentDraft");
      setSelectedHistoryId(null);
      setHasConversation(true);
      setDocType(docType);
      setDocTitle(title);
      setDocContent(question);
      setDocumentReady(false);
      setOutlineAdjustments([]);
      setInput("");
      return;
    }
    const question = input.trim();
    if (question) {
      setSentQuestion(question);
      setConversationKind(resolveConversationKind(question));
      setSelectedHistoryId(null);
      setHasConversation(true);
      setInput("");
    }
  };

  const handleBackFromEditor = () => {
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
  };

  const getHistoryAssistantName = (kind: ConversationKind) => {
    if (kind === "feedback") return "IT服务助手";
    if (kind === "knowledge" || kind === "operations") return "企业知识专家";
    if (kind === "documentDraft" || kind === "documentValidation") return "如意公文创作";
    if (kind === "presentationDraft") return "如意PPT创作";
    if (kind === "goalAssistant") return "如意工作参谋师";
    return "";
  };

  const handleNewConversation = () => {
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
    setHasConversation(false);
    setSentQuestion("");
    setInput("");
    setActiveTool(null);
    setSelectedHistoryId(null);
    setSelectedAssistant(null);
    setAssistants(defaultAssistants);
    setConversationKind("pending");
    setDocumentReady(false);
    setDocumentMode("writing");
    setValidationFileName("");
    setValidationError("");
    setValidationReady(false);
    setDocumentConfirmMessage("");
    setOutlineAdjustments([]);
    setPresentationReady(false);
    setPresentationConfirmMessage("");
    setPresentationAdjustments([]);
    setLegacyEditorStartsInRequirements(false);
    setLegacyEditorStartsInOutline(false);
    setShowReportSubmitTargets(false);
    setSelectedReportSubmitTargets([1]);
    setReportSubmitDone(false);
  };

  const openLegacyDocumentAssistant = () => {
    const documentAssistant = defaultAssistants.find((assistant) => assistant.name === "如意公文创作") || null;
    setActiveTool("公文");
    setDocumentMode("writing");
    setConversationKind("documentDraft");
    setSelectedHistoryId(null);
    setSelectedAssistant(documentAssistant);
    setAssistants(defaultAssistants.map((assistant) => ({
      ...assistant,
      isActive: assistant.name === "如意公文创作",
    })));
    setDocTitle("");
    setDocContent("");
    setInput("");
    setDocumentReady(false);
    setOutlineAdjustments([]);
    setLegacyEditorStartsInRequirements(true);
    setLegacyEditorStartsInOutline(false);
    setEditorSessionId((current) => current + 1);
    setEmbedEditorInRuyiZone(true);
    setShowEditor(true);
  };

  const openLegacyPresentationAssistant = () => {
    const presentationAssistant = defaultAssistants.find((assistant) => assistant.name === "如意PPT创作") || null;
    setActiveTool("PPT");
    setConversationKind("presentationDraft");
    setSelectedHistoryId(null);
    setSelectedAssistant(presentationAssistant);
    setAssistants(defaultAssistants.map((assistant) => ({
      ...assistant,
      isActive: assistant.name === "如意PPT创作",
    })));
    setPresentationReady(false);
    setPresentationConfirmMessage("");
    setPresentationAdjustments([]);
    setPresentationPrompt("");
    setPresentationTitle("");
    setInput("");
    setHasConversation(false);
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
  };

  const openLegacyItAssistant = () => {
    const itAssistant = defaultAssistants.find((assistant) => assistant.name === "IT服务助手") || null;
    setActiveTool(null);
    setConversationKind("feedback");
    setSelectedHistoryId(null);
    setSelectedAssistant(itAssistant);
    setAssistants(defaultAssistants.map((assistant) => ({
      ...assistant,
      isActive: assistant.name === "IT服务助手",
    })));
    setSentQuestion("我VPN被禁用了怎么办");
    setInput("");
    setHasConversation(true);
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
  };


  const toggleReportSubmitTarget = (targetId: number) => {
    setSelectedReportSubmitTargets((current) => (
      current.includes(targetId)
        ? current.filter((id) => id !== targetId)
        : [...current, targetId]
    ));
  };

  const handleSubmitWorkReport = () => {
    if (selectedReportSubmitTargets.length === 0) return;
    setReportSubmitDone(true);
  };

  const sendItServiceQuestion = (question: string) => {
    const message = question.trim();
    if (!message) return;
    const itAssistant = defaultAssistants.find((assistant) => assistant.name === "IT服务助手") || null;
    setAssistants(defaultAssistants.map((item) => ({ ...item, isActive: item.name === "IT服务助手" })));
    setSelectedAssistant(itAssistant);
    setSelectedHistoryId(null);
    setActiveTool(null);
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
    setConversationKind("feedback");
    setSentQuestion(message);
    setHasConversation(true);
    setInput("");
  };

  const handleAssistantSelect = (assistant: Assistant) => {
    if (assistant.name === "如意公文创作") {
      openLegacyDocumentAssistant();
      return;
    }
    if (assistant.name === "IT服务助手") {
      setAssistants(defaultAssistants.map((item) => ({ ...item, isActive: item.id === assistant.id })));
      setSelectedAssistant(assistant);
      setSelectedHistoryId(null);
      setHasConversation(false);
      setActiveTool(null);
      setShowEditor(false);
      setEmbedEditorInRuyiZone(false);
      setInput("");
      return;
    }
    if (assistant.name === "如意工作参谋师") {
      setAssistants(defaultAssistants.map((item) => ({ ...item, isActive: item.id === assistant.id })));
      setSelectedAssistant(assistant);
      setSelectedHistoryId(null);
      setHasConversation(true);
      setActiveTool(null);
      setShowEditor(false);
      setEmbedEditorInRuyiZone(false);
      setConversationKind("goalAssistant");
      setSentQuestion("请根据我的OKR生成本周工作汇报并汇总KR进展");
      setInput("");
      setShowReportSubmitTargets(false);
      setSelectedReportSubmitTargets([1]);
      setReportSubmitDone(false);
      return;
    }
    // 更新选中状态
    const updatedAssistants = assistants.map(item => ({
      ...item,
      isActive: item.id === assistant.id
    }));
    setAssistants(updatedAssistants);
    setSelectedAssistant(assistant);
    setSelectedHistoryId(null);
    setHasConversation(false);
    setActiveTool(null);
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setSentQuestion(item.question);
    setConversationKind(item.kind);
    setSelectedHistoryId(item.id);
    setSelectedAssistant(null);
    setAssistants(defaultAssistants);
    setHasConversation(true);
    setActiveTool(null);
    setInput("");
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const useSecondaryDrawer = width < 1024;
      setIsMobile(useSecondaryDrawer);
      setShowSidebar(width >= 1024);
      if (!useSecondaryDrawer) {
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const previewTemplate = documentTemplates.find(t => t.id === previewTemplateId) || documentTemplates[0];
  const filteredPreviewTemplates = documentTemplates.filter((template) => (
    template.category === activeTemplateCategory
  ));
  const filteredDocumentTemplates = documentTemplates.filter((template) => (
    template.category === docType
  ));

  const handleDocumentTemplateSelect = (template: typeof documentTemplates[number]) => {
    setSelectedTemplate(template.id);
    setDocType(template.category);
  };

  const handleDocumentModeChange = (mode: DocumentMode) => {
    setDocumentMode(mode);
    setValidationError("");
    setInput("");
    if (mode === "writing") {
      setValidationReady(false);
    }
  };

  const renderDocumentModeSwitch = () => (
    <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-theme-100 bg-theme-50/80 p-0.5 shadow-sm dark:border-theme-900/40 dark:bg-theme-900/20">
      {([
        { id: "writing", label: "公文创作" },
        { id: "validation", label: "公文校验" },
      ] as Array<{ id: DocumentMode; label: string }>).map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleDocumentModeChange(item.id)}
          className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${documentMode === item.id ? 'bg-white text-theme-700 shadow-sm dark:bg-gray-800 dark:text-theme-300' : 'text-gray-500 hover:bg-white/70 hover:text-theme-700 dark:text-gray-300 dark:hover:bg-gray-800/80'}`}
        >
          {item.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          setActiveTool(null);
          setValidationError("");
        }}
        className="ml-0.5 flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-white hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        title="关闭公文插件"
      >
        <X size={12} />
      </button>
    </div>
  );

  const getAttachmentMeta = (attachment: string) => {
    const extension = attachment.split('.').pop()?.toUpperCase() || 'DOC';
    const size = extension === 'PDF' ? '216.8 KB' : extension === 'XLSX' ? '12.48 KB' : '18.6 KB';
    return `${extension}  ${size}`;
  };

  const renderValidationFileCard = (attachment: string) => (
    <div
      key={attachment}
      className="relative flex min-w-0 max-w-[225px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 pr-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <FileTextIcon size={34} className="flex-shrink-0 text-blue-500" strokeWidth={1.8} />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold leading-5 text-gray-900 dark:text-white">{attachment}</div>
        <div className="text-xs leading-5 text-gray-500 dark:text-gray-400">{getAttachmentMeta(attachment)}</div>
      </div>
      <button
        type="button"
        onClick={() => handleRemoveAttachment(attachment)}
        className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        title="删除附件"
      >
        <X size={14} />
      </button>
    </div>
  );

  const renderDocumentValidationInputPanel = (compact = false) => (
    <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      {docAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-gray-100 px-3 py-3 dark:border-gray-700">
          {docAttachments.map(renderValidationFileCard)}
        </div>
      )}
      <div className={`${compact ? 'min-h-10 px-3 py-2' : 'min-h-[86px] px-3 py-4'} text-sm leading-6 text-gray-500 dark:text-gray-300`}>
        {validationError ? (
          <span className="text-red-500">{validationError}</span>
        ) : (
          <span>{docAttachments.length > 0 ? '请问您想要问什么呢？' : '请上传 Word/PDF 公文文件后开始校验'}</span>
        )}
      </div>
    </div>
  );

  const renderDocumentValidationSettings = () => (
    <div className="space-y-3 rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
      <div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white">校验规则</div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">当前仅校验错别字、标点使用不正确</div>
      </div>
      {validationError && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{validationError}</div>}
      <div className="text-xs leading-6 text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-700 dark:text-gray-200">校验条件：</span>
        {documentValidationRules.map((rule, index) => (
          <span key={rule.id}>
            {index > 0 ? '、' : ''}{rule.title}
          </span>
        ))}
      </div>
    </div>
  );
  const handlePresentationModeChange = (mode: PresentationModeId) => {
    setPptMode(mode);
    if (mode === "single") {
      setPptPageCount("单页");
    } else if (pptPageCount === "单页") {
      setPptPageCount("10-15页");
    }
  };

  const renderPresentationParamSelect = (
    key: keyof typeof presentationParamOptions,
    value: string,
    onChange: (value: string) => void,
    disabled = false,
  ) => {
    const option = presentationParamOptions[key];
    return (
      <label className="block min-w-0">
        <span className="mb-1 block text-xs text-gray-500 dark:text-gray-400">{option.label}</span>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-9 w-full rounded-lg border border-gray-200 bg-white px-2.5 text-xs text-gray-800 outline-none transition-colors focus:border-theme-200 focus:ring-2 focus:ring-theme-100 disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {option.options.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>
    );
  };

  const renderPresentationSettings = () => (
    <div className="mt-4 space-y-4 rounded-2xl border border-theme-100/80 bg-white/85 p-4 shadow-[0_12px_32px_rgba(148,76,126,0.08)] backdrop-blur dark:border-gray-700 dark:bg-gray-800/80">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-950 dark:text-white">使用AI创建PPT</h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">选择创建方式，补充主题或参考文档，先生成执行方案再确认生成草稿。</p>
          </div>
          <span className="hidden rounded-full bg-theme-50 px-3 py-1 text-xs font-medium text-theme-700 dark:bg-theme-900/30 dark:text-theme-300 sm:inline-flex">PPT插件</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {presentationModes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handlePresentationModeChange(mode.id)}
              className={`rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${pptMode === mode.id ? 'border-theme-300 bg-theme-50/70 ring-2 ring-theme-100 dark:border-theme-500 dark:bg-theme-900/20' : 'border-gray-200 bg-white hover:border-theme-100 dark:border-gray-700 dark:bg-gray-800'}`}
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-theme-500 to-theme-600 text-white shadow-sm">
                <PresentationIcon size={17} />
              </div>
              <div className="text-sm font-semibold text-gray-950 dark:text-white">{mode.name}</div>
              <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {pptAttachments.length > 0 && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/60">
          <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">已上传参考文档</div>
          <div className="space-y-1.5">
            {pptAttachments.map((attachment) => (
              <div key={attachment} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                <Paperclip size={14} className="flex-shrink-0 text-theme-500" />
                <span className="truncate">{attachment}</span>
                <button
                  onClick={() => handleRemovePptAttachment(attachment)}
                  className="ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500 dark:hover:bg-gray-600"
                  title="删除参考文档"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {renderPresentationParamSelect("pageCount", pptMode === "single" ? "单页" : pptPageCount, setPptPageCount, pptMode === "single")}
        {renderPresentationParamSelect("audience", pptAudience, setPptAudience)}
        {renderPresentationParamSelect("scene", pptScene, setPptScene)}
        {renderPresentationParamSelect("tone", pptTone, setPptTone)}
        {renderPresentationParamSelect("language", pptLanguage, setPptLanguage)}
        {renderPresentationParamSelect("textStyle", pptTextStyle, setPptTextStyle)}
      </div>
    </div>
  );
  const handleLegacySend = () => {
    if (activeTool === "PPT") {
      const question = input.trim() || "AI赋能：企业效率革新与未来";
      const title = question.replace(/^(请|帮我|生成|做一份|制作|撰写)/, "").slice(0, 32) || "AI赋能企业效率革新";
      setSentQuestion(question);
      setPresentationPrompt(question);
      setPresentationTitle(title);
      setPresentationConfirmMessage("");
      setConversationKind("presentationDraft");
      setSelectedHistoryId(null);
      setHasConversation(false);
      setPresentationReady(true);
      setPresentationAdjustments([]);
      setInput("");
      setShowEditor(false);
      setEmbedEditorInRuyiZone(false);
      setShowPresentationEditor(true);
      return;
    }
    if (activeTool === "公文" && documentMode === "validation") {
      const fileName = validationFileName || docAttachments[0];
      if (!fileName) {
        setValidationError("请先上传待校验公文");
        return;
      }
      setSentQuestion(`请校验《${fileName}》中的错别字和标点使用问题`);
      setConversationKind("documentValidation");
      setSelectedHistoryId(null);
      setHasConversation(true);
      setDocTitle(fileName.replace(/\.[^.]+$/, ""));
      setDocContent(`校验文件：${fileName}`);
      setValidationReady(true);
      setInput("");
      setHasConversation(false);
      setDocumentReady(false);
      setLegacyEditorStartsInRequirements(false);
      setLegacyEditorStartsInOutline(false);
      setEditorSessionId((current) => current + 1);
      setEmbedEditorInRuyiZone(true);
      setShowEditor(true);
      return;
    }
    if (activeTool === "公文") {
      const question = input.trim() || "帮我生成一篇关于推进如意空间智能办公建设的通知";
      const title = docTitle.trim() || question.replace(/^(请|帮我|生成|写一篇|撰写)/, "").slice(0, 32) || "如意空间智能办公建设通知";
      setSentQuestion(question);
      setDocumentPrompt(question);
      setConversationKind("documentDraft");
      setSelectedHistoryId(null);
      setHasConversation(true);
      setDocTitle(title);
      setDocContent(question);
      setDocumentReady(false);
      setOutlineAdjustments([]);
      setInput("");
      setLegacyEditorStartsInRequirements(false);
      setLegacyEditorStartsInOutline(true);
      setEditorSessionId((current) => current + 1);
      setEmbedEditorInRuyiZone(!isLegacyMode);
      setShowEditor(true);
      return;
    }
    handleSend();
  };

  const renderLegacyDocumentSettings = () => (
    <div className="mx-auto mt-4 w-full max-w-[980px] rounded-xl border border-[#ece8f0] bg-white px-5 py-4 shadow-[0_10px_28px_rgba(23,23,43,0.05)]">
      {documentMode === "validation" && renderDocumentValidationSettings()}
      <div className={`${documentMode === "writing" ? "grid" : "hidden"} grid-cols-1 gap-3 lg:grid-cols-2`}>
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500">公文类型</span>
          <select
            value={docType}
            onChange={(event) => {
              const nextCategory = event.target.value;
              setDocType(nextCategory);
              const nextTemplate = documentTemplates.find(template => template.category === nextCategory);
              if (nextTemplate) setSelectedTemplate(nextTemplate.id);
            }}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-theme-200"
          >
            {templateCategories.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-gray-500">字数选择</span>
          <select
            value={docLength}
            onChange={(event) => setDocLength(event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-theme-200"
          >
            {lengthOptions.map((length) => (
              <option key={length} value={length}>{length} 字</option>
            ))}
          </select>
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-sm text-gray-500">文章标题</span>
          <input
            value={docTitle}
            onChange={(event) => setDocTitle(event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-theme-200"
            placeholder="请输入文章标题"
          />
        </label>
      </div>
      {documentMode === "writing" && docAttachments.length > 0 && (
        <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="mb-2 text-xs text-gray-500">已上传附件</div>
          <div className="space-y-1.5">
            {docAttachments.map((attachment) => (
              <div key={attachment} className="flex items-center gap-2 text-sm text-gray-700">
                <Paperclip size={14} className="flex-shrink-0 text-theme-500" />
                <span className="truncate">{attachment}</span>
                <button
                  onClick={() => handleRemoveAttachment(attachment)}
                  className="ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500"
                  title="删除附件"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={documentMode === "writing" ? "mt-4" : "hidden"}>
        <div className="mb-2 text-sm text-gray-500">选择公文模板</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDocumentTemplates.map((template) => (
            <div
              key={template.id}
              role="button"
              tabIndex={0}
              onClick={() => handleDocumentTemplateSelect(template)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleDocumentTemplateSelect(template);
                }
              }}
              className={`group overflow-hidden rounded-lg border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                selectedTemplate === template.id ? `${template.border} ring-2 ring-theme-200` : 'border-gray-200'
              }`}
            >
              <div className="relative h-20 bg-gray-50 p-3">
                <div className={`mb-2 h-1.5 w-16 rounded-full ${template.accent}`} />
                <div className="mx-auto h-full max-w-[72px] rounded-sm bg-white p-2 shadow-sm">
                  <div className={`mx-auto mb-2 h-1 w-9 rounded-full ${template.accent}`} />
                  <div className="space-y-1">
                    <div className="h-1 rounded bg-gray-300" />
                    <div className="h-1 rounded bg-gray-200" />
                    <div className="h-1 w-2/3 rounded bg-gray-200" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/0 opacity-0 transition-all group-hover:bg-gray-900/35 group-hover:opacity-100">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveTemplateCategory(template.category);
                      setPreviewTemplateId(template.id);
                    }}
                    className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-md transition-colors hover:bg-white"
                  >
                    预览模板
                  </button>
                </div>
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-gray-900">{template.name}</div>
                <div className="mt-1 text-xs text-gray-500">{template.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLegacyTemplatePreview = () => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-3 sm:p-4">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white p-4 shadow-2xl sm:p-5">
        <div className="mb-4 flex flex-shrink-0 items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-950">模板选择</h3>
            <p className="mt-1 text-sm text-gray-500">选择分类并查看模板具体内容</p>
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
                  const nextTemplate = documentTemplates.find(t => t.category === category);
                  if (nextTemplate) setPreviewTemplateId(nextTemplate.id);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTemplateCategory === category ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
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
              <div className={`mx-auto mb-6 h-1.5 w-28 rounded ${previewTemplate.accent}`} />
              <div className="mb-6 text-center text-lg font-bold tracking-normal text-gray-900 sm:text-xl">{previewTemplate.name}</div>
              <div className="mb-6 space-y-3">
                <div className="h-2.5 rounded bg-gray-300" />
                <div className="h-2.5 rounded bg-gray-200" />
                <div className="h-2.5 rounded bg-gray-200" />
                <div className="h-2.5 w-4/5 rounded bg-gray-200" />
              </div>
              <div className="space-y-4">
                {[
                  { label: "一、一级标题", width: "w-24", indent: "" },
                  { label: "（一）二级标题", width: "w-28", indent: "ml-4" },
                  { label: "1. 三级标题", width: "w-20", indent: "ml-8" },
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
            </div>
          </div>
          <div className="flex min-h-0 flex-col rounded-lg border border-gray-100 bg-white p-3">
            <div className="mb-3 flex-shrink-0 text-sm font-semibold text-gray-700">模板内容</div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {templateLayoutRules.map((rule) => (
                <div key={rule.label} className="rounded-lg bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-500">{rule.label}</div>
                  <div className="mt-1 text-sm leading-5 text-gray-800">{rule.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <Link to="/admin?section=ai-template" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">编辑模板</Link>
          <div className="flex gap-2">
            <button onClick={() => setPreviewTemplateId(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">取消</button>
            <button
              onClick={() => {
                handleDocumentTemplateSelect(previewTemplate);
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
  );

  const renderItServiceLanding = () => (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-5xl flex-col justify-center px-2 py-8">
      <div className="mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-theme-50 px-3 py-1 text-xs font-semibold text-theme-700 dark:bg-theme-900/25 dark:text-theme-300">
          <MonitorCog size={14} />
          IT服务助手
        </div>
        <h2 className="text-3xl font-bold tracking-normal text-gray-950 dark:text-white">你好，我是吉祥航空IT服务助手</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {itServicePrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendItServiceQuestion(prompt)}
            className="group flex h-[86px] items-center gap-4 rounded-2xl border border-[#dfe4f5] bg-white px-7 text-left text-xl font-semibold text-gray-950 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#d7af81] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#d7af81] text-xs font-bold text-white shadow-sm">
              |||
            </span>
            <span className="min-w-0 truncate">{prompt}</span>
          </button>
        ))}
      </div>

      <div className="mt-8">
        <div className="relative min-h-[168px] rounded-2xl border-2 border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 md:p-6">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="也可以直接描述您遇到的IT问题..."
            className="min-h-[112px] w-full resize-none border-none bg-transparent pr-24 text-lg font-medium leading-8 text-gray-900 outline-none placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={handleUploadAttachment}
              className="rounded-full p-1 text-gray-400 transition-colors hover:bg-theme-50 hover:text-theme-500 dark:text-gray-500 dark:hover:bg-theme-900/20"
              title="上传附件"
            >
              <Paperclip size={18} />
            </button>
            <button
              onClick={() => sendItServiceQuestion(input)}
              className="rounded-full bg-gradient-to-r from-theme-500 to-theme-600 p-2 text-white shadow-sm transition-all duration-300 hover:scale-105 hover:from-theme-600 hover:to-theme-700 hover:shadow"
              title="发送"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
        <div className="mt-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
          内容AI辅助生成，请谨慎识别
        </div>
      </div>
    </div>
  );

  const renderLegacyAssistant = () => {
    const legacyHistory = ["年度账单", "你是谁?", "适航指令的评估期限", "我还有几天休假?", "猜你想看[2025", "我还有多少优惠票?", "吉祥航空2023年有", "我能有几天休假"];
    const legacySuggestions = ["你是谁?", "我还有几天休假?", "我还有什么流程没有处理?"];

    return (
      <div className="relative flex h-full min-h-screen bg-[#fdfcff] text-gray-900">
        <aside className="hidden w-[242px] flex-shrink-0 border-r border-[#f1edf6] bg-[#fbf9fd] md:block">
          <div className="px-6 pt-6">
            <button
              onClick={handleNewConversation}
              className="mb-6 flex h-[52px] w-full items-center gap-3 bg-white px-4 text-left text-[15px] font-medium text-gray-900 shadow-sm"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a20b67] text-white">+</span>
              开启新对话
            </button>
            <button className="mb-7 flex h-10 items-center gap-3 text-[15px] font-medium text-gray-900">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-200 text-xs text-white">T</span>
              如意翻译助手
            </button>
            <button
              onClick={openLegacyDocumentAssistant}
              className={`mb-7 flex h-10 items-center gap-3 text-[15px] font-medium transition-colors ${
                showEditor && activeTool === "公文" ? 'text-[#a20b67]' : 'text-gray-900 hover:text-[#a20b67]'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#a20b67] text-xs text-white">
                <FileTextIcon size={13} />
              </span>
              如意公文创作
            </button>
            <button
              onClick={openLegacyPresentationAssistant}
              className={`mb-7 flex h-10 items-center gap-3 text-[15px] font-medium transition-colors ${
                selectedAssistant?.name === "如意PPT创作" || activeTool === "PPT" ? 'text-[#a20b67]' : 'text-gray-900 hover:text-[#a20b67]'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#7c3aed] text-xs text-white">
                <PresentationIcon size={13} />
              </span>
              如意PPT创作
            </button>
            <button
              onClick={openLegacyItAssistant}
              className={`mb-7 flex h-10 items-center gap-3 text-[15px] font-medium transition-colors ${
                selectedAssistant?.name === "IT服务助手" ? 'text-[#a20b67]' : 'text-gray-900 hover:text-[#a20b67]'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded bg-[#3f4669] text-xs text-white">
                <MonitorCog size={13} />
              </span>
              IT服务助手
            </button>
            <div className="mb-8 border-t border-dashed border-[#d9d4ea]" />
            <div className="mb-5 text-[15px] text-gray-500">历史对话</div>
            <div className="space-y-5">
              {legacyHistory.map((item) => (
                <button key={item} className="block w-full truncate text-left text-[15px] text-gray-700 hover:text-[#a20b67]">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {showPresentationEditor ? (
            <PresentationEditor
              mode={pptMode}
              title={presentationTitle}
              prompt={presentationPrompt}
              pageCount={pptPageCount}
              audience={pptAudience}
              scene={pptScene}
              tone={pptTone}
              language={pptLanguage}
              textStyle={pptTextStyle}
              attachments={pptAttachments}
              embedded
              onBack={() => setShowPresentationEditor(false)}
            />
          ) : showEditor ? (            <DocumentEditor
              key={`legacy-editor-${editorSessionId}`}
              docType={docType}
              docTitle={docTitle}
              docLength={docLength}
              docContent={docContent}
              attachments={docAttachments}
              documentMode={documentMode}
              validationFileName={validationFileName || docAttachments[0]}
              validationIssues={documentValidationIssues}
              startInRequirements={legacyEditorStartsInRequirements}
              startInOutline={legacyEditorStartsInOutline}
              embedded
              onRemoveAttachment={handleRemoveAttachment}
              onBack={handleBackFromEditor}
            />
          ) : (
          <>
          <header className="flex h-[64px] flex-shrink-0 items-center justify-end border-b border-[#f3eff7] bg-[#faf9fc] px-7">
            <div className="flex items-center gap-4 text-base text-gray-700">
              <button
                onClick={() => setIsLegacyMode(false)}
                className="rounded-full border border-theme-100 bg-white px-4 py-2 text-sm font-semibold text-theme-700 shadow-sm transition-colors hover:bg-theme-50"
              >
                返回新版
              </button>
              <img
                src={userAvatarUrl}
                alt={MAIN_USER_NAME}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span>hello，{MAIN_USER_NAME}</span>
            </div>
          </header>

          <section className="relative flex flex-1 flex-col items-center overflow-y-auto px-6 pb-16 pt-20">
            <div className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 rounded-tl-full border-[10px] border-[#ead9c7]/70 opacity-70" />
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-extrabold italic tracking-normal md:text-5xl">
                <span className="text-[#a20b67]">如意 如意</span>
                <span className="ml-4 text-[#3f4669]">按你心意!</span>
              </h1>
              <p className="mt-5 text-sm leading-5 text-gray-500">
                如意如意，按你心意！你感兴趣的问题，都可以问我试试~
                <br />
                You can also communicate with me in your mother tongue.
              </p>
            </div>

            <div className="mb-4 flex w-full max-w-[980px] items-center gap-3">
              <button
                onClick={() => {
                  setActiveTool(activeTool === "公文" ? null : "公文");
                  setSelectedAssistant(defaultAssistants.find((assistant) => assistant.name === "如意公文创作") || null);
                  setInput("");
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  activeTool === "公文"
                    ? "border-theme-200 bg-theme-50 text-theme-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-theme-200 hover:text-theme-700"
                }`}
              >
                <FileTextIcon size={16} />
                公文
              </button>
              <button
                onClick={() => {
                  setActiveTool(activeTool === "PPT" ? null : "PPT");
                  setSelectedAssistant(defaultAssistants.find((assistant) => assistant.name === "如意PPT创作") || null);
                  setInput("");
                }}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  activeTool === "PPT"
                    ? "border-theme-200 bg-theme-50 text-theme-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-theme-200 hover:text-theme-700"
                }`}
              >
                <PresentationIcon size={16} />
                PPT
              </button>
            </div>

            <div className={`relative w-full max-w-[980px] rounded-xl border bg-white px-6 py-5 shadow-sm transition-all ${
              activeTool === "公文" || activeTool === "PPT" ? "border-theme-200 ring-1 ring-theme-100" : "border-[#dddce6]"
            }`}>
              {activeTool === "公文" ? (
                <div className="pr-24">
                  <div className="mb-3 flex items-center">
                    {renderDocumentModeSwitch()}
                  </div>
                  {documentMode === "validation" ? (
                    renderDocumentValidationInputPanel()
                  ) : (
                    <textarea
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="请输入写作主题或需求..."
                      className="h-20 w-full resize-none border-none bg-transparent text-base leading-7 text-gray-900 outline-none placeholder:text-gray-400"
                    />
                  )}
                </div>
              ) : activeTool === "PPT" ? (
                <div className="flex items-start gap-3 pr-24">
                  <div className="flex items-center gap-2 rounded-full bg-theme-50 px-3 py-1.5 text-sm font-medium text-theme-700">
                    <PresentationIcon size={14} />
                    AI演示
                  </div>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="请输入PPT主题或创作要求..."
                    className="h-24 flex-1 resize-none border-none bg-transparent text-base leading-7 text-gray-900 outline-none placeholder:text-gray-400"
                  />
                </div>
              ) : (
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="请问您想要问什么呢?"
                  className="h-24 w-full border-none bg-transparent pr-24 text-base text-gray-900 outline-none placeholder:text-gray-400"
                />
              )}
              <div className="absolute bottom-5 left-6 flex items-center gap-4">
                <button onClick={handleUploadAttachment} className="text-gray-900 hover:text-theme-600" title="上传附件">
                  <Paperclip size={22} />
                </button>
              </div>
              <button
                onClick={handleLegacySend}
                className="absolute bottom-5 right-5 rounded-full bg-[#a20b67] p-2 text-white shadow-sm transition-all hover:scale-105 hover:bg-[#8d0a5a]"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-2 w-full max-w-[980px] text-center text-[11px] text-gray-400">
              内容AI辅助生成，请谨慎识别
            </div>

            {activeTool === "公文" && renderLegacyDocumentSettings()}
            {activeTool === "PPT" && (
              <div className="mx-auto w-full max-w-[980px]">
                {renderPresentationSettings()}
              </div>
            )}
            {previewTemplateId && renderLegacyTemplatePreview()}

            {activeTool !== "公文" && activeTool !== "PPT" && (
              <div className="mt-6 grid w-full max-w-[980px] gap-5 md:grid-cols-3">
                {legacySuggestions.map((item) => (
                  <button key={item} className="flex h-[70px] items-center gap-4 rounded-xl border border-[#dfe4f5] bg-white px-6 text-left text-lg font-semibold shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#d5b086] hover:shadow-md">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d7af81] text-xs font-bold text-white">|||</span>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </section>
          </>
          )}
        </main>
      </div>
    );
  };

  return (
    <>
      {showEditor && !isLegacyMode && !embedEditorInRuyiZone ? (
        <DocumentEditor
          key={`editor-${editorSessionId}`}
          docType={docType}
          docTitle={docTitle}
          docLength={docLength}
          docContent={docContent}
          attachments={docAttachments}
          documentMode={documentMode}
          validationFileName={validationFileName || docAttachments[0]}
          validationIssues={documentValidationIssues}
          startInOutline={legacyEditorStartsInOutline}
          onRemoveAttachment={handleRemoveAttachment}
          onBack={handleBackFromEditor}
        />
      ) : isLegacyMode ? (
        renderLegacyAssistant()
      ) : (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-theme-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex flex-1 min-h-0">
        {/* 移动端菜单按钮 - 放在内容区右侧 */}
        {isMobile && (
          <button
            className="fixed top-6 right-6 z-50 bg-white p-2 rounded-full shadow-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* 移动端遮罩层 */}
        {isMobile && mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/30"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* 移动端导航栏 - 从右侧滑入 */}
        <div className={`
          ${isMobile ? 'fixed inset-y-0 right-0 z-40 w-64' : 'w-[240px] lg:w-[280px] flex-shrink-0'}
          ${showSidebar || mobileMenuOpen ? 'flex' : 'hidden'}
          bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700 flex flex-col shadow-lg
          transition-transform duration-300 ease-in-out
          ${isMobile && mobileMenuOpen ? 'translate-x-0' : isMobile ? 'translate-x-full' : ''}
        `}>
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
              <div className="w-8 h-8 bg-gradient-to-r from-theme-500 to-theme-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <span>如意空间</span>
              <Link
                to="/web_client/agent-square"
                className="ml-auto inline-flex items-center gap-1 rounded-full border border-theme-100 bg-theme-50 px-2 py-1 text-[11px] font-semibold text-theme-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-theme-100 dark:border-theme-900/40 dark:bg-theme-900/20 dark:text-theme-200"
                title="进入AI门户"
              >
                AI门户
              </Link>
            </h3>
            <button
              onClick={() => setIsLegacyMode(true)}
              className="mb-3 flex w-full items-center justify-between rounded-lg border border-theme-100 bg-theme-50 px-3 py-2.5 text-sm font-semibold text-theme-700 transition-colors hover:bg-theme-100 dark:border-theme-900/40 dark:bg-theme-900/20 dark:text-theme-200 dark:hover:bg-theme-900/30"
            >
              <span>切换旧版</span>
            </button>
            <button
              onClick={handleNewConversation}
              className="mb-6 flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-theme-100 hover:bg-theme-50 hover:text-theme-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <span>新对话</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-theme-600 text-sm leading-none text-white">+</span>
            </button>
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between px-1">
                <h4 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">常用智能助手</h4>
                <span className="rounded-full bg-theme-50 px-2 py-0.5 text-[10px] font-medium text-theme-600 dark:bg-theme-900/30 dark:text-theme-300">智能体</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
              {assistants.map((assistant) => (
                <button
                  type="button"
                  key={assistant.id}
                  className={`
                    group relative min-h-[76px] overflow-hidden rounded-xl border p-2.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md
                    ${selectedAssistant?.id === assistant.id
                      ? 'border-theme-200 bg-gradient-to-br from-theme-50 to-white text-theme-700 shadow-sm ring-1 ring-theme-100 dark:border-theme-800 dark:from-theme-900/30 dark:to-gray-800 dark:text-theme-300'
                      : 'border-gray-100 bg-white text-gray-700 hover:border-theme-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-theme-800'
                    }
                  `}
                  onClick={() => handleAssistantSelect(assistant)}
                >
                  <div className="absolute -right-4 -top-4 h-10 w-10 rounded-full bg-theme-100/60 opacity-0 transition-opacity group-hover:opacity-100 dark:bg-theme-900/30" />
                  <div className="relative flex h-full flex-col justify-between gap-3">
                    <div className={`
                      flex h-7 w-7 items-center justify-center rounded-lg
                      ${selectedAssistant?.id === assistant.id ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-theme-50 group-hover:text-theme-600 dark:bg-gray-700 dark:text-gray-400'}
                    `}>
                      {assistant.icon}
                    </div>
                    <span className="block truncate text-xs font-semibold leading-4">{assistant.name}</span>
                  </div>
                </button>
              ))}
              </div>
            </div>
            <Link
              to="/web_client/agent-square"
              className="block w-full bg-gradient-to-theme text-white py-3 rounded-lg hover:opacity-90 transition-all duration-300 text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              前往智能体广场
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="mb-3 flex items-center justify-between px-1">
              <h4 className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">历史对话</h4>
              <span className="text-[10px] text-gray-400">{historyItems.length} 条</span>
            </div>
            <div className="space-y-1">
              {historyItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`
                    w-full rounded-lg px-2.5 py-2 text-left transition-all duration-200
                    ${selectedHistoryId === item.id
                      ? 'bg-theme-50 text-theme-700 dark:bg-theme-900/20 dark:text-theme-300'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-gray-200'
                    }
                  `}
                  onClick={() => handleHistorySelect(item)}
                >
                  <div className="min-w-0">
                    <h5 className="truncate text-xs font-medium leading-5">{item.title}</h5>
                    {getHistoryAssistantName(item.kind) && (
                      <span className="mt-0.5 block truncate text-[11px] text-gray-400 dark:text-gray-500">{getHistoryAssistantName(item.kind)}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 第三列：如意空间内容区域 */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {showPresentationEditor ? (
            <PresentationEditor
              mode={pptMode}
              title={presentationTitle}
              prompt={presentationPrompt}
              pageCount={pptPageCount}
              audience={pptAudience}
              scene={pptScene}
              tone={pptTone}
              language={pptLanguage}
              textStyle={pptTextStyle}
              attachments={pptAttachments}
              embedded
              onBack={() => setShowPresentationEditor(false)}
            />
          ) : showEditor && embedEditorInRuyiZone ? (
            <DocumentEditor
              key={`ruyi-editor-${editorSessionId}`}
              docType={docType}
              docTitle={docTitle}
              docLength={docLength}
              docContent={docContent}
              attachments={docAttachments}
              documentMode={documentMode}
              validationFileName={validationFileName || docAttachments[0]}
              validationIssues={documentValidationIssues}
              startInRequirements={legacyEditorStartsInRequirements}
              startInOutline={legacyEditorStartsInOutline}
              embedded
              onRemoveAttachment={handleRemoveAttachment}
              onBack={handleBackFromEditor}
            />
          ) : (
          <>
          <div className="px-6 md:px-8 py-6 md:py-8 flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {hasConversation && (
                <div className="mb-10 space-y-8">
                  <div className="flex justify-end">
                    <div className="max-w-2xl rounded-2xl bg-theme-50 px-5 py-4 text-gray-900 shadow-sm dark:bg-theme-900/20 dark:text-white">
                      {sentQuestion}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20astronaut%20avatar%20in%20space%2C%20clean%20design%2C%20blue%20and%20white%20color%20scheme%2C%20futuristic%20style&image_size=square_hd"
                      alt="如意助手"
                      className="mt-1 h-10 w-10 flex-shrink-0 rounded-full object-cover"
                    />
                    <div className="max-w-3xl text-gray-900 dark:text-gray-100">
                      {conversationKind === "pending" && (
                        <>
                          <p className="mb-4 leading-7">好的，我来为您查一下您目前有待处理的流程。</p>
                          <p className="mb-6 leading-7">
                            根据公司内部系统实时查询到的数据，您有 <span className="font-semibold text-theme-700 dark:text-theme-300">5 个</span> 待办流程需要处理，具体如下：
                          </p>

                          <div className="mb-5 border-b border-gray-200 pb-2 dark:border-gray-700">
                            <h3 className="flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white">
                              <FileTextIcon size={24} className="text-theme-500" />
                              待办流程列表
                            </h3>
                          </div>

                          <ol className="mb-6 list-decimal space-y-2 pl-6 text-lg font-semibold">
                            {pendingProcessLinks.map((process) => (
                              <li key={process.id}>
                                <Link
                                  to={process.to}
                                  className="text-gray-950 underline-offset-4 transition-colors hover:text-theme-600 hover:underline dark:text-white dark:hover:text-theme-300"
                                >
                                  [{process.title}]
                                </Link>
                              </li>
                            ))}
                          </ol>

                          <p className="mb-4 leading-7">建议您尽快点击以上流程链接进行审批或处理，以免影响后续流程进度或造成超期。</p>
                          <p className="mb-6 italic text-gray-700 dark:text-gray-300">（信息来源：公司内部待办流程接口）</p>
                        </>
                      )}

                      {conversationKind === "meetingMinutes" && (
                        <>
                          <p className="mb-4 leading-7">您可以通过以下方式创建会议纪要：</p>
                          <ol className="mb-6 list-decimal space-y-3 pl-6">
                            <li><span className="font-semibold">关联已有：</span>打开在线文档选择入口，关联已有会议纪要文档。</li>
                            <li><span className="font-semibold">创建空白：</span>根据配置好的会议纪要模板预先置入标题，再进入在线文档编辑。</li>
                            <li><span className="font-semibold">根据录音创建：</span>上传会议录音文件，由系统生成纪要草稿。</li>
                          </ol>
                          <div className="mb-6 flex flex-wrap gap-3">
                            <Link to="/web_client/knowledge?template=meeting-minutes" className="rounded-lg bg-theme-50 px-4 py-2 font-medium text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300">查看会议纪要模板</Link>
                            <Link to="/web_client/ruyi-zone?tool=document&scene=meeting-minutes" className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100">创建空白纪要</Link>
                          </div>
                        </>
                      )}

                      {conversationKind === "feedback" && (
                        <>
                          <p className="mb-4 leading-7">您的使用问题已反馈至系统负责人。</p>
                          <p className="mb-6 leading-7">我已记录您的问题描述，并同步给服务台跟进。您也可以进入服务台补充截图、影响范围或紧急程度。</p>
                          <Link to="/web_client/business?tab=service-desk&source=ruyi-zone" className="mb-6 inline-flex rounded-lg bg-theme-50 px-4 py-2 font-medium text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300">前往服务台查看处理进度</Link>
                        </>
                      )}

                      {conversationKind === "project" && (
                        <>
                          <p className="mb-4 leading-7">项目立项申请流程如下：</p>
                          <ol className="mb-6 list-decimal space-y-2 pl-6">
                            <li>填写项目基本信息。</li>
                            <li>提交项目预算申请。</li>
                            <li>部门负责人审批。</li>
                            <li>项目立项完成。</li>
                          </ol>
                          <p className="mb-4 leading-7">Web 端不展示 IM 表单卡片，我已将表单能力转换为流程入口。点击后可进入项目立项页面补充项目名称、类型、预计开始日期、预算、负责人和项目概述。</p>
                          <Link to="/web_client/process?type=project-setup&source=ruyi-zone" className="mb-6 inline-flex rounded-lg bg-theme-50 px-4 py-2 font-medium text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300">发起项目立项申请</Link>
                        </>
                      )}

                      {conversationKind === "operations" && (
                        <>
                          <p className="mb-4 leading-7">为您展示本月核心运营指标：</p>
                          <ol className="mb-6 list-decimal space-y-3 pl-6">
                            {operationsLinks.map((item) => (
                              <li key={item.id}>
                                <Link to={item.to} className="font-semibold text-gray-950 underline-offset-4 hover:text-theme-600 hover:underline dark:text-white dark:hover:text-theme-300">{item.title}</Link>
                              </li>
                            ))}
                          </ol>
                          <p className="mb-6 italic text-gray-700 dark:text-gray-300">（信息来源：公司运营数据看板）</p>
                        </>
                      )}

                      {conversationKind === "schedule" && (
                        <>
                          <p className="mb-4 leading-7">我已为您整理日程信息，请确认：</p>
                          <ul className="mb-6 space-y-2">
                            <li><span className="font-semibold">会议：</span>智能办公系统项目会议</li>
                            <li><span className="font-semibold">时间：</span>明天 14:00 - 15:00</li>
                            <li><span className="font-semibold">地点：</span>会议室A</li>
                            <li><span className="font-semibold">参与人：</span>{getDemoPerson(2)}、{getDemoPerson(1)}、{getDemoPerson(3)}</li>
                          </ul>
                          <div className="mb-6 flex flex-wrap gap-3">
                            <Link to="/web_client/calendar?action=create&source=ruyi-zone" className="rounded-lg bg-theme-50 px-4 py-2 font-medium text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300">确认创建日程</Link>
                            <Link to="/web_client/calendar?action=edit&source=ruyi-zone" className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100">修改日程信息</Link>
                          </div>
                        </>
                      )}

                      {conversationKind === "knowledge" && (
                        <>
                          <p className="mb-4 leading-7">为您找到以下相关知识：</p>
                          <ol className="mb-6 list-decimal space-y-3 pl-6">
                            {knowledgeLinks.map((item) => (
                              <li key={item.id}>
                                <Link to={item.to} className="font-semibold text-gray-950 underline-offset-4 hover:text-theme-600 hover:underline dark:text-white dark:hover:text-theme-300">{item.title}</Link>
                                <p className="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">包含功能介绍、操作指南、常见问题等内容。</p>
                              </li>
                            ))}
                          </ol>
                        </>
                      )}

                      {conversationKind === "attendance" && (
                        <>
                          <p className="mb-4 leading-7">您好，已为您查询到上个月考勤统计：</p>
                          <ul className="mb-6 space-y-2">
                            <li>应出勤 22 天，实际出勤 21 天。</li>
                            <li>迟到 2 次，早退 0 次。</li>
                            <li>请假 1 天，整体出勤率 95.5%。</li>
                          </ul>
                          <p className="mb-6 leading-7">整体表现良好。相关制度可查看 <Link to="/web_client/knowledge?doc=attendance-policy&source=ruyi-zone" className="font-semibold text-theme-700 underline-offset-4 hover:underline dark:text-theme-300">考勤管理制度 v2.3</Link>。</p>
                        </>
                      )}

                      {conversationKind === "closing" && (
                        <>
                          <p className="mb-4 leading-7">好的，很高兴为您服务。如有需要随时召唤我，祝您工作顺利！</p>
                          <p className="mb-6 leading-7">温馨提示：您今天还有 2 个待办事项，3 条待审批流程。</p>
                        </>
                      )}

                      {conversationKind === "goalAssistant" && (
                        <>
                          <p className="mb-4 leading-7">我是如意工作参谋师。我会把工作汇报和 OKR 放在一起看：先根据日程、待办任务、历史周报和附件生成本周汇报草稿，再提示哪些 KR 需要继续跟进。</p>
                          <p className="mb-3 leading-7">数据来源包括：</p>
                          <ul className="mb-6 list-disc space-y-2 pl-6 leading-7">
                            <li>日程会议记录：提取会议目标、参与人和下周计划。</li>
                            <li>待办任务：识别已完成、进行中和风险事项。</li>
                            <li>历史周报：对齐上周承诺与已落实进展。</li>
                            <li>参考附件：补充项目背景、材料和业务说明。</li>
                          </ul>
                          <div className="mb-5 border-b border-gray-200 pb-2 dark:border-gray-700">
                            <h3 className="flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white">
                              <Bookmark size={24} className="text-theme-500" />
                              智能周报草稿
                            </h3>
                          </div>
                          <div className="mb-6 space-y-5 leading-7">
                            {[
                              { title: "O1 推进工作汇报与OKR联动", kr: "KR1 完成汇报入口、详情、评论与已读状态", thisWeek: "本周完成看汇报列表、详情弹框和关联OKR展示，并补充评论与已读情况。", nextWeek: "下周继续校验统计口径，跟进未提交提醒与汇报导出能力。" },
                              { title: "O2 优化如意空间公文创作链路", kr: "KR2 完成模板预览、大纲确认和最终文件生成", thisWeek: "已调整公文要求、模板选择、参考文件和最终文件下载状态。", nextWeek: "继续梳理管理后台模板字段和前台编辑的一致性。" },
                              { title: "O3 完善门户办公应用体验", kr: "KR3 接入工作汇报、OKR和AI助手入口", thisWeek: "完成工作门户办公应用、OKR独立入口和如意工作参谋师浮层。", nextWeek: "补充数据权限、人员范围筛选和统计明细联动。" },
                            ].map((draft, index) => (
                              <div key={draft.kr}>
                                <div className="font-semibold text-gray-950 dark:text-white">{index + 1}. {draft.title}</div>
                                <div className="mt-1 text-sm font-semibold text-theme-700 dark:text-theme-300">{draft.kr}</div>
                                <p className="mt-2"><span className="font-semibold">本周工作：</span>{draft.thisWeek}</p>
                                <p className="mt-1"><span className="font-semibold">下周计划：</span>{draft.nextWeek}</p>
                              </div>
                            ))}
                          </div>
                          <p className="mb-3 leading-7">如果确认内容可用，可以发起全局提交。提交前我会在下一轮对话中询问需要提交的对象。</p>
                          <button
                            onClick={() => setShowReportSubmitTargets(true)}
                            disabled={showReportSubmitTargets}
                            className="mb-6 rounded-lg bg-theme-50 px-4 py-2 text-sm font-semibold text-theme-700 transition-colors hover:bg-theme-100 disabled:cursor-not-allowed disabled:text-gray-400 dark:bg-theme-900/20 dark:text-theme-300"
                          >
                            {showReportSubmitTargets ? '已发起提交流程' : '全局提交工作汇报'}
                          </button>

                          <div className="mb-5 border-gray-200 pt-2 dark:border-gray-700">
                            <h3 className="flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white">
                              <Target size={24} className="text-theme-500" />
                              KR当前进展汇总
                            </h3>
                          </div>
                          <p className="mb-4 leading-7">如意工作参谋师已读取您的 O 和下设 KR，结合各执行人的工作汇报内容，把当前进展汇总到对应 KR 下。</p>
                          <p className="mb-3 leading-7">本次评估条件：2026-06-22 至 2026-06-28，选择我的 O1、O2，人员范围为直属下级和自定义通讯录人员。</p>
                          <div className="mb-6 space-y-6 leading-7">
                            {[
                              {
                                objective: "O1 提升门户办公应用体验",
                                keyResults: [
                                  {
                                    kr: "KR1 完成工作汇报与OKR联动能力",
                                    owners: [MAIN_USER_NAME, getDemoPerson(5)],
                                    progress: `基于${MAIN_USER_NAME}本周汇报，看汇报列表、详情弹框、关联KR展示已完成；${getDemoPerson(5)}补充了已读情况和评论流程。`,
                                  },
                                  {
                                    kr: "KR2 完成汇报统计和助手浮层",
                                    owners: [getDemoPerson(5), getDemoPerson(6)],
                                    progress: "汇报统计明细已按日期展示，如意工作参谋师已支持按自定义时间和人员生成总结，剩余是筛选口径细化。",
                                  },
                                ],
                              },
                              {
                                objective: "O2 完善如意空间公文创作链路",
                                keyResults: [
                                  {
                                    kr: "KR1 完成公文大纲、模板和最终文件流程",
                                    owners: [getDemoPerson(6), getDemoPerson(7)],
                                    progress: `${getDemoPerson(6)}的汇报显示模板预览、管理后台字段已连通；${getDemoPerson(7)}跟进了最终文件生成和参考文件状态。`,
                                  },
                                  {
                                    kr: "KR2 统一新版、旧版如意助手入口",
                                    owners: [MAIN_USER_NAME, getDemoPerson(7)],
                                    progress: "新版常用助手已整合为如意工作参谋师，旧版已增加IT服务助手入口，交互已可预览。",
                                  },
                                ],
                              },
                            ].map((objective) => (
                              <div key={objective.objective}>
                                <div className="mb-2 font-semibold text-gray-950 dark:text-white">{objective.objective}</div>
                                <ol className="list-decimal space-y-3 pl-6">
                                  {objective.keyResults.map((item) => (
                                    <li key={item.kr}>
                                      <div className="font-semibold text-gray-900 dark:text-white">{item.kr}</div>
                                      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">执行人：{item.owners.join(' / ')}</div>
                                      <p className="mt-1"><span className="font-semibold">当前进展：</span>{item.progress}</p>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            ))}
                          </div>
                          <Link to="/web_client/okr?assistant=assessment&source=ruyi-zone" className="mb-6 inline-flex rounded-lg bg-theme-50 px-4 py-2 text-sm font-semibold text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300">打开 OKR 页面继续调整</Link>
                        </>
                      )}

                      {conversationKind === "presentationDraft" && (
                        <>
                          <p className="mb-4 leading-7">
                            好的，我先根据您的主题生成PPT执行方案。请确认方案是否合适，也可以直接告诉我需要怎么调整。
                          </p>
                          <div className="mb-5 border-b border-gray-200 pb-2 dark:border-gray-700">
                            <h3 className="flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white">
                              <PresentationIcon size={24} className="text-theme-500" />
                              PPT执行方案
                            </h3>
                          </div>

                          <div className="mb-4 rounded-xl border border-theme-100 bg-theme-50/60 p-4 text-sm leading-6 text-gray-700 dark:border-theme-900/30 dark:bg-theme-900/20 dark:text-gray-200">
                            <div className="font-semibold text-gray-950 dark:text-white">{presentationTitle || 'AI赋能企业效率革新'}</div>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              <span>创建方式：{presentationModes.find((mode) => mode.id === pptMode)?.name}</span>
                              <span>页数：{pptMode === 'single' ? '单页' : pptPageCount}</span>
                              <span>受众：{pptAudience}</span>
                              <span>场景：{pptScene}</span>
                              <span>语气：{pptTone}</span>
                              <span>语言：{pptLanguage}</span>
                            </div>
                          </div>

                          <ol className="mb-6 list-decimal space-y-2 pl-6 leading-7">
                            {presentationOutline.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ol>

                          {pptAttachments.length > 0 && (
                            <div className="mb-6 rounded-xl border border-gray-100 bg-white/80 p-4 text-sm leading-6 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                              <div className="mb-2 font-semibold text-gray-950 dark:text-white">参考文档</div>
                              <ul className="list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-300">
                                {pptAttachments.map((attachment) => (
                                  <li key={attachment}>{attachment}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {presentationAdjustments.length > 0 && !presentationReady && (
                            <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-100">
                              <div className="mb-2 font-semibold">已收到您的调整意见：</div>
                              <ul className="list-disc space-y-1 pl-5">
                                {presentationAdjustments.map((item, index) => (
                                  <li key={`${item}-${index}`}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {!presentationReady && (
                            <div className="mb-6 flex flex-wrap gap-3">
                              <button
                                onClick={() => {
                                  setPresentationConfirmMessage("确认方案，生成PPT草稿");
                                  setPresentationReady(true);
                                }}
                                className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-theme-700"
                              >
                                确认方案，生成PPT草稿
                              </button>
                              <span className="self-center text-sm text-gray-500 dark:text-gray-400">也可以在下方对话框输入调整意见。</span>
                            </div>
                          )}
                        </>
                      )}
                      {conversationKind === "documentDraft" && (
                        <>
                          <p className="mb-4 leading-7">
                            好的，我先根据您的主题生成公文写作大纲。请您确认大纲是否合适，也可以直接告诉我需要怎么调整。
                          </p>
                          <div className="mb-5 border-b border-gray-200 pb-2 dark:border-gray-700">
                            <h3 className="flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white">
                              <FileTextIcon size={24} className="text-theme-500" />
                              公文大纲生成
                            </h3>
                          </div>

                          <div className="mb-6 space-y-4">
                            {[
                              { title: "一、背景说明", desc: "说明发文背景、建设目标和当前协同办公需求。" },
                              { title: "二、主要内容", desc: "围绕智能信息汇聚、任务协同、流程处理和知识服务展开。" },
                              { title: "三、推进安排", desc: "明确责任部门、时间节点、培训安排和上线要求。" },
                              { title: "四、工作要求", desc: "强调组织保障、数据安全、使用反馈和持续优化机制。" },
                            ].map((item) => (
                              <div key={item.title} className="rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                                <div className="font-semibold text-gray-950 dark:text-white">{item.title}</div>
                                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.desc}</p>
                              </div>
                            ))}
                          </div>

                          {outlineAdjustments.length > 0 && !documentReady && (
                            <div className="mb-6 rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-100">
                              <div className="mb-2 font-semibold">已收到您的调整意见：</div>
                              <ul className="list-disc space-y-1 pl-5">
                                {outlineAdjustments.map((item, index) => (
                                  <li key={`${item}-${index}`}>{item}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {!documentReady && (
                            <div className="mb-6 flex flex-wrap gap-3">
                              <button
                                onClick={() => {
                                  setDocumentConfirmMessage("确认，生成公文");
                                  setDocumentReady(true);
                                }}
                                className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-theme-700"
                              >
                                确认大纲，生成公文
                              </button>
                              <span className="self-center text-sm text-gray-500 dark:text-gray-400">也可以在下方对话框输入调整意见。</span>
                            </div>
                          )}

                        </>
                      )}

                      {conversationKind === "documentValidation" && (
                        <>
                          <p className="mb-4 leading-7">
                            已完成公文校验，本次按“错别字”和“标点使用不正确”两项规则检查。
                          </p>
                          <div className="mb-5 border-b border-gray-200 pb-2 dark:border-gray-700">
                            <h3 className="flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white">
                              <FileTextIcon size={24} className="text-theme-500" />
                              {documentValidationSummary.title}
                            </h3>
                          </div>
                          <div className="mb-4 grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-gray-100 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-800/80">
                              <div className="text-2xl font-bold text-gray-950 dark:text-white">{documentValidationSummary.total}</div>
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">发现问题</div>
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-800/80">
                              <div className="text-2xl font-bold text-theme-700 dark:text-theme-300">{documentValidationSummary.typoCount}</div>
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">错别字</div>
                            </div>
                            <div className="rounded-xl border border-gray-100 bg-white/80 p-4 dark:border-gray-700 dark:bg-gray-800/80">
                              <div className="text-2xl font-bold text-amber-600">{documentValidationSummary.punctuationCount}</div>
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">标点问题</div>
                            </div>
                          </div>
                          <div className="mb-5 space-y-3">
                            {documentValidationIssues.map((issue) => (
                              <div key={issue.id} className="rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                  <span className="rounded bg-theme-50 px-2 py-0.5 text-xs font-semibold text-theme-700 dark:bg-theme-900/30 dark:text-theme-300">{issue.label}</span>
                                  <span className="text-xs text-gray-400">{issue.position}</span>
                                </div>
                                <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">原文：{issue.excerpt}</p>
                                <p className="mt-1 text-sm leading-6 text-theme-700 dark:text-theme-300">建议：{issue.suggestion}</p>
                              </div>
                            ))}
                          </div>
                          <p className="mb-4 leading-7">{documentValidationSummary.conclusion}</p>
                          <button
                            onClick={() => {
                              setDocumentMode("validation");
                              setEmbedEditorInRuyiZone(true);
                              setLegacyEditorStartsInRequirements(false);
                              setLegacyEditorStartsInOutline(false);
                              setEditorSessionId((current) => current + 1);
                              setShowEditor(true);
                            }}
                            className="mb-6 inline-flex items-center gap-2 rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-theme-700"
                          >
                            <FileTextIcon size={16} />
                            进入校验工作台
                          </button>
                        </>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
                        <button className="inline-flex items-center gap-1 hover:text-theme-500">
                          <Copy size={16} />
                          复制
                        </button>
                        <button className="hover:text-theme-500">有用</button>
                        <button className="hover:text-theme-500">没用</button>
                        <button className="inline-flex items-center gap-1 hover:text-theme-500">
                          <RotateCcw size={16} />
                          重新生成
                        </button>
                      </div>
                    </div>
                  </div>
                  {conversationKind === "goalAssistant" && showReportSubmitTargets && (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-2xl rounded-2xl bg-theme-50 px-5 py-4 text-gray-900 shadow-sm dark:bg-theme-900/20 dark:text-white">
                          全局提交工作汇报
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <img
                          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20astronaut%20avatar%20in%20space%2C%20clean%20design%2C%20blue%20and%20white%20color%20scheme%2C%20futuristic%20style&image_size=square_hd"
                          alt="如意助手"
                          className="mt-1 h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        />
                        <div className="max-w-3xl flex-1 text-gray-900 dark:text-gray-100">
                          <p className="mb-4 leading-7">已调用接口：获取汇报提交对象。请选择本次工作汇报需要提交或抄送的对象。</p>
                          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">来源：工作汇报提交对象接口，已选 {selectedReportSubmitTargets.length} 人。</div>
                          <div className="mb-5 divide-y divide-gray-100 border-y border-gray-100 dark:divide-gray-700 dark:border-gray-700">
                            {reportSubmitTargets.map((target) => {
                              const selected = selectedReportSubmitTargets.includes(target.id);
                              return (
                                <button
                                  key={target.id}
                                  type="button"
                                  disabled={reportSubmitDone}
                                  onClick={() => toggleReportSubmitTarget(target.id)}
                                  className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:text-theme-700 disabled:cursor-default dark:hover:text-theme-300"
                                >
                                  <span className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border text-[10px] ${selected ? 'border-theme-600 bg-theme-600 text-white' : 'border-gray-300 text-transparent'}`}>?</span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block font-semibold text-gray-950 dark:text-white">{target.name}</span>
                                    <span className="block text-xs leading-5 text-gray-500 dark:text-gray-400">{target.department} · {target.role} · {target.type}</span>
                                  </span>
                                  <span className="text-xs text-gray-400">{selected ? '已选' : '未选'}</span>
                                </button>
                              );
                            })}
                          </div>
                          {!reportSubmitDone && (
                            <button
                              onClick={handleSubmitWorkReport}
                              disabled={selectedReportSubmitTargets.length === 0}
                              className="mb-6 rounded-lg bg-theme-50 px-4 py-2 text-sm font-semibold text-theme-700 transition-colors hover:bg-theme-100 disabled:cursor-not-allowed disabled:text-gray-400 dark:bg-theme-900/20 dark:text-theme-300"
                            >
                              确认对象，提交工作汇报
                            </button>
                          )}
                        </div>
                      </div>
                      {reportSubmitDone && (
                        <>
                          <div className="flex justify-end">
                            <div className="max-w-2xl rounded-2xl bg-theme-50 px-5 py-4 text-gray-900 shadow-sm dark:bg-theme-900/20 dark:text-white">
                              提交给 {reportSubmitTargets.filter((target) => selectedReportSubmitTargets.includes(target.id)).map((target) => target.name).join(' / ')}
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <img
                              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20astronaut%20avatar%20in%20space%2C%20clean%20design%2C%20blue%20and%20white%20color%20scheme%2C%20futuristic%20style&image_size=square_hd"
                              alt="如意助手"
                              className="mt-1 h-10 w-10 flex-shrink-0 rounded-full object-cover"
                            />
                            <div className="max-w-3xl flex-1 text-gray-900 dark:text-gray-100">
                              <p className="mb-4 leading-7">已调用提交接口，工作汇报已提交。</p>
                              <p className="mb-6 leading-7">后续可在“看汇报”中查看详情、评论和已读情况。</p>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {conversationKind === "presentationDraft" && presentationReady && (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-2xl rounded-2xl bg-theme-50 px-5 py-4 text-gray-900 shadow-sm dark:bg-theme-900/20 dark:text-white">
                          {presentationConfirmMessage || "确认方案，生成PPT草稿"}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <img
                          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20astronaut%20avatar%20in%20space%2C%20clean%20design%2C%20blue%20and%20white%20color%20scheme%2C%20futuristic%20style&image_size=square_hd"
                          alt="如意助手"
                          className="mt-1 h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        />
                        <div className="max-w-3xl flex-1 text-gray-900 dark:text-gray-100">
                          <p className="mb-4 leading-7">已根据您确认的执行方案生成PPT草稿，您可以点击下方入口进入编辑预览页面继续调整。</p>
                          <button
                            onClick={() => {
                              setShowPresentationEditor(true);
                            }}
                            className="mb-6 flex w-full max-w-2xl items-stretch overflow-hidden rounded-xl border border-theme-100 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-theme-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                          >
                            <div className="flex w-24 flex-shrink-0 items-center justify-center bg-gradient-to-br from-theme-500 to-theme-700 text-white">
                              <PresentationIcon size={34} />
                            </div>
                            <div className="flex-1 p-5">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="rounded bg-theme-50 px-2 py-0.5 text-xs font-medium text-theme-700 dark:bg-theme-900/30 dark:text-theme-300">PPT草稿</span>
                                <span className="text-xs text-gray-400">{pptMode === 'single' ? '单页' : pptPageCount} · {pptAudience}</span>
                              </div>
                              <h4 className="text-lg font-bold text-gray-950 dark:text-white">{presentationTitle || "AI赋能企业效率革新"}</h4>
                              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">已生成 {pptMode === 'single' ? 1 : presentationSlides.length} 页演示结构和页面预览，点击进入PPT编辑预览继续完善。</p>
                              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-theme-700 dark:text-theme-300">
                                进入编辑预览
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                  {conversationKind === "documentDraft" && documentReady && (
                    <>
                      <div className="flex justify-end">
                        <div className="max-w-2xl rounded-2xl bg-theme-50 px-5 py-4 text-gray-900 shadow-sm dark:bg-theme-900/20 dark:text-white">
                          {documentConfirmMessage || "确认，生成公文"}
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <img
                          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20astronaut%20avatar%20in%20space%2C%20clean%20design%2C%20blue%20and%20white%20color%20scheme%2C%20futuristic%20style&image_size=square_hd"
                          alt="如意助手"
                          className="mt-1 h-10 w-10 flex-shrink-0 rounded-full object-cover"
                        />
                        <div className="max-w-3xl flex-1 text-gray-900 dark:text-gray-100">
                          <p className="mb-4 leading-7">已根据您确认的大纲生成公文草稿，您可以点击下方入口进入编辑页面继续完善。</p>
                          <button
                            onClick={() => {
                              setEmbedEditorInRuyiZone(true);
                              setLegacyEditorStartsInRequirements(false);
                              setLegacyEditorStartsInOutline(false);
                              setEditorSessionId((current) => current + 1);
                              setShowEditor(true);
                            }}
                            className="mb-6 flex w-full max-w-2xl items-stretch overflow-hidden rounded-xl border border-theme-100 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-theme-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                          >
                            <div className="flex w-24 flex-shrink-0 items-center justify-center bg-gradient-to-br from-theme-500 to-theme-700 text-white">
                              <FileTextIcon size={34} />
                            </div>
                            <div className="flex-1 p-5">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="rounded bg-theme-50 px-2 py-0.5 text-xs font-medium text-theme-700 dark:bg-theme-900/30 dark:text-theme-300">公文草稿</span>
                                <span className="text-xs text-gray-400">{docType} · {docLength} 字</span>
                              </div>
                              <h4 className="text-lg font-bold text-gray-950 dark:text-white">{docTitle || "如意空间智能办公建设通知"}</h4>
                              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">已生成正文结构和初稿内容，点击进入公文编辑器继续润色、排版和保存。</p>
                              <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-theme-700 dark:text-theme-300">
                                进入公文编辑
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {!hasConversation && (
              selectedAssistant?.name === "IT服务助手" ? renderItServiceLanding() : (
              <>
              {/* 欢迎区域 */}
              <div className="flex flex-col md:flex-row items-center justify-between mb-16 mt-4 relative">
                {/* 背景装饰 */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-r from-theme-100 to-theme-50 rounded-full opacity-70"></div>
                <div className="absolute -bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-full opacity-70"></div>

                <div className="mb-8 md:mb-0 relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Hi，{MAIN_USER_NAME}</h2>
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300">欢迎回到如意空间，有什么可以帮您的吗？</p>
                </div>
                <div className="relative z-10">
                  <div className="absolute -top-4 -left-4 w-40 h-40 bg-gradient-to-r from-theme-200 to-theme-100 rounded-full opacity-70 animate-pulse"></div>
                  <img
                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20astronaut%20avatar%20in%20space%2C%20clean%20design%2C%20blue%20and%20white%20color%20scheme%2C%20futuristic%20style&image_size=square_hd"
                    alt="如意助手"
                    className="relative z-10 w-32 md:w-40 h-32 md:h-40 object-cover rounded-full border-4 border-white shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-105"
                  />
                </div>
              </div>

              {/* 工具按钮 */}
              <div className="flex flex-wrap gap-4 mb-16">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    className={`inline-flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-300 group ${activeTool === tool.name ? 'bg-theme-50 dark:bg-theme-900/20 ring-2 ring-theme-200' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                    onClick={() => {
                      setActiveTool(activeTool === tool.name ? null : tool.name);
                      setInput('');
                    }}
                  >
                    <div className={`w-8 h-8 bg-gradient-to-br ${tool.color} rounded flex items-center justify-center text-white shadow-sm group-hover:shadow transition-all duration-300 transform group-hover:scale-105`}>
                      {tool.icon}
                    </div>
                    <div className="text-center">
                      <h4 className={`text-sm font-medium ${activeTool === tool.name ? 'text-theme-700 dark:text-theme-300' : 'text-gray-900 dark:text-gray-200'}`}>{tool.name}</h4>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-16 relative">
                <div className={`relative min-h-[168px] border-2 rounded-2xl p-5 md:p-6 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300 ${activeTool ? 'border-theme-200 ring-1 ring-theme-100' : 'border-gray-100 dark:border-gray-700'}`}>
                  {activeTool === '公文' && (
                    <div className="pr-24">
                      <div className="mb-3 flex items-center">
                        {renderDocumentModeSwitch()}
                      </div>
                      {documentMode === "validation" ? (
                        renderDocumentValidationInputPanel()
                      ) : (
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="请输入写作主题或需求..."
                          className="min-h-[86px] w-full resize-none border-none bg-transparent text-base leading-7 text-gray-900 outline-none placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
                        />
                      )}
                    </div>
                  )}

                  {activeTool === 'PPT' && (
                    <div className="flex items-start gap-3 pr-24">
                      <div className="flex items-center gap-2 rounded-full bg-theme-50 px-3 py-1.5 text-sm font-medium text-theme-700 dark:bg-theme-900/30 dark:text-theme-300">
                        <PresentationIcon size={14} />
                        AI演示
                      </div>
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="请输入PPT主题或创作要求..."
                        className="min-h-[110px] flex-1 resize-none border-none bg-transparent text-base leading-7 text-gray-900 outline-none placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
                      />
                    </div>
                  )}

                  {activeTool && activeTool !== '公文' && activeTool !== 'PPT' && (
                    <div className="flex items-start gap-3 pr-24">
                      <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                        {tools.find((tool) => tool.name === activeTool)?.icon}
                        {activeTool}
                      </div>
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`请输入${activeTool}需求...`}
                        className="min-h-[110px] flex-1 resize-none border-none bg-transparent text-base leading-7 text-gray-900 outline-none placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
                      />
                    </div>
                  )}

                  {!activeTool && (
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="你想问我什么呢？"
                      className="min-h-[112px] w-full resize-none border-none bg-transparent pr-24 text-lg font-medium leading-8 text-gray-900 outline-none placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
                    />
                  )}

                  <div className="absolute right-4 bottom-4 flex items-center gap-2">
                    <button
                      onClick={handleUploadAttachment}
                      className="text-gray-400 dark:text-gray-500 hover:text-theme-500 transition-colors p-1 rounded-full hover:bg-theme-50 dark:hover:bg-theme-900/20"
                      title="上传附件"
                    >
                      <Paperclip size={18} />
                    </button>
                    <button
                      className="bg-gradient-to-r from-theme-500 to-theme-600 text-white p-2 rounded-full hover:from-theme-600 hover:to-theme-700 transition-all duration-300 shadow-sm hover:shadow transform hover:scale-105"
                      onClick={handleSend}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>

                {activeTool === '公文' && (
                  <div className="mt-4 space-y-4 rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
                    {documentMode === "validation" && renderDocumentValidationSettings()}
                    <div className={`${documentMode === "writing" ? "grid" : "hidden"} grid-cols-1 gap-3 lg:grid-cols-2`}>
                      <label className="block">
                        <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">公文类型</span>
                        <select
                          value={docType}
                          onChange={(e) => {
                            const nextCategory = e.target.value;
                            setDocType(nextCategory);
                            const nextTemplate = documentTemplates.find(template => template.category === nextCategory);
                            if (nextTemplate) setSelectedTemplate(nextTemplate.id);
                          }}
                          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          {templateCategories.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">字数选择</span>
                        <select
                          value={docLength}
                          onChange={(e) => setDocLength(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          {lengthOptions.map((length) => (
                            <option key={length} value={length}>{length} 字</option>
                          ))}
                        </select>
                      </label>
                      <label className="block lg:col-span-2">
                        <span className="mb-1 block text-sm text-gray-500 dark:text-gray-400">文章标题</span>
                        <input
                          value={docTitle}
                          onChange={(e) => setDocTitle(e.target.value)}
                          className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                          placeholder="请输入文章标题"
                        />
                      </label>
                    </div>

                    {documentMode === "writing" && docAttachments.length > 0 && (
                      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/60">
                        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">已上传附件</div>
                        <div className="space-y-1.5">
                          {docAttachments.map((attachment) => (
                            <div key={attachment} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                              <Paperclip size={14} className="flex-shrink-0 text-theme-500" />
                              <span className="truncate">{attachment}</span>
                              <button
                                onClick={() => handleRemoveAttachment(attachment)}
                                className="ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500 dark:hover:bg-gray-600"
                                title="删除附件"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={documentMode === "writing" ? "" : "hidden"}>
                      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">选择公文模板</div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredDocumentTemplates.map((template) => (
                          <div
                            key={template.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleDocumentTemplateSelect(template)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                handleDocumentTemplateSelect(template);
                              }
                            }}
                            className={`group overflow-hidden rounded-lg border bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 ${
                              selectedTemplate === template.id ? `${template.border} ring-2 ring-theme-200` : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                              <div className="relative h-24 bg-gray-50 p-3 dark:bg-gray-700/70">
                                <div className={`mb-2 h-1.5 w-16 rounded-full ${template.accent}`} />
                                <div className="mx-auto h-full max-w-[82px] rounded-sm bg-white p-2 shadow-sm">
                                  <div className={`mx-auto mb-2 h-1 w-10 rounded-full ${template.accent}`} />
                                  <div className="space-y-1.5">
                                    <div className="h-1 rounded bg-gray-300" />
                                    <div className="h-1 rounded bg-gray-200" />
                                    <div className="h-1 rounded bg-gray-200" />
                                    <div className="h-1 w-2/3 rounded bg-gray-200" />
                                  </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/0 opacity-0 transition-all group-hover:bg-gray-900/35 group-hover:opacity-100">
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setActiveTemplateCategory(template.category);
                                      setPreviewTemplateId(template.id);
                                    }}
                                    className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-md transition-colors hover:bg-white"
                                  >
                                    预览模板
                                  </button>
                                </div>
                              </div>
                              <div className="p-3 pb-2">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{template.name}</div>
                                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{template.desc}</div>
                              </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTool === 'PPT' && renderPresentationSettings()}

                {!activeTool && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-theme-100/70 bg-white/75 shadow-[0_14px_36px_rgba(148,76,126,0.08)] backdrop-blur dark:border-theme-900/40 dark:bg-gray-800/75">
                    <div className="grid gap-0 md:grid-cols-[150px_1fr]">
                      <div className="flex items-center gap-2 border-b border-theme-50 bg-gradient-to-br from-theme-50 to-white px-4 py-3 md:border-b-0 md:border-r dark:border-theme-900/40 dark:from-theme-900/25 dark:to-gray-800">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-theme-600 text-white shadow-sm">
                          <Sparkles size={14} />
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-theme-700 dark:text-theme-300">猜你想问</div>
                          <div className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">快速开始</div>
                        </div>
                      </div>
                      <div className="grid gap-px bg-theme-50/80 p-px dark:bg-gray-700/60 sm:grid-cols-2 xl:grid-cols-4">
                      {suggestedPrompts.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => setInput(prompt)}
                          className="group flex min-h-[52px] items-center justify-between gap-3 bg-white px-3 py-2 text-left text-xs font-medium leading-5 text-gray-600 transition-colors hover:bg-theme-50 hover:text-theme-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-theme-900/25 dark:hover:text-theme-300"
                        >
                          <span className="line-clamp-2">{prompt}</span>
                        </button>
                      ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {previewTemplateId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-3 sm:p-4">
                  <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white p-4 shadow-2xl dark:bg-gray-800 sm:p-5">
                    <div className="mb-4 flex flex-shrink-0 items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-950 dark:text-white">模板选择</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">选择分类并查看模板具体内容</p>
                      </div>
                      <button onClick={() => setPreviewTemplateId(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex flex-shrink-0 flex-col gap-3 border-b border-gray-100 pb-4 dark:border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {templateCategories.map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              setActiveTemplateCategory(category);
                              const nextTemplate = documentTemplates.find(t => t.category === category);
                              if (nextTemplate) setPreviewTemplateId(nextTemplate.id);
                            }}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${activeTemplateCategory === category ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {filteredPreviewTemplates.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => setPreviewTemplateId(template.id)}
                            className={`flex min-w-[150px] items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${previewTemplateId === template.id ? `${template.border} bg-theme-50/40 dark:bg-theme-900/20` : 'border-gray-200 dark:border-gray-700'}`}
                          >
                            <div className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${template.accent}`} />
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{template.name}</div>
                              <div className="truncate text-xs text-gray-500 dark:text-gray-400">{template.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid min-h-0 flex-1 gap-4 overflow-hidden py-4 pr-1 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/60 sm:p-5">
                          <div className="mx-auto h-[52vh] min-h-[330px] max-h-[520px] w-full max-w-[380px] rounded bg-white px-6 py-7 shadow-lg sm:px-9 sm:py-10">
                            <div className="mb-4 text-right text-[10px] text-gray-400">吉祥航空办公规范模板</div>
                            <div className={`mx-auto mb-6 h-1.5 w-28 rounded ${previewTemplate.accent}`} />
                            <div className="mb-6 text-center text-lg font-bold tracking-normal text-gray-900 sm:text-xl">{previewTemplate.name}</div>
                            <div className="mb-6 space-y-3">
                              <div className="h-2.5 rounded bg-gray-300" />
                              <div className="h-2.5 rounded bg-gray-200" />
                              <div className="h-2.5 rounded bg-gray-200" />
                              <div className="h-2.5 w-4/5 rounded bg-gray-200" />
                            </div>
                            <div className="space-y-4">
                              {[
                                { label: "一、一级标题", width: "w-24", indent: "" },
                                { label: "（一）二级标题", width: "w-28", indent: "ml-4" },
                                { label: "1. 三级标题", width: "w-20", indent: "ml-8" },
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
                        <div className="flex min-h-0 flex-col rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                          <div className="mb-3 flex-shrink-0 text-sm font-semibold text-gray-700 dark:text-gray-200">模板内容</div>
                          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                            {templateLayoutRules.map((rule) => (
                              <div key={rule.label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/60">
                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{rule.label}</div>
                                <div className="mt-1 text-sm leading-5 text-gray-800 dark:text-gray-100">{rule.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    <div className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-700">
                      <Link to="/admin?section=ai-template" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">编辑模板</Link>
                      <div className="flex gap-2">
                        <button onClick={() => setPreviewTemplateId(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">取消</button>
                        <button
                          onClick={() => {
                            handleDocumentTemplateSelect(previewTemplate);
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

              </>
              )
              )}

            </div>
          </div>
          {hasConversation && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-white/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.04)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 md:px-8">
            <div className="mx-auto max-w-4xl">
              <div className={`relative border-2 rounded-xl p-5 md:p-6 shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 ${(activeTool === '公文' && conversationKind !== "documentDraft") || (activeTool === 'PPT' && conversationKind !== "presentationDraft") ? 'border-theme-200 ring-1 ring-theme-100' : 'border-gray-100 dark:border-gray-700'}`}>
                {activeTool === '公文' && conversationKind !== "documentDraft" && (
                  <div className="pr-24">
                    <div className="mb-2 flex items-center">
                      {renderDocumentModeSwitch()}
                    </div>
                    {documentMode === "validation" ? (
                      renderDocumentValidationInputPanel(true)
                    ) : (
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="请输入写作主题或需求..."
                        className="min-h-10 max-h-24 w-full resize-none border-none bg-transparent text-base leading-6 text-gray-900 outline-none placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
                      />
                    )}
                  </div>
                )}

                {conversationKind === "documentDraft" && (
                  <div className="pr-24">
                    <div className="mb-2 flex items-center">
                      <div className="flex shrink-0 items-center gap-2 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        <FileTextIcon size={13} />
                        AI公文
                      </div>
                    </div>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="继续向如意助手提问..."
                      className="min-h-10 max-h-24 w-full resize-none border-none bg-transparent text-base leading-6 text-gray-900 outline-none placeholder-gray-400 dark:text-white dark:placeholder-gray-500"
                    />
                  </div>
                )}

                {conversationKind === "presentationDraft" && (
                  <div className="flex items-center gap-3 flex-wrap pr-24">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium dark:bg-gray-700 dark:text-gray-300">
                      <PresentationIcon size={14} />
                      AI演示
                    </div>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="继续向如意助手提问..."
                      className="flex-1 min-w-[200px] border-none outline-none text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                )}
                {!activeTool && conversationKind !== "documentDraft" && conversationKind !== "presentationDraft" && (
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={hasConversation ? "继续向如意助手提问..." : "请选择左侧历史对话查看内容"}
                    className="w-full pr-24 border-none outline-none h-full text-lg font-medium bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                )}

                <div className="absolute right-4 bottom-4 flex items-center gap-2">
                  <button
                    onClick={handleUploadAttachment}
                    className="text-gray-400 dark:text-gray-500 hover:text-theme-500 transition-colors p-1 rounded-full hover:bg-theme-50 dark:hover:bg-theme-900/20"
                    title="上传附件"
                  >
                    <Paperclip size={18} />
                  </button>
                  <button
                    className="bg-gradient-to-r from-theme-500 to-theme-600 text-white p-2 rounded-full hover:from-theme-600 hover:to-theme-700 transition-all duration-300 shadow-sm hover:shadow transform hover:scale-105"
                    onClick={handleSend}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>

              {activeTool === '公文' && conversationKind !== "documentDraft" && documentMode === "writing" && (
                <div className="mt-3 flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">字数选择</span>
                    <select
                      value={docLength}
                      onChange={(e) => setDocLength(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-theme-200 cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.5rem_center]"
                    >
                      {lengthOptions.map((length) => (
                        <option key={length} value={length}>{length} 字</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="mt-2 text-center text-[11px] text-gray-400 dark:text-gray-500">
                内容AI辅助生成，请谨慎识别
              </div>
            </div>
          </div>
          )}
          </>
          )}
        </div>
        </div>{/* end flex-1 min-h-0 */}
      </div>
      )}
    </>

  );
}
