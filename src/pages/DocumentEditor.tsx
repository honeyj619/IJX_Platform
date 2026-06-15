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
  Loader2
} from "lucide-react";

interface DocumentEditorProps {
  docType: string;
  docTitle: string;
  docLength: string;
  docContent: string;
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

export default function DocumentEditor({ docType, docTitle, docLength, docContent, onBack }: DocumentEditorProps) {
  const [content, setContent] = useState(sampleContent);
  const [requirementTitle, setRequirementTitle] = useState(docTitle || '未命名文档');
  const [requirementType, setRequirementType] = useState(templateCategories.includes(docType) ? docType : templateCategories[0]);
  const [requirementLength, setRequirementLength] = useState(docLength);
  const [requirementContent, setRequirementContent] = useState(docContent || '暂无补充要求');
  const [selectedTemplate, setSelectedTemplate] = useState(
    (editorTemplates.find(template => template.category === docType) || editorTemplates[0]).id
  );
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [activeTemplateCategory, setActiveTemplateCategory] = useState(templateCategories[0]);
  const [activeTemplateFilter, setActiveTemplateFilter] = useState('全部');
  const [requirementsEditable, setRequirementsEditable] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [outlineEditing, setOutlineEditing] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [requirementsConfirmed, setRequirementsConfirmed] = useState(true);
  const [outlineConfirmed, setOutlineConfirmed] = useState(true);
  const [outlineItems, setOutlineItems] = useState(defaultOutline);
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

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const generateOutlineDraft = () => {
    setContent('');
    setOutlineEditing(true);
    setRequirementsEditable(false);
    setRequirementsConfirmed(true);
    setOutlineConfirmed(false);
    setOutlineItems(defaultOutline.map((item, index) => ({
      title: item.title,
      desc: index === 0
        ? `围绕“${requirementTitle || '当前公文'}”补充背景、依据和目标。`
        : item.desc,
    })));
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
    setIsSaved(true);
  };

  const updateOutlineItem = (index: number, field: 'title' | 'desc', value: string) => {
    setOutlineItems(prev => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
    setIsSaved(false);
  };

  const filteredTemplates = documentTypes.filter(t => t.category === activeCategory);
  const selectedTemplateMeta = editorTemplates.find(t => t.id === selectedTemplate) || editorTemplates[0];
  const previewTemplateMeta = editorTemplates.find(t => t.id === previewTemplateId) || selectedTemplateMeta;
  const filteredPreviewTemplates = editorTemplates.filter((template) => (
    template.category === activeTemplateCategory
  ));

  const handleEditorTemplateSelect = (template: typeof editorTemplates[number]) => {
    setSelectedTemplate(template.id);
    setRequirementType(template.category);
    setIsSaved(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
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
              {isSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Save size={12} />
                  保存成功
                </span>
              )}
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
          <div className="prose prose-gray max-w-none">
            {content.split('\n').map((paragraph, index) => (
              <p 
                key={index} 
                className={`mb-6 text-gray-700 leading-relaxed ${isBold ? 'font-bold' : ''} ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''} text-${textAlign}`}
              >
                {paragraph}
              </p>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8 pt-4 border-t border-gray-100">
            以上内容为AI生成，仅供参考使用
          </p>
        </div>

        {/* 底部状态栏 */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            以上内容由AI生成，仅供参考
          </div>
          <div className="text-xs text-gray-500">
            {content.length} 个字
          </div>
        </div>
      </div>

      {/* 右侧当前公文信息 */}
      <div className="w-80 flex flex-col bg-gray-50 border-l border-gray-200 h-full">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-theme-100 text-theme-600">
              <FileText size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">当前公文</div>
              <div className="text-xs text-gray-500">仅显示本篇文档相关信息</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div className="rounded-lg border border-theme-100 bg-white p-3 shadow-sm">
              <div className="mb-3 text-sm font-medium text-gray-800">生成流程</div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className={`rounded-lg px-2 py-2 ${requirementsEditable ? 'bg-theme-600 text-white' : requirementsConfirmed ? 'bg-theme-50 text-theme-700' : 'bg-gray-100 text-gray-500'}`}>
                  调整要求
                </div>
                <div className={`rounded-lg px-2 py-2 ${outlineEditing || isGeneratingOutline ? 'bg-theme-600 text-white' : requirementsConfirmed ? 'bg-theme-50 text-theme-700' : 'bg-gray-100 text-gray-500'}`}>
                  {isGeneratingOutline ? '生成中' : '确认大纲'}
                </div>
                <div className={`rounded-lg px-2 py-2 ${outlineConfirmed ? 'bg-theme-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  生成正文
                </div>
              </div>
              <p className="mt-3 text-xs leading-5 text-gray-500">
                {requirementsEditable
                  ? '调整公文要求和模板，确认要求后生成大纲。'
                  : isGeneratingOutline
                    ? '如意助手正在根据已确认的要求生成大纲。'
                  : outlineEditing
                    ? '请检查并编辑大纲，确认后生成正文。'
                    : '正文已根据确认后的要求和大纲生成。'}
              </p>
            </div>

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

            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700">{isGeneratingOutline ? '生成大纲' : outlineEditing ? '编辑大纲' : '当前大纲'}</div>
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
              <div className="space-y-3">
                {outlineItems.map((item, index) => (
                  <div key={index} className="rounded-lg bg-gray-50 p-2">
                    {outlineEditing ? (
                      <div className="space-y-2">
                        <input
                          value={item.title}
                          onChange={(event) => updateOutlineItem(index, 'title', event.target.value)}
                          className="h-8 w-full rounded border border-gray-200 px-2 text-sm font-medium outline-none focus:ring-2 focus:ring-theme-200"
                        />
                        <textarea
                          value={item.desc}
                          onChange={(event) => updateOutlineItem(index, 'desc', event.target.value)}
                          rows={2}
                          className="w-full resize-none rounded border border-gray-200 px-2 py-1.5 text-sm leading-5 outline-none focus:ring-2 focus:ring-theme-200"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-semibold text-gray-800">{item.title}</div>
                        <div className="mt-1 text-xs leading-5 text-gray-500">{item.desc}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
          {isGeneratingOutline ? (
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
              确认要求生成大纲
            </button>
          ) : outlineEditing ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={generateOutlineDraft}
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                按要求重新生成
              </button>
              <button
                onClick={handleConfirmOutline}
                className="rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-theme-700"
              >
                确认大纲生成正文
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditRequirements}
              className="w-full rounded-lg border border-theme-200 bg-theme-50 px-3 py-2.5 text-sm font-medium text-theme-700 transition-colors hover:bg-theme-100"
            >
              调整要求
            </button>
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
