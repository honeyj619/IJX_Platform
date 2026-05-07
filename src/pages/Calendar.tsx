import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/Layout';

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
  const [view, setView] = useState<'month' | 'year'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'schedule' | 'meeting-room' | 'reservation'>('schedule');

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

    // 添加上个月的天数
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }

    // 添加当前月的天数
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
    }

    // 添加下个月的天数
    const remainingDays = 42 - days.length; // 6 rows x 7 days
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

  const changeYear = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + (direction === 'prev' ? -1 : 1));
      return newDate;
    });
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 w-full">
        {/* 顶部导航 */}
        <div className="bg-white border-b border-gray-200 py-3 px-4 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
            <div className="flex items-center gap-4">
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'schedule' ? 'text-theme-600 border-b-2 border-theme-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('schedule')}
              >
                日历
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'meeting-room' ? 'text-theme-600 border-b-2 border-theme-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('meeting-room')}
              >
                会议室
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'reservation' ? 'text-theme-600 border-b-2 border-theme-600' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setActiveTab('reservation')}
              >
                预约活动
              </button>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="bg-theme-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-theme-700 transition-colors">
                创建日程
              </button>
              <div className="flex items-center gap-2">
                <button className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </button>
                <button className="text-gray-600 hover:text-gray-900 p-2 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 主内容 */}
        <div className="py-0 w-full">
          <div className="flex flex-col lg:flex-row h-[calc(100vh-72px)] w-full">
            {/* 第二列：小日历和日历管理 */}
            <div className="lg:w-80 shrink-0 bg-white border-r border-gray-200 h-full overflow-y-auto">
              {/* 小日历 */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => changeMonth('prev')}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => changeMonth('next')}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {weekdays.map((day, index) => (
                    <div key={index} className="text-center text-xs font-medium text-gray-500">
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
                        className={`w-8 h-8 flex items-center justify-center text-xs ${item.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${today ? 'bg-theme-500 text-white rounded-full font-bold' : ''}`}
                      >
                        {item.day}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 搜索栏 */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜索联系人、公共日历" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={16} className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* 日历管理 */}
              <div className="p-4">
                <button className="flex items-center gap-2 text-theme-600 hover:text-theme-800 transition-colors text-sm font-medium mb-4">
                  <span>+</span>
                  <span>添加日历</span>
                </button>
                
                {/* 我管理的 */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">我管理的</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded text-theme-600 focus:ring-theme-500" />
                      <span>梁吉力</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded text-pink-600 focus:ring-pink-500" />
                      <span>我的任务</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded text-pink-600 focus:ring-pink-500" />
                      <span>公司日历</span>
                    </div>
                  </div>
                </div>
                
                {/* 我订阅的 */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">我订阅的</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <input type="checkbox" defaultChecked className="rounded text-pink-600 focus:ring-pink-500" />
                      <span>梁吉力的排班日历</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-pink-600 focus:ring-pink-500" />
                      <span>honeyLeung</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded text-pink-600 focus:ring-pink-500" />
                      <span>张必强</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 第三列：大日历 */}
            <div className="flex-1 flex flex-col bg-white">
              {/* 日期导航 */}
              <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors">
                    今天
                  </button>
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => changeMonth('prev')}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                      onClick={() => changeMonth('next')}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900">{currentDate.getFullYear()}年{currentDate.getMonth() + 1}月</h3>
                </div>
                <div className="flex items-center gap-1 border border-gray-200 rounded-md overflow-hidden">
                  <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    日
                  </button>
                  <button className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    周
                  </button>
                  <button className="px-3 py-1 text-sm bg-pink-50 text-pink-700 border-b-2 border-pink-500">
                    月
                  </button>
                </div>
              </div>

              {/* 日历 */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {weekdays.map((day, index) => (
                    <div key={index} className="py-3 text-center text-sm font-medium text-gray-500 border-r border-gray-100 last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 h-full">
                  {calendarDays.map((item, index) => {
                    const dateEvents = getEventsForDate(item.date);
                    const today = isToday(item.date);
                    
                    return (
                      <div 
                        key={index} 
                        className={`min-h-[100px] p-2 border-r border-b border-gray-100 ${index % 7 === 6 ? 'border-r-0' : ''} ${item.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          {today ? (
                            <div className="w-8 h-8 bg-theme-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {item.day}
                            </div>
                          ) : (
                            <span className={`text-sm ${item.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}`}>
                              {item.day}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {dateEvents.map((event) => (
                            <div 
                              key={event.id} 
                              className={`text-xs p-1 rounded truncate ${event.type === 'meeting' ? 'bg-red-50 text-red-700' : event.type === 'business' ? 'bg-pink-50 text-pink-700' : event.type === 'vacation' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}
                              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {event.title}
                              {event.location && <span className="text-gray-500"> · {event.location}</span>}
                            </div>
                          ))}
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
    </Layout>
  );
}
