import { useState } from "react";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Undo, 
  Redo,
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

interface DocumentEditorProps {
  docType: string;
  docTitle: string;
  docLength: string;
  docContent: string;
  attachments?: string[];
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
    content: sampleContent,
    outline: formatOutlineText(defaultOutline),
  },
  {
    id: 'project-meeting-minutes',
    title: '项目推进会议纪要',
    type: '会议纪要',
    words: '960',
    updatedAt: '昨天 16:10',
    content: `会议时间：2026年6月15日 14:00\n会议地点：总部会议室A\n参会人员：项目组、业务代表、技术支持团队\n\n一、会议议题\n围绕项目当前推进情况、关键节点风险和后续协同事项进行讨论。\n\n二、会议结论\n项目整体进度可控，需重点跟进接口联调、上线验证和用户培训安排。\n\n三、待办事项\n1. 技术团队于本周内完成联调问题清单闭环。\n2. 业务团队补充试点部门反馈意见。\n3. 项目经理同步更新项目计划并提交评审。`,
    outline: `一、会议基本信息\n记录会议时间、地点、参会人员和会议背景。\n\n二、项目推进情况\n概述当前进度、已完成事项和主要风险。\n\n三、会议结论与待办\n明确结论、责任人和完成时间。`,
  },
  {
    id: 'party-study-plan',
    title: '党群学习活动方案',
    type: '党群',
    words: '1520',
    updatedAt: '6月12日',
    content: `为进一步强化理论学习成效，提升党群活动组织质量，拟开展主题学习活动。\n\n一、活动主题\n围绕理论学习、岗位实践和团队交流，组织专题学习与分享。\n\n二、活动安排\n活动分为集中学习、交流研讨和成果总结三个环节。\n\n三、工作要求\n各相关部门应高度重视，做好组织发动和材料准备，确保活动取得实效。`,
    outline: `一、活动背景\n说明开展学习活动的意义和目标。\n\n二、活动安排\n明确活动时间、对象、形式和主要环节。\n\n三、工作要求\n提出组织保障、材料归档和成果总结要求。`,
  },
];

