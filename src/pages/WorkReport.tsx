import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Lightbulb,
  ListChecks,
  MessageSquareText,
  PenLine,
  Save,
  Search,
  Send,
  Sparkles,
  Target,
  UserRound,
  X,
  Paperclip,
  Plus,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type WorkReportView = 'write' | 'reports' | 'stats';

const okrObjectives = [
  {
    id: 'o1',
    title: '目标 1：占据行业绝对领先地位，核心业务收入大幅增长，利润率维持行业第一',
    owner: '王一',
    progress: 75,
    score: '0.6',
    keyResults: [
      { title: '关键结果 1：A 产品营收 8000 万元，B 产品营收 2000 万元', owner: '郑八 / 肖八', progress: 95, weight: '50.0%' },
      { title: '关键结果 2：优化营业成本结构，较上周期下降 10%', owner: '赵六', progress: 50, weight: '25.0%' },
      { title: '关键结果 3：规范公司内部审批制度，降低总部管理成本 30%', owner: '刘十', progress: 60, weight: '25.0%' },
    ],
    record: 'A 产品营收 960 万，B 产品营收 480 万，利润率环比增长 20%。',
  },
  {
    id: 'o2',
    title: '目标 2：占领行业先机，新试点业务跑通商业模式，成为营收点',
    owner: '王一',
    progress: 69,
    score: '0.5',
    keyResults: [
      { title: '关键结果 1：新产品达到上线标准，完成路演测试', owner: '肖八 / 袁十一', progress: 100, weight: '33.3%' },
      { title: '关键结果 2：召开产品发布会，获得媒体和市场认可', owner: '沈十六', progress: 100, weight: '33.3%' },
      { title: '关键结果 3：第一期使用客户数量达 100 家公司，实现营收 200 万元', owner: '郑八', progress: 8, weight: '33.3%' },
    ],
    record: '客户招募效果差，第一期使用客户为 8 家，暂无营收。',
  },
  {
    id: 'o3',
    title: '目标 3：提升公司整体工作效率与人员素质，达到国际顶尖公司水平',
    owner: '王一',
    progress: 73,
    score: '0.7',
    keyResults: [
      { title: '关键结果 1：完成核心流程线上化，审批平均时长下降 20%', owner: '梁吉力', progress: 80, weight: '40.0%' },
      { title: '关键结果 2：建立跨部门协作周报机制，重点问题闭环率达到 90%', owner: '梁吉力', progress: 72, weight: '35.0%' },
      { title: '关键结果 3：组织智能办公培训，覆盖 300 名员工', owner: '赵六', progress: 66, weight: '25.0%' },
    ],
    record: '已完成周报模板梳理，跨部门问题跟进表进入试运行。',
  },
];

const reportTargets = ['王一', '秦小明', '邱振鲁', '邵奕'];
const copiedTargets = ['肖八', '郑八', '沈十六'];

const reportHistory = [
  {
    id: 1,
    title: '2026年第24周工作汇报',
    status: '已提交',
    groupDate: '2026年06月18日',
    date: '2026-06-18 18:20',
    person: '梁吉力',
    department: '信息管理部',
    type: '工作周报',
    unread: false,
    reportTo: ['王一', '秦小明'],
    copyTo: ['肖八', '郑八'],
    okrIds: ['o3', 'o1'],
    content: {
      o1: {
        thisWeek: '完成个人门户办公应用模块优化，确认流程审批、业务收入、待办事项、项目进度等入口在不同分辨率下稳定展示。',
        nextWeek: '继续补充经营指标解释与数据看板跳转提示，推动业务指标在门户和周报里保持一致。',
      },
      o3: {
        thisWeek: '完成工作汇报入口设计、OKR 独立模块拆分，并将周报助手调整为浮动如意助手入口，支持根据会议、任务、日程辅助生成周报。',
        nextWeek: '继续完善看汇报页面的 OKR 关联、已读状态、评论反馈和详情查看流程。',
      },
    },
    readReceipts: [
      { name: '王一', read: true, time: '06-18 19:02' },
      { name: '秦小明', read: true, time: '06-18 19:18' },
      { name: '肖八', read: true, time: '06-19 09:10' },
      { name: '郑八', read: false, time: '' },
    ],
    comments: [
      { author: '王一', time: '06-18 19:20', content: 'OKR 3 的下周计划可以补充验收指标，便于下周复盘。' },
      { author: '秦小明', time: '06-19 09:30', content: '工作门户相关内容已同步，后续可关联任务清单。' },
    ],
  },
  {
    id: 2,
    title: '2026年第23周工作汇报',
    status: '已提交',
    groupDate: '2026年06月11日',
    date: '2026-06-11 17:48',
    person: '梁吉力',
    department: '信息管理部',
    type: '工作周报',
    unread: true,
    reportTo: ['王一'],
    copyTo: ['沈十六'],
    okrIds: ['o3'],
    content: {
      o3: {
        thisWeek: '完成公文编辑流程调整，补充附件上传、模板预览、我的公文筛选能力，并优化如意空间与旧版如意助手跳转链路。',
        nextWeek: '继续完善公文编辑页面的最终文件生成、模板管理后台和页面窄屏适配。',
      },
    },
    readReceipts: [
      { name: '王一', read: true, time: '06-11 18:12' },
      { name: '沈十六', read: false, time: '' },
    ],
    comments: [],
  },
  {
    id: 3,
    title: '2026年第22周工作汇报',
    status: '已提交',
    groupDate: '2026年06月04日',
    date: '2026-06-04 16:10',
    person: '梁吉力',
    department: '信息管理部',
    type: '工作周报-管理处',
    unread: false,
    reportTo: ['邱振鲁', '邵奕'],
    copyTo: ['肖八'],
    okrIds: ['o1', 'o2'],
    content: {
      o1: {
        thisWeek: '梳理业务系统入口数据，调整工作门户卡片适配与跳转提示，完成个人门户数据卡片缩放策略。',
        nextWeek: '继续跟进业务指标来源与展示口径，补充入口点击后的提示和异常状态说明。',
      },
      o2: {
        thisWeek: '跟进业务系统入口与试点功能反馈，整理产品发布相关会议纪要，为后续试点推进保留过程记录。',
        nextWeek: '继续收集试点用户反馈，形成发布后问题清单，并明确下一轮验证目标。',
      },
    },
    readReceipts: [
      { name: '邱振鲁', read: true, time: '06-04 17:02' },
      { name: '邵奕', read: true, time: '06-04 17:36' },
      { name: '肖八', read: true, time: '06-05 10:14' },
    ],
    comments: [
      { author: '邱振鲁', time: '06-04 18:00', content: '下周计划建议补充与数据看板的联动节点。' },
    ],
  },
];

