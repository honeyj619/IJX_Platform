import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, PencilLine } from 'lucide-react';
import { getHealthLightMeta, type ProjectWeeklyData } from '../data/projectWeeklyReport';

const MAX_DESCRIPTION = 1000;

interface ProjectWeeklyReportProps {
  data: ProjectWeeklyData | null;
  /** false = 骨架占位（空态/生成中），true = 完整数据 */
  filled: boolean;
  /** 生成中点亮的区块序号（0 起），-1 表示全部 */
  litIndex?: number;
  description: string;
  onDescriptionChange?: (value: string) => void;
  /** 只读模式（发送后查看） */
  readOnly?: boolean;
}

const sectionOrder = ['hero', 'info', 'stats', 'progress', 'summary', 'gantt', 'works', 'tables'];

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
export default function ProjectWeeklyReport({ data, filled, litIndex = -1, description, onDescriptionChange, readOnly = false }: ProjectWeeklyReportProps) {
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(new Set());
  const light = data ? getHealthLightMeta(data.healthLight) : null;

  const trimmedLength = useMemo(() => description.trim().length, [description]);
  const overLimit = description.length > MAX_DESCRIPTION;
  const emptyDescription = trimmedLength === 0;

  if (!filled || !data || !light) {
    return <ReportSkeleton litIndex={litIndex} />;
  }

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
            <p className="mt-1 text-xs text-gray-400">当前阶段：{data.currentStage}</p>
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

      {/* 整体项目进展：唯一可编辑字段（BR-05） */}
      <section className="rounded-xl border border-theme-200 bg-white px-6 py-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
            整体项目进展
            {!readOnly && (
              <span className="inline-flex items-center gap-1 rounded bg-theme-50 px-1.5 py-0.5 text-[11px] font-semibold text-theme-700">
                <PencilLine size={11} />必填 · 可编辑
              </span>
            )}
          </h3>
          <span className={`text-xs font-semibold ${overLimit ? 'text-red-500' : emptyDescription ? 'text-amber-600' : 'text-gray-400'}`}>
            {overLimit ? `已超出上限，请删减至 ${MAX_DESCRIPTION} 字以内` : `已输入 ${description.length} / ${MAX_DESCRIPTION} 字`}
          </span>
        </div>
        {readOnly ? (
          <p className="whitespace-pre-wrap rounded-lg bg-gray-50 px-4 py-3 text-sm leading-7 text-gray-700">{description}</p>
        ) : (
          <textarea
            value={description}
            onChange={event => {
              const next = event.target.value.slice(0, MAX_DESCRIPTION + 50);
              onDescriptionChange?.(next);
            }}
            placeholder="请描述本周整体进展（必填，发送前需填写，最多 1000 字）"
            className={`min-h-[120px] w-full resize-y rounded-lg border px-4 py-3 text-sm leading-7 outline-none transition-colors ${
              overLimit ? 'border-red-300 bg-red-50/40' : emptyDescription ? 'border-dashed border-amber-300 bg-amber-50/30' : 'border-dashed border-theme-300 bg-theme-50/40'
            } text-gray-700 focus:border-theme-400 focus:bg-white focus:ring-2 focus:ring-theme-100`}
          />
        )}
      </section>

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
            <div className="px-4 py-3 text-xs font-bold text-gray-900">阶段 / 任务</div>
            <div className="border-b border-gray-200">
              <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[{ n: '6月', span: 4 }, { n: '7月', span: 4 }, { n: '8月', span: 5 }, { n: '9月', span: 4 }].map(mo => (
                  <div key={mo.n} style={{ gridColumn: `span ${mo.span}` }} className="border-r border-gray-100 py-2 text-center text-xs font-semibold text-gray-600 last:border-r-0">{mo.n}</div>
                ))}
              </div>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(17, 1fr)' }}>
                {Array.from({ length: 17 }, (_, i) => (
                  <div key={i} className="border-r border-gray-100/60 py-1.5 text-center text-[11px] text-gray-400 last:border-r-0">W{i + 1}</div>
                ))}
              </div>
            </div>
          </div>

          {/* 阶段行 */}
          <div>
            {data.stages.map((stage, idx) => {
              const collapsed = collapsedStages.has(stage.id);
              const toNum = (s: string) => {
                const [, mm, dd] = s.split('-').map(Number);
                return (new Date(2026, mm - 1, dd).getTime() - new Date(2026, 5, 1).getTime()) / 86400000;
              };
              const TOTAL = (new Date(2026, 8, 30).getTime() - new Date(2026, 5, 1).getTime()) / 86400000;
              const a = toNum(stage.start), b = toNum(stage.end);
              const left = (a / TOTAL) * 100, width = ((b - a + 1) / TOTAL) * 100;
              const nowLeft = (new Date(2026, 7, 13).getTime() - new Date(2026, 5, 1).getTime()) / 86400000 / TOTAL * 100;
              const valTxt = stage.status === 'doing' ? `进行中 · ${stage.progress}%` : stage.status === 'done' ? '100%' : '待开始';
              return (
                <div key={stage.id} className="grid grid-cols-[300px_minmax(0,1fr)] border-b border-gray-100 last:border-b-0" style={{ minHeight: collapsed ? 46 : 58 }}>
                  <button type="button" onClick={() => toggleStage(stage.id)} className="flex flex-col justify-center gap-0.5 px-4 py-2.5 text-left hover:bg-gray-50/60">
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
                      {collapsed ? <ChevronRight size={13} className="shrink-0 text-gray-400" /> : <ChevronDown size={13} className="shrink-0 text-gray-400" />}
                      <span className="before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:content-['']">{stage.name}</span>
                    </span>
                    <span className="pl-[21px] text-[11.5px] text-gray-400">{stage.start} ~ {stage.end} · {stage.taskSummary}</span>
                  </button>
                  <div className="relative" style={{ backgroundImage: 'linear-gradient(90deg, #f1f5f9 1px, transparent 1px)', backgroundSize: 'calc(100%/17) 100%' }}>
                    {/* 今日线 */}
                    <div className="absolute inset-y-0 z-10 w-0.5" style={{ left: `${nowLeft}%`, background: 'repeating-linear-gradient(0deg, #ffd166 0 4px, transparent 4px 8px)' }}>
                      <span className="absolute -left-[5px] -top-0.5 h-3 w-3 rounded-full bg-[#ffd166] shadow-[0_0_8px_rgba(255,209,102,.75)]" />
                    </div>
                    {/* 阶段横条 */}
                    <div
                      className={`absolute top-[13px] flex h-8 items-center rounded-md px-3 text-xs font-medium tracking-wide text-white ${stage.status === 'todo' ? 'border-[1.5px] border-dashed border-gray-300 !bg-transparent !text-gray-400' : stage.status === 'doing' ? 'shadow-md ring-2 ring-theme-200' : 'shadow-sm'}`}
                      style={{ left: `${left}%`, width: `${width}%`, background: stage.status === 'todo' ? undefined : `linear-gradient(90deg, var(--theme-${[300, 400, 500, 500, 600, 700][idx] ?? 700}), var(--theme-${[400, 500, 600, 600, 700, 700][idx] ?? 700}))` }}
                    >
                      <span>{stage.start} ~ {stage.end}</span>
                      <span className="ml-auto pl-2 text-[11.5px] opacity-95">{valTxt}</span>
                    </div>
                    {/* 展开态：阶段下任务摘要条 */}
                    {!collapsed && (
                      <div className="absolute bottom-1 left-2 right-2 truncate text-[10.5px] text-gray-400">{stage.taskSummary} · 状态：{stage.status === 'done' ? '已完成' : stage.status === 'doing' ? '进行中' : '待开始'}</div>
                    )}
                  </div>
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
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: 'repeating-linear-gradient(90deg,#ffd166 0 3px,#fff 3px 6px)' }} />今日（2026-08-13）</span>
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
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-900">未来1周工作计划<span className="ml-2 text-xs font-normal text-gray-400">共 {data.nextWeekWorks.length} 项</span></h3>
          <ol className="space-y-2" title="该字段由禅道数据自动生成，不可编辑">
            {data.nextWeekWorks.map((plan, index) => (
              <li key={plan} className="flex items-center gap-3 rounded-lg bg-gray-50/60 px-3 py-2">
                <span className="w-5 shrink-0 text-right text-xs text-gray-400">{index + 1}</span>
                <span className="min-w-0 flex-1 text-xs text-gray-700">{plan}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 问题 / 风险 / 变更 三表 */}
      {([
        { key: 'issue', title: '问题列表', icon: '📋', count: data.issues.length, header: ['ID', '问题名称', '类型', '结果', '计划解决日期', '指派给'], rows: data.issues.map(i => [i.id, i.name, i.type, i.result, i.planDate, i.assignee]) },
        { key: 'risk', title: '风险列表', icon: '⚠️', count: data.risks.length, header: ['ID', '风险名称', '类型', '状态', '计划关闭日期', '指派给'], rows: data.risks.map(r => [r.id, r.name, r.type, r.status, r.closeDate, r.assignee]) },
        { key: 'change', title: '变更列表', icon: '🔄', count: data.changes.length, header: ['ID', '标题', '变更类型', '变更等级', '审批状态'], rows: data.changes.map(c => [c.id, c.title, c.changeType, c.level, c.approval]) },
      ] as const).map(table => (
        <section key={table.key} className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-gray-900">{table.icon} {table.title}<span className="ml-2 text-xs font-normal text-gray-400">共 {table.count} 条</span></h3>
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

      <p className="text-center text-xs text-gray-300">数据来源：禅道项目数据 · 生成于 {new Date().toLocaleDateString('zh-CN')} · 仅「整体项目进展」可编辑</p>
    </div>
  );
}
