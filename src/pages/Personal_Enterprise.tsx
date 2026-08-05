import { Bell, TrendingUp, FileText, Calendar as CalendarIcon, Settings, Edit3, Plus, X, CheckCircle2, Eye, EyeOff, Layout, Layers, ChevronRight, MoreHorizontal, RefreshCw, ExternalLink, Trash2, ClipboardList, Sparkles, Target } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Minus, GripVertical } from 'lucide-react';
import { Ticket, WalletCards, Plane, BadgeCheck, CheckSquare, ListTodo, BarChart3, UserPlus, Link2, Save, CircleDot, CircleCheckBig } from 'lucide-react';
import { Landmark, Brain, Receipt, FileSignature, Calculator, Workflow, Users, LayoutDashboard, GraduationCap, Award, ClipboardCheck, Database, FileCheck, FolderKanban, Server, LineChart, Blocks, PieChart, Gauge, HardDrive, ShieldCheck, Truck, Hexagon, Shirt, Car, MessageSquare, Wrench, Fuel, BookMarked, Network, AlertTriangle, IterationCw, Shield, Clock, Zap, Volume2, Crown, Package, PackagePlus, Tag, Wallet, BarChart2, Activity, Globe, Smartphone, ShoppingBag, GitBranch, Phone, UserCheck, Repeat, Star, Briefcase, Sun, BookOpen, Paperclip, Send, Smile, AtSign, ImageIcon } from 'lucide-react';
import { MAIN_USER_NAME, getDemoPerson, getInitialsAvatar } from '../data/people';
import { workItems, WorkItem, WorkItemTask, WorkItemType } from '../data/workItems';

// 定义卡片类型
type CardType = 'stats' | 'process' | 'documents' | 'projects' | 'calendar' | 'systems' | 'officeApps' | 'duty' | 'courses';

// 卡片配置接口
interface CardConfig {
  id: CardType;
  name: string;
  icon: React.ReactNode;
  visible: boolean;
  order: number;
}

type System = {
  id: string;
  name: string;
  icon: React.ReactNode;
  bgColor?: string;
  category?: string;
  source?: string;
  description?: string;
};

type StatKey = 'approval' | 'revenue' | 'todo' | 'progress';
type DialogType = 'approvalConfig' | 'todoSources' | 'newTodo' | 'createWorkItem' | 'commonFeatures' | 'cardRequest' | 'featureRequest' | null;
type PersonalView = 'dashboard' | 'todo' | 'workItemBoard' | 'itemDetail' | 'taskCreate' | 'reportSubmit' | 'evaluationSubmit';
type WorkItemReturnView = 'todo' | 'workItemBoard' | 'itemDetail';

type StatConfig = {
  key: StatKey;
  title: string;
  count?: string;
  amount?: string;
  change?: string;
  color: 'pink' | 'green' | 'amber' | 'blue';
  summary: string;
};

type CommonFeature = {
  id: string;
  name: string;
  icon: React.ReactNode;
  tone: string;
  path?: string;
  destination?: string;
};

type TodoSource = {
  id: string;
  name: string;
  enabled: boolean;
};

type TodoItem = {
  id: string;
  title: string;
  source: string;
  owner: string;
  due: string;
  status: string;
  progress?: number;
  subtasks?: { name: string; owner: string; progress: number }[];
};

type TrackedItem = {
  id: string;
  title: string;
  source: 'okr' | 'project';
  owner: string;
  progress: number;
  status: string;
  tasks: { name: string; owner: string; progress: number }[];
};

type MyTodoAction = {
  id: string;
  itemId: string;
  title: string;
  itemTitle: string;
  source: string;
  due: string;
  status: string;
  progress: number;
  actionLabel: string;
  kind: 'report' | 'task' | 'evaluation';
  taskId?: string;
};

type TodoQueueEntry = {
  id: string;
  title: string;
  source: string;
  due: string;
  status: string;
  actionLabel: string;
  group: string;
  relation: string;
  kind: 'report' | 'task' | 'evaluation' | 'external';
  progress?: number;
  itemId?: string;
  taskId?: string;
};

type ProgressFilter = '全部' | '我负责' | '我参与' | '风险' | '待填报' | '已完成';
type ProgressSort = '风险优先' | '截止时间' | '进度最低' | '最近更新';
type DetailContext = {
  returnView: 'todo' | 'workItemBoard';
  focusTaskId?: string;
  focusActionId?: string;
};

type WorkItemActivity = {
  id: string;
  type: '事项汇报' | '团队评价' | '任务' | '子任务' | '执行记录' | '数据来源' | '动态';
  title: string;
  actor: string;
  time: string;
  tone: string;
  order: number;
};

type ApprovalProcess = {
  id: string;
  title: string;
  code: string;
  creator: string;
  time: string;
  location: string;
  sourceSystem: string;
};

type DutyItem = {
  post: string;
  user: string;
};

type RequestDraft = {
  name: string;
  type: string;
  domain: string;
  description: string;
};

// 初始化卡片配置
const initialCards: CardConfig[] = [
  { id: 'stats', name: '数据概览', icon: <TrendingUp size={20} />, visible: true, order: 0 },
  { id: 'documents', name: '今日未读文档', icon: <FileText size={20} />, visible: true, order: 1 },
  { id: 'calendar', name: '周历', icon: <CalendarIcon size={20} />, visible: true, order: 2 },
  { id: 'systems', name: '常用系统', icon: <Layout size={20} />, visible: true, order: 3 },
  { id: 'officeApps', name: '常用功能', icon: <ClipboardList size={20} />, visible: true, order: 4 },
  { id: 'duty', name: '今日值班', icon: <Bell size={20} />, visible: true, order: 5 },
  { id: 'courses', name: '临期课程', icon: <FileText size={20} />, visible: true, order: 6 },
];

const businessSystems: System[] = [
  { id: 'bip', name: 'BIP系统', icon: <Landmark size={16} />, bgColor: 'bg-amber-500', category: '财务系统', source: '业务系统', description: '财务综合管理平台' },
  { id: 'fai', name: '财翼融合智能平台FAI', icon: <Brain size={16} />, bgColor: 'bg-amber-500', category: '财务系统', source: '业务系统', description: '财务智能分析平台' },
  { id: 'expense', name: '费控商旅系统', icon: <Receipt size={16} />, bgColor: 'bg-orange-500', category: '财务系统', source: '业务系统', description: '费控与商旅管理' },
  { id: 'contract', name: '合同管理系统', icon: <FileSignature size={16} />, bgColor: 'bg-yellow-500', category: '财务系统', source: '业务系统', description: '合同审批和履约管理' },
  { id: 'tax', name: '税务管理系统', icon: <Calculator size={16} />, bgColor: 'bg-amber-600', category: '财务系统', source: '业务系统', description: '税务申报管理' },
  { id: 'seeyon', name: '致远系统', icon: <Workflow size={16} />, bgColor: 'bg-orange-600', category: '财务系统', source: '业务系统', description: '协同办公系统' },
  { id: 'nc', name: 'NC系统', icon: <BookOpen size={16} />, bgColor: 'bg-yellow-600', category: '财务系统', source: '业务系统', description: '财务核算系统' },
  { id: 'ehr', name: '人力资源E-HR系统', icon: <Users size={16} />, bgColor: 'bg-blue-500', category: '人力系统', source: '业务系统', description: '员工信息、考勤、薪资等人力服务' },
  { id: 'ioffice', name: 'ioffice', icon: <LayoutDashboard size={16} />, bgColor: 'bg-indigo-500', category: '人力系统', source: '业务系统', description: '办公协同入口' },
  { id: 'school', name: '梧桐云学堂', icon: <GraduationCap size={16} />, bgColor: 'bg-violet-500', category: '人力系统', source: '业务系统', description: '企业在线学习平台' },
  { id: 'performance', name: '绩效系统', icon: <Award size={16} />, bgColor: 'bg-purple-500', category: '人力系统', source: '业务系统', description: '员工绩效考核管理' },
  { id: 'performance-nj', name: '绩效系统南京分公司', icon: <Award size={16} />, bgColor: 'bg-pink-500', category: '人力系统', source: '业务系统', description: '南京分公司绩效管理' },
  { id: 'performance-af', name: '绩效系统航服子公司', icon: <Award size={16} />, bgColor: 'bg-rose-500', category: '人力系统', source: '业务系统', description: '航服子公司绩效管理' },
  { id: 'assessment', name: '考评系统', icon: <ClipboardCheck size={16} />, bgColor: 'bg-violet-600', category: '人力系统', source: '业务系统', description: '员工考评管理系统' },
  { id: 'referral', name: '内推系统', icon: <UserPlus size={16} />, bgColor: 'bg-indigo-600', category: '人力系统', source: '业务系统', description: '内部推荐管理系统' },
  { id: 'hr-digital', name: '人力数字平台管理系统', icon: <Database size={16} />, bgColor: 'bg-blue-600', category: '人力系统', source: '业务系统', description: '人力资源数字化管理平台' },
  { id: 'oa', name: 'OA', icon: <FileCheck size={16} />, bgColor: 'bg-purple-500', category: '综合系统', source: '业务系统', description: '办公自动化系统' },
  { id: 'knowledge', name: '吉祥知识平台', icon: <BookOpen size={16} />, bgColor: 'bg-violet-500', category: '综合系统', source: '业务系统', description: '企业知识平台' },
  { id: 'pm', name: '企业项目管理平台', icon: <FolderKanban size={16} />, bgColor: 'bg-indigo-500', category: '综合系统', source: '业务系统', description: '项目计划和进度管理' },
  { id: 'itops', name: '运维管理平台', icon: <Server size={16} />, bgColor: 'bg-sky-500', category: '综合系统', source: '业务系统', description: 'IT运维管理平台' },
  { id: 'data-portal', name: '公司数据门户', icon: <BarChart3 size={16} />, bgColor: 'bg-blue-500', category: '综合系统', source: '业务系统', description: '公司数据统一入口' },
  { id: 'bi', name: '公司BI平台', icon: <LineChart size={16} />, bgColor: 'bg-cyan-500', category: '综合系统', source: '业务系统', description: '经营分析平台' },
  { id: 'lowcode', name: '低代码平台', icon: <Blocks size={16} />, bgColor: 'bg-emerald-500', category: '综合系统', source: '业务系统', description: '低代码应用搭建' },
  { id: 'analysis', name: '综合数据分析平台', icon: <PieChart size={16} />, bgColor: 'bg-teal-500', category: '综合系统', source: '业务系统', description: '综合数据分析' },
  { id: 'dap', name: '聚数搭数据分析平台', icon: <Gauge size={16} />, bgColor: 'bg-cyan-600', category: '综合系统', source: '业务系统', description: '数据分析平台' },
  { id: 'dw', name: '数据仓库管理系统', icon: <HardDrive size={16} />, bgColor: 'bg-slate-600', category: '综合系统', source: '业务系统', description: '数据仓库管理' },
  { id: 'data-govern', name: '荆棘数据治理平台', icon: <ShieldCheck size={16} />, bgColor: 'bg-emerald-600', category: '综合系统', source: '业务系统', description: '数据治理平台' },
  { id: 'logistics-data', name: '物流数据中台', icon: <Truck size={16} />, bgColor: 'bg-green-600', category: '综合系统', source: '业务系统', description: '物流数据中台' },
  { id: 'csa', name: 'CSA系统', icon: <Hexagon size={16} />, bgColor: 'bg-indigo-600', category: '综合系统', source: '业务系统', description: '综合业务支撑' },
  { id: 'clothing', name: '服装模具管理系统', icon: <Shirt size={16} />, bgColor: 'bg-pink-600', category: '综合系统', source: '业务系统', description: '服装模具资产管理' },
  { id: 'vehicle', name: '车辆管理系统', icon: <Car size={16} />, bgColor: 'bg-gray-600', category: '综合系统', source: '业务系统', description: '车辆资产管理' },
  { id: 'sms', name: 'SMS系统', icon: <MessageSquare size={16} />, bgColor: 'bg-emerald-500', category: '运行系统', source: '业务系统', description: '短信服务管理系统' },
  { id: 'prepare', name: '网上准备', icon: <ClipboardList size={16} />, bgColor: 'bg-teal-500', category: '运行系统', source: '业务系统', description: '网上准备工作管理' },
  { id: 'flight', name: '航班动态', icon: <Plane size={16} />, bgColor: 'bg-cyan-500', category: '运行系统', source: '业务系统', description: '航班实时动态查询' },
  { id: 'maintenance', name: '机务维修', icon: <Wrench size={16} />, bgColor: 'bg-green-500', category: '运行系统', source: '业务系统', description: '机务维修管理' },
  { id: 'fuel', name: '燃油监控系统', icon: <Fuel size={16} />, bgColor: 'bg-lime-500', category: '运行系统', source: '业务系统', description: '燃油消耗监控' },
  { id: 'manual', name: '维修手册系统', icon: <BookMarked size={16} />, bgColor: 'bg-emerald-600', category: '运行系统', source: '业务系统', description: '维修手册查阅' },
  { id: 'self-check', name: '法定自查', icon: <Search size={16} />, bgColor: 'bg-teal-600', category: '运行系统', source: '业务系统', description: '法定自查管理' },
  { id: 'operation-net', name: '运行网', icon: <Network size={16} />, bgColor: 'bg-green-600', category: '运行系统', source: '业务系统', description: '运行网络管理' },
  { id: 'eg-admin', name: 'e吉祥管理后台', icon: <Settings size={16} />, bgColor: 'bg-cyan-600', category: '运行系统', source: '业务系统', description: '管理后台系统' },
  { id: 'risk', name: '运行风控系统', icon: <AlertTriangle size={16} />, bgColor: 'bg-emerald-700', category: '运行系统', source: '业务系统', description: '风险控制管理' },
  { id: 'plm', name: 'PLM系统', icon: <IterationCw size={16} />, bgColor: 'bg-teal-700', category: '运行系统', source: '业务系统', description: '产品生命周期管理' },
  { id: 'security', name: '航空安保管理系统', icon: <Shield size={16} />, bgColor: 'bg-green-700', category: '运行系统', source: '业务系统', description: '航空安保管理' },
  { id: 'punctuality', name: '航班正常性管理平台', icon: <Clock size={16} />, bgColor: 'bg-sky-600', category: '运行系统', source: '业务系统', description: '航班正常性管理' },
  { id: 'emergency', name: '应急管理平台', icon: <Zap size={16} />, bgColor: 'bg-red-500', category: '运行系统', source: '业务系统', description: '应急管理平台' },
  { id: 'market-admin', name: '营销服务后台管理系统', icon: <Volume2 size={16} />, bgColor: 'bg-pink-500', category: '营销系统', source: '业务系统', description: '营销服务后台' },
  { id: 'member', name: '会员管理系统', icon: <Crown size={16} />, bgColor: 'bg-rose-500', category: '营销系统', source: '业务系统', description: '会员管理' },
  { id: 'air-product', name: '航空业务产品管理平台', icon: <Package size={16} />, bgColor: 'bg-pink-600', category: '营销系统', source: '业务系统', description: '航空业务产品管理' },
  { id: 'nonair-product', name: '非航业务产品管理系统', icon: <PackagePlus size={16} />, bgColor: 'bg-rose-600', category: '营销系统', source: '业务系统', description: '非航产品管理' },
  { id: 'precision', name: '精准营销', icon: <Target size={16} />, bgColor: 'bg-pink-700', category: '营销系统', source: '业务系统', description: '精准营销触达' },
  { id: 'domestic-price', name: '国内运价管理系统', icon: <Tag size={16} />, bgColor: 'bg-rose-500', category: '营销系统', source: '业务系统', description: '国内运价管理' },
  { id: 'settlement', name: '收入结算系统', icon: <Wallet size={16} />, bgColor: 'bg-pink-500', category: '营销系统', source: '业务系统', description: '收入结算' },
  { id: 'revenue', name: '收益管理系统', icon: <TrendingUp size={16} />, bgColor: 'bg-rose-600', category: '营销系统', source: '业务系统', description: '收益管理' },
  { id: 'report', name: '吉祥报表系统', icon: <BarChart2 size={16} />, bgColor: 'bg-pink-600', category: '营销系统', source: '业务系统', description: '营销报表' },
  { id: 'dynamic', name: '吉祥动态运行系统', icon: <Activity size={16} />, bgColor: 'bg-rose-700', category: '营销系统', source: '业务系统', description: '动态运行监控' },
  { id: 'message', name: '统一消息平台', icon: <Bell size={16} />, bgColor: 'bg-pink-500', category: '营销系统', source: '业务系统', description: '统一消息平台' },
  { id: 'cn-site', name: '中文网站', icon: <Globe size={16} />, bgColor: 'bg-rose-500', category: '营销系统', source: '业务系统', description: '中文官网' },
  { id: 'intl-site', name: '国际网站', icon: <Globe size={16} />, bgColor: 'bg-pink-600', category: '营销系统', source: '业务系统', description: '国际官网' },
  { id: 'm-site', name: '吉祥航空M网站', icon: <Smartphone size={16} />, bgColor: 'bg-rose-600', category: '营销系统', source: '业务系统', description: '移动官网' },
  { id: 'mall', name: '吉祥航空生活电商平台', icon: <ShoppingBag size={16} />, bgColor: 'bg-pink-700', category: '营销系统', source: '业务系统', description: '生活电商平台' },
  { id: 'pipeline', name: '研发流水线', icon: <GitBranch size={16} />, bgColor: 'bg-rose-500', category: '营销系统', source: '业务系统', description: '研发流水线' },
  { id: 'call', name: '呼叫中心系统', icon: <Phone size={16} />, bgColor: 'bg-pink-500', category: '营销系统', source: '业务系统', description: '呼叫中心' },
  { id: 'passenger', name: '旅客服务系统', icon: <UserCheck size={16} />, bgColor: 'bg-rose-600', category: '营销系统', source: '业务系统', description: '旅客服务' },
  { id: 'transfer', name: '中转管理系统', icon: <Repeat size={16} />, bgColor: 'bg-pink-600', category: '营销系统', source: '业务系统', description: '中转管理' },
  { id: 'vip-room', name: '智慧贵宾室系统', icon: <Star size={16} />, bgColor: 'bg-rose-700', category: '营销系统', source: '业务系统', description: '贵宾室管理' },
  { id: 'baggage', name: '行李全流程跟踪系统', icon: <Briefcase size={16} />, bgColor: 'bg-pink-700', category: '营销系统', source: '业务系统', description: '行李全流程跟踪' },
];

