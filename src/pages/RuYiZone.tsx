import { useState, useEffect } from "react";
import { Paperclip, Send, Sparkles, Clock, Bookmark, Calendar, Menu, X, Brain, Code, FileText as FileTextIcon, PresentationIcon, Languages, Building2, MonitorCog, ChevronRight, ArrowRight } from "lucide-react";
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
  icon: React.ReactNode;
}

interface Suggestion {
  id: number;
  text: string;
  icon: React.ReactNode;
  category: string;
}

interface Tool {
  id: number;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

const defaultAssistants: Assistant[] = [
  { id: 1, name: "企业知识专家", isActive: false, icon: <Building2 size={18} /> },
  { id: 2, name: "IT服务助手", isActive: false, icon: <MonitorCog size={18} /> },
];

const historyItems: HistoryItem[] = [
  { id: 1, title: "门户立项方案梳理", time: "今天 10:30", icon: <FileTextIcon size={16} /> },
  { id: 2, title: "休假管理手册内容查询", time: "昨天 15:45", icon: <Bookmark size={16} /> },
  { id: 3, title: "项目进度跟踪", time: "昨天 14:20", icon: <Calendar size={16} /> },
];

const suggestions: Suggestion[] = [
  { id: 1, text: "今日最新发文", icon: <FileTextIcon size={18} />, category: "文档" },
  { id: 2, text: "我的紧急待办", icon: <Clock size={18} />, category: "任务" },
  { id: 3, text: "生成今日航油报表", icon: <Bookmark size={18} />, category: "报表" },
  { id: 4, text: "梳理下周会议安排", icon: <Calendar size={18} />, category: "日程" },
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

export default function RuYiZone() {
  const [input, setInput] = useState("");
  const [assistants, setAssistants] = useState<Assistant[]>(defaultAssistants);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [docType, setDocType] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docLength, setDocLength] = useState("600-1200");
  const [docContent, setDocContent] = useState("");
  const [docScene, setDocScene] = useState("通用场景");
  const [showEditor, setShowEditor] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      setInput("");
    }
    if (activeTool === '公文') {
      setShowEditor(true);
    }
  };
  
  const handleBackFromEditor = () => {
    setShowEditor(false);
  };

  const handleAssistantSelect = (assistant: Assistant) => {
    // 更新选中状态
    const updatedAssistants = assistants.map(item => ({
      ...item,
      isActive: item.id === assistant.id
    }));
    setAssistants(updatedAssistants);
    setSelectedAssistant(assistant);
  };

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setShowSidebar(width >= 1024);
      if (width >= 768) {
        setMobileMenuOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {showEditor ? (
        <DocumentEditor 
          docType={docType} 
          docTitle={docTitle} 
          docLength={docLength} 
          docContent={docContent}
          onBack={handleBackFromEditor}
        />
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
              <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">历史记录</h4>
            </div>
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div key={item.id} className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-300 transform hover:-translate-x-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</h5>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 第三列：如意空间内容区域 */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="px-6 md:px-8 py-6 md:py-8 flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
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

              {/* 问答对话框 */}
              <div className="mb-16 relative">
                <div className={`relative border-2 rounded-xl p-5 md:p-6 shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-all duration-300 ${activeTool === '公文' ? 'border-theme-200 ring-1 ring-theme-100' : 'border-gray-100 dark:border-gray-700'}`}>
                  {/* 公文模式 */}
                  {activeTool === '公文' && (
                    <div className="flex items-center gap-3 flex-wrap">
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
                  
                  {/* 默认模式 */}
                  {!activeTool && (
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="你想问我什么呢？"
                      className="w-full border-none outline-none h-full text-lg font-medium bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  )}
                  
                  <div className="absolute right-4 bottom-4 flex items-center gap-2">
                    <button className="text-gray-400 dark:text-gray-500 hover:text-theme-500 transition-colors p-1 rounded-full hover:bg-theme-50 dark:hover:bg-theme-900/20">
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
                
                {/* 公文模式 - 输入框下部选项 */}
                {activeTool === '公文' && (
                  <div className="mt-3 flex items-center gap-4 flex-wrap">
                    {/* 场景选择 */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">场景选择</span>
                      <select
                        value={docScene}
                        onChange={(e) => setDocScene(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-theme-200 cursor-pointer appearance-none pr-8 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_0.5rem_center]"
                      >
                        {sceneOptions.map((scene) => (
                          <option key={scene} value={scene}>{scene}</option>
                        ))}
                      </select>
                    </div>
                    {/* 字数选择 */}
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
              </div>

              {/* 猜你想问 - 公文模式下不展示 */}
              {activeTool !== '公文' && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-theme-500 to-theme-600 rounded flex items-center justify-center">
                      <Sparkles className="text-white" size={14} />
                    </div>
                    猜你想问
                  </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-theme-50 dark:hover:bg-theme-900/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="w-8 h-8 bg-theme-100 dark:bg-theme-900/30 rounded-full flex items-center justify-center text-theme-500 dark:text-theme-400">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{suggestion.text}</div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 hover:text-theme-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
        </div>{/* end flex-1 min-h-0 */}
      </div>
      )}
    </>
    
  );
}