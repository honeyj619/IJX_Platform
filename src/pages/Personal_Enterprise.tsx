import { Bell, TrendingUp, FileText, Calendar as CalendarIcon, Folder, Settings, ChevronLeft, X } from 'lucide-react';
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

export default function Personal_Enterprise() {
  const [selectedSystems, setSelectedSystems] = useState<string[]>(['hr', 'finance', 'oa', 'travel']);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('selectedSystems');
    if (saved) {
      setSelectedSystems(JSON.parse(saved));
    }
  }, []);

  const toggleSystem = (id: string) => {
    const newSystems = selectedSystems.includes(id)
      ? selectedSystems.filter(s => s !== id)
      : [...selectedSystems, id];
    setSelectedSystems(newSystems);
    localStorage.setItem('selectedSystems', JSON.stringify(newSystems));
  };

  const displayedSystems = ALL_SYSTEMS.filter(sys => selectedSystems.includes(sys.id));

  return (
    <div className="bg-gray-50 min-h-screen">
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
    </div>
  );
}