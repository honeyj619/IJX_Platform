import { MAIN_USER_AVATAR, MAIN_USER_NAME, getDemoPerson, getInitialsAvatar } from '../data/people';
import { useState, useEffect } from "react";
import { User, Lock, Calendar, FileText, Settings, Users, Bell } from "lucide-react";
import { PageHeader } from "../components/PageHeader";

type TabType = "profile" | "signature" | "accounts";

export default function ProfileContent() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as TabType;
    if (tab && ["profile", "signature", "accounts"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const tabs = [
    { id: "profile" as TabType, label: "个人信息", icon: <User size={18} /> },
    { id: "signature" as TabType, label: "签名", icon: <FileText size={18} /> },
    { id: "accounts" as TabType, label: "账号切换", icon: <Users size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group">
                  <img
                    src={MAIN_USER_AVATAR}
                    alt="用户头像"
                    className="w-24 h-24 rounded-full border-4 border-theme-200 group-hover:border-theme-400 transition-colors"
                  />
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-theme-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-theme-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{MAIN_USER_NAME}</h2>
                  <p className="text-gray-500 mt-1">信息管理部 · 高级工程师</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <ProfileItem icon={<User size={18} />} label="姓名" value={MAIN_USER_NAME} />
                <ProfileItem icon={<Calendar size={18} />} label="部门" value="信息管理部" />
                <ProfileItem icon={<FileText size={18} />} label="职位" value="高级工程师" />
                <ProfileItem icon={<Lock size={18} />} label="账号" value="ANC-AL00" />
                <ProfileItem icon={<Calendar size={18} />} label="入职时间" value="2020-03-15" />
                <ProfileItem icon={<Bell size={18} />} label="邮箱" value="liangjili@company.com" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">安全设置</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Lock size={20} className="text-gray-500" />
                    <span className="text-gray-700">修改密码</span>
                  </div>
                  <button className="text-theme-600 hover:text-theme-700 hover:underline">修改</button>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Settings size={20} className="text-gray-500" />
                    <span className="text-gray-700">账号安全</span>
                  </div>
                  <button className="text-theme-600 hover:text-theme-700 hover:underline">查看</button>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-gray-500" />
                    <span className="text-gray-700">登录历史</span>
                  </div>
                  <button className="text-theme-600 hover:text-theme-700 hover:underline">查看</button>
                </div>
              </div>
            </div>
          </div>
        );

      case "signature":
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">个人签名</h3>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-500 focus:border-transparent resize-none"
              rows={6}
              placeholder="在这里输入您的个人签名..."
              defaultValue="追求卓越，不断前行。"
            />
            <div className="flex justify-end mt-4">
              <button className="px-6 py-2 bg-theme-500 text-white rounded-lg hover:bg-theme-600 transition-colors">
                保存签名
              </button>
            </div>
          </div>
        );

      case "accounts":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-theme-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={MAIN_USER_AVATAR}
                    alt="当前账号"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{MAIN_USER_NAME}</div>
                    <div className="text-sm text-gray-500">当前账号</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-theme-100 text-theme-700 rounded-full text-sm">使用中</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={getInitialsAvatar(getDemoPerson(0), 'ec4899')}
                    alt="账号2"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{getDemoPerson(0)}</div>
                    <div className="text-sm text-gray-500">zhangsan@company.com</div>
                  </div>
                </div>
                <button className="px-4 py-2 text-theme-600 hover:bg-theme-50 rounded-lg transition-colors">
                  切换
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={getInitialsAvatar(getDemoPerson(1), '8b5cf6')}
                    alt="账号3"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{getDemoPerson(1)}</div>
                    <div className="text-sm text-gray-500">lisi@company.com</div>
                  </div>
                </div>
                <button className="px-4 py-2 text-theme-600 hover:bg-theme-50 rounded-lg transition-colors">
                  切换
                </button>
              </div>
            </div>

            <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-theme-500 hover:text-theme-600 transition-colors flex items-center justify-center gap-2">
              <span>+</span>
              <span>添加账号</span>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      <PageHeader
        icon={<User size={20} className="text-white" />}
        title="个人信息"
      />

      <div className="flex flex-col lg:flex-row flex-1">
        <div className="w-full lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-theme-50 dark:bg-theme-900/20 text-theme-700 dark:text-theme-300 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className={activeTab === tab.id ? 'text-theme-600' : 'text-gray-400'}>
                  {tab.icon}
                </span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-gray-500 mb-1">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-gray-900 font-medium">{value}</div>
    </div>
  );
}
