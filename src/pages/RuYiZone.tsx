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
  icon: React.ReactNode;
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
  | "closing";

const defaultAssistants: Assistant[] = [
  { id: 1, name: "企业知识专家", isActive: false, icon: <Building2 size={18} /> },
  { id: 2, name: "IT服务助手", isActive: false, icon: <MonitorCog size={18} /> },
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
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [docType, setDocType] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docLength, setDocLength] = useState("600-1200");
  const [docContent, setDocContent] = useState("");
  const [docScene, setDocScene] = useState("通用场景");
  const [showEditor, setShowEditor] = useState(false);
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

  const handleSend = () => {
    if (activeTool === '公文') {
      setShowEditor(true);
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

  const handleHistorySelect = (item: HistoryItem) => {
    setSentQuestion(item.question);
    setConversationKind(item.kind);
    setSelectedHistoryId(item.id);
    setHasConversation(true);
    setActiveTool(null);
    setInput("");
    if (isMobile) {
      setMobileMenuOpen(false);
    }
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
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${selectedHistoryId === item.id ? 'bg-theme-100 dark:bg-theme-900/30 text-theme-600 dark:text-theme-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                    `}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className={`text-sm font-medium truncate ${selectedHistoryId === item.id ? 'text-theme-700 dark:text-theme-300' : 'text-gray-900 dark:text-white'}`}>{item.title}</h5>
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

                {activeTool === '公文' && (
                  <div className="mt-3 flex items-center gap-4 flex-wrap">
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
              </>
              )}

            </div>
          </div>
          {hasConversation && (
          <div className="flex-shrink-0 border-t border-gray-100 bg-white/95 px-6 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.04)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 md:px-8">
            <div className="mx-auto max-w-4xl">
              <div className={`relative border-2 rounded-xl p-5 md:p-6 shadow-sm bg-white dark:bg-gray-800 transition-all duration-300 ${activeTool === '公文' ? 'border-theme-200 ring-1 ring-theme-100' : 'border-gray-100 dark:border-gray-700'}`}>
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
                    placeholder={hasConversation ? "继续向如意助手提问..." : "请选择左侧历史对话查看内容"}
                    className="w-full pr-24 border-none outline-none h-full text-lg font-medium bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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

              {activeTool === '公文' && (
                <div className="mt-3 flex items-center gap-4 flex-wrap">
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
          </div>
          )}
        </div>
        </div>{/* end flex-1 min-h-0 */}
      </div>
      )}
    </>
    
  );
}
