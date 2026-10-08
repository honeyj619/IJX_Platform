import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileText,
  FolderKanban,
  Lightbulb,
  Loader2,
  Mail,
  MessageSquareText,
  Paperclip,
  PencilLine,
  RefreshCw,
  Save,
  Search,
  Send,
  Sparkles,
  X,
} from 'lucide-react';
import { type AdvisorMode, type AdvisorSource } from '../data/advisor';
import { MAIN_USER_NAME, getDemoPerson } from '../data/people';
import { workItems } from '../data/workItems';
import { buildProjectWeeklyData, getHealthLightMeta, type HealthLight, type ProjectWeeklyData } from '../data/projectWeeklyReport';
import ProjectWeeklyReport, { REPORT_SECTION_COUNT as sectionCount } from '../components/ProjectWeeklyReport';

type AdvisorStage = 'empty' | 'confirming' | 'generating' | 'draft' | 'dispatching' | 'sending' | 'submitted' | 'failed';
type SideTab = 'current' | 'history';
type AdvisorReportKind = 'personal' | 'project';
type DispatchConfig = {
  sender: string;
  recipients: string[];
  cc: string[];
  wecom: string[];
};

type SendReceipt = {
  channel: '邮件' | '企业微信';
  target: string;
  time: string;
  success: boolean;
};

const MAIN_USER_EMAIL = 'jili.liang@juneyaoair.com';

const emailValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

type ReportDraft = {
  title: string;
  summary: string;
  completed: string;
  risks: string;
  nextPlan: string;
  support: string;
};

const sourceCatalog = [
  { id: 'todos', name: '待办事项', detail: '5 条待处理', icon: ClipboardCheck, href: '/web_client/enterprise' },
  { id: 'reports', name: '历史工作汇报', detail: '最近 4 周', icon: FileText, href: '/web_client/work-report' },
  { id: 'calendar', name: '日程 / 会议', detail: '本周期 3 场', icon: CalendarDays, href: '/web_client/calendar' },
  { id: 'projects', name: '项目管理平台', detail: '按项目生成独立周报', icon: FolderKanban, href: '/web_client/enterprise' },
];

const projectOptions = workItems.map((item, index) => ({
  id: item.id,
  code: `PRJ-2026-${String(index + 1).padStart(3, '0')}`,
  name: item.title,
  owner: item.owner,
  teamName: item.teamName,
  progress: item.progress,
  status: item.status,
  riskLevel: item.riskLevel,
  description: item.description,
  latestReport: item.latestReport,
}));

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentWeekRange = () => {
  const today = new Date();
  const monday = new Date(today);
  const weekday = today.getDay() || 7;
  monday.setDate(today.getDate() - weekday + 1);
  return `${formatDate(monday)} 至 ${formatDate(today)}`;
};

const historyRecords = [
  { id: 'h1', mode: 'report' as const, title: '第39周工作汇报', meta: '工作汇报 · 已提交', time: '今天 17:42' },
  { id: 'h2', mode: 'insight' as const, title: '项目协同组工作洞察', meta: '团队洞察 · 已生成', time: '今天 11:20' },
  { id: 'h3', mode: 'report' as const, title: '门户优化事项阶段汇报', meta: '事项汇报 · 草稿', time: '昨天 18:05' },
  { id: 'h4', mode: 'insight' as const, title: '本周风险与待办分析', meta: '个人洞察 · 已生成', time: '09月27日' },
];

const historicalReportOptions = [
  { id: 'report-week-40', title: '第40周个人工作汇报', author: MAIN_USER_NAME, period: '2026-10-05 至 2026-10-08', status: '已提交' },
  { id: 'report-week-39', title: '第39周项目工作汇报', author: getDemoPerson(3), period: '2026-09-28 至 2026-10-04', status: '已提交' },
  { id: 'report-week-38', title: '第38周工作门户专项汇报', author: getDemoPerson(5), period: '2026-09-21 至 2026-09-27', status: '已提交' },
  { id: 'report-week-37', title: '第37周协同事项汇报', author: getDemoPerson(6), period: '2026-09-14 至 2026-09-20', status: '已提交' },
];

const reportGenerationStages = [
  { title: '读取工作数据', detail: '汇聚待办事项、历史工作汇报、日程会议、项目管理平台与参考附件' },
  { title: '归纳进展与风险', detail: '识别已完成工作、延期风险和需要协调的事项' },
  { title: '组织汇报结构', detail: '根据需求和入口上下文生成可编辑草稿' },
];

const insightGenerationStages = [
  { title: '确认分析范围', detail: '读取时间范围、参谋分类和已选数据来源' },
  { title: '计算工作状态', detail: '统计任务进展、风险、待办和汇报提交情况' },
  { title: '形成参谋建议', detail: '输出重点、问题和下一步行动建议' },
];

const defaultDraft: ReportDraft = {
  title: '本周工作汇报',
  summary: '本周期围绕工作门户、如意空间和协同事项持续推进，重点功能已进入联调与验收阶段，整体进度符合计划。',
  completed: '1. 完成工作门户数据卡片与下设列表交互调整。\n2. 推进如意空间公文、PPT工作台入口与流程统一。\n3. 梳理任务、待办、事项和工作汇报的智能化能力，形成统一参谋师方案。',
  risks: '部分跨系统数据仍为模拟口径，正式接入前需要再次确认字段映射和权限范围。',
  nextPlan: '1. 完成如意参谋师工作台联调与入口回归。\n2. 补充项目管理周报模板及取数规则。\n3. 跟进工作门户窄屏适配和业务验收反馈。',
  support: '需要项目组确认项目管理周报模板字段，并协调数据接口负责人完成真实数据映射。',
};

const createProjectDraft = (project: (typeof projectOptions)[number]): ReportDraft => ({
  title: `${project.name}项目周报`,
  summary: `${project.name}本周期整体推进至 ${project.progress}%，项目状态为“${project.status}”，核心工作按当前计划持续推进。`,
  completed: `1. 已完成本周期项目进展与任务执行情况汇总。\n2. ${project.latestReport}\n3. 已同步${project.teamName}相关成员确认关键节点。`,
  risks: project.riskLevel === '正常'
    ? '当前未发现影响整体计划的重大风险，仍需持续关注跨团队协同和后续节点完成情况。'
    : `当前项目风险等级为“${project.riskLevel}”，需要持续跟进关键任务、依赖事项和责任人反馈。`,
  nextPlan: `1. 跟进${project.name}未完成任务并确认责任人与截止时间。\n2. 完成下一阶段成果验收及问题闭环。\n3. 持续更新项目进度和风险状态。`,
  support: `请${project.teamName}协助确认下一阶段资源安排，并及时反馈跨部门依赖事项。`,
});

const sourceLabels: Record<AdvisorSource, string> = {
  'ruyi-zone': '如意空间',
  'work-report': '工作汇报',
  'work-item': '事项协同看板',
  task: '任务详情',
  todo: '我的待办',
  'report-stats': '汇报统计',
  'external-agent': '其他智能体',
};

