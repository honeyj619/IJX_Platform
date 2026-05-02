import { useState, useEffect } from "react";
import { Paperclip, Send, Sparkles, Clock, Bookmark, Calendar, Menu, X, Brain, Palette, Code, FileText as FileTextIcon, PresentationIcon, MessageCircle, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";

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
  { id: 1, name: "翻译助手", isActive: false, icon: <MessageCircle size={18} /> },
  { id: 2, name: "智能总结", isActive: false, icon: <FileTextIcon size={18} /> },
  { id: 3, name: "会议转译", isActive: false, icon: <Brain size={18} /> },
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
  { id: 1, name: "写作", icon: <FileTextIcon size={18} />, description: "智能文案生成", color: "from-blue-400 to-indigo-500" },
  { id: 2, name: "PPT", icon: <PresentationIcon size={18} />, description: "快速演示文稿", color: "from-orange-400 to-amber-500" },
  { id: 3, name: "代码", icon: <Code size={18} />, description: "编程助手", color: "from-green-400 to-emerald-500" },
  { id: 4, name: "设计", icon: <Palette size={18} />, description: "创意设计", color: "from-purple-400 to-violet-500" },
];

export default function RuYiZone() {
  const [input, setInput] = useState("");
  const [assistants, setAssistants] = useState<Assistant[]>(defaultAssistants);
  const [selectedAssistant, setSelectedAssistant] = useState(defaultAssistants[0]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      setInput("");
    }
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
    <Layout>
      <div className="flex h-full bg-gradient-to-br from-gray-50 via-white to-theme-50">
        {/* 移动端菜单按钮 */}
        {isMobile && (
          <button 
            className="fixed top-6 right-6 z-50 bg-white p-2 rounded-full shadow-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {/* 第二列：如意空间导航栏 */}
        <div className={`
          ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-64' : 'w-[280px] min-w-[240px]'}
          ${showSidebar || mobileMenuOpen ? 'flex' : 'hidden'}
          bg-white border-r border-gray-100 flex flex-col shadow-lg
          transition-transform duration-300 ease-in-out
          ${isMobile && mobileMenuOpen ? 'translate-x-0' : isMobile ? '-translate-x-full' : ''}
        `}>
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-theme-500 to-theme-600 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              如意空间
            </h3>
            <div className="space-y-1 mb-8">
              <h4 className="text-xs font-medium text-gray-500 mb-3 px-2 uppercase tracking-wider">常用智能助手</h4>
              {assistants.map((assistant) => (
                <div
                  key={assistant.id}
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all duration-300
                    ${selectedAssistant.id === assistant.id 
                      ? 'bg-theme-50 text-theme-700 font-medium border-l-4 border-theme-500'
                      : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-theme-200'
                    }
                  `}
                  onClick={() => handleAssistantSelect(assistant)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${selectedAssistant.id === assistant.id ? 'bg-theme-100 text-theme-600' : 'bg-gray-100 text-gray-500'}
                    `}>
                      {assistant.icon}
                    </div>
                    <span>{assistant.name}</span>
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
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">历史记录</h4>
            </div>
            <div className="space-y-3">
              {historyItems.map((item) => (
                <div key={item.id} className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-300 transform hover:-translate-x-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-gray-900 truncate">{item.title}</h5>
                      <span className="text-xs text-gray-400">{item.time}</span>
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
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Hi，梁吉力</h2>
                  <p className="text-lg md:text-xl text-gray-600">欢迎回到如意空间，有什么可以帮您的吗？</p>
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
                    className="inline-flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-all duration-300 group"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-br ${tool.color} rounded flex items-center justify-center text-white shadow-sm group-hover:shadow transition-all duration-300 transform group-hover:scale-105`}>
                      {tool.icon}
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-medium text-gray-900">{tool.name}</h4>
                    </div>
                  </button>
                ))}
              </div>

              {/* 问答对话框 */}
              <div className="mb-16 relative">
                <div className="relative border border-gray-100 rounded-xl p-5 md:p-6 h-40 md:h-48 shadow-sm bg-white hover:shadow-md transition-all duration-300">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="你想问我什么呢？"
                    className="w-full border-none outline-none h-full text-lg font-medium placeholder-gray-400"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button className="text-gray-400 hover:text-theme-500 transition-colors p-1 rounded-full hover:bg-theme-50">
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
              </div>

              {/* 猜你想问 */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-theme-500 to-theme-600 rounded flex items-center justify-center">
                    <Sparkles className="text-white" size={14} />
                  </div>
                  猜你想问
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id} 
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-theme-50 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                    >
                      <div className="w-8 h-8 bg-theme-100 rounded-full flex items-center justify-center text-theme-500">
                        {suggestion.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{suggestion.text}</div>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 hover:text-theme-500 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}