import { useEffect, useMemo, useState } from 'react';
import { X, ChevronDown, ChevronRight, PencilLine } from 'lucide-react';
import { getHealthLightMeta, type ProjectWeeklyData } from '../data/projectWeeklyReport';

const MAX_DESCRIPTION = 1000;
type SectionKey = 'description' | 'nextWeekWorks';

interface ProjectWeeklyReportProps {
  data: ProjectWeeklyData | null;
  /** false = 骨架占位（空态/生成中），true = 完整数据 */
  filled: boolean;
  /** 生成中点亮的区块序号（0 起），-1 表示全部 */
  litIndex?: number;
  description: string;
  /** 分段编辑-编辑态上抛（编辑中=提交禁用） */
  onEditingChange?: (editing: boolean) => void;
  /** 分段编辑-保存描述（字段级） */
  onDescriptionSave?: (value: string) => void;
  /** 分段编辑-保存下周计划（字段级） */
  onNextWeekWorksSave?: (value: string[]) => void;
  /** 分段编辑：是否封版（已提交），封版不显示编辑按钮 */
  sealed?: boolean;
  readOnly?: boolean;
}

const sectionOrder = ['hero', 'info', 'stats', 'progress', 'summary', 'tables', 'gantt', 'works'];

/** 周报区块总数（骨架点亮动画用） */
export const REPORT_SECTION_COUNT = sectionOrder.length;