const defaultSystemIds = [
  'oa',
  'bip',
  'fai',
  'expense',
  'flight',
  'maintenance',
  'data-portal',
  'pm',
  'itops',
  'bi',
  'ehr',
  'ioffice',
  'school',
  'revenue',
  'member',
  'knowledge',
];
const systemCategories = ['财务系统', '人力系统', '综合系统', '运行系统', '营销系统'];
const selectedSystemsPresetKey = 'selectedSystemsPreset20260703v2';
const defaultFeaturePresetKey = 'pinnedCommonFeatures20260705v2';

const dashboardStats: StatConfig[] = [
  { key: 'approval', title: '流程审批', count: '21', color: 'pink', summary: '待批阅流程' },
  { key: 'revenue', title: '业务收入', amount: '¥12,580,000', change: '+12.5%', color: 'green', summary: '业务收入明细' },
  { key: 'todo', title: '待办事项', count: '10', color: 'amber', summary: '事项列表' },
  { key: 'progress', title: '事项进度', count: '15', color: 'blue', summary: '关注事项进度' },
];

const commonFeatures: CommonFeature[] = [
  { id: 'flight-status', name: '航班动态', icon: <Plane size={17} />, tone: 'bg-cyan-50 text-cyan-700', path: '/web_client/business' },
  { id: 'work-report', name: '工作汇报', icon: <FileText size={17} />, tone: 'bg-pink-50 text-pink-700', path: '/web_client/work-report' },
  { id: 'okr', name: 'OKR', icon: <Target size={17} />, tone: 'bg-blue-50 text-blue-700', path: '/web_client/okr' },
  { id: 'discount-ticket', name: '优惠票', icon: <Ticket size={17} />, tone: 'bg-amber-50 text-amber-700', destination: '优惠票' },
  { id: 'salary', name: '我的薪酬', icon: <WalletCards size={17} />, tone: 'bg-emerald-50 text-emerald-700', destination: '我的薪酬' },
  { id: 'leave', name: '我的休假', icon: <Sun size={17} />, tone: 'bg-sky-50 text-sky-700', destination: '我的休假' },
  { id: 'certificate', name: '证明开具', icon: <BadgeCheck size={17} />, tone: 'bg-violet-50 text-violet-700', destination: '证明开具' },
];

const defaultPinnedFeatureIds = ['flight-status', 'work-report', 'okr', 'discount-ticket', 'salary', 'leave', 'certificate'];

const defaultTodoSources: TodoSource[] = [
  { id: 'task', name: '任务', enabled: true },
  { id: 'report', name: '工作汇报', enabled: true },
  { id: 'okr', name: 'OKR填报', enabled: true },
  { id: 'project', name: '项目任务', enabled: false },
];

const todoItems: TodoItem[] = [
  { id: 'todo-1', title: '完成本周工作汇报', source: '工作汇报', owner: MAIN_USER_NAME, due: '今天 18:00', status: '待提交', progress: 30 },
  { id: 'todo-2', title: '补充二季度OKR进展', source: 'OKR填报', owner: MAIN_USER_NAME, due: '明天 12:00', status: '进行中', progress: 60 },
  { id: 'todo-3', title: '处理服务台权限审批', source: '任务', owner: MAIN_USER_NAME, due: '今天 17:30', status: '待处理', progress: 20 },
  { id: 'todo-4', title: '数据看板需求评审纪要确认', source: '项目任务', owner: MAIN_USER_NAME, due: '周五', status: '待确认', progress: 45 },
];

const approvalProcesses: ApprovalProcess[] = [
  { id: 'approval-1', title: '关于开展2026年第二期黄沙活动的预告', code: 'TSP-2026-0073', creator: getDemoPerson(0), time: '2026-05-10 12:42:33', location: '4执行', sourceSystem: 'OA系统' },
  { id: 'approval-2', title: '关于高乐飞机涂装宣传', code: 'TSP-2026-0074', creator: getDemoPerson(0), time: '2026-05-10 15:11:53', location: '4执行', sourceSystem: 'IT需求提报' },
  { id: 'approval-3', title: '关于航空安保系统的上传固件申请', code: 'TSP-2026-0075', creator: getDemoPerson(2), time: '2026-05-10 13:36:19', location: '4执行', sourceSystem: 'SMS安全管理系统' },
  { id: 'approval-4', title: '差旅费用报销审批', code: 'FEE-2026-0311', creator: getDemoPerson(3), time: '2026-05-10 16:22:48', location: '部门负责人审批', sourceSystem: '费控商旅' },
  { id: 'approval-5', title: '知识库内容发布复核', code: 'KB-2026-0198', creator: getDemoPerson(17), time: '2026-05-11 09:18:02', location: '内容管理员审批', sourceSystem: '吉祥知识平台' },
];

const dutySchedule: Record<number, { date: string; label: string; items: DutyItem[] }> = {
  [-1]: {
    date: '2026年5月20日',
    label: '昨天',
    items: [
      { post: '公司值班领导', user: getDemoPerson(5) },
      { post: '公司总值班', user: getDemoPerson(6) },
      { post: '签派带班主任', user: getDemoPerson(7) },
      { post: '维修技术支持经理', user: getDemoPerson(8) },
      { post: '飞行技术支持经理', user: getDemoPerson(12) },
      { post: '服务保障支持经理', user: getDemoPerson(16) },
      { post: '江苏分公司', user: getDemoPerson(10) },
      { post: '飞行部', user: getDemoPerson(13) },
      { post: '工程部', user: getDemoPerson(11) },
    ],
  },
  0: {
    date: '2026年5月21日',
    label: '今天',
    items: [
      { post: '公司值班领导', user: MAIN_USER_NAME },
      { post: '公司总值班', user: getDemoPerson(12) },
      { post: '签派带班主任', user: getDemoPerson(13) },
      { post: '维修技术支持经理', user: getDemoPerson(14) },
      { post: '飞行技术支持经理', user: getDemoPerson(16) },
      { post: '服务保障支持经理', user: getDemoPerson(7) },
      { post: '江苏分公司', user: getDemoPerson(15) },
      { post: '飞行部', user: getDemoPerson(8) },
      { post: '工程部', user: getDemoPerson(11) },
    ],
  },
  1: {
    date: '2026年5月22日',
    label: '明天',
    items: [
      { post: '公司值班领导', user: getDemoPerson(12) },
      { post: '公司总值班', user: getDemoPerson(13) },
      { post: '签派带班主任', user: getDemoPerson(7) },
      { post: '维修技术支持经理', user: getDemoPerson(11) },
      { post: '飞行技术支持经理', user: MAIN_USER_NAME },
      { post: '服务保障支持经理', user: getDemoPerson(10) },
      { post: '江苏分公司', user: getDemoPerson(6) },
      { post: '飞行部', user: getDemoPerson(15) },
      { post: '工程部', user: getDemoPerson(14) },
    ],
  },
};

const revenueDetails = [
  { name: '客运收入', value: '¥8,920,000', change: '+9.8%', owner: '市场收益中心' },
  { name: '辅营收入', value: '¥2,140,000', change: '+15.6%', owner: '产品运营中心' },
  { name: '会员营销收入', value: '¥1,520,000', change: '+18.2%', owner: '会员运营组' },
];

const defaultTrackedItems: TrackedItem[] = [
  {
    id: 'track-1',
    title: 'O1 客服知识库质检闭环',
    source: 'okr',
    owner: getDemoPerson(16),
    progress: 68,
    status: '关联OKR',
    tasks: [
      { name: '问题样本归类', owner: getDemoPerson(16), progress: 100 },
      { name: '知识条目补齐', owner: getDemoPerson(17), progress: 70 },
      { name: '质检回归验证', owner: MAIN_USER_NAME, progress: 35 },
    ],
  },
  {
    id: 'track-2',
    title: '项目：数据看板改版验收',
    source: 'project',
    owner: MAIN_USER_NAME,
    progress: 75,
    status: '项目进展',
    tasks: [
      { name: 'KR1 A产品营收8000万元', owner: getDemoPerson(18), progress: 95 },
      { name: 'KR2 优化营业成本结构', owner: getDemoPerson(19), progress: 50 },
      { name: 'KR3 规范内部审批制度', owner: getDemoPerson(20), progress: 60 },
    ],
  },
];

const statToneMap = {
  pink: { border: 'border-pink-200', text: 'text-pink-700', bg: 'bg-pink-50', gradient: 'from-pink-700 to-pink-900', ring: 'ring-pink-100' },
  green: { border: 'border-green-200', text: 'text-green-700', bg: 'bg-green-50', gradient: 'from-green-600 to-green-800', ring: 'ring-green-100' },
  amber: { border: 'border-amber-200', text: 'text-amber-700', bg: 'bg-amber-50', gradient: 'from-amber-600 to-amber-800', ring: 'ring-amber-100' },
  blue: { border: 'border-blue-200', text: 'text-blue-700', bg: 'bg-blue-50', gradient: 'from-blue-600 to-blue-800', ring: 'ring-blue-100' },
};

function deriveMyTodoActions(items: WorkItem[]): MyTodoAction[] {
  const actions: MyTodoAction[] = [];

  items.forEach(item => {
    if (item.members.includes(MAIN_USER_NAME) && item.status === '待填报') {
      actions.push({
        id: `report-${item.id}`,
        itemId: item.id,
        title: `提交“${item.title}”事项汇报`,
        itemTitle: item.title,
        source: '事项',
        due: item.deadline,
        status: '待填报',
        progress: item.progress,
        actionLabel: '提交事项汇报',
        kind: 'report',
      });
    }

    item.tasks
      .filter(task => task.assignee === MAIN_USER_NAME && task.status !== '已完成')
      .forEach(task => {
        actions.push({
          id: `task-${task.id}`,
          itemId: item.id,
          taskId: task.id,
          title: task.title,
          itemTitle: item.title,
          source: '事项',
          due: task.due,
          status: task.status,
          progress: task.progress,
          actionLabel: task.status === '延期' ? '处理延期' : '去处理',
          kind: 'task',
        });
      });

    if (
      item.members.includes(MAIN_USER_NAME) &&
      !item.comments.some(comment => comment.author === MAIN_USER_NAME && comment.targetType === '事项' && comment.targetId === item.id)
    ) {
      actions.push({
        id: `eval-${item.id}`,
        itemId: item.id,
        title: `评价“${item.title}”本期推进`,
        itemTitle: item.title,
        source: '事项',
        due: item.reportCycle,
        status: '待评价',
        progress: item.progress,
        actionLabel: '写评价',
        kind: 'evaluation',
      });
    }
  });

  return actions.sort((a, b) => {
    const score = (action: MyTodoAction) => (action.status.includes('延期') ? 0 : action.due.includes('今天') ? 1 : 2);
    return score(a) - score(b);
  });
}

function deriveMyTrackedWorkItems(items: WorkItem[]) {
  return items
    .filter(item => item.owner === MAIN_USER_NAME || item.members.includes(MAIN_USER_NAME))
    .sort((a, b) => {
      const riskScore = { 风险: 0, 关注: 1, 正常: 2 } as Record<WorkItem['riskLevel'], number>;
      return riskScore[a.riskLevel] - riskScore[b.riskLevel] || b.progress - a.progress;
    });
}

function getRiskTone(riskLevel: WorkItem['riskLevel']) {
  if (riskLevel === '风险') return 'bg-red-50 text-red-700 border-red-100';
  if (riskLevel === '关注') return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-emerald-50 text-emerald-700 border-emerald-100';
}

function getMyWorkItemRole(item: WorkItem) {
  if (item.owner === MAIN_USER_NAME) return '负责';
  if (item.members.includes(MAIN_USER_NAME)) return '参与';
  return '关注';
}

function getWorkItemActivities(item: WorkItem): WorkItemActivity[] {
  const taskById = new Map(item.tasks.map(task => [task.id, task.title]));
  const reportActivities = item.reports.map((report, index) => ({
    id: report.id,
    type: '事项汇报' as const,
    title: `${report.source}：${report.thisPeriod}`,
    actor: report.member,
    time: report.submittedAt,
    tone: 'bg-pink-50 text-pink-700',
    order: 500 - index,
  }));
  const commentActivities = item.comments.map((comment, index) => ({
    id: comment.id,
    type: '团队评价' as const,
    title: `${comment.attitude}：${comment.content}`,
    actor: comment.author,
    time: comment.createdAt,
    tone: 'bg-blue-50 text-blue-700',
    order: 600 - index,
  }));
  const executionActivities = item.tasks.flatMap((task, taskIndex) => task.executionReports.map((report, reportIndex) => ({
    id: report.id,
    type: '执行记录' as const,
    title: `${task.title}：${report.summary}`,
    actor: report.reporter,
    time: report.submittedAt,
    tone: report.risk && report.risk !== '暂无' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700',
    order: 700 - taskIndex * 10 - reportIndex,
  })));
  const taskActivities = item.tasks.map((task, index) => ({
    id: task.id,
    type: task.parentId ? '子任务' as const : '任务' as const,
    title: task.parentId ? `${taskById.get(task.parentId) || '父任务'} / ${task.title}` : task.title,
    actor: task.owner,
    time: task.due,
    tone: task.parentId ? 'bg-violet-50 text-violet-700' : 'bg-amber-50 text-amber-700',
    order: 200 - index,
  }));
  const timelineActivities = item.timeline.map((time, index) => ({
    id: time.id,
    type: '动态' as const,
    title: time.action,
    actor: time.actor,
    time: time.time,
    tone: 'bg-gray-100 text-gray-700',
    order: 400 - index,
  }));
  const sourceActivities = item.sourceRefs.map((source, index) => ({
    id: source.id,
    type: '数据来源' as const,
    title: `${source.type}：${source.title}`,
    actor: source.status,
    time: item.reportCycle,
    tone: source.status === '已接入' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700',
    order: 100 - index,
  }));

  return [...executionActivities, ...commentActivities, ...reportActivities, ...timelineActivities, ...taskActivities, ...sourceActivities]
    .sort((a, b) => b.order - a.order);
}

function getWorkItemCollaborationStats(item: WorkItem) {
  return {
    tasks: item.tasks.filter(task => !task.parentId).length,
    subtasks: item.tasks.filter(task => task.parentId).length,
    reports: item.reports.length,
    comments: item.comments.length,
    unfinished: item.tasks.filter(task => task.status !== '已完成').length,
    sources: item.sourceRefs.length,
    executionReports: item.tasks.reduce((sum, task) => sum + task.executionReports.length, 0),
  };
}

function getLatestWorkItemActivity(item: WorkItem) {
  return getWorkItemActivities(item)[0]?.title || item.latestReport;
}

