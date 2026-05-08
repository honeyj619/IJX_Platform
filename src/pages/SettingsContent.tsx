import { useState } from 'react';
import { useThemeStore, Skin } from '../store/themeStore';
import { Sun, Moon, Palette, Bell, Lock, Globe, Database, Info } from 'lucide-react';

export default function Settings() {
  const { mode, skin, setMode, setSkin } = useThemeStore();
  const [activeTab, setActiveTab] = useState('appearance');

  const skins: { value: Skin; name: string; color: string }[] = [
    { value: 'pink', name: '樱花粉', color: '#ec4899' },
    { value: 'blue', name: '天空蓝', color: '#3b82f6' },
    { value: 'purple', name: '紫罗兰', color: '#a855f7' },
    { value: 'green', name: '薄荷绿', color: '#22c55e' },
    { value: 'orange', name: '日落橙', color: '#f97316' },
  ];

  const tabs = [
    { id: 'appearance', label: '外观设置', icon: <Palette size={20} /> },
    { id: 'notifications', label: '通知设置', icon: <Bell size={20} /> },
    { id: 'privacy', label: '隐私安全', icon: <Lock size={20} /> },
    { id: 'language', label: '语言地区', icon: <Globe size={20} /> },
    { id: 'storage', label: '存储管理', icon: <Database size={20} /> },
    { id: 'about', label: '关于', icon: <Info size={20} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">显示模式</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">选择您喜欢的显示模式</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('light')}
                  className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    mode === 'light'
                      ? 'border-theme-500 bg-theme-50 dark:bg-theme-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    mode === 'light' ? 'bg-theme-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Sun size={32} />
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${mode === 'light' ? 'text-theme-700 dark:text-theme-300' : 'text-gray-900 dark:text-white'}`}>
                      明亮模式
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">适合日间使用</div>
                  </div>
                  {mode === 'light' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-theme-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setMode('dark')}
                  className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                    mode === 'dark'
                      ? 'border-theme-500 bg-theme-50 dark:bg-theme-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    mode === 'dark' ? 'bg-theme-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    <Moon size={32} />
                  </div>
                  <div className="text-center">
                    <div className={`font-semibold ${mode === 'dark' ? 'text-theme-700 dark:text-theme-300' : 'text-gray-900 dark:text-white'}`}>
                      暗黑模式
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">适合夜间使用</div>
                  </div>
                  {mode === 'dark' && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-theme-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">皮肤颜色</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">选择您喜欢的主题颜色</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {skins.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSkin(s.value)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      skin === s.value
                        ? 'border-theme-500 bg-theme-50 dark:bg-theme-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                        skin === s.value ? 'scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: s.color }}
                    >
                      {skin === s.value && (
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      skin === s.value ? 'text-theme-700 dark:text-theme-300' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {s.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">效果预览</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-theme-50 dark:bg-theme-900/20 rounded-lg border border-theme-200 dark:border-theme-800">
                  <div className="text-theme-700 dark:text-theme-300 font-medium mb-2">主题色背景</div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="px-3 py-1 bg-theme-500 text-white rounded text-sm">按钮</div>
                    <div className="px-3 py-1 bg-theme-100 dark:bg-theme-900 text-theme-700 dark:text-theme-300 rounded text-sm">标签</div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="text-gray-700 dark:text-gray-300 font-medium mb-2">中性色背景</div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded text-sm">按钮</div>
                    <div className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-sm">标签</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">通知设置</h3>
            <p className="text-gray-600 dark:text-gray-400">通知设置功能开发中...</p>
          </div>
        );

      case 'privacy':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">隐私安全</h3>
            <p className="text-gray-600 dark:text-gray-400">隐私安全功能开发中...</p>
          </div>
        );

      case 'language':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">语言地区</h3>
            <p className="text-gray-600 dark:text-gray-400">语言地区功能开发中...</p>
          </div>
        );

      case 'storage':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">存储管理</h3>
            <p className="text-gray-600 dark:text-gray-400">存储管理功能开发中...</p>
          </div>
        );

      case 'about':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">关于</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">版本号</span>
                <span className="text-gray-900 dark:text-white font-medium">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">更新日期</span>
                <span className="text-gray-900 dark:text-white font-medium">2026-05-01</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">应用设置</h1>
      </div>

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
