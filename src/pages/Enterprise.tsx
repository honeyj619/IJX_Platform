import { Search, MessageSquare, Smartphone, BarChart3, ChevronLeft, ChevronRight, Plus, Settings, Edit3, X, Mail, Monitor, MoreHorizontal, Users, DollarSign, Headphones, FileCheck, ShoppingCart, Plane, UserCircle, Kanban } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Personal_Enterprise from './Personal_Enterprise';
import { getDemoPerson } from '../data/people';

// 常用系统数据 - 与导航栏业务系统保持一致
const ALL_SYSTEMS = [
  { id: 'hr', name: '人力资源', icon: <Users size={16} />, bgColor: 'bg-blue-500', category: '效率办公' },
  { id: 'finance', name: '财务系统', icon: <DollarSign size={16} />, bgColor: 'bg-green-500', category: '业务管理' },
  { id: 'it', name: 'IT服务台', icon: <Headphones size={16} />, bgColor: 'bg-purple-500', category: '效率办公' },
  { id: 'oa', name: 'OA办公', icon: <FileCheck size={16} />, bgColor: 'bg-pink-500', category: '效率办公' },
  { id: 'procurement', name: '采购管理', icon: <ShoppingCart size={16} />, bgColor: 'bg-orange-500', category: '业务管理' },
  { id: 'travel', name: '差旅系统', icon: <Plane size={16} />, bgColor: 'bg-cyan-500', category: '效率办公' },
  { id: 'crm', name: 'CRM系统', icon: <UserCircle size={16} />, bgColor: 'bg-indigo-500', category: '业务管理' },
  { id: 'project', name: '项目管理', icon: <Kanban size={16} />, bgColor: 'bg-amber-500', category: '业务管理' },
];

const SYSTEM_CATEGORIES = ['效率办公', '业务管理'];

// 近期待办数据
const TODO_ITEMS = [
  {
    title: '关于"AI动态趋势洞察周报"的公告发布申请_20260522',
    status: '正常',
    date: '2026-05-25 10:03:29',
  },
  {
    title: 'SOB-2026-Q7 关于规范跨航司联运不正常行李补偿索赔流程的...',
    status: '正常',
    date: '2026-05-22 13:31:54',
  },
];

// 文件中心数据
const FILE_ITEMS = [
  { title: '关于开展2026年部分中坚层岗位评聘及选聘的通知', isNew: true, date: '2026-05-25 08:49:34' },
  { title: '关于开展2026年IOSA审计准备工作的通知', isNew: true, date: '2026-05-22 14:07:39' },
  { title: '关于开展飞行机组人为差错系统性专项整治工作的通知', isNew: true, date: '2026-05-22 10:53:46' },
  { title: '关于组织开展公司飞行员岗位胜任力提升专项行动的通知', isNew: true, date: '2026-05-22 09:46:04' },
  { title: '关于发布《上海吉祥航空股份有限公司旅客遗失物品管理办法(R3)》的通知', isNew: true, date: '2026-05-21 14:45:35' },
];

type PortalType = 'personal' | 'enterprise';

function getPortalTypeFromSearch(search: string): PortalType {
  const tab = new URLSearchParams(search).get('tab');
  if (tab === 'enterprise') return 'enterprise';
  return 'personal';
}

