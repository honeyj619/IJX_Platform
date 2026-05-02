import { useState, useEffect, useRef } from "react";
import { Search, ChevronRight, ChevronDown, Grid, List } from "lucide-react";
import Layout from "@/components/Layout";

interface System {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: string;
}

const categories = [
  { name: "人力系统", count: 9 },
  { name: "综合系统", count: 2 },
  { name: "运行系统", count: 14 },
  { name: "财务系统", count: 1 },
];

const systems: System[] = [
  { id: 1, name: "人力资源E-HR系统", category: "人力系统", description: "人力资源管理系统，支持员工信息管理、考勤、薪资等功能", icon: "users" },
  { id: 2, name: "office", category: "人力系统", description: "办公自动化系统，支持日常办公流程管理", icon: "briefcase" },
  { id: 3, name: "梧桐云学堂", category: "人力系统", description: "企业在线学习平台，提供丰富的课程资源", icon: "graduation-cap" },
  { id: 4, name: "绩效系统", category: "人力系统", description: "员工绩效考核管理系统", icon: "award" },
  { id: 5, name: "绩效系统南京分公司", category: "人力系统", description: "南京分公司绩效专项管理系统", icon: "building" },
  { id: 6, name: "绩效系统航服子公司", category: "人力系统", description: "航服子公司绩效专项管理系统", icon: "plane" },
  { id: 7, name: "OA", category: "综合系统", description: "办公自动化系统", icon: "folder-open" },
  { id: 8, name: "SMS系统", category: "运行系统", description: "短信服务管理系统", icon: "message-square" },
  { id: 9, name: "网上准备", category: "运行系统", description: "网上准备工作管理系统", icon: "check-circle" },
  { id: 10, name: "航班动态", category: "运行系统", description: "航班实时动态查询系统", icon: "plane-departure" },
  { id: 11, name: "机务维修", category: "运行系统", description: "机务维修管理系统", icon: "wrench" },
  { id: 12, name: "燃油监控系统", category: "运行系统", description: "燃油消耗监控与管理系统", icon: "fuel" },
  { id: 13, name: "维修手册系统", category: "运行系统", description: "维修手册查阅与管理系统", icon: "book-open" },
  { id: 14, name: "法定自查", category: "运行系统", description: "法定自查管理系统", icon: "file-check" },
  { id: 15, name: "运行网", category: "运行系统", description: "运行网络管理系统", icon: "network" },
  { id: 16, name: "考评系统", category: "人力系统", description: "员工考评管理系统", icon: "clipboard-list" },
  { id: 17, name: "内推系统", category: "人力系统", description: "内部推荐管理系统", icon: "user-plus" },
  { id: 18, name: "e吉祥管理后台", category: "运行系统", description: "吉祥航空管理后台系统", icon: "settings" },
  { id: 19, name: "人力数字平台管理系统", category: "人力系统", description: "人力资源数字化管理平台", icon: "database" },
  { id: 20, name: "BIP系统", category: "财务系统", description: "财务综合管理平台", icon: "dollar-sign" },
  { id: 21, name: "运行风控系统", category: "运行系统", description: "运行风险控制管理系统", icon: "shield" },
  { id: 22, name: "PLM系统", category: "运行系统", description: "产品生命周期管理系统", icon: "layers" },
  { id: 23, name: "航空安保管理系统", category: "运行系统", description: "航空安全保卫管理系统", icon: "shield-check" },
];

