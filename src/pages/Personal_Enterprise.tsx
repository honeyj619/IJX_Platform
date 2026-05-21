import { Bell, TrendingUp, FileText, Calendar as CalendarIcon, Folder, Settings, ChevronLeft, X, ChevronRight, MessageCircle, Phone, Mail, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

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

const DOCUMENTS = [
  { title: '关于明确公司航空安全委员会组成人员的通知', time: '2026-05-20 14:53:36', type: 'company' },
  { title: '关于发布《上海吉祥航空股份有限公司海外经营合规管理制度（试行）》的...', time: '2026-05-20 14:21:49', type: 'company', hot: true },
  { title: '关于开展2026年下半年兼职教员续聘工作的通知', time: '2026-05-20 09:14:36', type: 'company', hot: true },
  { title: '关于发布吉祥航空动火作业安全管理和建筑保温材料安全隐患排查整治专项...', time: '2026-05-20 09:12:58', type: 'company', hot: true },
];

const DOCUMENT_TABS = [
  { id: 'company', name: '公司文件' },
  { id: 'party', name: '党群文件' },
  { id: 'meeting', name: '会议纪要' },
  { id: 'personnel', name: '人事任免' },
  { id: 'brief', name: '工作简报' },
  { id: 'official', name: '局方文件' },
  { id: 'external', name: '外部文件' },
  { id: 'safety', name: '安全管理' },
];

export default function Personal_Enterprise() {
  const [portalType, setPortalType] = useState<'personal' | 'enterprise'>('personal');
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['hr', 'finance', 'oa', 'travel']);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDocTab, setActiveDocTab] = useState('company');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem('portalType');
    if (saved === 'personal' || saved === 'enterprise') {
      setPortalType(saved);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('selectedSystems');
    if (saved) {
      setSelectedSystems(JSON.parse(saved));
    }
  }, []);

  const handlePortalChange = (type: 'personal' | 'enterprise') => {
    setPortalType(type);
    localStorage.setItem('portalType', type);
  };

  const toggleSystem = (id: string) => {
    const newSystems = selectedSystems.includes(id)
      ? selectedSystems.filter(s => s !== id)
      : [...selectedSystems, id];
    setSelectedSystems(newSystems);
    localStorage.setItem('selectedSystems', JSON.stringify(newSystems));
  };

  const displayedSystems = ALL_SYSTEMS.filter(sys => selectedSystems.includes(sys.id));

  const renderCalendarDays = () => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = i === 21 && month === 4;
      const hasEvent = [18, 19, 20].includes(i);
      days.push(
        <button
          key={i}
          className={`h-10 flex flex-col items-center justify-center rounded-lg transition-colors relative ${
            isToday 
              ? 'bg-pink-700 text-white' 
              : i === currentDate.getDate() 
                ? 'bg-gray-100' 
                : 'hover:bg-gray-50'
          }`}
        >
          {i}
          {hasEvent && !isToday && (
            <span className="absolute bottom-1 w-1 h-1 bg-pink-400 rounded-full"></span>
          )}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <PortalSwitcher portalType={portalType} onPortalChange={handlePortalChange} />

      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
          <div className="bg-white shadow-xl w-full max-w-lg h-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowSettings(false)}>
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-bold text-gray-800">常用应用</h3>
              </div>
              <button onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索系统..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                已添加 {selectedSystems.length} 个应用
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4">
              {SYSTEM_CATEGORIES.map(category => {
                const categorySystems = ALL_SYSTEMS.filter(
                  sys => sys.category === category && 
                  sys.name.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (categorySystems.length === 0) return null;
                
                return (
                  <div key={category} className="mb-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">{category}</h4>
                    <div className="space-y-2">
                      {categorySystems.map(sys => {
                        const isSelected = selectedSystems.includes(sys.id);
                        return (
                          <button
                            key={sys.id}
                            onClick={() => toggleSystem(sys.id)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all"
                          >
                            <div className={`w-10 h-10 ${sys.bgColor} rounded-lg flex items-center justify-center`}>
                              <span className="text-lg text-white">{sys.icon}</span>
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-800">{sys.name}</p>
                            </div>
                            <button
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-pink-700 text-white'
                                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              }`}
                            >
                              {isSelected ? '已添加' : '添加'}
                            </button>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {portalType === 'personal' ? (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">我的日程</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-16 text-sm font-medium text-blue-600">09:00</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">项目周会</p>
                      <p className="text-sm text-gray-500">线上会议室</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-16 text-sm font-medium text-green-600">14:00</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">代码评审</p>
                      <p className="text-sm text-gray-500">开发组</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-800">常用系统</h3>
                  <button 
                    onClick={() => setShowSettings(true)} 
                    className="flex items-center gap-1 text-gray-500 hover:text-pink-700"
                  >
                    <Settings size={16} />
                    <span className="text-sm">设置</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {displayedSystems.map(sys => (
                    <button key={sys.id} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all">
                      <div className={`w-10 h-10 ${sys.bgColor} rounded-lg flex items-center justify-center`}>
                        <span className="text-lg text-white">{sys.icon}</span>
                      </div>
                      <span className="text-xs text-gray-600">{sys.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">最近文档</h3>
                <div className="space-y-3">
                  <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium text-gray-900 truncate">关于开展2025年第二期黄沙活动的预告</h4>
                    <p className="text-xs text-gray-500 mt-1">2025-06-10 12:42:33</p>
                  </div>
                  <div className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <h4 className="font-medium text-gray-900 truncate">关于高乐飞机涂装宣传</h4>
                    <p className="text-xs text-gray-500 mt-1">2025-06-10 15:11:53</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">快捷入口</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-pink-600" />
                    </div>
                    <span className="font-medium text-gray-800">流程审批</span>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Folder size={20} className="text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-800">知识库</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">待办事项</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-pink-600 rounded" />
                    <span className="text-sm text-gray-600">完成项目报告</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 text-pink-600 rounded" />
                    <span className="text-sm text-gray-600">审核文档</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100">
          <div className="relative bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 overflow-hidden">
            <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors z-10">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            
            <div className="flex items-center justify-center py-8 px-20">
              <div className="flex-1 text-center">
                <h1 className="text-4xl font-bold text-orange-700 mb-2">党员先锋在行动</h1>
                <h2 className="text-3xl font-bold text-orange-600 mb-3">理财知识宣贯</h2>
                <p className="text-orange-600">提升财商素养、增强个人理财规划能力</p>
                <div className="flex justify-center gap-4 mt-8">
                  <div className="w-2 h-2 bg-white rounded-full shadow"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                </div>
              </div>
              
              <div className="flex-1 max-w-md">
                <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-orange-400">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">活动背景</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    为进一步发挥党员先锋模范作用，切实将党建与业务相融合，帮助员工提升财商素养、增强个人理财规划能力，在金融服务中感受公司"家文化"的温度与关怀。
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <span className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full">活动安排</span>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 space-y-1">
                    <p><strong>活动时间：</strong>2026年5月22日 13:30-15:00</p>
                    <p><strong>活动地点：</strong>康桥2801会议室</p>
                    <p><strong>报名方式：</strong>名额有限，感兴趣的员工向直属党组织、组织委员报名，报名截止时间5月20日16:00</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-4 text-center">公司党委主办，财务党支部承办</p>
                </div>
              </div>
              
              <div className="w-64 flex-shrink-0">
                <div className="bg-gradient-to-b from-purple-300 to-purple-400 rounded-xl p-4 mb-4">
                  <h4 className="text-white font-medium mb-2">我的已办</h4>
                  <p className="text-white/80 text-sm">点击查看全部我的已办</p>
                </div>
                <div className="bg-gradient-to-b from-purple-400 to-purple-500 rounded-xl p-4 mb-4">
                  <div className="text-white">
                    <p className="text-sm opacity-80">公司值班领导</p>
                    <p className="font-bold">朱可辛</p>
                  </div>
                  <div className="text-white mt-2">
                    <p className="text-sm opacity-80">公司总值班</p>
                    <p className="font-bold">张正</p>
                  </div>
                  <button className="text-white/80 text-xs hover:text-white mt-3 flex items-center gap-1">
                    查看公司值班表
                  </button>
                </div>
                <div className="bg-white rounded-xl overflow-hidden shadow">
                  <img 
                    src="https://neeko-copilot.bytedance.net/api/text_to_image?prompt=Juneyao%20Air%202026%20conference%20banner%20pink%20purple%20gradient%20elegant%20airline&image_size=landscape_4_3" 
                    alt="吉祥航空2026年度会议" 
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3 text-center">
                    <p className="text-sm font-medium text-gray-700">吉祥航空2026年度会议</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors z-10">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-6 p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">文件中心</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <button className="text-gray-600 hover:text-pink-700">通告中心</button>
                      <button className="text-gray-400 hover:text-pink-700">手册制度</button>
                      <button className="text-gray-400 hover:text-pink-700">文化专栏</button>
                      <button className="text-gray-400 hover:text-pink-700">部门文档</button>
                      <button className="text-gray-400 hover:text-pink-700">内部招聘</button>
                    </div>
                    <button className="ml-auto text-gray-400 hover:text-pink-700 text-sm">More</button>
                  </div>
                  
                  <div className="flex border-b border-gray-100">
                    {DOCUMENT_TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveDocTab(tab.id)}
                        className={`px-4 py-3 text-sm font-medium transition-colors ${
                          activeDocTab === tab.id 
                            ? 'text-gray-800 border-b-2 border-pink-700' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-3">
                      {DOCUMENTS.map((doc, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 truncate">{doc.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{doc.time}</p>
                          </div>
                          {doc.hot && (
                            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={20} className="text-pink-600" />
                      <h3 className="font-semibold text-gray-800">我的日程</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-gray-600">公司会议</button>
                      <button className="text-gray-400 hover:text-pink-700 text-sm">更多日程</button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-gray-800">2026.05</span>
                      <div className="flex items-center gap-1">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <ChevronLeft size={16} />
                        </button>
                        <button className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">今日</button>
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                        <div key={day} className="text-center text-xs text-gray-400 font-medium">
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                      {renderCalendarDays()}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={14} className="text-pink-600" />
                        <span className="text-gray-600">16:30-18:00</span>
                        <span className="text-gray-800">管理支撑产品处例会</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed right-4 bottom-20 flex flex-col gap-3 z-50">
            <button className="w-12 h-12 bg-pink-700 rounded-full shadow-lg flex items-center justify-center hover:bg-pink-800 transition-colors">
              <MessageCircle size={20} className="text-white" />
            </button>
            <button className="w-12 h-12 bg-purple-600 rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-colors">
              <Phone size={20} className="text-white" />
            </button>
            <button className="w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Mail size={20} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}