export default function AdvisorWorkbench({ onBack }: { onBack?: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialModeParam = (params.get('mode') || 'report') as AdvisorMode;
  const initialMode: AdvisorMode = initialModeParam === 'insight' ? 'insight' : 'report';
  const initialPrompt = params.get('initialPrompt') || '';
  const source = (params.get('source') || 'ruyi-zone') as AdvisorSource;
  const contextId = params.get('contextId') || '';
  const returnTo = params.get('returnTo') || '';
  const contextItem = useMemo(() => workItems.find(item => item.id === contextId), [contextId]);

  const [mode, setMode] = useState<AdvisorMode>(initialMode);
  const [stage, setStage] = useState<AdvisorStage>('empty');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [composerValue, setComposerValue] = useState('');
  const [sideTab, setSideTab] = useState<SideTab>('current');
  const [generationStep, setGenerationStep] = useState(0);
  const [draft, setDraft] = useState<ReportDraft>(() => ({
    ...defaultDraft,
    title: contextItem ? `${contextItem.title}阶段汇报` : params.get('reportType') || defaultDraft.title,
  }));
  const [period, setPeriod] = useState(params.get('period') || getCurrentWeekRange());
  const [reportType, setReportType] = useState('项目汇报');
  const [reportTo, setReportTo] = useState(getDemoPerson(0));
  const [copyTo, setCopyTo] = useState(`${getDemoPerson(5)}、${getDemoPerson(6)}`);
  // 数据来源默认仅选中"日程 / 会议"，其余由用户按需勾选
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(['calendar']);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [projectPickerSelection, setProjectPickerSelection] = useState<string[]>([]);
  const [projectKeyword, setProjectKeyword] = useState('');
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [reportPickerSelection, setReportPickerSelection] = useState<string[]>([]);
  const [reportKeyword, setReportKeyword] = useState('');
  const [showReportPicker, setShowReportPicker] = useState(false);
  const [projectDrafts, setProjectDrafts] = useState<Record<string, ReportDraft>>({});
  const [activeProjectId, setActiveProjectId] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  // 项目周报扩展：周报类型 / 周报数据 / 进展描述 / 分发配置 / 回执
  const [reportKind, setReportKind] = useState<AdvisorReportKind>(params.get('mode') === 'project-report' ? 'project' : 'personal');
  // 项目汇报模式下，"项目管理平台"数据来源保持必选
  useEffect(() => {
    if (mode === 'report' && reportKind === 'project' && !selectedSourceIds.includes('projects')) {
      setSelectedSourceIds(current => [...current, 'projects']);
    }
  }, [mode, reportKind]); // eslint-disable-line react-hooks/exhaustive-deps
  const [weeklyData, setWeeklyData] = useState<ProjectWeeklyData | null>(null);
  const [overallDescription, setOverallDescription] = useState('');
  const [dispatch, setDispatch] = useState<DispatchConfig>({ sender: MAIN_USER_EMAIL, recipients: [], cc: [], wecom: [] });
  const [receipts, setReceipts] = useState<SendReceipt[]>([]);
  // 需求编辑模式：草稿态右侧默认只读，点"调整需求"后才能编辑
  const [requirementEditing, setRequirementEditing] = useState(false);

  const selectedProjects = useMemo(
    () => projectOptions.filter(project => selectedProjectIds.includes(project.id)),
    [selectedProjectIds],
  );
  const filteredProjects = useMemo(() => {
    const keyword = projectKeyword.trim().toLowerCase();
    if (!keyword) return projectOptions;
    return projectOptions.filter(project => [project.name, project.code, project.teamName, project.owner]
      .some(value => value.toLowerCase().includes(keyword)));
  }, [projectKeyword]);
  const selectedReports = useMemo(
    () => historicalReportOptions.filter(report => selectedReportIds.includes(report.id)),
    [selectedReportIds],
  );
  const filteredReports = useMemo(() => {
    const keyword = reportKeyword.trim().toLowerCase();
    if (!keyword) return historicalReportOptions;
    return historicalReportOptions.filter(report => [report.title, report.author, report.period]
      .some(value => value.toLowerCase().includes(keyword)));
  }, [reportKeyword]);
  const allFilteredReportsSelected = filteredReports.length > 0
    && filteredReports.every(report => reportPickerSelection.includes(report.id));
  const activeDraft = activeProjectId && projectDrafts[activeProjectId]
    ? projectDrafts[activeProjectId]
    : draft;

  const stages = mode === 'report' ? reportGenerationStages : insightGenerationStages;
  const filteredHistory = historyRecords.filter(record => {
    const keyword = historySearch.trim().toLowerCase();
    return record.mode === 'report' && (!keyword || record.title.toLowerCase().includes(keyword));
  });

  const sourceLabel = sourceLabels[source] || sourceLabels['ruyi-zone'];
  const requirementsSummary = mode === 'report'
    ? `根据${sourceLabel}带入的上下文，读取现有工作数据并生成一份可编辑的汇报草稿。`
    : `按${period}分析工作进展、风险、待办积压与汇报提交情况。`;

  useEffect(() => {
    if (stage !== 'generating') return;
    if (generationStep >= stages.length) {
      const timer = window.setTimeout(() => {
        if (reportKind === 'project' && selectedProjects.length > 0) {
          // 项目周报：为首个选中项目构造周报数据（多项目时按 activeProjectId 切换）
          const target = selectedProjects.find(project => project.id === activeProjectId) || selectedProjects[0];
          const data = buildProjectWeeklyData({
            projectId: target.id,
            projectName: target.name,
            teamName: target.teamName,
            progress: target.progress,
            riskLevel: target.riskLevel,
            latestReport: target.latestReport,
            period,
          });
          setWeeklyData(data);
          setOverallDescription(data.overallDescription);
          // 分发配置默认值（BR-07-01/02）：发件人=当前用户邮箱，收件人=项目干系人
          const light = data.healthLight;
          setDispatch({
            sender: MAIN_USER_EMAIL,
            recipients: ['wangchengbin@juneyaoair.com', 'pmo@juneyaoair.com'],
            cc: [],
            wecom: light === 'green' ? [] : [`${target.teamName}项目群`, '宋婧', '蒋涵'],
          });
          setProjectDrafts(Object.fromEntries(selectedProjects.map(project => [project.id, createProjectDraft(project)])));
          setActiveProjectId(target.id);
        } else {
          if (selectedSourceIds.includes('projects') && selectedProjects.length > 0) {
            const nextProjectDrafts = Object.fromEntries(
              selectedProjects.map(project => [project.id, createProjectDraft(project)]),
            );
            setProjectDrafts(nextProjectDrafts);
            setActiveProjectId(selectedProjects[0].id);
          } else {
            setProjectDrafts({});
            setActiveProjectId('');
          }
        }
        setStage('draft');
        setRequirementEditing(false);
      }, 350);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setGenerationStep(current => current + 1), 620);
    return () => window.clearTimeout(timer);
  }, [generationStep, selectedProjects, selectedSourceIds, stage, stages.length, reportKind, activeProjectId, period]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const startRequirementConfirmation = () => {
    const nextPrompt = prompt.trim();
    if (!nextPrompt) {
      showToast(mode === 'report' ? '请先描述需要生成的汇报' : '请先描述需要分析的问题');
      return;
    }
    // 一键直达生成，跳过确认态
    startGeneration();
  };

  const startGeneration = () => {
    if (selectedSourceIds.length === 0) {
      showToast('请至少选择一个数据源');
      return;
    }
    // 勾选了"项目管理平台"就必须选择至少 1 个项目（无论个人/项目汇报）
    if (selectedSourceIds.includes('projects') && selectedProjectIds.length === 0) {
      showToast('必填：已勾选"项目管理平台"，请选择至少 1 个项目');
      return;
    }
    if (selectedSourceIds.includes('reports') && selectedReportIds.length === 0) {
      showToast('请先选择需要引用的历史工作汇报');
      return;
    }
    if (/模拟失败|生成失败/.test(prompt)) {
      setStage('failed');
      return;
    }
    setGenerationStep(0);
    setProjectDrafts({});
    setActiveProjectId('');
    setWeeklyData(null);
    setReceipts([]);
    setStage('generating');
  };

  const resetWorkspace = (nextMode = mode) => {
    setMode(nextMode);
    setStage('empty');
    setPrompt('');
    setComposerValue('');
    setGenerationStep(0);
    setDraft(defaultDraft);
    setReportType('项目汇报');
    setSelectedProjectIds([]);
    setProjectPickerSelection([]);
    setProjectKeyword('');
    setShowProjectPicker(false);
    setSelectedReportIds([]);
    setReportPickerSelection([]);
    setReportKeyword('');
    setShowReportPicker(false);
    setProjectDrafts({});
    setActiveProjectId('');
    setAttachments([]);
    setUploadError('');
    setShowSubmitConfirm(false);
    setShowRegenerateConfirm(false);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const allowedExtensions = ['txt', 'md', 'markdown', 'pdf', 'xls', 'xlsx', 'doc', 'docx'];
    const selected = Array.from(files);
    const invalidFile = selected.find(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      return !allowedExtensions.includes(extension) || file.size > 50 * 1024 * 1024;
    });
    if (invalidFile) {
      setUploadError('仅支持 TXT、MD、PDF、Excel、Word，且单文件不超过 50MB');
      return;
    }
    const next = [...new Set([...attachments, ...selected.map(file => file.name)])];
    if (next.length > 10) {
      setUploadError('参考附件最多上传 10 个');
      return;
    }
    setAttachments(next);
    setUploadError('');
  };

  const updateDraft = (field: keyof ReportDraft, value: string) => {
    if (activeProjectId) {
      setProjectDrafts(current => ({
        ...current,
        [activeProjectId]: { ...(current[activeProjectId] || draft), [field]: value },
      }));
      return;
    }
    setDraft(current => ({ ...current, [field]: value }));
  };

  const updateActiveDraft = (updater: (current: ReportDraft) => ReportDraft) => {
    if (activeProjectId) {
      setProjectDrafts(current => ({
        ...current,
        [activeProjectId]: updater(current[activeProjectId] || draft),
      }));
      return;
    }
    setDraft(updater);
  };

  const applyConversationAdjustment = () => {
    const message = composerValue.trim();
    if (!message) return;
    if (/润色|正式|专业/.test(message)) {
      updateActiveDraft(current => ({
        ...current,
        summary: `${current.summary.replace(/。$/, '')}，各项工作均已形成明确责任分工与后续跟踪安排。`,
      }));
      showToast('已润色汇报摘要');
    } else if (/风险|问题/.test(message)) {
      updateActiveDraft(current => ({ ...current, risks: `${current.risks}\n需持续关注关键任务延期和跨部门依赖，建议按日更新风险状态。` }));
      showToast('已补充风险与协调建议');
    } else if (/计划|下周/.test(message)) {
      updateActiveDraft(current => ({ ...current, nextPlan: `${current.nextPlan}\n4. 对本周期未完成事项建立责任人与截止时间清单。` }));
      showToast('已补充后续计划');
    } else {
      showToast('如意参谋师已按补充要求调整内容');
    }
    setComposerValue('');
  };

  const polishDraft = () => {
    updateActiveDraft(current => ({
      ...current,
      summary: `${current.summary.replace(/。$/, '')}，各项工作均已形成明确责任分工与后续跟踪安排。`,
    }));
    showToast('已润色汇报摘要');
  };

  const convertInsightToReport = () => {
    setMode('report');
    setPrompt('请根据当前工作洞察生成一份管理汇报');
    setStage('confirming');
    setGenerationStep(0);
    const next = new URLSearchParams(location.search);
    next.set('mode', 'report');
    next.set('initialPrompt', '请根据当前工作洞察生成一份管理汇报');
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigate(returnTo || '/web_client/ruyi-zone');
  };

  const handleWriteBack = () => {
    if (!returnTo) return;
    navigate(returnTo, {
      state: {
        advisorResult: {
          mode,
          source,
          contextId,
          reportType,
          period,
          reportTo,
          copyTo,
          selectedSourceIds,
          selectedProjectIds,
          selectedReportIds,
          attachments,
          draft: activeDraft,
          projectDrafts,
        },
      },
    });
  };

  const toggleSource = (sourceId: string) => {
    setSelectedSourceIds(current => current.includes(sourceId)
      ? current.filter(id => id !== sourceId)
      : [...current, sourceId]);
  };

  const openProjectPicker = () => {
    setProjectPickerSelection(selectedProjectIds);
    setProjectKeyword('');
    setShowProjectPicker(true);
  };

  const toggleProjectSelection = (projectId: string) => {
    setProjectPickerSelection(current => current.includes(projectId)
      ? current.filter(id => id !== projectId)
      : [...current, projectId]);
  };

  const confirmProjectSelection = () => {
    setSelectedProjectIds(projectPickerSelection);
    setShowProjectPicker(false);
    showToast(`已选择 ${projectPickerSelection.length} 个项目`);
  };

  const openReportPicker = () => {
    setReportPickerSelection(selectedReportIds);
    setReportKeyword('');
    setShowReportPicker(true);
  };

  const toggleReportSelection = (reportId: string) => {
    setReportPickerSelection(current => current.includes(reportId)
      ? current.filter(id => id !== reportId)
      : [...current, reportId]);
  };

  const toggleAllReports = () => {
    const visibleIds = filteredReports.map(report => report.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => reportPickerSelection.includes(id));
    setReportPickerSelection(current => allVisibleSelected
      ? current.filter(id => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])]);
  };

  const confirmReportSelection = () => {
    setSelectedReportIds(reportPickerSelection);
    setShowReportPicker(false);
    showToast(`已选择 ${reportPickerSelection.length} 份历史汇报`);
  };

  const renderEmptyState = () => (
    <div className="relative h-full">
      {/* 周报骨架预览：让"产物"先行，状态说明直接铺在页面上 */}
      <div className="h-full overflow-y-auto px-5 py-6 md:px-8">
        <div className="pointer-events-none max-w-4xl">
          <ProjectWeeklyReport data={null} filled={false} litIndex={-1} description="" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center px-6">
        <div className="rounded-xl border border-theme-100 bg-white/95 px-6 py-4 text-center shadow-lg backdrop-blur">
          <p className="text-sm font-bold text-gray-900">{reportKind === 'project' ? '项目周报工作台' : '参谋师工作台'}</p>
          <p className="mt-1 text-xs leading-5 text-gray-500">在右侧面板完成{reportKind === 'project' ? '汇报类型、数据来源与项目选择' : '汇报要求与数据来源配置'}，预览将在此处生成展示</p>
        </div>
      </div>
    </div>
  );


  const renderConfirming = () => (
    <div className="relative h-full">
      {/* 需求确认态：主区展示实时周报预览（带待生成水印），底部提示条 */}
      <div className="h-full overflow-y-auto px-5 py-6 md:px-8">
        <div className="relative max-w-4xl">
          <ProjectWeeklyReport data={null} filled={false} litIndex={0} description="" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rotate-[-6deg] rounded-lg border-2 border-dashed border-theme-200 bg-white/70 px-8 py-3 text-lg font-bold tracking-widest text-theme-300">待 确 认 生 成</span>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 border-t border-theme-100 bg-white/95 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs leading-5 text-gray-500">需求已带入：{prompt.slice(0, 40)}{prompt.length > 40 ? '…' : ''} · {period} · 数据来源 {selectedSourceIds.length} 类</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStage('empty')} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">继续修改</button>
            <button type="button" onClick={startGeneration} className="inline-flex items-center gap-1.5 rounded-lg bg-theme-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-theme-700"><Sparkles size={13} />确认并生成</button>
          </div>
        </div>
      </div>
    </div>
  );


  const getGenerationStatus = (index: number): GenerationStatus => {
    if (index < generationStep) return 'completed';
    if (index === generationStep) return 'processing';
    return 'pending';
  };

  const renderGenerating = () => (
    <div className="relative h-full">
      {/* 生成中：周报骨架逐区块点亮 + 右上角步骤进度 */}
      <div className="h-full overflow-y-auto px-5 py-6 md:px-8">
        <div className="pointer-events-none max-w-4xl">
          <ProjectWeeklyReport data={null} filled={false} litIndex={Math.min(generationStep + 2, sectionCount)} description="" />
        </div>
      </div>
      <div className="absolute right-6 top-6 w-72 rounded-xl border border-gray-100 bg-white/95 p-4 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-theme-50 text-theme-700"><Loader2 size={16} className="animate-spin" /></span>
          <div><p className="text-xs font-bold text-gray-900">如意参谋师正在处理</p><p className="text-[11px] text-gray-400">完成后可继续调整</p></div>
        </div>
        <div className="mt-3 space-y-2">
          {stages.map((item, index) => {
            const status = getGenerationStatus(index);
            return (
              <div key={item.title} className="flex items-start gap-2.5">
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] ${status === 'completed' ? 'bg-emerald-50 text-emerald-600' : status === 'processing' ? 'bg-theme-50 text-theme-700' : 'bg-gray-100 text-gray-400'}`}>
                  {status === 'completed' ? <Check size={10} /> : <span className="h-1 w-1 rounded-full bg-current" />}
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold leading-4 ${status === 'pending' ? 'text-gray-400' : 'text-gray-800'}`}>{item.title}</p>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-400">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /** 项目周报草稿：完整周报预览 + 发送流程（FR-05/06/07/08/09） */
  const renderProjectReportDraft = () => {
    if (!weeklyData) return renderReportDraft();
    const light = getHealthLightMeta(weeklyData.healthLight);
    const descEmpty = overallDescription.trim().length === 0;
    const descOver = overallDescription.length > 1000;
    // 发送移至右侧工作台 footer；必填校验逻辑保留供按钮禁用判断
    const canSend = !descEmpty && !descOver && !requirementEditing;

    // 发送回执态（FR-09）
    if (stage === 'submitted') {
      const failedReceipts = receipts.filter(receipt => !receipt.success);
      return (
        <div className="h-full overflow-y-auto px-5 py-6 md:px-8">
          <div className="mx-auto max-w-3xl space-y-4">
            <section className="rounded-xl border border-gray-200 bg-white px-6 py-6 text-center shadow-sm">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${failedReceipts.length === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {failedReceipts.length === 0 ? <CheckCircle2 size={28} /> : <AlertTriangle size={26} />}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-950">{failedReceipts.length === 0 ? '周报发送成功' : '部分渠道发送失败'}</h2>
              <p className="mt-2 text-sm text-gray-500">{weeklyData.projectName} · {period} · {light.label}</p>
            </section>
            <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-3 text-sm font-bold text-gray-900">发送回执</div>
              <div className="divide-y divide-gray-50">
                {receipts.map((receipt, index) => (
                  <div key={index} className="flex items-center gap-3 px-5 py-3">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${receipt.success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {receipt.success ? <Check size={14} /> : <X size={14} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">{receipt.channel} · {receipt.target}</p>
                      <p className="text-xs text-gray-400">{receipt.time}{receipt.success ? '' : ' · 发送失败，可重试'}</p>
                    </div>
                    {!receipt.success && (
                      <button type="button" onClick={() => {
                        setReceipts(current => current.map((item, i) => i === index ? { ...item, success: true, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) } : item));
                        showToast('已重新发送给失败收件人');
                      }} className="shrink-0 rounded-lg border border-theme-200 bg-theme-50 px-3 py-1.5 text-xs font-semibold text-theme-700 hover:bg-theme-100">重试</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => resetWorkspace('report')} className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">新建周报</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 md:px-8">
          <div className="mx-auto max-w-4xl pb-6">
            {/* 多项目切换 */}
            {selectedProjects.length > 1 && (
              <section className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">项目周报</p>
                    <p className="mt-0.5 text-xs text-gray-400">已生成 {selectedProjects.length} 份，选择项目查看对应周报</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold text-theme-700">{selectedProjects.findIndex(project => project.id === activeProjectId) + 1}/{selectedProjects.length}</span>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hover">
                  {selectedProjects.map(project => (
                    <button key={project.id} type="button" onClick={() => setActiveProjectId(project.id)}
                      className={`shrink-0 rounded-md border px-3 py-2 text-left text-xs font-semibold transition-colors ${activeProjectId === project.id ? 'border-theme-300 bg-theme-50 text-theme-700' : 'border-gray-200 bg-white text-gray-600 hover:border-theme-200'}`}>
                      {project.name}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 完整周报预览：仅"整体项目进展"可编辑（FR-05） */}
            <ProjectWeeklyReport
              data={weeklyData}
              filled
              description={overallDescription}
              onDescriptionChange={setOverallDescription}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderReportDraft = () => (
    <div className="mx-auto w-full max-w-5xl px-5 py-6">
      {selectedProjects.length > 0 && (
        <section className="mb-4 border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900">项目周报</p>
              <p className="mt-1 text-xs text-gray-400">已生成 {selectedProjects.length} 份，选择项目查看和编辑对应周报</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-theme-700">
              {Math.max(selectedProjects.findIndex(project => project.id === activeProjectId) + 1, 1)}/{selectedProjects.length}
            </span>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hover">
            {selectedProjects.map(project => (
              <button
                key={project.id}
                type="button"
                onClick={() => setActiveProjectId(project.id)}
                className={`shrink-0 rounded-md border px-3 py-2 text-left text-xs font-semibold transition-colors ${activeProjectId === project.id ? 'border-theme-300 bg-theme-50 text-theme-700' : 'border-gray-200 bg-white text-gray-600 hover:border-theme-200'}`}
              >
                {project.name}
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">草稿已生成</span><span className="text-xs text-gray-400">{period}</span></div>
          <h2 className="mt-2 text-xl font-bold text-gray-950">汇报草稿</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={polishDraft} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 hover:border-theme-200 hover:text-theme-700"><Sparkles size={15} />润色</button>
        </div>
      </div>
      <section className="border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <label className="text-xs font-semibold text-gray-500">标题</label>
          <input value={activeDraft.title} onChange={event => updateDraft('title', event.target.value)} className="mt-2 w-full border-none p-0 text-2xl font-bold text-gray-950 outline-none" />
        </div>
        <div className="space-y-6 px-6 py-5">
          {([
            ['summary', '整体摘要', 96],
            ['completed', '本期进展', 150],
            ['risks', '风险与问题', 100],
            ['nextPlan', '下期计划', 140],
            ['support', '需协调事项', 90],
          ] as const).map(([field, label, height]) => (
            <label key={field} className="block">
              <span className="text-sm font-bold text-gray-900">{label}</span>
              <textarea value={activeDraft[field]} onChange={event => updateDraft(field, event.target.value)} style={{ minHeight: height }} className="mt-2 w-full resize-y rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-7 text-gray-700 outline-none focus:border-theme-300 focus:bg-white focus:ring-2 focus:ring-theme-100" />
            </label>
          ))}
        </div>
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="mb-2 text-xs font-semibold text-gray-500">引用数据</p>
          <div className="flex flex-wrap gap-2">
            {sourceCatalog.filter(item => selectedSourceIds.includes(item.id)).slice(0, 6).map(item => (
              <Link key={item.id} to={item.href || '#'} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-theme-50 hover:text-theme-700"><item.icon size={13} />{item.name}</Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );

  const renderInsightResult = () => (
    <div className="mx-auto w-full max-w-5xl px-5 py-6">
      <div className="mb-5">
        <div className="flex items-center gap-2"><span className="rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">洞察已生成</span><span className="text-xs text-gray-400">{period} · {reportType}</span></div>
        <h2 className="mt-2 text-xl font-bold text-gray-950">工作进展与风险洞察</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[['进行中任务', '12', '3项本周到期'], ['平均进度', '68%', '较上周 +9%'], ['风险事项', '3', '1项需要协调'], ['未提交汇报', '2', '已识别责任人']].map(([label, value, detail], index) => (
          <div key={label} className="border border-gray-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold text-gray-500">{label}</p><p className={`mt-2 text-2xl font-bold ${index === 2 || index === 3 ? 'text-amber-700' : 'text-gray-950'}`}>{value}</p><p className="mt-1 text-xs text-gray-400">{detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4"><h3 className="font-bold text-gray-950">重点结论</h3></div>
          <div className="space-y-5 px-5 py-5 text-sm leading-7 text-gray-700">
            <div><p className="font-bold text-gray-900">进展概览</p><p className="mt-1">工作门户与如意空间相关事项推进稳定，核心功能已进入联调；任务完成度较上周提升，主要增量来自页面交互调整和工作台统一。</p></div>
            <div><p className="font-bold text-gray-900">风险识别</p><p className="mt-1">项目管理周报模板字段尚待确认；两项跨系统任务依赖接口口径，若本周未确认可能影响后续真实数据联调。</p></div>
            <div><p className="font-bold text-gray-900">KR 进展</p><p className="mt-1">“建立目标到成果表达闭环”相关 KR 当前进度约 72%，汇报、事项和任务已具备统一归集基础。</p></div>
          </div>
        </section>
        <section className="border border-theme-100 bg-theme-50/40 px-5 py-5">
          <div className="flex items-center gap-2 text-sm font-bold text-theme-800"><Lightbulb size={17} />参谋建议</div>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
            <li>1. 本周内确认项目管理周报模板字段和取数规则。</li>
            <li>2. 对跨系统数据任务设置责任人和明确截止时间。</li>
            <li>3. 提醒未提交汇报人员补充进展，避免团队分析失真。</li>
          </ol>
          <button onClick={convertInsightToReport} className="mt-5 w-full rounded-lg bg-theme-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-theme-700">基于洞察生成汇报</button>
        </section>
      </div>
      <section className="mt-4 border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-center justify-between"><p className="text-sm font-bold text-gray-900">数据依据</p><span className="text-xs text-gray-400">共读取 {selectedSourceIds.length} 类数据</span></div>
        <div className="mt-3 flex flex-wrap gap-2">{sourceCatalog.filter(item => selectedSourceIds.includes(item.id)).map(item => <Link key={item.id} to={item.href || '#'} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs text-gray-600 hover:bg-theme-50 hover:text-theme-700"><item.icon size={13} />{item.name}</Link>)}</div>
      </section>
    </div>
  );

  /** 分发配置面板（FR-07）：摘要区 + 邮件分区 + 条件企微分区（附录A） */
  const renderDispatching = () => {
    if (!weeklyData) return renderReportDraft();
    const light = getHealthLightMeta(weeklyData.healthLight);
    const showWecom = weeklyData.healthLight !== 'green';
    const senderValid = emailValid(dispatch.sender);
    const recipientsValid = dispatch.recipients.length > 0 && dispatch.recipients.every(emailValid);
    const ccValid = dispatch.cc.every(emailValid);
    const canConfirm = senderValid && recipientsValid && ccValid && (!showWecom || dispatch.wecom.length > 0);

    const updateRecipient = (kind: 'recipients' | 'cc', raw: string, commit: boolean) => {
      const parts = raw.split(/[,，;；\s]+/).map(item => item.trim()).filter(Boolean);
      if (commit) setDispatch(current => ({ ...current, [kind]: parts }));
      return parts;
    };

    const executeSend = () => {
      setStage('sending');
      const time = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const next: SendReceipt[] = dispatch.recipients.map(target => ({ channel: '邮件', target, time, success: true }));
      if (showWecom) dispatch.wecom.forEach(target => next.push({ channel: '企业微信', target, time, success: true }));
      // 模拟部分失败场景：抄送含"fail"字样时该收件人失败
      dispatch.cc.filter(target => /fail/i.test(target)).forEach(target => next.push({ channel: '邮件', target, time, success: false }));
      window.setTimeout(() => {
        setReceipts(next);
        setStage('submitted');
      }, 900);
    };

    return (
      <div className="relative h-full">
        {/* 背景保留周报预览（只读） */}
        <div className="h-full overflow-y-auto px-5 py-6 opacity-60 md:px-8">
          <div className="mx-auto max-w-4xl">
            <ProjectWeeklyReport data={weeklyData} filled description={overallDescription} readOnly />
          </div>
        </div>

        {/* 分发配置模态面板 */}
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-gray-950/35 p-4">
          <div className="flex max-h-[min(680px,calc(100%-32px))] w-full max-w-xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="shrink-0 border-b border-gray-100 px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-950">发送{weeklyData.projectName}周报</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span>{period}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${light.bg} ${light.text}`}><span className={`h-1.5 w-1.5 rounded-full ${light.dot}`} />{light.label}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setStage('draft')} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="返回编辑"><X size={18} /></button>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {/* 邮件分区 */}
              <section>
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900"><Mail size={15} className="text-theme-600" />邮件 <span className="text-xs font-normal text-gray-400">邮件正文为周报长图 + HTML 详情链接</span></p>
                <div className="block text-xs font-semibold text-gray-500">
                  <p>发件人 <span className="text-red-500">*</span> <span className="ml-1 font-normal text-gray-400">当前登录用户企业邮箱，不可修改</span></p>
                  <div className={`mt-1.5 flex h-9 w-full items-center gap-2 rounded-lg border bg-gray-50 px-3 text-sm font-normal text-gray-600 ${senderValid ? 'border-gray-200' : 'border-red-300'}`} title="发件人默认为当前登录用户企业邮箱">
                    <Mail size={13} className="shrink-0 text-gray-400" />
                    <span className="truncate">{dispatch.sender}</span>
                  </div>
                  {!senderValid && <span className="mt-1 block text-xs font-normal text-red-500">邮箱格式非法，无法提交</span>}
                </div>
                <label className="mt-4 block text-xs font-semibold text-gray-500">
                  收件人 <span className="text-red-500">*</span>
                  <span className="ml-1 font-normal text-gray-400">至少 1 人，支持批量粘贴（逗号/分号/空格分隔）</span>
                  <textarea
                    defaultValue={dispatch.recipients.join('; ')}
                    onBlur={event => updateRecipient('recipients', event.target.value, true)}
                    onChange={event => updateRecipient('recipients', event.target.value, true)}
                    rows={2}
                    className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm font-normal outline-none focus:border-theme-300 ${recipientsValid ? 'border-gray-200' : 'border-red-300 bg-red-50/40'}`}
                  />
                  {!recipientsValid && <span className="mt-1 block text-xs font-normal text-red-500">{dispatch.recipients.length === 0 ? '收件人不能为空' : '存在邮箱格式非法的收件人'}</span>}
                </label>
                <label className="mt-4 block text-xs font-semibold text-gray-500">
                  抄送人 <span className="font-normal text-gray-400">（可选）</span>
                  <textarea
                    defaultValue={dispatch.cc.join('; ')}
                    onBlur={event => updateRecipient('cc', event.target.value, true)}
                    onChange={event => updateRecipient('cc', event.target.value, true)}
                    rows={2}
                    placeholder="选填，支持批量粘贴"
                    className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm font-normal outline-none focus:border-theme-300 ${ccValid ? 'border-gray-200' : 'border-red-300 bg-red-50/40'}`}
                  />
                  {!ccValid && <span className="mt-1 block text-xs font-normal text-red-500">存在邮箱格式非法的抄送人</span>}
                </label>
              </section>

              {/* 企业微信分区：仅黄/红灯（附录A） */}
              {showWecom && (
                <section className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-gray-900"><MessageSquareText size={15} className="text-amber-600" />企业微信 <span className="text-xs font-normal text-amber-700">项目{light.label.replace(/（.*）/, '')}，需通过企微渠道提醒干系人</span></p>
                  <label className="mt-3 block text-xs font-semibold text-gray-500">
                    企微接收人（成员 / 群） <span className="text-red-500">*</span>
                    <textarea
                      defaultValue={dispatch.wecom.join('; ')}
                      onBlur={event => setDispatch(current => ({ ...current, wecom: event.target.value.split(/[,，;；\s]+/).map(item => item.trim()).filter(Boolean) }))}
                      rows={2}
                      className={`mt-1.5 w-full rounded-lg border px-3 py-2 text-sm font-normal outline-none focus:border-amber-300 ${dispatch.wecom.length > 0 ? 'border-gray-200' : 'border-red-300 bg-red-50/40'}`}
                    />
                    {dispatch.wecom.length === 0 && <span className="mt-1 block text-xs font-normal text-red-500">黄/红灯项目必须填写企微接收人</span>}
                  </label>
                </section>
              )}
              {!showWecom && (
                <p className="rounded-lg bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-400">当前项目为绿灯（正常），仅通过邮件渠道分发，不展示企业微信分区。</p>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
              <p className="text-xs leading-5 text-gray-500">{showWecom ? `邮件 ${dispatch.recipients.length} 人 + 企微 ${dispatch.wecom.length} 人/群` : `邮件 ${dispatch.recipients.length} 人`}</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStage('draft')} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">取消</button>
                <button
                  type="button"
                  disabled={!canConfirm}
                  onClick={executeSend}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${canConfirm ? 'bg-theme-600 text-white hover:bg-theme-700' : 'cursor-not-allowed bg-gray-200 text-gray-400'}`}
                >
                  确认发送
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /** 发送中过渡态 */
  const renderSending = () => (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-theme-600" />
        <p className="text-sm font-semibold text-gray-700">正在生成周报长图并发送…</p>
        <p className="text-xs text-gray-400">邮件正文为周报长图 + HTML 详情链接</p>
      </div>
    </div>
  );

  const renderSubmitted = () => (
    <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 size={32} /></div>
      <h2 className="mt-5 text-2xl font-bold text-gray-950">汇报已提交</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">已提交给 {reportTo}{copyTo ? `，并抄送 ${copyTo}` : ''}。可在工作汇报页面查看状态、评论和已读情况。</p>
      <div className="mt-6 flex gap-3"><button onClick={() => navigate('/web_client/work-report')} className="rounded-lg bg-theme-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-theme-700">查看工作汇报</button><button onClick={() => resetWorkspace('report')} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">新建汇报</button></div>
    </div>
  );

  const renderFailed = () => (
    <div className="mx-auto flex min-h-full max-w-xl flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600"><AlertTriangle size={30} /></div>
      <h2 className="mt-5 text-xl font-bold text-gray-950">本次生成未完成</h2>
      <p className="mt-2 text-sm leading-6 text-gray-500">需求、时间范围和已选数据源均已保留，可以直接重试或返回调整条件。</p>
      <div className="mt-6 flex gap-3"><button onClick={() => setStage('confirming')} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">调整条件</button><button onClick={() => { setPrompt(current => current.replace(/模拟失败|生成失败/g, '重新生成')); setGenerationStep(0); setStage('generating'); }} className="inline-flex items-center gap-2 rounded-lg bg-theme-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-theme-700"><RefreshCw size={15} />重新生成</button></div>
    </div>
  );

  const renderMain = () => {
    if (stage === 'empty') return renderEmptyState();
    if (stage === 'confirming') return renderConfirming();
    if (stage === 'generating') return renderGenerating();
    if (stage === 'dispatching') return renderDispatching();
    if (stage === 'sending') return renderSending();
    if (stage === 'submitted') {
      // 项目周报的 submitted 用带回执的专属渲染
      if (reportKind === 'project' && receipts.length > 0) return renderProjectReportDraft();
      return renderSubmitted();
    }
    if (stage === 'failed') return renderFailed();
    if (reportKind === 'project' && mode === 'report') return renderProjectReportDraft();
    return mode === 'report' ? renderReportDraft() : renderInsightResult();
  };

  const renderCurrentSidebar = () => {
    if (stage === 'empty' || stage === 'confirming') {
      return (
        <div className="space-y-4 px-4 py-4">
          <section>
            <div className="flex items-center justify-between"><p className="text-sm font-bold text-gray-900">{mode === 'report' ? '汇报要求' : '洞察条件'}</p><span className="rounded bg-theme-50 px-2 py-1 text-[11px] font-semibold text-theme-700">可编辑</span></div>
            <label className="mt-4 block text-xs font-semibold text-gray-500">需求描述
              <textarea value={prompt} onChange={event => setPrompt(event.target.value)} rows={6} placeholder={mode === 'report' ? '描述汇报对象、关注重点和输出要求' : '描述需要分析的范围、问题和关注重点'} className="mt-2 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal leading-6 text-gray-700 outline-none focus:border-theme-300 focus:ring-2 focus:ring-theme-100" />
            </label>
          </section>
          <section className="space-y-2.5 border-t border-gray-100 pt-4">
            {mode === 'report' && (
              <label className="grid grid-cols-[68px_minmax(0,1fr)] items-center gap-2.5 text-xs font-semibold text-gray-500">
                <span>汇报类型</span>
                <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-normal">
                  {([['personal', '个人汇报'], ['project', '项目汇报']] as const).map(([kind, label]) => (
                    <button key={kind} type="button" onClick={() => {
                      setReportKind(kind);
                      if (kind === 'project') {
                        // 项目汇报：项目数据源必选，自动补勾
                        setSelectedSourceIds(current => current.includes('projects') ? current : [...current, 'projects']);
                      }
                    }}
                      className={`rounded-md px-2 py-1.5 font-semibold transition-colors ${reportKind === kind ? 'bg-theme-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </label>
            )}
            <label className="grid grid-cols-[68px_minmax(0,1fr)] items-center gap-2.5 text-xs font-semibold text-gray-500">
              <span>时间范围</span>
              <input value={period} onChange={event => setPeriod(event.target.value)} className="h-8 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs font-normal text-gray-700 outline-none focus:border-theme-300 focus:bg-white" />
            </label>
          </section>
          {(source !== 'ruyi-zone' || contextItem) && <section className="border border-theme-100 bg-theme-50/40 p-3"><p className="text-xs font-semibold text-theme-700">入口上下文</p><p className="mt-2 text-sm font-bold text-gray-900">{contextItem?.title || sourceLabel}</p><p className="mt-1 text-xs leading-5 text-gray-500">来自{sourceLabel}，生成内容将保留返回原页面的入口。</p></section>}
          <section className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between"><p className="text-xs font-semibold text-gray-500">数据来源</p><span className="text-[11px] text-gray-400">{selectedSourceIds.length}/{sourceCatalog.length}</span></div>
            <div className="mt-2 space-y-1.5">
              {sourceCatalog.map(item => {
                const selected = selectedSourceIds.includes(item.id);
                // 项目汇报时"项目管理平台"必选且不可取消勾选
                const locked = mode === 'report' && reportKind === 'project' && item.id === 'projects';
                return (
                  <div key={item.id} className={`overflow-hidden rounded-lg border ${selected ? 'border-theme-100 bg-theme-50/50' : 'border-gray-100 bg-white'}`}>
                    <button
                      onClick={() => {
                        if (locked) {
                          showToast('项目汇报必须包含"项目管理平台"数据来源');
                          return;
                        }
                        toggleSource(item.id);
                      }}
                      className={`flex w-full items-center gap-2 px-2.5 py-2 text-left ${selected ? '' : 'opacity-55'} ${locked ? 'cursor-not-allowed' : ''}`}
                      title={locked ? '项目汇报必选，不可取消' : undefined}
                    >
                      <item.icon size={15} className={selected ? 'text-theme-700' : 'text-gray-400'} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-gray-700">
                          {item.name}
                          {locked && <span className="ml-1 text-red-500">*</span>}
                        </span>
                        <span className="block truncate text-[11px] text-gray-400">{locked ? '项目汇报必选，不可取消' : item.detail}</span>
                      </span>
                      {selected && <Check size={13} className="text-theme-700" />}
                    </button>
                    {selected && item.id === 'reports' && (
                      <div className="border-t border-theme-100/70 px-2.5 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0"><p className="text-[11px] font-semibold text-gray-700">已选汇报</p><p className="mt-0.5 text-[10px] text-gray-400">{selectedReportIds.length > 0 ? `${selectedReportIds.length} 份历史汇报` : '尚未选择汇报'}</p></div>
                          <button type="button" onClick={openReportPicker} className="shrink-0 rounded-md border border-theme-200 bg-white px-2 py-1 text-[11px] font-semibold text-theme-700 hover:bg-theme-50">选择汇报</button>
                        </div>
                        {selectedReports.length > 0 && <div className="mt-2 space-y-1">{selectedReports.map(report => <p key={report.id} className="truncate rounded bg-white px-2 py-1 text-[10px] text-gray-600">{report.title}</p>)}</div>}
                      </div>
                    )}
                    {selected && item.id === 'projects' && (
                      <div className="border-t border-theme-100/70 px-2.5 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-gray-700">已选项目 <span className="text-red-500">*</span></p>
                            <p className="mt-0.5 text-[10px] text-gray-400">{selectedProjectIds.length > 0 ? `${selectedProjectIds.length} 个项目，将读取禅道数据生成周报` : mode === 'report' && reportKind === 'project' ? '必填：项目汇报至少选择 1 个项目' : '尚未选择项目'}</p>
                          </div>
                          <button type="button" onClick={openProjectPicker} className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-semibold ${selectedProjectIds.length === 0 && mode === 'report' && reportKind === 'project' ? 'border-red-200 bg-red-50 text-red-600' : 'border-theme-200 bg-white text-theme-700 hover:bg-theme-50'}`}>选择项目</button>
                        </div>
                        {selectedProjects.length > 0 && <div className="mt-2 space-y-1">{selectedProjects.map(project => <p key={project.id} className="truncate rounded bg-white px-2 py-1 text-[10px] text-gray-600">{project.name} · {project.riskLevel}</p>)}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
          <section className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between"><span className="text-sm font-medium text-gray-700">参考文件</span><button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg border border-theme-200 bg-theme-50 px-2.5 py-1.5 text-xs font-medium text-theme-700 hover:bg-theme-100"><Paperclip size={13} />上传参考文件</button><input ref={fileInputRef} type="file" multiple accept=".txt,.md,.markdown,.pdf,.xls,.xlsx,.doc,.docx" className="hidden" onChange={event => { handleFiles(event.target.files); event.target.value = ''; }} /></div>
            {attachments.length > 0 ? <div className="space-y-2">{attachments.map(attachment => <div key={attachment} className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"><Paperclip size={14} className="shrink-0 text-theme-500" /><span className="truncate">{attachment}</span><button type="button" onClick={() => setAttachments(current => current.filter(item => item !== attachment))} className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-white hover:text-red-500" title="删除附件"><X size={12} /></button></div>)}</div> : <div className="rounded-lg bg-gray-50 px-3 py-4 text-center text-xs leading-5 text-gray-400">暂无参考文件，可上传会议材料、历史汇报或项目说明作为生成参考。</div>}
            {uploadError && <p className="mt-2 text-xs leading-5 text-red-500">{uploadError}</p>}
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-5 px-4 py-4">
        <section>
          <p className="text-xs font-semibold text-gray-500">当前状态</p>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 text-sm"><span className="font-medium text-gray-700">{mode === 'report' ? (reportKind === 'project' ? '项目汇报' : '个人汇报') : '工作洞察'}</span><span className="text-xs font-semibold text-theme-700">{{ empty: '待录入', confirming: '待确认', generating: '生成中', draft: mode === 'report' ? '草稿' : '已完成', dispatching: '配置分发', sending: '发送中', submitted: '已提交', failed: '生成失败' }[stage]}</span></div>
        </section>
        {(source !== 'ruyi-zone' || contextItem) && <section className="border border-theme-100 bg-theme-50/40 p-3"><p className="text-xs font-semibold text-theme-700">入口上下文</p><p className="mt-2 text-sm font-bold text-gray-900">{contextItem?.title || sourceLabel}</p><p className="mt-1 text-xs leading-5 text-gray-500">来自{sourceLabel}，生成内容将保留返回原页面的入口。</p></section>}
        {/* 草稿态：默认只读展示需求，点"调整需求"进入编辑（对齐公文工作台） */}
        <section>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">汇报要求</p>
            {!requirementEditing ? (
              <button type="button" onClick={() => setRequirementEditing(true)} className="inline-flex items-center gap-1 rounded-md border border-theme-200 bg-white px-2 py-1 text-[11px] font-semibold text-theme-700 hover:bg-theme-50"><PencilLine size={11} />调整需求</button>
            ) : (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">编辑中 · 需重新生成</span>
            )}
          </div>

          {!requirementEditing ? (
            <div className="mt-2 space-y-2">
              <div className="rounded-lg bg-gray-50 px-3 py-2.5"><p className="text-[11px] text-gray-400">需求描述</p><p className="mt-1 whitespace-pre-wrap text-xs leading-6 text-gray-700">{prompt || '—'}</p></div>
              {mode === 'report' && <div className="rounded-lg bg-gray-50 px-3 py-2.5"><p className="text-[11px] text-gray-400">汇报类型</p><p className="mt-1 text-xs font-semibold text-gray-700">{reportKind === 'project' ? '项目汇报' : '个人汇报'}</p></div>}
              <div className="rounded-lg bg-gray-50 px-3 py-2.5"><p className="text-[11px] text-gray-400">时间范围</p><p className="mt-1 text-xs font-semibold text-gray-700">{period}</p></div>
            </div>
          ) : (
            <>
              <label className="mt-2 block text-xs font-semibold text-gray-500">需求描述
                <textarea value={prompt} onChange={event => setPrompt(event.target.value)} rows={5} className="mt-1.5 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm font-normal leading-6 text-gray-700 outline-none focus:border-theme-300 focus:ring-2 focus:ring-theme-100" placeholder="调整需求后，点击下方重新生成" />
              </label>
              {mode === 'report' && (
                <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-normal">
                  {([['personal', '个人汇报'], ['project', '项目汇报']] as const).map(([kind, label]) => (
                    <button key={kind} type="button" onClick={() => {
                      setReportKind(kind);
                      if (kind === 'project') setSelectedSourceIds(current => current.includes('projects') ? current : [...current, 'projects']);
                    }} className={`rounded-md px-2 py-1.5 font-semibold transition-colors ${reportKind === kind ? 'bg-theme-600 text-white shadow-sm' : 'text-gray-500 hover:bg-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <label className="mt-3 block text-xs font-semibold text-gray-500">时间范围
                <input value={period} onChange={event => setPeriod(event.target.value)} className="mt-1.5 h-8 w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 text-xs font-normal text-gray-700 outline-none focus:border-theme-300 focus:bg-white" />
              </label>
            </>
          )}
        </section>
        <section>
          <div className="flex items-center justify-between"><p className="text-xs font-semibold text-gray-500">数据来源</p><span className="text-[11px] text-gray-400">{selectedSourceIds.length}/{sourceCatalog.length}</span></div>
          <div className="mt-2 space-y-1.5">
            {sourceCatalog.map(item => {
              const selected = selectedSourceIds.includes(item.id);
              const locked = mode === 'report' && reportKind === 'project' && item.id === 'projects';
              // 草稿态默认只读，进入需求编辑后才能改数据来源
              const disabled = !requirementEditing;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (locked) {
                      showToast('项目汇报必须包含"项目管理平台"数据来源');
                      return;
                    }
                    toggleSource(item.id);
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-opacity ${selected ? 'border-theme-100 bg-theme-50/50' : 'border-gray-100 bg-white opacity-55'} ${disabled ? 'cursor-not-allowed' : ''}`}
                  title={locked ? '项目汇报必选，不可取消' : disabled ? '点击"调整需求"后可修改数据来源' : undefined}
                >
                  <item.icon size={15} className={selected ? 'text-theme-700' : 'text-gray-400'} />
                  <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-gray-700">{item.name}{locked && <span className="ml-1 text-red-500">*</span>}</span><span className="block truncate text-[11px] text-gray-400">{locked ? '项目汇报必选' : item.detail}</span></span>
                  {selected && <Check size={13} className="text-theme-700" />}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  };


  const renderHistorySidebar = () => (
    <div className="px-4 py-4">
      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={historySearch} onChange={event => setHistorySearch(event.target.value)} placeholder="搜索汇报或洞察记录" className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs outline-none focus:border-theme-300 focus:bg-white" /></div>
      <div className="mt-4 space-y-2">{filteredHistory.map(record => <button key={record.id} onClick={() => { setMode('report'); setReportType('项目汇报'); setStage('draft'); setSideTab('current'); showToast(`已打开${record.title}`); }} className="w-full rounded-lg border border-gray-100 bg-white px-3 py-3 text-left hover:border-theme-100 hover:bg-theme-50/40"><p className="truncate text-sm font-semibold text-gray-800">{record.title}</p><p className="mt-1 text-xs text-gray-400">{record.meta}</p><p className="mt-2 text-[11px] text-gray-400">{record.time}</p></button>)}</div>
      {filteredHistory.length === 0 && <div className="py-12 text-center text-xs text-gray-400">暂无匹配记录</div>}
    </div>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[#f6f7f9] text-gray-900">
      {toast && <div className="fixed left-1/2 top-20 z-[90] -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-xl">{toast}</div>}
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3"><button onClick={handleBack} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-theme-200 hover:bg-theme-50 hover:text-theme-700" title="返回"><ArrowLeft size={17} /></button><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-theme-600 text-white"><Bot size={19} /></div><div className="min-w-0"><h1 className="truncate text-base font-bold text-gray-950">如意参谋师</h1><p className="truncate text-xs text-gray-400">统一汇报生成与工作洞察</p></div></div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hover">{renderMain()}</div>
          {/* 底部状态条（对齐 PPT 工作台） */}
          <footer className="grid shrink-0 grid-cols-3 items-center gap-3 border-t border-gray-200 bg-white px-4 py-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              {stage === 'generating' || stage === 'sending' ? <Loader2 size={12} className="animate-spin text-theme-600" /> : <CheckCircle2 size={12} className="text-emerald-500" />}
              {stage === 'generating' ? '生成中…' : stage === 'sending' ? '发送中…' : stage === 'submitted' ? '已发送' : reportKind === 'project' && mode === 'report' && stage === 'draft' ? '草稿待确认' : '已就绪'}
            </div>
            <div className="truncate text-center text-[11px] text-gray-400">内容AI辅助生成，请谨慎识别</div>
            <div className="flex items-center justify-end gap-2 text-xs text-gray-500">
              {weeklyData && (reportKind === 'project' || stage === 'submitted') && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${getHealthLightMeta(weeklyData.healthLight).bg} ${getHealthLightMeta(weeklyData.healthLight).text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${getHealthLightMeta(weeklyData.healthLight).dot}`} />
                  {weeklyData.healthLight === 'green' ? '绿灯' : weeklyData.healthLight === 'yellow' ? '黄灯' : '红灯'}
                </span>
              )}
              <span>{period}</span>
            </div>
          </footer>
        </main>
        <aside className="flex w-full shrink-0 flex-col border-t border-gray-200 bg-white lg:h-full lg:w-[320px] lg:border-l lg:border-t-0">
          <div className="grid h-12 shrink-0 grid-cols-2 border-b border-gray-100 px-3"><button onClick={() => setSideTab('current')} className={`border-b-2 text-xs font-semibold ${sideTab === 'current' ? 'border-theme-600 text-theme-700' : 'border-transparent text-gray-500'}`}>当前参谋需求</button><button onClick={() => setSideTab('history')} className={`border-b-2 text-xs font-semibold ${sideTab === 'history' ? 'border-theme-600 text-theme-700' : 'border-transparent text-gray-500'}`}>我的记录</button></div>
          <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hover">{sideTab === 'current' ? renderCurrentSidebar() : renderHistorySidebar()}</div>
          <footer className="shrink-0 border-t border-gray-100 bg-white p-3">
            {stage === 'empty' ? (
              <button onClick={startRequirementConfirmation} disabled={!prompt.trim() || (selectedSourceIds.includes('projects') && selectedProjectIds.length === 0)} className="w-full rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-50" title={selectedSourceIds.includes('projects') && selectedProjectIds.length === 0 ? '已勾选项目管理平台，需选择至少 1 个项目' : undefined}>确认需求并生成</button>
            ) : stage === 'draft' && requirementEditing ? (
              <div className="space-y-2">
                <p className="text-center text-[11px] leading-4 text-amber-600">需求已修改，需重新生成后才能发送</p>
                <button onClick={() => { setRequirementEditing(false); setGenerationStep(0); setWeeklyData(null); setStage('generating'); }} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-theme-700"><RefreshCw size={15} />重新生成</button>
              </div>
            ) : stage === 'draft' && mode === 'report' && reportKind === 'project' ? (
              <div className="space-y-2">
                <p className="text-center text-[11px] leading-4 text-gray-400">{weeklyData && overallDescription.trim().length === 0 ? '「整体项目进展」为必填项，填写后才能发送' : weeklyData && overallDescription.length > 1000 ? '进展描述超出 1000 字上限' : '确认周报内容无误后发送'}</p>
                <button onClick={() => setStage('dispatching')} disabled={!weeklyData || overallDescription.trim().length === 0 || overallDescription.length > 1000} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-50"><Send size={15} />确认并提交</button>
              </div>
            ) : stage === 'draft' && mode === 'report' ? <div className="space-y-2">{returnTo && <button onClick={handleWriteBack} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-theme-200 bg-theme-50 px-3 py-2.5 text-sm font-semibold text-theme-700 hover:bg-theme-100"><ArrowLeft size={15} />回填原页面</button>}<button onClick={() => setShowSubmitConfirm(true)} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-theme-700"><Send size={15} />确认并提交</button></div> : stage === 'draft' && mode === 'insight' ? <div className="grid grid-cols-2 gap-2"><button onClick={() => showToast('洞察结果已复制')} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-600"><Copy size={15} />复制结果</button><button onClick={() => showToast('洞察结果已保存')} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-theme-600 px-3 py-2.5 text-sm font-semibold text-white"><Save size={15} />保存洞察</button></div> : <button onClick={() => resetWorkspace(mode)} disabled={stage === 'generating' || stage === 'sending'} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">新建{mode === 'report' ? '汇报' : '洞察'}</button>}

          </footer>
        </aside>
      </div>

      {showReportPicker && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/35 p-4">
          <div className="flex h-[min(640px,calc(100vh-48px))] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-gray-950">选择历史工作汇报</h3>
                <p className="mt-1 text-sm text-gray-500">选择需要作为本次项目汇报依据的历史汇报。</p>
              </div>
              <button type="button" onClick={() => setShowReportPicker(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="关闭"><X size={18} /></button>
            </div>
            <div className="shrink-0 border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="relative min-w-0 flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={reportKeyword} onChange={event => setReportKeyword(event.target.value)} placeholder="搜索汇报名称、提交人或周期" className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none focus:border-theme-300 focus:bg-white" />
                </div>
                <button type="button" onClick={toggleAllReports} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 hover:border-theme-200 hover:text-theme-700">
                  <span className={`flex h-4 w-4 items-center justify-center rounded border ${allFilteredReportsSelected ? 'border-theme-600 bg-theme-600 text-white' : 'border-gray-300 text-transparent'}`}><Check size={11} /></span>
                  全选
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3 scrollbar-hover">
              <div className="divide-y divide-gray-100 border-y border-gray-100">
                {filteredReports.map(report => {
                  const selected = reportPickerSelection.includes(report.id);
                  return (
                    <button key={report.id} type="button" onClick={() => toggleReportSelection(report.id)} className={`flex w-full items-center gap-4 px-3 py-4 text-left transition-colors ${selected ? 'bg-theme-50/60' : 'bg-white hover:bg-gray-50'}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? 'border-theme-600 bg-theme-600 text-white' : 'border-gray-300 bg-white text-transparent'}`}><Check size={13} /></span>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500"><FileText size={19} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-gray-900">{report.title}</span>
                        <span className="mt-1 block truncate text-xs text-gray-400">{report.period} · 提交人 {report.author}</span>
                      </span>
                      <span className="shrink-0 rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{report.status}</span>
                    </button>
                  );
                })}
              </div>
              {filteredReports.length === 0 && <div className="py-16 text-center text-sm text-gray-400">暂无匹配汇报</div>}
            </div>
            <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
              <p className="text-sm text-gray-500">已选择 <span className="font-semibold text-theme-700">{reportPickerSelection.length}</span> 份汇报</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowReportPicker(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">取消</button>
                <button type="button" onClick={confirmReportSelection} className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700">确认选择</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProjectPicker && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/35 p-4">
          <div className="flex h-[min(680px,calc(100vh-48px))] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-gray-950">从项目管理平台选择项目</h3>
                <p className="mt-1 text-sm text-gray-500">支持多选，选择多个项目后将分别生成一份项目周报。</p>
              </div>
              <button type="button" onClick={() => setShowProjectPicker(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="关闭"><X size={18} /></button>
            </div>
            <div className="shrink-0 border-b border-gray-100 px-6 py-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={projectKeyword} onChange={event => setProjectKeyword(event.target.value)} placeholder="搜索项目名称、编号、团队或负责人" className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none focus:border-theme-300 focus:bg-white" />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-3 scrollbar-hover">
              <div className="divide-y divide-gray-100 border-y border-gray-100">
                {filteredProjects.map(project => {
                  const selected = projectPickerSelection.includes(project.id);
                  return (
                    <button key={project.id} type="button" onClick={() => toggleProjectSelection(project.id)} className={`flex w-full items-center gap-4 px-3 py-4 text-left transition-colors ${selected ? 'bg-theme-50/60' : 'bg-white hover:bg-gray-50'}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? 'border-theme-600 bg-theme-600 text-white' : 'border-gray-300 bg-white text-transparent'}`}><Check size={13} /></span>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500"><FolderKanban size={19} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2"><span className="truncate text-sm font-semibold text-gray-900">{project.name}</span><span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">{project.code}</span></span>
                        <span className="mt-1 block truncate text-xs text-gray-400">{project.teamName} · 负责人 {project.owner} · 当前进度 {project.progress}%</span>
                      </span>
                      <span className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${project.riskLevel === '风险' ? 'bg-red-50 text-red-600' : project.riskLevel === '关注' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{project.riskLevel}</span>
                    </button>
                  );
                })}
              </div>
              {filteredProjects.length === 0 && <div className="py-16 text-center text-sm text-gray-400">暂无匹配项目</div>}
            </div>
            <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
              <p className="text-sm text-gray-500">已选择 <span className="font-semibold text-theme-700">{projectPickerSelection.length}</span> 个项目</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowProjectPicker(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">取消</button>
                <button type="button" onClick={confirmProjectSelection} className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700">确认选择</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSubmitConfirm && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/30 px-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h3 className="text-lg font-bold text-gray-950">确认提交汇报</h3><p className="mt-1 text-sm text-gray-500">提交后可在工作汇报中查看已读和评论状态。</p></div><button onClick={() => setShowSubmitConfirm(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X size={18} /></button></div><div className="mt-5 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700"><p><span className="text-gray-400">汇报对象：</span>{reportTo || '未选择'}</p><p className="mt-2"><span className="text-gray-400">抄送对象：</span>{copyTo || '无'}</p></div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowSubmitConfirm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">取消</button><button disabled={!reportTo.trim()} onClick={() => { setShowSubmitConfirm(false); setStage('submitted'); }} className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">确认提交</button></div></div></div>}
      {showRegenerateConfirm && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/30 px-4"><div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"><h3 className="text-lg font-bold text-gray-950">重新生成当前内容？</h3><p className="mt-2 text-sm leading-6 text-gray-500">当前编辑内容将被新的生成结果覆盖，需求、范围和数据源会继续保留。</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowRegenerateConfirm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600">取消</button><button onClick={() => { setShowRegenerateConfirm(false); startGeneration(); }} className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white">重新生成</button></div></div></div>}
    </div>
  );
}