const assistantSources = [
  { icon: <MessageSquareText size={15} />, name: 'IM沟通', desc: '提取本周 8 条协同事项', color: 'text-pink-700 bg-pink-50' },
  { icon: <CalendarDays size={15} />, name: '日程', desc: '识别 3 个会议与待办', color: 'text-emerald-600 bg-emerald-50' },
  { icon: <ListChecks size={15} />, name: '任务', desc: '汇总 5 条完成记录', color: 'text-amber-600 bg-amber-50' },
];

type OkrReportContent = {
  thisWeek: string;
  nextWeek: string;
};

const krReportKey = (objectiveId: string, krIndex: number) => `${objectiveId}-kr${krIndex + 1}`;

const initialOkrReports: Record<string, OkrReportContent> = {
  'o1-kr1': {
    thisWeek: '完成业务数据口径梳理，配合确认营收指标在周报中的展示方式。',
    nextWeek: '继续补充关键经营数据来源说明，并推进收入指标看板联动。',
  },
  'o1-kr2': {
    thisWeek: '完成工作门户数据卡片适配与业务入口梳理。',
    nextWeek: '继续跟进业务指标数据来源与展示口径。',
  },
  'o1-kr3': {
    thisWeek: '梳理审批制度优化相关材料，确认流程指标展示方案。',
    nextWeek: '补充流程成本下降的衡量口径和责任分工。',
  },
  'o2-kr1': {
    thisWeek: '跟进新产品上线标准与路演测试准备，整理试点反馈。',
    nextWeek: '继续推动试点问题清单闭环。',
  },
  'o2-kr2': {
    thisWeek: '整理产品发布会相关会议纪要和市场反馈。',
    nextWeek: '补充发布后行动项与传播效果记录。',
  },
  'o2-kr3': {
    thisWeek: '梳理客户招募过程中的主要阻塞和转化数据。',
    nextWeek: '明确下一轮客户转化验证目标。',
  },
  'o3-kr1': {
    thisWeek: '推进核心流程线上化相关页面优化，补充跳转与异常状态说明。',
    nextWeek: '继续验证流程入口和审批平均时长指标展示。',
  },
  'o3-kr2': {
    thisWeek: '完成工作汇报入口设计、OKR 独立模块拆分和周报助手浮动入口。',
    nextWeek: '完善看汇报页面的 OKR 关联、已读状态和评论反馈。',
  },
  'o3-kr3': {
    thisWeek: '梳理智能办公培训相关素材和演示入口。',
    nextWeek: '补充培训覆盖范围和参训反馈记录。',
  },
};

