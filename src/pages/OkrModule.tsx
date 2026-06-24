import type { DragEvent } from 'react';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  FileText,
  BarChart3,
  Bot,
  Target,
  GripVertical,
  MoreHorizontal,
  Plus,
  Search,
  CircleX,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type KeyResult = {
  id: string;
  title: string;
  progress: number;
  weight: string;
  score: string;
  latestReport: string;
};

type AlignmentTarget = {
  id: string;
  person: string;
  department: string;
  period: string;
  title: string;
};

type Objective = {
  id: string;
  code: string;
  title: string;
  progress: number;
  score: string;
  weight: string;
  recordCount: number;
  date: string;
  note: string;
  alignments: AlignmentTarget[];
  keyResults: KeyResult[];
};

const people = ['梁吉利', '肖八', '郑八', '沈十六', '袁十一', '刘十', '赵六'];
const alignmentUsers = [
  { name: '梁小劫', department: '市场部', period: '2026 年 4 月 - 6 月', objective: '提升市场协同效率，完成重点航线营销活动转化' },
  { name: '梁吉利', department: '信息管理部', period: '2026 年 4 月 - 6 月', objective: '推进管理域数字化需求承接、研发与交付' },
  { name: '梁小明', department: '运行控制部', period: '2026 年 4 月 - 6 月', objective: '完善运行保障流程，提升跨部门协同响应效率' },
  { name: '肖八', department: '产品部', period: '2026 年 4 月 - 6 月', objective: '完成产品体验优化与业务试点支持' },
];
const metricColumns = '72px 72px 72px 72px';

const baseObjectives: Objective[] = [
  {
    id: 'o1',
    code: '01',
    title: '按项目清单计划完成管理域一季度数字化需求任务承接、需求开发以及项目交付',
    progress: 0,
    score: '0.0',
    weight: '100%',
    recordCount: 0,
    date: '06-22',
    note: '填写备注，让大家更了解你的 OKR',
    keyResults: [
      {
        id: 'o1-kr1',
        title: '协助开展安全质量标准管理系统、RPA项目、致远航线预测优化项目、睿航训练数据管理系统、综合管理后台（小时费）、CSA系统的调研工作，完成六个项目的分析，协助完成并输出相关IT解决方案和业务需求说明书，最终通过完成方案的专业评审和立项汇报',
        progress: 17,
        weight: '17.0%',
        score: '0.0',
        latestReport: '本周已完成 RPA 项目需求口径确认，CSA 系统调研材料进入评审准备。',
      },
      {
        id: 'o1-kr2',
        title: '带领产品与研发团队完善人力域小时费部分的优化和设计工作，根据业务需求与整体设计优化产品功能；做好资源分配及监督工作，推进研发效率和质量管理，严控项目推进过程，确保项目里程碑达成率；同时识别相关项目风险，并制定风险应对策略；按计划第一季度完成整体系统开发工作，进入提测阶段',
        progress: 83,
        weight: '83.0%',
        score: '0.0',
        latestReport: '本周完成小时费功能评审，已识别 2 项联调风险并同步责任人。',
      },
    ],
  },
  {
    id: 'o2',
    code: '02',
    title: '推进核心系统财务管理平台及周边系统的实施上线，车辆系统硬件加固和验收工作',
    progress: 0,
    score: '0.0',
    weight: '100%',
    recordCount: 0,
    date: '06-22',
    note: '填写备注，让大家更了解你的 OKR',
    keyResults: [
      {
        id: 'o2-kr1',
        title: '完成公司34家法人单位的BIP方案在测试环境的操作和验证工作',
        progress: 50,
        weight: '50.0%',
        score: '0.0',
        latestReport: '本周完成 18 家法人单位测试验证，发现权限配置问题 3 项。',
      },
      {
        id: 'o2-kr2',
        title: '根据详细设计方案推进BIP的实施全面实施落地工作，完成基础及相关配置',
        progress: 50,
        weight: '50.0%',
        score: '0.0',
        latestReport: '本周完成基础配置清单梳理，下周进入批量配置校验。',
      },
    ],
  },
];

const cloneObjectivesForPerson = (name: string) => baseObjectives.map((objective, objectiveIndex) => ({
  ...objective,
  alignments: objective.alignments || [],
  id: `${name}-${objective.id}`,
  code: String(objectiveIndex + 1).padStart(2, '0'),
  title: name === '梁吉利' ? objective.title : `${name}：${objective.title}`,
  progress: name === '梁吉利' ? objective.progress : Math.min(96, 42 + objectiveIndex * 18 + name.length * 3),
  score: name === '梁吉利' ? objective.score : (0.4 + objectiveIndex * 0.2).toFixed(1),
  recordCount: name === '梁吉利' ? objective.recordCount : objectiveIndex + 1,
  keyResults: objective.keyResults.map((result, resultIndex) => ({
    ...result,
    id: `${name}-${result.id}`,
    progress: name === '梁吉利' ? result.progress : Math.min(100, result.progress + resultIndex * 6 + name.length),
    latestReport: name === '梁吉利' ? result.latestReport : `${name}本周已更新该 KR 进展，下一步将继续跟进关键阻塞。`,
  })),
}));

