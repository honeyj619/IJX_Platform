import { useState, useEffect } from "react";
import { User, Lock, Calendar, FileText, Settings, Users, Bell, Moon, Sun, Palette } from "lucide-react";
import Layout from "@/components/Layout";
import { useThemeStore } from "../store/themeStore";
import { Skin } from "../store/themeStore";

type TabType = "profile" | "signature" | "accounts" | "settings";

export default function Profile() {
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const { mode, skin, setMode, setSkin } = useThemeStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as TabType;
    if (tab && ["profile", "signature", "accounts", "settings"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const tabs = [
    { id: "profile" as TabType, label: "个人信息", icon: <User size={18} /> },
    { id: "signature" as TabType, label: "签名", icon: <FileText size={18} /> },
    { id: "accounts" as TabType, label: "账号切换", icon: <Users size={18} /> },
    { id: "settings" as TabType, label: "应用设置", icon: <Settings size={18} /> },
  ];

  const skins: { value: Skin; name: string; color: string }[] = [
    { value: 'pink', name: '樱花粉', color: '#ec4899' },
    { value: 'blue', name: '天空蓝', color: '#3b82f6' },
    { value: 'purple', name: '紫罗兰', color: '#a855f7' },
    { value: 'green', name: '薄荷绿', color: '#22c55e' },
    { value: 'orange', name: '日落橙', color: '#f97316' },
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
                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20beautiful%20woman%20avatar%2C%20modern%20style%2C%20confident%20expression%2C%20soft%20lighting%2C%20elegant%20appearance&image_size=square_hd"
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
                  <h2 className="text-2xl font-bold text-gray-900">梁吉力</h2>
                  <p className="text-gray-500 mt-1">信息管理部 · 高级工程师</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <ProfileItem icon={<User size={18} />} label="姓名" value="梁吉力" />
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
                    src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20beautiful%20woman%20avatar%2C%20modern%20style%2C%20confident%20expression%2C%20soft%20lighting%2C%20elegant%20appearance&image_size=square_hd"
                    alt="当前账号"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-gray-900">梁吉力</div>
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
                    src="https://i.pravatar.cc/48?img=10"
                    alt="账号2"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-gray-900">张三</div>
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
                    src="https://i.pravatar.cc/48?img=11"
                    alt="账号3"
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-bold text-gray-900">李四</div>
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

      case "settings":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Palette className="text-theme-500" size={20} />
                主题设置
              </h3>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-600 mb-3">显示模式</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMode('light')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      mode === 'light'
                        ? 'border-theme-500 bg-theme-50 text-theme-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Sun size={18} />
                    <span className="text-sm font-medium">明亮</span>
                  </button>
                  <button
                    onClick={() => setMode('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      mode === 'dark'
                        ? 'border-theme-500 bg-theme-50 text-theme-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <Moon size={18} />
                    <span className="text-sm font-medium">暗黑</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">皮肤颜色</h4>
                <div className="flex gap-3">
                  {skins.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSkin(s.value)}
                      className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-all"
                      title={s.name}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                          skin === s.value ? 'ring-2 ring-offset-2 ring-theme-500 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: s.color }}
                      >
                        {skin === s.value && (
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">通知设置</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-gray-500" />
                    <span className="text-gray-700">消息通知</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-theme-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-gray-500" />
                    <span className="text-gray-700">邮件通知</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-theme-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-500"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Bell size={20} className="text-gray-500" />
                    <span className="text-gray-700">桌面通知</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-theme-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">个人设置</h1>
        </div>

        <div className="flex flex-col md:flex-row flex-1">
          {/* 侧边栏 */}
          <div className="w-full md:w-64 bg-white border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-theme-50 text-theme-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-theme-600' : 'text-gray-400'}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 主内容 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </Layout>
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