export default function WorkReport() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<WorkReportView>('reports');
  const [okrReports, setOkrReports] = useState<Record<string, OkrReportContent>>(initialOkrReports);
  const [reportTo, setReportTo] = useState(reportTargets.join(','));
  const [copyTo, setCopyTo] = useState(copiedTargets.join(','));
  const [selectedObjectiveId, setSelectedObjectiveId] = useState('o3');
  const [toast, setToast] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);

  const selectedObjective = useMemo(
    () => okrObjectives.find(item => item.id === selectedObjectiveId) || okrObjectives[0],
    [selectedObjectiveId],
  );

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const importLastReport = () => {
    setOkrReports({
      'o1-kr1': { thisWeek: '完成经营数据口径统一与指标来源梳理。', nextWeek: '补充数据看板跳转说明和指标解释。' },
      'o1-kr2': { thisWeek: '完成个人门户数据卡片适配与入口调整。', nextWeek: '继续跟进分辨率适配和跳转提示。' },
      'o1-kr3': { thisWeek: '确认流程审批卡片展示方式。', nextWeek: '补充流程成本指标说明。' },
      'o2-kr1': { thisWeek: '完成试点环境操作记录整理。', nextWeek: '继续推进测试问题闭环。' },
      'o2-kr2': { thisWeek: '整理发布会反馈和市场认可材料。', nextWeek: '补充后续传播计划。' },
      'o2-kr3': { thisWeek: '梳理客户招募阻塞。', nextWeek: '跟进客户转化数据。' },
      'o3-kr1': { thisWeek: '完成流程线上化入口与页面联动调整。', nextWeek: '继续验证流程效率指标。' },
      'o3-kr2': { thisWeek: '完成工作汇报入口、OKR 模块拆分和周报助手交互调整。', nextWeek: '完善看汇报详情、评论和已读状态。' },
      'o3-kr3': { thisWeek: '整理智能办公培训素材。', nextWeek: '补充培训覆盖统计。' },
    });
    showToast('已导入上次汇报内容');
  };

  const generateByAi = () => {
    setOkrReports({
      'o1-kr1': { thisWeek: '本周围绕营收指标口径完成数据字段核对，明确销售额与利润率在门户和周报中的一致表达。', nextWeek: '下周补充数据来源说明，完成与经营看板的入口联动验证。' },
      'o1-kr2': { thisWeek: '本周完成门户办公应用和业务入口的适配优化，保障不同分辨率下稳定展示。', nextWeek: '下周继续跟进业务入口异常状态和跳转反馈。' },
      'o1-kr3': { thisWeek: '本周梳理审批制度和流程成本相关呈现方式，补充待办、流程审批等入口提示。', nextWeek: '下周补充可量化的流程效率指标和成本下降口径。' },
      'o2-kr1': { thisWeek: '本周跟进试点功能反馈，整理测试过程记录和验证口径。', nextWeek: '下周推动测试问题清单闭环。' },
      'o2-kr2': { thisWeek: '本周整理产品发布相关会议纪要，补充市场反馈材料。', nextWeek: '下周明确发布会后续行动项。' },
      'o2-kr3': { thisWeek: '本周记录客户招募与转化阻塞，形成阶段性反馈。', nextWeek: '下周补充客户转化数据和下一轮验证目标。' },
      'o3-kr1': { thisWeek: '本周完成核心流程线上化入口优化，并同步验证审批相关路径。', nextWeek: '下周继续跟踪审批平均时长下降指标。' },
      'o3-kr2': { thisWeek: `围绕 ${selectedObjective.title}，本周完成工作汇报入口设计、看汇报详情弹框、OKR 独立模块和周报助手交互优化。`, nextWeek: '下周继续完善汇报对象已读情况、评论反馈与 KR 最新汇报展示。' },
      'o3-kr3': { thisWeek: '本周整理智能办公培训演示素材，补充入口说明。', nextWeek: '下周补充培训覆盖数据和反馈记录。' },
    });
    showToast('汇报助手已生成本周汇报草稿');
  };

  const polishReport = () => {
    setOkrReports(prev => Object.fromEntries(
      Object.entries(prev).map(([key, value]) => [
        key,
        {
          thisWeek: `${value.thisWeek.replace(/。$/, '')}，整体进展符合计划，相关问题已形成跟踪清单并同步责任人。`,
          nextWeek: `${value.nextWeek.replace(/。$/, '')}，并将在下周同步完成结果与风险反馈。`,
        },
      ])
    ));
    showToast('汇报助手已优化今日总结');
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f6f9] text-gray-900">
      {toast && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full bg-gray-900/90 px-5 py-2.5 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/enterprise')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-pink-200 hover:bg-pink-50 hover:text-pink-700"
              title="返回个人门户"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-700 to-pink-900 text-white shadow-md shadow-pink-700/15">
              <ClipboardList size={21} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">工作汇报</h1>
              <p className="text-xs text-gray-500">OKR 拆解到个人周报的闭环工作台</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 text-sm text-gray-500 lg:flex">
            <Clock3 size={16} />
            <span>填写周期：本周四 00:00 开始提交，周五 00:00 前完成</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col px-5 py-5">
        <section className="mb-5 shrink-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          {activeView === 'write' ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">写汇报</h2>
                <p className="mt-1 text-sm text-gray-500">按 OKR 和工作事项填写本周汇报</p>
              </div>
              <button
                onClick={() => setActiveView('reports')}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Eye size={16} />
                返回看汇报
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900">工作汇报</h2>
                <p className="mt-1 text-sm text-gray-500">{activeView === 'stats' ? '按日期明细查看团队汇报情况' : '查看汇报内容、关联 OKR、已读情况和评论'}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-xl bg-gray-50 p-1 ring-1 ring-gray-100">
                  <button
                    onClick={() => setActiveView('reports')}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${activeView === 'reports' ? 'bg-white text-pink-800 shadow-sm ring-1 ring-pink-100' : 'text-gray-600 hover:text-pink-700'}`}
                  >
                    <Eye size={16} />
                    看汇报
                  </button>
                  <button
                    onClick={() => setActiveView('stats')}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${activeView === 'stats' ? 'bg-white text-pink-800 shadow-sm ring-1 ring-pink-100' : 'text-gray-600 hover:text-pink-700'}`}
                  >
                    <BarChart3 size={16} />
                    汇报统计
                  </button>
                </div>
                <button
                  onClick={() => setActiveView('write')}
                  className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-pink-700/20 hover:bg-pink-800"
                >
                  <PenLine size={16} />
                  写汇报
                </button>
              </div>
            </div>
          )}
        </section>

        {activeView === 'write' && (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-hover">
            <ReportComposer
            okrReports={okrReports}
            reportTo={reportTo}
            copyTo={copyTo}
            selectedObjective={selectedObjective}
            onOkrReportChange={(id, field, value) => setOkrReports(prev => ({
              ...prev,
              [id]: { ...(prev[id] || { thisWeek: '', nextWeek: '' }), [field]: value },
            }))}
            onReportToChange={setReportTo}
            onCopyToChange={setCopyTo}
            onImportLast={importLastReport}
            onToast={showToast}
          />
          </div>
        )}

        {activeView === 'reports' && (
          <div className="min-h-0 flex-1">
            <ReportsView onWrite={() => setActiveView('write')} />
          </div>
        )}

        {activeView === 'stats' && (
          <div className="min-h-0 flex-1">
            <ReportStatsView />
          </div>
        )}
      </div>

      {(activeView === 'write' || activeView === 'reports' || activeView === 'stats') && (
        <button
          onClick={() => setAssistantOpen(true)}
          className="fixed right-5 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-1 rounded-2xl bg-white p-2 text-gray-700 shadow-xl ring-1 ring-pink-100 transition hover:-translate-y-[52%] hover:shadow-2xl"
          title="汇报助手"
        >
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-600 to-pink-800 shadow-lg">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=ruyi_assistant"
              alt="汇报助手"
              className="h-full w-full"
            />
          </div>
          <span className="text-[11px] font-semibold text-pink-700">汇报助手</span>
        </button>
      )}

      {assistantOpen && activeView === 'write' && (
        <WeeklyAssistantDrawer
          open={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          onGenerate={generateByAi}
          onInsert={() => {
            generateByAi();
            setAssistantOpen(false);
            showToast('已插入智能周报内容');
          }}
        />
      )}

      {assistantOpen && (activeView === 'reports' || activeView === 'stats') && (
        <ReportSummaryAssistantDrawer
          open={assistantOpen}
          onClose={() => setAssistantOpen(false)}
          onGenerate={() => showToast('汇报助手已生成汇报分析')}
        />
      )}
    </div>
  );
}