const iconSvgMap: Record<string, string> = {
  "users": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'></path><circle cx='9' cy='7' r='4'></circle><path d='M23 21v-2a4 4 0 0 0-3-3.87'></path><path d='M16 3.13a4 4 0 0 1 0 7.75'></path></svg>",
  "briefcase": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 2H18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z'></path><divide y1='10' x1='6' x2='18'></div></svg>",
  "graduation-cap": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 10v6M12 3v18M6 10l6-3 6 3M2 16l10-5 10 5'></path></svg>",
  "award": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='8' r='6'></circle><path d='M15.47 12.89 17 21H7l1.53-8.11'></path><path d='m9.7 15.8 2.3-2.3 2.3 2.3'></path></svg>",
  "building": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 12h-4l-3 9L9 3l-3 9H2'></path></svg>",
  "plane": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L8 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.8 2.8c.3.2.8.3 1.3.1l.5-.3c.4-.2.6-.6.5-1.1z'></path></svg>",
  "folder-open": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z'></path></svg>",
  "message-square": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'></path></svg>",
  "check-circle": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M22 11.08V12a10 10 0 1 1-5.93-9.14'></path><polyline points='22 4 12 14.01 9 11.01'></polyline></svg>",
  "plane-departure": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L8 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.8 2.8c.3.2.8.3 1.3.1l.5-.3c.4-.2.6-.6.5-1.1z'></path><path d='M15 10l5-3-5-3'></path></svg>",
  "wrench": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 0-7.94 0z'></path><path d='M17.6 8.4a1 1 0 0 0-1.4 0l-1.6-1.6a1 1 0 0 0-1.4 0l-2.3 2.3a1 1 0 0 0 0 1.4l6.6 6.6a1 1 0 0 0 1.4 0l2.3-2.3a1 1 0 0 0 0-1.4z'></path><path d='M21 16a9 9 0 0 1-9 9 9 9 0 0 1-6-2.3L3 13'></path></svg>",
  "fuel": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 22H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6'></path><path d='M17 22v-8H7v8'></path><path d='M18 9h-2.5a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3H16'></path></svg>",
  "book-open": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z'></path><path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'></path></svg>",
  "file-check": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z'></path><polyline points='14 2 14 8 20 8'></polyline><path d='M9 15l2 2 4-4'></path></svg>",
  "network": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><circle cx='12' cy='12' r='10'></circle><circle cx='12' cy='12' r='4'></circle><path d='m12 2 1.5 1.5'></path><path d='m12 20 1.5-1.5'></path><path d='m7.5 7.5 1.5 1.5'></path><path d='m16.5 16.5 1.5 1.5'></path><path d='m2 12 1.5 1.5'></path><path d='m20 12 1.5-1.5'></path><path d='m7.5 16.5-1.5 1.5'></path><path d='m16.5 7.5-1.5 1.5'></path></svg>",
  "clipboard-list": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='3' width='18' height='18' rx='2' ry='2'></rect><path d='M9 3v6h6V3'></path><path d='M9 15v6h6v-6'></path><path d='M6 9h12'></path><path d='M6 18h12'></path></svg>",
  "user-plus": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'></path><circle cx='9' cy='7' r='4'></circle><path d='M22 21v-2a4 4 0 0 0-3-3.87'></path><path d='M16 3.13a4 4 0 0 1 0 7.75'></path><path d='M16 11h6'></path><path d='M19 8v6'></path></svg>",
  "settings": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z'></path><circle cx='12' cy='12' r='3'></circle></svg>",
  "database": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><ellipse cx='12' cy='5' rx='9' ry='3'></ellipse><path d='M21 12c0 1.66-4 3-9 3s-9-1.34-9-3'></path><path d='M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5'></path></svg>",
  "dollar-sign": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><line x1='12' y1='1' x2='12' y2='23'></line><path d='M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'></path></svg>",
  "shield": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'></path></svg>",
  "layers": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polygon points='12 2 2 7 12 12 22 7 12 2'></polygon><polyline points='2 17 12 22 22 17'></polyline><polyline points='2 12 12 17 22 12'></polyline></svg>",
  "shield-check": "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9 12l2 2 4-4'></path><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'></path></svg>",
};

