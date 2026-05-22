import {
  MessageSquare,
  Lock,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  XCircle,
  Hexagon,
  FileText,
  ChevronRight,
  ThumbsUp,
  Quote,
  Copy,
  MoreHorizontal,
  MapPin,
  Video,
  Image as ImageIcon,
  Play,
  ExternalLink,
  Link as LinkIcon,
  File,
  Download,
  Search,
  Database,
  BarChart3,
  Users,
  Bell,
  CheckSquare,
  ClipboardList,
  Building2,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Plus,
  Edit3,
  Send,
  Check,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface CardContent {
  title: string;
  content: string;
  actions: {
    label: string;
    type: 'primary' | 'secondary';
  }[];
}

type ChatContentType = 'text' | 'image' | 'video' | 'location' | 'videoMeeting' | 'link' | 'file' | 'form' | 'dataCard' | 'quickAction' | 'schedule' | 'approval' | 'approvalList' | 'knowledge';

type ChatElementType = 'knowledge' | 'form' | 'dataCard' | 'schedule' | 'approval' | 'approvalList' | 'quickAction';

// 统一卡片样式配置
const cardStyles = {
  container: {
    base: "rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden",
    me: "bg-white/90 dark:bg-gray-700/80",
    other: "bg-white dark:bg-gray-800",
  },
  header: {
    container: "px-4 py-3 border-b border-gray-100 dark:border-gray-700",
    colors: {
      knowledge: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-500' },
      dataCard: { bg: 'bg-theme-50 dark:bg-theme-900/30', icon: 'text-theme-500' },
      schedule: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-500' },
      approval: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-500' },
      approvalList: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-500' },
      form: { bg: 'bg-theme-50 dark:bg-theme-900/20', icon: 'text-theme-500' },
    },
    iconSize: 16,
    title: { size: 'text-sm', weight: 'font-medium', baseColor: 'text-gray-900 dark:text-white', meColor: 'text-gray-900 dark:text-white' },
  },
  content: {
    padding: 'p-4',
    title: { size: 'text-base', weight: 'font-medium', meColor: 'text-gray-700', otherColor: 'text-gray-900 dark:text-white' },
    description: { size: 'text-sm', meColor: 'text-gray-600', otherColor: 'text-gray-600 dark:text-gray-400' },
  },
  status: {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: '待处理' },
    approved: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: '已通过' },
    rejected: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: '已拒绝' },
  },
  button: {
    primary: "bg-theme-500 text-white hover:bg-theme-600",
    secondary: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
    size: 'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
  },
  tags: {
    base: "px-2 py-0.5 text-xs rounded-full",
  },
};

interface ChatMessageMeta {
  // link 类型
  url?: string;
  thumbnail?: string;
  address?: string;
  // videoMeeting 类型
  meetingId?: string;
  duration?: string;
  status?: 'ongoing' | 'ended';
  // link 类型
  linkTitle?: string;
  linkDescription?: string;
  // file 类型
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  // form 类型 - 表单录入
  formTitle?: string;
  formFields?: { label: string; value?: string; placeholder?: string; type: 'input' | 'select' | 'date' | 'textarea' }[];
  // dataCard 类型 - 数据卡片
  dataTitle?: string;
  dataValue?: string;
  dataChange?: string;
  dataChangeType?: 'up' | 'down' | 'neutral';
  dataUnit?: string;
  dataDashboardUrl?: string;
  // quickAction 类型 - 快捷操作
  actions?: { label: string; icon?: string; action: string }[];
  // schedule 类型 - 日程卡片
  scheduleTitle?: string;
  scheduleTime?: string;
  scheduleLocation?: string;
  scheduleMembers?: string[];
  // approval 类型 - 审批卡片
  approvalTitle?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalApplicant?: string;
  approvalTime?: string;
  // approvalList 类型 - 审批列表
  approvals?: { title: string; status: 'pending' | 'approved' | 'rejected'; applicant: string; time: string }[];
  // knowledge 类型 - 知识推荐
  knowledgeTitle?: string;
  knowledgeExcerpt?: string;
  knowledgeUrl?: string;
  knowledgeTags?: string[];
}

interface ChatMessageElement {
  type: ChatElementType;
  meta: ChatMessageMeta;
}

