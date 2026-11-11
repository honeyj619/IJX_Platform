import { useState } from 'react';
import { Clock } from 'lucide-react';
import {
  SCHEDULE_MONTH, SCHEDULE_TODAY, SCHEDULE_LUNAR, SCHEDULE_TASK_BADGE, SCHEDULE_TASKS,
} from '@/data/app/calendar';

const WEEK_HEADERS = ['日', '一', '二', '三', '四', '五', '六'];

/** App 日程（参照截图 IMG2/IMG3/IMG4：顶部「日程/任务」两个 Tab 切换，无返回按钮） */
export default function AppSchedule() {
  const [tab, setTab] = useState<'schedule' | 'tasks'>('schedule');

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      {/* 顶部：日程/任务 双 Tab（居中） */}
      <header className="flex h-12 shrink-0 items-center justify-center gap-8 border-b border-[#ebedf0] bg-white px-2">
        <TabButton active={tab === 'schedule'} onClick={() => setTab('schedule')} label="日程" />
        <TabButton active={tab === 'tasks'} onClick={() => setTab('tasks')} label="任务" badge={SCHEDULE_TASK_BADGE} />
      </header>

      {tab === 'schedule' ? <ScheduleCalendar /> : <TaskList />}
    </div>
  );
}

function TabButton({ active, onClick, label, badge }: { active: boolean; onClick: () => void; label: string; badge?: string }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1 border-b-2 pb-1.5 text-[16px] ${active ? 'border-[#f53a71] font-medium text-[#f53a71]' : 'border-transparent text-[#646566]'}`}
    >
      {label}
      {badge && (
        <span className="grid h-4 min-w-[16px] place-items-center rounded-full bg-[#f53a71] px-1 text-[10px] font-medium leading-none text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

/** 日程 Tab：月历 */
function ScheduleCalendar() {
  const { year, month } = SCHEDULE_MONTH;
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-3 mt-3 rounded-2xl bg-white px-3 py-4 shadow-sm">
        <div className="text-center text-[16px] font-semibold text-[#323233]">
          {year} 年 {month} 月
        </div>
        <div className="mt-3 grid grid-cols-7 text-center">
          {WEEK_HEADERS.map((w) => (
            <div key={w} className="py-1 text-[12px] text-[#969799]">{w}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === SCHEDULE_TODAY;
            const lunar = SCHEDULE_LUNAR[day];
            const isTerm = lunar === '小雪';
            return (
              <div key={day} className="flex flex-col items-center py-1">
                <span
                  className={`grid h-8 w-8 place-items-center rounded-full text-[14px] ${
                    isToday ? 'bg-[#f53a71] font-semibold text-white' : 'text-[#323233]'
                  }`}
                >
                  {day}
                </span>
                {lunar && (
                  <span className={`mt-0.5 text-[10px] ${isTerm ? 'text-[#f53a71]' : 'text-[#969799]'}`}>{lunar}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** 任务 Tab：待处理 / 已处理 分段 + 任务列表 */
function TaskList() {
  const [view, setView] = useState<'todo' | 'done'>('todo');
  const todo = SCHEDULE_TASKS.filter((t) => !t.done);
  const done = SCHEDULE_TASKS.filter((t) => t.done);
  const list = view === 'todo' ? todo : done;

  return (
    <div className="flex h-full flex-col">
      {/* 待处理 / 已处理 分段 */}
      <div className="shrink-0 bg-white px-4 pb-2 pt-1">
        <div className="flex items-center gap-5">
          <button
            onClick={() => setView('todo')}
            className={`border-b-2 pb-1.5 text-[15px] ${view === 'todo' ? 'border-[#f53a71] font-medium text-[#f53a71]' : 'border-transparent text-[#646566]'}`}
          >
            待处理 {todo.length}
          </button>
          <button
            onClick={() => setView('done')}
            className={`border-b-2 pb-1.5 text-[15px] ${view === 'done' ? 'border-[#f53a71] font-medium text-[#f53a71]' : 'border-transparent text-[#646566]'}`}
          >
            已处理 {done.length}
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {list.length === 0 ? (
          <div className="py-20 text-center text-[13px] text-[#969799]">暂无数据</div>
        ) : (
          <div className="space-y-2.5">
            {list.map((t) => (
              <div key={t.id} className="rounded-xl bg-white px-3.5 py-3 shadow-sm">
                <div className="text-[14px] text-[#323233]">{t.title}</div>
                {t.remindAt && (
                  <div className="mt-1 flex items-center gap-1 text-[12px] text-[#969799]">
                    <Clock size={12} /> 提醒我：{t.remindAt}
                  </div>
                )}
                {(t.creator || t.participants?.length) && (
                  <div className="mt-1 text-[12px] text-[#969799]">
                    {t.creator && <>创建人：{t.creator}</>}
                    {t.participants?.length ? <> · 参与人：{t.participants.join('、')}</> : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
