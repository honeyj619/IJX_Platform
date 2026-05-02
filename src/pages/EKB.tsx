import { Search, Bell, Calendar, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';

interface KnowledgeDomain {
  id: number;
  name: string;
}

interface Document {
  id: number;
  title: string;
  date: string;
}

interface HotDocument {
  id: number;
  rank: number;
  title: string;
}

const knowledgeDomains: KnowledgeDomain[] = [
  { id: 1, name: '带我飞行' },
  { id: 2, name: '伴客前行' },
  { id: 3, name: '吉祥人生' },
  { id: 4, name: '战略指引' },
  { id: 5, name: '信息弹药' },
  { id: 6, name: '花吉食' },
  { id: 7, name: '物流传递' },
];

const latestDocuments: Document[] = [
  { id: 1, title: '03-人力资源手册', date: '' },
  { id: 2, title: '上海吉祥航空股份有限公司奖励客运运输说明2024年3月版', date: '' },
  { id: 3, title: '上海吉祥航空股份有限公司行李运输规定2024年3月版', date: '' },
  { id: 4, title: '吉祥航发〔2025〕005号关于发布《吉祥航空2026航空器引进工作方案》的通知', date: '' },
  { id: 5, title: '上海吉祥航空股份有限公司旅客、行李国际运输总条件2024年7月版', date: '' },
  { id: 6, title: '吉祥航发〔2025〕204号关于2025年吉祥航空"安全生产月"活动表彰的通报', date: '' },
];

const hotDocuments: HotDocument[] = [
  { id: 1, rank: 1, title: '上海吉祥航空股份有限公司IT软件...' },
  { id: 2, rank: 2, title: '上海吉祥航空股份有限公司IT项目...' },
  { id: 3, rank: 3, title: '上海吉祥航空股份有限公司IT项...' },
  { id: 4, rank: 4, title: '上海吉祥航空股份有限公司IT项...' },
];

const documentCategories = [
  '全部', '战略文件', '行业资料库', '专家人才库', '企业信息', '知识成果库', '工具方法库'
];

export default function EKB() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* 顶部导航栏 */}
        <div className="bg-blue-800 text-white py-3 px-4 md:px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <nav className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base">
              <Link to="/" className="text-white hover:text-blue-200 transition-colors">首页</Link>
              <Link to="/ekb" className="text-white font-bold border-b-2 border-white pb-1">知识领域</Link>
              <Link to="/" className="text-white hover:text-blue-200 transition-colors">课堂</Link>
              <Link to="/" className="text-white hover:text-blue-200 transition-colors">问题反馈</Link>
              <div className="relative group">
                <span className="flex items-center gap-1 cursor-pointer">
                  更多 <ChevronDown size={14} />
                </span>
              </div>
              <Link to="/" className="text-white hover:text-blue-200 transition-colors">管理后台</Link>
            </nav>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 min-w-[200px] md:min-w-[300px]">
                <input 
                  type="text" 
                  placeholder="请输入关键词" 
                  className="bg-white text-gray-800 rounded-md px-4 py-2 text-sm w-full pl-10"
                />
                <Search size={16} className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20beautiful%20woman%20avatar%2C%20modern%20style%2C%20confident%20expression%2C%20soft%20lighting%2C%20elegant%20appearance&image_size=square_hd" 
                    alt="梁吉力" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm whitespace-nowrap">梁吉力</span>
              </div>
            </div>
          </div>
        </div>

        {/* 第一块：Banner */}
        <div className="w-full h-48 md:h-64 bg-blue-600 overflow-hidden">
          <img 
            src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20blue%20tech%20banner%20with%20knowledge%20base%20concept%2C%20digital%20library%2C%20cloud%20computing%2C%20professional%20business%20style&image_size=landscape_16_9" 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* 第二块：个人信息和统计 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* 左侧：个人信息和按钮 */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
                {/* 个人信息 */}
                <div>
                  <h3 className="text-base font-bold text-gray-800">梁吉力</h3>
                  <p className="text-xs text-gray-600">保卫防护产品处</p>
                </div>
                
                {/* 按钮 */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-500 text-white py-1.5 px-3 rounded-md hover:from-blue-700 hover:to-blue-600 transition-all font-medium text-xs shadow-sm flex items-center justify-center gap-2">
                    <span>📝</span>
                    <span>发布</span>
                  </button>
                  <button className="flex-1 sm:flex-none bg-white text-gray-700 py-1.5 px-3 rounded-md hover:bg-gray-50 transition-colors font-medium text-xs border border-gray-200 flex items-center justify-center gap-2">
                    <span>👤</span>
                    <span>个人中心</span>
                  </button>
                </div>
              </div>
              
              {/* 右侧：统计数据 */}
              <div className="w-full md:w-auto">
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                  <div className="text-center p-1.5 rounded hover:bg-gray-50 transition-colors">
                    <p className="text-sm sm:text-lg font-bold text-blue-600">28</p>
                    <p className="text-xs text-gray-500">我的文档</p>
                  </div>
                  <div className="text-center p-1.5 rounded hover:bg-gray-50 transition-colors">
                    <p className="text-sm sm:text-lg font-bold text-blue-600">5</p>
                    <p className="text-xs text-gray-500">我的收藏</p>
                  </div>
                  <div className="text-center p-1.5 rounded hover:bg-gray-50 transition-colors">
                    <p className="text-sm sm:text-lg font-bold text-blue-600">15</p>
                    <p className="text-xs text-gray-500">知识贡献</p>
                  </div>
                  <div className="text-center p-1.5 rounded hover:bg-gray-50 transition-colors">
                    <p className="text-sm sm:text-lg font-bold text-blue-600">3</p>
                    <p className="text-xs text-gray-500">我的领域</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 第二块：知识领域 */}
        <div className="py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-md border border-blue-100 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-800">知识领域</h3>
                <button className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium px-4 py-2 rounded-md border border-blue-200 shadow-sm">
                  <span>⚙️</span>
                  <span>自定义</span>
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
                {knowledgeDomains.map((domain) => (
                  <button 
                    key={domain.id}
                    className="flex flex-col items-center justify-center gap-2 bg-white border border-blue-200 rounded-md py-4 px-3 text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium text-center shadow-sm"
                  >
                    <span className="text-blue-500 text-lg">📚</span>
                    <span>{domain.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 第三块：最新文档、热门文档 */}
        <div className="py-8 px-4 sm:px-6 bg-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-blue-600">✨</span> 最新资讯实时知
              </h2>
              <div className="flex items-center gap-4">
                <button className="text-blue-600 font-medium text-sm hover:text-blue-800 transition-colors flex items-center gap-1">
                  我的订阅
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* 最新文档 */}
              <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4">
                  <div className="space-y-6">
                    {latestDocuments.map((doc, index) => {
                      const authors = ['梁吉力', '张三三', '王四四', '李四四', '赵五五', '钱六六'];
                      const views = [1216, 987, 756, 543, 321, 198];
                      return (
                        <div key={doc.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                          <div className="font-medium text-gray-800 hover:text-blue-600 transition-colors cursor-pointer text-lg mb-2">
                            {doc.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {authors[index % authors.length]}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bell size={14} />
                              浏览 {views[index % views.length].toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* 热门文档和其他 */}
              <div className="space-y-6">
                {/* 热门文档 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-orange-500">🔥</span> 热门文档
                    </h3>
                  </div>
                  
                  {/* 热门文档列表 */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {hotDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                          <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {doc.rank}
                          </div>
                          <div className="text-sm text-gray-800 hover:text-blue-600 transition-colors cursor-pointer truncate">
                            {doc.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* 大咖分享 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-purple-600">🌟</span>
                      大咖分享
                    </h3>
                    <button className="text-blue-600 text-sm font-medium hover:underline hover:text-blue-800 transition-colors flex items-center gap-1">
                      更多
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-md p-3 hover:bg-purple-100 transition-colors cursor-pointer transform hover:scale-[1.02] transition-transform">
                        <div className="font-medium text-purple-800 mb-1">智能体搭建实战指南</div>
                        <div className="text-xs text-gray-600">梁吉力 · 浏览 2,345</div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 hover:bg-blue-100 transition-colors cursor-pointer transform hover:scale-[1.02] transition-transform">
                        <div className="font-medium text-blue-800 mb-1">知识库高效使用技巧</div>
                        <div className="text-xs text-gray-600">张三三 · 浏览 1,892</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-md p-3 hover:bg-green-100 transition-colors cursor-pointer transform hover:scale-[1.02] transition-transform">
                        <div className="font-medium text-green-800 mb-1">企业AI应用最佳实践</div>
                        <div className="text-xs text-gray-600">王四四 · 浏览 1,567</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
