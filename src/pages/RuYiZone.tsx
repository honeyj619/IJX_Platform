import { useState, useEffect } from "react";
import { Paperclip, Send, Sparkles, Clock, Bookmark, Calendar, Menu, X, Brain, Code, FileText as FileTextIcon, PresentationIcon, Languages, Building2, MonitorCog, ArrowRight, Copy, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import DocumentEditor from "./DocumentEditor";

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
  | "documentDraft";

const defaultAssistants: Assistant[] = [
  { id: 1, name: "企业知识专家", isActive: false, icon: <Building2 size={18} /> },
  { id: 2, name: "IT服务助手", isActive: false, icon: <MonitorCog size={18} /> },
  { id: 3, name: "公文辅助助手", isActive: false, icon: <FileTextIcon size={18} /> },
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

const userAvatarUrl = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20beautiful%20woman%20avatar%2C%20modern%20style%2C%20confident%20expression%2C%20soft%20lighting%2C%20elegant%20appearance&image_size=square_hd";

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
    setDocAttachments((current) => [
      ...current,
      `公文参考附件${current.length + 1}.pdf`,
    ]);
  };

  const handleRemoveAttachment = (attachment: string) => {
    setDocAttachments((current) => current.filter((item) => item !== attachment));
  };

  const handleSend = () => {
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
  };

  const getHistoryAssistantName = (kind: ConversationKind) => {
    if (kind === "feedback") return "IT服务助手";
    if (kind === "knowledge" || kind === "operations") return "企业知识专家";
    if (kind === "documentDraft") return "公文辅助助手";
    return "";
  };

  const handleNewConversation = () => {
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setHasConversation(false);
    setSentQuestion("");
    setInput("");
    setActiveTool(null);
    setSelectedHistoryId(null);
    setSelectedAssistant(null);
    setAssistants(defaultAssistants);
    setConversationKind("pending");
    setDocumentReady(false);
    setDocumentConfirmMessage("");
    setOutlineAdjustments([]);
    setLegacyEditorStartsInRequirements(false);
    setLegacyEditorStartsInOutline(false);
  };

  const openLegacyDocumentAssistant = () => {
    const documentAssistant = defaultAssistants.find((assistant) => assistant.name === "公文辅助助手") || null;
    setActiveTool("公文");
    setConversationKind("documentDraft");
    setSelectedHistoryId(null);
    setSelectedAssistant(documentAssistant);
    setAssistants(defaultAssistants.map((assistant) => ({
      ...assistant,
      isActive: assistant.name === "公文辅助助手",
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

  const handleAssistantSelect = (assistant: Assistant) => {
    if (assistant.name === "公文辅助助手") {
      openLegacyDocumentAssistant();
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

  const handleLegacySend = () => {
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
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
      {docAttachments.length > 0 && (
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
      <div className="mt-4">
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
              翻译助手
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
              公文辅助助手
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
          {showEditor ? (
            <DocumentEditor
              key={`legacy-editor-${editorSessionId}`}
              docType={docType}
              docTitle={docTitle}
              docLength={docLength}
              docContent={docContent}
              attachments={docAttachments}
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
                alt="梁吉力"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span>hello，梁吉力</span>
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
            </div>

            <div className={`relative w-full max-w-[980px] rounded-xl border bg-white px-6 py-5 shadow-sm transition-all ${
              activeTool === "公文" ? "border-theme-200 ring-1 ring-theme-100" : "border-[#dddce6]"
            }`}>
              {activeTool === "公文" ? (
                <div className="flex items-center gap-3 pr-24">
                  <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-theme-500 to-theme-600 px-3 py-1.5 text-sm font-medium text-white">
                    <Sparkles size={14} />
                    AI写作
                  </div>
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="请输入写作主题或需求..."
                    className="h-24 min-w-0 flex-1 border-none bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
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
            {previewTemplateId && renderLegacyTemplatePreview()}

            {activeTool !== "公文" && (
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
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-theme-500 to-theme-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              如意空间
            </h3>
            <button
              onClick={() => setIsLegacyMode(true)}
              className="mb-3 flex w-full items-center justify-between rounded-lg border border-theme-100 bg-theme-50 px-3 py-2.5 text-sm font-semibold text-theme-700 transition-colors hover:bg-theme-100 dark:border-theme-900/40 dark:bg-theme-900/20 dark:text-theme-200 dark:hover:bg-theme-900/30"
            >
              <span>切换旧版</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={handleNewConversation}
              className="mb-6 flex w-full items-center justify-between rounded-lg border border-gray-100 bg-white px-3 py-2.5 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:border-theme-100 hover:bg-theme-50 hover:text-theme-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
            >
              <span>新对话</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-theme-600 text-sm leading-none text-white">+</span>
            </button>
            <div className="space-y-1 mb-8">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 px-2 uppercase tracking-wider">常用智能助手</h4>
              {assistants.map((assistant) => (
                <div
                  key={assistant.id}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-300
                    ${selectedAssistant?.id === assistant.id 
                      ? 'bg-theme-50 dark:bg-theme-900/20 text-theme-700 dark:text-theme-300 font-medium border-l-4 border-theme-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent hover:border-theme-200'
                    }
                  `}
                  onClick={() => handleAssistantSelect(assistant)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${selectedAssistant?.id === assistant.id ? 'bg-theme-100 dark:bg-theme-900/30 text-theme-600 dark:text-theme-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                    `}>
                      {assistant.icon}
                    </div>
                    <span className={selectedAssistant?.id === assistant.id ? '' : 'dark:text-gray-300'}>{assistant.name}</span>
                  </div>
                </div>
              ))}
            </div>
            <Link 
              to="/agent-square"
              className="block w-full bg-gradient-to-theme text-white py-3 rounded-lg hover:opacity-90 transition-all duration-300 text-center font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              前往智能体广场
              <ArrowRight size={16} className="inline ml-2" />
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">历史对话</h4>
            </div>
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-x-1
                    ${selectedHistoryId === item.id
                      ? 'bg-theme-50 dark:bg-theme-900/20 text-theme-700 dark:text-theme-300 border-l-4 border-theme-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 border-transparent hover:border-theme-200'
                    }
                  `}
                  onClick={() => handleHistorySelect(item)}
                >
                  <div className="min-w-0">
                    <h5 className={`truncate text-sm font-medium ${selectedHistoryId === item.id ? 'text-theme-700 dark:text-theme-300' : 'text-gray-900 dark:text-white'}`}>{item.title}</h5>
                    {getHistoryAssistantName(item.kind) && (
                      <span className="mt-1 block truncate text-xs text-gray-400 dark:text-gray-500">{getHistoryAssistantName(item.kind)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 第三列：如意空间内容区域 */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {showEditor && embedEditorInRuyiZone ? (
            <DocumentEditor
              key={`ruyi-editor-${editorSessionId}`}
              docType={docType}
              docTitle={docTitle}
              docLength={docLength}
              docContent={docContent}
              attachments={docAttachments}
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
                            <Link to="/knowledge?template=meeting-minutes" className="rounded-lg bg-theme-50 px-4 py-2 font-medium text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300">查看会议纪要模板</Link>
                            <Link to="/ruyi-zone?tool=document&scene=meeting-minutes" className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100">创建空白纪要</Link>
                          </div>
                        </>
                      )}

                      {conversationKind === "feedback" && (
                        <>
                          <p className="mb-4 leading-7">您的使用问题已反馈至系统负责人。</p>
                          <p className="mb-6 leading-7">我已记录您的问题描述，并同步给服务台跟进。您也可以进入服务台补充截图、影响范围或紧急程度。</p>
                          <Link to="/business?tab=service-desk&source=ruyi-zone" className="mb-6 inline-flex rounded-lg bg-theme-50 px-4 py-2 font-medium text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300">前往服务台查看处理进度</Link>
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
                          <Link to="/process?type=project-setup&source=ruyi-zone" className="mb-6 inline-flex rounded-lg bg-theme-50 px-4 py-2 font-medium text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300">发起项目立项申请</Link>
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
                            <li><span className="font-semibold">参与人：</span>张飞、关羽、诸葛亮</li>
                          </ul>
                          <div className="mb-6 flex flex-wrap gap-3">
                            <Link to="/calendar?action=create&source=ruyi-zone" className="rounded-lg bg-theme-50 px-4 py-2 font-medium text-theme-700 hover:bg-theme-100 dark:bg-theme-900/20 dark:text-theme-300">确认创建日程</Link>
                            <Link to="/calendar?action=edit&source=ruyi-zone" className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100">修改日程信息</Link>
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
                          <p className="mb-6 leading-7">整体表现良好。相关制度可查看 <Link to="/knowledge?doc=attendance-policy&source=ruyi-zone" className="font-semibold text-theme-700 underline-offset-4 hover:underline dark:text-theme-300">考勤管理制度 v2.3</Link>。</p>
                        </>
                      )}

                      {conversationKind === "closing" && (
                        <>
                          <p className="mb-4 leading-7">好的，很高兴为您服务。如有需要随时召唤我，祝您工作顺利！</p>
                          <p className="mb-6 leading-7">温馨提示：您今天还有 2 个待办事项，3 条待审批流程。</p>
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
                                <ArrowRight size={16} />
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
              <>
              {/* 欢迎区域 */}
              <div className="flex flex-col md:flex-row items-center justify-between mb-16 mt-4 relative">
                {/* 背景装饰 */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-r from-theme-100 to-theme-50 rounded-full opacity-70"></div>
                <div className="absolute -bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-blue-100 to-indigo-50 rounded-full opacity-70"></div>
                
                <div className="mb-8 md:mb-0 relative z-10">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Hi，梁吉力</h2>
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
                      if (tool.name === '公文') {
                        setActiveTool('公文');
                        setInput('');
                      } else {
                        setActiveTool(null);
                        setInput('');
                      }
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
                <div className={`relative border-2 rounded-xl p-5 md:p-6 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300 ${activeTool === '公文' ? 'border-theme-200 ring-1 ring-theme-100' : 'border-gray-100 dark:border-gray-700'}`}>
                  {activeTool === '公文' && (
                    <div className="flex items-center gap-3 flex-wrap pr-24">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-theme-500 to-theme-600 text-white rounded-full text-sm font-medium">
                        <Sparkles size={14} />
                        AI写作
                      </div>
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="请输入写作主题或需求..."
                        className="flex-1 min-w-[200px] border-none outline-none text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  )}

                  {!activeTool && (
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="你想问我什么呢？"
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

                {activeTool === '公文' && (
                  <div className="mt-4 space-y-4 rounded-xl border border-gray-100 bg-white/80 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800/70">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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

                    {docAttachments.length > 0 && (
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

                    <div>
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
              )}

            </div>
          </div>
          {hasConversation && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-white/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.04)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 md:px-8">
            <div className="mx-auto max-w-4xl">
              <div className={`relative border-2 rounded-xl p-5 md:p-6 shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 ${activeTool === '公文' && conversationKind !== "documentDraft" ? 'border-theme-200 ring-1 ring-theme-100' : 'border-gray-100 dark:border-gray-700'}`}>
                {activeTool === '公文' && conversationKind !== "documentDraft" && (
                  <div className="flex items-center gap-3 flex-wrap pr-24">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-theme-500 to-theme-600 text-white rounded-full text-sm font-medium">
                      <Sparkles size={14} />
                      AI写作
                    </div>
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="请输入写作主题或需求..."
                      className="flex-1 min-w-[200px] border-none outline-none text-base bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                )}

                {conversationKind === "documentDraft" && (
                  <div className="flex items-center gap-3 flex-wrap pr-24">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-medium dark:bg-gray-700 dark:text-gray-300">
                      <FileTextIcon size={14} />
                      AI公文
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

                {!activeTool && conversationKind !== "documentDraft" && (
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

              {activeTool === '公文' && conversationKind !== "documentDraft" && (
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