export default function Enterprise() {
  const location = useLocation();
  const navigate = useNavigate();
  const [portalType, setPortalType] = useState<PortalType>(() => getPortalTypeFromSearch(window.location.search));
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedSystems');
    return saved ? JSON.parse(saved) : ['hr', 'finance', 'it', 'oa'];
  });

  useEffect(() => {
    setPortalType(getPortalTypeFromSearch(location.search));
  }, [location.search]);

  const switchPortalType = (nextType: PortalType) => {
    setPortalType(nextType);
    let nextPath = '/web_client/enterprise';
    if (nextType === 'enterprise') nextPath = '/web_client/enterprise?tab=enterprise';
    navigate(nextPath, { replace: false });
  };

  useEffect(() => {
    localStorage.setItem('selectedSystems', JSON.stringify(selectedSystems));
  }, [selectedSystems]);

  const toggleSystem = (id: string) => {
    setSelectedSystems(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id) 
        : [...prev, id]
    );
  };

  const displayedSystems = ALL_SYSTEMS.filter(sys => selectedSystems.includes(sys.id));

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* 内联工具栏 — 轻量切换条 */}
      <div className="flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/60 dark:border-gray-700/60 shrink-0">
        <div className="flex items-center bg-gray-100/80 dark:bg-gray-700/80 rounded-lg p-0.5">
          <button
            onClick={() => switchPortalType('personal')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              portalType === 'personal'
                ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            个人门户
          </button>
          <button
            onClick={() => switchPortalType('enterprise')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              portalType === 'enterprise'
                ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            企业门户
          </button>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400">
          <Search size={18} />
        </button>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-y-auto">
      {portalType === 'personal' ? (
        <div className="relative">
          <Personal_Enterprise />
        </div>
      ) : (
        <div className="relative">
          {/* Banner 轮播区域 */}
          <div className="relative w-full h-[320px] md:h-[380px] lg:h-[420px] overflow-hidden">
            {/* 背景渐变 */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200/60 via-purple-200/50 to-pink-300/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-100/40 via-transparent to-purple-100/40" />
            
            {/* 云层背景装饰 */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-10 left-[5%] w-64 h-32 bg-white/40 rounded-full blur-2xl" />
              <div className="absolute top-20 right-[10%] w-80 h-40 bg-pink-100/50 rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-[20%] w-96 h-48 bg-purple-100/40 rounded-full blur-3xl" />
              <div className="absolute top-[30%] right-[30%] w-72 h-36 bg-white/30 rounded-full blur-2xl" />
            </div>

            {/* 飞机图片（左侧） */}
            <div className="absolute left-[8%] top-1/2 -translate-y-1/2 z-10">
              <img 
                src="https://api.dicebear.com/7.x/shapes/svg?seed=airplane&backgroundColor=transparent"
                alt="飞机"
                className="w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 object-contain opacity-80"
              />
            </div>
            
            {/* 左右切换箭头 */}
            <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 backdrop-blur-sm z-20 transition-colors">
              <ChevronLeft size={24} />
            </button>
            <button className="absolute right-[320px] top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 backdrop-blur-sm z-20 transition-colors">
              <ChevronRight size={24} />
            </button>
            
            {/* Banner 内容 */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-7xl md:text-8xl lg:text-9xl font-bold text-pink-800/80 tracking-wider mb-2">
                  2025
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-pink-900/90 tracking-widest mb-4">
                  可持续发展报告
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-16 bg-pink-400/60" />
                  <p className="text-lg md:text-xl text-pink-800/80 font-medium">
                    上海吉祥航空股份有限公司
                  </p>
                  <div className="h-px w-16 bg-pink-400/60" />
                </div>
              </div>
            </div>

            {/* 轮播指示点 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              <div className="w-8 h-1 bg-white/80 rounded-full" />
              <div className="w-8 h-1 bg-white/40 rounded-full" />
              <div className="w-8 h-1 bg-white/40 rounded-full" />
            </div>
            
            {/* 右侧我的待办卡片 */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-64 bg-gradient-to-br from-purple-800/95 to-pink-700/95 backdrop-blur rounded-xl text-white overflow-hidden shadow-xl z-20">
              <div className="p-4 border-b border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">我的待办</h3>
                    <p className="text-white/70 text-xs">OA流程、审批</p>
                  </div>
                  <div className="text-4xl font-light">13</div>
                </div>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>公司值班领导</span>
                  <span className="text-amber-200 font-medium">{getDemoPerson(22)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>公司总值班</span>
                  <span className="text-amber-200 font-medium">{getDemoPerson(23)}</span>
                </div>
                <button className="text-white/70 hover:text-white text-xs flex items-center gap-1 mt-1">
                  查看公司值班表
                </button>
              </div>
              <div className="px-4 pb-4">
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=120&fit=crop"
                    alt="会议"
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <h4 className="text-white text-xs font-bold">吉祥航空2026年度会议</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
            {/* 近期待办 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Monitor size={20} className="text-gray-600 dark:text-gray-300" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">近期待办</h2>
                </div>
                <button className="bg-pink-700 hover:bg-pink-800 text-white px-6 py-1.5 rounded text-sm font-medium transition-colors">
                  查看全部
                </button>
              </div>
              
              <div className="space-y-3">
                {TODO_ITEMS.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <span className="text-pink-500 text-xs">▸</span>
                    <span className="text-gray-700 dark:text-gray-200 flex-1 truncate">{item.title}</span>
                    <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded text-xs whitespace-nowrap">{item.status}</span>
                    <span className="text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 文件中心和我的日程 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 文件中心 */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">文件中心</h2>
                      <div className="flex gap-3 text-sm">
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">通告中心</button>
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">手册制度</button>
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">文化专栏</button>
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">部门文档</button>
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">内部招聘</button>
                      </div>
                    </div>
                    <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm">More</button>
                  </div>
                </div>
                
                {/* 文件子标签 */}
                <div className="px-5">
                  <div className="flex border-b border-gray-200 dark:border-gray-600 overflow-x-auto">
                    <button className="px-4 py-2.5 border-b-2 border-pink-700 text-pink-700 font-medium text-sm whitespace-nowrap">公司文件</button>
                    <button className="px-4 py-2.5 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm whitespace-nowrap">党群文件</button>
                    <button className="px-4 py-2.5 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm whitespace-nowrap">会议纪要</button>
                    <button className="px-4 py-2.5 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm whitespace-nowrap">人事任免</button>
                    <button className="px-4 py-2.5 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm whitespace-nowrap">工作简报</button>
                    <button className="px-4 py-2.5 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm whitespace-nowrap">局方文件</button>
                    <button className="px-4 py-2.5 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm whitespace-nowrap">外部文件</button>
                    <button className="px-4 py-2.5 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm whitespace-nowrap">安全管理</button>
                  </div>
                  
                  {/* 文件列表 */}
                  <div className="py-3">
                    {FILE_ITEMS.map((file, index) => (
                      <div key={index} className="flex items-center justify-between py-2.5 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 dark:text-gray-200 text-sm truncate">{file.title}</span>
                          {file.isNew && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
                        </div>
                        <span className="text-gray-400 dark:text-gray-500 text-xs whitespace-nowrap">{file.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 我的日程 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <CalendarIcon />
                      </div>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white">我的日程</h2>
                    </div>
                    <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm">更多日程</button>
                  </div>
                </div>
                
                <div className="p-5">
                  {/* 日历头部 */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">2026.05</h3>
                    <div className="flex items-center gap-1">
                      <button className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <Plus size={14} className="dark:text-gray-300" />
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <ChevronLeft size={14} className="dark:text-gray-300" />
                      </button>
                      <button className="px-2 py-0.5 bg-pink-700 text-white rounded text-xs">今日</button>
                      <button className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <ChevronRight size={14} className="dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                  
                  {/* 日历网格 */}
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-2">
                    <div className="grid grid-cols-7 gap-0 text-center mb-1">
                      <div className="text-gray-400 dark:text-gray-500 text-xs py-1">日</div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs py-1">一</div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs py-1">二</div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs py-1">三</div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs py-1">四</div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs py-1">五</div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs py-1">六</div>
                    </div>
                    <div className="grid grid-cols-7 gap-0 text-center text-sm">
                      <div className="py-1.5 text-gray-400 dark:text-gray-600">24</div>
                      <div className="py-1.5 bg-pink-700 text-white rounded font-medium">25</div>
                      <div className="py-1.5 text-gray-800 dark:text-gray-200">26</div>
                      <div className="py-1.5 text-gray-800 dark:text-gray-200 relative">
                        27
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
                      </div>
                      <div className="py-1.5 text-gray-800 dark:text-gray-200 relative">
                        28
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
                      </div>
                      <div className="py-1.5 text-gray-800 dark:text-gray-200">29</div>
                      <div className="py-1.5 text-gray-800 dark:text-gray-200">30</div>
                    </div>
                  </div>

                  {/* 今日无日程提示 */}
                  <div className="mt-4 text-center py-4">
                    <div className="text-gray-300 dark:text-gray-600 mb-2">
                      <Monitor size={32} className="mx-auto" />
                    </div>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">当日暂无日程</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>{/* end flex-1 overflow-y-auto */}

      {/* 企业门户专属右侧固定悬浮栏 */}
      {portalType === 'enterprise' && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 shadow-lg rounded-l-xl flex flex-col overflow-hidden z-30">
          {/* IT提报 */}
          <div className="p-2 bg-pink-700 text-white">
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                <MessageSquare size={14} />
              </div>
              <span className="text-xs font-medium">IT提报</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1 p-2">
            <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              <MoreHorizontal size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              <Mail size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              <Smartphone size={18} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              <BarChart3 size={18} />
            </button>
          </div>
          
          {/* 如意助手悬浮 */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-2">
            <div className="relative flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=ruyi_assistant"
                  alt="如意助手"
                  className="w-full h-full"
                />
              </div>
              <span className="text-[10px] text-pink-500 mt-0.5">如意助手</span>
            </div>
          </div>
        </div>
      )}

      {/* 常用系统设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white dark:bg-gray-800 shadow-xl w-full max-w-lg h-full overflow-hidden flex flex-col">
            {/* 弹窗头部 */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">常用应用</h3>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 搜索框 */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="搜索"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            
            {/* 已添加应用 */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">已添加应用 ({selectedSystems.length})</span>
                <button className="text-sm text-pink-700 dark:text-pink-400 hover:underline">管理</button>
              </div>
            </div>
            
            {/* 全部应用 */}
            <div className="flex-1 overflow-auto">
              <div className="p-4">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3">全部应用</h4>
                
                {/* 分类标签 */}
                <div className="flex gap-2 mb-4">
                  {SYSTEM_CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      className="px-3 py-1.5 text-sm font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg"
                    >
                      {cat}
                    </button>
                  ))}
                  <button className="px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">其他</button>
                  <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                {/* 应用列表 */}
                {SYSTEM_CATEGORIES.map(category => (
                  <div key={category} className="mb-6">
                    <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{category}</h5>
                    <div className="space-y-2">
                      {ALL_SYSTEMS.filter(sys => sys.category === category).map(sys => (
                        <div 
                          key={sys.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${sys.bgColor || 'bg-blue-500'} rounded-lg flex items-center justify-center`}>
                              <span className="text-white">{sys.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-white">{sys.name}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">来源于审批</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleSystem(sys.id)}
                            className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
                              selectedSystems.includes(sys.id)
                                ? 'border-pink-700 text-pink-700 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                                : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-pink-300 dark:hover:border-pink-600 hover:text-pink-700 dark:hover:text-pink-400'
                            }`}
                          >
                            {selectedSystems.includes(sys.id) ? '已添加' : '添加'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 日历图标组件
function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}


