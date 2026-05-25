import { Search, MessageSquare, Smartphone, BarChart3, ArrowUp, ChevronLeft, ChevronRight, Plus, Settings, Edit3, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Personal_Enterprise from './Personal_Enterprise';

// 门户切换组件
function PortalSwitcher({ 
  portalType, 
  onPortalChange 
}: { 
  portalType: 'personal' | 'enterprise';
  onPortalChange: (type: 'personal' | 'enterprise') => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md border border-pink-100 p-1.5 flex gap-1">
        <button
          onClick={() => onPortalChange('personal')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            portalType === 'personal'
              ? 'bg-pink-700 text-white shadow-sm hover:bg-pink-800'
              : 'text-gray-500 hover:text-pink-700 hover:bg-pink-50'
          }`}
        >
          个人门户
        </button>
        <button
          onClick={() => onPortalChange('enterprise')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            portalType === 'enterprise'
              ? 'bg-pink-700 text-white shadow-sm hover:bg-pink-800'
              : 'text-gray-500 hover:text-pink-700 hover:bg-pink-50'
          }`}
        >
          企业门户
        </button>
      </div>
    </div>
  );
}

// 常用系统数据 - 与导航栏业务系统保持一致
const ALL_SYSTEMS = [
  { id: 'hr', name: '人力资源', icon: '👤', bgColor: 'bg-blue-500', category: '效率办公' },
  { id: 'finance', name: '财务系统', icon: '💰', bgColor: 'bg-green-500', category: '业务管理' },
  { id: 'it', name: 'IT服务台', icon: '💻', bgColor: 'bg-purple-500', category: '效率办公' },
  { id: 'oa', name: 'OA办公', icon: '📋', bgColor: 'bg-pink-500', category: '效率办公' },
  { id: 'procurement', name: '采购管理', icon: '🛒', bgColor: 'bg-orange-500', category: '业务管理' },
  { id: 'travel', name: '差旅系统', icon: '✈️', bgColor: 'bg-cyan-500', category: '效率办公' },
  { id: 'crm', name: 'CRM系统', icon: '👥', bgColor: 'bg-indigo-500', category: '业务管理' },
  { id: 'project', name: '项目管理', icon: '📊', bgColor: 'bg-amber-500', category: '业务管理' },
];

const SYSTEM_CATEGORIES = ['效率办公', '业务管理'];

