import { useState, useRef, useEffect } from 'react';
import { Search, Grid, List, Plus, Pin, Zap, Bot, ChevronRight } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  category: string;
  aiType: string[];
  likes: number;
  creator: string;
  tags: string[];
}

const mockAgents: Agent[] = [
  { id: '1', name: '项目管家', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=project-manager', description: '项目管理专家，帮助你高效管理项目进度、风险和资源', category: '助手', aiType: ['通用助手', '项目管理', '效率工具'], likes: 234, creator: '赵子龙', tags: ['项目管理', '效率'] },
  { id: '2', name: '文案大师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=copywriter', description: '创意写作助手，激发灵感，助你创作精彩内容', category: '助手', aiType: ['创意助手', '写作助手'], likes: 189, creator: '诸葛亮', tags: ['写作', '创意'] },
  { id: '3', name: '数据分析师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=data-analyst', description: '数据分析专家，快速处理数据，生成可视化报告', category: '助手', aiType: ['数据分析', '商业智能'], likes: 156, creator: '司马懿', tags: ['数据', '分析'] },
  { id: '4', name: '代码审计员', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=code-reviewer', description: '代码审查助手，自动化代码检查，提高代码质量', category: '助手', aiType: ['代码助手', '开发工具'], likes: 298, creator: '周瑜', tags: ['代码', '开发'] },
  { id: '5', name: '客服小助手', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=customer-service', description: '客服机器人，7x24小时在线，智能回答客户问题', category: '助手', aiType: ['客服助手', '智能客服'], likes: 412, creator: '貂蝉', tags: ['客服', '自动化'] },
  { id: '6', name: '法务顾问', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=legal-advisor', description: '法律顾问助手，解读法律法规，提供合规建议', category: '助手', aiType: ['法律助手', '合规顾问'], likes: 167, creator: '庞统', tags: ['法律', '合规'] },
  { id: '7', name: '营销策划师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=marketing', description: '营销策划助手，生成创意营销方案，提升品牌影响力', category: '助手', aiType: ['营销助手', '策划工具'], likes: 234, creator: '郭嘉', tags: ['营销', '策划'] },
  { id: '8', name: 'HR招聘官', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=hr-recruiter', description: 'HR智能助手，筛选简历，安排面试，提升招聘效率', category: '助手', aiType: ['HR助手', '招聘工具'], likes: 189, creator: '张飞', tags: ['HR', '招聘'] },
  { id: '9', name: '财务分析师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=financial-analyst', description: '财务分析助手，智能处理财务报表，预测财务趋势', category: '分析', aiType: ['财务分析', '预测助手'], likes: 345, creator: '曹操', tags: ['财务', '分析'] },
  { id: '10', name: '产品设计师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=product-designer', description: '产品设计助手，快速生成原型，优化用户体验', category: '创意', aiType: ['设计助手', '原型工具'], likes: 278, creator: '黄月英', tags: ['设计', '原型'] },
  { id: '11', name: '视频剪辑师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=video-editor', description: '视频剪辑助手，智能处理视频素材，生成精彩视频', category: '创意', aiType: ['视频剪辑', '创意工具'], likes: 456, creator: '吕布', tags: ['视频', '剪辑'] },
  { id: '12', name: '社媒运营官', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=social-media', description: '社交媒体助手，自动发布内容，分析用户数据', category: '客服', aiType: ['社交媒体', '内容运营'], likes: 389, creator: '小乔', tags: ['社交', '运营'] },
  { id: '13', name: '供应链管家', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=supply-chain', description: '供应链管理助手，优化物流流程，降低成本', category: '管理', aiType: ['供应链', '成本优化'], likes: 267, creator: '关羽', tags: ['供应链', '管理'] },
  { id: '14', name: '健康顾问', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=health-advisor', description: '健康顾问助手，分析健康数据，提供健康建议', category: '助手', aiType: ['健康顾问', '数据分析'], likes: 523, creator: '华佗', tags: ['健康', '医疗'] },
  { id: '15', name: '培训讲师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=trainer', description: '学习助手，个性化学习路径，提升学习效率', category: '创意', aiType: ['学习助手', '个性化'], likes: 478, creator: '徐庶', tags: ['学习', '教育'] },
  { id: '16', name: '行程规划师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=travel-planner', description: '行程规划助手，智能推荐路线，优化出行体验', category: '助手', aiType: ['行程助手', '规划工具'], likes: 345, creator: '鲁肃', tags: ['行程', '规划'] },
  { id: '17', name: '音乐制作人', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=music-producer', description: '音乐创作助手，灵感生成器，智能编曲工具', category: '创意', aiType: ['音乐创作', '编曲工具'], likes: 567, creator: '蔡文姬', tags: ['音乐', '创作'] },
  { id: '18', name: '行政助理', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin-assistant', description: '行政管理助手，会议安排，文档管理，提升办公效率', category: '助手', aiType: ['行政助手', '办公效率'], likes: 634, creator: '孙权', tags: ['行政', '办公'] },
  { id: '19', name: '绩效分析师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=performance-analyst', description: '绩效分析助手，数据可视化，团队绩效评估', category: '助手', aiType: ['绩效分析', '数据可视化'], likes: 489, creator: '魏延', tags: ['绩效', '分析'] },
  { id: '20', name: '采购专员', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=procurement', description: '采购助手，供应商管理，比价推荐，智能采购清单', category: '助手', aiType: ['采购助手', '比价工具'], likes: 378, creator: '马超', tags: ['采购', '供应商'] },
  { id: '21', name: '投资顾问', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=investment-advisor', description: '投资顾问助手，市场分析，智能投资建议', category: '分析', aiType: ['投资顾问', '市场分析'], likes: 423, creator: '荀彧', tags: ['投资', '金融'] },
  { id: '22', name: '知识库管理员', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=knowledge-base', description: '知识管理助手，文档归档，知识问答，团队协作', category: '助手', aiType: ['知识管理', '文档助手'], likes: 567, creator: '姜维', tags: ['知识', '文档'] },
  { id: '23', name: '测试工程师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=test-engineer', description: '测试助手，自动化测试，Bug追踪，质量保障', category: '开发', aiType: ['测试助手', '质量保障'], likes: 489, creator: '夏侯惇', tags: ['测试', '质量'] },
  { id: '24', name: '编程导师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=coding-tutor', description: '编程教学助手，代码示例，编程问题解答', category: '开发', aiType: ['编程教学', '代码助手'], likes: 356, creator: '许褚', tags: ['编程', '教学'] },
  { id: '25', name: '股票分析师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=stock-analyst', description: '股票分析助手，实时行情，技术分析', category: '分析', aiType: ['股票分析', '技术分析'], likes: 434, creator: '贾诩', tags: ['股票', '分析'] },
  { id: '26', name: 'UI设计师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ui-designer', description: 'UI设计助手，界面设计，交互优化，视觉规范', category: '创意', aiType: ['UI设计', '交互设计'], likes: 578, creator: '甄姬', tags: ['UI', '设计'] },
  { id: '27', name: '空间设计师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=space-designer', description: '空间设计助手，办公空间规划，风格推荐', category: '创意', aiType: ['空间设计', '规划工具'], likes: 389, creator: '张辽', tags: ['空间', '设计'] },
  { id: '28', name: '翻译官', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=translator', description: '多语言翻译助手，实时翻译，口语练习', category: '开发', aiType: ['翻译助手', '语言学习'], likes: 467, creator: '陆逊', tags: ['翻译', '语言'] },
  { id: '29', name: '品牌策划师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=brand-planner', description: '品牌策划助手，品牌定位，视觉识别，传播策略', category: '创意', aiType: ['品牌策划', '营销策略'], likes: 523, creator: '孙策', tags: ['品牌', '策划'] },
  { id: '30', name: '销售顾问', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sales-consultant', description: '销售助手，客户管理，销售预测，业绩分析', category: '助手', aiType: ['销售助手', '客户管理'], likes: 345, creator: '黄忠', tags: ['销售', '客户'] },
  { id: '31', name: '技术架构师', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=architect', description: '技术架构助手，系统设计，技术选型，架构优化', category: '开发', aiType: ['架构设计', '技术选型'], likes: 489, creator: '典韦', tags: ['架构', '技术'] },
  { id: '32', name: '会议助理', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=meeting-assistant', description: '会议管理助手，会议记录，议程安排，纪要生成', category: '助手', aiType: ['会议管理', '效率工具'], likes: 567, creator: '大乔', tags: ['会议', '效率'] },
];

const categories = ['助手', '分析', '开发', '创意', '客服', '管理', '所有'];
const domains = ['所有', '企业服务', '个人效率', '创意娱乐', '专业技术', '教育培训'];

export default function AgentSquare() {
  const [agents] = useState<Agent[]>(mockAgents);
  const [displayedAgents, setDisplayedAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('所有');
  const [selectedDomain, setSelectedDomain] = useState('所有');
  const [selectedAiType, setSelectedAiType] = useState('AI应用类型');
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [showAiTypeDropdown, setShowAiTypeDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const categoryRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);
  const aiTypeRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const ITEMS_PER_PAGE = 8;

  // 筛选和懒加载
  useEffect(() => {
    const filtered = agents.filter(agent => {
      if (selectedCategory !== '所有' && agent.category !== selectedCategory) return false;
      if (selectedDomain !== '所有') return false;
      if (selectedAiType !== 'AI应用类型' && !agent.aiType.includes(selectedAiType)) return false;
      return true;
    });
    
    setDisplayedAgents(filtered.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [agents, selectedCategory, selectedDomain, selectedAiType]);

  // 懒加载IntersectionObserver
  useEffect(() => {
    if (!loadMoreRef.current || loadingRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          loadingRef.current = true;
          setTimeout(() => {
            const filtered = agents.filter(agent => {
              if (selectedCategory !== '所有' && agent.category !== selectedCategory) return false;
              if (selectedDomain !== '所有') return false;
              if (selectedAiType !== 'AI应用类型' && !agent.aiType.includes(selectedAiType)) return false;
              return true;
            });
            
            const nextPage = page + 1;
            const start = (nextPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            const newItems = filtered.slice(start, end);
            
            if (newItems.length > 0) {
              setDisplayedAgents(prev => [...prev, ...newItems]);
              setPage(nextPage);
              setHasMore(end < filtered.length);
            } else {
              setHasMore(false);
            }
            loadingRef.current = false;
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, page, agents, selectedCategory, selectedDomain, selectedAiType]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
      if (domainRef.current && !domainRef.current.contains(e.target as Node)) {
        setShowDomainDropdown(false);
      }
      if (aiTypeRef.current && !aiTypeRef.current.contains(e.target as Node)) {
        setShowAiTypeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 统计
  const totalFiltered = agents.filter(agent => {
    if (selectedCategory !== '所有' && agent.category !== selectedCategory) return false;
    if (selectedDomain !== '所有') return false;
    if (selectedAiType !== 'AI应用类型' && !agent.aiType.includes(selectedAiType)) return false;
    return true;
  }).length;

  return (
    <div className="h-full flex flex-col bg-gray-50">

      {/* 头部 */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200/60 shrink-0 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <Bot size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">智能体广场</h1>
              <p className="text-sm text-gray-500">发现和使用各种 AI 智能助手</p>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="搜索智能体..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:border-pink-400 transition-all text-sm shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <kbd className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-md border border-gray-200">⌘K</kbd>
            </div>
          </div>

          {/* Filters + Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div ref={categoryRef} className="relative">
              <button
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowDomainDropdown(false);
                  setShowAiTypeDropdown(false);
                }}
                className={`pl-3 pr-8 py-2 bg-white border rounded-lg text-sm transition-all hover:border-pink-300 ${
                  selectedCategory !== "所有" ? 'border-pink-400 text-pink-600 bg-pink-50' : 'border-gray-200 text-gray-600'
                }`}
              >
                {selectedCategory}
                <ChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 transition-transform ${
                  showCategoryDropdown ? 'rotate-90' : ''
                } ${selectedCategory !== "所有" ? 'text-pink-400' : 'text-gray-400'}`} size={14} />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all hover:bg-pink-50 ${
                        selectedCategory === cat ? 'text-pink-600 bg-pink-50 font-medium' : 'text-gray-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Domain Dropdown */}
            <div ref={domainRef} className="relative">
              <button
                onClick={() => {
                  setShowDomainDropdown(!showDomainDropdown);
                  setShowCategoryDropdown(false);
                  setShowAiTypeDropdown(false);
                }}
                className={`pl-3 pr-8 py-2 bg-white border rounded-lg text-sm transition-all hover:border-pink-300 ${
                  selectedDomain !== "所有" ? 'border-pink-400 text-pink-600 bg-pink-50' : 'border-gray-200 text-gray-600'
                }`}
              >
                {selectedDomain}
                <ChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 transition-transform ${
                  showDomainDropdown ? 'rotate-90' : ''
                } ${selectedDomain !== "所有" ? 'text-pink-400' : 'text-gray-400'}`} size={14} />
              </button>
              {showDomainDropdown && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {domains.map(dom => (
                    <button
                      key={dom}
                      onClick={() => {
                        setSelectedDomain(dom);
                        setShowDomainDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all hover:bg-pink-50 ${
                        selectedDomain === dom ? 'text-pink-600 bg-pink-50 font-medium' : 'text-gray-600'
                      }`}
                    >
                      {dom}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* AI Type Dropdown */}
            <div ref={aiTypeRef} className="relative">
              <button
                onClick={() => {
                  setShowAiTypeDropdown(!showAiTypeDropdown);
                  setShowCategoryDropdown(false);
                  setShowDomainDropdown(false);
                }}
                className={`pl-3 pr-8 py-2 bg-white border rounded-lg text-sm transition-all hover:border-pink-300 ${
                  selectedAiType !== "AI应用类型" ? 'border-pink-400 text-pink-600 bg-pink-50' : 'border-gray-200 text-gray-600'
                }`}
              >
                {selectedAiType}
                <ChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 transition-transform ${
                  showAiTypeDropdown ? 'rotate-90' : ''
                } ${selectedAiType !== "AI应用类型" ? 'text-pink-400' : 'text-gray-400'}`} size={14} />
              </button>
              {showAiTypeDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {['AI应用类型', '通用助手', '代码助手', '写作助手', '数据分析'].map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedAiType(type);
                        setShowAiTypeDropdown(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-all hover:bg-pink-50 ${
                        selectedAiType === type ? 'text-pink-600 bg-pink-50 font-medium' : 'text-gray-600'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1" />

            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all shadow-sm font-medium text-sm">
              <Plus size={16} />
              <span>创建智能体</span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-500">
              <Zap size={14} className="text-pink-500" />
              <span>共 <span className="text-pink-600 font-medium">{totalFiltered}</span> 个智能助手</span>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' ? 'bg-pink-500 text-white shadow-sm' : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'grid' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-pink-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onMouseEnter={() => setHoveredAgentId(agent.id)}
                    onMouseLeave={() => setHoveredAgentId(null)}
                  >
                    <button className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-pink-400 transition-colors opacity-0 group-hover:opacity-100 z-10">
                      <Pin size={14} />
                    </button>

                    <div className="relative flex items-start gap-3 mb-4">
                      <div className="relative flex-shrink-0">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity" />
                        <img src={agent.avatar} alt={agent.name} className="relative w-12 h-12 rounded-full border-2 border-gray-100 group-hover:border-pink-300 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-gray-800 truncate text-base mb-1">{agent.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-pink-50 text-pink-600 rounded border border-pink-200">{agent.category}</span>
                          <span 
                            className={`text-xs cursor-pointer transition-colors ${hoveredAgentId === agent.id ? 'text-pink-500' : 'text-gray-400'}`}
                          >
                            @{agent.creator}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{agent.description}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {agent.aiType.slice(0, 2).map((type, index) => (
                        <span key={index} className="text-2xs px-2 py-1 bg-purple-50 text-purple-600 rounded border border-purple-200">
                          {type}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Zap size={12} className="text-pink-500" />
                          <span className="text-pink-500">{agent.likes}</span>
                        </span>
                      </div>
                      <button className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:from-pink-600 hover:to-purple-700 transition-all text-xs font-medium shadow-sm">
                        联系ta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* 懒加载触发器 */}
              {hasMore && (
                <div ref={loadMoreRef} className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-500 text-sm shadow-sm">
                    <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    <span>加载更多...</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-3">
              {displayedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-pink-300 hover:shadow-md transition-all duration-300"
                  onMouseEnter={() => setHoveredAgentId(agent.id)}
                  onMouseLeave={() => setHoveredAgentId(null)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <img src={agent.avatar} alt={agent.name} className="relative w-14 h-14 rounded-full border-2 border-gray-100" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-800 text-lg">{agent.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-pink-50 text-pink-600 rounded border border-pink-200">{agent.category}</span>
                        <span 
                          className={`text-xs cursor-pointer transition-colors ${hoveredAgentId === agent.id ? 'text-pink-500' : 'text-gray-400'}`}
                        >
                          @{agent.creator}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mb-2">{agent.description}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {agent.aiType.slice(0, 3).map((type, index) => (
                            <span key={index} className="text-2xs px-2 py-1 bg-purple-50 text-purple-600 rounded border border-purple-200">
                              {type}
                            </span>
                          ))}
                        </div>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Zap size={12} className="text-pink-500" />
                          <span className="text-pink-500">{agent.likes}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-300 hover:text-pink-400 transition-colors">
                        <Pin size={18} />
                      </button>
                      <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-md hover:from-pink-600 hover:to-purple-700 transition-all text-sm font-medium shadow-sm">
                        联系ta
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {hasMore && (
                <div ref={loadMoreRef} className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg text-gray-500 text-sm shadow-sm">
                    <div className="w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
                    <span>加载更多...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedAgent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-6">
              <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-20 h-20 rounded-full border-2 border-gray-200" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedAgent.name}</h2>
                <p className="text-pink-500 text-sm">@{selectedAgent.creator}</p>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">{selectedAgent.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedAgent.aiType.map((type, index) => (
                <span key={index} className="text-xs px-3 py-1 bg-pink-50 text-pink-600 rounded-full border border-pink-200">{type}</span>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium shadow-sm">
                开始对话
              </button>
              <button className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all border border-gray-200">
                收藏
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