interface ChatMessage {
  id: number;
  sender: 'me' | 'other';
  type: ChatContentType;
  content: string;
  time: string;
  meta?: ChatMessageMeta;
  // 支持一个消息包含多个元素
  elements?: ChatMessageElement[];
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
  chatMessages?: ChatMessage[];
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
    message: "您好！我是如意助手，请问有什么可以帮您？",
    time: "12:21",
    unread: 2,
    type: 'assistant',
    chatMessages: [
      // 考勤查询 - 一条消息包含文本和知识卡片
      {
        id: 1,
        sender: 'me',
        type: 'text',
        content: "你好，我想了解一下上个月的考勤统计",
        time: "今天 10:30",
      },
      {
        id: 2,
        sender: 'other',
        type: 'text',
        content: "您好！已为您查询到上个月考勤统计：应出勤22天，实际出勤21天，迟到2次，早退0次。请假1天（年假）。总体出勤率95.5%，表现良好！",
        time: "今天 10:31",
        elements: [
          {
            type: 'knowledge',
            meta: {
              knowledgeTitle: "考勤管理制度 v2.3",
              knowledgeExcerpt: "员工考勤管理规定：迟到、早退、病假、事假、加班调休等相关制度说明...",
              knowledgeUrl: "https://docs.qq.com/doc/xxx",
              knowledgeTags: ["考勤", "制度", "HR"],
            },
          },
        ],
      },
      // 项目立项 - 用户问 + 流程说明 + 表单
      {
        id: 3,
        sender: 'me',
        type: 'text',
        content: "好的，顺便问一下，项目立项申请流程是什么？",
        time: "今天 10:33",
      },
      {
        id: 4,
        sender: 'other',
        type: 'form',
        content: "项目立项申请流程如下：\n1. 填写项目基本信息\n2. 提交项目预算申请\n3. 部门负责人审批\n4. 项目立项完成\n\n请填写以下表单发起立项申请：",
        time: "今天 10:33",
        elements: [
          {
            type: 'form',
            meta: {
              formTitle: "项目立项申请表单",
              formFields: [
                { label: "项目名称", placeholder: "请输入项目名称", type: "input" },
                { label: "项目类型", placeholder: "请选择类型", type: "select" },
                { label: "预计开始日期", placeholder: "选择日期", type: "date" },
                { label: "项目预算（万元）", placeholder: "请输入预算金额", type: "input" },
                { label: "项目负责人", placeholder: "请输入负责人姓名", type: "input" },
                { label: "项目概述", placeholder: "请简要描述项目背景和目标", type: "textarea" },
              ],
            },
          },
        ],
      },
      // 运营数据 - 一条消息包含3个数据卡片
      {
        id: 5,
        sender: 'me',
        type: 'text',
        content: "我先看看公司近期的运营数据",
        time: "今天 10:35",
      },
      {
        id: 6,
        sender: 'other',
        type: 'dataCard',
        content: "为您展示本月核心运营指标：",
        time: "今天 10:35",
        elements: [
          {
            type: 'dataCard',
            meta: {
              dataTitle: "本月销售额",
              dataValue: "1,286",
              dataUnit: "万元",
              dataChange: "+12.5%",
              dataChangeType: "up",
              dataDashboardUrl: "https://dashboard.example.com/sales",
            },
          },
          {
            type: 'dataCard',
            meta: {
              dataTitle: "客户满意度",
              dataValue: "96.8",
              dataUnit: "%",
              dataChange: "+2.3%",
              dataChangeType: "up",
              dataDashboardUrl: "https://dashboard.example.com/satisfaction",
            },
          },
          {
            type: 'dataCard',
            meta: {
              dataTitle: "项目交付及时率",
              dataValue: "89.2",
              dataUnit: "%",
              dataChange: "-1.5%",
              dataChangeType: "down",
              dataDashboardUrl: "https://dashboard.example.com/delivery",
            },
          },
        ],
      },
      // 日程预约 - 一条消息包含日程卡片和快捷操作
      {
        id: 7,
        sender: 'me',
        type: 'text',
        content: "帮我预约一下明天下午2点的项目会议，地点在会议室A，参加人有张飞、关羽、诸葛亮",
        time: "今天 10:37",
      },
      {
        id: 8,
        sender: 'other',
        type: 'schedule',
        content: "请确认日程信息",
        time: "今天 10:37",
        elements: [
          {
            type: 'schedule',
            meta: {
              scheduleTitle: "智能办公系统项目会议",
              scheduleTime: "明天 14:00 - 15:00",
              scheduleLocation: "会议室A",
              scheduleMembers: ["张飞", "关羽", "诸葛亮"],
            },
          },
          {
            type: 'quickAction',
            meta: {
              actions: [
                { label: "确认创建", icon: "check", action: "confirm" },
                { label: "修改", icon: "edit", action: "modify" },
                { label: "取消", icon: "x", action: "cancel" },
              ],
            },
          },
        ],
      },
      // 确认创建
      {
        id: 9,
        sender: 'me',
        type: 'text',
        content: "确认创建",
        time: "今天 10:38",
      },
      {
        id: 10,
        sender: 'other',
        type: 'text',
        content: "✅ 日程已创建！明天下午2点智能办公系统项目会议，地点会议室A，参与人：张飞、关羽、诸葛亮。已发送会议通知。",
        time: "今天 10:38",
      },
      // 待审批 - 用户问 + 审批列表
      {
        id: 11,
        sender: 'me',
        type: 'text',
        content: "帮我查一下待审批的流程有哪些",
        time: "今天 10:40",
      },
      {
        id: 12,
        sender: 'other',
        type: 'approvalList',
        content: "您有3条待审批流程，请选择要审批的流程：",
        time: "今天 10:40",
        elements: [
          {
            type: 'approvalList',
            meta: {
              approvals: [
                { title: "项目立项申请 - 吉祥航空协同平台", status: "pending", applicant: "梁吉力", time: "2026-05-18 14:30" },
                { title: "预算调整申请 - Q2季度预算追加", status: "pending", applicant: "诸葛亮", time: "2026-05-17 09:15" },
                { title: "设备采购申请 - 新风系统采购", status: "approved", applicant: "关羽", time: "2026-05-15 11:20" },
              ],
            },
          },
        ],
      },
      // 知识搜索 - 一条消息包含3个知识卡片
      {
        id: 13,
        sender: 'me',
        type: 'text',
        content: "帮我搜索一下关于智能办公的知识文章",
        time: "今天 10:42",
      },
      {
        id: 14,
        sender: 'other',
        type: 'knowledge',
        content: "为您找到以下相关知识：",
        time: "今天 10:42",
        elements: [
          {
            type: 'knowledge',
            meta: {
              knowledgeTitle: "智能办公系统功能介绍",
              knowledgeExcerpt: "本文档详细介绍吉祥航空智能办公系统的核心功能模块，包括日程管理、流程审批、知识库...",
              knowledgeUrl: "https://docs.qq.com/doc/ABC123",
              knowledgeTags: ["智能办公", "系统功能", "新员工指南"],
            },
          },
          {
            type: 'knowledge',
            meta: {
              knowledgeTitle: "协同办公平台使用手册",
              knowledgeExcerpt: "吉祥航空协同办公平台完整使用指南，包含PC端和移动端操作说明...",
              knowledgeUrl: "https://docs.qq.com/doc/DEF456",
              knowledgeTags: ["使用手册", "操作指南"],
            },
          },
          {
            type: 'knowledge',
            meta: {
              knowledgeTitle: "常见问题FAQ汇总",
              knowledgeExcerpt: "针对智能办公平台使用过程中常见问题的解答汇总...",
              knowledgeUrl: "https://docs.qq.com/doc/GHI789",
              knowledgeTags: ["FAQ", "常见问题"],
            },
          },
        ],
      },
      // 结束对话
      {
        id: 15,
        sender: 'me',
        type: 'text',
        content: "谢谢你，今天就到这里吧",
        time: "今天 10:45",
      },
      {
        id: 16,
        sender: 'other',
        type: 'text',
        content: "好的！很高兴为您服务。如有需要随时召唤我，祝您工作顺利！🌟\n\n温馨提示：您今天还有2个待办事项，3条待审批流程。",
        time: "今天 10:45",
      },
    ],
  },
  {
    id: 8,
    name: "张飞",
    avatar: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20businessman%20avatar%2C%20strong%20features%2C%20confident%20look%2C%20modern%20style%2C%20warm%20colors&image_size=square",
    message: "已经和相关部门沟通过我们的诉求",
    time: "昨天 16:21",
    type: 'normal',
    chatMessages: [
      {
        id: 1,
        sender: 'other',
        type: 'text',
        content: "梁工，项目最新进展如何？",
        time: "昨天 15:30",
      },
      {
        id: 2,
        sender: 'me',
        type: 'text',
        content: "张工，智能办公系统升级项目现在到什么阶段了？",
        time: "昨天 15:35",
      },
      {
        id: 3,
        sender: 'other',
        type: 'text',
        content: "已经和相关部门沟通过我们的诉求，他们表示会尽快落实。",
        time: "昨天 16:21",
      },
      {
        id: 4,
        sender: 'me',
        type: 'text',
        content: "太好了，预计什么时候能完成第一阶段？",
        time: "昨天 16:25",
      },
      {
        id: 5,
        sender: 'other',
        type: 'image',
        content: "项目现场照片",
        time: "昨天 16:45",
        meta: {
          url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
          thumbnail: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=150&fit=crop",
        },
      },
      {
        id: 6,
        sender: 'other',
        type: 'video',
        content: "项目演示视频",
        time: "昨天 17:10",
        meta: {
          url: "https://www.w3schools.com/html/mov_bbb.mp4",
          thumbnail: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=225&fit=crop",
          duration: "02:34",
        },
      },
      {
        id: 7,
        sender: 'me',
        type: 'text',
        content: "收到，我看一下视频",
        time: "昨天 17:15",
      },
      {
        id: 8,
        sender: 'other',
        type: 'location',
        content: "项目现场地址",
        time: "昨天 17:30",
        meta: {
          address: "北京市海淀区中关村软件园二期 8号楼",
          url: "https://maps.google.com",
        },
      },
      {
        id: 9,
        sender: 'me',
        type: 'text',
        content: "现场情况看起来不错！下周有空的话我们开个会详细讨论下？",
        time: "昨天 17:35",
      },
      {
        id: 10,
        sender: 'other',
        type: 'videoMeeting',
        content: "项目进度同步会",
        time: "今天 09:00",
        meta: {
          meetingId: "204 365 818",
          duration: "25:25",
          status: 'ended',
        },
      },
      {
        id: 11,
        sender: 'other',
        type: 'link',
        content: "",
        time: "今天 09:15",
        meta: {
          url: "https://docs.qq.com/doc/xxx",
          linkTitle: "吉祥航空主数据-组织-ID匹配关系",
          linkDescription: "2026年数据治理项目核心文档，包含最新组织架构与ID映射规则",
        },
      },
      {
        id: 12,
        sender: 'me',
        type: 'text',
        content: "这份文档我先看看，有问题随时沟通",
        time: "今天 09:16",
      },
      {
        id: 13,
        sender: 'other',
        type: 'file',
        content: "",
        time: "今天 09:18",
        meta: {
          url: "#",
          fileName: "智能办公系统升级方案_V2.1.pdf",
          fileSize: "2.4 MB",
          fileType: "pdf",
        },
      },
      {
        id: 14,
        sender: 'other',
        type: 'file',
        content: "",
        time: "今天 09:22",
        meta: {
          url: "#",
          fileName: "会议纪要_20260519.xlsx",
          fileSize: "156 KB",
          fileType: "xlsx",
        },
      },
      {
        id: 15,
        sender: 'other',
        type: 'text',
        content: "收到，下周我们再约时间详细讨论一下后续计划。",
        time: "今天 09:30",
      },
      {
        id: 16,
        sender: 'me',
        type: 'text',
        content: "好的，下周见！",
        time: "今天 09:32",
      },
    ],
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

  // 简化逻辑：移除响应式和拖动相关的复杂处理
  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
  };

  useEffect(() => {
    setContentRefReady(true);
  }, []);

  useEffect(() => {
    if (contentRefReady && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [selectedMessage, contentRefReady]);

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
                          className={`${cardStyles.button.size} ${action.type === 'primary' ? cardStyles.button.primary : cardStyles.button.secondary}`}
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
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cardStyles.status.pending.bg} ${cardStyles.status.pending.text}`}>
                            待审批
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">由 梁吉力 提交，需要您的审批</p>
                        <div className="flex gap-2">
                          <button className={`${cardStyles.button.primary} ${cardStyles.button.size}`}>
                            批准
                          </button>
                          <button className={`${cardStyles.button.secondary} ${cardStyles.button.size}`}>
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
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${cardStyles.status.approved.bg} ${cardStyles.status.approved.text}`}>
                            已发布
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">由 张三 发布，已在知识库中上线</p>
                        <button className={`${cardStyles.button.secondary} ${cardStyles.button.size}`}>
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
          <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedMessage.chatMessages ? (
                selectedMessage.chatMessages.map((chatMsg) => (
                  <ChatMessageBubble
                    key={chatMsg.id}
                    chatMsg={chatMsg}
                    avatar={selectedMessage.avatar}
                    name={selectedMessage.name}
                  />
                ))
              ) : (
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
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="请输入您的问题..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-theme-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <div className="flex gap-2">
                  <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <ImageIcon size={20} />
                  </button>
                  <button className="bg-theme-500 text-white p-2 rounded-full hover:bg-theme-600 transition-colors">
                    <MessageSquare size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div ref={contentRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {selectedMessage.chatMessages ? (
                selectedMessage.chatMessages.map((chatMsg) => (
                  <ChatMessageBubble
                    key={chatMsg.id}
                    chatMsg={chatMsg}
                    avatar={selectedMessage.avatar}
                    name={selectedMessage.name}
                  />
                ))
              ) : (
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
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="输入消息..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-theme-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
                <div className="flex gap-2">
                  <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <ImageIcon size={20} />
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
    <div className="flex h-full min-h-full">
      {/* 消息列表 - 固定宽度 */}
      <div className="flex flex-col w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shrink-0">
        {/* 消息列表头部 */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">消息</h2>
          <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Plus size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* 消息列表 */}
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

      {/* 聊天内容区域 - 撑满剩余空间 */}
      <div className="flex-1 flex flex-col h-full min-h-full bg-gray-50 dark:bg-gray-900">
        {/* 聊天头部 - 当有选中消息时显示 */}
        {selectedMessage ? (
          <div className="h-14 flex items-center gap-3 px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{selectedMessage.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedMessage.count ? `${selectedMessage.count}条消息` : '在线'}
              </p>
            </div>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <MoreHorizontal size={20} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        ) : (
          <div className="h-14 flex items-center px-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
            <h3 className="font-semibold text-gray-900 dark:text-white">选择联系人开始聊天</h3>
          </div>
        )}
        
        {/* 聊天内容 */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {renderContent()}
        </div>
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
            <h3 className={`${cardStyles.content.title.size} ${cardStyles.content.title.weight} ${cardStyles.content.title.otherColor} mb-3`}>{message.cardContent.title}</h3>
            <p className={`${cardStyles.content.description.size} ${cardStyles.content.description.otherColor} mb-6`}>{message.cardContent.content}</p>
            <div className="flex gap-3">
              {message.cardContent.actions.map((action, index) => (
                <button
                  key={index}
                  className={`${cardStyles.button.size} ${action.type === 'primary' ? cardStyles.button.primary : cardStyles.button.secondary}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </>
        )}
        {!message.cardContent && (
          <p className={`${cardStyles.content.description.size} ${cardStyles.content.description.otherColor}`}>{message.message}</p>
        )}
        <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
          <span>{message.time}</span>
        </div>
      </MessageBubble>
    </div>
  );
}

function ChatMessageBubble({ chatMsg, avatar, name }: { chatMsg: ChatMessage; avatar: string; name: string }) {
  const isMe = chatMsg.sender === 'me';

  return (
    <div className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0">
        <img
          src={isMe ? "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20beautiful%20woman%20avatar%2C%20modern%20style%2C%20confident%20expression%2C%20soft%20lighting%2C%20elegant%20appearance&image_size=square_hd" : avatar}
          alt={isMe ? "我" : name}
          className="w-12 h-12 rounded-full"
        />
      </div>
      <div className={`relative group max-w-xl ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* 消息气泡 */}
        <div className={`relative rounded-2xl shadow-sm border overflow-hidden ${isMe ? 'bg-mint-50 text-gray-700 border-mint-200 dark:bg-mint-900/30 dark:text-mint-100 dark:border-mint-700/50' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-700'}`}>
          {renderChatContent(chatMsg, isMe)}
        </div>
        {/* 时间 */}
        <span className="text-xs text-gray-400 mt-1 px-1">{chatMsg.time}</span>

        {/* 悬浮菜单 */}
        <div className={`absolute top-0 ${isMe ? 'left-0 -translate-x-full -ml-2' : 'right-0 translate-x-full ml-2'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-1 z-10`}>
          <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors" title="点赞">
            <ThumbsUp size={14} />
          </button>
          <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors" title="引用">
            <Quote size={14} />
          </button>
          <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors" title="复制">
            <Copy size={14} />
          </button>
          <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors" title="更多">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function renderChatContent(chatMsg: ChatMessage, isMe: boolean) {
  // 渲染单个元素
  const renderElement = (element: ChatMessageElement, index: number) => {
    switch (element.type) {
      case 'knowledge':
        const knowledgeConfig = cardStyles.header.colors.knowledge;
        return (
          <a
            key={index}
            href={element.meta?.knowledgeUrl || '#'}
            className={`block rounded-lg overflow-hidden ${isMe ? cardStyles.container.me : cardStyles.container.other} shadow-sm hover:shadow-md transition-shadow mt-2`}
          >
            <div className={cardStyles.content.padding}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isMe ? 'bg-blue-100' : knowledgeConfig.bg}`}>
                  <BookOpen size={cardStyles.header.iconSize} className={knowledgeConfig.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`${cardStyles.content.title.size} ${cardStyles.content.title.weight} line-clamp-1 ${isMe ? cardStyles.content.title.meColor : cardStyles.content.title.otherColor}`}>
                    {element.meta?.knowledgeTitle}
                  </h4>
                  {element.meta?.knowledgeExcerpt && (
                    <p className={`text-xs mt-1 line-clamp-2 ${isMe ? cardStyles.content.description.meColor : cardStyles.content.description.otherColor}`}>
                      {element.meta?.knowledgeExcerpt}
                    </p>
                  )}
                  {element.meta?.knowledgeTags && element.meta?.knowledgeTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {element.meta?.knowledgeTags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`${cardStyles.tags.base} ${isMe ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ExternalLink size={16} className="text-gray-400" />
              </div>
            </div>
          </a>
        );
      case 'dataCard':
        const dataCardConfig = cardStyles.header.colors.dataCard;
        const ChangeIcon = element.meta?.dataChangeType === 'up' ? ArrowUpRight : element.meta?.dataChangeType === 'down' ? ArrowDownRight : Minus;
        const changeColor = element.meta?.dataChangeType === 'up' ? 'text-green-500' : element.meta?.dataChangeType === 'down' ? 'text-red-500' : 'text-gray-400';
        return (
          <a
            key={index}
            href={element.meta?.dataDashboardUrl || '#'}
            className={`block rounded-lg overflow-hidden ${isMe ? cardStyles.container.me : cardStyles.container.other} shadow-sm p-4 transition-colors hover:shadow-md mt-2`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs ${isMe ? cardStyles.content.description.meColor : cardStyles.content.description.otherColor}`}>{element.meta?.dataTitle}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-bold ${isMe ? cardStyles.content.title.meColor : cardStyles.content.title.otherColor}`}>
                    {element.meta?.dataValue}
                  </span>
                  <span className={`text-sm ${isMe ? cardStyles.content.description.meColor : cardStyles.content.description.otherColor}`}>
                    {element.meta?.dataUnit}
                  </span>
                </div>
                {element.meta?.dataChange && (
                  <div className={`flex items-center gap-1 mt-2 ${changeColor}`}>
                    <ChangeIcon size={14} />
                    <span className="text-xs font-medium">{element.meta?.dataChange}</span>
                    <span className="text-xs text-gray-400">较上月</span>
                  </div>
                )}
              </div>
              <div className={`p-2 rounded-lg ${isMe ? 'bg-mint-100' : dataCardConfig.bg}`}>
                <BarChart3 size={20} className={dataCardConfig.icon} />
              </div>
            </div>
            <div className={`mt-3 pt-3 border-t ${isMe ? 'border-gray-200' : 'border-gray-100 dark:border-gray-700'} flex items-center justify-between`}>
              <span className={`text-xs ${isMe ? 'text-theme-500' : 'text-theme-500'}`}>查看数据看板</span>
              <ArrowUpRight size={14} className="text-theme-500" />
            </div>
          </a>
        );
      case 'approval':
        const approvalConfig = cardStyles.header.colors.approval;
        const approvalStatus = element.meta?.approvalStatus || 'pending';
        const statusConfig = cardStyles.status[approvalStatus];
        return (
          <div key={index} className={`rounded-lg ${isMe ? cardStyles.container.me : cardStyles.container.other} shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-2`}>
            <div className={`px-4 py-3 ${isMe ? 'bg-purple-100/50' : approvalConfig.bg} border-b border-gray-100 dark:border-gray-700`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={cardStyles.header.iconSize} className={approvalConfig.icon} />
                  <span className={`${cardStyles.header.title.size} ${cardStyles.header.title.weight} ${isMe ? cardStyles.header.title.meColor : cardStyles.header.title.baseColor}`}>
                    审批流程
                  </span>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h4 className={`${cardStyles.content.title.size} ${cardStyles.content.title.weight} ${isMe ? cardStyles.content.title.meColor : cardStyles.content.title.otherColor}`}>
                {element.meta?.approvalTitle}
              </h4>
              <div className={`mt-3 space-y-2 text-sm ${isMe ? cardStyles.content.description.meColor : cardStyles.content.description.otherColor}`}>
                <div className="flex items-center justify-between">
                  <span>申请人</span>
                  <span className={isMe ? cardStyles.content.title.meColor : cardStyles.content.title.otherColor}>{element.meta?.approvalApplicant}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>申请时间</span>
                  <span>{element.meta?.approvalTime}</span>
                </div>
              </div>
              {approvalStatus === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button className={`flex-1 ${cardStyles.button.primary} ${cardStyles.button.size}`}>
                    同意
                  </button>
                  <button className={`flex-1 ${cardStyles.button.secondary} ${cardStyles.button.size}`}>
                    驳回
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'schedule':
        const scheduleConfig = cardStyles.header.colors.schedule;
        return (
          <div key={index} className={`rounded-lg ${isMe ? cardStyles.container.me : cardStyles.container.other} shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-2`}>
            <div className={`px-4 py-3 ${isMe ? 'bg-orange-100/50' : scheduleConfig.bg} border-b border-gray-100 dark:border-gray-700`}>
              <div className="flex items-center gap-2">
                <CalendarIcon size={cardStyles.header.iconSize} className={scheduleConfig.icon} />
                <span className={`${cardStyles.header.title.size} ${cardStyles.header.title.weight} ${isMe ? cardStyles.header.title.meColor : cardStyles.header.title.baseColor}`}>
                  日程提醒
                </span>
              </div>
            </div>
            <div className="p-4">
              <h4 className={`${cardStyles.content.title.size} ${cardStyles.content.title.weight} ${isMe ? cardStyles.content.title.meColor : cardStyles.content.title.otherColor}`}>
                {element.meta?.scheduleTitle}
              </h4>
              <div className={`mt-3 space-y-2 text-sm ${isMe ? cardStyles.content.description.meColor : cardStyles.content.description.otherColor}`}>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="flex-shrink-0" />
                  <span>{element.meta?.scheduleTime}</span>
                </div>
                {element.meta?.scheduleLocation && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="flex-shrink-0" />
                    <span>{element.meta?.scheduleLocation}</span>
                  </div>
                )}
                {element.meta?.scheduleMembers && element.meta?.scheduleMembers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Users size={14} className="flex-shrink-0" />
                    <span>{element.meta?.scheduleMembers.join('、')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'quickAction':
        return (
          <div key={index} className="p-3">
            <div className="flex flex-wrap gap-2">
              {element.meta?.actions?.map((action, idx) => (
                <button
                  key={idx}
                  className={`inline-flex items-center gap-1.5 ${cardStyles.button.size} rounded-lg transition-colors ${
                    action.action === 'confirm' || action.action === 'batch_approve'
                      ? cardStyles.button.primary
                      : action.action === 'cancel'
                      ? cardStyles.button.secondary
                      : (isMe ? 'bg-mint-100 text-theme-600 hover:bg-mint-200' : 'bg-theme-50 dark:bg-theme-900/30 text-theme-600 dark:text-theme-400 hover:bg-theme-100 dark:hover:bg-theme-900/50')
                  }`}
                >
                  {action.icon === 'check' && <Check size={14} />}
                  {action.icon === 'edit' && <Edit3 size={14} />}
                  {action.icon === 'x' && <XCircle size={14} />}
                  {action.icon === 'search' && <Search size={14} />}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        );
      case 'form':
        const formConfig = cardStyles.header.colors.form;
        return (
          <div key={index} className={`rounded-lg ${isMe ? cardStyles.container.me : cardStyles.container.other} shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-2`}>
            <div className={`px-4 py-3 ${isMe ? 'bg-mint-100/50 dark:bg-mint-800/30' : formConfig.bg} border-b border-gray-100 dark:border-gray-700`}>
              <div className="flex items-center gap-2">
                <ClipboardList size={cardStyles.header.iconSize} className={formConfig.icon} />
                <span className={`${cardStyles.header.title.size} ${cardStyles.header.title.weight} ${isMe ? cardStyles.header.title.meColor : cardStyles.header.title.baseColor}`}>
                  {element.meta?.formTitle || '表单录入'}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {element.meta?.formFields?.map((field, idx) => (
                <div key={idx}>
                  <label className={`block text-xs font-medium ${isMe ? cardStyles.content.description.meColor : cardStyles.content.description.otherColor} mb-1`}>
                    {field.label}
                  </label>
                  {field.type === 'input' && (
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${isMe ? 'bg-white/80 border-gray-200 text-gray-700 placeholder-gray-400' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'} focus:outline-none focus:ring-2 focus:ring-theme-500/30`}
                    />
                  )}
                  {field.type === 'select' && (
                    <select className={`w-full px-3 py-2 text-sm rounded-lg border ${isMe ? 'bg-white/80 border-gray-200 text-gray-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'} focus:outline-none focus:ring-2 focus:ring-theme-500/30`}>
                      <option value="">{field.placeholder || '请选择'}</option>
                    </select>
                  )}
                  {field.type === 'date' && (
                    <input
                      type="date"
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${isMe ? 'bg-white/80 border-gray-200 text-gray-700' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'} focus:outline-none focus:ring-2 focus:ring-theme-500/30`}
                    />
                  )}
                  {field.type === 'textarea' && (
                    <textarea
                      placeholder={field.placeholder}
                      rows={2}
                      className={`w-full px-3 py-2 text-sm rounded-lg border ${isMe ? 'bg-white/80 border-gray-200 text-gray-700 placeholder-gray-400' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'} focus:outline-none focus:ring-2 focus:ring-theme-500/30 resize-none`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className={`px-4 py-3 ${isMe ? 'bg-gray-100/50' : 'bg-gray-50 dark:bg-gray-900/50'} border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2`}>
              <button className={`${cardStyles.button.secondary} ${cardStyles.button.size}`}>
                取消
              </button>
              <button className={`${cardStyles.button.primary} ${cardStyles.button.size} flex items-center gap-1`}>
                <Send size={14} />
                提交
              </button>
            </div>
          </div>
        );
      case 'approvalList':
        const approvalListConfig = cardStyles.header.colors.approvalList;
        return (
          <div key={index} className={`rounded-lg ${isMe ? cardStyles.container.me : cardStyles.container.other} shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mt-2`}>
            <div className={`px-4 py-3 ${isMe ? 'bg-purple-100/50' : approvalListConfig.bg} border-b border-gray-100 dark:border-gray-700`}>
              <div className="flex items-center gap-2">
                <ClipboardList size={cardStyles.header.iconSize} className={approvalListConfig.icon} />
                <span className={`${cardStyles.header.title.size} ${cardStyles.header.title.weight} ${isMe ? cardStyles.header.title.meColor : cardStyles.header.title.baseColor}`}>
                  待审批流程
                </span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {element.meta?.approvals?.map((approval, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className={`${cardStyles.content.title.size} ${cardStyles.content.title.weight} ${isMe ? cardStyles.content.title.meColor : cardStyles.content.title.otherColor}`}>
                      {approval.title}
                    </h4>
                    <div className={`flex items-center gap-2 mt-1 text-xs ${isMe ? cardStyles.content.description.meColor : cardStyles.content.description.otherColor}`}>
                      <span>{approval.applicant}</span>
                      <span>·</span>
                      <span>{approval.time}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs ${cardStyles.status[approval.status].bg} ${cardStyles.status[approval.status].text}`}>
                        {cardStyles.status[approval.status].label}
                      </span>
                    </div>
                  </div>
                  {approval.status === 'pending' && (
                    <button className={`ml-4 ${cardStyles.button.primary} ${cardStyles.button.size} flex items-center gap-1`}>
                      <CheckSquare size={14} />
                      去审批
                    </button>
                  )}
                  {approval.status !== 'pending' && (
                    <span className={`ml-4 px-3 py-1.5 text-sm font-medium rounded-lg ${cardStyles.status[approval.status].bg} ${cardStyles.status[approval.status].text}`}>
                      {cardStyles.status[approval.status].label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const mainContent = (() => {
    switch (chatMsg.type) {
      case 'image':
        return (
          <div className="p-1">
            <img
              src={chatMsg.meta?.url}
              alt={chatMsg.content}
              className="rounded-lg max-w-full max-h-64 object-cover cursor-pointer"
            />
            <p className={`text-xs px-2 pb-1 pt-1 ${isMe ? 'text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>{chatMsg.content}</p>
          </div>
        );
      case 'video':
        return (
          <div className="p-1 relative">
            <div className="relative rounded-lg overflow-hidden max-w-full max-h-64">
              <img
                src={chatMsg.meta?.thumbnail}
                alt={chatMsg.content}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                  <Play size={24} className="text-gray-800 ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                {chatMsg.meta?.duration}
              </div>
            </div>
            <p className={`text-xs px-2 pb-1 pt-1 ${isMe ? 'text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>{chatMsg.content}</p>
          </div>
        );
      case 'location':
        return (
          <div className={`p-3 ${isMe ? '' : ''}`}>
            <div className={`flex items-start gap-2 p-3 rounded-lg ${isMe ? 'bg-white/70' : 'bg-mint-100/50 dark:bg-mint-800/30'}`}>
              <MapPin size={20} className={`flex-shrink-0 mt-0.5 ${isMe ? 'text-gray-500' : 'text-theme-500'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isMe ? 'text-gray-700' : 'text-gray-900 dark:text-white'}`}>{chatMsg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>{chatMsg.meta?.address}</p>
                <a
                  href={chatMsg.meta?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs mt-2 inline-flex items-center gap-1 ${isMe ? 'text-gray-500 hover:text-gray-700' : 'text-theme-500 hover:text-theme-600'} transition-colors`}
                >
                  <ExternalLink size={12} />
                  查看地图
                </a>
              </div>
            </div>
          </div>
        );
      case 'link':
        return (
          <div className="p-1">
            <a
              href={chatMsg.meta?.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block rounded-lg overflow-hidden ${isMe ? 'bg-white/70 hover:bg-white/80 dark:bg-gray-700/30' : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'} p-3 transition-colors`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-mint-200' : 'bg-theme-500'}`}>
                  <LinkIcon size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium line-clamp-1 ${isMe ? 'text-gray-700' : 'text-gray-900 dark:text-white'}`}>
                    {chatMsg.meta?.linkTitle || chatMsg.meta?.url}
                  </p>
                  {chatMsg.meta?.linkDescription && (
                    <p className={`text-xs mt-1 line-clamp-2 ${isMe ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                      {chatMsg.meta?.linkDescription}
                    </p>
                  )}
                  <p className={`text-xs mt-1 ${isMe ? 'text-gray-400' : 'text-theme-500'}`}>
                    {chatMsg.meta?.url?.replace(/^https?:\/\//, '').split('/')[0]}
                  </p>
                </div>
              </div>
            </a>
          </div>
        );
      case 'file':
        const getFileIcon = (fileType?: string) => {
          switch (fileType) {
            case 'pdf':
              return <FileText size={20} />;
            case 'xlsx':
            case 'xls':
              return <FileText size={20} />;
            case 'doc':
            case 'docx':
              return <FileText size={20} />;
            case 'ppt':
            case 'pptx':
              return <FileText size={20} />;
            case 'zip':
            case 'rar':
              return <File size={20} />;
            default:
              return <File size={20} />;
          }
        };
        return (
          <div className="p-1">
            <a
              href={chatMsg.meta?.url || '#'}
              className={`block rounded-lg overflow-hidden ${isMe ? 'bg-white/70 hover:bg-white/80 dark:bg-gray-700/30' : 'bg-coral-50 hover:bg-coral-100'} p-3 transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-coral-200' : 'bg-coral-400'}`}>
                  <span className={`text-xs font-medium uppercase ${isMe ? 'text-coral-600' : 'text-white'}`}>{chatMsg.meta?.fileType || 'file'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium line-clamp-1 ${isMe ? 'text-gray-700' : 'text-gray-900 dark:text-white'}`}>
                    {chatMsg.meta?.fileName}
                  </p>
                  <div className={`flex items-center gap-2 mt-1 ${isMe ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    <span className="text-xs">{chatMsg.meta?.fileSize}</span>
                  </div>
                </div>
                <button
                  className={`p-2 rounded-lg ${isMe ? 'bg-coral-100 hover:bg-coral-200' : 'bg-coral-100 dark:bg-coral-800/30 hover:bg-coral-200 dark:hover:bg-coral-700/30'} transition-colors`}
                  onClick={(e) => e.preventDefault()}
                >
                  <Download size={16} className={isMe ? 'text-coral-500' : 'text-coral-600'} />
                </button>
              </div>
            </a>
          </div>
        );
      case 'videoMeeting':
        return (
          <div className={`p-3 ${isMe ? '' : ''}`}>
            <div className={`p-3 rounded-lg ${isMe ? 'bg-white/70' : 'bg-theme-100/50 dark:bg-theme-800/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Video size={18} className={`flex-shrink-0 ${isMe ? 'text-gray-500' : 'text-theme-500'}`} />
                <span className={`text-sm font-medium ${isMe ? 'text-gray-700' : 'text-gray-900 dark:text-white'}`}>{chatMsg.content}</span>
              </div>
              <div className={`flex items-center gap-2 text-xs mb-3 ${isMe ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {chatMsg.meta?.duration}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${chatMsg.meta?.status === 'ended' ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300' : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'}`}>
                  {chatMsg.meta?.status === 'ended' ? '已结束' : '进行中'}
                </span>
              </div>
              <div className={`flex items-center gap-2 text-xs mb-3 ${isMe ? 'text-gray-500' : 'text-gray-500 dark:text-gray-400'}`}>
                <span>会议 ID: {chatMsg.meta?.meetingId}</span>
              </div>
              <button
                className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                  chatMsg.meta?.status === 'ended'
                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : isMe ? 'bg-theme-500 text-white hover:bg-theme-600'
                    : 'bg-theme-500 text-white hover:bg-theme-600'
                }`}
                disabled={chatMsg.meta?.status === 'ended'}
              >
                {chatMsg.meta?.status === 'ended' ? '已结束' : '加入会议'}
              </button>
            </div>
          </div>
        );
      // ===== 如意助手新消息类型 - 简化为仅渲染content，因为elements会包含实际卡片 =====
      case 'form':
      case 'dataCard':
      case 'quickAction':
      case 'schedule':
      case 'approval':
      case 'approvalList':
      case 'knowledge':
        return (
          <div className="p-3">
            {chatMsg.content && (
              <p className={`text-sm leading-relaxed ${isMe ? 'text-gray-700' : 'text-gray-700 dark:text-gray-300'}`}>{chatMsg.content}</p>
            )}
          </div>
        );
      case 'text':
      default:
        return (
          <div className="p-3">
            <p className={`text-sm leading-relaxed ${isMe ? 'text-gray-700' : 'text-gray-700 dark:text-gray-300'}`}>{chatMsg.content}</p>
          </div>
        );
    }
  })();

  return (
    <>
      {mainContent}
      {/* 渲染 elements 数组 */}
      {chatMsg.elements && chatMsg.elements.length > 0 && (
        <div className="px-2 pb-2">
          {chatMsg.elements.map((element, index) => renderElement(element, index))}
        </div>
      )}
    </>
  );
}
