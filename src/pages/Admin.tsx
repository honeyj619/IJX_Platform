import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Menu, X, Shield, Lock, GitBranch, LayoutDashboard, 
  Globe, Network, Palette, ChevronRight, User, FolderTree,
  Route, Wand2, FileText, Edit3, Image as ImageIcon, Type, AlignJustify, Plus, Search, Upload
} from 'lucide-react';
import NavigationConfig from '../components/NavigationConfig';
import { SIDEBAR } from '../constants/layout';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'system',
    label: '系统',
    icon: <Shield size={18} />,
    children: [
      { id: 'system-user', label: '用户管理', icon: <User size={16} /> },
      { id: 'system-role', label: '角色管理', icon: <Lock size={16} /> },
      { id: 'system-permission', label: '权限管理', icon: <Shield size={16} /> },
      { id: 'system-nav', label: '导航栏配置', icon: <Route size={16} /> },
      { id: 'security-log', label: '操作日志', icon: <GitBranch size={16} /> },
      { id: 'security-audit', label: '安全审计', icon: <Shield size={16} /> },
      { id: 'version-list', label: '版本列表', icon: <GitBranch size={16} /> },
      { id: 'version-release', label: '发布记录', icon: <Globe size={16} /> },
      { id: 'workspace-admin', label: '工作台', icon: <LayoutDashboard size={16} /> },
      { id: 'portal-admin', label: '门户基础管理', icon: <Globe size={16} /> },
      { id: 'business-admin', label: '业务系统管理', icon: <FolderTree size={16} /> },
      { id: 'theme-admin', label: '主题装扮管理', icon: <Palette size={16} /> },
    ]
  },
  {
    id: 'initial',
    label: 'i吉祥初始功能',
    icon: <LayoutDashboard size={18} />,
  },
  {
    id: 'ai',
    label: 'AI辅助功能',
    icon: <Wand2 size={18} />,
    children: [
      { id: 'ai-template', label: '公文模板管理', icon: <FileText size={16} /> },
    ]
  },
  {
    id: 'business-feature',
    label: '业务功能',
    icon: <FolderTree size={18} />,
  },
];

function ContentPlaceholder({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">此功能模块正在开发中，敬请期待。</p>
    </div>
  );
}

const documentTemplateRows = [
  { id: 'notice-red', name: '红头通知模板', category: '通知', updater: '梁吉力', updatedAt: '2026-06-16 13:20', description: '适用于公司级正式通知、制度发布与跨部门工作安排。', titleLevel: '二号主标题', lineHeight: '28 磅', letterSpacing: '标准' },
  { id: 'party-study', name: '党群学习模板', category: '党群', updater: '梁吉力', updatedAt: '2026-06-15 16:40', description: '适用于党群学习活动、主题教育、组织生活等材料。', titleLevel: '三号一级标题', lineHeight: '26 磅', letterSpacing: '加宽 0.3 磅' },
  { id: 'meeting-minutes', name: '会议纪要模板', category: '会议纪要', updater: '王敏', updatedAt: '2026-06-14 11:05', description: '适用于项目会议、专题会议、经营分析会等纪要场景。', titleLevel: '小二主标题', lineHeight: '固定值 28 磅', letterSpacing: '标准' },
  { id: 'brief-blue', name: '工作简报模板', category: '工作简报', updater: '赵磊', updatedAt: '2026-06-12 09:30', description: '适用于周报简报、经营简报和阶段性工作汇报。', titleLevel: '二号主标题', lineHeight: '1.5 倍行距', letterSpacing: '标准' },
];

function TemplatePreviewCard({ accent = 'bg-red-500' }: { accent?: string }) {
  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-2">
      <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded bg-white">
        <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
          <ImageIcon size={28} />
          <span className="text-xs">预览图</span>
        </div>
      </div>
    </div>
  );
}

