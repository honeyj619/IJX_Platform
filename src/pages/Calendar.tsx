import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarItem {
  id: string;
  name: string;
  color: string;
  type: 'managed' | 'subscribed';
  checked: boolean;
}

interface Event {
  id: number;
  date: string;
  title: string;
  type: 'meeting' | 'business' | 'vacation' | 'other';
  location?: string;
}

const events: Event[] = [
  { id: 1, date: '2025-05-01', title: '项目立项会议', type: 'meeting' },
  { id: 2, date: '2025-05-04', title: 'H01253 北京', type: 'business', location: '北京' },
  { id: 3, date: '2025-05-04', title: '午餐', type: 'other' },
  { id: 4, date: '2025-05-22', title: '值班', type: 'other' },
  { id: 5, date: '2025-05-22', title: 'H01253 上海', type: 'business', location: '上海' },
  { id: 6, date: '2025-05-29', title: '0.5天休假', type: 'vacation' },
  { id: 7, date: '2025-05-31', title: '休', type: 'vacation' },
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date('2025-05-22'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'meeting-room' | 'reservation'>('schedule');
  const [calendarList, setCalendarList] = useState<CalendarItem[]>([
    { id: '1', name: '梁吉力', color: 'bg-slate-600', type: 'managed', checked: true },
    { id: '2', name: '我的任务', color: 'bg-pink-500', type: 'managed', checked: true },
    { id: '3', name: '公司日历', color: 'bg-rose-500', type: 'managed', checked: true },
    { id: '4', name: '梁吉力的排班日历', color: 'bg-amber-500', type: 'subscribed', checked: true },
    { id: '5', name: 'honeyLeung', color: 'bg-emerald-500', type: 'subscribed', checked: false },
    { id: '6', name: '张必强', color: 'bg-cyan-500', type: 'subscribed', checked: false },
  ]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  const isToday = (date: Date) => {
    const today = new Date('2025-05-22');
    return date.toDateString() === today.toDateString();
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const toggleCalendar = (id: string) => {
    setCalendarList(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const managedCalendars = calendarList.filter(c => c.type === 'managed');
  const subscribedCalendars = calendarList.filter(c => c.type === 'subscribed');

  return (
    
      <div className="h-full flex flex-col bg-slate-50 w-full">
        <div className="bg-white border-b border-slate-200/60 py-3 px-6 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-pink-100 p-1.5">
              <button 
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'schedule' ? 'bg-pink-700 text-white shadow-sm hover:bg-pink-800' : 'text-gray-500 hover:text-pink-700 hover:bg-pink-50'}`}
                onClick={() => setActiveTab('schedule')}
              >
                日历
              </button>
              <button 
                className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'meeting-room' ? 'bg-pink-700 text-white shadow-sm hover:bg-pink-800' : 'text-gray-500 hover:text-pink-700 hover:bg-pink-50'}`}
                onClick={() => setActiveTab('meeting-room')}
              >
                会议室
              </button>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-theme-600 text-white rounded-xl text-sm font-medium hover:bg-theme-700 transition-colors shadow-lg">
                <Plus size={18} />
                创建日程
              </button>
            </div>
          </div>
        </div>

        <div className="py-0 w-full flex-1 overflow-hidden">
          <div className="flex flex-col lg:flex-row h-full w-full">
            <div className="lg:w-80 shrink-0 bg-white lg:border-r lg:border-slate-200/60 h-full overflow-y-auto">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-theme-600 hover:bg-theme-50 rounded-lg transition-colors"
                      onClick={() => changeMonth('prev')}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-theme-600 hover:bg-theme-50 rounded-lg transition-colors"
                      onClick={() => changeMonth('next')}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {weekdays.map((day, index) => (
                    <div key={index} className="text-center text-xs font-medium text-slate-400 py-1">
                      {day[1]}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.slice(0, 35).map((item, index) => {
                    const today = isToday(item.date);
                    return (
                      <div 
                        key={index} 
                        className={`w-9 h-9 flex items-center justify-center text-xs ${item.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'} ${today ? 'bg-theme-600 text-white rounded-full font-bold' : 'hover:bg-theme-50 rounded-full transition-colors'}`}
                      >
                        {item.day}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 border-b border-slate-100">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={16} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="搜索联系人、公共日历" 
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-0 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-theme-400/50 focus:bg-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="p-5">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-theme-50 hover:bg-theme-100 text-theme-700 rounded-xl text-sm font-medium transition-colors mb-6 border-2 border-theme-200">
                  <Plus size={18} />
                  <span>添加日历</span>
                </button>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-theme-500 rounded-full" />
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">我管理的</h4>
                  </div>
                  <div className="space-y-1">
                    {managedCalendars.map((calendar) => (
                      <label 
                        key={calendar.id}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={calendar.checked}
                            onChange={() => toggleCalendar(calendar.id)}
                            className="sr-only peer"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${calendar.checked ? `${calendar.color} border-transparent` : 'border-slate-300 bg-white hover:border-slate-400'}`}>
                            {calendar.checked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${calendar.color} ${!calendar.checked && 'opacity-40'}`} />
                        <span className={`text-sm ${calendar.checked ? 'text-slate-700' : 'text-slate-400'}`}>{calendar.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-theme-500 rounded-full" />
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">我订阅的</h4>
                  </div>
                  <div className="space-y-1">
                    {subscribedCalendars.map((calendar) => (
                      <label 
                        key={calendar.id}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <div className="relative">
                          <input 
                            type="checkbox" 
                            checked={calendar.checked}
                            onChange={() => toggleCalendar(calendar.id)}
                            className="sr-only peer"
                          />
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${calendar.checked ? `${calendar.color} border-transparent` : 'border-slate-300 bg-white hover:border-slate-400'}`}>
                            {calendar.checked && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full ${calendar.color} ${!calendar.checked && 'opacity-40'}`} />
                        <span className={`text-sm ${calendar.checked ? 'text-slate-700' : 'text-slate-400'}`}>{calendar.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col bg-white">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-theme-50 text-theme-700 rounded-xl text-sm font-medium hover:bg-theme-100 transition-colors border border-theme-200">
                    今天
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-theme-600 hover:bg-theme-50 rounded-lg transition-colors"
                      onClick={() => changeMonth('prev')}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      className="w-9 h-9 flex items-center justify-center text-slate-600 hover:text-theme-600 hover:bg-theme-50 rounded-lg transition-colors"
                      onClick={() => changeMonth('next')}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-900 text-lg">{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h3>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button className="px-4 py-2 text-sm text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-all hover:shadow-sm">
                    日
                  </button>
                  <button className="px-4 py-2 text-sm text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-all hover:shadow-sm">
                    周
                  </button>
                  <button className="px-4 py-2 text-sm bg-theme-600 text-white rounded-lg shadow-sm">
                    月
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {weekdays.map((day, index) => (
                    <div key={index} className="py-4 text-center text-sm font-semibold text-slate-500 border-r border-slate-100 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {calendarDays.map((item, index) => {
                    const dateEvents = getEventsForDate(item.date);
                    const today = isToday(item.date);
                    
                    return (
                      <div 
                        key={index} 
                        className={`min-h-[120px] p-3 border-r border-b border-slate-100 ${index % 7 === 6 ? 'border-r-0' : ''} ${item.isCurrentMonth ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                        <div className="flex justify-end mb-2">
                          {today ? (
                            <div className="w-8 h-8 bg-theme-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {item.day}
                            </div>
                          ) : (
                            <span className={`text-sm w-8 h-8 flex items-center justify-center ${item.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                              {item.day}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          {dateEvents.slice(0, 3).map((event) => (
                            <div 
                              key={event.id} 
                              className={`text-xs px-2 py-1.5 rounded-lg truncate ${event.type === 'meeting' ? 'bg-red-50 text-red-700' : event.type === 'business' ? 'bg-theme-50 text-theme-700' : event.type === 'vacation' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dateEvents.length > 3 && (
                            <div className="text-xs text-slate-400 px-2">+{dateEvents.length - 3} 更多</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
  );
}
