import { Bell, TrendingUp, FileText, Calendar as CalendarIcon, Settings, Edit3, Plus, X, CheckCircle2, Eye, EyeOff, Layout, Layers, ChevronRight, MoreHorizontal, RefreshCw, ExternalLink, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

// 定义卡片类型
type CardType = 'stats' | 'process' | 'documents' | 'projects' | 'calendar' | 'systems' | 'courses';

// 卡片配置接口
interface CardConfig {
  id: CardType;
  name: string;
  icon: React.ReactNode;
  visible: boolean;
  order: number;
}

type System = {
  id: string;
  name: string;
  icon: string;
  bgColor?: string;
};

// 初始化卡片配置
const initialCards: CardConfig[] = [
  { id: 'stats', name: '数据概览', icon: <TrendingUp size={20} />, visible: true, order: 0 },
  { id: 'process', name: '待批阅流程', icon: <FileText size={20} />, visible: true, order: 1 },
  { id: 'documents', name: '今日未读文档', icon: <FileText size={20} />, visible: true, order: 2 },
  { id: 'projects', name: '关注的项目进度', icon: <Layers size={20} />, visible: true, order: 3 },
  { id: 'calendar', name: '周历', icon: <CalendarIcon size={20} />, visible: true, order: 4 },
  { id: 'systems', name: '常用系统', icon: <Layout size={20} />, visible: true, order: 5 },
  { id: 'courses', name: '临期课程', icon: <FileText size={20} />, visible: true, order: 6 },
];

const defaultSystems: System[] = [
  { id: 'hr', name: '人力资源', icon: '👤', bgColor: 'bg-blue-500' },
  { id: 'finance', name: '财务系统', icon: '💰', bgColor: 'bg-green-500' },
  { id: 'oa', name: 'OA办公', icon: '📋', bgColor: 'bg-pink-700' },
  { id: 'travel', name: '差旅系统', icon: '✈️', bgColor: 'bg-cyan-500' },
  { id: 'crm', name: 'CRM系统', icon: '👥', bgColor: 'bg-indigo-500' },
  { id: 'project', name: '项目管理', icon: '📊', bgColor: 'bg-amber-500' },
];

export default function Personal_Enterprise() {
  // 卡片配置状态
  const [cards, setCards] = useState<CardConfig[]>(() => {
    const saved = localStorage.getItem('dashboardCards');
    return saved ? JSON.parse(saved) : initialCards;
  });
  
  // 系统选择状态
  const [systems, setSystems] = useState<System[]>(() => {
    const saved = localStorage.getItem('dashboardSystems');
    return saved ? JSON.parse(saved) : defaultSystems;
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [jumpTip, setJumpTip] = useState<string | null>(null);
  const [selectedSystems, setSelectedSystems] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedSystems');
    return saved ? JSON.parse(saved) : ['hr', 'finance', 'oa', 'travel'];
  });

  // 切换菜单显示
  const toggleMenu = useCallback((id: string) => {
    setMenuId(prev => prev === id ? null : id);
  }, []);

  const showJumpTip = useCallback((destination: string) => {
    setJumpTip(destination);
    window.setTimeout(() => setJumpTip(null), 1800);
  }, []);

  // 保存卡片配置
  useEffect(() => {
    localStorage.setItem('dashboardCards', JSON.stringify(cards));
  }, [cards]);

  // 保存系统选择
  useEffect(() => {
    localStorage.setItem('dashboardSystems', JSON.stringify(systems));
    localStorage.setItem('selectedSystems', JSON.stringify(selectedSystems));
  }, [systems, selectedSystems]);

  // 切换卡片可见性
  const toggleCard = useCallback((id: CardType) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, visible: !card.visible } : card
    ));
  }, []);

  // 切换系统选择
  const toggleSystem = useCallback((id: string) => {
    setSelectedSystems(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  }, []);

  // 过滤可见的卡片并排序
  const visibleCards = cards
    .filter(card => card.visible)
    .sort((a, b) => a.order - b.order);

  // 过滤显示的系统
  const displayedSystems = systems.filter(sys => selectedSystems.includes(sys.id));

  return (
    <div className="bg-gradient-to-br from-gray-50 via-pink-50/50 to-white min-h-screen">
      {jumpTip && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900/90 px-5 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur">
          将跳转至：{jumpTip}
        </div>
      )}
      {/* 页面头部 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-700 to-pink-900 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-700/20">
                <Layout size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">我的工作台</h1>
                <p className="text-sm text-gray-500">2026年5月21日 · 周四</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSettings(true)}
              className="group relative flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-pink-200 hover:bg-pink-50/50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Edit3 size={18} className="text-gray-500 group-hover:text-pink-700 transition-colors" />
              <span className="text-sm font-medium text-gray-600 group-hover:text-pink-800">编辑布局</span>
            </button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧内容 */}
          <div className="lg:col-span-8 space-y-6">
            {/* 数据概览卡片 */}
            {visibleCards.find(c => c.id === 'stats') && (
              <div className="group relative">
                <div className="grid grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
                  <StatsCard title="流程审批" count="21" color="pink" destination="OA" menuId={menuId} onToggleMenu={toggleMenu} onNavigate={showJumpTip} />
                  <StatsCard title="业务收入" amount="¥12,580,000" change="+12.5%" color="green" destination="数据看板" menuId={menuId} onToggleMenu={toggleMenu} onNavigate={showJumpTip} />
                  <StatsCard title="待办事项" count="8" color="amber" destination="任务" menuId={menuId} onToggleMenu={toggleMenu} onNavigate={showJumpTip} />
                  <StatsCard title="项目进度" count="12" color="blue" destination="项目管理平台" menuId={menuId} onToggleMenu={toggleMenu} onNavigate={showJumpTip} />
                </div>
              </div>
            )}

            {/* 待批阅流程 */}
            {visibleCards.find(c => c.id === 'process') && (
              <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                      <FileText size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">待批阅流程</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">3条</span>
                    <div className="relative">
                      <button 
                        onClick={() => toggleMenu('process')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreHorizontal size={18} className="text-gray-400" />
                      </button>
                      {menuId === 'process' && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => toggleMenu('')} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Eye size={16} className="text-gray-400" />
                              <span>查看全部</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <RefreshCw size={16} className="text-gray-400" />
                              <span>刷新列表</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings size={16} className="text-gray-400" />
                              <span>卡片设置</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <ProcessItemFlow 
                    title="关于开展2026年第二期黄沙活动的预告" 
                    code="编号：TSP-2026-0073" 
                    creator="李正刚" 
                    time="2026-05-10 12:42:33" 
                    location="4执行"
                  />
                  <ProcessItemFlow 
                    title="关于高乐飞机涂装宣传" 
                    code="编号：TSP-2026-0074" 
                    creator="李正刚" 
                    time="2026-05-10 15:11:53" 
                    location="4执行"
                  />
                  <ProcessItemFlow 
                    title="关于航空安保系统的上传固件申请" 
                    code="编号：TSP-2026-0075" 
                    creator="赵创新" 
                    time="2026-05-10 13:36:19" 
                    location="4执行"
                  />
                </div>
              </div>
            )}

            {/* 今日未读文档 */}
            {visibleCards.find(c => c.id === 'documents') && (
              <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                      <FileText size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">今日未读文档</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">5条</span>
                    <div className="relative">
                      <button 
                        onClick={() => toggleMenu('documents')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreHorizontal size={18} className="text-gray-400" />
                      </button>
                      {menuId === 'documents' && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => toggleMenu('')} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Eye size={16} className="text-gray-400" />
                              <span>查看全部</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <RefreshCw size={16} className="text-gray-400" />
                              <span>刷新列表</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings size={16} className="text-gray-400" />
                              <span>卡片设置</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <DocumentItem 
                    title="关于明确公司领导分工工作和工作接替顺序的通知" 
                    time="2026-05-20 09:25:07"
                  />
                  <DocumentItem 
                    title="关于发布浦东-伊宁、浦东-喀什新开航线评估结果的通知" 
                    time="2026-05-20 09:20:05"
                  />
                  <DocumentItem 
                    title="关于做好2026年上半年工作总结和下半年工作计划的通知" 
                    time="2026-05-19 13:10:09"
                  />
                  <DocumentItem 
                    title="关于发布《上海吉祥航空股份有限公司安全警示教育长效机制（试行）》的通知" 
                    time="2026-05-19 10:12:34"
                  />
                </div>
              </div>
            )}

            {/* 关注的项目进度 */}
            {visibleCards.find(c => c.id === 'projects') && (
              <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-xl flex items-center justify-center">
                      <Layers size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">关注的项目进度</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-sm font-medium rounded-full">2个</span>
                    <div className="relative">
                      <button 
                        onClick={() => toggleMenu('projects')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreHorizontal size={18} className="text-gray-400" />
                      </button>
                      {menuId === 'projects' && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => toggleMenu('')} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Eye size={16} className="text-gray-400" />
                              <span>查看全部</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <RefreshCw size={16} className="text-gray-400" />
                              <span>刷新进度</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings size={16} className="text-gray-400" />
                              <span>卡片设置</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <GanttChart projectName="新一代智能客服系统" progress={65} tasks={[
                    { name: '需求分析', start: 0, end: 20, completed: true },
                    { name: '系统设计', start: 15, end: 35, completed: true },
                    { name: '开发实现', start: 30, end: 70, completed: 60 },
                    { name: '测试验证', start: 65, end: 85, completed: false },
                    { name: '上线部署', start: 80, end: 100, completed: false }
                  ]} />
                  <GanttChart projectName="企业数据平台" progress={40} tasks={[
                    { name: '需求分析', start: 0, end: 25, completed: true },
                    { name: '系统设计', start: 20, end: 45, completed: true },
                    { name: '开发实现', start: 40, end: 80, completed: 20 },
                    { name: '测试验证', start: 75, end: 90, completed: false },
                    { name: '上线部署', start: 85, end: 100, completed: false }
                  ]} />
                </div>
              </div>
            )}
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-4 space-y-6">
            {/* 周历 */}
            {visibleCards.find(c => c.id === 'calendar') && (
              <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-600 to-pink-800 rounded-xl flex items-center justify-center">
                      <CalendarIcon size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">2026年5月</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-pink-50 rounded-xl transition-colors">
                      <Plus size={18} className="text-pink-700" />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => toggleMenu('calendar')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreHorizontal size={18} className="text-gray-400" />
                      </button>
                      {menuId === 'calendar' && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => toggleMenu('')} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Eye size={16} className="text-gray-400" />
                              <span>查看全部</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <RefreshCw size={16} className="text-gray-400" />
                              <span>刷新日历</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings size={16} className="text-gray-400" />
                              <span>卡片设置</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center mb-6">
                  {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                    <div key={day} className="text-xs font-semibold text-gray-400 py-2">{day}</div>
                  ))}
                  {[17, 18, 19, 20, 21, 22, 23].map(date => (
                    <div key={date} className="flex justify-center py-1.5">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all duration-200 ${
                          date === 20
                            ? 'bg-gradient-to-br from-pink-700 to-pink-900 text-white font-bold shadow-lg shadow-pink-700/20'
                            : date === 21
                              ? 'text-gray-800 font-medium'
                              : 'text-gray-400'
                        }`}
                      >
                        {date}
                      </span>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-pink-700">5月20日</span>
                    <span className="text-gray-400">行程</span>
                  </h4>
                  <div className="space-y-2">
                    <CalendarEvent time="全天" title="全天值班" color="bg-gray-100" textColor="text-gray-700" />
                    <CalendarEvent time="10:00-11:00" title="项目周会" color="bg-pink-100" textColor="text-pink-900" />
                    <CalendarEvent time="13:00-13:30" title="日程" color="bg-blue-100" textColor="text-blue-900" />
                    <CalendarEvent time="14:00-15:30" title="工会活动" color="bg-green-100" textColor="text-green-900" />
                  </div>
                </div>
              </div>
            )}

            {/* 常用系统卡片 */}
            {visibleCards.find(c => c.id === 'systems') && (
              <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center">
                      <Layout size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">常用系统</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full">
                      {displayedSystems.length}个
                    </span>
                    <div className="relative">
                      <button 
                        onClick={() => toggleMenu('systems')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreHorizontal size={18} className="text-gray-400" />
                      </button>
                      {menuId === 'systems' && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => toggleMenu('')} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Layout size={16} className="text-gray-400" />
                              <span>管理应用</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings size={16} className="text-gray-400" />
                              <span>卡片设置</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {displayedSystems.map(sys => (
                    <button 
                      key={sys.id}
                      className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100"
                    >
                      <div className={`w-12 h-12 ${sys.bgColor || 'bg-blue-500'} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                        <span className="text-xl text-white">{sys.icon}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{sys.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 临期课程 */}
            {visibleCards.find(c => c.id === 'courses') && (
              <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                      <FileText size={20} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">临期课程</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-sm font-medium text-pink-700 hover:text-pink-900 transition-colors">
                      查看全部 →
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => toggleMenu('courses')}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreHorizontal size={18} className="text-gray-400" />
                      </button>
                      {menuId === 'courses' && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => toggleMenu('')} />
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Eye size={16} className="text-gray-400" />
                              <span>查看全部</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <RefreshCw size={16} className="text-gray-400" />
                              <span>刷新列表</span>
                            </button>
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Settings size={16} className="text-gray-400" />
                              <span>卡片设置</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <CourseItem 
                    title="上海吉祥航空股份有限公司IT质量指标评估标准V6.0" 
                    time="5节课 · 10积分"
                    color="blue"
                  />
                  <CourseItem 
                    title="民航华东地区2026年行业管理工作报告的通知" 
                    time="1节课 · 10积分"
                    color="purple"
                  />
                  <CourseItem 
                    title="王金董事长在公司2026年工作会议上的重要讲话" 
                    time="1节课 · 10积分"
                    color="pink"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 设置面板 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setShowSettings(false)}
          />
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl border-l border-gray-100 overflow-hidden animate-slide-in">
            {/* 面板头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 z-10">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">编辑布局</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500">选择要在工作台显示的卡片</p>
            </div>

            {/* 面板内容 */}
            <div className="p-6 space-y-8 overflow-y-auto h-[calc(100%-120px)]">
              {/* 卡片选择 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">功能卡片</h3>
                <div className="space-y-2">
                  {cards.map(card => (
                    <button
                      key={card.id}
                      onClick={() => toggleCard(card.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 ${
                        card.visible 
                          ? 'border-pink-200 bg-pink-50/50 hover:border-pink-300' 
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          card.visible 
                            ? 'bg-gradient-to-br from-pink-700 to-pink-900 text-white' 
                            : 'bg-gray-200 text-gray-400'
                        }`}>
                          {card.icon}
                        </div>
                        <span className={`font-medium ${card.visible ? 'text-gray-800' : 'text-gray-400'}`}>
                          {card.name}
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                        card.visible 
                          ? 'bg-gradient-to-br from-pink-700 to-pink-900' 
                          : 'bg-gray-200'
                      }`}>
                        {card.visible && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 常用系统选择 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">常用系统</h3>
                <div className="grid grid-cols-2 gap-3">
                  {systems.map(sys => (
                    <button
                      key={sys.id}
                      onClick={() => toggleSystem(sys.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 ${
                        selectedSystems.includes(sys.id)
                          ? 'border-pink-200 bg-pink-50/50'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedSystems.includes(sys.id)
                          ? sys.bgColor || 'bg-blue-500'
                          : 'bg-gray-200'
                      }`}>
                        <span className={`text-lg ${selectedSystems.includes(sys.id) ? 'text-white' : 'text-gray-400'}`}>
                          {sys.icon}
                        </span>
                      </div>
                      <span className={`text-sm font-medium ${selectedSystems.includes(sys.id) ? 'text-gray-700' : 'text-gray-400'}`}>
                        {sys.name}
                      </span>
                      {selectedSystems.includes(sys.id) && (
                        <CheckCircle2 size={14} className="text-pink-700" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 面板底部 */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-3 bg-gradient-to-r from-pink-700 to-pink-900 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-pink-700/25 transition-all duration-300"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </div>
  );
}

// 统一的数据统计卡片组件
function StatsCard({ title, count, amount, change, color, destination, menuId, onToggleMenu, onNavigate }: { 
  title: string; 
  count?: string; 
  amount?: string;
  change?: string;
  color: string;
  destination: string;
  menuId: string | null;
  onToggleMenu: (id: string) => void;
  onNavigate: (destination: string) => void;
}) {
  const colorMap = {
    pink: { bg: 'bg-pink-100', icon: 'text-pink-700', border: 'border-pink-200', gradient: 'from-pink-700 to-pink-900' },
    green: { bg: 'bg-green-100', icon: 'text-green-700', border: 'border-green-200', gradient: 'from-green-600 to-green-800' },
    amber: { bg: 'bg-amber-100', icon: 'text-amber-700', border: 'border-amber-200', gradient: 'from-amber-600 to-amber-800' },
    blue: { bg: 'bg-blue-100', icon: 'text-blue-700', border: 'border-blue-200', gradient: 'from-blue-600 to-blue-800' },
  };
  const c = colorMap[color as keyof typeof colorMap];
  
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(destination)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onNavigate(destination);
        }
      }}
      className={`group relative bg-white rounded-2xl shadow-sm border-2 ${c.border} p-4 sm:p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer min-w-0`}
    >
      <div className={`absolute -top-10 -right-10 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br ${c.gradient} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
      <div className="flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <p className="text-gray-500 text-xs sm:text-sm font-medium">{title}</p>
          <div className="relative">
            <button 
              onClick={(event) => {
                event.stopPropagation();
                onToggleMenu(`stats-${color}`);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal size={16} className="text-gray-400" />
            </button>
            {menuId === `stats-${color}` && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => onToggleMenu('')} />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <ExternalLink size={16} className="text-gray-400" />
                    <span>查看详情</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <RefreshCw size={16} className="text-gray-400" />
                    <span>刷新数据</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings size={16} className="text-gray-400" />
                    <span>卡片设置</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div className="space-y-1 min-w-0">
            {count && <p className="text-2xl sm:text-3xl font-bold text-gray-800 truncate">{count}</p>}
            {amount && <p className="text-[clamp(1.05rem,2.1vw,1.75rem)] font-bold text-gray-800 truncate leading-tight">{amount}</p>}
            {change && (
              <p className="text-green-600 text-xs sm:text-sm flex items-center font-medium">
                <TrendingUp size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate">{change} <span className="text-gray-400 sm:inline">较上月</span></span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 其他组件保持不变

function ProcessItemFlow({ title, code, creator, time, location }: { title: string; code: string; creator: string; time: string; location: string }) {
  return (
    <div className="group p-4 border border-gray-100 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-pink-50/50 hover:border-blue-100 transition-all duration-300 cursor-pointer">
      <div className="flex items-start gap-3 mb-2">
        <span className="text-blue-500 text-lg">📋</span>
        <h4 className="font-semibold text-gray-800 flex-1 group-hover:text-blue-900 transition-colors">{title}</h4>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 ml-7">
        <span className="px-2 py-0.5 bg-gray-100 rounded">{code}</span>
        <span className="px-2 py-0.5 bg-gray-100 rounded">创建者：{creator}</span>
        <span className="px-2 py-0.5 bg-gray-100 rounded">{location}</span>
      </div>
    </div>
  );
}

function DocumentItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-300 cursor-pointer">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 truncate group-hover:text-purple-900 transition-colors">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      <ChevronRight size={16} className="text-gray-400 group-hover:text-pink-600 transition-colors" />
    </div>
  );
}

function GanttChart({ projectName, progress, tasks }: { projectName: string; progress: number; tasks: { name: string; start: number; end: number; completed: boolean | number }[] }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:border-cyan-100 hover:bg-cyan-50/30 transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">{projectName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">进度</span>
          <span className="text-sm font-bold text-cyan-700">{progress}%</span>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-xs text-gray-600 truncate">{task.name}</div>
            <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  task.completed === true 
                    ? 'bg-gradient-to-r from-green-500 to-green-700' 
                    : typeof task.completed === 'number' && task.completed > 0 
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-700' 
                      : 'bg-gray-300'
                }`}
                style={{ width: typeof task.completed === 'number' ? `${task.completed}%` : '100%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarEvent({ time, title, color, textColor }: { time: string; title: string; color: string; textColor: string }) {
  return (
    <div className={`group flex items-center gap-3 p-3 ${color} rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer`}>
      <div className={`w-20 text-sm font-semibold ${textColor}`}>{time}</div>
      <div className={`flex-1 text-sm ${textColor} group-hover:opacity-80`}>{title}</div>
    </div>
  );
}

function CourseItem({ title, time, color }: { title: string; time: string; color: string }) {
  const colorMap = {
    blue: { bg: 'bg-blue-500', border: 'border-blue-100' },
    purple: { bg: 'bg-purple-500', border: 'border-purple-100' },
    pink: { bg: 'bg-pink-700', border: 'border-pink-100' },
    green: { bg: 'bg-green-500', border: 'border-green-100' },
  };
  const c = colorMap[color as keyof typeof colorMap];

  return (
    <div className={`group flex gap-3 p-4 border border-gray-100 rounded-xl hover:${c.border} hover:bg-gray-50 transition-all duration-300 cursor-pointer`}>
      <div className={`w-14 h-14 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}>
        <span className="text-xl">📚</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-800 truncate leading-tight">{title}</h4>
        <p className="text-xs text-gray-500 mt-2">{time}</p>
      </div>
      <ChevronRight size={16} className="text-gray-400 group-hover:text-pink-600 flex-shrink-0 transition-colors" />
    </div>
  );
}