function DocumentTemplateManagement() {
  const [selectedId, setSelectedId] = useState(documentTemplateRows[0].id);
  const selectedTemplate = documentTemplateRows.find(item => item.id === selectedId) || documentTemplateRows[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">公文模板管理</h2>
          <p className="mt-1 text-sm text-gray-500">维护 AI 公文生成时可选的模板样式、排版规则和预览信息。</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
          <FileText size={16} />
          新增模板
        </button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="text-base font-semibold text-gray-900">模板列表</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-5 py-3">模板名称</th>
                  <th className="px-5 py-3">类别</th>
                  <th className="px-5 py-3">更新人</th>
                  <th className="px-5 py-3">更新时间</th>
                  <th className="px-5 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {documentTemplateRows.map((item) => (
                  <tr
                    key={item.id}
                    className={`cursor-pointer transition-colors hover:bg-red-50/40 ${selectedId === item.id ? 'bg-red-50/60' : ''}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td className="px-5 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{item.category}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{item.updater}</td>
                    <td className="px-5 py-4 text-gray-500">{item.updatedAt}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId(item.id);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        <Edit3 size={13} />
                        编辑模板
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div key={selectedTemplate.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-base font-semibold text-gray-900">编辑模板</div>
              <div className="mt-1 text-xs text-gray-400">{selectedTemplate.name}</div>
            </div>
            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">{selectedTemplate.category}</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <ImageIcon size={15} className="text-gray-400" />
                预览图
              </div>
              <TemplatePreviewCard accent={selectedTemplate.category === '通知' ? 'bg-red-500' : selectedTemplate.category === '工作简报' ? 'bg-blue-500' : 'bg-theme-500'} />
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">模板描述</span>
              <textarea
                defaultValue={selectedTemplate.description}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-5 text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
              />
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Type size={14} className="text-gray-400" />
                  title
                </span>
                <select
                  defaultValue={selectedTemplate.titleLevel}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>二号主标题</option>
                  <option>小二主标题</option>
                  <option>三号一级标题</option>
                  <option>三号二级标题</option>
                  <option>四号正文标题</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <AlignJustify size={14} className="text-gray-400" />
                  行间距
                </span>
                <select
                  defaultValue={selectedTemplate.lineHeight}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>固定值 26 磅</option>
                  <option>固定值 28 磅</option>
                  <option>28 磅</option>
                  <option>1.5 倍行距</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-gray-700">字间距</span>
              <select
                defaultValue={selectedTemplate.letterSpacing}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
              >
                <option>标准</option>
                <option>加宽 0.3 磅</option>
                <option>加宽 0.5 磅</option>
                <option>紧缩 0.2 磅</option>
              </select>
            </label>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">取消</button>
              <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">保存模板</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentTemplateManagementPages() {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const editingTemplate = documentTemplateRows.find(item => item.id === editingTemplateId) || documentTemplateRows[0];

  if (editingTemplateId) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => setEditingTemplateId(null)}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-700"
            >
              <ChevronRight size={14} className="rotate-180" />
              返回模板列表
            </button>
            <h2 className="text-2xl font-bold text-gray-900">编辑模板</h2>
            <p className="mt-1 text-sm text-gray-500">{editingTemplate.name}</p>
          </div>
          <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">{editingTemplate.category}</span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-800">
              <ImageIcon size={16} className="text-gray-400" />
              预览图
            </div>
            <TemplatePreviewCard accent={editingTemplate.category === '通知' ? 'bg-red-500' : editingTemplate.category === '工作简报' ? 'bg-blue-500' : 'bg-theme-500'} />
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 border-b border-gray-100 pb-4">
              <div className="text-base font-semibold text-gray-900">模板信息</div>
              <div className="mt-1 text-xs text-gray-400">调整后将影响 AI 公文生成时的模板选择与预览。</div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <label className="block lg:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">模板名称</span>
                <input
                  defaultValue={editingTemplate.name}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">类别</span>
                <select
                  defaultValue={editingTemplate.category}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>通知</option>
                  <option>党群</option>
                  <option>会议纪要</option>
                  <option>工作简报</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <Type size={14} className="text-gray-400" />
                  title
                </span>
                <select
                  defaultValue={editingTemplate.titleLevel}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>二号主标题</option>
                  <option>小二主标题</option>
                  <option>三号一级标题</option>
                  <option>三号二级标题</option>
                  <option>四号正文标题</option>
                </select>
              </label>

              <label className="block lg:col-span-2">
                <span className="mb-1 block text-sm font-medium text-gray-700">模板描述</span>
                <textarea
                  defaultValue={editingTemplate.description}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm leading-5 text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                />
              </label>

              <label className="block">
                <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                  <AlignJustify size={14} className="text-gray-400" />
                  行间距
                </span>
                <select
                  defaultValue={editingTemplate.lineHeight}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>固定值 26 磅</option>
                  <option>固定值 28 磅</option>
                  <option>28 磅</option>
                  <option>1.5 倍行距</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-gray-700">字间距</span>
                <select
                  defaultValue={editingTemplate.letterSpacing}
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-800 outline-none focus:border-red-200 focus:ring-2 focus:ring-red-100"
                >
                  <option>标准</option>
                  <option>加宽 0.3 磅</option>
                  <option>加宽 0.5 磅</option>
                  <option>紧缩 0.2 磅</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                onClick={() => setEditingTemplateId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">保存模板</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">公文模板管理</h2>
          <p className="mt-1 text-sm text-gray-500">维护 AI 公文生成时可选的模板样式、排版规则和预览信息。</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700">
          <FileText size={16} />
          新增模板
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="text-base font-semibold text-gray-900">模板列表</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50 text-left text-xs font-medium text-gray-500">
              <tr>
                <th className="px-5 py-3">模板名称</th>
                <th className="px-5 py-3">类别</th>
                <th className="px-5 py-3">更新人</th>
                <th className="px-5 py-3">更新时间</th>
                <th className="px-5 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {documentTemplateRows.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-red-50/40">
                  <td className="px-5 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{item.category}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{item.updater}</td>
                  <td className="px-5 py-4 text-gray-500">{item.updatedAt}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setEditingTemplateId(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                    >
                      <Edit3 size={13} />
                      编辑模板
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminTabs({ active }: { active: string }) {
  const tabs = ['首页', '系统管理', active];
  return (
    <div className="flex h-10 items-end gap-1 border-b border-gray-200 bg-gray-100 px-4">
      {tabs.map((tab, index) => (
        <div
          key={`${tab}-${index}`}
          className={`flex h-10 items-center gap-2 border border-b-0 px-5 text-sm ${
            index === tabs.length - 1
              ? 'bg-white text-[#2f75b5]'
              : 'bg-white/80 text-gray-600'
          }`}
        >
          {index === tabs.length - 1 && <Search size={14} />}
          <span>{tab}</span>
          {index > 0 && <X size={13} className="text-gray-400" />}
        </div>
      ))}
    </div>
  );
}

function DocumentTemplateManagementConsole() {
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [titleRules, setTitleRules] = useState([
    { level: '一级标题', description: '主标题使用二号方正小标宋，居中展示，段后 1 行。' },
  ]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const isCreatingTemplate = editingTemplateId === '__new__';
  const editingTemplate = isCreatingTemplate
    ? { id: '__new__', name: '新增公文模板', category: '通知', updater: '梁吉力', updatedAt: '刚刚', description: '', titleLevel: '一级标题', lineHeight: '固定值 28 磅', letterSpacing: '标准' }
    : documentTemplateRows.find(item => item.id === editingTemplateId) || documentTemplateRows[0];
  const filteredRows = documentTemplateRows.filter((item) => item.name.includes(templateName.trim()));
  const handleOpenTemplateEditor = (templateId: string) => {
    setEditingTemplateId(templateId);
    setUploadedFile(null);
    setPreviewImageFile(null);
    setTitleRules([{ level: '一级标题', description: '主标题使用二号方正小标宋，居中展示，段后 1 行。' }]);
  };
  const handleAddTitleRule = () => {
    setTitleRules((current) => {
      if (current.length >= 5) return current;
      const labels = ['一级标题', '二级标题', '三级标题', '四级标题', '五级标题'];
      return [...current, { level: labels[current.length], description: '' }];
    });
  };

  if (editingTemplateId) {
    return (
      <div className="min-h-[calc(100vh-7rem)] w-full min-w-0 bg-[#eef1f5] pt-3 text-sm text-gray-800">
        <AdminTabs active={isCreatingTemplate ? "新增模板" : "编辑模板"} />
        <div className="bg-white px-8 py-4">
          <div className="mb-5 text-sm text-gray-500">
            首页 <span className="mx-2">/</span> AI辅助功能 <span className="mx-2">/</span> 公文模板管理 <span className="mx-2">/</span>
            <span className="text-gray-800">{isCreatingTemplate ? '新增模板' : '编辑模板'}</span>
          </div>
          <button
            onClick={() => setEditingTemplateId(null)}
            className="rounded border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            返回
          </button>
        </div>

        <div className="p-5">
          <div className="bg-white p-6">
            <div className="mb-5 border-b border-gray-100 pb-3 text-base font-semibold text-gray-900">模板信息</div>
            <div className="grid min-w-0 gap-6 xl:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <div className="mb-2 text-sm text-gray-700">预览图</div>
                {previewImageFile ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(previewImageFile)}
                      alt="预览图"
                      className="w-full max-w-[200px] rounded border border-gray-200 object-cover"
                    />
                    <button
                      onClick={() => setPreviewImageFile(null)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:border-red-400 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex w-full max-w-[200px] cursor-pointer flex-col items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 py-4 hover:border-[#2f75b5] hover:bg-blue-50/30">
                    <ImageIcon size={16} className="text-gray-400" />
                    <span className="mt-1 text-xs text-gray-500">上传预览图</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) setPreviewImageFile(file);
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="min-w-0 space-y-5">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-24 text-right text-gray-700"><span className="text-red-500">*</span> 模板名称:</span>
                    <div className="relative w-full max-w-[520px]">
                      <input defaultValue={editingTemplate.name} className="h-9 w-full rounded border border-gray-300 px-3 pr-8 outline-none focus:border-[#2f75b5]" />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-24 text-right text-gray-700"><span className="text-red-500">*</span> 类别:</span>
                    <select defaultValue={editingTemplate.category} className="h-9 w-full max-w-56 rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]">
                      <option>通知</option>
                      <option>党群</option>
                      <option>会议纪要</option>
                      <option>工作简报</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <span className="mt-2 w-24 text-right text-gray-700"><span className="text-red-500">*</span> title格式:</span>
                    <div className="flex-1 space-y-4">
                      {titleRules.map((rule, index) => (
                        <div key={index} className="flex flex-wrap items-center gap-2">
                          <select
                            value={rule.level}
                            onChange={(event) => {
                              const next = [...titleRules];
                              next[index] = { ...next[index], level: event.target.value };
                              setTitleRules(next);
                            }}
                            className="h-9 w-28 rounded border border-gray-300 px-2 outline-none focus:border-[#2f75b5]"
                          >
                            <option>一级标题</option>
                            <option>二级标题</option>
                            <option>三级标题</option>
                            <option>四级标题</option>
                            <option>五级标题</option>
                          </select>
                          <textarea
                            value={rule.description}
                            onChange={(event) => {
                              const next = [...titleRules];
                              next[index] = { ...next[index], description: event.target.value };
                              setTitleRules(next);
                            }}
                            rows={1}
                            placeholder="要求描述"
                            className="min-h-9 w-full max-w-[420px] resize-y rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#2f75b5]"
                          />
                          <button
                            onClick={handleAddTitleRule}
                            disabled={titleRules.length >= 5}
                            className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-500 text-lg leading-none text-gray-700 hover:border-[#2f75b5] hover:text-[#2f75b5] disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-300"
                          >
                            +
                          </button>
                          {index > 0 && (
                            <button
                              onClick={() => setTitleRules((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-500 text-lg leading-none text-gray-700 hover:border-[#2f75b5] hover:text-[#2f75b5]"
                            >
                              -
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <span className="mt-2 w-24 text-right text-gray-700"><span className="text-red-500">*</span> 模板上传:</span>
                    <div className="flex-1 max-w-[360px]">
                      {uploadedFile ? (
                        <div className="flex items-center gap-3 rounded border border-gray-300 bg-gray-50 px-3 py-2">
                          <FileText size={16} className="text-[#2f75b5] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-sm font-medium text-gray-800">{uploadedFile.name}</div>
                            <div className="text-xs text-gray-400">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                          </div>
                          <button
                            onClick={() => setUploadedFile(null)}
                            className="flex-shrink-0 text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-gray-300 bg-gray-50 hover:border-[#2f75b5] hover:bg-blue-50/30">
                          <Upload size={18} className="text-gray-400" />
                          <span className="text-sm text-gray-500">上传 Word 模板</span>
                          <input
                            type="file"
                            accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            className="hidden"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file) setUploadedFile(file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-start gap-2">
                    <span className="mt-2 w-24 text-right text-gray-700">模板描述:</span>
                    <textarea defaultValue={editingTemplate.description} rows={4} className="w-full max-w-[620px] resize-none rounded border border-gray-300 px-3 py-2 outline-none focus:border-[#2f75b5]" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                  <button onClick={() => setEditingTemplateId(null)} className="rounded border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50">取消</button>
                  <button className="rounded bg-[#2f75b5] px-5 py-2 font-medium text-white hover:bg-[#28669f]">保存</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pb-7 pt-2 text-center text-xs text-gray-500">
          吉祥航空　如意到家
          <div className="mt-1">Copyright © 2026 吉祥航空版权所有</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7rem)] w-full min-w-0 bg-[#eef1f5] pt-3 text-sm text-gray-800">
      <AdminTabs active="公文模板管理" />
      <div className="bg-white px-8 py-4">
        <div className="mb-5 text-sm text-gray-500">
          首页 <span className="mx-2">/</span> AI辅助功能 <span className="mx-2">/</span>
          <span className="text-gray-800">公文模板管理</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="text-gray-800">模板名称</span>
            <input
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="请输入模板名称"
              className="h-9 w-[min(18rem,calc(100vw-20rem))] min-w-0 rounded border border-gray-300 px-3 outline-none focus:border-[#2f75b5]"
            />
          </label>
          <div className="ml-auto flex gap-2">
            <button className="rounded bg-[#2f75b5] px-5 py-2 font-medium text-white hover:bg-[#28669f]">查询</button>
            <button onClick={() => setTemplateName('')} className="rounded border border-gray-300 bg-white px-5 py-2 text-gray-700 hover:bg-gray-50">重置</button>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="bg-white p-5">
          <button onClick={() => handleOpenTemplateEditor('__new__')} className="mb-4 inline-flex items-center gap-1.5 rounded bg-[#2f75b5] px-4 py-2 font-medium text-white hover:bg-[#28669f]">
            <Plus size={15} />
            新增模板
          </button>
          <div className="w-full overflow-x-auto">
          <table className="min-w-[760px] w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-900">
                <th className="px-3 py-3 font-medium">模板名称</th>
                <th className="px-3 py-3 font-medium">类别</th>
                <th className="px-3 py-3 font-medium">更新人</th>
                <th className="px-3 py-3 font-medium">更新时间</th>
                <th className="px-3 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-3 text-gray-800">{item.name}</td>
                  <td className="px-3 py-3 text-gray-600">{item.category}</td>
                  <td className="px-3 py-3 text-gray-600">{item.updater}</td>
                  <td className="px-3 py-3 text-gray-600">{item.updatedAt}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => handleOpenTemplateEditor(item.id)} className="mr-4 text-[#2f75b5] hover:underline">编辑</button>
                    <button className="text-[#2f75b5] hover:underline">删除</button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td className="px-3 py-10 text-center text-gray-400" colSpan={5}>暂无模板数据</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div className="pb-7 pt-2 text-center text-xs text-gray-500">
        吉祥航空　如意到家
        <div className="mt-1">Copyright © 2026 吉祥航空版权所有</div>
      </div>
    </div>
  );
}

export default function Admin() {
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(searchParams.get('section') === 'ai-template' ? 'ai' : null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(searchParams.get('section') === 'ai-template' ? 'ai-template' : null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('section') === 'ai-template') {
      setActiveMenu('ai');
      setActiveSubMenu('ai-template');
    }
  }, [searchParams]);

  const handleMenuClick = (menuId: string, hasChildren: boolean) => {
    // 工作台跳转至主应用首页
    if (menuId === 'workspace') {
      navigate('/');
      return;
    }
    if (hasChildren) {
      setActiveMenu(activeMenu === menuId ? null : menuId);
      setActiveSubMenu(null);
    } else {
      setActiveMenu(menuId);
      setActiveSubMenu(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <div className={`
        ${sidebarOpen ? 'w-64' : 'w-16'} 
        bg-gradient-to-b from-red-600 to-red-800 flex flex-col transition-all duration-300
      `}>
        {/* Logo区域 */}
        <div className="p-4 border-b border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🐉</span>
            </div>
            {sidebarOpen && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-white font-bold text-sm">JUNEYAO AIR</span>
                <span className="text-white/80 text-xs">吉祥航空</span>
              </div>
            )}
          </div>
        </div>

        {/* 菜单按钮 */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 left-64 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          style={{ left: sidebarOpen ? SIDEBAR.EXPANDED : SIDEBAR.COLLAPSED }}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* 菜单列表 */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 space-y-1">
            <div className="text-xs text-red-200/60 px-3 py-2 font-medium uppercase tracking-wider">
              系统
            </div>
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id, !!item.children)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                    ${activeMenu === item.id ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10'}
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                      {item.children && (
                        <ChevronRight 
                          size={14} 
                          className={`transition-transform ${activeMenu === item.id ? 'rotate-90' : ''}`} 
                        />
                      )}
                    </>
                  )}
                </button>
                {sidebarOpen && item.children && activeMenu === item.id && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => setActiveSubMenu(subItem.id)}
                        className={`
                          w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                          ${activeSubMenu === subItem.id ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white/80 hover:bg-white/5'}
                        `}
                      >
                        <span>{subItem.icon}</span>
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 底部版权 */}
        {sidebarOpen && (
          <div className="p-4 border-t border-red-500/30">
            <div className="text-xs text-red-200/60 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span>吉祥航空</span>
                <span>✈️</span>
                <span>如意到家</span>
              </div>
              <div>Copyright © 2026 吉祥航空版权所有</div>
            </div>
          </div>
        )}
      </div>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">首页</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">梁劼</span>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* 无选中菜单时显示欢迎页 */}
          {!activeMenu && !activeSubMenu ? (
            <div className={`${activeSubMenu === 'ai-template' ? 'max-w-7xl' : 'max-w-4xl'} mx-auto`}>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
                <div className="text-center">
                  {/* 插图区域 */}
                  <div className="relative mb-8">
                    <div className="absolute -top-4 -left-8 w-32 h-16">
                      <svg viewBox="0 0 128 64" className="w-full h-full">
                        <path d="M10 32 L100 32 L90 22 L95 32 L90 42 Z" fill="#333" className="animate-pulse" />
                        <path d="M95 32 L120 32" stroke="#ddd" strokeWidth="2" strokeDasharray="4 4" />
                        <circle cx="115" cy="28" r="3" fill="#ddd" />
                        <circle cx="110" cy="24" r="2" fill="#ddd" />
                      </svg>
                    </div>
                    <div className="inline-block relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-1">💼</div>
                            <div className="text-xs text-gray-500">管理后台</div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute -right-4 top-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm">✓</span>
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-4">
                      <svg viewBox="0 0 64 32" className="w-16 h-8">
                        <ellipse cx="20" cy="24" rx="16" ry="8" fill="#f0f0f0" />
                        <ellipse cx="36" cy="20" rx="14" ry="10" fill="#f0f0f0" />
                        <ellipse cx="48" cy="24" rx="12" ry="6" fill="#f0f0f0" />
                      </svg>
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">欢迎使用管理后台</h1>
                  <p className="text-gray-500 mb-8">系统、i吉祥初始功能、AI辅助功能、业务功能入口</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                    {[
                      { icon: '🔐', label: '系统', color: 'bg-blue-50 text-blue-600', menuId: 'system' },
                      { icon: '📊', label: 'i吉祥初始功能', color: 'bg-orange-50 text-orange-600', menuId: 'initial' },
                      { icon: '✨', label: 'AI辅助功能', color: 'bg-purple-50 text-purple-600', menuId: 'ai' },
                      { icon: '📁', label: '业务功能', color: 'bg-green-50 text-green-600', menuId: 'business-feature' },
                    ].map((item, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          setActiveMenu(item.menuId);
                          setActiveSubMenu(null);
                        }}
                        className={`p-4 rounded-xl ${item.color} hover:shadow-md transition-shadow cursor-pointer`}
                      >
                        <div className="text-2xl mb-2">{item.icon}</div>
                        <div className="text-sm font-medium">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* 根据选中菜单展示对应内容 */
            <div className={activeSubMenu === 'ai-template' ? 'w-full min-w-0' : 'max-w-4xl mx-auto'}>
              {/* 面包屑导航 */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span className="cursor-pointer hover:text-gray-700" onClick={() => { setActiveMenu(null); setActiveSubMenu(null); }}>首页</span>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-medium">
                  {menuItems.find(m => m.id === activeMenu)?.label || ''}
                </span>
                {activeSubMenu && (
                  <>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium">
                      {menuItems.find(m => m.id === activeMenu)?.children?.find(c => c.id === activeSubMenu)?.label || ''}
                    </span>
                  </>
                )}
              </div>

              {/* 系统管理子页面 */}
              {activeMenu === 'ai' && (
                <div>
                  {!activeSubMenu && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">AI辅助功能</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.find(m => m.id === 'ai')?.children?.map(sub => (
                          <div key={sub.id} onClick={() => setActiveSubMenu(sub.id)}
                            className="p-6 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md cursor-pointer transition-all">
                            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center mb-3">{sub.icon}</div>
                            <div className="font-medium text-gray-900">{sub.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSubMenu === 'ai-template' && <DocumentTemplateManagementConsole />}
                </div>
              )}

              {activeMenu === 'system' && (
                <div>
                  {!activeSubMenu && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">系统管理</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {menuItems.find(m => m.id === 'system')?.children?.map(sub => (
                          <div key={sub.id} onClick={() => setActiveSubMenu(sub.id)}
                            className="p-6 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md cursor-pointer transition-all">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">{sub.icon}</div>
                            <div className="font-medium text-gray-900">{sub.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSubMenu === 'system-user' && <ContentPlaceholder title="用户管理" icon="👥" />}
                  {activeSubMenu === 'system-role' && <ContentPlaceholder title="角色管理" icon="🔑" />}
                  {activeSubMenu === 'system-permission' && <ContentPlaceholder title="权限管理" icon="🛡️" />}
                  {activeSubMenu === 'system-nav' && <NavigationConfig />}
                  {activeSubMenu === 'security-log' && <ContentPlaceholder title="操作日志" icon="📋" />}
                  {activeSubMenu === 'security-audit' && <ContentPlaceholder title="安全审计" icon="🔍" />}
                  {activeSubMenu === 'version-list' && <ContentPlaceholder title="版本列表" icon="📦" />}
                  {activeSubMenu === 'version-release' && <ContentPlaceholder title="发布记录" icon="🚀" />}
                  {activeSubMenu === 'workspace-admin' && <ContentPlaceholder title="工作台" icon="📊" />}
                  {activeSubMenu === 'portal-admin' && <ContentPlaceholder title="门户基础管理" icon="🌐" />}
                  {activeSubMenu === 'business-admin' && <ContentPlaceholder title="业务系统管理" icon="📁" />}
                  {activeSubMenu === 'theme-admin' && <ContentPlaceholder title="主题装扮管理" icon="🎨" />}
                </div>
              )}

              {/* 安全管理子页面 */}
              {activeMenu === 'security' && (
                <div>
                  {!activeSubMenu && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">安全管理</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.find(m => m.id === 'security')?.children?.map(sub => (
                          <div key={sub.id} onClick={() => setActiveSubMenu(sub.id)}
                            className="p-6 rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md cursor-pointer transition-all">
                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3">{sub.icon}</div>
                            <div className="font-medium text-gray-900">{sub.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSubMenu === 'security-log' && <ContentPlaceholder title="操作日志" icon="📋" />}
                  {activeSubMenu === 'security-audit' && <ContentPlaceholder title="安全审计" icon="🔍" />}
                </div>
              )}

              {/* 版本管理子页面 */}
              {activeMenu === 'version' && (
                <div>
                  {!activeSubMenu && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">版本管理</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.find(m => m.id === 'version')?.children?.map(sub => (
                          <div key={sub.id} onClick={() => setActiveSubMenu(sub.id)}
                            className="p-6 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md cursor-pointer transition-all">
                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3">{sub.icon}</div>
                            <div className="font-medium text-gray-900">{sub.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeSubMenu === 'version-list' && <ContentPlaceholder title="版本列表" icon="📦" />}
                  {activeSubMenu === 'version-release' && <ContentPlaceholder title="发布记录" icon="🚀" />}
                </div>
              )}

              {activeMenu === 'initial' && <ContentPlaceholder title="i吉祥初始功能" icon="📊" />}

              {activeMenu === 'business-feature' && <ContentPlaceholder title="业务功能" icon="📁" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