export default function Personal_Enterprise() {
  const navigate = useNavigate();
  // 卡片配置状态
  const [cards, setCards] = useState<CardConfig[]>(() => {
    const saved = localStorage.getItem('dashboardCards');
    if (!saved) return initialCards;
    const savedCards = JSON.parse(saved) as CardConfig[];
    const mergedCards = initialCards.map(card => savedCards.find(savedCard => savedCard.id === card.id) || card);
    return mergedCards.sort((a, b) => a.order - b.order);
  });
  
  // 系统选择状态
  const [systems, setSystems] = useState<System[]>(() => {
    return businessSystems;
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [showCommonAppsPanel, setShowCommonAppsPanel] = useState(false);
  const [showAddAppModal, setShowAddAppModal] = useState(false);
  const [activeStatKey, setActiveStatKey] = useState<StatKey>('approval');
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [personalView, setPersonalView] = useState<PersonalView>('dashboard');
  const [workItemList, setWorkItemList] = useState<WorkItem[]>(workItems);
  const [selectedWorkItemId, setSelectedWorkItemId] = useState(workItems[0]?.id ?? '');
  const [detailContext, setDetailContext] = useState<DetailContext>({ returnView: 'workItemBoard' });
  const [workItemFlowReturnView, setWorkItemFlowReturnView] = useState<WorkItemReturnView>('workItemBoard');
  const [layoutCategory, setLayoutCategory] = useState<'data' | 'app'>('data');
  const [appSearch, setAppSearch] = useState('');
  const [activeSystemCategory, setActiveSystemCategory] = useState(systemCategories[0]);
  const layoutContentRef = useRef<HTMLDivElement>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [jumpTip, setJumpTip] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [dutyDayOffset, setDutyDayOffset] = useState<keyof typeof dutySchedule>(0);
  const [dutyKeyword, setDutyKeyword] = useState('');
  const [draggingCardId, setDraggingCardId] = useState<CardType | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<CardType | null>(null);
  const [requestDraft, setRequestDraft] = useState<RequestDraft>({
    name: '',
    type: '数据卡片',
    domain: '管理',
    description: '',
  });
  const [approvalDisplayCount, setApprovalDisplayCount] = useState(() => {
    const saved = Number(localStorage.getItem('approvalDisplayCount'));
    return Number.isFinite(saved) && saved > 0 ? saved : 3;
  });
  const [customTodos, setCustomTodos] = useState<TodoItem[]>(() => {
    const saved = localStorage.getItem('customDashboardTodos');
    if (!saved) return [];
    try {
      return JSON.parse(saved) as TodoItem[];
    } catch {
      return [];
    }
  });
  const [hiddenStatKeys, setHiddenStatKeys] = useState<StatKey[]>(() => {
    const saved = localStorage.getItem('hiddenDashboardStats');
    if (!saved) return [];
    try {
      return JSON.parse(saved) as StatKey[];
    } catch {
      return [];
    }
  });
  const [newTodoDraft, setNewTodoDraft] = useState({
    title: '手动新增任务',
    owner: MAIN_USER_NAME,
    progress: '20',
    subtasks: [
      { name: '拆解子任务', owner: '待指派', progress: '0' },
      { name: '同步任务进展', owner: '协作人', progress: '40' },
    ],
  });
  const [workItemCreateDraft, setWorkItemCreateDraft] = useState({
    title: '',
    description: '',
    type: '专项推进' as WorkItemType,
    deadline: '2026-08-15',
  });
  const [workItemReportDraft, setWorkItemReportDraft] = useState({
    thisPeriod: '',
    nextPlan: '',
    risk: '',
    progress: 70,
  });
  const [workItemReportTaskId, setWorkItemReportTaskId] = useState<string | undefined>(undefined);
  const [workItemTaskDraft, setWorkItemTaskDraft] = useState({
    title: '',
    owner: MAIN_USER_NAME,
    due: '',
  });
  const [workItemCommentDraft, setWorkItemCommentDraft] = useState('');
  const [workItemTaskParentId, setWorkItemTaskParentId] = useState<string | undefined>(undefined);
  const [todoSources, setTodoSources] = useState<TodoSource[]>(() => {
    const saved = localStorage.getItem('dashboardTodoSources');
    if (!saved) return defaultTodoSources;
    try {
      const parsed = JSON.parse(saved) as TodoSource[];
      return defaultTodoSources.map(source => parsed.find(item => item.id === source.id) || source);
    } catch {
      return defaultTodoSources;
    }
  });
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>(() => {
    const saved = localStorage.getItem('dashboardTrackedItems');
    if (!saved) return defaultTrackedItems;
    try {
      const parsed = JSON.parse(saved) as TrackedItem[];
      return parsed.length > 0 ? parsed : defaultTrackedItems;
    } catch {
      return defaultTrackedItems;
    }
  });
  const [pinnedFeatureIds, setPinnedFeatureIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('pinnedCommonFeatures');
    if (!saved) return defaultPinnedFeatureIds;
    try {
      const parsed = JSON.parse(saved) as string[];
      const valid = parsed.filter(id => commonFeatures.some(feature => feature.id === id));
      if (localStorage.getItem(defaultFeaturePresetKey) === '1') {
        return valid.length > 0 ? valid : defaultPinnedFeatureIds;
      }
      return Array.from(new Set([...valid, ...defaultPinnedFeatureIds]));
    } catch {
      return defaultPinnedFeatureIds;
    }
  });
  const [selectedSystems, setSelectedSystems] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedSystems');
    if (!saved) return defaultSystemIds;
    const parsed = JSON.parse(saved) as string[];
    const valid = parsed.filter(id => businessSystems.some(system => system.id === id));
    if (localStorage.getItem(selectedSystemsPresetKey) === '1') {
      return valid.length > 0 ? valid : defaultSystemIds;
    }
    const merged = Array.from(new Set([...valid, ...defaultSystemIds]));
    return merged.length > 0 ? merged : defaultSystemIds;
  });

  // 切换菜单显示
  const toggleMenu = useCallback((id: string) => {
    setMenuId(prev => prev === id ? null : id);
  }, []);

  const showJumpTip = useCallback((destination: string) => {
    setJumpTip(destination);
    window.setTimeout(() => setJumpTip(null), 1800);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 1800);
  }, []);

  const reorderCards = useCallback((sourceId: CardType, targetId: CardType) => {
    if (sourceId === targetId) return;
    setCards(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const fromIndex = sorted.findIndex(card => card.id === sourceId);
      const toIndex = sorted.findIndex(card => card.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const [moved] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, moved);
      return sorted.map((card, index) => ({ ...card, order: index }));
    });
  }, []);

  const findNearestPortalCardId = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!draggingCardId) return null;
    const cardNodes = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-portal-card-id]'));
    let nearestId: CardType | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cardNodes.forEach(node => {
      const id = node.dataset.portalCardId as CardType | undefined;
      if (!id || id === draggingCardId) return;
      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normalizedX = (event.clientX - centerX) / Math.max(rect.width, 1);
      const normalizedY = (event.clientY - centerY) / Math.max(rect.height, 1);
      const distance = Math.hypot(normalizedX, normalizedY);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestId = id;
      }
    });

    return nearestId;
  }, [draggingCardId]);

  const handlePortalGridDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    if (!draggingCardId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const nearestId = findNearestPortalCardId(event);
    setDragOverCardId(nearestId);
  }, [draggingCardId, findNearestPortalCardId]);

  const handlePortalGridDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const nearestId = findNearestPortalCardId(event) || dragOverCardId;
    if (draggingCardId && nearestId) {
      reorderCards(draggingCardId, nearestId);
    }
    setDraggingCardId(null);
    setDragOverCardId(null);
  }, [dragOverCardId, draggingCardId, findNearestPortalCardId, reorderCards]);

  // 保存卡片配置
  useEffect(() => {
    localStorage.setItem('dashboardCards', JSON.stringify(cards));
  }, [cards]);

  // 保存系统选择
  useEffect(() => {
    localStorage.setItem('dashboardSystems', JSON.stringify(systems));
    localStorage.setItem('selectedSystems', JSON.stringify(selectedSystems));
    localStorage.setItem(selectedSystemsPresetKey, '1');
  }, [systems, selectedSystems]);

  useEffect(() => {
    localStorage.setItem('dashboardTodoSources', JSON.stringify(todoSources));
  }, [todoSources]);

  useEffect(() => {
    localStorage.setItem('dashboardTrackedItems', JSON.stringify(trackedItems));
  }, [trackedItems]);

  useEffect(() => {
    localStorage.setItem('approvalDisplayCount', String(approvalDisplayCount));
  }, [approvalDisplayCount]);

  useEffect(() => {
    localStorage.setItem('customDashboardTodos', JSON.stringify(customTodos));
  }, [customTodos]);

  useEffect(() => {
    localStorage.setItem('hiddenDashboardStats', JSON.stringify(hiddenStatKeys));
  }, [hiddenStatKeys]);

  useEffect(() => {
    localStorage.setItem('pinnedCommonFeatures', JSON.stringify(pinnedFeatureIds));
    localStorage.setItem(defaultFeaturePresetKey, '1');
  }, [pinnedFeatureIds]);

  // 切换卡片可见性
  const toggleCard = useCallback((id: CardType) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, visible: !card.visible } : card
    ));
  }, []);

  // 切换系统选择
  const toggleSystem = useCallback((id: string) => {
    setSelectedSystems(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  }, []);

  // 过滤可见的卡片并排序
  const visibleCards = cards
    .filter(card => card.visible)
    .sort((a, b) => a.order - b.order);

  // 过滤显示的系统
  const displayedSystems = systems.filter(sys => selectedSystems.includes(sys.id));
  const filteredAddSystems = systems.filter(system => {
    const matchesCategory = system.category === activeSystemCategory;
    const keyword = appSearch.trim().toLowerCase();
    const matchesSearch = !keyword || system.name.toLowerCase().includes(keyword) || (system.description ?? '').toLowerCase().includes(keyword);
    return matchesCategory && matchesSearch;
  });

  const removeSystem = useCallback((id: string) => {
    setSelectedSystems(prev => prev.filter(systemId => systemId !== id));
  }, []);

  const addSystem = useCallback((id: string) => {
    setSelectedSystems(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const enabledTodoSourceNames = todoSources.filter(source => source.enabled).map(source => source.name);
  const displayedTodoItems = [...todoItems, ...customTodos].filter(item => enabledTodoSourceNames.includes(item.source));
  const myTodoActions = deriveMyTodoActions(workItemList);
  const myTrackedWorkItems = deriveMyTrackedWorkItems(workItemList);
  const selectedWorkItem = workItemList.find(item => item.id === selectedWorkItemId) || myTrackedWorkItems[0] || workItemList[0];
  const visibleStats = dashboardStats
    .map(stat => {
      if (stat.key === 'todo') return { ...stat, count: String(displayedTodoItems.length + myTodoActions.length), summary: '我的待办' };
      if (stat.key === 'progress') return { ...stat, count: String(myTrackedWorkItems.length), summary: '事项协同看板' };
      return stat;
    })
    .filter(item => !hiddenStatKeys.includes(item.key));
  const activeStat = visibleStats.find(item => item.key === activeStatKey) || visibleStats[0] || dashboardStats[0];
  const activeTone = statToneMap[activeStat.color];
  const pinnedFeatures = commonFeatures.filter(feature => pinnedFeatureIds.includes(feature.id));
  const activeDuty = dutySchedule[dutyDayOffset];
  const displayedDutyItems = activeDuty.items.filter(item => {
    const keyword = dutyKeyword.trim();
    return !keyword || item.post.includes(keyword) || item.user.includes(keyword);
  });
  const dataLayoutOptions = dashboardStats.map(stat => ({
    id: stat.key,
    name: stat.title,
    description: stat.summary,
    checked: !hiddenStatKeys.includes(stat.key),
    onToggle: () => setHiddenStatKeys(prev => prev.includes(stat.key) ? prev.filter(item => item !== stat.key) : [...prev, stat.key]),
  }));
  const appLayoutOptions = cards
    .filter(card => ['documents', 'calendar', 'systems', 'officeApps', 'duty', 'courses'].includes(card.id))
    .map(card => ({
      id: card.id,
      name: card.name,
      description: card.id === 'officeApps' ? '工作汇报、航班动态等入口' : card.id === 'duty' ? '公司值班岗位与人员' : '门户应用卡片',
      checked: card.visible,
      onToggle: () => toggleCard(card.id),
    }));

  const scrollToLayoutSection = useCallback((category: 'data' | 'app') => {
    setLayoutCategory(category);
    const container = layoutContentRef.current;
    const section = document.getElementById(`layout-section-${category}`);
    if (!container || !section) return;
    container.scrollTo({
      top: section.offsetTop - 16,
      behavior: 'smooth',
    });
  }, []);

  const handleLayoutContentScroll = useCallback(() => {
    const container = layoutContentRef.current;
    if (!container) return;
    const sections = [
      { key: 'data' as const, element: document.getElementById('layout-section-data') },
      { key: 'app' as const, element: document.getElementById('layout-section-app') },
    ];
    const activeSection = [...sections].reverse().find(section => section.element && section.element.offsetTop <= container.scrollTop + 80);
    if (activeSection && activeSection.key !== layoutCategory) {
      setLayoutCategory(activeSection.key);
    }
  }, [layoutCategory]);

  const handleStatEdit = useCallback((key: StatKey) => {
    if (key === 'todo') {
      setActiveDialog('todoSources');
      return;
    }
    if (key === 'approval') {
      setActiveDialog('approvalConfig');
      return;
    }
    if (key === 'progress') {
      setPersonalView('workItemBoard');
      return;
    }
    showJumpTip('业务收入配置');
  }, [showJumpTip]);

  const handleStatSelect = useCallback((key: StatKey) => {
    setMenuId(null);
    if (key === 'todo') {
      setActiveStatKey(key);
      setPersonalView('todo');
      return;
    }
    if (key === 'progress') {
      setActiveStatKey(key);
      setPersonalView('workItemBoard');
      return;
    }
    setActiveStatKey(key);
    setPersonalView('dashboard');
  }, []);

  const backToDashboard = useCallback(() => {
    setPersonalView('dashboard');
    setActiveStatKey(current => current === 'todo' || current === 'progress' ? 'approval' : current);
  }, []);

  const handleFeatureClick = useCallback((feature: CommonFeature) => {
    if (feature.path) {
      navigate(feature.path);
      return;
    }
    showJumpTip(feature.destination || feature.name);
  }, [navigate, showJumpTip]);

  const toggleFeature = useCallback((id: string) => {
    setPinnedFeatureIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  }, []);

  const addOkrTrackedItem = useCallback(() => {
    setTrackedItems(prev => {
      if (prev.some(item => item.id === 'okr-import-1')) return prev;
      return [
        ...prev,
        {
          id: 'okr-import-1',
          title: 'O2 核心系统稳定性提升',
          source: 'okr',
          owner: MAIN_USER_NAME,
          progress: 69,
          status: '关联OKR',
          tasks: [
            { name: 'KR1 完成BIP实施验证', owner: getDemoPerson(21), progress: 100 },
            { name: 'KR2 完成基础及相关配置', owner: getDemoPerson(18), progress: 50 },
          ],
        },
      ];
    });
  }, []);

  const addProjectTrackedItem = useCallback(() => {
    setTrackedItems(prev => {
      if (prev.some(item => item.id === 'project-import-1')) return prev;
      return [
        ...prev,
        {
          id: 'project-import-1',
          title: '项目：业务系统统一入口优化',
          source: 'project',
          owner: MAIN_USER_NAME,
          progress: 58,
          status: '项目进展',
          tasks: [
            { name: '入口清单确认', owner: MAIN_USER_NAME, progress: 100 },
            { name: '权限范围校验', owner: getDemoPerson(17), progress: 60 },
            { name: '灰度发布验证', owner: getDemoPerson(16), progress: 20 },
          ],
        },
      ];
    });
  }, []);

  const addManualTodo = useCallback(() => {
    setCustomTodos(prev => [
      ...prev,
      {
        id: `custom-todo-${Date.now()}`,
        title: newTodoDraft.title.trim() || '手动新增任务',
        source: '任务',
        owner: newTodoDraft.owner.trim() || MAIN_USER_NAME,
        due: '今天',
        status: '进行中',
        progress: Number(newTodoDraft.progress) || 0,
        subtasks: newTodoDraft.subtasks.map(task => ({
          name: task.name.trim() || '未命名子任务',
          owner: task.owner.trim() || '待指派',
          progress: Number(task.progress) || 0,
        })),
      },
    ]);
    setActiveDialog(null);
  }, [newTodoDraft]);

  const openWorkItemDetail = useCallback((itemId: string, context: DetailContext = { returnView: 'workItemBoard' }) => {
    setSelectedWorkItemId(itemId);
    setDetailContext(context);
    setPersonalView('itemDetail');
  }, []);

  const openWorkItemReport = useCallback((itemId: string, returnView: WorkItemReturnView = 'workItemBoard', taskId?: string) => {
    const item = workItemList.find(candidate => candidate.id === itemId);
    if (!item) return;
    setSelectedWorkItemId(itemId);
    setWorkItemFlowReturnView(returnView);
    setWorkItemReportTaskId(taskId);
    setWorkItemReportDraft({
      thisPeriod: '',
      nextPlan: '',
      risk: '',
      progress: Math.min(100, Math.max(item.progress, 70)),
    });
    setPersonalView('reportSubmit');
  }, [workItemList]);

  const openWorkItemTask = useCallback((itemId: string, parentTaskId?: string, returnView: WorkItemReturnView = 'workItemBoard') => {
    const item = workItemList.find(candidate => candidate.id === itemId);
    const parentTask = parentTaskId ? item?.tasks.find(task => task.id === parentTaskId) : undefined;
    const rootParentTaskId = parentTask?.parentId || parentTaskId;
    setSelectedWorkItemId(itemId);
    setWorkItemFlowReturnView(returnView);
    setWorkItemTaskParentId(rootParentTaskId);
    setWorkItemTaskDraft({ title: '', owner: MAIN_USER_NAME, due: '' });
    setPersonalView('taskCreate');
  }, [workItemList]);

  const openWorkItemComment = useCallback((itemId: string, returnView: WorkItemReturnView = 'workItemBoard') => {
    setSelectedWorkItemId(itemId);
    setWorkItemFlowReturnView(returnView);
    setWorkItemCommentDraft('');
    setPersonalView('evaluationSubmit');
  }, []);

  const handleCreateWorkItem = useCallback(() => {
    const title = workItemCreateDraft.title.trim();
    if (!title) {
      showToast('请填写事项名称');
      return;
    }

    const nextItem: WorkItem = {
      id: `wi-personal-${Date.now()}`,
      title,
      type: workItemCreateDraft.type,
      status: '推进中',
      owner: MAIN_USER_NAME,
      assistant: MAIN_USER_NAME,
      members: [MAIN_USER_NAME],
      teamType: '项目组',
      teamName: '我关注的项目组',
      reportCycle: '本周',
      deadline: workItemCreateDraft.deadline || '待确认',
      progress: 10,
      riskLevel: '正常',
      description: workItemCreateDraft.description.trim() || '由个人门户创建的跟进事项。',
      okrLinks: [],
      sourceRefs: [
        { id: `src-${Date.now()}`, type: '事项填报', title: '事项门户创建', status: '已接入' },
      ],
      latestReport: '事项已创建，等待补充首阶段进展。',
      tasks: [],
      reports: [],
      comments: [],
      timeline: [
        { id: `time-${Date.now()}`, actor: MAIN_USER_NAME, action: '创建事项', time: '刚刚' },
      ],
    };
    setWorkItemList(prev => [nextItem, ...prev]);
    setSelectedWorkItemId(nextItem.id);
    setPersonalView('itemDetail');
    setWorkItemCreateDraft({ title: '', description: '', type: '专项推进', deadline: '2026-08-15' });
    setActiveDialog(null);
    showToast('事项已创建');
  }, [showToast, workItemCreateDraft]);

  const handleSubmitWorkItemReport = useCallback(() => {
    if (!selectedWorkItem) return;
    const thisPeriod = workItemReportDraft.thisPeriod.trim();
    if (!thisPeriod) {
      showToast('请填写本阶段完成事项');
      return;
    }
    const riskText = workItemReportDraft.risk.trim();
    const hasRisk = Boolean(riskText && riskText !== '暂无');
    const now = '刚刚';
    const relatedTaskIds = workItemReportTaskId
      ? [workItemReportTaskId]
      : selectedWorkItem.tasks.filter(task => task.assignee === MAIN_USER_NAME && task.status !== '已完成').map(task => task.id).slice(0, 2);
    setWorkItemList(prev => prev.map(item => item.id === selectedWorkItem.id ? {
      ...item,
      progress: workItemReportDraft.progress,
      status: hasRisk ? '风险中' : workItemReportDraft.progress >= 100 ? '已完成' : '推进中',
      riskLevel: hasRisk ? '关注' : item.riskLevel === '风险' ? '关注' : '正常',
      latestReport: thisPeriod,
      tasks: item.tasks.map(task => relatedTaskIds.includes(task.id) ? {
        ...task,
        progress: workItemReportDraft.progress,
        status: workItemReportDraft.progress >= 100 ? '已完成' : hasRisk ? '延期' : '进行中',
        executionReports: [
          {
            id: `exec-${Date.now()}-${task.id}`,
            reporter: MAIN_USER_NAME,
            submittedAt: now,
            progress: workItemReportDraft.progress,
            summary: thisPeriod,
            risk: riskText || '暂无',
          },
          ...task.executionReports,
        ],
      } : task),
      reports: [
        {
          id: `report-${Date.now()}`,
          source: '事项填报',
          teamName: item.teamName,
          cycle: item.reportCycle,
          relatedTaskIds,
          member: MAIN_USER_NAME,
          submittedAt: now,
          thisPeriod,
          nextPlan: workItemReportDraft.nextPlan.trim() || '继续推进事项闭环。',
          risk: riskText || '暂无',
        },
        ...item.reports,
      ],
      timeline: [
        { id: `time-report-${Date.now()}`, actor: MAIN_USER_NAME, action: `提交事项汇报，进度至 ${workItemReportDraft.progress}%`, time: now },
        ...item.timeline,
      ],
    } : item));
    setWorkItemReportTaskId(undefined);
    setPersonalView(workItemFlowReturnView);
    showToast('事项汇报已提交');
  }, [selectedWorkItem, showToast, workItemFlowReturnView, workItemReportDraft, workItemReportTaskId]);

  const handleCreateWorkItemTask = useCallback(() => {
    if (!selectedWorkItem) return;
    const title = workItemTaskDraft.title.trim();
    if (!title) {
      showToast('请填写任务名称');
      return;
    }
    const parentTask = workItemTaskParentId ? selectedWorkItem.tasks.find(task => task.id === workItemTaskParentId) : undefined;
    const rootParentTaskId = parentTask?.parentId || workItemTaskParentId;
    const nextTask: WorkItemTask = {
      id: `task-${Date.now()}`,
      parentId: rootParentTaskId,
      title,
      assigner: MAIN_USER_NAME,
      assignee: workItemTaskDraft.owner.trim() || MAIN_USER_NAME,
      owner: workItemTaskDraft.owner.trim() || MAIN_USER_NAME,
      due: workItemTaskDraft.due.trim() || '待确认',
      status: '未开始',
      progress: 0,
      executionReports: [],
    };
    setWorkItemList(prev => prev.map(item => item.id === selectedWorkItem.id ? {
      ...item,
      tasks: [nextTask, ...item.tasks],
      timeline: [
        { id: `time-task-${Date.now()}`, actor: MAIN_USER_NAME, action: `${rootParentTaskId ? '创建子任务' : '指派任务'}：${nextTask.title}`, time: '刚刚' },
        ...item.timeline,
      ],
    } : item));
    setWorkItemTaskParentId(undefined);
    setPersonalView(workItemFlowReturnView);
    showToast(rootParentTaskId ? '子任务已创建' : '任务已指派');
  }, [selectedWorkItem, showToast, workItemFlowReturnView, workItemTaskDraft, workItemTaskParentId]);

  const handleCreateWorkItemComment = useCallback(() => {
    if (!selectedWorkItem) return;
    const content = workItemCommentDraft.trim();
    if (!content) {
      showToast('请填写评价内容');
      return;
    }
    const now = '刚刚';
    setWorkItemList(prev => prev.map(item => item.id === selectedWorkItem.id ? {
      ...item,
      comments: [
        { id: `comment-${Date.now()}`, author: MAIN_USER_NAME, targetType: '事项', targetId: item.id, attitude: '建议', content, createdAt: now },
        ...item.comments,
      ],
      timeline: [
        { id: `time-comment-${Date.now()}`, actor: MAIN_USER_NAME, action: '提交团队评价', time: now },
        ...item.timeline,
      ],
    } : item));
    setWorkItemCommentDraft('');
    setPersonalView(workItemFlowReturnView);
    showToast('评价已提交');
  }, [selectedWorkItem, showToast, workItemCommentDraft, workItemFlowReturnView]);

  const handleCompleteWorkItemTask = useCallback((itemId: string, taskId: string) => {
    setWorkItemList(prev => prev.map(item => item.id === itemId ? {
      ...item,
      tasks: item.tasks.map(task => task.id === taskId ? { ...task, status: '已完成', progress: 100 } : task),
      timeline: [
        { id: `time-done-${Date.now()}`, actor: MAIN_USER_NAME, action: '标记任务完成', time: '刚刚' },
        ...item.timeline,
      ],
    } : item));
    showToast('已标记完成');
  }, [showToast]);

  const hideStat = useCallback((key: StatKey) => {
    setHiddenStatKeys(prev => prev.includes(key) ? prev : [...prev, key]);
    if (activeStatKey === key) {
      const next = dashboardStats.find(item => item.key !== key && !hiddenStatKeys.includes(item.key));
      if (next) setActiveStatKey(next.key);
    }
    setMenuId(null);
  }, [activeStatKey, hiddenStatKeys]);

  const openRequestDialog = useCallback((type: 'cardRequest' | 'featureRequest') => {
    setRequestDraft({
      name: '',
      type: type === 'cardRequest' ? '数据卡片' : '功能入口',
      domain: '管理',
      description: '',
    });
    setActiveDialog(type);
  }, []);

  const submitRequest = useCallback(() => {
    setActiveDialog(null);
    showToast('已提交申请流程');
  }, [showToast]);
  const renderPortalCard = (card: CardConfig) => {
    if (card.id === 'stats') {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
            {visibleStats.map(stat => (
              <StatsCard
                key={stat.key}
                stat={stat}
                active={activeStatKey === stat.key}
                menuId={menuId}
                onSelect={handleStatSelect}
                onEdit={handleStatEdit}
                onHide={hideStat}
                onToggleMenu={toggleMenu}
              />
            ))}
          </div>
          <StatsDetailPanel
            activeStat={activeStat}
            tone={activeTone}
            approvals={approvalProcesses.slice(0, approvalDisplayCount)}
            approvalTotal={approvalProcesses.length}
            todos={displayedTodoItems}
            trackedItems={trackedItems}
            revenueDetails={revenueDetails}
            onEdit={handleStatEdit}
            onAddTodo={() => setActiveDialog('newTodo')}
            onNavigate={showJumpTip}
          />
        </div>
      );
    }

    if (card.id === 'documents') {
      return (
        <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">今日未读文档</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">5条</span>
              <button
                onClick={() => showJumpTip('门户-文档中心')}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                title="更多"
              >
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <DocumentItem title="关于明确公司领导分工工作和工作接替顺序的通知" time="2026-05-20 09:25:07" />
            <DocumentItem title="关于发布浦东-伊宁、浦东-喀什新开航线评估结果的通知" time="2026-05-20 09:20:05" />
            <DocumentItem title="关于做好2026年上半年工作总结和下半年工作计划的通知" time="2026-05-19 13:10:09" />
            <DocumentItem title="关于发布《上海吉祥航空股份有限公司安全警示教育长效机制（试行）》的通知" time="2026-05-19 10:12:34" />
          </div>
        </div>
      );
    }

    if (card.id === 'calendar') {
      return (
        <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl flex items-center justify-center">
                <CalendarIcon size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">2026年5月</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-pink-50 rounded-xl transition-colors">
                <Plus size={18} className="text-pink-700" />
              </button>
              <CardHeaderActions menuId={menuId} menuKey="calendar" onEdit={(event) => { event.stopPropagation(); showJumpTip('周历配置'); }} onToggleMenu={toggleMenu} />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-6">
            {['日', '一', '二', '三', '四', '五', '六'].map(day => (
              <div key={day} className="text-xs font-semibold text-gray-400 py-2">{day}</div>
            ))}
            {[17, 18, 19, 20, 21, 22, 23].map(date => (
              <div key={date} className="flex justify-center py-1.5">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-200 ${
                    date === 20
                      ? 'bg-gradient-to-br from-pink-700 to-pink-900 text-white font-bold shadow-lg shadow-pink-700/20'
                      : date === 21
                        ? 'text-gray-800 font-medium'
                        : 'text-gray-400'
                  }`}
                >
                  {date}
                </span>
              </div>
            ))}
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-pink-700">5月20日</span>
              <span className="text-gray-400">行程</span>
            </h4>
            <div className="space-y-2">
              <CalendarEvent time="全天" title="全天值班" color="bg-gray-100" textColor="text-gray-700" />
              <CalendarEvent time="10:00-11:00" title="项目周会" color="bg-pink-100" textColor="text-pink-900" />
              <CalendarEvent time="13:00-13:30" title="日程" color="bg-blue-100" textColor="text-blue-900" />
              <CalendarEvent time="14:00-15:30" title="工会活动" color="bg-green-100" textColor="text-green-900" />
            </div>
          </div>
        </div>
      );
    }

    if (card.id === 'duty') {
      return (
        <div className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-700 to-pink-900 text-white">
                <Bell size={19} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">今日值班</h3>
                <p className="text-xs text-gray-500">{activeDuty.date} · {activeDuty.label}</p>
              </div>
            </div>
            <button
              onClick={() => showJumpTip('公司值班页面')}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="更多"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => setDutyDayOffset(prev => (prev === -1 ? -1 : ((prev as number) - 1) as keyof typeof dutySchedule))}
              className="rounded-lg border border-gray-100 p-2 text-gray-500 hover:bg-gray-50"
              title="昨天"
            >
              <ChevronRight size={15} className="rotate-180" />
            </button>
            <div className="relative min-w-0 flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={dutyKeyword}
                onChange={(event) => setDutyKeyword(event.target.value)}
                placeholder="搜索岗位或值班人"
                className="w-full rounded-xl border border-gray-100 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-pink-200 focus:bg-white"
              />
            </div>
            <button
              onClick={() => setDutyDayOffset(prev => (prev === 1 ? 1 : ((prev as number) + 1) as keyof typeof dutySchedule))}
              className="rounded-lg border border-gray-100 p-2 text-gray-500 hover:bg-gray-50"
              title="明天"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {displayedDutyItems.map(item => (
              <div key={item.post} className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
                <span className="min-w-0 truncate text-sm font-medium text-gray-700">{item.post}</span>
                <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-pink-700 shadow-sm">{item.user}</span>
              </div>
            ))}
            {displayedDutyItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-400">暂无匹配岗位</div>
            )}
          </div>
        </div>
      );
    }

    if (card.id === 'systems') {
      return (
        <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                <Layout size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">常用系统</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full">{displayedSystems.length}个</span>
              <button
                onClick={() => setShowCommonAppsPanel(true)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                title="设置常用应用"
              >
                <Settings size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {displayedSystems.map(sys => (
              <button key={sys.id} className="group flex min-w-0 flex-col items-center gap-2 rounded-xl border border-transparent px-2 py-2.5 transition-all duration-300 hover:border-gray-100 hover:bg-gray-50">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${sys.bgColor || 'bg-blue-500'} text-white shadow-sm transition-shadow group-hover:shadow-md`}>
                  {sys.icon}
                </div>
                <span className="w-full truncate text-center text-[12px] font-medium leading-4 text-gray-700">{sys.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (card.id === 'officeApps') {
      return (
        <div className="group relative rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-600 to-pink-800 text-white">
                <ClipboardList size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">常用功能</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-pink-50 px-3 py-1 text-sm font-medium text-pink-700">{pinnedFeatures.length}个</span>
              <button
                onClick={() => setActiveDialog('commonFeatures')}
                className="rounded-xl p-2 transition-colors hover:bg-gray-100"
                title="设置常用功能"
              >
                <Settings size={18} className="text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {pinnedFeatures.map(feature => (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature)}
                className="group/app flex min-w-0 flex-col items-center gap-2 rounded-xl border border-transparent px-2 py-2.5 transition-all duration-300 hover:border-gray-100 hover:bg-gray-50"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${feature.tone}`}>
                  {feature.icon}
                </div>
                <span className="w-full truncate text-center text-[12px] font-medium leading-4 text-gray-700">{feature.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (card.id === 'courses') {
      return (
        <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">临期课程</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-sm font-medium text-pink-700 hover:text-pink-900 transition-colors">查看全部</button>
              <CardHeaderActions menuId={menuId} menuKey="courses" onEdit={(event) => { event.stopPropagation(); showJumpTip('临期课程配置'); }} onToggleMenu={toggleMenu} />
            </div>
          </div>
          <div className="space-y-3">
            <CourseItem title="上海吉祥航空股份有限公司IT质量指标评估标准V6.0" time="5节课 · 10积分" color="blue" />
            <CourseItem title="民航华东地区2026年行业管理工作报告的通知" time="1节课 · 10积分" color="purple" />
            <CourseItem title="王金董事长在公司2026年工作会议上的重要讲话" time="1节课 · 10积分" color="pink" />
          </div>
        </div>
      );
    }

    return null;
  };
  return (
    <div className="bg-gradient-to-br from-gray-50 via-pink-50/50 to-white min-h-screen">
      {jumpTip && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900/90 px-5 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur">
          将跳转至：{jumpTip}
        </div>
      )}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-pink-700 px-5 py-2.5 text-sm font-medium text-white shadow-xl">
          {toastMessage}
        </div>
      )}
      {/* 页面头部 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-700 to-pink-900 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-700/20">
                <Layout size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">我的工作台</h1>
                <p className="text-sm text-gray-500">2026年5月21日 · 周四</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="group relative flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-pink-200 hover:bg-pink-50/50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Edit3 size={18} className="text-gray-500 group-hover:text-pink-700 transition-colors" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-pink-800">编辑布局</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {personalView === 'dashboard' && (
          <div className="grid grid-flow-row-dense grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-12" onDragOver={handlePortalGridDragOver} onDrop={handlePortalGridDrop}>
            {visibleCards.map(card => (
              <PortalCardShell
                key={card.id}
                card={card}
                dragging={draggingCardId === card.id}
                dragOver={dragOverCardId === card.id && draggingCardId !== card.id}
                onDragStart={(id) => {
                  setDraggingCardId(id);
                  setDragOverCardId(null);
                }}
                onDragEnd={() => {
                  setDraggingCardId(null);
                  setDragOverCardId(null);
                }}
              >
                {renderPortalCard(card)}
              </PortalCardShell>
            ))}
          </div>
        )}
        {personalView === 'todo' && (
          <MyTodoView
            actions={myTodoActions}
            otherTodos={displayedTodoItems}
            onBack={backToDashboard}
            onCreateItem={() => setActiveDialog('createWorkItem')}
            onOpenItem={(itemId, context) => openWorkItemDetail(itemId, context)}
            onSubmitReport={(itemId, taskId) => openWorkItemReport(itemId, 'todo', taskId)}
            onAssignTask={(itemId) => openWorkItemTask(itemId, undefined, 'todo')}
            onEvaluate={(itemId) => openWorkItemComment(itemId, 'todo')}
            onCompleteTask={handleCompleteWorkItemTask}
            onOpenExternal={showJumpTip}
          />
        )}
        {personalView === 'workItemBoard' && (
          <WorkItemBoardView
            items={myTrackedWorkItems}
            onBack={backToDashboard}
            onCreateItem={() => setActiveDialog('createWorkItem')}
            onOpenItem={(itemId) => openWorkItemDetail(itemId, { returnView: 'workItemBoard' })}
            onSubmitReport={(itemId) => openWorkItemReport(itemId, 'workItemBoard')}
            onAssignTask={(itemId) => openWorkItemTask(itemId, undefined, 'workItemBoard')}
            onCreateSubtask={(itemId, taskId) => openWorkItemTask(itemId, taskId, 'workItemBoard')}
            onComment={(itemId) => openWorkItemComment(itemId, 'workItemBoard')}
            onWeeklyReport={() => navigate('/web_client/work-report')}
          />
        )}
        {personalView === 'itemDetail' && selectedWorkItem && (
          <MyItemDetailView
            item={selectedWorkItem}
            onBack={() => setPersonalView(detailContext.returnView)}
            focusTaskId={detailContext.focusTaskId}
            focusActionId={detailContext.focusActionId}
            onSubmitReport={() => openWorkItemReport(selectedWorkItem.id, 'itemDetail')}
            onAssignTask={() => openWorkItemTask(selectedWorkItem.id, undefined, 'itemDetail')}
            onComment={() => openWorkItemComment(selectedWorkItem.id, 'itemDetail')}
            onCreateSubtask={(taskId) => openWorkItemTask(selectedWorkItem.id, taskId, 'itemDetail')}
            onCompleteTask={(taskId) => handleCompleteWorkItemTask(selectedWorkItem.id, taskId)}
          />
        )}
        {personalView === 'taskCreate' && selectedWorkItem && (
          <WorkItemTaskCreateView
            item={selectedWorkItem}
            parentTaskId={workItemTaskParentId}
            draft={workItemTaskDraft}
            onBack={() => setPersonalView(workItemFlowReturnView)}
            onDraftChange={setWorkItemTaskDraft}
            onSubmit={handleCreateWorkItemTask}
          />
        )}
        {personalView === 'reportSubmit' && selectedWorkItem && (
          <WorkItemReportSubmitView
            item={selectedWorkItem}
            taskId={workItemReportTaskId}
            draft={workItemReportDraft}
            onBack={() => setPersonalView(workItemFlowReturnView)}
            onDraftChange={setWorkItemReportDraft}
            onWeeklyReport={() => navigate('/web_client/work-report')}
            onSubmit={handleSubmitWorkItemReport}
          />
        )}
        {personalView === 'evaluationSubmit' && selectedWorkItem && (
          <WorkItemEvaluationSubmitView
            item={selectedWorkItem}
            value={workItemCommentDraft}
            onBack={() => setPersonalView(workItemFlowReturnView)}
            onChange={setWorkItemCommentDraft}
            onSubmit={handleCreateWorkItemComment}
          />
        )}
      </div>
      {/* 常用应用管理侧栏 */}
      {showCommonAppsPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" onClick={() => setShowCommonAppsPanel(false)} />
          <aside className="relative flex h-full w-full max-w-[420px] flex-col bg-[#f3f4f8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-950">常用应用</h2>
              <button onClick={() => setShowCommonAppsPanel(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <X size={22} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="rounded-2xl bg-white px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {displayedSystems.map(system => (
                    <div key={system.id} className="group relative flex min-w-0 items-center gap-2 rounded-xl border border-gray-100 px-2.5 py-2">
                      <button onClick={() => removeSystem(system.id)} className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm ring-1 ring-gray-100" title="移除">
                        <Minus size={14} />
                      </button>
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${system.bgColor ?? 'bg-blue-500'}`}>
                        {system.icon}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-gray-600">{system.name}</span>
                      <GripVertical size={13} className="hidden shrink-0 text-gray-300 group-hover:block" />
                    </div>
                  ))}
                  <button onClick={() => setShowAddAppModal(true)} className="flex items-center gap-2 rounded-xl border border-dashed border-gray-200 px-2.5 py-2 text-gray-500 hover:border-gray-300 hover:text-gray-900">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      <Plus size={20} />
                    </span>
                    <span className="text-xs font-medium">添加</span>
                  </button>
                </div>
              </div>

              <p className="mt-5 px-3 text-xs text-gray-400">拖动应用可调整展示顺序</p>
            </div>
          </aside>
        </div>
      )}

      {/* 添加常用应用弹框 */}
      {showAddAppModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={appSearch} onChange={(event) => setAppSearch(event.target.value)} placeholder="搜索" className="h-12 w-full rounded-lg bg-gray-100 pl-12 pr-4 text-base text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-pink-700/20" />
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 px-6">
              <div className="flex gap-8 overflow-x-auto">
                {systemCategories.map(category => (
                  <button key={category} onClick={() => setActiveSystemCategory(category)} className={`relative whitespace-nowrap py-4 text-base font-medium ${activeSystemCategory === category ? 'text-gray-950' : 'text-gray-500 hover:text-gray-800'}`}>
                    {category}
                    {activeSystemCategory === category && <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-gray-950" />}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowAddAppModal(false)} className="ml-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <X size={22} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <h3 className="mb-4 text-2xl font-bold text-gray-950">{activeSystemCategory}</h3>
              <div className="divide-y divide-gray-100">
                {filteredAddSystems.map(system => {
                  const added = selectedSystems.includes(system.id);
                  return (
                    <div key={system.id} className="flex items-center justify-between gap-6 py-4">
                      <div className="flex min-w-0 items-center gap-5">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${system.bgColor ?? 'bg-blue-500'}`}>
                          {system.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-xl font-semibold text-gray-950">{system.name}</div>
                          <div className="mt-1 truncate text-sm text-gray-400">来源于{system.source}</div>
                        </div>
                      </div>
                      <button onClick={() => addSystem(system.id)} disabled={added} className={`h-10 rounded-lg border px-8 text-base transition-colors ${added ? 'cursor-default border-gray-200 bg-gray-50 text-gray-400' : 'border-gray-200 bg-white text-gray-950 hover:border-pink-300 hover:text-pink-700'}`}>
                        {added ? '已添加' : '添加'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 text-base text-gray-950">已添加({displayedSystems.length}):</span>
                <div className="flex min-w-0 gap-2 overflow-hidden">
                  {displayedSystems.slice(0, 8).map(system => (
                    <div key={system.id} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white ${system.bgColor ?? 'bg-blue-500'}`}>
                      {system.icon}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowAddAppModal(false)} className="ml-4 h-10 rounded-lg bg-pink-700 px-7 text-sm font-semibold text-white hover:bg-pink-800">
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 常用功能配置 */}
      {activeDialog === 'commonFeatures' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6">
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">常用功能</h2>
                <p className="mt-1 text-sm text-gray-500">选择固定在工作门户里的功能入口</p>
              </div>
              <button onClick={() => setActiveDialog(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-3 overflow-y-auto p-6 sm:grid-cols-2 lg:grid-cols-3">
              {commonFeatures.map(feature => {
                const selected = pinnedFeatureIds.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    onClick={() => toggleFeature(feature.id)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                      selected ? 'border-pink-200 bg-pink-50/60' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${feature.tone}`}>
                      {feature.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-gray-900">{feature.name}</span>
                      <span className="mt-1 block text-xs text-gray-500">{selected ? '已固定在门户' : '点击固定到门户'}</span>
                    </span>
                    <CheckCircle2 size={16} className={selected ? 'text-pink-700' : 'text-gray-200'} />
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <span className="text-xs text-gray-500">已固定 {pinnedFeatureIds.length} 个</span>
              <div className="flex items-center gap-3">
                <button onClick={() => openRequestDialog('featureRequest')} className="text-sm font-medium text-pink-700 hover:text-pink-900">
                  没有我想要的功能入口
                </button>
                <button onClick={() => setActiveDialog(null)} className="rounded-lg bg-pink-700 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                  完成
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 流程审批展示配置 */}
      {activeDialog === 'approvalConfig' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">编辑流程审批</h2>
                <p className="mt-1 text-sm text-gray-500">选择详情卡片最多展示的流程数量</p>
              </div>
              <button onClick={() => setActiveDialog(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="text-sm font-medium text-gray-700">最多展示</label>
              <select
                value={approvalDisplayCount}
                onChange={(event) => setApprovalDisplayCount(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-pink-400"
              >
                {[1, 2, 3, 4, 5].map(count => (
                  <option key={count} value={count}>{count} 条</option>
                ))}
              </select>
              <p className="mt-3 text-xs text-gray-500">当前共有 {approvalProcesses.length} 条待批阅流程，详情区会按配置数量截取展示。</p>
            </div>
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button onClick={() => setActiveDialog(null)} className="rounded-lg bg-pink-700 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 待办来源配置 */}
      {activeDialog === 'todoSources' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">编辑待办来源</h2>
                <p className="mt-1 text-sm text-gray-500">选择进入“待办事项”列表的数据来源</p>
              </div>
              <button onClick={() => setActiveDialog(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 p-6">
              {todoSources.map(source => (
                <button
                  key={source.id}
                  onClick={() => setTodoSources(prev => prev.map(item => item.id === source.id ? { ...item, enabled: !item.enabled } : item))}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all ${
                    source.enabled ? 'border-amber-200 bg-amber-50/60' : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-amber-700 shadow-sm">
                      <ListTodo size={17} />
                    </span>
                    <span className="font-semibold text-gray-800">{source.name}</span>
                  </span>
                  <CheckCircle2 size={17} className={source.enabled ? 'text-amber-700' : 'text-gray-200'} />
                </button>
              ))}
            </div>
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button onClick={() => setActiveDialog(null)} className="rounded-lg bg-pink-700 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增待办任务 */}
      {activeDialog === 'newTodo' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">新增任务</h2>
                <p className="mt-1 text-sm text-gray-500">手动新增事项可录入子任务及进度，并模拟指派给协作人</p>
              </div>
              <button onClick={() => setActiveDialog(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">工作标题</span>
                <input
                  value={newTodoDraft.title}
                  onChange={(event) => setNewTodoDraft(prev => ({ ...prev, title: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-gray-700">负责人</span>
                <input
                  value={newTodoDraft.owner}
                  onChange={(event) => setNewTodoDraft(prev => ({ ...prev, owner: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-gray-700">当前进度</span>
                <input
                  value={newTodoDraft.progress}
                  onChange={(event) => setNewTodoDraft(prev => ({ ...prev, progress: event.target.value.replace(/[^\d]/g, '').slice(0, 3) }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                />
              </label>
              <div className="sm:col-span-2 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">子任务</span>
                  <span className="text-xs text-gray-500">通过任务功能指派，协作人完成后更新进展</span>
                </div>
                {newTodoDraft.subtasks.map((task, index) => (
                  <div key={index} className="mb-2 grid gap-2 sm:grid-cols-[1fr_120px_88px]">
                    <input
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-pink-400"
                      value={task.name}
                      onChange={(event) => setNewTodoDraft(prev => ({
                        ...prev,
                        subtasks: prev.subtasks.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item),
                      }))}
                    />
                    <input
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-pink-400"
                      value={task.owner}
                      onChange={(event) => setNewTodoDraft(prev => ({
                        ...prev,
                        subtasks: prev.subtasks.map((item, itemIndex) => itemIndex === index ? { ...item, owner: event.target.value } : item),
                      }))}
                    />
                    <input
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-pink-400"
                      value={task.progress}
                      onChange={(event) => setNewTodoDraft(prev => ({
                        ...prev,
                        subtasks: prev.subtasks.map((item, itemIndex) => itemIndex === index ? { ...item, progress: event.target.value.replace(/[^\d]/g, '').slice(0, 3) } : item),
                      }))}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button onClick={() => setActiveDialog(null)} className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                取消
              </button>
              <button onClick={addManualTodo} className="rounded-lg bg-pink-700 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建事项 */}
      {activeDialog === 'createWorkItem' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4 py-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">新建事项</h2>
                <p className="mt-1 text-sm text-gray-500">在个人门户内创建需要持续跟进的事项</p>
              </div>
              <button onClick={() => setActiveDialog(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">事项名称</span>
                <input value={workItemCreateDraft.title} onChange={(event) => setWorkItemCreateDraft(prev => ({ ...prev, title: event.target.value }))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400" placeholder="请输入事项名称" />
              </label>
              <label>
                <span className="text-sm font-medium text-gray-700">事项类型</span>
                <select value={workItemCreateDraft.type} onChange={(event) => setWorkItemCreateDraft(prev => ({ ...prev, type: event.target.value as WorkItemType }))} className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-400">
                  {(['领导交办', '专项推进', '跨部门协同', '项目事项'] as WorkItemType[]).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-medium text-gray-700">截止时间</span>
                <input value={workItemCreateDraft.deadline} onChange={(event) => setWorkItemCreateDraft(prev => ({ ...prev, deadline: event.target.value }))} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400" />
              </label>
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">事项说明</span>
                <textarea value={workItemCreateDraft.description} onChange={(event) => setWorkItemCreateDraft(prev => ({ ...prev, description: event.target.value }))} className="mt-2 min-h-28 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400" placeholder="补充背景、目标和协作要求" />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button onClick={() => setActiveDialog(null)} className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                取消
              </button>
              <button onClick={handleCreateWorkItem} className="rounded-lg bg-pink-700 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 px-4 py-6 backdrop-blur-[1px]">
          <div className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">编辑布局</h2>
                <p className="mt-1 text-sm text-gray-500">按分类选择个人门户展示的卡片，内容区支持锚点滚动</p>
              </div>
              <button onClick={() => setShowSettings(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>

            <div className="border-b border-gray-100 px-6 pb-3 pt-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {[
                  { key: 'data' as const, label: '数据卡片', count: dataLayoutOptions.length, color: 'from-pink-700 to-pink-500' },
                  { key: 'app' as const, label: '应用卡片', count: appLayoutOptions.length, color: 'from-amber-500 to-orange-400' },
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => scrollToLayoutSection(item.key)}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      layoutCategory === item.key
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-pink-900/10`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${layoutCategory === item.key ? 'bg-white/80' : 'bg-gray-400'}`} />
                    <span>{item.label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-xs ${layoutCategory === item.key ? 'bg-white/20' : 'bg-white text-gray-500'}`}>{item.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div ref={layoutContentRef} onScroll={handleLayoutContentScroll} className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <section id="layout-section-data" className="mb-8 scroll-mt-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-700 to-pink-500 text-white shadow-lg shadow-pink-900/10">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">数据卡片</h3>
                    <p className="text-sm text-gray-500">统计与明细列表等数据类组件</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dataLayoutOptions.map(item => (
                    <button
                      key={item.id}
                      onClick={item.onToggle}
                      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                        item.checked ? 'border-pink-200 bg-pink-50/70 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        item.checked ? 'bg-pink-700 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-500'
                      }`}>
                        {item.checked ? <CheckCircle2 size={18} /> : <Layout size={18} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-900">{item.name}</span>
                        <span className="mt-1 block truncate text-xs text-gray-500">{item.description}</span>
                      </span>
                      <span className={`h-5 w-5 rounded-full border ${item.checked ? 'border-pink-700 bg-pink-700' : 'border-gray-200 bg-white'}`} />
                    </button>
                  ))}
                </div>
              </section>

              <section id="layout-section-app" className="scroll-mt-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 text-white shadow-lg shadow-amber-900/10">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">应用卡片</h3>
                    <p className="text-sm text-gray-500">常用系统、常用功能、公司值班、文档和课程等入口</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {appLayoutOptions.map(item => (
                    <button
                      key={item.id}
                      onClick={item.onToggle}
                      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                        item.checked ? 'border-amber-200 bg-amber-50/70 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        item.checked ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:text-gray-500'
                      }`}>
                        {item.checked ? <CheckCircle2 size={18} /> : <Layout size={18} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-900">{item.name}</span>
                        <span className="mt-1 block truncate text-xs text-gray-500">{item.description}</span>
                      </span>
                      <span className={`h-5 w-5 rounded-full border ${item.checked ? 'border-amber-500 bg-amber-500' : 'border-gray-200 bg-white'}`} />
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button onClick={() => openRequestDialog('cardRequest')} className="text-sm font-medium text-pink-700 hover:text-pink-900">
                没有我的想要的卡片
              </button>
              <button onClick={() => setShowSettings(false)} className="rounded-lg bg-pink-700 px-6 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                完成
              </button>
            </div>
          </div>
        </div>
      )}
      {(activeDialog === 'cardRequest' || activeDialog === 'featureRequest') && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4 py-6">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{activeDialog === 'cardRequest' ? '申请卡片' : '申请功能入口'}</h2>
                <p className="mt-1 text-sm text-gray-500">提交后将发起需求申请流程</p>
              </div>
              <button onClick={() => setActiveDialog(null)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">卡片名称</span>
                <input
                  value={requestDraft.name}
                  onChange={(event) => setRequestDraft(prev => ({ ...prev, name: event.target.value }))}
                  placeholder={activeDialog === 'cardRequest' ? '请输入需要的卡片名称' : '请输入需要的功能入口名称'}
                  className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-gray-700">卡片类型</span>
                <select
                  value={requestDraft.type}
                  onChange={(event) => setRequestDraft(prev => ({ ...prev, type: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
                >
                  <option>数据卡片</option>
                  <option>应用卡片</option>
                  <option>功能入口</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-medium text-gray-700">所属领域</span>
                <select
                  value={requestDraft.domain}
                  onChange={(event) => setRequestDraft(prev => ({ ...prev, domain: event.target.value }))}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-400"
                >
                  <option>运行</option>
                  <option>营销</option>
                  <option>管理</option>
                  <option>数据</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-gray-700">卡片信息描述</span>
                <textarea
                  value={requestDraft.description}
                  onChange={(event) => setRequestDraft(prev => ({ ...prev, description: event.target.value }))}
                  placeholder="请描述希望展示的信息、来源系统或使用场景"
                  className="mt-2 min-h-28 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                />
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <button onClick={() => setActiveDialog(null)} className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                取消
              </button>
              <button onClick={submitRequest} className="rounded-lg bg-pink-700 px-5 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

function PersonalViewHeader({ title, subtitle, onBack, action }: {
  title: string;
  subtitle: string;
  onBack: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-pink-200 hover:text-pink-700" title="返回">
          <ChevronRight size={18} className="rotate-180" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-950">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function MyTodoView({ actions, otherTodos, onBack, onCreateItem, onOpenItem, onSubmitReport, onAssignTask, onEvaluate, onCompleteTask, onOpenExternal }: {
  actions: MyTodoAction[];
  otherTodos: TodoItem[];
  onBack: () => void;
  onCreateItem: () => void;
  onOpenItem: (itemId: string, context?: DetailContext) => void;
  onSubmitReport: (itemId: string, taskId?: string) => void;
  onAssignTask: (itemId: string) => void;
  onEvaluate: (itemId: string) => void;
  onCompleteTask: (itemId: string, taskId: string) => void;
  onOpenExternal: (destination: string) => void;
}) {
  const queue: TodoQueueEntry[] = [
    ...actions.map(action => ({
      id: action.id,
      title: action.title,
      source: action.source,
      due: action.due,
      status: action.status,
      actionLabel: action.actionLabel,
      group: action.status.includes('延期') ? '延期优先' : action.due.includes('今天') ? '今日到期' : action.kind === 'report' ? '待填报' : action.kind === 'evaluation' ? '待评价' : '待处理',
      relation: action.itemTitle,
      kind: action.kind,
      progress: action.progress,
      itemId: action.itemId,
      taskId: action.taskId,
    } as TodoQueueEntry)),
    ...otherTodos.map(item => ({
      id: item.id,
      title: item.title,
      source: item.source,
      due: item.due,
      status: item.status,
      actionLabel: item.status.includes('待确认') ? '去确认' : '去处理',
      group: item.status.includes('待确认') ? '待确认' : '其它来源',
      relation: item.source,
      kind: 'external' as const,
      progress: item.progress,
    })),
  ].sort((a, b) => {
    const order = ['延期优先', '今日到期', '待填报', '待评价', '待确认', '待处理', '其它来源'];
    return order.indexOf(a.group) - order.indexOf(b.group);
  });
  const [selectedTodoId, setSelectedTodoId] = useState(queue[0]?.id ?? '');
  const selected = queue.find(item => item.id === selectedTodoId) || queue[0];
  const stats = [
    { label: '今日到期', value: queue.filter(item => item.due.includes('今天')).length, tone: 'text-amber-700 bg-amber-50' },
    { label: '延期', value: queue.filter(item => item.status.includes('延期')).length, tone: 'text-red-700 bg-red-50' },
    { label: '待填报', value: queue.filter(item => item.kind === 'report').length, tone: 'text-pink-700 bg-pink-50' },
    { label: '其它来源', value: queue.filter(item => item.kind === 'external').length, tone: 'text-gray-700 bg-gray-100' },
  ];

  return (
    <section>
      <PersonalViewHeader
        title="我的待办"
        subtitle="收件箱式处理台，先判断轻重缓急，再在右侧完成处理。"
        onBack={onBack}
        action={
          <button onClick={onCreateItem} className="inline-flex items-center gap-2 rounded-xl bg-pink-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-800">
            <Plus size={16} />
            新建事项
          </button>
        }
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-lg font-bold ${stat.tone}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="grid grid-cols-[96px_minmax(0,1fr)_92px_90px_86px] gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500">
            <span>动作</span>
            <span>待办事项</span>
            <span>来源</span>
            <span>截止</span>
            <span>状态</span>
          </div>
          <div className="max-h-[560px] overflow-y-auto">
            {queue.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">当前没有需要处理的待办。</div>
            ) : queue.map(item => {
              const selectedRow = selected?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedTodoId(item.id)}
                  className={`grid w-full grid-cols-[96px_minmax(0,1fr)_92px_90px_86px] items-center gap-3 border-b border-gray-50 px-4 py-3 text-left transition last:border-b-0 ${
                    selectedRow ? 'bg-pink-50/70 ring-1 ring-inset ring-pink-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`rounded-lg px-2 py-1 text-center text-xs font-semibold ${item.group === '延期优先' ? 'bg-red-50 text-red-700' : item.kind === 'report' ? 'bg-pink-50 text-pink-700' : 'bg-amber-50 text-amber-700'}`}>{item.actionLabel}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-gray-900">{item.title}</span>
                    <span className="mt-1 block truncate text-xs text-gray-400">{item.relation}</span>
                  </span>
                  <span className="truncate text-sm text-gray-600">{item.source}</span>
                  <span className="truncate text-sm text-gray-600">{item.due}</span>
                  <span className="truncate text-xs font-medium text-gray-500">{item.status}</span>
                </button>
              );
            })}
          </div>
        </div>
        <aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          {selected ? (
            <div>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-pink-700">{selected.group}</p>
                  <h3 className="mt-1 text-lg font-bold text-gray-950">{selected.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{selected.source} · {selected.due}</p>
                </div>
                <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{selected.status}</span>
              </div>
              <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">关联</span>
                  <span className="text-right font-medium text-gray-800">{selected.relation}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">处理动作</span>
                  <span className="font-medium text-gray-800">{selected.actionLabel}</span>
                </div>
                {typeof selected.progress === 'number' && (
                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-gray-500">当前进度</span>
                      <span className="font-semibold text-gray-800">{selected.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-pink-600" style={{ width: `${selected.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              {selected.kind === 'report' && selected.itemId && (
                <div className="mt-5 space-y-3">
                  <textarea readOnly value="请补充本阶段完成事项、下阶段计划和风险说明。" className="min-h-24 w-full resize-none rounded-xl border border-pink-100 bg-pink-50/50 px-3 py-3 text-sm text-pink-900 outline-none" />
                  <button onClick={() => onSubmitReport(selected.itemId!, selected.taskId)} className="w-full rounded-xl bg-pink-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-800">提交事项汇报</button>
                </div>
              )}
              {selected.kind === 'task' && selected.itemId && selected.taskId && (
                <div className="mt-5 grid gap-2">
                  <button onClick={() => onSubmitReport(selected.itemId!, selected.taskId)} className="w-full rounded-xl bg-pink-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-800">提交执行进度</button>
                  <button onClick={() => onCompleteTask(selected.itemId!, selected.taskId!)} className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">标记完成</button>
                  <button onClick={() => onOpenItem(selected.itemId!, { returnView: 'todo', focusTaskId: selected.taskId, focusActionId: selected.id })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-pink-200 hover:text-pink-700">查看详情</button>
                  <button onClick={() => onAssignTask(selected.itemId!)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-pink-200 hover:text-pink-700">指派任务</button>
                </div>
              )}
              {selected.kind === 'evaluation' && selected.itemId && (
                <div className="mt-5 grid gap-2">
                  <button onClick={() => onEvaluate(selected.itemId!)} className="w-full rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">写评价</button>
                  <button onClick={() => onOpenItem(selected.itemId!, { returnView: 'todo', focusActionId: selected.id })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-pink-200 hover:text-pink-700">查看详情</button>
                </div>
              )}
              {selected.kind === 'external' && (
                <div className="mt-5">
                  <button onClick={() => onOpenExternal(selected.source)} className="w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">去处理</button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">选择一条待办查看处理方式。</div>
          )}
        </aside>
      </div>
    </section>
  );
}

function parseWorkItemDeadline(deadline: string) {
  const match = deadline.match(/\d{4}-\d{2}-\d{2}/);
  if (!match) return null;
  const [year, month, day] = match[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getWorkItemDeadlineTone(deadline: string) {
  const deadlineDate = parseWorkItemDeadline(deadline);
  if (!deadlineDate) return 'text-gray-950';
  const today = new Date();
  const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  const daysLeft = Math.ceil((dueDay.getTime() - currentDay.getTime()) / 86400000);
  if (daysLeft <= 0) return 'text-pink-700';
  if (daysLeft <= 3) return 'text-amber-600';
  return 'text-gray-950';
}

function PersonNameButton({ name, onClick, muted = false }: { name: string; onClick: (name: string) => void; muted?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onClick(name)}
      className={`rounded-md px-1.5 py-0.5 text-sm font-semibold transition hover:bg-pink-50 hover:text-pink-700 ${
        muted ? 'text-gray-700' : 'text-gray-950'
      }`}
    >
      {name}
    </button>
  );
}

function PersonProfileCard({ name, onClose }: { name: string; onClose: () => void }) {
  const departments = ['信息管理部', 'IT服务处', '项目管理办公室', '客服中心'];
  const roles = ['负责人', '项目助理', '执行成员', '协作成员'];
  const seed = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return (
    <div className="ml-9 rounded-xl border border-pink-100 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <img src={getInitialsAvatar(name, 'ec4899')} alt={name} className="h-10 w-10 rounded-full border border-pink-100" />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-gray-950">{name}</div>
            <div className="mt-1 text-xs text-gray-500">{departments[seed % departments.length]} · {roles[seed % roles.length]}</div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" title="关闭名片">
          <X size={14} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-gray-50 px-2 py-1.5">
          <div className="font-bold text-gray-950">{(seed % 5) + 2}</div>
          <div className="mt-0.5 text-gray-500">参与事项</div>
        </div>
        <div className="rounded-lg bg-gray-50 px-2 py-1.5">
          <div className="font-bold text-gray-950">{(seed % 7) + 4}</div>
          <div className="mt-0.5 text-gray-500">任务</div>
        </div>
        <div className="rounded-lg bg-gray-50 px-2 py-1.5">
          <div className="font-bold text-pink-700">{(seed % 4) + 1}</div>
          <div className="mt-0.5 text-gray-500">评价</div>
        </div>
      </div>
    </div>
  );
}

function WorkItemBoardView({ items, onBack, onCreateItem, onOpenItem, onSubmitReport, onAssignTask, onCreateSubtask, onComment, onWeeklyReport }: {
  items: WorkItem[];
  onBack: () => void;
  onCreateItem: () => void;
  onOpenItem: (itemId: string) => void;
  onSubmitReport: (itemId: string) => void;
  onAssignTask: (itemId: string) => void;
  onCreateSubtask: (itemId: string, taskId: string) => void;
  onComment: (itemId: string) => void;
  onWeeklyReport: () => void;
}) {
  const [filter, setFilter] = useState<ProgressFilter>('全部');
  const [sort, setSort] = useState<ProgressSort>('风险优先');
  const [teamTypeFilter, setTeamTypeFilter] = useState('全部维度');
  const [teamFilter, setTeamFilter] = useState('全部团队');
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? '');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPersonName, setSelectedPersonName] = useState<string | null>(null);
  const teamTypeOptions = ['全部维度', ...Array.from(new Set(items.map(item => item.teamType)))];
  const teamOptions = ['全部团队', ...Array.from(new Set(items
    .filter(item => teamTypeFilter === '全部维度' || item.teamType === teamTypeFilter)
    .map(item => item.teamName)))];
  const riskCount = items.filter(item => item.riskLevel !== '正常').length;
  const reportCount = items.filter(item => item.status === '待填报').length;
  const averageProgress = items.length ? Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length) : 0;
  const filteredItems = items
    .filter(item => {
      if (teamTypeFilter !== '全部维度' && item.teamType !== teamTypeFilter) return false;
      if (teamFilter !== '全部团队' && item.teamName !== teamFilter) return false;
      if (filter === '我负责') return item.owner === MAIN_USER_NAME;
      if (filter === '我参与') return item.members.includes(MAIN_USER_NAME) && item.owner !== MAIN_USER_NAME;
      if (filter === '风险') return item.riskLevel !== '正常';
      if (filter === '待填报') return item.status === '待填报';
      if (filter === '已完成') return item.status === '已完成';
      return true;
    })
    .sort((a, b) => {
      if (sort === '截止时间') return a.deadline.localeCompare(b.deadline);
      if (sort === '进度最低') return a.progress - b.progress;
      if (sort === '最近更新') return (getWorkItemActivities(b)[0]?.order ?? 0) - (getWorkItemActivities(a)[0]?.order ?? 0);
      const riskScore = { 风险: 0, 关注: 1, 正常: 2 } as Record<WorkItem['riskLevel'], number>;
      return riskScore[a.riskLevel] - riskScore[b.riskLevel] || a.progress - b.progress;
    });
  const selected = filteredItems.find(item => item.id === selectedId) || filteredItems[0] || items[0];
  const selectedStats = selected ? getWorkItemCollaborationStats(selected) : null;
  const selectedActivities = selected ? getWorkItemActivities(selected) : [];
  const selectedReport = selected?.reports[0];
  const selectedOpenTasks = selected ? selected.tasks.filter(task => task.status !== '已完成') : [];
  const hasSelectedChildTasks = (taskId: string) => selected ? selected.tasks.some(task => task.parentId === taskId) : false;
  const getSelectedParentTask = (task: WorkItemTask) => selected ? selected.tasks.find(candidate => candidate.id === task.parentId) : undefined;
  const shouldPromoteSelectedTask = (task: WorkItemTask) => {
    const parentTask = getSelectedParentTask(task);
    return Boolean(task.parentId && (parentTask?.parentId || hasSelectedChildTasks(task.id)));
  };
  const selectedParentTasks = selected ? selected.tasks.filter(task => !task.parentId || shouldPromoteSelectedTask(task)) : [];
  const selectedFinishedTaskCount = selected ? selected.tasks.filter(task => task.status === '已完成').length : 0;
  const getSelectedSubtasks = (taskId: string) => selected ? selected.tasks.filter(task => task.parentId === taskId && !shouldPromoteSelectedTask(task)) : [];
  const selectedDeadlineTone = selected ? getWorkItemDeadlineTone(selected.deadline) : 'text-gray-950';

  return (
    <section>
      <PersonalViewHeader
        title="事项协同看板"
        subtitle="按团队和周期汇聚任务分派、执行进度、事项汇报、团队评价与外部数据来源。"
        onBack={onBack}
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={onWeeklyReport} className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100">
              <Sparkles size={16} />
              生成周报
            </button>
            <button onClick={onCreateItem} className="inline-flex items-center gap-2 rounded-xl bg-pink-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-800">
              <Plus size={16} />
              新建事项
            </button>
          </div>
        }
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-500">看板事项</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">{items.length} 项</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-500">平均进度</p>
          <p className="mt-2 text-2xl font-bold text-gray-950">{averageProgress}%</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-500">风险事项</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{riskCount} 项</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm text-gray-500">待事项汇报</p>
          <p className="mt-2 text-2xl font-bold text-pink-700">{reportCount} 项</p>
        </div>
      </div>
      <div className="mb-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-950">团队筛选</h3>
              <p className="mt-1 text-xs text-gray-500">先选汇报维度，再选具体团队。</p>
            </div>
            <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700">{teamFilter}</span>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="flex flex-wrap gap-2">
              {teamTypeOptions.map(item => (
                <button
                  key={item}
                  onClick={() => {
                    setTeamTypeFilter(item);
                    setTeamFilter('全部团队');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${teamTypeFilter === item ? 'bg-pink-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-700'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <select
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-pink-300"
            >
              {teamOptions.map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-950">事项筛选</h3>
              <p className="mt-1 text-xs text-gray-500">当前筛选结果 {filteredItems.length} 项。</p>
            </div>
            <select value={sort} onChange={(event) => setSort(event.target.value as ProgressSort)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-pink-300">
              {(['风险优先', '截止时间', '进度最低', '最近更新'] as ProgressSort[]).map(item => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['全部', '我负责', '我参与', '风险', '待填报', '已完成'] as ProgressFilter[]).map(item => (
              <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${filter === item ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-700'}`}>
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-gray-950">事项列表</h3>
            <p className="mt-1 text-xs text-gray-500">点击事项打开右侧详情，列表保留最关键的推进字段。</p>
          </div>
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-600">{filteredItems.length} 项</span>
        </div>
        <div className="max-h-[620px] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">当前筛选下暂无事项。</div>
          ) : filteredItems.map(item => {
            const selectedRow = selected?.id === item.id;
            const stats = getWorkItemCollaborationStats(item);
            const latestActivity = getLatestWorkItemActivity(item);
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  setDetailOpen(true);
                }}
                className={`w-full border-b border-gray-50 px-4 py-3 text-left transition last:border-b-0 ${
                  selectedRow ? 'bg-blue-50/70 ring-1 ring-inset ring-blue-100' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold text-gray-950">{item.title}</h4>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>{item.teamType} · {item.teamName}</span>
                      <span>{item.reportCycle}</span>
                      <span>负责人 {item.owner}</span>
                      <span>截止 {item.deadline}</span>
                    </div>
                  </div>
                  <div className="w-full sm:w-40">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-400">进度</span>
                      <span className="font-bold text-blue-700">{item.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <span className="block h-full rounded-full bg-blue-600" style={{ width: `${item.progress}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_260px]">
                  <p className="truncate text-sm text-gray-600">{latestActivity}</p>
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                    <span>汇报 {stats.reports}</span>
                    <span>任务 {stats.unfinished}/{stats.tasks}</span>
                    <span>评价 {stats.comments}</span>
                    <span>来源 {stats.sources}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {detailOpen && selected && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/20">
          <button className="absolute inset-0 cursor-default" onClick={() => setDetailOpen(false)} aria-label="关闭事项详情" />
          <aside className="relative flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-950">事项详情</h3>
              <div className="flex items-center gap-2">
                <button className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" title="关注" aria-label="关注">
                  <Star size={16} />
                </button>
                <button onClick={() => setDetailOpen(false)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800" title="关闭">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="px-6 py-5">
                <div className="mb-5">
                  <h2 className="text-2xl font-bold text-gray-950">{selected.title}</h2>
                </div>

                <div className="space-y-5 text-sm">
                  <div className="flex items-center gap-4">
                    <Users size={20} className="text-gray-400" />
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">负责人</span>
                      <PersonNameButton name={selected.owner} onClick={setSelectedPersonName} />
                      <span className="text-xs text-gray-500">助理</span>
                      <PersonNameButton name={selected.assistant} onClick={setSelectedPersonName} />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <UserPlus size={20} className="text-gray-400" />
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-500">项目团队成员</span>
                      {selected.members.map(member => (
                        <PersonNameButton key={member} name={member} onClick={setSelectedPersonName} muted />
                      ))}
                    </div>
                  </div>
                  {selectedPersonName && (
                    <PersonProfileCard name={selectedPersonName} onClose={() => setSelectedPersonName(null)} />
                  )}
                  <div className="flex items-center gap-4">
                    <CalendarIcon size={20} className="text-gray-400" />
                    <div className={`font-semibold ${selectedDeadlineTone}`}>截止时间 {selected.deadline}</div>
                  </div>
                  <div className="flex gap-4">
                    <MessageSquare size={20} className="mt-0.5 shrink-0 text-gray-400" />
                    <p className="leading-6 text-gray-600">{selected.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <ListTodo size={20} className="mt-1 shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-950">主任务与子任务</p>
                          <p className="mt-1 text-xs text-gray-500">主任务按事项推进阶段组织，子任务缩进展示归属。</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-semibold text-gray-900">{selectedFinishedTaskCount}/{selected.tasks.length}</span>
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100">
                            <span className="block h-full rounded-full bg-blue-600" style={{ width: `${selected.tasks.length ? (selectedFinishedTaskCount / selected.tasks.length) * 100 : 0}%` }} />
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {selectedParentTasks.map(task => {
                          const subtasks = getSelectedSubtasks(task.id);
                          const finishedSubtasks = subtasks.filter(subtask => subtask.status === '已完成').length;
                          const taskIsSubtask = Boolean(task.parentId);
                          return (
                            <div key={task.id} className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
                              <div className="flex items-start gap-2">
                                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${task.status === '已完成' ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white'}`}>
                                  {task.status === '已完成' && <CheckCircle2 size={13} />}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-semibold text-gray-950">{task.title}</p>
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                      <GitBranch size={12} />
                                      {taskIsSubtask ? '子任务' : '主任务'}
                                    </span>
                                    {subtasks.length > 0 && <span className="text-xs text-blue-700">子任务 {finishedSubtasks}/{subtasks.length}</span>}
                                    {!taskIsSubtask && <button onClick={() => onCreateSubtask(selected.id, task.id)} className="text-xs font-semibold text-pink-700 hover:text-pink-800">+ 分派子任务</button>}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                    <span>{task.assignee}</span>
                                    <span>{task.due}</span>
                                    <span>{task.status}</span>
                                  </div>
                                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                                    <span className="block h-full rounded-full bg-blue-600" style={{ width: `${task.progress}%` }} />
                                  </div>
                                  {subtasks.length > 0 && (
                                    <div className="mt-3 space-y-2 border-l-2 border-blue-100 pl-3">
                                      {subtasks.map(subtask => (
                                        <div key={subtask.id} className="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2">
                                          <div className="flex min-w-0 items-start gap-2">
                                            <span className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border ${subtask.status === '已完成' ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`} />
                                            <div className="min-w-0">
                                              <p className="truncate text-sm font-medium text-gray-800">{subtask.title}</p>
                                              <p className="mt-1 text-xs text-gray-500">{subtask.assignee} · {subtask.due}</p>
                                            </div>
                                          </div>
                                          <span className="shrink-0 text-xs font-semibold text-violet-700">子任务 {subtask.progress}%</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button onClick={() => onAssignTask(selected.id)} className="mt-3 text-sm font-medium text-gray-500 hover:text-pink-700">+ 分派任务</button>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Paperclip size={20} className="mt-0.5 shrink-0 text-gray-400" />
                    <div className="flex min-w-0 flex-wrap gap-1.5">
                      <span className="text-xs text-gray-500">附件</span>
                      {selected.sourceRefs.map(source => (
                        <span key={source.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          {source.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-7 border-t border-gray-100 pt-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h4 className="text-base font-bold text-gray-950">协作记录</h4>
                    <div className="flex gap-2 text-xs font-medium text-gray-500">
                      <span>汇报 {selectedStats?.reports ?? 0}</span>
                      <span>任务 {selectedStats?.unfinished ?? 0}/{selectedStats?.tasks ?? 0}</span>
                      <span>评价 {selectedStats?.comments ?? 0}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {selectedActivities.slice(0, 8).map(activity => (
                      <div key={activity.id} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gray-300" />
                        <div>
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold text-blue-700">{activity.actor}</span>
                            <span className="ml-1">{activity.title}</span>
                          </p>
                          <p className="mt-1 text-xs text-gray-500">{activity.type} · {activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 bg-white px-6 py-4">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                <input className="min-w-0 flex-1 text-sm outline-none" placeholder="输入评价" />
                <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" title="文字样式"><span className="text-sm font-semibold">Aa</span></button>
                <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" title="表情"><Smile size={18} /></button>
                <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" title="提及"><AtSign size={18} /></button>
                <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" title="图片"><ImageIcon size={18} /></button>
                <button className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100" title="附件"><Paperclip size={18} /></button>
                <button onClick={() => onComment(selected.id)} className="rounded-md p-1.5 text-pink-700 hover:bg-pink-50" title="发送"><Send size={18} /></button>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">助</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">{selected.members.length}</span>
                <span>{selected.members.length} 名成员</span>
                <button className="ml-1 rounded-lg p-1 text-gray-500 hover:bg-gray-100" title="添加成员"><Plus size={18} /></button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

function WorkItemTaskCreateView({ item, parentTaskId, draft, onBack, onDraftChange, onSubmit }: {
  item: WorkItem;
  parentTaskId?: string;
  draft: { title: string; owner: string; due: string };
  onBack: () => void;
  onDraftChange: React.Dispatch<React.SetStateAction<{ title: string; owner: string; due: string }>>;
  onSubmit: () => void;
}) {
  const parentTask = parentTaskId ? item.tasks.find(task => task.id === parentTaskId) : undefined;
  return (
    <section>
      <PersonalViewHeader
        title={parentTask ? '创建子任务' : '创建任务'}
        subtitle="由负责人或助理发起任务分派，执行人后续通过事项汇报提交进度。"
        onBack={onBack}
        action={
          <button onClick={onSubmit} className="inline-flex items-center gap-2 rounded-xl bg-pink-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-800">
            <Save size={16} />
            {parentTask ? '创建子任务' : '创建任务'}
          </button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-900">任务信息</p>
            <p className="mt-1 text-sm text-gray-500">任务会进入执行人的待办，并汇入当前事项的协作看板。</p>
          </div>
          <div className="grid gap-4">
            {parentTask && (
              <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800">
                父任务：{parentTask.title}
              </div>
            )}
            <label>
              <span className="text-sm font-medium text-gray-700">任务名称</span>
              <input
                value={draft.title}
                onChange={(event) => onDraftChange(prev => ({ ...prev, title: event.target.value }))}
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-400"
                placeholder="请输入需要执行人完成的具体任务"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-gray-700">执行人</span>
                <input
                  value={draft.owner}
                  onChange={(event) => onDraftChange(prev => ({ ...prev, owner: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-400"
                  placeholder="请输入执行人"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-gray-700">截止时间</span>
                <input
                  value={draft.due}
                  onChange={(event) => onDraftChange(prev => ({ ...prev, due: event.target.value }))}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-pink-400"
                  placeholder="如 2026-08-12"
                />
              </label>
            </div>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-pink-700">关联事项</p>
            <h3 className="mt-1 text-lg font-bold text-gray-950">{item.title}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-400">团队</p>
                <p className="mt-1 font-semibold text-gray-900">{item.teamName}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-400">周期</p>
                <p className="mt-1 font-semibold text-gray-900">{item.reportCycle}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-400">指派人</p>
                <p className="mt-1 font-semibold text-gray-900">{MAIN_USER_NAME}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-400">现有任务</p>
                <p className="mt-1 font-semibold text-gray-900">{item.tasks.length} 项</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-950">最近任务</h3>
            <div className="mt-3 space-y-2">
              {item.tasks.slice(0, 4).map(task => (
                <div key={task.id} className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="truncate text-sm font-medium text-gray-800">{task.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{task.assigner} 指派给 {task.assignee} · {task.due}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function WorkItemReportSubmitView({ item, taskId, draft, onBack, onDraftChange, onWeeklyReport, onSubmit }: {
  item: WorkItem;
  taskId?: string;
  draft: { thisPeriod: string; nextPlan: string; risk: string; progress: number };
  onBack: () => void;
  onDraftChange: React.Dispatch<React.SetStateAction<{ thisPeriod: string; nextPlan: string; risk: string; progress: number }>>;
  onWeeklyReport: () => void;
  onSubmit: () => void;
}) {
  const relatedTask = taskId ? item.tasks.find(task => task.id === taskId) : undefined;
  return (
    <section>
      <PersonalViewHeader
        title="提交事项汇报"
        subtitle="事项填报、工作汇报、任务执行记录统一沉淀到事项汇报，支撑看板、详情和周报总结。"
        onBack={onBack}
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={onWeeklyReport} className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100">
              <Sparkles size={16} />
              AI周报总结
            </button>
            <button onClick={onSubmit} className="inline-flex items-center gap-2 rounded-xl bg-pink-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-800">
              <Save size={16} />
              提交事项汇报
            </button>
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-900">汇报内容</p>
            <p className="mt-1 text-sm text-gray-500">执行人提交后会同步更新事项进度、关联任务执行记录和协作动态。</p>
          </div>
          <div className="grid gap-4">
            {relatedTask && (
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                关联任务：{relatedTask.title}，当前进度 {relatedTask.progress}%
              </div>
            )}
            <label>
              <span className="text-sm font-medium text-gray-700">本阶段完成</span>
              <textarea
                value={draft.thisPeriod}
                onChange={(event) => onDraftChange(prev => ({ ...prev, thisPeriod: event.target.value }))}
                className="mt-2 min-h-32 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                placeholder="说明本周期围绕事项完成了什么、对应哪些任务"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-gray-700">下阶段计划</span>
              <textarea
                value={draft.nextPlan}
                onChange={(event) => onDraftChange(prev => ({ ...prev, nextPlan: event.target.value }))}
                className="mt-2 min-h-24 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                placeholder="说明下一步计划和需要谁配合"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-gray-700">风险和需协调事项</span>
              <textarea
                value={draft.risk}
                onChange={(event) => onDraftChange(prev => ({ ...prev, risk: event.target.value }))}
                className="mt-2 min-h-20 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-400"
                placeholder="没有风险可填写“暂无”"
              />
            </label>
            <label className="grid gap-2 text-sm text-gray-600">
              <span className="font-medium text-gray-700">当前进度：{draft.progress}%</span>
              <input type="range" min={0} max={100} value={draft.progress} onChange={(event) => onDraftChange(prev => ({ ...prev, progress: Number(event.target.value) }))} />
            </label>
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-pink-700">汇报口径</p>
            <h3 className="mt-1 text-lg font-bold text-gray-950">{item.title}</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>团队：{item.teamType} · {item.teamName}</p>
              <p>周期：{item.reportCycle}</p>
              <p>负责人：{item.owner}，助理：{item.assistant}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-950">已有事项汇报</h3>
            <div className="mt-3 space-y-2">
              {item.reports.slice(0, 3).map(report => (
                <div key={report.id} className="rounded-xl bg-gray-50 px-3 py-3">
                  <div className="flex justify-between gap-3 text-xs text-gray-500">
                    <span>{report.source}</span>
                    <span>{report.submittedAt}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-700">{report.thisPeriod}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-950">可汇聚来源</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {['事项填报', '工作汇报', '任务执行记录', '团队评价', '未来OKR', '会议纪要'].map(source => (
                <span key={source} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{source}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function WorkItemEvaluationSubmitView({ item, value, onBack, onChange, onSubmit }: {
  item: WorkItem;
  value: string;
  onBack: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section>
      <PersonalViewHeader
        title="写评价"
        subtitle="团队成员围绕事项推进质量、协作效果和风险感知写评价，统一进入事项汇报口径。"
        onBack={onBack}
        action={
          <button onClick={onSubmit} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
            <Save size={16} />
            提交评价
          </button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-900">评价内容</p>
            <p className="mt-1 text-sm text-gray-500">评价会进入事项详情和协作动态，用于团队复盘和周报素材汇聚。</p>
          </div>
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="min-h-56 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
            placeholder="请评价当前事项推进效果、协作情况、风险提醒或改进建议"
          />
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-blue-700">评价对象</p>
            <h3 className="mt-1 text-lg font-bold text-gray-950">{item.title}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-400">团队</p>
                <p className="mt-1 font-semibold text-gray-900">{item.teamName}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-400">周期</p>
                <p className="mt-1 font-semibold text-gray-900">{item.reportCycle}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-400">进度</p>
                <p className="mt-1 font-semibold text-gray-900">{item.progress}%</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-xs text-gray-400">风险</p>
                <p className="mt-1 font-semibold text-gray-900">{item.riskLevel}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-950">已有团队评价</h3>
            <div className="mt-3 space-y-2">
              {item.comments.length === 0 ? (
                <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">暂无评价</div>
              ) : item.comments.slice(0, 4).map(comment => (
                <div key={comment.id} className="rounded-xl bg-gray-50 px-3 py-3">
                  <div className="flex justify-between gap-3 text-xs text-gray-500">
                    <span>{comment.author} · {comment.attitude}</span>
                    <span>{comment.createdAt}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function MyItemDetailView({ item, onBack, focusTaskId, focusActionId, onSubmitReport, onAssignTask, onComment, onCreateSubtask, onCompleteTask }: {
  item: WorkItem;
  onBack: () => void;
  focusTaskId?: string;
  focusActionId?: string;
  onSubmitReport: () => void;
  onAssignTask: () => void;
  onComment: () => void;
  onCreateSubtask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}) {
  const focusedTask = item.tasks.find(task => task.id === focusTaskId);
  const crumbSource = focusActionId ? '我的待办' : '事项协同看板';
  const focusHint = focusActionId
    ? focusedTask ? `当前聚焦：${focusedTask.title}` : '当前聚焦：待处理动作'
    : '当前查看：进度与风险状态';
  const parentTasks = item.tasks.filter(task => !task.parentId);
  const getSubtasks = (taskId: string) => item.tasks.filter(task => task.parentId === taskId);
  const collaborationStats = getWorkItemCollaborationStats(item);
  const activities = getWorkItemActivities(item);
  return (
    <section>
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 shadow-sm hover:border-pink-200 hover:text-pink-700" title="返回">
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div>
              <div className="text-xs font-medium text-gray-400">我的工作台 / {crumbSource} / 事项详情</div>
              <h2 className="mt-1 text-2xl font-bold text-gray-950">{item.title}</h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onSubmitReport} className="rounded-xl bg-pink-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-800">提交事项汇报</button>
            <button onClick={onComment} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-blue-200 hover:text-blue-700">写评价</button>
            <button onClick={onAssignTask} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-pink-200 hover:text-pink-700">指派任务</button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-medium text-gray-700">{item.type}</span>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-medium text-blue-700">{item.teamType} · {item.teamName}</span>
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-medium text-gray-700">{item.reportCycle}</span>
          <span className="rounded-lg bg-pink-50 px-2.5 py-1 font-medium text-pink-700">{getMyWorkItemRole(item)}</span>
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-medium text-gray-700">{item.status}</span>
          <span className={`rounded-lg border px-2.5 py-1 font-medium ${getRiskTone(item.riskLevel)}`}>{item.riskLevel}</span>
          <span className="rounded-lg bg-gray-100 px-2.5 py-1 font-medium text-gray-700">截止 {item.deadline}</span>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-bold text-blue-700">进度 {item.progress}%</span>
        </div>
        <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${focusActionId ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
          {focusHint}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getRiskTone(item.riskLevel)}`}>{item.riskLevel}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{item.status}</span>
                {item.okrLink && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{item.okrLink}</span>}
                {focusActionId && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">来自待办</span>}
              </div>
              <span className="text-xl font-bold text-pink-700">{item.progress}%</span>
            </div>
            {focusedTask && (
              <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                当前聚焦任务：{focusedTask.title}
              </div>
            )}
            <p className="text-sm leading-6 text-gray-600">{item.description}</p>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-gray-500">当前进度</span>
                <span className="font-semibold text-gray-900">{item.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-pink-500" style={{ width: `${item.progress}%` }} />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-gray-950">任务清单</h3>
            <div className="space-y-3">
              {parentTasks.map(task => {
                const subtasks = getSubtasks(task.id);
                return (
                  <div key={task.id} className={`rounded-xl px-4 py-3 ${task.id === focusTaskId ? 'border border-amber-200 bg-amber-50/70' : 'bg-gray-50'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-gray-900">{task.title}</h4>
                        <p className="mt-1 text-xs text-gray-500">{task.assigner} 指派给 {task.assignee} · {task.due}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-600">{task.status}</span>
                        <button onClick={() => onCreateSubtask(task.id)} className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-violet-200 hover:text-violet-700">新建子任务</button>
                        {task.status !== '已完成' && <button onClick={() => onCompleteTask(task.id)} className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:border-emerald-200 hover:text-emerald-700">标记完成</button>}
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: `${task.progress}%` }} />
                    </div>
                    {subtasks.length > 0 && (
                      <div className="mt-3 space-y-2 border-l-2 border-violet-100 pl-3">
                        {subtasks.map(subtask => (
                          <div key={subtask.id} className={`rounded-lg bg-white px-3 py-2 ${subtask.id === focusTaskId ? 'ring-1 ring-amber-200' : ''}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-gray-800">{subtask.title}</p>
                                <p className="mt-1 text-xs text-gray-500">{subtask.assigner} 指派给 {subtask.assignee} · {subtask.due}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">子任务</span>
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{subtask.status}</span>
                                {subtask.status !== '已完成' && <button onClick={() => onCompleteTask(subtask.id)} className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:border-emerald-200 hover:text-emerald-700">标记完成</button>}
                              </div>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                              <div className="h-full rounded-full bg-violet-500" style={{ width: `${subtask.progress}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <aside className="space-y-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-gray-950">协作构成</h3>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: '任务', value: collaborationStats.tasks },
                { label: '子任务', value: collaborationStats.subtasks },
                { label: '事项汇报', value: collaborationStats.reports },
                { label: '评价', value: collaborationStats.comments },
                { label: '未完成', value: collaborationStats.unfinished },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl bg-gray-50 px-2 py-2 text-center">
                  <p className="text-base font-bold text-gray-950">{stat.value}</p>
                  <p className="mt-1 text-[11px] text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-950">事项汇报</h3>
              <button onClick={onSubmitReport} className="rounded-lg bg-pink-50 px-2.5 py-1.5 text-xs font-semibold text-pink-700 hover:bg-pink-100">提交事项汇报</button>
            </div>
            <div className="space-y-3">
              {item.reports.map(report => (
                <div key={report.id} className="rounded-xl bg-gray-50 px-4 py-3">
                  <div className="mb-2 flex justify-between gap-3 text-xs text-gray-500">
                    <span>{report.member}</span>
                    <span>{report.submittedAt}</span>
                  </div>
                  <span className="mb-2 inline-flex rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-700">{report.source}</span>
                  <p className="text-sm text-gray-700">{report.thisPeriod}</p>
                  <p className="mt-2 text-xs text-gray-500">下步：{report.nextPlan}</p>
                  <p className="mt-2 text-xs text-gray-500">风险：{report.risk}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-base font-bold text-gray-950">团队评价</h3>
              <button onClick={onComment} className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">写评价</button>
            </div>
            <div className="space-y-3">
              {item.comments.length === 0 ? (
                <div className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">暂无评价</div>
              ) : item.comments.map(comment => (
                <div key={comment.id} className="rounded-xl bg-gray-50 px-4 py-3">
                  <div className="mb-2 flex justify-between gap-3 text-xs text-gray-500">
                    <span>{comment.author} · {comment.attitude}</span>
                    <span>{comment.createdAt}</span>
                  </div>
                  <p className="text-sm leading-6 text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-gray-950">动态记录</h3>
            <div className="space-y-3">
              {activities.map(activity => (
                <div key={activity.id} className="border-l-2 border-pink-100 pl-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${activity.tone}`}>{activity.type}</span>
                  <p className="mt-1 text-sm font-semibold text-gray-800">{activity.title}</p>
                  <p className="mt-1 text-xs text-gray-500">{activity.actor} · {activity.time}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PortalCardShell({ card, dragging, dragOver, onDragStart, onDragEnd, children }: {
  card: CardConfig;
  dragging: boolean;
  dragOver: boolean;
  onDragStart: (id: CardType) => void;
  onDragEnd: () => void;
  children: React.ReactNode;
}) {
  const spanClass = card.id === 'stats' || card.id === 'documents'
    ? 'md:col-span-2 xl:col-span-8'
    : 'md:col-span-1 xl:col-span-4';

  return (
    <div
      data-portal-card-id={card.id}
      className={`${spanClass} group/card relative transition-all duration-200 ${dragging ? 'opacity-50' : ''} ${dragOver ? 'rounded-3xl ring-2 ring-pink-300 ring-offset-4 ring-offset-pink-50' : ''}`}
    >
      <div
        draggable
        onDragStart={(event: React.DragEvent<HTMLDivElement>) => {
          event.dataTransfer.effectAllowed = 'move';
          event.dataTransfer.setData('text/plain', card.id);
          onDragStart(card.id);
        }}
        onDragEnd={onDragEnd}
        title="拖动调整卡片位置"
        className="absolute left-1/2 top-0 z-30 hidden -translate-x-1/2 -translate-y-1/2 cursor-grab items-center gap-1 rounded-full border border-pink-100 bg-white px-3 py-1 text-xs font-medium text-pink-700 shadow-lg shadow-pink-900/5 transition active:cursor-grabbing group-hover/card:flex"
      >
        <GripVertical size={13} />
        <span>拖动</span>
      </div>
      {children}
    </div>
  );
}
// 统一的数据统计卡片组件
function StatsCard({ stat, active, menuId, onSelect, onEdit, onHide, onToggleMenu }: {
  stat: StatConfig;
  active: boolean;
  menuId: string | null;
  onSelect: (key: StatKey) => void;
  onEdit: (key: StatKey) => void;
  onHide: (key: StatKey) => void;
  onToggleMenu: (id: string) => void;
}) {
  const tone = statToneMap[stat.color];
  const menuIdValue = `stats-${stat.key}`;


  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(stat.key)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(stat.key);
        }
      }}
      className={`group relative min-w-0 cursor-pointer overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm transition-all duration-300 ${
        active ? `${tone.border} shadow-lg ${tone.ring} ring-4` : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
      }`}
    >
      <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${tone.gradient} opacity-5 blur-3xl transition-opacity group-hover:opacity-10`} />
      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div>
            <p className={`text-sm font-semibold ${active ? tone.text : 'text-gray-600'}`}>{stat.title}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.summary}</p>
          </div>
          <div className="relative shrink-0">
            <button
              onClick={(event) => {
                event.stopPropagation();
                onToggleMenu(menuIdValue);
              }}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              title="设置"
            >
              <Settings size={15} />
            </button>
            {menuId === menuIdValue && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => onToggleMenu('')} />
                <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(stat.key);
                      onToggleMenu('');
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Edit3 size={15} className="text-gray-400" />
                    <span>编辑</span>
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onHide(stat.key);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <EyeOff size={15} className="text-gray-400" />
                    <span>不再展示</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="min-w-0">
          {stat.count && <p className="truncate text-3xl font-bold text-gray-900">{stat.count}</p>}
          {stat.amount && <p className="truncate text-[clamp(1.05rem,2vw,1.65rem)] font-bold leading-tight text-gray-900">{stat.amount}</p>}
          {stat.change && (
            <p className="mt-2 flex items-center text-sm font-medium text-green-600">
              <TrendingUp size={14} className="mr-1 shrink-0" />
              <span className="truncate">{stat.change} 较上月</span>
            </p>
          )}
        </div>
      </div>
      {active && <div className={`absolute inset-x-4 bottom-0 h-1 rounded-t-full bg-gradient-to-r ${tone.gradient}`} />}
    </div>
  );
}

function CardHeaderActions({ menuId, menuKey, onEdit, onToggleMenu }: {
  menuId: string | null;
  menuKey: string;
  onEdit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onToggleMenu: (id: string) => void;
}) {

  return (
    <div className="relative flex shrink-0 items-center gap-1">
      <button
        onClick={onEdit}
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-pink-50 hover:text-pink-700"
        title="编辑"
      >
        <Edit3 size={15} />
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onToggleMenu(menuKey);
        }}
        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        title="更多"
      >
        <MoreHorizontal size={16} />
      </button>
      {menuId === menuKey && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => onToggleMenu('')} />
          <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
              <ExternalLink size={16} className="text-gray-400" />
              <span>查看全部</span>
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
              <RefreshCw size={16} className="text-gray-400" />
              <span>刷新数据</span>
            </button>
            <button className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50">
              <EyeOff size={16} className="text-gray-400" />
              <span>隐藏卡片</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function StatsDetailPanel({ activeStat, tone, approvals, approvalTotal, todos, trackedItems, revenueDetails, onEdit, onAddTodo, onNavigate }: {
  activeStat: StatConfig;
  tone: typeof statToneMap[keyof typeof statToneMap];
  approvals: ApprovalProcess[];
  approvalTotal: number;
  todos: TodoItem[];
  trackedItems: TrackedItem[];
  revenueDetails: { name: string; value: string; change: string; owner: string }[];
  onEdit: (key: StatKey) => void;
  onAddTodo: () => void;
  onNavigate: (destination: string) => void;
}) {
  const renderHeaderAction = () => {
    if (activeStat.key === 'revenue') {
      return (
        <button
          onClick={() => onNavigate('数据看板')}
          className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:text-pink-700"
        >
          <MoreHorizontal size={16} />
          更多
        </button>
      );
    }

    if (activeStat.key === 'todo') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={onAddTodo}
            className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:text-pink-700"
          >
            <Plus size={15} />
            新增任务
          </button>
          <button
            onClick={() => onEdit(activeStat.key)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:text-pink-700"
          >
            <Edit3 size={15} />
            编辑来源
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={() => onEdit(activeStat.key)}
        className="inline-flex items-center gap-2 rounded-lg border border-white/70 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:text-pink-700"
      >
        <Edit3 size={15} />
        编辑
      </button>
    );
  };


  return (
    <div className={`rounded-2xl border bg-white shadow-sm ${tone.border}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-b border-gray-100 px-5 py-4 ${tone.bg}`}>
        <div className="flex items-center gap-3">
          <span className={`h-9 w-1.5 rounded-full bg-gradient-to-b ${tone.gradient}`} />
          <div>
            <h3 className="text-base font-bold text-gray-900">{activeStat.summary}</h3>
            <p className="text-xs text-gray-500">由上方“{activeStat.title}”卡片展开</p>
          </div>
        </div>
        {renderHeaderAction()}
      </div>

      <div className="p-5">
        {activeStat.key === 'approval' && (
          <div>
            <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
              <span>当前展示 {approvals.length} 条，共 {approvalTotal} 条</span>
              <span>来源系统包含 OA、IT需求、EHR、SMS、费控等</span>
            </div>
            <div className="space-y-2.5">
              {approvals.map(item => (
                <ProcessItemFlow key={item.id} {...item} />
              ))}
            </div>
          </div>
        )}

        {activeStat.key === 'revenue' && (
          <div className="grid gap-3 sm:grid-cols-3">
            {revenueDetails.map(item => (
              <button key={item.name} onClick={() => onNavigate('数据看板')} className="rounded-xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-green-100 hover:bg-green-50/30">
                <p className="text-sm font-semibold text-gray-700">{item.name}</p>
                <p className="mt-2 text-xl font-bold text-gray-900">{item.value}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-400">{item.owner}</span>
                  <span className="font-semibold text-green-600">{item.change}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeStat.key === 'todo' && (
          <div className="space-y-3">
            {todos.map(item => (
              <div key={item.id} className="rounded-xl border border-gray-100 px-4 py-3 hover:bg-amber-50/30">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                    <CheckSquare size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-gray-900">{item.title}</h4>
                    <p className="mt-1 text-xs text-gray-500">{item.source} · {item.owner} · {item.due}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{item.status}</span>
                  {typeof item.progress === 'number' && <span className="text-xs font-semibold text-amber-700">{item.progress}%</span>}
                </div>
                {item.subtasks && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {item.subtasks.map(task => (
                      <div key={task.name} className="rounded-lg bg-gray-50 px-3 py-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-gray-700">{task.name}</span>
                          <span className="font-semibold text-gray-600">{task.progress}%</span>
                        </div>
                        <p className="mt-1 text-gray-400">指派：{task.owner}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeStat.key === 'progress' && (
          <div className="space-y-3">
            {trackedItems.map(item => (
              <TrackedItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// 其他组件保持不变

function ProcessItemFlow({ title, code, creator, time, location, sourceSystem }: ApprovalProcess) {

  return (
    <div className="group rounded-xl border border-gray-100 px-3.5 py-3 transition-all duration-300 hover:border-pink-100 hover:bg-pink-50/40">
      <div className="mb-2 flex items-start gap-2.5">
        <FileText size={15} className="mt-0.5 shrink-0 text-pink-700" />
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold text-gray-800 transition-colors group-hover:text-pink-900">{title}</h4>
          <p className="mt-1 text-[11px] text-gray-400">{time}</p>
        </div>
      </div>
      <div className="ml-6 flex flex-wrap gap-1.5 text-[11px] text-gray-500">
        <span className="rounded bg-pink-50 px-2 py-0.5 text-pink-700">来源：{sourceSystem}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5">编号：{code}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5">创建者：{creator}</span>
        <span className="rounded bg-gray-100 px-2 py-0.5">{location}</span>
      </div>
    </div>
  );
}

function DocumentItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300 cursor-pointer">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 truncate group-hover:text-purple-900 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      <ChevronRight size={16} className="text-gray-400 group-hover:text-pink-600 transition-colors" />
    </div>
  );
}

function GanttChart({ projectName, progress, tasks }: { projectName: string; progress: number; tasks: { name: string; start: number; end: number; completed: boolean | number }[] }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:border-cyan-100 hover:bg-cyan-50/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">{projectName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">进度</span>
          <span className="text-sm font-bold text-cyan-700">{progress}%</span>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-xs text-gray-600 truncate">{task.name}</div>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  task.completed === true 
                    ? 'bg-gradient-to-r from-green-500 to-green-700' 
                    : typeof task.completed === 'number' && task.completed > 0 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-700' 
                      : 'bg-gray-300'
                }`}
                style={{ width: typeof task.completed === 'number' ? `${task.completed}%` : '100%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackedItemCard({ item, editable = false }: { item: TrackedItem; editable?: boolean }) {
  const isOkr = item.source === 'okr';


  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-blue-100 hover:bg-blue-50/20">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isOkr ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
              {isOkr ? <Target size={16} /> : <CircleDot size={16} />}
            </span>
            <h4 className="min-w-0 truncate text-sm font-bold text-gray-900">{item.title}</h4>
          </div>
          <p className="mt-2 text-xs text-gray-500">{item.owner} · {item.status}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{item.progress}%</p>
          <p className="text-xs text-gray-400">当前进度</p>
        </div>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${isOkr ? 'bg-pink-600' : 'bg-blue-600'}`} style={{ width: `${item.progress}%` }} />
      </div>
      <div className="space-y-2">
        {item.tasks.map(task => (
          <div key={task.name} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2">
            <CircleCheckBig size={15} className={task.progress === 100 ? 'text-green-600' : 'text-gray-300'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-700">{task.name}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{task.owner}</p>
            </div>
            <span className="text-xs font-semibold text-gray-600">{task.progress}%</span>
          </div>
        ))}
      </div>
      {editable && !isOkr && (
        <div className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
          项目进展事项来自项目任务同步，当前仅支持选择已有项目数据。
        </div>
      )}
      {editable && isOkr && (
        <div className="mt-3 rounded-lg bg-pink-50 px-3 py-2 text-xs text-pink-700">
          OKR关联事项进度与所选 OKR 保持一致。
        </div>
      )}
    </div>
  );
}

function CalendarEvent({ time, title, color, textColor }: { time: string; title: string; color: string; textColor: string }) {
  return (
    <div className={`group flex items-center gap-3 p-3 ${color} rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer`}>
      <div className={`w-20 text-sm font-semibold ${textColor}`}>{time}</div>
      <div className={`flex-1 text-sm ${textColor} group-hover:opacity-80`}>{title}</div>
    </div>
  );
}

function CourseItem({ title, time, color }: { title: string; time: string; color: string }) {
  const colorMap = {
    blue: { bg: 'bg-blue-500', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-100' },
    pink: { bg: 'bg-pink-700', border: 'border-pink-100' },
    green: { bg: 'bg-green-500', border: 'border-green-100' },
  };
  const c = colorMap[color as keyof typeof colorMap];

  return (
    <div className={`group flex gap-3 p-4 border border-gray-100 rounded-xl hover:${c.border} hover:bg-gray-50 transition-all duration-300 cursor-pointer`}>
      <div className={`w-14 h-14 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}>
        <BookOpen size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 truncate leading-tight">{title}</h4>
        <p className="text-xs text-gray-500 mt-2">{time}</p>
      </div>
      <ChevronRight size={16} className="text-gray-400 group-hover:text-pink-600 flex-shrink-0 transition-colors" />
    </div>
  );
}

















