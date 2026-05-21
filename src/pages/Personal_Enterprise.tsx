import { Bell, TrendingUp, FileText, Calendar as CalendarIcon, Settings, Edit3, Plus } from 'lucide-react';

type System = {
  id: string;
  name: string;
  icon: string;
};

type PersonalEnterpriseProps = {
  displayedSystems: System[];
  onSettingsClick: () => void;
};

export default function Personal_Enterprise({ displayedSystems, onSettingsClick }: PersonalEnterpriseProps) {
  return (
    <div className="bg-gray-100 min-h-screen pt-6">
      <div className="max-w-7xl mx-auto px-6">
        {/* 页面头部带编辑按钮 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">我的工作台</h1>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
            <Edit3 size={18} />
            <span>编辑布局</span>
          </button>
        </div>

        {/* 卡片模块 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <ProcessCard title="流程审批" count="21" icon={<FileText size={24} />} />
          <RevenueCard title="业务收入" amount="¥12,580,000" change="+12.5%" icon={<TrendingUp size={24} />} />
          <NotificationCard title="待办事项" count="8" icon={<Bell size={24} />} />
          <ProjectCard title="项目进度" count="12" icon={<CalendarIcon size={24} />} />
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
          {/* 左侧内容 */}
          <div className="space-y-6">
            {/* 待批阅流程 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">待批阅流程</h3>
              <div className="space-y-3">
                <ProcessItemFlow 
                  title="关于开展2026年第二期黄沙活动的预告" 
                  code="编号：TSP-2026-0073" 
                  creator="由李正刚创建" 
                  time="2026-05-10 12:42:33" 
                  location="当前节点：4执行"
                />
                <ProcessItemFlow 
                  title="关于高乐飞机涂装宣传" 
                  code="编号：TSP-2026-0074" 
                  creator="由李正刚创建" 
                  time="2026-05-10 15:11:53" 
                  location="当前节点：4执行"
                />
                <ProcessItemFlow 
                  title="关于航空安保系统的上传固件申请" 
                  code="编号：TSP-2026-0075" 
                  creator="由赵创新创建" 
                  time="2026-05-10 13:36:19" 
                  location="当前节点：4执行"
                />
              </div>
            </div>

            {/* 今日未读文档 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">今日未读文档</h3>
              <div className="space-y-3">
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
                <DocumentItem 
                  title="关于发布3.25L飞机重量更改故变更的通知" 
                  time="2026-05-19 09:37:54"
                />
              </div>
            </div>

            {/* 关注的项目进度 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">关注的项目进度</h3>
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
          </div>

          {/* 右侧内容 */}
          <div className="space-y-6">
            {/* 周历 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">2026年5月</h3>
              <div className="flex justify-between items-center mb-3">
                <button className="p-1 hover:bg-gray-100 rounded-full">‹</button>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-pink-700 text-white rounded">+</button>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-full">›</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                <div className="text-sm font-medium text-gray-400">日</div>
                <div className="text-sm font-medium text-gray-400">一</div>
                <div className="text-sm font-medium text-gray-400">二</div>
                <div className="text-sm font-medium text-gray-400">三</div>
                <div className="text-sm font-medium text-gray-400">四</div>
                <div className="text-sm font-medium text-gray-400">五</div>
                <div className="text-sm font-medium text-gray-400">六</div>
                <div className="text-sm text-gray-400 py-2">17</div>
                <div className="text-sm text-gray-400 py-2">18</div>
                <div className="text-sm text-gray-400 py-2">19</div>
                <div className="text-sm py-2 bg-pink-700 text-white rounded font-medium">20</div>
                <div className="text-sm text-gray-700 py-2">21</div>
                <div className="text-sm text-gray-700 py-2">22</div>
                <div className="text-sm text-gray-700 py-2">23</div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">5月20日 行程</h4>
                <div className="space-y-2">
                  <CalendarEvent time="全天" title="全天值班" color="bg-gray-100" />
                  <CalendarEvent time="10:00-11:00" title="项目周会" color="bg-pink-100" />
                  <CalendarEvent time="13:00-13:30" title="日程" color="bg-blue-100" />
                  <CalendarEvent time="14:00-15:30" title="工会活动" color="bg-green-100" />
                </div>
              </div>
            </div>

            {/* 常用系统卡片 */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-gray-800">常用系统</h3>
                <button 
                  onClick={onSettingsClick}
                  className="flex items-center gap-1 text-gray-500 hover:text-pink-700 transition-colors"
                >
                  <Settings size={16} />
                  <span className="text-sm">设置</span>
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                {displayedSystems.map(sys => (
                  <button 
                    key={sys.id}
                    className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className={`w-10 h-10 ${sys.bgColor || 'bg-blue-500'} rounded-lg flex items-center justify-center`}>
                      <span className="text-lg text-white">{sys.icon}</span>
                    </div>
                    <span className="text-xs text-gray-600">{sys.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 临期课程 */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800">临期课程</h3>
                <button className="text-sm text-pink-700 hover:underline">更多</button>
              </div>
              <div className="space-y-3">
                <CourseItem 
                  title="上海吉祥航空股份有限公司IT质量指标评估标准V6.0" 
                  time="5节课 · 10积分"
                  image="https://api.dicebear.com/7.x/shapes/svg?seed=课程1&backgroundColor=3b82f6"
                />
                <CourseItem 
                  title="民航华东地区2026年行业管理工作报告的通知" 
                  time="1节课 · 10积分"
                  image="https://api.dicebear.com/7.x/shapes/svg?seed=课程2&backgroundColor=8b5cf6"
                />
                <CourseItem 
                  title="王金董事长在公司2026年工作会议上的重要讲话" 
                  time="1节课 · 10积分"
                  image="https://api.dicebear.com/7.x/shapes/svg?seed=课程3&backgroundColor=ec4899"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessCard({ title, count, icon }: { title: string; count: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-pink-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
        </div>
        <div className="p-3 bg-pink-100 rounded-full text-pink-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

function RevenueCard({ title, amount, change, icon }: { title: string; amount: string; change: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{amount}</p>
          <p className="text-green-600 text-sm mt-1 flex items-center">
            {change} <span className="ml-1">较上月</span>
          </p>
        </div>
        <div className="p-3 bg-green-100 rounded-full text-green-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function NotificationCard({ title, count, icon }: { title: string; count: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-amber-500">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
        </div>
        <div className="p-3 bg-amber-100 rounded-full text-amber-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ title, count, icon }: { title: string; count: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{count}</p>
        </div>
        <div className="p-3 bg-blue-100 rounded-full text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ProcessItemFlow({ title, code, creator, time, location }: { title: string; code: string; creator: string; time: string; location: string }) {
  return (
    <div className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-blue-500">📋</span>
        <h4 className="font-medium text-gray-800 truncate">{title}</h4>
      </div>
      <p className="text-xs text-gray-500 mb-1">{code}</p>
      <p className="text-xs text-gray-500 mb-1">{creator}</p>
      <p className="text-xs text-gray-500 mb-1">创建于 {time}</p>
      <p className="text-xs text-gray-500">{location}</p>
    </div>
  );
}

function DocumentItem({ title, time }: { title: string; time: string }) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors rounded-lg">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 truncate">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      <span className="text-pink-500 ml-2">•</span>
    </div>
  );
}

function GanttChart({ projectName, progress, tasks }: { projectName: string; progress: number; tasks: { name: string; start: number; end: number; completed: boolean | number }[] }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800">{projectName}</h3>
        <span className="text-sm text-gray-500">{progress}% 完成</span>
      </div>
      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600 truncate">{task.name}</div>
            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${task.completed === true ? 'bg-green-500' : typeof task.completed === 'number' && task.completed > 0 ? 'bg-blue-500' : 'bg-gray-300'}`}
                style={{ width: typeof task.completed === 'number' ? `${task.completed}%` : '100%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarEvent({ time, title, color }: { time: string; title: string; color: string }) {
  return (
    <div className={`flex items-center gap-2 p-3 ${color} rounded-lg`}>
      <div className="w-24 text-sm font-medium text-gray-700">{time}</div>
      <div className="flex-1 text-sm text-gray-700">{title}</div>
    </div>
  );
}

function CourseItem({ title, time, image }: { title: string; time: string; image: string }) {
  return (
    <div className="flex gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
        <img src={image} alt={title} className="w-full h-full object-cover rounded-lg" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-800 truncate">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
