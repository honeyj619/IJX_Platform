import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle, HelpCircle, Calendar, FileText, Table,
  Video, LayoutGrid, Users, Bot, Diamond,
  ThumbsUp, Sparkles, Plane, Pencil, Minus,
  Plus, ChevronDown, Info, Check, X
} from 'lucide-react';

interface AppItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface TileForm {
  link: string;
  name: string;
}

interface UserGroup {
  id: string;
  name: string;
}

const ALL_APPS: AppItem[] = [
  { id: 'msg', label: '消息', icon: <MessageCircle size={18} />, color: 'text-blue-500' },
  { id: 'portal', label: '工作门户', icon: <LayoutGrid size={18} />, color: 'text-green-500' },
  { id: 'cal', label: '日历', icon: <Calendar size={18} />, color: 'text-orange-500' },
  { id: 'knowledge', label: '知识库', icon: <HelpCircle size={18} />, color: 'text-purple-500' },
  { id: 'business', label: '业务系统', icon: <Table size={18} />, color: 'text-indigo-500' },
  { id: 'ruyi', label: '如意空间', icon: <Sparkles size={18} />, color: 'text-pink-500' },
];

const DEFAULT_APP_IDS = ['msg', 'portal', 'cal', 'knowledge', 'business', 'ruyi'];

const USER_GROUPS: UserGroup[] = [
  { id: 'admin', name: '管理层' },
];