function NavPill({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? 'bg-pink-700 text-white shadow-sm shadow-pink-700/20'
          : 'bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-pink-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ReportComposer({
  okrReports,
  reportTo,
  copyTo,
  selectedObjective,
  onOkrReportChange,
  onReportToChange,
  onCopyToChange,
  onImportLast,
  onToast,
}: {
  okrReports: Record<string, OkrReportContent>;
  reportTo: string;
  copyTo: string;
  selectedObjective: typeof okrObjectives[number];
  onOkrReportChange: (id: string, field: keyof OkrReportContent, value: string) => void;
  onReportToChange: (value: string) => void;
  onCopyToChange: (value: string) => void;
  onImportLast: () => void;
  onToast: (message: string) => void;
}) {
  const [nonOkrItems, setNonOkrItems] = useState<NonOkrWorkItem[]>([
    {
      id: 1,
      title: '日常协同事项',
      thisWeek: '完成跨部门需求沟通、页面验收反馈整理和问题闭环跟进。',
      nextWeek: '继续跟进遗留问题，补充验收记录并同步相关责任人。',
    },
  ]);

  const updateNonOkrItem = (id: number, field: keyof Omit<NonOkrWorkItem, 'id'>, value: string) => {
    setNonOkrItems(current => current.map(item => (
      item.id === id ? { ...item, [field]: value.slice(0, field === 'title' ? 80 : 800) } : item
    )));
  };

  const addNonOkrItem = () => {
    setNonOkrItems(current => [
      ...current,
      { id: Date.now(), title: '', thisWeek: '', nextWeek: '' },
    ]);
  };

  const removeNonOkrItem = (id: number) => {
    setNonOkrItems(current => current.length === 1 ? current : current.filter(item => item.id !== id));
  };

  return (
    <main className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">写汇报</h2>
          <p className="mt-1 text-sm text-gray-500">按当前登录人的每条 KR 填写对应工作总结</p>
        </div>
        <button
          onClick={onImportLast}
          className="rounded-lg border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-800 transition hover:bg-pink-50"
        >
          导入上次汇报内容
        </button>
      </div>

      <div className="space-y-6 px-6 py-6">
        <section className="rounded-2xl border border-pink-100 bg-pink-50/60 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-pink-800">
                <Target size={16} />
                梁吉力的 OKR 工作总结
              </div>
              <p className="mt-1 text-xs text-gray-500">每条 KR 分别填写本周事项和下周事项，提交时随周报一起汇总</p>
            </div>
          </div>
          <div className="grid gap-3">
            {okrObjectives.map((objective, index) => (
              <div
                key={objective.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${selectedObjective.id === objective.id ? 'border-pink-200 ring-2 ring-pink-100' : 'border-gray-100'}`}
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-700 text-xs font-bold text-white">{index + 1}</span>
                      <h3 className="text-sm font-bold leading-6 text-gray-950">{objective.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="rounded-full bg-gray-50 px-2 py-0.5">负责人：{objective.owner}</span>
                      <span className="rounded-full bg-gray-50 px-2 py-0.5">进度：{objective.progress}%</span>
                      <span className="rounded-full bg-gray-50 px-2 py-0.5">总分：{objective.score}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {objective.keyResults.map((result, resultIndex) => {
                    const reportKey = krReportKey(objective.id, resultIndex);
                    const reportValue = okrReports[reportKey] || { thisWeek: '', nextWeek: '' };
                    return (
                      <div key={result.title} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                          <div className="flex min-w-0 flex-1 items-start gap-2">
                            <span className="mt-0.5 shrink-0 rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-700">KR{resultIndex + 1}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold leading-6 text-gray-800">{result.title}</p>
                              <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                                <span>@{result.owner}</span>
                                <span>进度 {result.progress}%</span>
                                <span>权重 {result.weight}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                              <span className="mr-1 text-red-500">*</span>
                              本周事项
                            </label>
                            <textarea
                              value={reportValue.thisWeek}
                              onChange={(event) => onOkrReportChange(reportKey, 'thisWeek', event.target.value.slice(0, 800))}
                              placeholder="请填写该 KR 对应的本周事项"
                              className="min-h-[90px] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                            />
                            <div className="mt-1 text-right text-xs text-gray-400">{reportValue.thisWeek.length} / 800</div>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-800">
                              <span className="mr-1 text-red-500">*</span>
                              下周事项
                            </label>
                            <textarea
                              value={reportValue.nextWeek}
                              onChange={(event) => onOkrReportChange(reportKey, 'nextWeek', event.target.value.slice(0, 800))}
                              placeholder="请填写该 KR 对应的下周事项"
                              className="min-h-[90px] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                            />
                            <div className="mt-1 text-right text-xs text-gray-400">{reportValue.nextWeek.length} / 800</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-pink-900">
                <FileText size={16} />
                其他工作事项
              </div>
              <p className="mt-1 text-xs text-gray-500">不关联 OKR 的临时事项、协同支持或日常工作，可单独补充到汇报中</p>
            </div>
            <button
              type="button"
              onClick={addNonOkrItem}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-pink-800 ring-1 ring-pink-100 hover:bg-pink-50"
            >
              <Plus size={14} />
              新增工作项
            </button>
          </div>

          <div className="space-y-3">
            {nonOkrItems.map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-700 text-xs font-bold text-white">{index + 1}</span>
                    <input
                      value={item.title}
                      onChange={(event) => updateNonOkrItem(item.id, 'title', event.target.value)}
                      placeholder="请输入工作标题"
                      className="h-9 min-w-0 flex-1 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-900 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNonOkrItem(item.id)}
                    disabled={nonOkrItems.length === 1}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                    删除
                  </button>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">本周事项</label>
                    <textarea
                      value={item.thisWeek}
                      onChange={(event) => updateNonOkrItem(item.id, 'thisWeek', event.target.value)}
                      placeholder="请填写本周完成事项"
                      className="min-h-[96px] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                    />
                    <div className="mt-1 text-right text-xs text-gray-400">{item.thisWeek.length} / 800</div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">下周事项</label>
                    <textarea
                      value={item.nextWeek}
                      onChange={(event) => updateNonOkrItem(item.id, 'nextWeek', event.target.value)}
                      placeholder="请填写下周计划事项"
                      className="min-h-[96px] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                    />
                    <div className="mt-1 text-right text-xs text-gray-400">{item.nextWeek.length} / 800</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ReportInput required label="汇报对象" value={reportTo} onChange={onReportToChange} placeholder="请选择汇报对象" />
        <ReportInput label="抄送对象" value={copyTo} onChange={onCopyToChange} placeholder="请选择抄送对象" />
      </div>

      <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 rounded-b-2xl border-t border-gray-100 bg-white/95 px-6 py-4 backdrop-blur">
        <button
          onClick={() => onToast('已保存草稿')}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-7 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <Save size={16} />
          保存
        </button>
        <button
          onClick={() => onToast('汇报已提交')}
          className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-7 py-2.5 text-sm font-semibold text-white shadow-sm shadow-pink-700/20 transition hover:bg-pink-800"
        >
          <Send size={16} />
          提交汇报
        </button>
      </div>
    </main>
  );
}

function ReportAssistantPanel({
  onGenerate,
  onPolish,
  onToast,
}: {
  onGenerate: () => void;
  onPolish: () => void;
  onToast: (message: string) => void;
}) {
  return (
    <aside className="rounded-2xl border border-pink-100 bg-gradient-to-br from-white to-pink-50 shadow-sm">
      <div className="border-b border-pink-100/70 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-700 text-white">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">汇报助手</h2>
            <p className="text-xs text-gray-500">根据协作数据辅助写本周汇报</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <p className="mb-2 text-xs font-semibold text-gray-500">可参考数据</p>
          <div className="space-y-2">
            {assistantSources.map(source => (
              <div key={source.name} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-pink-100">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${source.color}`}>{source.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{source.name}</p>
                  <p className="text-xs text-gray-500">{source.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Sparkles size={16} className="text-pink-700" />
            本周隐性工作识别
          </div>
          <div className="space-y-2 text-sm leading-6 text-gray-600">
            <p>1. 推进工作汇报入口与个人门户联动。</p>
            <p>2. 多次根据反馈调整公文编辑流程。</p>
            <p>3. 协调模板管理与如意空间跳转关系。</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button onClick={onGenerate} className="flex items-center justify-between rounded-xl bg-pink-700 px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:bg-pink-800">
            <span className="flex items-center gap-2"><Sparkles size={16} />生成本周汇报</span>
            <ChevronRight size={16} />
          </button>
          <button onClick={onPolish} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm ring-1 ring-pink-100 transition hover:text-pink-800">
            <span className="flex items-center gap-2"><PenLine size={16} className="text-pink-700" />润色当前内容</span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
          <button onClick={() => onToast('汇报助手已补充风险与计划建议')} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-medium text-gray-700 shadow-sm ring-1 ring-pink-100 transition hover:text-pink-800">
            <span className="flex items-center gap-2"><Lightbulb size={16} className="text-pink-700" />补充风险与计划</span>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        </div>
      </div>
    </aside>
  );
}


const reportStatRows = [
  { name: '梁吉利', department: '信息管理部', role: '产品经理', submitted: 2, missing: 0, task: '工作汇报与OKR联动', progress: '完成看汇报详情、评论与汇报助手入口优化', summary: '围绕门户办公应用、OKR模块拆分和汇报助手体验完成多轮迭代，问题闭环较快。', status: '已提交' },
  { name: '肖八', department: '产品部', role: '产品经理', submitted: 1, missing: 1, task: '新产品路演测试', progress: '完成路演材料整理，试点反馈待补充', summary: '本周期重点支撑新产品上线标准与发布材料，后续需要补充客户反馈数据。', status: '部分提交' },
  { name: '郑八', department: '市场部', role: '业务经理', submitted: 0, missing: 2, task: '客户招募转化', progress: '客户招募数据未同步', summary: '缺少本周期汇报，AI判断客户转化事项存在跟进断点，需要提醒补交。', status: '未提交' },
  { name: '沈十六', department: '信息管理部', role: '研发负责人', submitted: 2, missing: 0, task: '系统上线支撑', progress: '完成配置校验与验收问题梳理', summary: '围绕核心系统实施上线推进较稳定，已形成问题清单和下一步配置校验计划。', status: '已提交' },
];

function ReportStatsView() {
  const statDates = ['06月17日', '06月18日', '06月19日'];
  const totalPeople = reportStatRows.length;
  const submittedPeople = reportStatRows.filter(row => row.submitted > 0).length;
  const missingPeople = reportStatRows.filter(row => row.missing > 0).length;
  const submittedDays = reportStatRows.reduce((sum, row) => sum + row.submitted, 0);
  const missingDays = reportStatRows.reduce((sum, row) => sum + row.missing, 0);
  const submitRate = Math.round((submittedDays / Math.max(submittedDays + missingDays, 1)) * 100);

  const detailRows = reportStatRows.map((row, index) => ({
    ...row,
    office: index % 2 === 0 ? '管理支撑产品处' : '信息应用交付处',
    dateDetails: statDates.map((date, dateIndex) => {
      if (row.missing > dateIndex && row.submitted === 0) return '未提交';
      if (row.missing > 0 && dateIndex === statDates.length - 1) return '未提交';
      return row.progress;
    }),
  }));

  return (
    <main className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">汇报统计</h2>
          <p className="mt-1 text-sm text-gray-500">按筛选日期展示每个人的提交明细和工作内容</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-800">
          <Download size={16} />
          导出
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 px-6 py-5">
        <section className="shrink-0 grid gap-3 lg:grid-cols-[220px_300px_220px_minmax(220px,1fr)]">
          <button className="flex h-11 items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500 hover:border-pink-200">
            <span>请选择人员</span>
            <ChevronRight size={15} className="rotate-90 text-gray-300" />
          </button>
          <div className="grid h-11 grid-cols-[1fr_24px_1fr] items-center rounded-lg border border-pink-200 bg-pink-50/30 px-3 text-sm text-gray-700 ring-2 ring-pink-50">
            <span>2026-06-17</span>
            <span className="text-center text-gray-400">~</span>
            <span>2026-06-19</span>
          </div>
          <button className="flex h-11 items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500 hover:border-pink-200">
            <span>人员范围</span>
            <ChevronRight size={15} className="rotate-90 text-gray-300" />
          </button>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="h-11 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100" placeholder="搜索姓名、任务或进展" />
          </div>
        </section>

        <section className="shrink-0 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatNumberCard title="统计人员" value={`${totalPeople}`} desc="已纳入本次统计的人员" tone="neutral" />
          <StatNumberCard title="已提交" value={`${submittedPeople}`} desc={`${submittedDays} 个汇报日期已提交`} tone="pink" />
          <StatNumberCard title="未提交" value={`${missingPeople}`} desc={`${missingDays} 个汇报日期待补交`} tone="warning" />
          <StatNumberCard title="提交率" value={`${submitRate}%`} desc="按人员和日期维度统计" tone="success" />
        </section>

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-100">
          <div className="min-h-0 flex-1 overflow-auto scrollbar-hover">
            <div className="grid min-w-[1320px] grid-cols-[110px_150px_120px_110px_86px_96px_260px_repeat(3,220px)] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
              <div>部门</div>
              <div>处室</div>
              <div>岗位</div>
              <div>姓名</div>
              <div>提交/天</div>
              <div>未提交/天</div>
              <div>智能总结</div>
              {statDates.map(date => <div key={date}>{date}</div>)}
            </div>
            {detailRows.map(row => (
              <div key={row.name} className="grid min-w-[1320px] grid-cols-[110px_150px_120px_110px_86px_96px_260px_repeat(3,220px)] items-start border-t border-gray-100 px-4 py-4 text-sm transition hover:bg-pink-50/30">
                <div className="leading-6 text-gray-700">{row.department}</div>
                <div className="leading-6 text-gray-700">{row.office}</div>
                <div className="leading-6 text-gray-700">{row.role}</div>
                <div className="font-semibold text-gray-900">{row.name}</div>
                <div className="font-semibold text-gray-900">{row.submitted}</div>
                <div className={row.missing > 0 ? 'font-semibold text-red-500' : 'font-semibold text-gray-700'}>{row.missing}</div>
                <div className="pr-4 leading-6 text-gray-600">{row.summary}</div>
                {row.dateDetails.map((detail, index) => (
                  <div key={`${row.name}-${statDates[index]}`} className={detail === '未提交' ? 'font-medium text-gray-500' : 'pr-4 leading-6 text-gray-700'}>{detail}</div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatNumberCard({ title, value, desc, tone }: { title: string; value: string; desc: string; tone: 'neutral' | 'pink' | 'warning' | 'success' }) {
  const toneClass = {
    neutral: 'border-gray-100 bg-gray-50 text-gray-900',
    pink: 'border-pink-100 bg-pink-50 text-pink-800',
    warning: 'border-amber-100 bg-amber-50 text-amber-700',
    success: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  }[tone];
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <div className="text-sm font-semibold opacity-80">{title}</div>
      <div className="mt-3 text-3xl font-bold tracking-tight">{value}</div>
      <div className="mt-2 text-xs leading-5 text-gray-500">{desc}</div>
    </div>
  );
}

function ReportSummaryAssistantDrawer({ open, onClose, onGenerate }: { open: boolean; onClose: () => void; onGenerate: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-gray-900/20" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-[#fff7fb] shadow-2xl">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-pink-100 bg-[#fff8fb] px-4">
          <h2 className="text-sm font-bold text-gray-950">汇报助手</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-500 hover:bg-white" title="关闭"><X size={17} /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hover">
          <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-pink-800"><Sparkles size={16} />发起工作汇报分析</div>
            <div className="grid gap-3">
              <div className="grid grid-cols-[1fr_24px_1fr] items-center rounded-lg border border-pink-200 bg-pink-50/30 px-3 py-2 text-sm"><span>2026-06-22</span><span className="text-center text-gray-400">~</span><span>2026-06-23</span></div>
              <button className="flex h-10 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm text-gray-600"><span>人员范围：梁吉利、肖八、郑八、沈十六</span><ChevronRight size={15} className="rotate-90 text-gray-300" /></button>
              <input className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100" defaultValue="工作汇报与OKR联动" />
            </div>
            <button onClick={onGenerate} className="mt-4 w-full rounded-lg bg-pink-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-800">生成汇报分析</button>
          </section>
          <section className="mt-4 rounded-xl bg-pink-100/70 p-4">
            <div className="mb-3 text-sm font-bold text-pink-900">分析结果</div>
            <div className="space-y-3 text-sm leading-6 text-gray-700">
              <p>本时间范围内共识别 4 名人员、6 条任务进展，已提交率约 72%。</p>
              <p>梁吉利围绕工作汇报和 OKR 联动推进最充分；沈十六主要承接系统上线支撑；郑八存在未提交风险。</p>
              <p>建议对未提交人员发起提醒，并将“工作汇报与OKR联动”事项纳入下周重点跟进。</p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function WeeklyAssistantDrawer({
  open,
  onClose,
  onGenerate,
  onInsert,
}: {
  open: boolean;
  onClose: () => void;
  onGenerate: () => void;
  onInsert: () => void;
}) {
  if (!open) return null;

  const sourceTabs = [
    { name: '日程', items: ['产品需求评审会 06-15', 'OKR拆解评审会 06-16', '工作门户验收沟通 06-17'] },
    { name: '待办任务', items: ['完成工作汇报页面联调', '修复OKR编辑态交互', '补充看汇报详情评论'] },
    { name: '历史周报', items: ['第23周：公文编辑流程优化', '第24周：工作门户与OKR拆分'] },
    { name: '附件', items: ['智能周报功能说明.pdf', 'OKR拆解草图.png'] },
  ];

  const okrDrafts = [
    {
      title: 'OKR 1：管理域数字化需求承接与交付',
      kr: 'KR1：完成需求调研、方案评审与立项汇报',
      thisWeek: '结合本周日程和待办任务，完成工作汇报入口优化、OKR编辑态交互调整，并处理如意空间公文能力相关验收反馈。参考历史周报延续事项，补充了列表筛选、详情评论和页面滚动体验。',
      nextWeek: '继续推进工作汇报与OKR数据联动，补充对齐关系、下级OKR查看和周报插入后的保存校验，确保门户办公应用流程闭环。',
    },
    {
      title: 'OKR 2：核心系统与周边能力上线支撑',
      kr: 'KR2：完成基础配置、页面适配与验收问题闭环',
      thisWeek: '根据附件中的功能说明和验收记录，修复OKR页面白屏、主题色不一致、编辑态展示冗余等问题，并完成本地预览验证。',
      nextWeek: '继续整理遗留问题清单，推进工作汇报助手的数据来源标注、全局插入效果校验和历史汇报追踪。',
    },
  ];

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-gray-900/20" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-[#fff7fb] shadow-2xl">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-pink-100 bg-[#fff8fb] px-4">
          <h2 className="text-sm font-bold text-gray-950">汇报助手</h2>
          <div className="flex items-center gap-2 text-gray-500">
            <button className="rounded-lg p-1.5 hover:bg-white" title="新会话">
              <FileText size={16} />
            </button>
            <button className="rounded-lg p-1.5 hover:bg-white" title="历史">
              <Clock3 size={16} />
            </button>
            <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-white" title="关闭">
              <X size={17} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-4 flex justify-end">
            <button
              onClick={onGenerate}
              className="rounded-lg bg-pink-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-800"
            >
              生成周报
            </button>
          </div>

          <section className="mb-4 rounded-xl bg-pink-100/80 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-pink-900">
              <span className="h-1.5 w-1.5 rounded-full bg-pink-700" />
              根据日程、待办任务、历史周报、附件生成本周周报
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-600">
              {sourceTabs.map(source => (
                <button key={source.name} className="rounded-lg bg-white px-2 py-2 text-center shadow-sm ring-1 ring-pink-100 first:bg-pink-700 first:text-white">
                  {source.name}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2 rounded-lg bg-white/70 p-3 text-sm">
              {sourceTabs.map(source => (
                <div key={source.name} className="grid grid-cols-[72px_minmax(0,1fr)] gap-2">
                  <span className="font-semibold text-pink-800">{source.name}</span>
                  <div className="min-w-0 space-y-1 text-gray-600">
                    {source.items.map(item => <p key={item} className="truncate">{item}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-4 rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-gray-950">智能周报草稿</h3>
              <span className="rounded bg-pink-50 px-2 py-0.5 text-xs font-semibold text-pink-800">按 OKR 维度生成</span>
            </div>
            <div className="space-y-4">
              {okrDrafts.map((draft, index) => (
                <div key={draft.kr} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-700 text-xs font-bold text-white">{index + 1}</span>
                    <div>
                      <h4 className="text-sm font-bold leading-6 text-gray-950">{draft.title}</h4>
                      <p className="text-xs font-semibold text-pink-800">{draft.kr}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm leading-6 text-gray-700 md:grid-cols-2">
                    <div className="rounded-lg bg-white p-3 ring-1 ring-gray-100">
                      <p className="mb-1 font-bold text-gray-900">本周工作</p>
                      <p>{draft.thisWeek}</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 ring-1 ring-gray-100">
                      <p className="mb-1 font-bold text-gray-900">下周计划</p>
                      <p>{draft.nextWeek}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
              <Sparkles size={16} />
              全局插入
            </div>
            <p className="mb-3 text-xs leading-5 text-amber-700">将上方 OKR 维度草稿一键插入到写汇报页面，对应每条 KR 的本周工作和下周计划。</p>
            <div className="grid grid-cols-[1fr_64px] gap-2">
              <button
                onClick={onInsert}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                全局插入
              </button>
              <button onClick={onClose} className="rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-200">
                忽略
              </button>
            </div>
          </section>
        </div>

        <footer className="shrink-0 border-t border-pink-100 bg-white p-3">
          <div className="rounded-xl border border-pink-300 bg-white p-3 shadow-sm focus-within:ring-2 focus-within:ring-pink-100">
            <textarea
              className="h-16 w-full resize-none text-sm outline-none placeholder:text-gray-400"
              placeholder="请输入补充要求，或上传附件后生成周报"
            />
            <div className="mt-2 flex items-center justify-between">
              <button className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-50" title="上传附件">
                <Paperclip size={16} />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-700 hover:bg-pink-200" title="发送">
                <Send size={16} />
              </button>
            </div>
          </div>
        </footer>
      </aside>
    </div>
  );
}


function ReportsView({ onWrite: _onWrite }: { onWrite: () => void }) {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<typeof reportHistory[number] | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentsByReport, setCommentsByReport] = useState<Record<number, typeof reportHistory[number]['comments']>>(
    Object.fromEntries(reportHistory.map(report => [report.id, report.comments]))
  );

  const groupedReports = reportHistory.reduce<Record<string, typeof reportHistory>>((groups, report) => {
    groups[report.groupDate] = [...(groups[report.groupDate] || []), report];
    return groups;
  }, {});

  const addComment = () => {
    if (!selectedReport || !commentDraft.trim()) return;
    const nextComment = {
      author: '梁吉力',
      time: '刚刚',
      content: commentDraft.trim(),
    };
    setCommentsByReport(prev => ({
      ...prev,
      [selectedReport.id]: [...(prev[selectedReport.id] || []), nextComment],
    }));
    setCommentDraft('');
  };

  return (
    <div className="h-full min-h-0">
      <main className="flex h-full min-h-0 flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">看汇报</h2>
            <p className="mt-1 text-sm text-gray-500">按日期查看汇报内容、关联 OKR、已读情况和评论反馈</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              <Download size={16} />
              导出
            </button>
          </div>
        </div>

        <div className="shrink-0 border-b border-gray-100 px-6 py-4">
          <div className="grid gap-3 lg:grid-cols-[180px_260px_minmax(180px,1fr)_86px]">
            <button className="flex h-10 items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500 hover:border-pink-200">
              <span>汇报类型</span>
              <ChevronRight size={15} className="rotate-90 text-gray-300" />
            </button>
            <div className="grid h-10 grid-cols-[1fr_24px_1fr] items-center rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-400">
              <span>开始日期</span>
              <span className="text-center">~</span>
              <span>结束日期</span>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100" placeholder="搜索人员、汇报内容或 OKR" />
            </div>
            <label className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm text-gray-600">
              <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-pink-700 focus:ring-pink-500" />
              未读
            </label>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-[200px_minmax(200px,1fr)]">
            <button className="flex h-10 items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500 hover:border-pink-200">
              <span>请选择范围</span>
              <ChevronRight size={15} className="rotate-90 text-gray-300" />
            </button>
            <button className="flex h-10 items-center justify-between rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-500 hover:border-pink-200">
              <span>请选择人员</span>
              <ChevronRight size={15} className="rotate-90 text-gray-300" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 scrollbar-hover">
          {Object.entries(groupedReports).map(([date, reports]) => (
            <section key={date} className="mb-8 last:mb-0">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-pink-700" />
                <h3 className="font-bold text-gray-800">{date}</h3>
                <span className="rounded-full bg-gray-50 px-2 py-0.5 text-xs text-gray-500">{reports.length} 条</span>
              </div>
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <div className="grid grid-cols-[180px_132px_minmax(220px,1fr)_220px_154px_110px_92px] bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 max-xl:min-w-[1100px]">
                  <div>人员</div>
                  <div>汇报类型</div>
                  <div>汇报内容</div>
                  <div>关联OKR</div>
                  <div>汇报对象</div>
                  <div>已读情况</div>
                  <div>评论</div>
                </div>
                <div className="overflow-x-auto">
                  {reports.map(report => {
                    const comments = commentsByReport[report.id] || [];
                    const readCount = report.readReceipts.filter(item => item.read).length;
                    const relatedOkrs = report.okrIds
                      .map(okrId => okrObjectives.find(objective => objective.id === okrId))
                      .filter(Boolean) as typeof okrObjectives;
                    const relatedKrTitles = relatedOkrs.flatMap(objective => objective.keyResults.map(result => result.title)).slice(0, 3);
                    const summary = Object.values(report.content)[0]?.thisWeek || '';
                    return (
                      <div
                        key={report.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedReport(report)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedReport(report);
                          }
                        }}
                        className="grid w-full cursor-pointer grid-cols-[180px_132px_minmax(220px,1fr)_220px_154px_110px_92px] items-center border-t border-gray-100 px-4 py-4 text-left transition hover:bg-pink-50/40 max-xl:min-w-[1100px]"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-pink-100 text-sm font-bold text-pink-700">
                            {report.person.slice(0, 1)}
                            {report.unread && <span className="absolute -right-1 -top-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 ring-1 ring-red-100">未读</span>}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-gray-900">{report.person}</div>
                            <div className="truncate text-xs text-gray-400">{report.department}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700">{report.type}</div>
                        <div className="min-w-0 pr-4">
                          <div className="mb-1 truncate text-sm font-medium text-gray-900">{report.title}</div>
                          <p className="line-clamp-2 text-sm leading-6 text-gray-600">{summary}</p>
                        </div>
                        <div className="min-w-0 pr-3">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate(`/okr?objective=${report.okrIds[0]}`);
                            }}
                            className="block w-full text-left hover:text-pink-900"
                            title={relatedKrTitles.join('；')}
                          >
                            <span className="mb-1 inline-flex rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-800">2026 年 4 月 - 6 月</span>
                            <span className="line-clamp-2 text-sm font-medium leading-5 text-gray-800">{relatedKrTitles.join('；')}</span>
                          </button>
                        </div>
                        <div className="truncate text-sm text-gray-600">{report.reportTo.join('、')}</div>
                        <div className="text-sm text-gray-600">{readCount}/{report.readReceipts.length} 已读</div>
                        <div className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <MessageSquareText size={15} className="text-gray-400" />
                          {comments.length || '-'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>

      {selectedReport && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-950/35 px-4 py-6" onClick={() => setSelectedReport(null)}>
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <header className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-950">{selectedReport.title}</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{selectedReport.status}</span>
                  {selectedReport.unread && <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">未读</span>}
                </div>
                <p className="text-sm text-gray-500">{selectedReport.person} · {selectedReport.department} · {selectedReport.date}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700" title="关闭">
                <X size={18} />
              </button>
            </header>

            <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="overflow-y-auto px-6 py-5 scrollbar-hover">
                <section className="mb-5 rounded-2xl border border-pink-100 bg-pink-50/50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-bold text-pink-800">
                    <Target size={16} />
                    关联 OKR 与本次汇报内容
                  </div>
                  <div className="space-y-3">
                    {selectedReport.okrIds.map((okrId, index) => {
                      const objective = okrObjectives.find(item => item.id === okrId);
                      const reportContent = selectedReport.content[okrId];
                      if (!objective || !reportContent) return null;
                      return (
                        <div key={okrId} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-700 text-xs font-bold text-white">{index + 1}</span>
                                <h4 className="text-sm font-bold leading-6 text-gray-950">{objective.title}</h4>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                <span className="rounded-full bg-gray-50 px-2 py-0.5">负责人：{objective.owner}</span>
                                <span className="rounded-full bg-gray-50 px-2 py-0.5">进度：{objective.progress}%</span>
                                <span className="rounded-full bg-gray-50 px-2 py-0.5">总分：{objective.score}</span>
                              </div>
                            </div>
                          </div>
                          <div className="mb-3 rounded-lg bg-gray-50 p-3">
                            <p className="mb-2 text-xs font-semibold text-gray-500">相关关键结果</p>
                            <div className="space-y-1.5">
                              {objective.keyResults.map(result => (
                                <div key={result.title} className="flex items-start gap-2 text-xs leading-5 text-gray-600">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-500" />
                                  <span>{result.title} <span className="text-pink-700">@{result.owner}</span></span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid gap-3 xl:grid-cols-2">
                            <div className="rounded-lg border border-gray-100 p-3">
                              <div className="mb-2 text-sm font-semibold text-gray-800">本周工作总结</div>
                              <p className="text-sm leading-6 text-gray-600">{reportContent.thisWeek}</p>
                            </div>
                            <div className="rounded-lg border border-gray-100 p-3">
                              <div className="mb-2 text-sm font-semibold text-gray-800">下周工作计划</div>
                              <p className="text-sm leading-6 text-gray-600">{reportContent.nextWeek}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <aside className="flex min-h-0 flex-col border-l border-gray-100 bg-gray-50/70">
                <div className="border-b border-gray-100 p-4">
                  <h4 className="font-bold text-gray-900">汇报流转</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-white p-3">
                      <div className="text-xs text-gray-400">汇报对象</div>
                      <div className="mt-1 font-semibold text-gray-800">{selectedReport.reportTo.join('、')}</div>
                    </div>
                    <div className="rounded-lg bg-white p-3">
                      <div className="text-xs text-gray-400">抄送对象</div>
                      <div className="mt-1 font-semibold text-gray-800">{selectedReport.copyTo.join('、') || '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-100 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">已读情况</h4>
                    <span className="text-xs text-gray-500">{selectedReport.readReceipts.filter(item => item.read).length}/{selectedReport.readReceipts.length}</span>
                  </div>
                  <div className="space-y-2">
                    {selectedReport.readReceipts.map(item => (
                      <div key={item.name} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className={item.read ? 'text-emerald-600' : 'text-red-500'}>{item.read ? `已读 ${item.time}` : '未读'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-bold text-gray-900">评论</h4>
                    <span className="text-xs text-gray-500">{(commentsByReport[selectedReport.id] || []).length} 条</span>
                  </div>
                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-hover">
                    {(commentsByReport[selectedReport.id] || []).map((comment, index) => (
                      <div key={`${comment.author}-${comment.time}-${index}`} className="rounded-xl bg-white p-3 shadow-sm">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-900">{comment.author}</span>
                          <span className="text-xs text-gray-400">{comment.time}</span>
                        </div>
                        <p className="text-sm leading-6 text-gray-600">{comment.content}</p>
                      </div>
                    ))}
                    {(commentsByReport[selectedReport.id] || []).length === 0 && (
                      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-3 py-8 text-center text-sm text-gray-400">暂无评论</div>
                    )}
                  </div>
                  <div className="mt-3 rounded-xl border border-gray-200 bg-white p-3">
                    <textarea
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value.slice(0, 300))}
                      placeholder="输入评论，支持补充建议或确认反馈"
                      className="h-20 w-full resize-none text-sm leading-6 outline-none placeholder:text-gray-400"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-400">{commentDraft.length}/300</span>
                      <button onClick={addComment} className="inline-flex items-center gap-1.5 rounded-lg bg-pink-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-800">
                        <Send size={13} />
                        发送评论
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[130px_minmax(0,1fr)]">
      <label className="pt-2 text-sm font-semibold text-gray-800">
        {required && <span className="mr-1 text-red-500">*</span>}
        {label}：
      </label>
      <div>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, 800))}
          placeholder={placeholder}
          className="min-h-[112px] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
        />
        <div className="mt-1 text-right text-xs text-gray-400">{value.length} / 800</div>
      </div>
    </div>
  );
}

function ReportInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-[130px_minmax(0,1fr)]">
      <label className="pt-2 text-sm font-semibold text-gray-800">
        {required && <span className="mr-1 text-red-500">*</span>}
        {label}：
      </label>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
      />
    </div>
  );
}

function MetricCard({ title, value, desc, color }: { title: string; value: string; desc: string; color: 'pink' | 'blue' | 'green' }) {
  const styles = {
    pink: 'from-pink-50 to-white text-pink-700',
    blue: 'from-pink-50 to-white text-pink-800',
    green: 'from-emerald-50 to-white text-emerald-700',
  };
  return (
    <div className={`rounded-2xl border border-gray-100 bg-gradient-to-br ${styles[color]} p-5 shadow-sm`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-600">{title}</p>
        <BarChart3 size={18} />
      </div>
      <p className="mt-4 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function MetricRing({ label, value, progress }: { label?: string; value: string; progress: number }) {
  return (
    <div>
      {label && <p className="text-xs text-gray-400">{label}</p>}
      <div className="mt-1 inline-flex items-center gap-2">
        <span
          className="h-4 w-4 rounded-full"
          style={{ background: `conic-gradient(#4f6fed ${progress * 3.6}deg, #e5e7eb 0deg)` }}
        />
        <span className="font-semibold text-gray-700">{value}</span>
      </div>
    </div>
  );
}