export default function Enterprise() {
  const [portalType, setPortalType] = useState<'personal' | 'enterprise'>(() => {
    const saved = localStorage.getItem('portalType');
    return (saved === 'personal' || saved === 'enterprise') ? saved : 'enterprise';
  });
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 20)); 
  const [showSettings, setShowSettings] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState<string[]>(() => {
    const saved = localStorage.getItem('selectedSystems');
    return saved ? JSON.parse(saved) : ['hr', 'finance', 'it', 'oa'];
  });

  useEffect(() => {
    localStorage.setItem('portalType', portalType);
  }, [portalType]);

  useEffect(() => {
    localStorage.setItem('selectedSystems', JSON.stringify(selectedSystems));
  }, [selectedSystems]);

  const handlePortalChange = (type: 'personal' | 'enterprise') => {
    setPortalType(type);
  };

  const toggleSystem = (id: string) => {
    setSelectedSystems(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id) 
        : [...prev, id]
    );
  };

  const displayedSystems = ALL_SYSTEMS.filter(sys => selectedSystems.includes(sys.id));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 漂浮的门户切换组件 */}
      <PortalSwitcher portalType={portalType} onPortalChange={handlePortalChange} />

      {/* 企业门户专属导航栏 */}
      {portalType === 'enterprise' && (
        <>
          {/* 顶部导航栏 */}
          <div className="bg-pink-700 text-white px-4 py-2 flex justify-end">
            <button className="flex items-center gap-1 hover:bg-pink-600 px-3 py-1 rounded">
              <span>语言</span>
              <span className="text-xs">▼</span>
            </button>
          </div>
          
          {/* 主导航栏 */}
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center border border-amber-200">
                  <div className="text-pink-700 font-bold text-xl">龍</div>
                </div>
                <div>
                  <div className="text-pink-700 font-bold text-lg">JUNEYAO AIR</div>
                  <div className="text-pink-700 font-medium">吉祥航空</div>
                </div>
              </div>
              
              {/* 导航菜单 */}
              <nav className="flex items-center gap-8">
                <button className="text-gray-800 font-medium hover:text-pink-700 transition-colors">首页</button>
                <button className="text-gray-800 font-medium hover:text-pink-700 transition-colors">文档中心</button>
                <button className="text-gray-800 font-medium hover:text-pink-700 transition-colors">流程中心</button>
                <button className="text-gray-800 font-medium hover:text-pink-700 transition-colors">协作办公</button>
                <button className="text-gray-800 font-medium hover:text-pink-700 transition-colors">AI工作台</button>
                <button className="text-gray-800 font-medium hover:text-pink-700 transition-colors">业务系统</button>
                <button className="text-gray-800 font-medium hover:text-pink-700 transition-colors">航班动态</button>
                <button className="text-gray-800 font-medium hover:text-pink-700 transition-colors">通讯录</button>
                <button className="text-gray-800 font-medium hover:text-pink-700 transition-colors">数据看板</button>
              </nav>
              
              {/* 右侧用户区 */}
              <div className="flex items-center gap-4">
                <button className="text-gray-600 hover:text-pink-700">
                  <Search size={20} />
                </button>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <img 
                    src="https://api.dicebear.com/7.x/initials/svg?seed=梁劼&backgroundColor=ec4899" 
                    alt="用户" 
                    className="w-full h-full rounded-full"
                  />
                </div>
                <span className="text-gray-700 font-medium">梁劼</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 主内容区 */}
      {portalType === 'personal' ? (
        <div className="relative">
          <Personal_Enterprise 
            displayedSystems={displayedSystems}
            onSettingsClick={() => setShowSettings(true)}
          />
        </div>
      ) : (
        <div className="relative">
          {/* 广告横幅 */}
          <div className="relative w-full h-[280px] md:h-[340px] lg:h-[400px] bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-700">
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-40 right-32 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl"></div>
              </div>
              
              {/* 左侧导航箭头 */}
              <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <ChevronLeft size={24} />
              </button>
              
              {/* 横幅内容 */}
              <div className="relative z-10 text-center text-white max-w-4xl px-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="bg-white/20 px-4 py-2 rounded text-lg font-semibold">1458N</span>
                  <div className="h-px bg-white/30 flex-1 max-w-[120px] md:max-w-[160px] lg:max-w-[200px]"></div>
                  <div className="text-lg">✈️</div>
                  <div className="h-px bg-white/30 flex-1 max-w-[120px] md:max-w-[160px] lg:max-w-[200px]"></div>
                </div>
                <h1 className="text-6xl font-bold mb-2 tracking-wider">
                  <span className="text-white/90">“</span>
                  一五五
                  <span className="text-white/90">”</span>
                  <span className="ml-3">战略规划</span>
                </h1>
                <p className="text-lg text-white/80 mt-4 flex items-center justify-center gap-8">
                  <span>✈️</span>
                  <span>打造客户价值引领、数智驱动运营的“世界一流航空公司”</span>
                  <span>✈️</span>
                </p>
              </div>
              
              {/* 右侧导航箭头 */}
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white">
                <ChevronRight size={24} />
              </button>
              
              {/* 右侧我的待办卡片 */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 w-72 bg-gradient-to-br from-purple-900/90 to-pink-800/90 backdrop-blur rounded-xl text-white overflow-hidden">
                <div className="p-4 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">我的待办</h3>
                      <p className="text-white/70 text-sm">OA流程、审批</p>
                    </div>
                    <div className="text-5xl font-light">11</div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">公司值班领导</span>
                    <span className="text-amber-200 font-medium">杨志华</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">公司总值班</span>
                    <span className="text-amber-200 font-medium">王东</span>
                  </div>
                  <button className="text-white/70 hover:text-white text-sm flex items-center gap-1">
                    查看公司值班表
                  </button>
                </div>
                <div className="px-4 pb-4">
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-pink-400/30 to-purple-500/30">
                    <img 
                      src="https://api.dicebear.com/7.x/shapes/svg?seed=jixiang_event&backgroundColor=fce7f3"
                      alt="会议"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                      <h4 className="text-white font-bold">吉祥航空2026年度会议</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            {/* 近期待办 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-2xl">☑️</div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">近期待办</h2>
                </div>
                <button className="bg-pink-700 hover:bg-pink-800 text-white px-8 py-2 rounded font-medium transition-colors">
                  查看全部
                </button>
              </div>
              
              <div className="mt-4 ml-13 space-y-2">
                <div className="flex items-center gap-4">
                  <span className="text-pink-600">▸</span>
                  <span className="text-gray-700">ITSR-2026-05 信息管理部2026年4月主动式IT服务工作月度报告</span>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded text-sm">正常</span>
                  <span className="text-gray-400 ml-auto">2026-05-13 08:46:59</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-pink-600">▸</span>
                  <span className="text-gray-700">IS-2026-06 信息管理部2026年4月安全管理工作月度报告</span>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded text-sm">正常</span>
                  <span className="text-gray-400 ml-auto">2026-05-09 16:17:06</span>
                </div>
              </div>
            </div>

            {/* 文件中心和我的日程 */}
            <div className="grid grid-cols-3 gap-6">
              {/* 文件中心 */}
              <div className="col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-3xl font-bold text-gray-800">文件中心</h2>
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-gray-600 font-medium">通告中心</button>
                        <button className="text-gray-400 hover:text-gray-600 font-medium">手册制度</button>
                        <button className="text-gray-400 hover:text-gray-600 font-medium">文化专栏</button>
                        <button className="text-gray-400 hover:text-gray-600 font-medium">部门文档</button>
                        <button className="text-gray-400 hover:text-gray-600 font-medium">内部招聘</button>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">More</button>
                  </div>
                </div>
                
                {/* 文件标签页 */}
                <div className="px-6">
                  <div className="flex border-b border-gray-200">
                    <button className="px-4 py-3 border-b-2 border-pink-700 text-pink-700 font-medium">公司文件</button>
                    <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">党群文件</button>
                    <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">会议纪要</button>
                    <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">人事任免</button>
                    <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">工作简报</button>
                    <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">局方文件</button>
                    <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">外部文件</button>
                    <button className="px-4 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700">安全管理</button>
                  </div>
                  
                  {/* 文件列表 */}
                  <div className="py-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-800 font-medium">关于发布《上海吉祥航空股份有限公司海外经营合规管理制度（试行）》的...</span>
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                      </div>
                      <span className="text-gray-400 text-sm">2026-05-20 14:21:49</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 我的日程 */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <div className="text-blue-600 text-xl">🪪</div>
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800">我的日程</h2>
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-gray-600 font-medium">公司会议</button>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">更多日程</button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* 日历头部 */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">2026.05</h3>
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">
                        <Plus size={16} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">
                        <ChevronLeft size={16} />
                      </button>
                      <button className="px-3 py-1 bg-pink-700 text-white rounded text-sm">今日</button>
                      <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-gray-50">
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {/* 日历网格 */}
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      <div className="text-gray-400 text-sm py-2">日</div>
                      <div className="text-gray-400 text-sm py-2">一</div>
                      <div className="text-gray-400 text-sm py-2">二</div>
                      <div className="text-gray-400 text-sm py-2">三</div>
                      <div className="text-gray-400 text-sm py-2">四</div>
                      <div className="text-gray-400 text-sm py-2">五</div>
                      <div className="text-gray-400 text-sm py-2">六</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      <div className="py-2 text-gray-400">17</div>
                      <div className="py-2 text-gray-400">18</div>
                      <div className="py-2 text-gray-400">19</div>
                      <div className="py-2 bg-pink-700 text-white rounded font-medium">20</div>
                      <div className="py-2 text-gray-800">21</div>
                      <div className="py-2 text-gray-800">22</div>
                      <div className="py-2 text-gray-800">23</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 企业门户专属右侧固定悬浮栏 */}
      {portalType === 'enterprise' && (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-l-xl flex flex-col overflow-hidden z-30">
          <div className="flex flex-col items-center gap-1 p-2">
            <button className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-600">
              <MessageSquare size={20} />
            </button>
            <button className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-600">
              <div className="text-lg">✉️</div>
            </button>
            <button className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-600">
              <Smartphone size={20} />
            </button>
            <button className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-600">
              <BarChart3 size={20} />
            </button>
            <button className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-600">
              <ArrowUp size={20} />
            </button>
          </div>
          
          {/* 如意助手悬浮 */}
          <div className="border-t border-gray-100 p-2">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center overflow-hidden">
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=ruyi_assistant"
                  alt="如意助手"
                  className="w-full h-full"
                />
              </div>
              <div className="absolute -left-2 -bottom-1 bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                如意助手
              </div>
            </div>
          </div>
          
          {/* IT提报 */}
          <div className="border-t border-gray-100 p-3 bg-pink-700 text-white">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                <div className="text-sm">📝</div>
              </div>
              <span className="text-sm font-medium">IT提报</span>
            </div>
          </div>
        </div>
      )}

      {/* 常用系统设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white shadow-xl w-full max-w-lg h-full overflow-hidden flex flex-col">
            {/* 弹窗头部 */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-bold text-gray-800">常用应用</h3>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 搜索框 */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            
            {/* 已添加应用 */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">已添加应用 ({selectedSystems.length})</span>
                <button className="text-sm text-pink-700 hover:underline">管理</button>
              </div>
            </div>
            
            {/* 全部应用 */}
            <div className="flex-1 overflow-auto">
              <div className="p-4">
                <h4 className="font-medium text-gray-800 mb-3">全部应用</h4>
                
                {/* 分类标签 */}
                <div className="flex gap-2 mb-4">
                  {SYSTEM_CATEGORIES.map(cat => (
                    <button 
                      key={cat}
                      className="px-3 py-1.5 text-sm font-medium bg-pink-100 text-pink-700 rounded-lg"
                    >
                      {cat}
                    </button>
                  ))}
                  <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600">其他</button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                {/* 应用列表 */}
                {SYSTEM_CATEGORIES.map(category => (
                  <div key={category} className="mb-6">
                    <h5 className="text-sm font-medium text-gray-500 mb-3">{category}</h5>
                    <div className="space-y-2">
                      {ALL_SYSTEMS.filter(sys => sys.category === category).map(sys => (
                        <div 
                          key={sys.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${sys.bgColor || 'bg-blue-500'} rounded-lg flex items-center justify-center`}>
                              <span className="text-lg text-white">{sys.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{sys.name}</p>
                              <p className="text-xs text-gray-400">来源于审批</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleSystem(sys.id)}
                            className={`px-4 py-1.5 text-sm rounded-lg border transition-colors ${
                              selectedSystems.includes(sys.id)
                                ? 'border-pink-700 text-pink-700 hover:bg-pink-50'
                                : 'border-gray-200 text-gray-500 hover:border-pink-300 hover:text-pink-700'
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