const SkeletonBox = ({ className, style }: { className: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse rounded bg-gray-100 ${className}`} style={style} />
);

/** 周报骨架占位：结构同正式周报，内容为灰阶占位块 */
const ReportSkeleton = ({ litIndex }: { litIndex: number }) => {
  const isLit = (index: number) => litIndex < 0 || index < litIndex;
  return (
    <div className="space-y-4">
      {sectionOrder.map((section, index) => (
        <div
          key={section}
          className={`rounded-xl border bg-white p-5 transition-opacity duration-500 ${isLit(index) ? 'border-gray-200 opacity-100' : 'border-dashed border-gray-200 opacity-40'}`}
        >
          {section === 'hero' && (
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <SkeletonBox className="h-7 w-2/3" />
                <SkeletonBox className="h-4 w-1/2" />
              </div>
              <SkeletonBox className="h-9 w-24" />
            </div>
          )}
          {section === 'info' && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonBox key={i} className="h-10" />)}
            </div>
          )}
          {section === 'stats' && (
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonBox key={i} className="h-16" />)}
            </div>
          )}
          {section === 'progress' && (
            <div className="flex items-center gap-6">
              <SkeletonBox className="h-20 w-20 rounded-full" />
              <div className="flex-1 space-y-2"><SkeletonBox className="h-4 w-full" /><SkeletonBox className="h-4 w-3/4" /></div>
            </div>
          )}
          {section === 'summary' && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonBox key={i} className="h-4" style={{ width: `${90 - i * 15}%` }} />)}</div>}
          {section === 'gantt' && <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonBox key={i} className="h-6" />)}</div>}
          {section === 'works' && (
            <div className="grid gap-3 lg:grid-cols-2">
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <SkeletonBox key={i} className="h-5" />)}</div>
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonBox key={i} className="h-5" />)}</div>
            </div>
          )}
          {section === 'tables' && <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <SkeletonBox key={i} className="h-14" />)}</div>}
        </div>
      ))}
    </div>
  );
};

const ReadOnlyField = ({ label, value }: { label: string; value: string }) => (
  <div className="group/field relative rounded-lg bg-gray-50 px-3 py-2" title="该字段由禅道数据自动生成，不可编辑">
    <p className="text-xs text-gray-400">{label}</p>
    <p className="mt-1 truncate text-sm font-semibold text-gray-700">{value || '—'}</p>
  </div>
);

/** 项目周报渲染组件（浅色企业风，1:1 对齐 PC 周报模板结构） */
export default function ProjectWeeklyReport({ data, filled, litIndex = -1, description, onEditingChange, onDescriptionSave, onNextWeekWorksSave, sealed = false, readOnly = false }: ProjectWeeklyReportProps) {
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [descDraft, setDescDraft] = useState(description);
  const [worksDraft, setWorksDraft] = useState<string[]>(data?.nextWeekWorks ?? []);
  const [saveConfirmSection, setSaveConfirmSection] = useState<SectionKey | null>(null);
  const light = data ? getHealthLightMeta(data.healthLight) : null;

  const trimmedLength = useMemo(() => description.trim().length, [description]);
  const overLimit = description.length > MAX_DESCRIPTION;
  const emptyDescription = trimmedLength === 0;
  const sectionEditable = !readOnly && !sealed && Boolean(onDescriptionSave || onNextWeekWorksSave);

  useEffect(() => { onEditingChange?.(editingSection !== null); }, [editingSection, onEditingChange]);

  if (!filled || !data || !light) {
    return <ReportSkeleton litIndex={litIndex} />;
  }

  // ===== 分段编辑状态：同时只允许一段处于编辑 =====
  const startEdit = (key: SectionKey) => {
    if (!sectionEditable) return;
    if (key === 'description') setDescDraft(description);
    else setWorksDraft(data.nextWeekWorks.filter(Boolean));
    setEditingSection(key);
  };
  const cancelEdit = () => setEditingSection(null);

  // 字段保存二次确认（与系统确认弹窗一致的轻量样式）
  const sectionTitle = (key: SectionKey) => key === 'description' ? '总体进展描述' : '未来1周工作计划';

  const saveDescription = () => {
    if (descDraft.trim().length === 0 || descDraft.length > MAX_DESCRIPTION) return;
    setSaveConfirmSection('description');
  };
  const saveWorks = () => {
    if (worksDraft.map(item => item.trim()).filter(Boolean).length === 0) return;
    setSaveConfirmSection('nextWeekWorks');
  };
  const confirmFieldSave = () => {
    if (saveConfirmSection === 'description') {
      onDescriptionSave?.(descDraft);
    } else if (saveConfirmSection === 'nextWeekWorks') {
      const normalized = worksDraft.map(item => item.trim()).filter(Boolean).slice(0, 30);
      onNextWeekWorksSave?.(normalized);
    }
    setSaveConfirmSection(null);
    setEditingSection(null);
  };

  const toggleStage = (stageId: string) => {
    setCollapsedStages(current => {
      const next = new Set(current);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Hero 头：项目名 / 项目周 / 周期 / 状态灯 */}
      <section className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-950">{data.projectName}</h2>
            <p className="mt-2 text-sm text-gray-500">
              项目周第 <span className="font-semibold text-gray-800">{data.weekNumber}</span> 周 · 汇报周期：
              <span className="font-semibold text-gray-800">{data.period}</span>
            </p>
            <p className="mt-1 text-xs text-gray-400">当前阶段：{data.currentStage} · 子阶段：{data.currentSubStage || '—'}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${light.bg} ${light.text}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${light.dot}`} />
            {light.label}
          </span>
        </div>
      </section>

      {/* 项目基本信息 */}
      <section className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">项目基本信息</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ReadOnlyField label="项目名称" value={data.projectName} />
          <ReadOnlyField label="项目编号" value={data.projectCode} />
          <ReadOnlyField label="项目等级" value={data.projectLevel} />
          <ReadOnlyField label="项目发起人" value={data.sponsor} />
          <ReadOnlyField label="项目经理" value={data.manager} />
          <ReadOnlyField label="IT项目经理" value={data.itManager} />
          <ReadOnlyField label="项目阶段" value={data.currentStage} />
          <ReadOnlyField label="项目子阶段" value={data.currentSubStage || '—'} />
        </div>
      </section>

      {/* 数据统计 6 指标 */}
      <section className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">数据统计</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.stats.map(stat => (
            <div key={stat.id} className="rounded-lg border border-gray-100 bg-gray-50/60 px-4 py-3" title="该字段由禅道数据自动生成，不可编辑">
              <p className="text-xs text-gray-400">{stat.name}</p>
              <p className="mt-1.5 flex items-baseline gap-2">
                <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                <span className="text-xs text-gray-400">{stat.fraction}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-gray-100 pt-3 text-xs leading-5 text-gray-400">
          口径说明：前三项按时间加权计算（分子 / 分母 = 已完成数 / 计划总数）；变更 / 问题 / 风险若无记录显示「—」
        </p>
      </section>

      {/* 整体进度 + 里程碑 */}
      <section className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold text-gray-900">整体进度</h3>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative h-24 w-24 shrink-0">
            <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
              <circle cx="48" cy="48" r="42" fill="none" stroke="#f3f4f6" strokeWidth="9" />
              <circle
                cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round"
                className={light.text}
                strokeDasharray={`${(data.overallProgress / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{data.overallProgress}%</span>
              <span className="text-[10px] text-gray-400">整体进度</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-500">里程碑 · 整体完成度</p>
            <p className="mt-2 text-sm leading-6 text-gray-700" title="该字段由禅道数据自动生成，不可编辑">{data.milestoneSummary}</p>
          </div>
        </div>
      </section>

      {/* 总体进展描述：分段编辑（默认只读，右上角编辑按钮） */}
      <section className={`rounded-xl bg-white px-6 py-5 shadow-sm ${sectionEditable ? 'border border-theme-200' : 'border border-gray-200'}`}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-900">总体进展描述</h3>
          <div className="flex items-center gap-2">
            {editingSection === 'description' ? (
              <span className={`text-xs font-semibold ${descDraft.length > MAX_DESCRIPTION || descDraft.trim().length === 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {descDraft.trim().length === 0 ? '必填' : descDraft.length > MAX_DESCRIPTION ? `超限，请删减至 ${MAX_DESCRIPTION} 字以内` : `${descDraft.length} / ${MAX_DESCRIPTION} 字`}
              </span>
            ) : (
              <span className="text-xs text-gray-400">{description.length} 字</span>
            )}
            {sectionEditable && editingSection !== 'description' && (
              <button type="button" onClick={() => startEdit('description')} disabled={editingSection !== null} className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:border-theme-300 hover:text-theme-700 disabled:cursor-not-allowed disabled:opacity-40">
                <PencilLine size={12} />编辑
              </button>
            )}
          </div>
        </div>
        {editingSection === 'description' ? (
          <div>
            <textarea
              autoFocus
              value={descDraft}
              onChange={event => setDescDraft(event.target.value.slice(0, MAX_DESCRIPTION + 50))}
              placeholder="请描述项目总体进展（必填，最多 1000 字）"
              className={`min-h-[120px] w-full resize-y rounded-lg border px-4 py-3 text-sm leading-7 outline-none transition-colors ${
                descDraft.trim().length === 0 ? 'border-red-300 bg-red-50/40' : descDraft.length > MAX_DESCRIPTION ? 'border-red-300 bg-red-50/40' : 'border-theme-300 bg-theme-50/40'
              } text-gray-700 focus:border-theme-400 focus:bg-white focus:ring-2 focus:ring-theme-100`}
            />
            <div className="mt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={cancelEdit} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">取消</button>
              <button type="button" onClick={saveDescription} disabled={descDraft.trim().length === 0 || descDraft.length > MAX_DESCRIPTION} className="rounded-md bg-theme-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-50">保存</button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap rounded-lg bg-gray-50 px-4 py-3 text-sm leading-7 text-gray-700">{description || '（暂无描述）'}</p>
        )}
      </section>

      {/* 问题 / 风险 / 变更置于阶段信息之前 */}
      {([
        { key: 'issue', title: '问题列表', icon: '问题', count: data.issues.length, header: ['ID', '问题名称', '类型', '结果', '计划解决日期', '指派给'], rows: data.issues.map(i => [i.id, i.name, i.type, i.result, i.planDate, i.assignee]) },
        { key: 'risk', title: '风险列表', icon: '风险', count: data.risks.length, header: ['ID', '风险名称', '类型', '状态', '计划关闭日期', '指派给'], rows: data.risks.map(r => [r.id, r.name, r.type, r.status, r.closeDate, r.assignee]) },
        { key: 'change', title: '变更列表', icon: '变更', count: data.changes.length, header: ['ID', '标题', '变更类型', '变更等级', '审批状态'], rows: data.changes.map(c => [c.id, c.title, c.changeType, c.level, c.approval]) },
      ] as const).map(table => (
        <section key={table.key} className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-900">{table.icon} · {table.title}<span className="ml-2 text-xs font-normal text-gray-400">共 {table.count} 条</span></h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs" title="该字段由禅道数据自动生成，不可编辑">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400">
                  {table.header.map(cell => <th key={cell} className="px-3 py-2 font-medium">{cell}</th>)}
                </tr>
              </thead>
              <tbody>
                {table.rows.length === 0 ? (
                  <tr><td colSpan={table.header.length} className="px-3 py-6 text-center text-gray-300">暂无记录</td></tr>
                ) : table.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-50 text-gray-700 last:border-0">
                    {row.map((cell, ci) => <td key={ci} className="px-3 py-2.5">{cell || '—'}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {/* 详细阶段甘特图（按阶段分解任务，对齐 PC 周报模板） */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="mb-4 flex items-center justify-between px-6 pt-5">
          <h3 className="text-sm font-bold text-gray-900">详细阶段甘特图（按阶段分解任务）</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setCollapsedStages(new Set())} className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">全部展开</button>
            <button type="button" onClick={() => setCollapsedStages(new Set(data.stages.map(s => s.id)))} className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-50">全部折叠</button>
          </div>
        </div>

        <div className="pb-2">
          {/* 时间轴表头：月份 + 周 双层 */}
          <div className="grid grid-cols-[300px_minmax(0,1fr)] items-start">
            <div className="px-4 py-3 text-xs font-bold text-gray-900">阶段 / 子阶段</div>
            <div className="border-b border-gray-200">
              <div className="grid" style={{ gridTemplateColumns: 'repeat(122, minmax(0, 1fr))' }}>
                {[{ n: '6月', span: 30 }, { n: '7月', span: 31 }, { n: '8月', span: 31 }, { n: '9月', span: 30 }].map(mo => (
                  <div key={mo.n} style={{ gridColumn: `span ${mo.span}` }} className="border-r border-gray-100 py-2 text-center text-xs font-semibold text-gray-600 last:border-r-0">{mo.n}</div>
                ))}
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(122, minmax(0, 1fr))' }}>
                {Array.from({ length: 18 }, (_, i) => (
                  <div key={i} style={{ gridColumn: `span ${i === 17 ? 3 : 7}` }} className="border-r border-gray-100/60 py-1.5 text-center text-[11px] text-gray-400 last:border-r-0">W{i + 1}</div>
                ))}
              </div>
            </div>
          </div>

          {/* 阶段行 */}
          <div>
            {data.stages.map((stage, idx) => {
              const collapsed = collapsedStages.has(stage.id);
              const hasSubStages = Boolean(stage.subStages?.length);
              const toNum = (s: string) => {
                const [, mm, dd] = s.split('-').map(Number);
                return (new Date(2026, mm - 1, dd).getTime() - new Date(2026, 5, 1).getTime()) / 86400000;
              };
              const TOTAL = ((new Date(2026, 8, 30).getTime() - new Date(2026, 5, 1).getTime()) / 86400000) + 1;
              const a = toNum(stage.start), b = toNum(stage.end);
              const left = (a / TOTAL) * 100, width = ((b - a + 1) / TOTAL) * 100;
              const valTxt = stage.status === 'doing' ? `进行中 · ${stage.progress}%` : stage.status === 'done' ? '100%' : '待开始';
              const isCurrentStage = stage.name.includes(data.currentStage);
              return (
                <div key={stage.id} className="border-b border-gray-100 last:border-b-0">
                  <div className={`grid min-h-[58px] grid-cols-[300px_minmax(0,1fr)] ${isCurrentStage ? 'bg-theme-50/70' : 'bg-gray-50/40'}`}>
                    <button type="button" onClick={() => hasSubStages && toggleStage(stage.id)} className={`flex flex-col justify-center gap-0.5 px-4 py-2.5 text-left ${hasSubStages ? 'hover:bg-gray-100/70' : 'cursor-default'}`}>
                      <span className="flex items-center gap-2 text-[13px] font-semibold text-gray-800">
                        {hasSubStages ? (collapsed ? <ChevronRight size={13} className="shrink-0 text-gray-400" /> : <ChevronDown size={13} className="shrink-0 text-gray-400" />) : <span className="w-[13px]" />}
                        <span className="rounded border border-theme-200 bg-theme-50 px-1.5 py-0.5 text-[10px] font-semibold text-theme-700">阶段</span>
                        <span className="truncate">{stage.name.replace(/^阶段[一二三四五六七八九十]+ · /, '')}</span>
                        {isCurrentStage && <span className="shrink-0 rounded bg-theme-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">当前阶段</span>}
                      </span>
                      <span className="pl-[21px] text-[11.5px] text-gray-400">{stage.start} ~ {stage.end}</span>
                    </button>
                    <div className="relative" style={{ backgroundImage: 'linear-gradient(90deg, #e5e7eb 1px, transparent 1px)', backgroundSize: 'calc(700%/122) 100%' }}>
                      <div
                        className={`absolute top-[13px] flex h-8 items-center rounded-md px-3 text-xs font-semibold text-white ${stage.status === 'todo' ? 'border-[1.5px] border-dashed border-gray-300 !bg-transparent !text-gray-400' : stage.status === 'doing' ? 'shadow-md ring-2 ring-theme-200' : 'shadow-sm'}`}
                        style={{ left: `${left}%`, width: `${width}%`, background: stage.status === 'todo' ? undefined : `linear-gradient(90deg, var(--theme-${[300, 400, 500, 500, 600, 700][idx] ?? 700}), var(--theme-${[400, 500, 600, 600, 700, 700][idx] ?? 700}))` }}
                      >
                        <span>{stage.start} ~ {stage.end}</span>
                        <span className="ml-auto pl-2 text-[11.5px] opacity-95">{valTxt}</span>
                      </div>
                    </div>
                  </div>
                  {hasSubStages && !collapsed && stage.subStages?.map(subStage => {
                    const subLeft = (toNum(subStage.start) / TOTAL) * 100;
                    const subWidth = ((toNum(subStage.end) - toNum(subStage.start) + 1) / TOTAL) * 100;
                    const subStatus = subStage.status === 'done' ? '已完成' : subStage.status === 'doing' ? '进行中' : subStage.status === 'delayed' ? '已延期' : '未开始';
                    const isCurrentSubStage = subStage.name === data.currentSubStage;
                    return (
                      <div key={subStage.id} className={`grid min-h-[50px] grid-cols-[300px_minmax(0,1fr)] border-t border-gray-100 ${isCurrentSubStage ? 'bg-theme-50/40' : 'bg-white'}`}>
                        <div className="flex flex-col justify-center py-2 pl-12 pr-4 text-left">
                          <p className={`truncate text-xs ${isCurrentSubStage ? 'font-semibold text-theme-800' : 'font-medium text-gray-700'}`}>{subStage.name}</p>
                          <p className="mt-0.5 text-[10px] text-gray-400">{subStage.start} ~ {subStage.end}</p>
                        </div>
                        <div className="relative" style={{ backgroundImage: 'linear-gradient(90deg, #f1f5f9 1px, transparent 1px)', backgroundSize: 'calc(700%/122) 100%' }}>
                          <div
                            className={`absolute top-[10px] flex h-7 items-center rounded px-2 text-[10px] font-medium ${subStage.status === 'todo' ? 'border border-dashed border-gray-300 bg-white text-gray-400' : subStage.status === 'delayed' ? 'bg-red-500 text-white' : 'bg-theme-500 text-white'} ${isCurrentSubStage ? 'ring-2 ring-theme-200' : ''}`}
                            style={{ left: `${subLeft}%`, width: `${subWidth}%` }}
                          >
                            <span className="truncate">{subStage.start} ~ {subStage.end}</span>
                            <span className="ml-auto pl-2">{subStatus}{subStage.progress > 0 ? ` · ${subStage.progress}%` : ''}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* 图例 */}
        <div className="flex flex-wrap items-center gap-5 border-t border-gray-200 px-6 py-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5 text-gray-400">点击阶段行可展开/折叠；横条为该阶段整体周期与进度</span>
          <span className="flex-1" />
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: 'linear-gradient(90deg, var(--theme-400), var(--theme-500))' }} />已完成</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm ring-1 ring-theme-200" style={{ background: 'linear-gradient(90deg, var(--theme-500), var(--theme-600))' }} />进行中</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm border-[1.5px] border-dashed border-gray-400" />待开始</span>
        </div>
      </section>

      {/* 本周工作 + 下周计划 */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-900">
            本周主要工作
            <span className="ml-2 text-xs font-normal text-gray-400">共 {data.thisWeekWorks.length} 项 · 已完成 {data.thisWeekWorks.filter(w => w.progress >= 100).length} 项</span>
          </h3>
          <ol className="space-y-2" title="该字段由禅道数据自动生成，不可编辑">
            {data.thisWeekWorks.map((work, index) => (
              <li key={work.id} className="flex items-center gap-3 rounded-lg bg-gray-50/60 px-3 py-2">
                <span className="w-5 shrink-0 text-right text-xs text-gray-400">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-gray-700">{work.name}</span>
                <span className={`shrink-0 text-xs font-semibold ${work.progress >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{work.progress}%</span>
              </li>
            ))}
          </ol>
        </div>
        <section className={`rounded-xl bg-white px-6 py-5 shadow-sm ${sectionEditable ? 'border border-theme-200' : 'border border-gray-200'}`}>
          <h3 className="mb-3 flex items-center text-sm font-bold text-gray-900">
            未来1周工作计划
            <span className="ml-2 text-xs font-normal text-gray-400">共 {data.nextWeekWorks.filter(Boolean).length} 项</span>
            {sectionEditable && editingSection !== 'nextWeekWorks' && (
              <button type="button" onClick={() => startEdit('nextWeekWorks')} disabled={editingSection !== null} className="ml-auto inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-600 transition-colors hover:border-theme-300 hover:text-theme-700 disabled:cursor-not-allowed disabled:opacity-40">
                <PencilLine size={12} />编辑
              </button>
            )}
          </h3>
          {editingSection === 'nextWeekWorks' ? (
            <div>
              <p className="mb-2 text-xs text-gray-500">每行一项，换行自动连续编号；保存时清除空行，最多 30 项。</p>
              <div className="relative overflow-hidden rounded-lg border border-theme-300 bg-theme-50/40 focus-within:border-theme-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-theme-100">
                <div className="pointer-events-none absolute bottom-3 left-3 top-3 w-5 text-right text-xs leading-7 text-gray-400" aria-hidden="true">
                  {worksDraft.map((_, index) => <div key={index}>{index + 1}</div>)}
                </div>
                <textarea
                  autoFocus
                  value={worksDraft.join('\n')}
                  onChange={event => setWorksDraft(event.target.value.split(/\r?\n/).slice(0, 30))}
                  rows={Math.max(3, worksDraft.length)}
                  placeholder="每行填写一项工作计划，换行后自动编号"
                  className="block w-full resize-none bg-transparent py-3 pl-12 pr-3 text-xs leading-7 text-gray-700 outline-none"
                  style={{ height: `${Math.max(108, worksDraft.length * 28 + 24)}px` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button type="button" onClick={cancelEdit} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">取消</button>
                <button type="button" onClick={saveWorks} disabled={worksDraft.map(item => item.trim()).filter(Boolean).length === 0} className="rounded-md bg-theme-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-50">保存</button>
              </div>
            </div>
          ) : (
            <ol className="space-y-2">
              {data.nextWeekWorks.filter(Boolean).map((plan, index) => (
                <li key={`${index}-${plan}`} className="flex items-center gap-3 rounded-lg bg-gray-50/60 px-3 py-2">
                  <span className="w-5 shrink-0 text-right text-xs text-gray-400">{index + 1}</span>
                  <span className="min-w-0 flex-1 text-xs text-gray-700">{plan}</span>
                </li>
              ))}
              {data.nextWeekWorks.filter(Boolean).length === 0 && <li className="px-3 py-2 text-xs text-gray-300">（暂无计划）</li>}
            </ol>
          )}
        </section>
      </section>

      <p className="text-center text-xs text-gray-300">数据来源：禅道项目数据 · 生成于 {new Date().toLocaleDateString('zh-CN')} · 「总体进展描述」与「未来1周工作计划」支持分段编辑</p>

      {/* 字段保存二次确认（系统统一确认弹窗样式） */}
      {saveConfirmSection && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-gray-950/30 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-950">确认保存修改</h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">保存后将更新汇报预览与工作汇报记录。</p>
              </div>
              <button type="button" onClick={() => setSaveConfirmSection(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" title="关闭"><X size={18} /></button>
            </div>
            <div className="mt-5 space-y-2 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <p><span className="text-gray-400">修改字段：</span>{sectionTitle(saveConfirmSection)}</p>
              <p><span className="text-gray-400">变更说明：</span>{saveConfirmSection === 'description' ? `${descDraft.length} 字（保存后覆盖原描述）` : `${worksDraft.map(item => item.trim()).filter(Boolean).length} 项计划（保存后覆盖原计划）`}</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setSaveConfirmSection(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">取消</button>
              <button type="button" onClick={confirmFieldSave} className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700">确认保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