const resequenceObjectives = (items: Objective[]) => items.map((item, index) => ({ ...item, code: String(index + 1).padStart(2, '0') }));
const reorder = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
};

export default function OkrModule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activePerson, setActivePerson] = useState('梁吉利');
  const [objectives, setObjectives] = useState<Objective[]>(() => cloneObjectivesForPerson('梁吉利'));
  const [selectedObjectiveId, setSelectedObjectiveId] = useState(searchParams.get('objective') || objectives[0].id);
  const [editingObjectiveId, setEditingObjectiveId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importChecked, setImportChecked] = useState<Record<string, boolean>>({ o1: true, o2: true });
  const [draggingKrId, setDraggingKrId] = useState<string | null>(null);
  const [alignmentPanelId, setAlignmentPanelId] = useState<string | null>(null);
  const [alignmentQuery, setAlignmentQuery] = useState('');
  const [alignmentUserName, setAlignmentUserName] = useState('');
  const [alignmentObjectiveId, setAlignmentObjectiveId] = useState('');
  const [activeView, setActiveView] = useState<'list' | 'stats'>('list');
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    const objectiveFromUrl = searchParams.get('objective');
    if (objectiveFromUrl && objectives.some(objective => objective.id === objectiveFromUrl)) {
      setSelectedObjectiveId(objectiveFromUrl);
    }
  }, [searchParams, objectives]);


  const switchPerson = (name: string) => {
    const nextObjectives = cloneObjectivesForPerson(name);
    setActivePerson(name);
    setObjectives(nextObjectives);
    setSelectedObjectiveId(nextObjectives[0].id);
    setEditingObjectiveId(null);
  };

  const updateObjective = (id: string, patch: Partial<Objective>) => {
    setObjectives(current => current.map(item => (item.id === id ? { ...item, ...patch } : item)));
  };

  const updateKeyResult = (objectiveId: string, krId: string, patch: Partial<KeyResult>) => {
    setObjectives(current => current.map(objective => (
      objective.id !== objectiveId
        ? objective
        : { ...objective, keyResults: objective.keyResults.map(result => (result.id === krId ? { ...result, ...patch } : result)) }
    )));
  };

  const addObjective = () => {
    const nextIndex = objectives.length + 1;
    const now = Date.now();
    const nextObjective: Objective = {
      id: `${activePerson}-o${now}`,
      code: String(nextIndex).padStart(2, '0'),
      title: '添加 Objective：目标要与上下级、配合团队对齐，避免各自为政',
      progress: 0,
      score: '0.0',
      weight: '100%',
      recordCount: 0,
      date: '06-23',
      note: '填写备注，让大家更了解你的 OKR',
      keyResults: [{ id: `${activePerson}-o${now}-kr1`, title: '添加 Key Result：请填写可衡量的关键结果', progress: 0, weight: '100%', score: '0.0', latestReport: '' }],
    };
    setObjectives(current => [...current, nextObjective]);
    setSelectedObjectiveId(nextObjective.id);
    setEditingObjectiveId(nextObjective.id);
  };

  const removeObjective = (id: string) => {
    setObjectives(current => resequenceObjectives(current.length === 1 ? current : current.filter(item => item.id !== id)));
    if (selectedObjectiveId === id) {
      setSelectedObjectiveId(objectives.find(item => item.id !== id)?.id || objectives[0].id);
    }
  };

  const addKeyResult = (objectiveId: string) => {
    setObjectives(current => current.map(objective => {
      if (objective.id !== objectiveId) return objective;
      const nextIndex = objective.keyResults.length + 1;
      return {
        ...objective,
        keyResults: [...objective.keyResults, { id: `${objectiveId}-kr${Date.now()}`, title: '添加 Key Result：请填写可衡量的关键结果', progress: 0, weight: `${Math.round(100 / Math.max(nextIndex, 1))}.0%`, score: '0.0', latestReport: '' }],
      };
    }));
  };

  const removeKeyResult = (objectiveId: string, krId: string) => {
    setObjectives(current => current.map(objective => (
      objective.id !== objectiveId || objective.keyResults.length === 1 ? objective : { ...objective, keyResults: objective.keyResults.filter(result => result.id !== krId) }
    )));
  };


  const openAlignmentPanel = (objectiveId: string) => {
    setSelectedObjectiveId(objectiveId);
    setAlignmentPanelId(current => current === objectiveId ? null : objectiveId);
    setAlignmentQuery('');
    setAlignmentUserName('');
    setAlignmentObjectiveId('');
  };

  const addAlignment = (objectiveId: string) => {
    const user = alignmentUsers.find(item => item.name === alignmentUserName);
    const targetObjective = alignmentUserName ? cloneObjectivesForPerson(alignmentUserName).find(item => item.id === alignmentObjectiveId) : null;
    if (!user || !targetObjective) return;
    const target: AlignmentTarget = {
      id: `${user.name}-${targetObjective.id}-${Date.now()}`,
      person: user.name,
      department: user.department,
      period: user.period,
      title: targetObjective.title,
    };
    setObjectives(current => current.map(objective => (
      objective.id === objectiveId ? { ...objective, alignments: [...(objective.alignments || []), target] } : objective
    )));
    setAlignmentPanelId(null);
    setAlignmentQuery('');
    setAlignmentUserName('');
    setAlignmentObjectiveId('');
  };

  const filteredAlignmentUsers = alignmentUsers.filter(user => !alignmentQuery.trim() || user.name.includes(alignmentQuery.trim()));
  const selectedAlignmentUser = alignmentUsers.find(user => user.name === alignmentUserName);
  const selectedAlignmentObjectives = alignmentUserName ? cloneObjectivesForPerson(alignmentUserName) : [];

  const moveKeyResult = (objectiveId: string, targetKrId: string) => {
    if (!draggingKrId || draggingKrId === targetKrId) return;
    setObjectives(current => current.map(objective => {
      if (objective.id !== objectiveId) return objective;
      const fromIndex = objective.keyResults.findIndex(item => item.id === draggingKrId);
      const toIndex = objective.keyResults.findIndex(item => item.id === targetKrId);
      if (fromIndex < 0 || toIndex < 0) return objective;
      return { ...objective, keyResults: reorder(objective.keyResults, fromIndex, toIndex) };
    }));
  };

  const applyImport = () => {
    const importing = baseObjectives.filter(item => importChecked[item.id]);
    const existingTitles = new Set(objectives.map(item => item.title));
    const nextItems = importing
      .filter(item => !existingTitles.has(item.title))
      .map((item, index) => ({ ...item, id: `${activePerson}-import-${item.id}-${Date.now()}-${index}`, code: String(objectives.length + index + 1).padStart(2, '0') }));
    if (nextItems.length) setObjectives(current => [...current, ...nextItems]);
    setShowImportModal(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f4f6f9] text-gray-900">
      <div className="z-40 shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1680px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/enterprise')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-pink-200 hover:bg-pink-50 hover:text-pink-800" title="返回个人门户">
              <ArrowLeft size={18} />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-700 text-white shadow-sm shadow-pink-700/20">
              <Target size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">OKR</h1>
              <p className="text-xs text-gray-500">目标与关键结果管理 · 2026 年 4 月 - 6 月</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"><ChevronLeft size={17} /></button>
            <button className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-800">2026 年 7 月 - 9 月</button>
            <button className="rounded-lg border border-pink-200 bg-pink-50 px-5 py-2 text-sm font-semibold text-pink-800">2026 年 4 月 - 6 月</button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"><ChevronRight size={17} /></button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"><MoreHorizontal size={17} /></button>
          </div>
        </div>
      </div>

      <div className="mx-auto min-h-0 w-full max-w-[1680px] flex-1 px-5 py-5">
        <div className="grid h-full min-h-0 grid-cols-1 gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="h-full overflow-hidden rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="h-10 w-full rounded-lg bg-gray-50 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-pink-100" placeholder="搜索员工" />
            </div>
            <h3 className="mb-3 text-sm font-semibold text-gray-500">我的 OKR</h3>
            <PersonButton name="梁吉利" active={activePerson === '梁吉利'} onClick={() => switchPerson('梁吉利')} />
            <h3 className="mb-3 mt-4 text-sm font-semibold text-gray-500">直属下级</h3>
            <div className="space-y-1">
              {people.filter(name => name !== '梁吉利').map(name => (
                <PersonButton key={name} name={name} active={activePerson === name} onClick={() => switchPerson(name)} compact />
              ))}
            </div>
          </aside>

          <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">
            <div className="z-30 shrink-0 rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
                <div className="inline-flex rounded-lg bg-gray-100 p-1">
                  <button onClick={() => setActiveView('list')} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${activeView === 'list' ? 'bg-white text-pink-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                    <FileText size={15} />
                    OKR列表
                  </button>
                  <button onClick={() => setActiveView('stats')} className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition ${activeView === 'stats' ? 'bg-white text-pink-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                    <BarChart3 size={15} />
                    统计视图
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activeView === 'list' ? (
                    <>
                      <button onClick={addObjective} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                        <Plus size={15} />
                        添加 Objective
                      </button>
                      <button onClick={() => setShowImportModal(true)} className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-3 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                        <Download size={15} />
                        从其他周期导入
                      </button>
                    </>
                  ) : (
                    <button className="inline-flex items-center gap-2 rounded-lg bg-pink-700 px-3 py-2 text-sm font-semibold text-white hover:bg-pink-800">
                      <Download size={15} />
                      导出
                    </button>
                  )}
                </div>
              </div>
              {activeView === 'list' && (
              <div className="grid items-center gap-3 px-5 py-2 text-center text-xs font-semibold text-gray-500" style={{ gridTemplateColumns: `minmax(420px, 1fr) ${metricColumns}` }}>
                  <span className="text-left">目标 / 关键结果</span>
                <span>进度</span>
                <span>总分</span>
                <span>权重</span>
                <span>记录</span>
              </div>
              )}
            </div>

            {activeView === 'list' ? (
              <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-hover">
                {objectives.map(objective => {
              const isEditing = editingObjectiveId === objective.id;
              return (
                <section
                  key={objective.id}
                  onClick={() => setSelectedObjectiveId(objective.id)}
                  className={`group relative rounded-xl border bg-white shadow-sm transition ${selectedObjectiveId === objective.id ? 'border-pink-200 ring-2 ring-pink-100' : 'border-gray-100 hover:border-pink-100'}`}
                >
                  <div className="absolute left-0 top-0 h-full w-1 bg-pink-700" />
                  <div className="absolute right-4 top-3 z-20 flex gap-1 rounded-lg bg-white/95 p-1 opacity-0 shadow-sm ring-1 ring-gray-100 transition group-hover:opacity-100">
                    <button onClick={(event) => { event.stopPropagation(); setEditingObjectiveId(objective.id); }} className="rounded-md p-1.5 text-pink-700 hover:bg-pink-50" title="编辑"><Edit3 size={15} /></button>
                    <button onClick={(event) => { event.stopPropagation(); removeObjective(objective.id); }} className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600" title="删除"><Trash2 size={15} /></button>
                  </div>
                  <div className="grid items-start gap-3 border-b border-gray-100 px-5 py-4" style={{ gridTemplateColumns: `minmax(420px, 1fr) ${metricColumns}` }}>
                    <div className="min-w-0 pl-2">
                      <div className="relative mb-2 flex items-center gap-2 text-xs text-gray-400">
                        <span>{objective.date}</span>
                        <button
                          type="button"
                          onClick={(event) => { event.stopPropagation(); openAlignmentPanel(objective.id); }}
                          className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-gray-500 hover:bg-pink-50 hover:text-pink-800"
                        >
                          <Plus size={13} />
                          添加对齐
                        </button>
                        {isEditing && <span className="inline-flex items-center gap-1 text-pink-800"><GripVertical size={13} />拖动排序</span>}
                        {alignmentPanelId === objective.id && (
                          <div className="absolute left-11 top-7 z-40 w-[680px] overflow-hidden rounded-lg border border-gray-200 bg-white text-sm shadow-xl" onClick={(event) => event.stopPropagation()}>
                            <div className="flex h-14 items-center gap-3 border-b border-gray-100 px-4">
                              <Search size={18} className="text-gray-500" />
                              <input
                                autoFocus
                                value={alignmentQuery}
                                onChange={(event) => setAlignmentQuery(event.target.value)}
                                placeholder="搜索用户名称"
                                className="h-10 flex-1 text-base text-gray-900 outline-none placeholder:text-gray-400"
                              />
                              {alignmentQuery && (
                                <button onClick={() => setAlignmentQuery('')} className="text-gray-400 hover:text-gray-600" title="清空">
                                  <CircleX size={18} />
                                </button>
                              )}
                            </div>
                            <div className="grid max-h-[360px] grid-cols-[220px_minmax(0,1fr)]">
                              <div className="border-r border-gray-100 bg-gray-50/70 p-2">
                                <div className="px-2 pb-2 text-xs font-semibold text-gray-500">选择用户</div>
                                <div className="space-y-1 overflow-y-auto pr-1 scrollbar-hover" style={{ maxHeight: 310 }}>
                                  {filteredAlignmentUsers.map(user => (
                                    <button
                                      key={`${objective.id}-${user.name}`}
                                      type="button"
                                      onClick={() => {
                                        setAlignmentUserName(user.name);
                                        const firstObjective = cloneObjectivesForPerson(user.name)[0];
                                        setAlignmentObjectiveId(firstObjective?.id || '');
                                      }}
                                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${alignmentUserName === user.name ? 'bg-white text-pink-800 shadow-sm ring-1 ring-pink-100' : 'text-gray-700 hover:bg-white'}`}
                                    >
                                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-700 text-[11px] font-bold text-white">{user.name.slice(0, 1)}</span>
                                      <span className="min-w-0">
                                        <span className="block truncate font-semibold">{user.name}</span>
                                        <span className="block truncate text-xs text-gray-500">{user.department}</span>
                                      </span>
                                    </button>
                                  ))}
                                  {filteredAlignmentUsers.length === 0 && (
                                    <div className="px-3 py-8 text-center text-gray-400">暂无用户</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex min-h-[260px] flex-col">
                                <div className="border-b border-gray-100 px-4 py-3">
                                  <div className="text-sm font-semibold text-gray-900">{selectedAlignmentUser ? `${selectedAlignmentUser.name}的 OKR` : '请先选择用户'}</div>
                                  <div className="mt-1 text-xs text-gray-500">选择要对齐的 Objective，确认后添加到当前 O</div>
                                </div>
                                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 scrollbar-hover">
                                  {selectedAlignmentObjectives.map(targetObjective => (
                                    <button
                                      key={targetObjective.id}
                                      type="button"
                                      onClick={() => setAlignmentObjectiveId(targetObjective.id)}
                                      className={`w-full rounded-lg border px-3 py-2 text-left transition ${alignmentObjectiveId === targetObjective.id ? 'border-pink-200 bg-pink-50 text-pink-900' : 'border-gray-100 bg-white text-gray-700 hover:border-pink-100 hover:bg-pink-50/50'}`}
                                    >
                                      <div className="mb-1 text-xs font-bold text-pink-700">O{targetObjective.code}</div>
                                      <div className="text-sm font-semibold leading-5">{targetObjective.title}</div>
                                      <div className="mt-2 text-xs text-gray-500">{targetObjective.keyResults.length} 条 KR · 进度 {targetObjective.progress}%</div>
                                    </button>
                                  ))}
                                  {!selectedAlignmentUser && (
                                    <div className="flex h-full min-h-[170px] items-center justify-center text-sm text-gray-400">左侧选择用户后查看 TA 的 OKR</div>
                                  )}
                                </div>
                                <div className="flex justify-end gap-2 border-t border-gray-100 px-4 py-3">
                                  <button type="button" onClick={() => { setAlignmentPanelId(null); setAlignmentUserName(''); setAlignmentObjectiveId(''); }} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">取消</button>
                                  <button type="button" onClick={() => addAlignment(objective.id)} disabled={!alignmentUserName || !alignmentObjectiveId} className="rounded-lg bg-pink-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-800 disabled:cursor-not-allowed disabled:bg-gray-300">确定</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="mt-1 flex h-6 w-9 shrink-0 items-center justify-center rounded-full bg-pink-700 text-xs font-bold text-white">{objective.code}</span>
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <textarea value={objective.title} onChange={(event) => updateObjective(objective.id, { title: event.target.value })} className="min-h-[62px] w-full resize-y rounded-lg border border-pink-200 bg-pink-50/30 px-3 py-2 text-sm font-semibold leading-6 outline-none ring-2 ring-pink-100" />
                          ) : (
                            <h3 className="text-sm font-semibold leading-6 text-gray-950">O{objective.code}：{objective.title}</h3>
                          )}
                        </div>
                        {(objective.alignments || []).length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2 pl-12">
                            {(objective.alignments || []).map(target => (
                              <span key={target.id} className="inline-flex max-w-full items-center gap-2 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-800 ring-1 ring-pink-100">
                                对齐 {target.person}：{target.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <MetricCell editable={isEditing} value={objective.progress} suffix="%" onChange={(value) => updateObjective(objective.id, { progress: value })} />
                    <MetricText editable={isEditing} value={objective.score} onChange={(value) => updateObjective(objective.id, { score: value })} />
                    <MetricWeight editable={isEditing} value={objective.weight} onChange={(value) => updateObjective(objective.id, { weight: value })} />
                    <div className="text-center text-sm text-gray-600">{objective.recordCount}</div>
                  </div>

                  <div className="divide-y divide-gray-100 px-5">
                    {objective.keyResults.map((result, index) => (
                      <div
                        key={result.id}
                        draggable={isEditing}
                        onDragStart={(event: DragEvent<HTMLDivElement>) => { if (!isEditing) return; event.stopPropagation(); setDraggingKrId(result.id); event.dataTransfer.effectAllowed = 'move'; }}
                        onDragOver={(event) => { if (isEditing) event.preventDefault(); }}
                        onDrop={(event) => { event.preventDefault(); event.stopPropagation(); moveKeyResult(objective.id, result.id); setDraggingKrId(null); }}
                        onDragEnd={() => setDraggingKrId(null)}
                        className={`grid items-start gap-3 py-4 ${draggingKrId === result.id ? 'opacity-60' : ''}`}
                        style={{ gridTemplateColumns: `minmax(420px, 1fr) ${metricColumns}` }}
                      >
                        <div className="flex min-w-0 gap-3 pl-12 text-sm text-gray-800">
                          <div className="mt-1 flex shrink-0 items-center gap-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-700">{isEditing && <GripVertical size={12} />}KR{index + 1}</span>
                            {isEditing && (
                              <button onClick={(event) => { event.stopPropagation(); removeKeyResult(objective.id, result.id); }} disabled={objective.keyResults.length === 1} className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30" title="删除 KR">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            {isEditing ? (
                              <textarea value={result.title} onChange={(event) => updateKeyResult(objective.id, result.id, { title: event.target.value })} className="min-h-[74px] w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-pink-200 focus:ring-2 focus:ring-pink-100" />
                            ) : (
                              <p className="leading-6">{result.title}</p>
                            )}
                            {!isEditing && (
                              <div className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-500">
                                <span className="font-semibold text-gray-600">最新汇报：</span>
                                {result.latestReport || '暂无汇报记录'}
                              </div>
                            )}
                            </div>
                          </div>
                        <MetricCell editable={isEditing} value={result.progress} suffix="%" onChange={(value) => updateKeyResult(objective.id, result.id, { progress: value })} />
                        <MetricText editable={isEditing} value={result.score} onChange={(value) => updateKeyResult(objective.id, result.id, { score: value })} />
                        <MetricWeight editable={isEditing} value={result.weight} onChange={(value) => updateKeyResult(objective.id, result.id, { weight: value })} />
                        <div className="text-center text-sm text-gray-600">0</div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 bg-gray-50 px-8 py-3">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <FileText size={15} />
                      {isEditing ? (
                        <input value={objective.note} onChange={(event) => updateObjective(objective.id, { note: event.target.value })} className="h-9 flex-1 rounded-lg border border-gray-200 bg-white px-3 outline-none focus:border-pink-200 focus:ring-2 focus:ring-pink-100" />
                      ) : (
                        <span>备注：{objective.note}</span>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="sticky bottom-0 z-10 border-t border-pink-100 bg-pink-50/95 px-5 py-3 backdrop-blur">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button onClick={() => addKeyResult(objective.id)} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-pink-800 ring-1 ring-pink-100 hover:bg-pink-50">
                          <Plus size={15} />
                          添加 Key Result
                        </button>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingObjectiveId(null)} className="rounded-lg border border-pink-200 bg-white px-4 py-2 text-sm font-semibold text-pink-800 hover:bg-pink-50">保存</button>
                          <button onClick={() => setEditingObjectiveId(null)} className="rounded-lg bg-pink-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-800">发布</button>
                          <button onClick={() => setEditingObjectiveId(null)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">取消</button>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              );
              })}
              </div>
            ) : (
              <OkrStatsView objectives={objectives} />
            )}
          </main>
        </div>
      </div>


      <button
        onClick={() => setAssistantOpen(true)}
        className="fixed right-5 top-1/2 z-50 flex -translate-y-1/2 flex-col items-center gap-1 rounded-2xl bg-white p-2 text-gray-700 shadow-xl ring-1 ring-pink-100 transition hover:-translate-y-[52%] hover:shadow-2xl"
        title="OKR助手"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-600 to-pink-800 text-white shadow-lg">
          <Bot size={22} />
        </div>
        <span className="text-[11px] font-semibold text-pink-700">OKR助手</span>
      </button>

      {assistantOpen && (
        <OkrAssistantDrawer objectives={objectives} onClose={() => setAssistantOpen(false)} />
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4" onClick={() => setShowImportModal(false)}>
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">从其他周期导入</h3>
              <button onClick={() => setShowImportModal(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50"><X size={18} /></button>
            </div>
            <div className="mb-4 flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 font-medium text-gray-700">
                <input type="checkbox" checked={Object.values(importChecked).every(Boolean)} onChange={(event) => setImportChecked({ o1: event.target.checked, o2: event.target.checked })} className="h-4 w-4 rounded border-gray-300 text-pink-700" />
                全选
              </label>
              <button className="inline-flex items-center gap-1 text-gray-700">周期：2026 年 4 月 - 6 月 <ChevronRight size={14} className="rotate-90" /></button>
            </div>
            <div className="space-y-4">
              {baseObjectives.slice(0, 2).map(objective => (
                <label key={objective.id} className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1 hover:bg-gray-50">
                  <input type="checkbox" checked={!!importChecked[objective.id]} onChange={(event) => setImportChecked(current => ({ ...current, [objective.id]: event.target.checked }))} className="mt-1 h-4 w-4 rounded border-gray-300 text-pink-700" />
                  <span className="mt-0.5 rounded-full bg-pink-700 px-2 py-0.5 text-xs font-bold text-white">{objective.code}</span>
                  <span className="text-sm leading-6 text-gray-800">O{objective.code}：{objective.title}</span>
                </label>
              ))}
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setShowImportModal(false)} className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">取消</button>
              <button onClick={applyImport} className="rounded-lg bg-pink-700 px-6 py-2 text-sm font-semibold text-white hover:bg-pink-800">确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





function OkrStatsView({ objectives }: { objectives: Objective[] }) {
  const ownerPool = [
    ['梁吉利', '肖八'],
    ['沈十六'],
    ['郑八', '刘十'],
    ['赵六', '袁十一'],
  ];
  const totalKr = objectives.reduce((sum, objective) => sum + objective.keyResults.length, 0);
  const allKrs = objectives.flatMap(objective => objective.keyResults);
  const avgProgress = allKrs.length ? Math.round(allKrs.reduce((sum, result) => sum + result.progress, 0) / allKrs.length) : 0;
  const riskCount = allKrs.filter(result => result.progress < 50).length;

  return (
    <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 scrollbar-hover">
      <div className="space-y-4">
        {objectives.map((objective, objectiveIndex) => {
          const objectiveAvg = objective.keyResults.length ? Math.round(objective.keyResults.reduce((sum, result) => sum + result.progress, 0) / objective.keyResults.length) : 0;
          return (
            <section key={objective.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="border-l-4 border-pink-700 bg-white px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 inline-flex rounded-full bg-pink-50 px-2 py-0.5 text-xs font-bold text-pink-700">O{objective.code}</div>
                    <h3 className="text-base font-bold leading-6 text-gray-950">{objective.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{objective.keyResults.length} 条 KR · {objective.recordCount} 条进展记录</p>
                  </div>
                  <div className="grid min-w-[260px] grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-gray-50 px-3 py-2"><div className="font-semibold text-gray-500">O进度</div><div className="mt-1 text-base font-bold text-gray-900">{objective.progress}%</div></div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2"><div className="font-semibold text-gray-500">KR均值</div><div className="mt-1 text-base font-bold text-gray-900">{objectiveAvg}%</div></div>
                    <div className="rounded-lg bg-gray-50 px-3 py-2"><div className="font-semibold text-gray-500">权重</div><div className="mt-1 text-base font-bold text-gray-900">{objective.weight}</div></div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="grid min-w-[1080px] grid-cols-[minmax(320px,1.3fr)_120px_100px_150px_minmax(320px,1fr)] bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-700">
                  <div>KR</div><div>进度</div><div>权重</div><div>承接人</div><div>最新汇报 / 下一步</div>
                </div>
                {objective.keyResults.map((result, resultIndex) => {
                  const owners = ownerPool[(objectiveIndex + resultIndex) % ownerPool.length];
                  const nextStep = result.progress >= 80 ? '进展良好，下一步跟进验收和结果回填。' : result.progress >= 50 ? '需持续推进阻塞问题闭环，明确下次交付节点。' : '当前进度偏慢，需补充承接人、风险和时间计划。';
                  return (
                    <div key={result.id} className="grid min-w-[1080px] grid-cols-[minmax(320px,1.3fr)_120px_100px_150px_minmax(320px,1fr)] items-start border-t border-gray-100 px-5 py-4 text-sm">
                      <div className="pr-4">
                        <div className="mb-2 inline-flex rounded-full bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-700">KR{resultIndex + 1}</div>
                        <div className="leading-6 text-gray-900">{result.title}</div>
                      </div>
                      <div>
                        <div className="mb-1 font-semibold text-gray-900">{result.progress}%</div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-pink-700" style={{ width: `${result.progress || 6}%` }} /></div>
                      </div>
                      <div className="font-semibold text-gray-700">{result.weight}</div>
                      <div className="leading-6 text-gray-600">{owners.join('、')}</div>
                      <div className="space-y-2 leading-6 text-gray-600">
                        <p>{result.latestReport || '暂无汇报记录'}</p>
                        <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">{nextStep}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}


function OkrAssistantDrawer({ objectives, onClose }: { objectives: Objective[]; onClose: () => void }) {
  const directReports = people.filter(name => name !== '梁吉利').slice(0, 4);
  const [timeRange, setTimeRange] = useState({ start: '2026-06-01', end: '2026-06-30' });
  const [selectedObjectiveIds, setSelectedObjectiveIds] = useState<string[]>(objectives.map(objective => objective.id));
  const [peopleScope, setPeopleScope] = useState<'直属下级' | '自定义'>('直属下级');
  const [contactKeyword, setContactKeyword] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>(directReports);
  const [generated, setGenerated] = useState(false);

  const toggleObjective = (id: string) => {
    setGenerated(false);
    setSelectedObjectiveIds(current => (
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    ));
  };

  const togglePerson = (name: string) => {
    setGenerated(false);
    setSelectedPeople(current => (
      current.includes(name) ? current.filter(item => item !== name) : [...current, name]
    ));
  };

  const contactPeople = people.filter(name => !contactKeyword.trim() || name.includes(contactKeyword.trim()));
  const coverageRows = objectives.filter(objective => selectedObjectiveIds.includes(objective.id)).map((objective, objectiveIndex) => ({
    objective,
    assignees: selectedPeople.map((name, personIndex) => ({
      name,
      coverage: Math.min(96, 48 + objective.keyResults.length * 8 + personIndex * 9 + objectiveIndex * 6),
      focus: objective.keyResults[personIndex % Math.max(objective.keyResults.length, 1)]?.title || objective.title,
    })),
  }));

  return (
    <div className="fixed inset-0 z-[80]">
      <div className="absolute inset-0 bg-gray-900/20" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col bg-[#fff7fb] shadow-2xl">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-pink-100 bg-[#fff8fb] px-4">
          <h2 className="text-sm font-bold text-gray-950">OKR助手</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-500 hover:bg-white" title="关闭"><X size={17} /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hover">
          <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-pink-800"><Target size={16} />发起团队工作承接评估</div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 text-xs font-semibold text-gray-500">时间范围</div>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <input
                    type="date"
                    value={timeRange.start}
                    onChange={(event) => { setTimeRange(current => ({ ...current, start: event.target.value })); setGenerated(false); }}
                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 outline-none focus:border-pink-200 focus:ring-2 focus:ring-pink-100"
                  />
                  <span className="text-xs text-gray-400">至</span>
                  <input
                    type="date"
                    value={timeRange.end}
                    onChange={(event) => { setTimeRange(current => ({ ...current, end: event.target.value })); setGenerated(false); }}
                    className="h-10 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 outline-none focus:border-pink-200 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold text-gray-500">O选择</div>
                <div className="space-y-2">
                  {objectives.map(objective => (
                    <button
                      key={objective.id}
                      type="button"
                      onClick={() => toggleObjective(objective.id)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${selectedObjectiveIds.includes(objective.id) ? 'border-pink-200 bg-pink-50 text-pink-900' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[11px] ${selectedObjectiveIds.includes(objective.id) ? 'border-pink-700 bg-pink-700 text-white' : 'border-gray-300 bg-white text-transparent'}`}>?</span>
                      <span className="min-w-0">
                        <span className="mb-1 inline-flex rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-bold text-pink-700">O{objective.code}</span>
                        <span className="line-clamp-2 leading-5">{objective.title}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold text-gray-500">人员范围</div>
                <div className="grid grid-cols-2 gap-2">
                  {(['直属下级', '自定义'] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setPeopleScope(option);
                        setGenerated(false);
                        if (option === '直属下级') setSelectedPeople(directReports);
                      }}
                      className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${peopleScope === option ? 'border-pink-200 bg-pink-50 text-pink-800' : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {peopleScope === '直属下级' ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {directReports.map(name => (
                      <span key={name} className="rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-800">{name}</span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="border-b border-gray-100 p-3">
                      <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          value={contactKeyword}
                          onChange={(event) => setContactKeyword(event.target.value)}
                          placeholder="搜索通讯录"
                          className="h-9 w-full rounded-lg bg-gray-50 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-pink-100"
                        />
                      </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto p-2 scrollbar-hover">
                      {contactPeople.map(name => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => togglePerson(name)}
                          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-50"
                        >
                          <span className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${selectedPeople.includes(name) ? 'border-pink-700 bg-pink-700 text-white' : 'border-gray-300 text-transparent'}`}>?</span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-50 text-xs font-bold text-pink-700">{name.slice(0, 1)}</span>
                          <span className="flex-1 text-sm font-semibold text-gray-800">{name}</span>
                          <span className="text-xs text-gray-400">信息管理部</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGenerated(true)}
              disabled={selectedPeople.length === 0 || selectedObjectiveIds.length === 0}
              className="mt-4 w-full rounded-lg bg-pink-700 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-800 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              生成评估
            </button>
          </section>

          {generated && (
            <section className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-pink-100">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-sm font-bold text-gray-950">承接覆盖度</div>
                <div className="text-xs text-gray-400">{timeRange.start} 至 {timeRange.end}</div>
              </div>
              <div className="space-y-4">
                {coverageRows.map(({ objective, assignees }) => (
                  <div key={objective.id} className="rounded-lg border border-gray-100 bg-gray-50/70 p-3">
                    <div className="mb-3 text-sm font-semibold leading-6 text-gray-900">O{objective.code}?{objective.title}</div>
                    <div className="space-y-3">
                      {assignees.map(assignee => (
                        <div key={`${objective.id}-${assignee.name}`} className="rounded-lg bg-white p-3 shadow-sm">
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <span className="font-semibold text-gray-900">{assignee.name}</span>
                            <span className="font-bold text-pink-800">{assignee.coverage}%</span>
                          </div>
                          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-pink-700" style={{ width: `${assignee.coverage}%` }} />
                          </div>
                          <div className="line-clamp-2 text-xs leading-5 text-gray-500">{assignee.focus}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}


function PersonButton({ name, active, compact, onClick }: { name: string; active: boolean; compact?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-lg px-3 text-left transition ${compact ? 'py-2 text-sm' : 'mb-4 py-3'} ${active ? 'bg-pink-50 text-pink-800' : 'text-gray-700 hover:bg-gray-50'}`}>
      <span className={`flex ${compact ? 'h-6 w-6 text-[11px]' : 'h-7 w-7 text-xs'} items-center justify-center rounded-full bg-pink-700 font-bold text-white`}>{name.slice(0, 1)}</span>
      <span className="font-medium">{name}</span>
    </button>
  );
}

function MetricCell({ editable, value, suffix, onChange }: { editable: boolean; value: number; suffix: string; onChange: (value: number) => void }) {
  if (editable) {
    return <div className="flex justify-center"><input type="number" min={0} max={100} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-8 w-16 rounded-md border border-gray-200 bg-white text-center text-sm outline-none focus:border-pink-200 focus:ring-2 focus:ring-pink-100" /></div>;
  }
  return <div className="text-center text-sm text-gray-600">{value}{suffix}</div>;
}

function MetricText({ editable, value, onChange }: { editable: boolean; value: string; onChange: (value: string) => void }) {
  if (editable) {
    return <div className="flex justify-center"><input value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-16 rounded-md border border-gray-200 bg-white text-center text-sm outline-none focus:border-pink-200 focus:ring-2 focus:ring-pink-100" /></div>;
  }
  return <div className="text-center text-sm text-gray-600">{value}</div>;
}

function MetricWeight({ editable, value, onChange }: { editable: boolean; value: string; onChange: (value: string) => void }) {
  if (editable) {
    return <div className="flex justify-center"><input value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-16 rounded-md border border-gray-200 bg-white text-center text-sm outline-none focus:border-pink-200 focus:ring-2 focus:ring-pink-100" /></div>;
  }
  return <div className="text-center text-sm text-gray-600">{value}</div>;
}