export default function Business() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [displayedCount, setDisplayedCount] = useState(8);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const observerRef = useRef<HTMLDivElement>(null);

  const filteredSystems = systems.filter(system => {
    const matchesSearch = system.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         system.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || 
                          selectedCategories.includes(system.category);
    return matchesSearch && matchesCategory;
  });

  const displayedSystems = filteredSystems.slice(0, displayedCount);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < filteredSystems.length) {
          setDisplayedCount(prev => Math.min(prev + 8, filteredSystems.length));
        }
      },
      { rootMargin: '200px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [displayedCount, filteredSystems.length]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const toggleExpandCategory = (categoryName: string) => {
    setExpandedCategory(prev => prev === categoryName ? null : categoryName);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSearchQuery('');
  };

  const getCategorySystems = (categoryName: string) => {
    return filteredSystems.filter(s => s.category === categoryName);
  };

  return (
    <Layout>
      <div className="flex h-full">
        {/* 左侧筛选栏 */}
        <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">类目筛选</h3>
            <button 
              onClick={clearFilters}
              className="text-theme-500 dark:text-theme-400 text-sm hover:text-theme-600 dark:hover:text-theme-300 flex items-center gap-1"
            >
              清除筛选
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">产品类别</h4>
            <div className="space-y-1">
              {categories.map(category => (
                <div key={category.name}>
                  <button
                    onClick={() => toggleExpandCategory(category.name)}
                    className="w-full flex items-center justify-between py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.name)}
                        onChange={() => toggleCategory(category.name)}
                        className="w-4 h-4 text-theme-500 dark:text-theme-400 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                      <span className="text-xs text-gray-400">({category.count})</span>
                    </div>
                    {expandedCategory === category.name ? (
                      <ChevronDown size={16} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-400" />
                    )}
                  </button>
                  
                  {expandedCategory === category.name && (
                    <div className="ml-6 mt-1 space-y-1">
                      {getCategorySystems(category.name).slice(0, 5).map(system => (
                        <button
                          key={system.id}
                          className="w-full text-left text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1.5 rounded transition-colors"
                        >
                          {system.name}
                        </button>
                      ))}
                      {getCategorySystems(category.name).length > 5 && (
                        <span className="text-xs text-gray-400 px-2">
                          还有 {getCategorySystems(category.name).length - 5} 个系统
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {/* 搜索栏 */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-xl">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索全部产品"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDisplayedCount(8);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 ring-theme-400 dark:ring-theme-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-theme-100 dark:bg-theme-900 text-theme-600 dark:text-theme-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-theme-100 dark:bg-theme-900 text-theme-600 dark:text-theme-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* 内容区域 */}
          <div className="p-6">
            {/* 系统分类列表 */}
            {categories.map(category => {
              const categorySystems = getCategorySystems(category.name);
              if (categorySystems.length === 0) return null;
              
              return (
                <div key={category.name} className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{category.name}</h2>
                    <ChevronRight size={18} className="text-gray-400" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">({categorySystems.length})</span>
                  </div>
                  
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categorySystems.slice(0, displayedCount).map(system => (
                        <div 
                          key={system.id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md hover:border-theme-200 dark:hover:border-theme-700 transition-all cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-theme-50 dark:bg-theme-900 flex items-center justify-center flex-shrink-0">
                              <span dangerouslySetInnerHTML={{ __html: iconSvgMap[system.icon] || iconSvgMap['folder-open'] }} className="text-theme-500 dark:text-theme-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-800 dark:text-white truncate">{system.name}</h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{system.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {categorySystems.slice(0, displayedCount).map(system => (
                        <div 
                          key={system.id}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-md hover:border-theme-200 dark:hover:border-theme-700 transition-all cursor-pointer flex items-center gap-3"
                        >
                          <div className="w-8 h-8 rounded-lg bg-theme-50 dark:bg-theme-900 flex items-center justify-center flex-shrink-0">
                            <span dangerouslySetInnerHTML={{ __html: iconSvgMap[system.icon] || iconSvgMap['folder-open'] }} className="text-theme-500 dark:text-theme-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-800 dark:text-white">{system.name}</h3>
                          </div>
                          <ChevronRight size={16} className="text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* 懒加载触发点 */}
            {displayedCount < filteredSystems.length && (
              <div ref={observerRef} className="flex justify-center py-8">
                <button className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  加载更多
                </button>
              </div>
            )}

            {filteredSystems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">未找到匹配的系统</p>
                <button 
                  onClick={clearFilters}
                  className="mt-3 text-theme-500 dark:text-theme-400 hover:text-theme-600 dark:hover:text-theme-300 text-sm"
                >
                  清除筛选条件
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
