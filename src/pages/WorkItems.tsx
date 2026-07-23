import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  MessageSquareText,
  Plus,
  Search,
  Send,
  Target,
  Users,
} from 'lucide-react';
import { MAIN_USER_NAME } from '../data/people';
import { WorkItem, WorkItemTask, WorkItemType, workItems, workItemStatuses, workItemTypes } from '../data/workItems';

type WorkItemTab = 'overview' | 'tasks' | 'reports' | 'timeline';
type WorkItemFilter = '全部事项' | '我负责' | '我参与' | '待填报' | '风险';

type CreateDraft = {
  title: string;
  description: string;
  type: WorkItemType;
  owner: string;
  members: string;
  deadline: string;
};

type ReportDraft = {
  thisPeriod: string;
  nextPlan: string;
  risk: string;
  progress: number;
};

type TaskDraft = {
  title: string;
  owner: string;
  due: string;
};

const statusTone: Record<string, string> = {
  推进中: 'bg-blue-50 text-blue-700 border-blue-100',
  风险中: 'bg-red-50 text-red-700 border-red-100',
  待填报: 'bg-amber-50 text-amber-700 border-amber-100',
  已完成: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

const riskTone: Record<string, string> = {
  正常: 'bg-emerald-50 text-emerald-700',
  关注: 'bg-amber-50 text-amber-700',
  风险: 'bg-red-50 text-red-700',
};

export default function WorkItems({ embedded = false }: { embedded?: boolean } = {}) {
  const [itemList, setItemList] = useState<WorkItem[]>(workItems);
  const [filter, setFilter] = useState<WorkItemFilter>('全部事项');
  const [keyword, setKeyword] = useState('');
  const [typeFilter, setTypeFilter] = useState('全部类型');
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [selectedId, setSelectedId] = useState(workItems[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState<WorkItemTab>('overview');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [toast, setToast] = useState('');
  const [createDraft, setCreateDraft] = useState<CreateDraft>({
    title: '',
    description: '',
    type: '专项推进',
    owner: MAIN_USER_NAME,
    members: '',
    deadline: '',
  });
  const [reportDraft, setReportDraft] = useState<ReportDraft>({
    thisPeriod: '',
    nextPlan: '',
    risk: '',
    progress: 70,
  });
  const [taskDraft, setTaskDraft] = useState<TaskDraft>({
    title: '',
    owner: MAIN_USER_NAME,
    due: '',
  });

  const filteredItems = useMemo(() => {
    const word = keyword.trim();
    return itemList.filter(item => {
      const matchesKeyword = !word || item.title.includes(word) || item.description.includes(word) || item.owner.includes(word) || item.members.some(member => member.includes(word));
      const matchesType = typeFilter === '全部类型' || item.type === typeFilter;
      const matchesStatus = statusFilter === '全部状态' || item.status === statusFilter;
      const matchesFilter =
        filter === '全部事项' ||
        (filter === '我负责' && item.owner === MAIN_USER_NAME) ||
        (filter === '我参与' && item.members.includes(MAIN_USER_NAME)) ||
        (filter === '待填报' && item.status === '待填报') ||
        (filter === '风险' && item.riskLevel === '风险');
      return matchesKeyword && matchesType && matchesStatus && matchesFilter;
    });
  }, [filter, itemList, keyword, statusFilter, typeFilter]);

  const selectedItem = itemList.find(item => item.id === selectedId) || filteredItems[0] || itemList[0];
  const pendingTaskCount = itemList.flatMap(item => item.tasks).filter(task => task.owner === MAIN_USER_NAME && task.status !== '已完成').length;
  const pendingReportCount = itemList.filter(item => item.members.includes(MAIN_USER_NAME) && item.status === '待填报').length;
  const riskCount = itemList.filter(item => item.riskLevel === '风险').length;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1800);
  };

  const resetCreateDraft = () => {
    setCreateDraft({
      title: '',
      description: '',
      type: '专项推进',
      owner: MAIN_USER_NAME,
      members: '',
      deadline: '',
    });
  };

  const handleCreateItem = () => {
    const title = createDraft.title.trim();
    if (!title) {
      showToast('请先填写事项名称');
      return;
    }

    const owner = createDraft.owner.trim() || MAIN_USER_NAME;
    const members = Array.from(new Set([
      owner,
      ...createDraft.members.split(/[，,]/).map(member => member.trim()).filter(Boolean),
    ]));
    const now = new Date();
    const time = now.toLocaleString('zh-CN', { hour12: false });
    const nextItem: WorkItem = {
      id: `wi-local-${now.getTime()}`,
      title,
      type: createDraft.type,
      status: '推进中',
      owner,
      members,
      deadline: createDraft.deadline.trim() || '待确定',
      progress: 5,
      riskLevel: '正常',
      description: createDraft.description.trim() || '新建事项，等待补充事项背景、任务拆解和协同成员。',
      latestReport: '事项已创建，等待首次进度填报。',
      tasks: [],
      reports: [],
      timeline: [
        {
          id: `time-${now.getTime()}`,
          actor: MAIN_USER_NAME,
          action: '创建事项',
          time,
        },
      ],
    };

    setItemList(current => [nextItem, ...current]);
    setSelectedId(nextItem.id);
    setActiveTab('overview');
    setShowCreateDialog(false);
    resetCreateDraft();
    showToast('事项已创建');
  };

  const handleSubmitReport = () => {
    if (!selectedItem) return;
    const thisPeriod = reportDraft.thisPeriod.trim();
    if (!thisPeriod) {
      showToast('请填写本阶段完成事项');
      return;
    }

    const now = new Date();
    const submittedAt = now.toLocaleString('zh-CN', { hour12: false });
    const riskText = reportDraft.risk.trim();
    const hasRisk = Boolean(riskText && riskText !== '暂无');
    setItemList(current => current.map(item => {
      if (item.id !== selectedItem.id) return item;
      return {
        ...item,
        progress: reportDraft.progress,
        status: hasRisk ? '风险中' : reportDraft.progress >= 100 ? '已完成' : '推进中',
        riskLevel: hasRisk ? '关注' : item.riskLevel === '风险' ? '关注' : '正常',
        latestReport: thisPeriod,
        reports: [
          {
            id: `report-${now.getTime()}`,
            member: MAIN_USER_NAME,
            submittedAt,
            thisPeriod,
            nextPlan: reportDraft.nextPlan.trim() || '待补充',
            risk: riskText || '暂无',
          },
          ...item.reports,
        ],
        timeline: [
          {
            id: `time-${now.getTime()}`,
            actor: MAIN_USER_NAME,
            action: `提交事项进度至 ${reportDraft.progress}%`,
            time: submittedAt,
          },
          ...item.timeline,
        ],
      };
    }));
    setShowReportDialog(false);
    setReportDraft({ thisPeriod: '', nextPlan: '', risk: '', progress: Math.max(selectedItem.progress, 70) });
    setActiveTab('reports');
    showToast('事项进度已提交');
  };

  const handleCreateTask = () => {
    if (!selectedItem) return;
    const title = taskDraft.title.trim();
    if (!title) {
      showToast('请填写任务名称');
      return;
    }

    const now = new Date();
    const owner = taskDraft.owner.trim() || MAIN_USER_NAME;
    const nextTask: WorkItemTask = {
      id: `task-${now.getTime()}`,
      title,
      owner,
      due: taskDraft.due.trim() || '待确定',
      status: '未开始',
      progress: 0,
    };
    setItemList(current => current.map(item => {
      if (item.id !== selectedItem.id) return item;
      return {
        ...item,
        tasks: [nextTask, ...item.tasks],
        timeline: [
          {
            id: `time-task-${now.getTime()}`,
            actor: MAIN_USER_NAME,
            action: `指派任务“${title}”给 ${owner}`,
            time: now.toLocaleString('zh-CN', { hour12: false }),
          },
          ...item.timeline,
        ],
      };
    }));
    setShowTaskDialog(false);
    setTaskDraft({ title: '', owner: MAIN_USER_NAME, due: '' });
    setActiveTab('tasks');
    showToast('任务已指派');
  };

  return (
    <div className={`${embedded ? 'bg-gradient-to-br from-gray-50 via-pink-50/50 to-white min-h-screen' : 'min-h-full bg-gray-50'} text-gray-900`}>
      {embedded && (
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-700 to-pink-900 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-700/20">
                  <ClipboardList size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">事项协同</h1>
                  <p className="text-sm text-gray-500">一事一组，任务推进，进度沉淀，成果汇总</p>
                </div>
              </div>
              <button onClick={() => setShowCreateDialog(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 shadow-sm transition-all hover:border-pink-200 hover:bg-pink-50 hover:text-pink-800">
                <Plus size={18} className="text-gray-500" />
                新建事项
              </button>
            </div>
          </div>
        </div>
      )}
      {!embedded && <div className="sticky top-0 z-20 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-700 text-white shadow-sm shadow-pink-200">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-950">事项协同</h1>
                  <p className="text-sm text-gray-500">一事一组，任务推进，进度沉淀，成果汇总</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreateDialog(true)} className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-pink-100 hover:bg-pink-800">
                <Plus size={16} />
                新建事项
              </button>
            </div>
          </div>
        </div>
      </div>}

      <main className={embedded ? 'max-w-7xl mx-auto px-6 py-8' : 'mx-auto max-w-7xl px-5 py-5'}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<Users size={18} />} label="我负责" value={`${itemList.filter(item => item.owner === MAIN_USER_NAME).length} 项`} tone="pink" />
          <MetricCard icon={<ClipboardList size={18} />} label="我参与" value={`${itemList.filter(item => item.members.includes(MAIN_USER_NAME)).length} 项`} tone="blue" />
          <MetricCard icon={<Send size={18} />} label="待我处理" value={`${pendingTaskCount + pendingReportCount} 项`} tone="amber" />
          <MetricCard icon={<AlertTriangle size={18} />} label="风险事项" value={`${riskCount} 项`} tone="red" />
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {(['全部事项', '我负责', '我参与', '待填报', '风险'] as WorkItemFilter[]).map(item => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${filter === item ? 'bg-pink-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-700'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-3 lg:w-[620px]">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="搜索事项、成员" className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-50" />
              </div>
              <select value={typeFilter} onChange={event => setTypeFilter(event.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-50">
                <option>全部类型</option>
                {workItemTypes.map(type => <option key={type}>{type}</option>)}
              </select>
              <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-50">
                <option>全部状态</option>
                {workItemStatuses.map(status => <option key={status}>{status}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[430px_minmax(0,1fr)]">
          <section className="space-y-3">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  setActiveTab('overview');
                }}
                className={`w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-all ${selectedItem.id === item.id ? 'border-pink-200 ring-2 ring-pink-50' : 'border-gray-100 hover:border-pink-100 hover:shadow-md'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">{item.type}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusTone[item.status]}`}>{item.status}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${riskTone[item.riskLevel]}`}>{item.riskLevel}</span>
                    </div>
                    <h2 className="truncate text-base font-bold text-gray-950">{item.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">{item.latestReport}</p>
                  </div>
                  <ChevronRight size={18} className="mt-1 shrink-0 text-gray-300" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-4 text-xs text-gray-500">
                  <span>负责人：{item.owner}</span>
                  <span>截止：{item.deadline}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-pink-700" style={{ width: `${item.progress}%` }} />
                </div>
              </button>
            ))}
          </section>

          {selectedItem && (
            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-semibold text-pink-700">{selectedItem.type}</span>
                      {selectedItem.okrLink && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{selectedItem.okrLink}</span>}
                    </div>
                    <h2 className="text-xl font-bold text-gray-950">{selectedItem.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">{selectedItem.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowReportDialog(true)} className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-3 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                      <Send size={15} />
                      提交进度
                    </button>
                    <button onClick={() => setShowTaskDialog(true)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 hover:border-pink-200 hover:text-pink-700">
                      指派任务
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {([
                    ['overview', '事项概览'],
                    ['tasks', '任务清单'],
                    ['reports', '进度填报'],
                    ['timeline', '动态记录'],
                  ] as [WorkItemTab, string][]).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${activeTab === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-700'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5">
                {activeTab === 'overview' && <Overview item={selectedItem} />}
                {activeTab === 'tasks' && <TaskList item={selectedItem} />}
                {activeTab === 'reports' && <ReportList item={selectedItem} />}
                {activeTab === 'timeline' && <Timeline item={selectedItem} />}
              </div>
            </section>
          )}
        </div>
      </main>

      {showCreateDialog && (
        <SimpleDialog title="新建事项" onClose={() => setShowCreateDialog(false)} onConfirm={handleCreateItem}>
          <div className="grid gap-3">
            <input value={createDraft.title} onChange={event => setCreateDraft(current => ({ ...current, title: event.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-pink-300" placeholder="事项名称" />
            <textarea value={createDraft.description} onChange={event => setCreateDraft(current => ({ ...current, description: event.target.value }))} className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-300" placeholder="事项背景和目标" />
            <div className="grid gap-3 sm:grid-cols-2">
              <select value={createDraft.type} onChange={event => setCreateDraft(current => ({ ...current, type: event.target.value as WorkItemType }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none">
                {workItemTypes.map(type => <option key={type}>{type}</option>)}
              </select>
              <input value={createDraft.owner} onChange={event => setCreateDraft(current => ({ ...current, owner: event.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none" placeholder="负责人" />
            </div>
            <input value={createDraft.members} onChange={event => setCreateDraft(current => ({ ...current, members: event.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none" placeholder="参与人，多个姓名用逗号分隔" />
            <input value={createDraft.deadline} onChange={event => setCreateDraft(current => ({ ...current, deadline: event.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none" placeholder="截止时间，如 2026-08-15" />
          </div>
        </SimpleDialog>
      )}

      {showReportDialog && selectedItem && (
        <SimpleDialog title="提交事项进度" onClose={() => setShowReportDialog(false)} onConfirm={handleSubmitReport}>
          <div className="grid gap-3">
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">当前事项：{selectedItem.title}</div>
            <textarea value={reportDraft.thisPeriod} onChange={event => setReportDraft(current => ({ ...current, thisPeriod: event.target.value }))} className="min-h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-300" placeholder="本阶段完成事项" />
            <textarea value={reportDraft.nextPlan} onChange={event => setReportDraft(current => ({ ...current, nextPlan: event.target.value }))} className="min-h-20 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-300" placeholder="下阶段计划" />
            <textarea value={reportDraft.risk} onChange={event => setReportDraft(current => ({ ...current, risk: event.target.value }))} className="min-h-16 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-pink-300" placeholder="风险和需协调事项" />
            <label className="grid gap-2 text-sm text-gray-600">
              <span>当前进度：{reportDraft.progress}%</span>
              <input type="range" min="0" max="100" value={reportDraft.progress} onChange={event => setReportDraft(current => ({ ...current, progress: Number(event.target.value) }))} className="accent-pink-700" />
            </label>
          </div>
        </SimpleDialog>
      )}

      {showTaskDialog && selectedItem && (
        <SimpleDialog title="指派任务" onClose={() => setShowTaskDialog(false)} onConfirm={handleCreateTask}>
          <div className="grid gap-3">
            <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">当前事项：{selectedItem.title}</div>
            <input value={taskDraft.title} onChange={event => setTaskDraft(current => ({ ...current, title: event.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-pink-300" placeholder="任务名称" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={taskDraft.owner} onChange={event => setTaskDraft(current => ({ ...current, owner: event.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-pink-300" placeholder="负责人" />
              <input value={taskDraft.due} onChange={event => setTaskDraft(current => ({ ...current, due: event.target.value }))} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-pink-300" placeholder="截止时间" />
            </div>
          </div>
        </SimpleDialog>
      )}

      {toast && <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>}
    </div>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'pink' | 'blue' | 'amber' | 'red' }) {
  const tones = {
    pink: 'bg-pink-50 text-pink-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Overview({ item }: { item: WorkItem }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-xl border border-gray-100 p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-900">事项信息</h3>
        <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
          <Info label="负责人" value={item.owner} />
          <Info label="截止时间" value={item.deadline} />
          <Info label="成员" value={item.members.join('、')} />
          <Info label="当前状态" value={`${item.status} · ${item.progress}%`} />
        </div>
        <div className="mt-4 rounded-xl bg-gray-50 p-3 text-sm leading-6 text-gray-600">
          {item.latestReport}
        </div>
      </div>
      <div className="rounded-xl border border-gray-100 p-4">
        <h3 className="mb-3 text-sm font-bold text-gray-900">成果汇总</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-2"><Target size={16} className="mt-0.5 text-pink-700" /><span>{item.okrLink || '未关联 OKR，仍可独立推进事项。'}</span></div>
          <div className="flex gap-2"><BarChart3 size={16} className="mt-0.5 text-pink-700" /><span>任务完成率 {Math.round(item.tasks.reduce((sum, task) => sum + task.progress, 0) / item.tasks.length)}%，汇报 {item.reports.length} 条。</span></div>
          <div className="flex gap-2"><FileText size={16} className="mt-0.5 text-pink-700" /><span>可由如意工作参谋读取事项、任务和汇报生成阶段总结。</span></div>
        </div>
      </div>
    </div>
  );
}

function TaskList({ item }: { item: WorkItem }) {
  return (
    <div className="space-y-3">
      {item.tasks.map(task => (
        <div key={task.id} className="rounded-xl border border-gray-100 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">{task.title}</h3>
              <p className="mt-1 text-xs text-gray-500">负责人：{task.owner} · 截止：{task.due}</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">{task.status}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-pink-700" style={{ width: `${task.progress}%` }} /></div>
            <span className="text-xs font-semibold text-gray-700">{task.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReportList({ item }: { item: WorkItem }) {
  return (
    <div className="space-y-3">
      {item.reports.map(report => (
        <div key={report.id} className="rounded-xl border border-gray-100 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-900"><MessageSquareText size={16} className="text-pink-700" />{report.member}</div>
            <span className="text-xs text-gray-400">{report.submittedAt}</span>
          </div>
          <div className="mt-3 grid gap-3 text-sm text-gray-600 lg:grid-cols-3">
            <Info label="本阶段" value={report.thisPeriod} />
            <Info label="下阶段" value={report.nextPlan} />
            <Info label="风险" value={report.risk} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Timeline({ item }: { item: WorkItem }) {
  return (
    <div className="space-y-3">
      {item.timeline.map(entry => (
        <div key={entry.id} className="flex gap-3 rounded-xl border border-gray-100 p-4">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-700"><CheckCircle2 size={16} /></div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{entry.action}</p>
            <p className="mt-1 text-xs text-gray-500">{entry.actor} · {entry.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-sm leading-6 text-gray-700">{value}</p>
    </div>
  );
}

function SimpleDialog({ title, children, onClose, onConfirm }: { title: string; children: React.ReactNode; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">关闭</button>
        </div>
        <div className="p-5">{children}</div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
          <button onClick={onConfirm} className="rounded-lg bg-pink-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-800">确定</button>
        </div>
      </div>
    </div>
  );
}
