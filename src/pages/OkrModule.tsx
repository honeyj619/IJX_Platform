import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

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

export default function OkrModule() {
  const navigate = useNavigate();
  const [selectedObjectiveId, setSelectedObjectiveId] = useState('o3');

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-900">
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/enterprise')}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              title="返回个人门户"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <Target size={21} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">OKR</h1>
              <p className="text-xs text-gray-500">查看领导目标拆解、关键结果与进度记录</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/work-report')}
            className="hidden rounded-lg border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-50 sm:block"
          >
            去写汇报
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-5 py-5">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[220px_minmax(0,1fr)] min-[1700px]:grid-cols-[240px_minmax(0,1fr)_300px]">
          <aside className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="relative mb-4">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className="h-10 w-full rounded-xl bg-gray-50 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-100" placeholder="搜索员工" />
            </div>
            <h3 className="mb-3 text-sm font-semibold text-gray-500">我的 OKR</h3>
            <button className="mb-4 flex w-full items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-left text-blue-700">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">王</span>
              王一
            </button>
            <h3 className="mb-3 text-sm font-semibold text-gray-500">直属下级</h3>
            <div className="space-y-2">
              {['肖八', '郑八', '沈十六', '袁十一', '刘十', '赵六'].map(name => (
                <button key={name} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold text-white">{name.slice(0, 1)}</span>
                  {name}
                </button>
              ))}
            </div>
          </aside>

          <main className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">王</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">王一</h2>
                  <p className="text-xs text-gray-500">2026 年 4 月 - 6 月 · 2026 年度 OKR</p>
                </div>
              </div>
              <button onClick={() => navigate('/work-report')} className="rounded-lg border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-50">引用到写汇报</button>
            </div>

            {okrObjectives.map(objective => (
              <section
                key={objective.id}
                onClick={() => setSelectedObjectiveId(objective.id)}
                className={`cursor-pointer rounded-2xl border bg-white shadow-sm transition ${selectedObjectiveId === objective.id ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="grid gap-4 border-b border-gray-100 p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-white">
                      <Target size={18} />
                    </div>
                    <div>
                      <p className="font-semibold leading-6 text-gray-950">{objective.title}</p>
                      <p className="mt-1 text-xs text-gray-500">刘十、赵六、肖八、沈十六、郑八、袁十一</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 text-center text-sm">
                    <MetricRing label="进度" value={`${objective.progress}%`} progress={objective.progress} />
                    <div>
                      <p className="text-xs text-gray-400">权重</p>
                      <p className="mt-2 font-semibold text-gray-700">100%</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">总分</p>
                      <p className="mt-2 font-semibold text-gray-700">{objective.score}</p>
                    </div>
                  </div>
                </div>
                <div className="px-5">
                  {objective.keyResults.map(result => (
                    <div key={result.title} className="grid gap-4 border-b border-gray-100 py-3 last:border-b-0 lg:grid-cols-[minmax(0,1fr)_220px]">
                      <div className="flex items-center gap-3 text-sm text-gray-800">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span>{result.title} <span className="text-blue-600">@{result.owner}</span></span>
                      </div>
                      <div className="grid grid-cols-3 text-center text-sm text-gray-600">
                        <MetricRing value={`${result.progress}%`} progress={result.progress} />
                        <span>{result.weight}</span>
                        <span>{(result.progress / 100).toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 bg-gray-50 px-5 py-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-gray-400 ring-1 ring-gray-200">
                    <FileText size={15} />
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-900">进度记录</p>
                    <p className="text-sm leading-6 text-gray-700">{objective.record}</p>
                  </div>
                </div>
              </section>
            ))}
          </main>

          <aside className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm xl:col-span-2 min-[1700px]:col-span-1">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">OKR 到汇报建议</h3>
              <Sparkles size={18} className="text-blue-600" />
            </div>
            <div className="space-y-3 text-sm leading-6 text-gray-600">
              <p className="rounded-xl bg-blue-50 p-3 text-blue-900">本周汇报可围绕“流程线上化”“协作闭环”“智能办公培训”三类 KR 组织内容。</p>
              <p className="rounded-xl bg-pink-50 p-3 text-pink-900">未达成指标需要说明阻塞原因、下一步责任人和预计完成时间。</p>
              <p className="rounded-xl bg-gray-50 p-3">确认目标后，可直接引用到写汇报页面，并由汇报助手生成草稿。</p>
            </div>
            <button onClick={() => navigate('/work-report')} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pink-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-800">
              <CheckCircle2 size={16} />
              引用到写汇报
            </button>
          </aside>
        </div>
      </div>
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