export default function DocumentEditor({ docType, docTitle, docLength, docContent, attachments = [], startInRequirements = false, startInOutline = false, embedded = false, onRemoveAttachment, onBack }: DocumentEditorProps) {
  const [content, setContent] = useState(startInRequirements || startInOutline ? '' : sampleContent);
  const [requirementTitle, setRequirementTitle] = useState(docTitle || '未命名文档');
  const [requirementType, setRequirementType] = useState(templateCategories.includes(docType) ? docType : templateCategories[0]);
  const [requirementLength, setRequirementLength] = useState(docLength);
  const [requirementContent, setRequirementContent] = useState(docContent || (startInRequirements ? '' : '暂无补充要求'));
  const [selectedTemplate, setSelectedTemplate] = useState(
    (editorTemplates.find(template => template.category === docType) || editorTemplates[0]).id
  );
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [activeTemplateCategory, setActiveTemplateCategory] = useState(templateCategories[0]);
  const [activeTemplateFilter, setActiveTemplateFilter] = useState('全部');
  const [requirementsEditable, setRequirementsEditable] = useState(startInRequirements);
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
  const [documentSearch, setDocumentSearch] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [activeCategory, setActiveCategory] = useState('business');
  const [expandedSections, setExpandedSections] = useState({
    outline: false,
    structure: false,
    contentRef: false,
  });
  const [isSaved, setIsSaved] = useState(true);

  const toggleSection = (section: 'outline' | 'structure' | 'contentRef') => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredSavedDocuments = savedDocuments.filter((document) => {
    const keyword = documentSearch.trim().toLowerCase();
    if (!keyword) return true;
    return `${document.title} ${document.type} ${document.updatedAt}`.toLowerCase().includes(keyword);
  });

  const handleSave = () => {
    const trimmedTitle = requirementTitle.trim() || '未命名文档';
    const nextDocument = {
      id: selectedSavedDocumentId || `saved-${Date.now()}`,
      title: trimmedTitle,
      type: requirementType,
      words: `${content.length}`,
      updatedAt: '刚刚',
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
    setSelectedSavedDocumentId(document.id);
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
    setFinalFileReady(true);
    setOutlineDirty(false);
    setIsSaved(true);
  };

  const handleGenerateFinalFile = () => {
    setIsGeneratingFinalFile(true);
    window.setTimeout(() => {
      setIsGeneratingFinalFile(false);
      setFinalFileReady(true);
    }, 900);
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
  const filteredPreviewTemplates = editorTemplates.filter((template) => (
    template.category === activeTemplateCategory
  ));
  const attachmentPanel = attachments.length > 0 && (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium text-gray-700">已上传附件</div>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{attachments.length} 个</span>
      </div>
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div key={attachment} className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <Paperclip size={14} className="flex-shrink-0 text-theme-500" />
            <span className="truncate">{attachment}</span>
            {onRemoveAttachment && (
              <button
                onClick={() => onRemoveAttachment(attachment)}
                className="ml-auto flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500"
                title="删除附件"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const handleEditorTemplateSelect = (template: typeof editorTemplates[number]) => {
    setSelectedTemplate(template.id);
    setRequirementType(template.category);
    setIsSaved(false);
  };

  return (
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
        <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-gray-50/50 flex-wrap">
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <Undo size={16} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <Redo size={16} className="text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <select className="px-2 py-1 text-sm border-none bg-transparent hover:bg-gray-200 rounded-lg cursor-pointer">
            <option>段落</option>
            <option>标题1</option>
            <option>标题2</option>
            <option>标题3</option>
          </select>
          <select className="px-2 py-1 text-sm border-none bg-transparent hover:bg-gray-200 rounded-lg cursor-pointer">
            <option>STSongti</option>
            <option>SimSun</option>
            <option>Microsoft YaHei</option>
          </select>
          <select className="px-2 py-1 text-sm border-none bg-transparent hover:bg-gray-200 rounded-lg cursor-pointer">
            <option>小二</option>
            <option>二号</option>
            <option>小三</option>
            <option>四号</option>
          </select>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button 
            className={`p-2 rounded-lg transition-colors ${isBold ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setIsBold(!isBold)}
          >
            <Bold size={16} className={isBold ? 'text-gray-900' : 'text-gray-600'} />
          </button>
          <button 
            className={`p-2 rounded-lg transition-colors ${isItalic ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setIsItalic(!isItalic)}
          >
            <Italic size={16} className={isItalic ? 'text-gray-900' : 'text-gray-600'} />
          </button>
          <button 
            className={`p-2 rounded-lg transition-colors ${isUnderline ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setIsUnderline(!isUnderline)}
          >
            <Underline size={16} className={isUnderline ? 'text-gray-900' : 'text-gray-600'} />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <List size={16} className="text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <ListOrdered size={16} className="text-gray-600" />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button 
            className={`p-2 rounded-lg transition-colors ${textAlign === 'left' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setTextAlign('left')}
          >
            <AlignLeft size={16} className={textAlign === 'left' ? 'text-gray-900' : 'text-gray-600'} />
          </button>
          <button 
            className={`p-2 rounded-lg transition-colors ${textAlign === 'center' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setTextAlign('center')}
          >
            <AlignCenter size={16} className={textAlign === 'center' ? 'text-gray-900' : 'text-gray-600'} />
          </button>
          <button 
            className={`p-2 rounded-lg transition-colors ${textAlign === 'right' ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
            onClick={() => setTextAlign('right')}
          >
            <AlignRight size={16} className={textAlign === 'right' ? 'text-gray-900' : 'text-gray-600'} />
          </button>
        </div>

        {/* 编辑区域 */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">{requirementTitle || '文档标题'}</h1>
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setIsSaved(false);
            }}
            className={`min-h-[520px] w-full resize-none border-none bg-transparent text-gray-700 outline-none leading-relaxed ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''} text-${textAlign}`}
            placeholder="正文内容将在这里生成，也可以直接编辑..."
          />
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

        <div className="flex-1 overflow-y-auto p-4">
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
                      placeholder="搜索文件名、类型或更新时间"
                    />
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
                  {filteredSavedDocuments.map((item) => (
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
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{item.type}</span>
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{item.words} 字</span>
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{item.updatedAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          onClick={(event) => event.stopPropagation()}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-theme-100 bg-theme-50 px-2 py-1.5 text-xs font-medium text-theme-700 hover:bg-theme-100"
                        >
                          <Download size={13} />
                          下载
                        </button>
                        <button
                          onClick={(event) => event.stopPropagation()}
                          className="flex items-center justify-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                        >
                          <X size={13} />
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredSavedDocuments.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-8 text-center text-sm text-gray-400">
                      未找到匹配的公文
                    </div>
                  )}
                </div>
              </div>
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
                    className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-5 outline-none focus:ring-2 focus:ring-theme-200 disabled:bg-gray-50 disabled:text-gray-500"
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
                  className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-6 text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-theme-200"
                />
                <div className="text-xs leading-5 text-gray-400">
                  可直接在文本框中调整章节顺序、标题和说明，确认后将按当前大纲生成正文。
                </div>
              </div>
              )}
            </div>
            )}

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
                    className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm leading-6 text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-theme-200"
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
                {attachmentPanel}
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
                        {finalFileReady ? '可进入后续下载、归档或流转环节。' : '确认正文无误后，点击下方操作生成最终文件。'}
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
              <button
                onClick={handleGenerateFinalFile}
                disabled={isGeneratingFinalFile}
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-80 ${
                  outlineDirty ? 'border border-theme-200 bg-theme-50 text-theme-700 hover:bg-theme-100' : 'bg-theme-600 text-white hover:bg-theme-700'
                }`}
              >
                {isGeneratingFinalFile ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    正在生成最终公文文件
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    生成最终公文文件
                  </>
                )}
              </button>
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

            <div className="mt-4 flex flex-shrink-0 items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                编辑模板
              </button>
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
  );
}
