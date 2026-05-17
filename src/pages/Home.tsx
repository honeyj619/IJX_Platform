import {
  MessageSquare,
  Lock,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  XCircle,
  Hexagon,
  Inbox,
  FileText,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { MessageHeader } from "@/components/MessageHeader";
import { useLayoutStore } from "@/store/layoutStore";

interface CardContent {
  title: string;
  content: string;
  actions: {
    label: string;
    type: 'primary' | 'secondary';
  }[];
}

interface Message {
  id: number;
  name: string;
  avatar: string;
  message: string;
  time: string;
  unread?: number;
  icon?: React.ReactNode;
  type: 'normal' | 'process' | 'assistant' | 'system' | 'card';
  cardContent?: CardContent;
}

interface MessageItemProps {
  message: Message;
  onClick: () => void;
  isSelected?: boolean;
}

interface ProcessItem {
  id: number;
  title: string;
  applicant: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
}

const messages: Message[] = [
  {
    id: 1,
    name: "如意助手",
    avatar: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20astronaut%20avatar%20in%20space%2C%20clean%20design%2C%20blue%20and%20white%20color%20scheme%2C%20futuristic%20style&image_size=square_hd",
    message: "您的使用问题已反馈至系统负责人",
    time: "12:21",
    unread: 1,
    type: 'assistant',
  },
  {
    id: 2,
    name: "流程",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=流程&backgroundColor=8b5cf6",
    message: "信息管理部梁吉力提交的'项目立项申请'流...",
    time: "12:21",
    unread: 8,
    icon: <Hexagon className="w-10 h-10" />,
    type: 'process',
  },
  {
    id: 3,
    name: "日程",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=日程&backgroundColor=f97316",
    message: "今日有2个日程安排，明日有1个日程安排",
    time: "12:00",
    unread: 1,
    icon: <CalendarIcon className="w-10 h-10" />,
    type: 'card',
    cardContent: {
      title: "日程提醒",
      content: "今日和明日的日程安排如下",
      actions: [
        { label: "查看详情", type: 'primary' },
        { label: "添加日程", type: 'secondary' }
      ]
    }
  },
  {
    id: 4,
    name: "考勤",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=考勤&backgroundColor=3b82f6",
    message: "您本月考勤正常，无迟到早退记录",
    time: "昨天 18:00",
    unread: 1,
    icon: <CheckCircle className="w-10 h-10" />,
    type: 'card',
    cardContent: {
      title: "考勤记录",
      content: "您本月考勤正常，无迟到早退记录，累计出勤20天",
      actions: [
        { label: "查看详情", type: 'primary' },
        { label: "申请请假", type: 'secondary' }
      ]
    }
  },
  {
    id: 5,
    name: "项目管理",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=考勤&backgroundColor=22c55e",
    message: "您负责的3个项目均按计划进行",
    time: "昨天 17:30",
    unread: 2,
    icon: <Clock className="w-10 h-10" />,
    type: 'card',
    cardContent: {
      title: "项目进度",
      content: "您负责的3个项目均按计划进行，其中智能办公系统升级项目已完成60%",
      actions: [
        { label: "查看详情", type: 'primary' },
        { label: "更新进度", type: 'secondary' }
      ]
    }
  },
  {
    id: 6,
    name: "知识助手",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=项目管理&backgroundColor=ec4899",
    message: "为您推荐3篇相关知识库文章",
    time: "昨天 16:45",
    unread: 3,
    icon: <FileText className="w-10 h-10" />,
    type: 'card',
    cardContent: {
      title: "知识推荐",
      content: "根据您的搜索历史，为您推荐3篇相关知识库文章",
      actions: [
        { label: "查看详情", type: 'primary' },
        { label: "搜索更多", type: 'secondary' }
      ]
    }
  },
  {
    id: 7,
    name: "20250521公司值班沟通群",
    avatar: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=team%20group%20chat%20avatar%2C%20professional%20business%20style%2C%20multiple%20people%20silhouettes%2C%20blue%20and%20gray%20color%20scheme&image_size=square",
    message: "今日顺利保障",
    time: "昨天 17:21",
    unread: 13,
    type: 'normal',
  },
  {
    id: 8,
    name: "张飞",
    avatar: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20businessman%20avatar%2C%20strong%20features%2C%20confident%20look%2C%20modern%20style%2C%20warm%20colors&image_size=square",
    message: "已经和相关部门沟通过我们的诉求",
    time: "昨天 16:21",
    type: 'normal',
  },
  {
    id: 9,
    name: "关关",
    avatar: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20businesswoman%20avatar%2C%20friendly%20smile%2C%20modern%20style%2C%20soft%20colors&image_size=square",
    message: "请安排小李前往处理，如果执行不了，及时...",
    time: "昨天 15:20",
    type: 'normal',
  },
  {
    id: 10,
    name: "安全中心",
    avatar: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=security%20center%20avatar%2C%20professional%20shield%20icon%2C%20blue%20and%20green%20colors%2C%20modern%20design&image_size=square",
    message: "您的账号于ANC-AL00登录，请确认是否...",
    time: "昨天 16:21",
    icon: <Lock className="w-10 h-10" />,
    type: 'system',
  },
];

const processes: ProcessItem[] = [
  {
    id: 1,
    title: "项目立项申请",
    applicant: "梁吉力",
    time: "2025-07-21 10:30",
    status: "pending",
  },
  {
    id: 2,
    title: "合同签署授权委托书",
    applicant: "赵子龙",
    time: "2025-07-20 15:45",
    status: "pending",
  },
  {
    id: 3,
    title: "预算调整申请",
    applicant: "诸葛亮",
    time: "2025-07-19 09:15",
    status: "approved",
  },
  {
    id: 4,
    title: "设备采购申请",
    applicant: "关羽",
    time: "2025-07-18 14:20",
    status: "rejected",
  },
];

export default function Home() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [contentRefReady, setContentRefReady] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { showSidebar, toggleSidebar, isResponsive, setIsResponsive } = useLayoutStore();

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (isResponsive) {
      setIsResponsive(false); // 选择消息后，在窄屏上隐藏侧边栏
    }
  };

  useEffect(() => {
    setContentRefReady(true);
  }, []);

  useEffect(() => {
    if (contentRefReady && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [selectedMessage, contentRefReady]);

  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      const isNarrow = width < 1400;
      setIsResponsive(isNarrow);
    };
    
    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    
    return () => window.removeEventListener('resize', checkResponsive);
  }, [setIsResponsive]);

  const renderContent = () => {
    if (!selectedMessage) {
      const hour = new Date().getHours();
      const isDay = hour >= 6 && hour < 18;
      
      return (
        <div className="flex-1 relative overflow-hidden min-h-[calc(100vh-0px)]">
          {isDay ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-theme-50/30 to-gray-100 dark:from-gray-900 dark:via-theme-900/10 dark:to-gray-900" />
              
              <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none">
                <div className="absolute top-8 right-8 w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-orange-400 rounded-full animate-pulse-slow shadow-lg shadow-amber-400/30" />
                  <div className="absolute inset-4 bg-gradient-to-br from-yellow-200 to-amber-300 rounded-full animate-pulse-slow animation-delay-2000" />
                </div>
              </div>
              
              <div className="absolute top-20 left-[20%] animate-float pointer-events-none">
                <div className="flex gap-2">
                  <div className="w-16 h-10 bg-white/80 rounded-full" />
                  <div className="w-12 h-8 bg-white/60 rounded-full -ml-6 mt-2" />
                  <div className="w-14 h-9 bg-white/70 rounded-full -ml-5 mt-1" />
                </div>
              </div>
              <div className="absolute top-32 left-[60%] animate-float animation-delay-3000 pointer-events-none">
                <div className="flex gap-2">
                  <div className="w-12 h-8 bg-white/60 rounded-full" />
                  <div className="w-10 h-6 bg-white/50 rounded-full -ml-4 mt-1" />
                </div>
              </div>

              <div className="relative h-full flex items-center justify-center p-8">
                <div className="relative w-full max-w-2xl">
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden min-h-[500px] flex flex-col">
                    <div className="h-1.5 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300" />
                    
                    <div className="p-10">
                      <div className="flex justify-center mb-8">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-r from-amber-200 to-orange-200 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full blur-xl opacity-60 animate-pulse" />
                          <div className="relative flex flex-col items-center">
                            <div className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 p-6 rounded-3xl shadow-lg">
                              <span className="text-6xl">☀️</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full border border-amber-200/50 dark:border-amber-800/50 shadow-sm">
                          <span className="text-xl">🌤️</span>
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                            {hour < 12 ? '早安，新的一天' : '下午好，继续加油'}
                          </span>
                        </div>

                        <div>
                          <h1 className="text-4xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-gray-900 via-theme-600 to-gray-900 dark:from-white dark:via-theme-400 dark:to-white bg-clip-text text-transparent">
                              今天也辛苦啦
                            </span>
                          </h1>
                          <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
                            选择左侧对话，开启高效工作
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-4 py-2">
                          <div className="h-px w-20 bg-gradient-to-r from-transparent to-amber-300 dark:to-amber-600" />
                          <span className="text-amber-400">☀️</span>
                          <div className="h-px w-20 bg-gradient-to-l from-transparent to-amber-300 dark:to-amber-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-6 pb-2">
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-light tracking-wide">
                      点击左侧对话列表开始聊天
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-theme-50/30 to-gray-100 dark:from-gray-900 dark:via-theme-900/10 dark:to-gray-900" />
              
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-gray-400 dark:bg-white rounded-full animate-twinkle"
                    style={{
                      top: `${Math.random() * 60 + 10}%`,
                      left: `${Math.random() * 80 + 10}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      opacity: Math.random() * 0.5 + 0.3,
                    }}
                  />
                ))}
              </div>
              
              <div className="absolute top-8 right-[15%] pointer-events-none">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-200/20 dark:bg-indigo-200/30 rounded-full blur-xl animate-pulse-slow" />
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 via-slate-100 to-indigo-300 rounded-full shadow-lg shadow-indigo-200/30 dark:shadow-indigo-900/50" />
                    <div className="absolute top-4 left-6 w-4 h-4 bg-indigo-200/50 dark:bg-indigo-300/50 rounded-full" />
                    <div className="absolute top-10 left-10 w-3 h-3 bg-indigo-200/40 dark:bg-indigo-300/40 rounded-full" />
                    <div className="absolute top-6 left-14 w-2 h-2 bg-indigo-200/30 dark:bg-indigo-300/30 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="absolute top-[20%] left-[25%] animate-shooting-star pointer-events-none">
                <div className="w-20 h-0.5 bg-gradient-to-r from-gray-400 via-gray-300 to-transparent dark:from-white dark:via-indigo-200 dark:to-transparent rounded-full" />
              </div>

              <div className="relative h-full flex items-center justify-center p-8">
                <div className="relative w-full max-w-2xl">
                  <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden min-h-[500px] flex flex-col">
                    <div className="h-1.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400" />
                    
                    <div className="p-10">
                      <div className="flex justify-center mb-8">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 rounded-full blur-xl animate-pulse" />
                          <div className="relative flex flex-col items-center">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-950/80 p-6 rounded-3xl shadow-lg border border-indigo-200/50 dark:border-indigo-500/30">
                              <span className="text-6xl">🌙</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm">
                          <span className="text-xl">🌃</span>
                          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                            晚上好，辛苦了
                          </span>
                        </div>

                        <div>
                          <h1 className="text-4xl font-bold mb-3">
                            <span className="bg-gradient-to-r from-gray-900 via-theme-600 to-gray-900 dark:from-white dark:via-theme-400 dark:to-white bg-clip-text text-transparent">
                              夜深了，好好休息
                            </span>
                          </h1>
                          <p className="text-gray-500 dark:text-gray-400 text-lg font-light">
                            选择左侧对话，处理今日未尽事宜
                          </p>
                        </div>

                        <div className="flex items-center justify-center gap-4 py-2">
                          <div className="h-px w-20 bg-gradient-to-r from-transparent to-indigo-300 dark:to-indigo-600" />
                          <span className="text-indigo-400 dark:text-indigo-300">🌙</span>
                          <div className="h-px w-20 bg-gradient-to-l from-transparent to-indigo-300 dark:to-indigo-600" />
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 pt-2">
                          {[
                            { icon: '💬', label: '消息', bg: 'from-blue-400 to-blue-500' },
                            { icon: '📋', label: '流程', bg: 'from-purple-400 to-purple-500' },
                            { icon: '📅', label: '日历', bg: 'from-theme-400 to-theme-500' },
                          ].map((item, index) => (
                            <button
                              key={index}
                              className="group relative flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                            >
                              <span className={`absolute inset-0 bg-gradient-to-r ${item.bg} rounded-xl opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity`} />
                              <span className="relative text-lg">{item.icon}</span>
                              <span className="relative text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-6 pb-2">
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-light tracking-wide">
                      点击左侧对话列表开始聊天
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
            .animate-float {
              animation: float 4s ease-in-out infinite;
            }
            .animate-twinkle {
              0%, 100% { opacity: 0.3; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.2); }
            }
            @keyframes shooting-star {
              0% { transform: translate(0, 0) rotate(-45deg); opacity: 1; }
              100% { transform: translate(100px, 100px) rotate(-45deg); opacity: 0; }
            }
            .animate-shooting-star {
              animation: shooting-star 2s ease-out infinite;
            }
            .animate-pulse-slow {
              animation: pulse 4s ease-in-out infinite;
            }
            .animation-delay-2000 {
              animation-delay: 2s;
            }
            .animation-delay-3000 {
              animation-delay: 3s;
            }
          `}</style>
        </div>
      );
    }

    switch (selectedMessage.type) {
      case 'process':
        return (
          <div className="flex flex-col h-full bg-gray-50">
            <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center">
                      {selectedMessage.icon}
                    </div>
                  </div>
                  <MessageBubble>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">每日待办提醒：2条未处理</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">4月21日</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">数据统计：</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">截止到目前，2条待办未处理，其中2条已等待超过24小时</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">请尽快处理以下待办</p>
                      <ul className="list-decimal list-inside space-y-2 text-sm text-blue-600 mb-4">
                        <li>梁吉力发起的'收款单'</li>
                        <li>honeyLeung发起的'请假'</li>
                      </ul>
                    </div>
                    <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
                      查看全部待办
                    </button>
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                      <span>{selectedMessage.time}</span>
                    </div>
                  </MessageBubble>
                </div>
              <CardMessage message={{
                ...selectedMessage,
                cardContent: {
                  title: "项目立项申请",
                  content: "信息管理部梁吉力提交的项目立项申请需要您的审批，项目名称为'智能办公系统升级'，预计投资100万元，周期6个月。",
                  actions: [
                    { label: "查看详情", type: 'primary' },
                    { label: "通过", type: 'secondary' },
                    { label: "退回", type: 'secondary' }
                  ]
                }
              }} />
              <CardMessage message={{
                ...selectedMessage,
                time: "10:30",
                cardContent: {
                  title: "合同签署授权委托书",
                  content: "市场部赵子龙提交的合同签署授权委托书需要您的审批，涉及金额500万元。",
                  actions: [
                    { label: "查看详情", type: 'primary' },
                    { label: "通过", type: 'secondary' },
                    { label: "退回", type: 'secondary' }
                  ]
                }
              }} />
            </div>
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入消息..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-theme-500"
                />
                <div className="flex gap-2">
                  <button className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                  </button>
                  <button className="bg-theme-500 text-white p-2 rounded-full hover:bg-theme-600 transition-colors">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'card':
        if (selectedMessage.name === "日程") {
          return (
            <div className="flex flex-col h-full bg-gray-50">
              <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">今日安排</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-500">全天</span>
                          <span className="text-sm font-medium text-gray-900">测试2</span>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-500">11:30</span>
                          <span className="text-sm font-medium text-gray-900">测试</span>
                        </div>
                        <span className="text-xs text-gray-500">11:30 - 12:00</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">明日安排</h3>
                    <div className="space-y-2">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-500">全天</span>
                          <span className="text-sm font-medium text-gray-900">测试3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入消息..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <button className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        } else if (selectedMessage.name === "知识助手") {
          return (
            <div className="flex flex-col h-full bg-gray-50">
              <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                      {selectedMessage.icon}
                    </div>
                  </div>
                  <MessageBubble>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">知识推荐</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">根据您的搜索历史，为您推荐以下相关知识库文章：</p>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
                        <FileText size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <a href="#" className="text-theme-600 hover:text-theme-700 font-medium text-base mb-1 block truncate">
                            智能办公系统使用指南
                          </a>
                          <span className="text-sm text-gray-500 dark:text-gray-400">由 梁吉力 发布，浏览量 1,234</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
                        <FileText size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <a href="#" className="text-theme-600 hover:text-theme-700 font-medium text-base mb-1 block truncate">
                            2025年IT部门工作计划
                          </a>
                          <span className="text-sm text-gray-500 dark:text-gray-400">由 张三 发布，浏览量 987</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                      </div>
                      <div className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer">
                        <FileText size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <a href="#" className="text-theme-600 hover:text-theme-700 font-medium text-base mb-1 block truncate">
                            企业数据安全最佳实践
                          </a>
                          <span className="text-sm text-gray-500 dark:text-gray-400">由 李四 发布，浏览量 756</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      {selectedMessage.cardContent?.actions.map((action, index) => (
                        <button
                          key={index}
                          className={`px-4 py-2 rounded-md transition-colors ${action.type === 'primary' ? 'bg-theme-500 text-white hover:bg-theme-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                      <span>{selectedMessage.time}</span>
                    </div>
                  </MessageBubble>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                      {selectedMessage.icon}
                    </div>
                  </div>
                  <MessageBubble>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">知识审批</h3>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">关于更新公司知识库结构的提案</h4>
                          <span className="text-xs font-medium text-yellow-500 bg-yellow-50 px-2 py-1 rounded">待审批</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">由 梁吉力 提交，需要您的审批</p>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-theme-500 text-white rounded-md hover:bg-theme-600 transition-colors text-sm">
                            批准
                          </button>
                          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
                            拒绝
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                      <span>{selectedMessage.time}</span>
                    </div>
                  </MessageBubble>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                      {selectedMessage.icon}
                    </div>
                  </div>
                  <MessageBubble>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">知识发布</h3>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">2025年Q2技术培训计划</h4>
                          <span className="text-xs font-medium text-green-500 bg-green-50 px-2 py-1 rounded">已发布</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">由 张三 发布，已在知识库中上线</p>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm">
                          查看详情
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                      <span>{selectedMessage.time}</span>
                    </div>
                  </MessageBubble>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="输入消息..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-theme-500"
                  />
                  <div className="flex gap-2">
                    <button className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                    </button>
                    <button className="bg-theme-500 text-white p-2 rounded-full hover:bg-theme-600 transition-colors">
                      <MessageSquare size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="flex flex-col h-full bg-gray-50">
            <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              <CardMessage message={selectedMessage} />
            </div>
            <div className="p-4 border-t border-gray-200 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入消息..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <div className="flex gap-2">
                  <button className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                  </button>
                  <button className="bg-theme-500 text-white p-2 rounded-full hover:bg-theme-600 transition-colors">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'assistant':
        return (
          <div className="flex flex-col h-full bg-gray-50">
            <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img
                  src={selectedMessage.avatar}
                  alt={selectedMessage.name}
                  className="w-12 h-12 rounded-full"
                />
              </div>
              <MessageBubble>
                <p className="text-gray-700 dark:text-gray-300">{selectedMessage.message}</p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                  <span>{selectedMessage.time}</span>
                </div>
              </MessageBubble>
            </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="请输入您的问题..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <div className="flex gap-2">
                  <button className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                  </button>
                  <button className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col h-full bg-gray-50">
            <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <img
                    src={selectedMessage.avatar}
                    alt={selectedMessage.name}
                    className="w-12 h-12 rounded-full"
                  />
                </div>
                <MessageBubble className="relative group">
                  <p className="text-gray-700 dark:text-gray-300">{selectedMessage.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <span>{selectedMessage.time}</span>
                  </div>
                </MessageBubble>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入消息..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-theme-500"
                />
                <div className="flex gap-2">
                  <button className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
                  </button>
                  <button className="bg-theme-500 text-white p-2 rounded-full hover:bg-theme-600 transition-colors">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* 对话列表 */}
      <div className={`
        w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shrink-0
        ${showSidebar ? 'flex' : 'hidden'}
      `}>
        <div className="flex-1 overflow-y-auto">
          {messages.map((msg) => (
            <MessageItem 
              key={msg.id} 
              message={msg} 
              onClick={() => handleMessageClick(msg)} 
              isSelected={selectedMessage?.id === msg.id}
            />
          ))}
        </div>
      </div>
      
      {/* 对话内容 - 充满整个右侧容器 */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* 顶部栏：包含切换侧边栏按钮 */}
        <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-white dark:bg-gray-800 shrink-0">
          {/* 切换消息列表按钮 */}
          <button 
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={toggleSidebar}
            title={showSidebar ? "隐藏消息列表" : "显示消息列表"}
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          {/* 消息标题（仅在侧边栏隐藏时显示） */}
          {!showSidebar && selectedMessage && (
            <MessageHeader 
              title={selectedMessage.name} 
              showBackButton={true}
              onBack={toggleSidebar}
            />
          )}
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          {renderContent()}
        </div>
        
        {/* 浮动消息列表切换按钮（仅在侧边栏隐藏时显示） */}
        {!showSidebar && (
          <button 
            className="fixed bottom-6 right-6 bg-theme-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-30 hover:bg-theme-600 transition-all hover:scale-110"
            onClick={toggleSidebar}
            title="显示消息列表"
          >
            <Menu size={24} />
          </button>
        )}
      </div>
    </div>
  );
}

function MessageItem({ message, onClick, isSelected }: MessageItemProps) {
  return (
    <div 
      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors flex gap-4 ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        {message.icon ? (
          <div className="w-12 h-12 flex items-center justify-center">
            {message.icon}
          </div>
        ) : (
          <div className="flex items-center">
            {message.name.includes('群') ? (
              <div className="relative w-12 h-12">
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=王五&backgroundColor=8b5cf6"
                  alt=""
                  className="w-8 h-8 rounded-full absolute top-0 left-0 border-2 border-white dark:border-gray-800"
                />
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=赵六&backgroundColor=f97316"
                  alt=""
                  className="w-8 h-8 rounded-full absolute top-0 right-0 border-2 border-white dark:border-gray-800"
                />
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=孙七&backgroundColor=22c55e"
                  alt=""
                  className="w-8 h-8 rounded-full absolute bottom-0 left-0 border-2 border-white dark:border-gray-800"
                />
              </div>
            ) : (
              <img
                src={message.avatar}
                alt={message.name}
                className="w-12 h-12 rounded-full"
              />
            )}
          </div>
        )}
        {message.unread && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1">
            {message.unread > 99 ? '99+' : message.unread}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-theme-600 dark:text-theme-400' : 'text-gray-900 dark:text-white'}`}>
            {message.name}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 shrink-0">
            {message.time}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {message.message}
        </p>
      </div>
    </div>
  );
}

function ProcessCard({ process }: { process: ProcessItem }) {
  const getStatusIcon = () => {
    switch (process.status) {
      case 'pending':
        return <Clock size={20} className="text-yellow-500" />;
      case 'approved':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={20} className="text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (process.status) {
      case 'pending':
        return '待审批';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{process.title}</h3>
        <div className="flex items-center gap-1 text-sm">
          {getStatusIcon()}
          <span className={`font-medium ${process.status === 'pending' ? 'text-yellow-500' : process.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        申请人：{process.applicant}
      </div>
      <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">
        提交时间：{process.time}
      </div>
      {process.status === 'pending' && (
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-theme-500 text-white rounded-md hover:bg-theme-600 transition-colors">
            批准
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            拒绝
          </button>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full max-w-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 ${className}`}>
      {children}
    </div>
  );
}

function CardMessage({ message }: { message: Message }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        {message.icon ? (
          <div className="w-12 h-12 flex items-center justify-center">
            {message.icon}
          </div>
        ) : (
          <img
            src={message.avatar}
            alt={message.name}
            className="w-12 h-12 rounded-full"
          />
        )}
      </div>
      <MessageBubble>
        {message.cardContent && (
          <>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">{message.cardContent.title}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{message.cardContent.content}</p>
            <div className="flex gap-3">
              {message.cardContent.actions.map((action, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-md transition-colors ${action.type === 'primary' ? 'bg-theme-500 text-white hover:bg-theme-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </>
        )}
        {!message.cardContent && (
          <p className="text-gray-700 dark:text-gray-300">{message.message}</p>
        )}
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
          <span>{message.time}</span>
        </div>
      </MessageBubble>
    </div>
  );
}