export default function NavigationConfig() {
  const [activeTab, setActiveTab] = useState<'default' | 'custom'>('custom');
  const [selectedGroup, setSelectedGroup] = useState<string>('admin');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>(DEFAULT_APP_IDS);
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tileModal, setTileModal] = useState<{ mode: 'add' | 'edit'; app?: AppItem } | null>(null);
  const [tileForm, setTileForm] = useState<TileForm>({ link: '', name: '' });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedApps = ALL_APPS.filter(app => selectedAppIds.includes(app.id));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveApp = (appId: string) => {
    if (selectedAppIds.length <= 2) return; // 最小限制
    setSelectedAppIds(prev => prev.filter(id => id !== appId));
  };

  const handleAddApp = (appId: string) => {
    if (selectedAppIds.length >= 25) return; // 最大限制
    setSelectedAppIds(prev => [...prev, appId]);
  };

  const getAppLink = (appId: string) => {
    const appLinks: Record<string, string> = {
      msg: 'https://ijx.juneyaoair.com/message',
      portal: 'https://ijx.juneyaoair.com/enterprise',
      cal: 'https://ijx.juneyaoair.com/calendar',
      knowledge: 'https://ijx.juneyaoair.com/knowledge',
      business: 'https://ijx.juneyaoair.com/business',
      ruyi: 'https://ijx.juneyaoair.com/ruyi-zone',
    };
    return appLinks[appId] || 'https://ijx.juneyaoair.com/';
  };

  const openAddTileModal = () => {
    setTileForm({ link: '', name: '' });
    setTileModal({ mode: 'add' });
  };

  const openEditTileModal = (app: AppItem) => {
    if (!isEditing) return;
    setTileForm({ link: getAppLink(app.id), name: app.label });
    setTileModal({ mode: 'edit', app });
  };

  const closeTileModal = () => {
    setTileModal(null);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSelectedAppIds(DEFAULT_APP_IDS);
    setIsEditing(false);
  };

  const selectedGroupName = USER_GROUPS.find(g => g.id === selectedGroup)?.name || '';

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('default')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'default'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            默认配置
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'custom'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            基于用户组自定义配置
          </button>
        </div>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* User group dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-gray-400 transition-colors min-w-[140px]"
            >
              <span className="flex-1 text-left">{selectedGroupName}</span>
              <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                <div className="px-3 py-2 text-xs text-gray-400 flex items-center gap-1">
                  <Info size={12} />
                  为用户组自定义导航栏，优先级从高到低
                </div>
                {USER_GROUPS.map(group => (
                  <button
                    key={group.id}
                    onClick={() => { setSelectedGroup(group.id); setDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span className={selectedGroup === group.id ? 'text-blue-600 font-medium' : 'text-gray-700'}>
                      {group.name}
                    </span>
                    {selectedGroup === group.id && <Check size={16} className="text-blue-500" />}
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1 flex items-center gap-4 px-3 py-2">
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Plus size={14} /> 新建用户组
                  </button>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    <Pencil size={14} /> 编辑用户组
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="text-sm text-gray-500 flex items-center gap-1">
            可为不同用户组配置不同的应用
            <Info size={14} className="text-gray-400" />
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                保存
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <Pencil size={14} /> 编辑导航
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex min-w-[820px] items-start gap-6">
        {/* Left: Operation Area */}
        <div className="w-[476px] flex-none">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-medium text-gray-900">操作区域</h3>
            <span className="text-xs text-gray-400">(数量限制: 2~25个)</span>
          </div>

          <div className="w-full bg-white rounded-xl border border-gray-200 p-1">
            <div className="grid grid-cols-[repeat(5,88px)] gap-1.5">
              {selectedApps.map((app) => (
                <div
                  key={app.id}
                  role={isEditing ? 'button' : undefined}
                  tabIndex={isEditing ? 0 : undefined}
                  onClick={() => openEditTileModal(app)}
                  onKeyDown={(event) => {
                    if (!isEditing) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      openEditTileModal(app);
                    }
                  }}
                  className="relative flex h-[74px] w-[88px] flex-none flex-col items-center justify-center gap-1 rounded-md border border-gray-100 bg-white p-1 transition-colors hover:border-gray-200"
                >
                  {isEditing && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveApp(app.id);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors z-10"
                      disabled={selectedAppIds.length <= 2}
                    >
                      <Minus size={12} />
                    </button>
                  )}
                  <div className={`w-6 h-6 flex items-center justify-center ${app.color}`}>
                    {app.icon}
                  </div>
                  <span className="text-[10px] leading-tight text-gray-600 text-center">{app.label}</span>
                </div>
              ))}

              {isEditing && (
                <button
                  onClick={openAddTileModal}
                  className="flex h-[74px] w-[88px] flex-none flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 bg-white p-1 transition-colors hover:border-blue-400 hover:bg-blue-50/30"
                >
                  <div className="w-6 h-6 flex items-center justify-center text-gray-400">
                    <Plus size={18} />
                  </div>
                  <span className="text-[10px] leading-tight text-gray-500 text-center">
                    添加磁贴
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="w-80 flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setPreviewMode('light')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                previewMode === 'light'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              浅色模式
            </button>
            <button
              onClick={() => setPreviewMode('dark')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                previewMode === 'dark'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              深色模式
            </button>
          </div>

          <div className={`rounded-xl border overflow-hidden ${
            previewMode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>

            {/* Preview sidebar */}
            <div className={`p-3 ${previewMode === 'dark' ? 'bg-slate-800' : 'bg-gray-50'}`}>
              {/* User avatar row */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center">
                  <span className="text-xs text-white font-medium">梁</span>
                </div>
                <div className="w-6 h-4 bg-blue-100 rounded-sm" />
                <div className="ml-auto w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                  <Plus size={12} className="text-gray-400" />
                </div>
              </div>

              {/* Search */}
              <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md mb-3 text-xs ${
                previewMode === 'dark' ? 'bg-slate-700 text-slate-400' : 'bg-white text-gray-400 border border-gray-200'
              }`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                搜索 (⌘+K)
              </div>

              {/* App list */}
              <div className="space-y-0.5">
                {selectedApps.slice(0, 8).map((app, idx) => (
                  <div
                    key={app.id}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs ${
                      idx === 0
                        ? (previewMode === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                        : (previewMode === 'dark' ? 'text-slate-300 hover:bg-slate-700/50' : 'text-gray-700 hover:bg-gray-100')
                    }`}
                  >
                    <span className={app.color}>{app.icon}</span>
                    <span className="truncate">{app.label}</span>
                  </div>
                ))}
                {selectedApps.length > 8 && (
                  <div className={`text-xs px-2 py-1 ${
                    previewMode === 'dark' ? 'text-slate-500' : 'text-gray-400'
                  }`}>
                    ...还有{selectedApps.length - 8}个
                  </div>
                )}
              </div>

              {/* Bottom quick access */}
              <div className={`mt-3 pt-3 border-t ${
                previewMode === 'dark' ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <div className="grid grid-cols-4 gap-2">
                  {selectedApps.slice(0, 4).map(app => (
                    <div key={app.id} className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        previewMode === 'dark' ? 'bg-slate-700' : 'bg-white border border-gray-200'
                      }`}>
                        <span className={`scale-75 ${app.color}`}>{app.icon}</span>
                      </div>
                      <span className={`text-[10px] ${previewMode === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{app.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {tileModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/35 pt-24">
          <div className="w-[540px] rounded-md bg-white shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{tileModal.mode === 'add' ? '添加' : '编辑'}</h3>
                <p className="mt-2 text-xs text-gray-500">可添加任意网页链接，如云文档、多维表格，仅对 7.0 及以上版本生效</p>
              </div>
              <button
                onClick={closeTileModal}
                className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 px-6 pb-8">
              <label className="block">
                <span className="text-sm text-gray-900">链接地址<span className="text-red-500">*</span></span>
                <input
                  value={tileForm.link}
                  onChange={(event) => setTileForm(prev => ({ ...prev, link: event.target.value }))}
                  className="mt-2 h-8 w-full rounded border border-gray-300 px-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500"
                  placeholder="请填写 HTTP 或 HTTPS 地址"
                />
              </label>

              <label className="block">
                <span className="text-sm text-gray-900">展示名称<span className="text-red-500">*</span></span>
                <input
                  value={tileForm.name}
                  onChange={(event) => setTileForm(prev => ({ ...prev, name: event.target.value }))}
                  className="mt-2 h-8 w-full rounded border border-gray-300 px-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-500"
                  placeholder="请填写链接展示名称"
                />
              </label>

              <div>
                <div className="text-sm text-gray-900">展示图标<span className="text-red-500">*</span></div>
                <div className="mt-2 flex items-center gap-5">
                  <button className="flex h-[72px] w-[72px] items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-800 transition-colors hover:border-blue-400 hover:bg-blue-50">
                    {tileModal.app ? (
                      <span className={tileModal.app.color}>{tileModal.app.icon}</span>
                    ) : (
                      <Plus size={24} />
                    )}
                  </button>
                  <div className="text-xs text-gray-700">
                    <div>JPEG/PNG/SVG/BMP 格式，2 MB 以内，大于 240*240 px，无圆角</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-5">
              <button
                onClick={closeTileModal}
                className="h-8 rounded border border-gray-300 px-5 text-sm text-gray-800 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                className="h-8 rounded bg-gray-300 px-5 text-sm text-white"
                disabled
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
