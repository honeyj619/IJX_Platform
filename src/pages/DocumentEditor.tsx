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
  FileText
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

export default function DocumentEditor({ docType, docTitle, docLength, docContent, onBack }: DocumentEditorProps) {
  const [content, setContent] = useState(sampleContent);
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

  const filteredTemplates = documentTypes.filter(t => t.category === activeCategory);

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
              <span className="font-medium text-gray-900">{docTitle || '未命名文档'}</span>
              {isSaved && (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Save size={12} />
                  保存成功
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <Plus size={16} />
              新建文档
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
              <span className="text-xs text-gray-600">安全模式</span>
              <div className="w-8 h-4 bg-green-500 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
              </div>
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
          <div className="flex-1" />
          <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
            <Type size={14} />
            排版
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">
            <FileText size={14} />
            清空内容
          </button>
        </div>

        {/* 编辑区域 */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">{docTitle || '文档标题'}</h1>
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

      {/* 右侧工作栏 - 高度自适应不滚动 */}
      <div className="w-80 flex flex-col bg-gray-50 border-l border-gray-200 h-full">
        {/* 公文类型选择 */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="doc-category" 
                value="official" 
                checked={activeCategory === 'official'}
                onChange={() => setActiveCategory('official')}
                className="text-theme-500"
              />
              <span className="text-sm text-gray-700">法定公文</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="doc-category" 
                value="business" 
                checked={activeCategory === 'business'}
                onChange={() => setActiveCategory('business')}
                className="text-theme-500"
              />
              <span className="text-sm text-gray-700">事务文书</span>
            </label>
          </div>
          
          {/* 模板按钮 */}
          <div className="grid grid-cols-4 gap-2">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                className={`px-2 py-1.5 text-xs rounded-lg text-center transition-colors ${
                  docType === template.name 
                    ? 'bg-theme-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>

        {/* 内容区域 - 占据剩余空间 */}
        <div className="flex flex-1 overflow-hidden">
          {/* AI写作工具 - 竖条样式 */}
          <div className="w-16 flex-shrink-0 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-3 gap-3">
            <div className="text-xs text-gray-500 mb-1" style={{ writingMode: 'vertical-rl' }}>AI写作</div>
            {aiTools.map((tool, index) => (
              <button
                key={tool.id}
                className="group relative"
                title={tool.name}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  index === 0 ? 'bg-theme-500 text-white' : 'bg-white text-gray-500 hover:bg-theme-100 hover:text-theme-600'
                }`}>
                  {tool.icon}
                </div>
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {tool.name}
                </span>
              </button>
            ))}
          </div>

          {/* 文章信息 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 文章标题 */}
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                文章标题
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setIsSaved(false)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-200"
                placeholder="请输入文章标题"
              />
            </div>

            {/* 文章篇幅 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">文章篇幅</label>
              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-theme-500 text-white text-sm rounded-lg">短</button>
                <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">中</button>
                <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">长</button>
                <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200">...</button>
              </div>
            </div>

            {/* 内容要求 */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">内容要求</label>
              <textarea
                value={docContent}
                onChange={(e) => setIsSaved(false)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-theme-200 resize-none"
                placeholder="请输入内容要求"
              />
            </div>

            {/* 大纲 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('outline')}
              >
                <span className="text-sm font-medium text-gray-700">大纲</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${expandedSections.outline ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.outline && (
                <div className="px-3 py-4 bg-white">
                  <p className="text-sm text-gray-500">点击"生成大纲"按钮生成文档大纲</p>
                </div>
              )}
            </div>

            {/* 添加结构风格参考 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('structure')}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700">添加结构风格参考</span>
                  <span className="text-xs text-gray-400">参考文稿的结构、逻辑框架和风格</span>
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${expandedSections.structure ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.structure && (
                <div className="px-3 py-4 bg-white">
                  <button className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    选择文稿
                  </button>
                </div>
              )}
            </div>

            {/* 添加内容参考 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('contentRef')}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700">添加内容参考</span>
                  <span className="text-xs text-gray-400">参考文稿的观点、案例和数据</span>
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${expandedSections.contentRef ? 'rotate-180' : ''}`} />
              </button>
              {expandedSections.contentRef && (
                <div className="px-3 py-4 bg-white">
                  <button className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    选择文稿
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 底部操作按钮 */}
        <div className="p-4 border-t border-gray-200 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} />
              换一换
            </button>
            <button className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Type size={14} />
              继续
            </button>
            <button className="flex-1 px-4 py-2 bg-theme-500 text-white text-sm rounded-lg hover:bg-theme-600 transition-colors">
              排版
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              生成大纲
            </button>
            <button className="px-4 py-2 bg-theme-500 text-white text-sm rounded-lg hover:bg-theme-600 transition-colors">
              生成全文
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}