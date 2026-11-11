import { useEffect, useRef, useState } from 'react';
import { FileArchive, Plus, Upload, X } from 'lucide-react';
import { getUserGroups } from '../../data/userGroups';

/** 新增版本弹框支持的端（与 Admin 页 VersionPlatform 一致） */
export type VersionCreatePlatform = 'android' | 'ios' | 'macos' | 'windows';

/** 四端差异配置：仅标题、安装包扩展名、安装包类型和默认系统说明不同 */
export const versionCreatePlatformConfig: Record<
  VersionCreatePlatform,
  {
    title: string;
    platformLabel: string;
    accept: string;
    extensions: string[];
    extensionHint: string;
    packageType: string;
    defaultOS: string;
  }
> = {
  android: {
    title: '添加android版本',
    platformLabel: 'android',
    accept: '.apk',
    extensions: ['.apk'],
    extensionHint: '支持扩展名：.apk',
    packageType: 'APK',
    defaultOS: 'Android 10+',
  },
  ios: {
    title: '添加iOS版本',
    platformLabel: 'iOS',
    accept: '.ipa',
    extensions: ['.ipa'],
    extensionHint: '支持扩展名：.ipa',
    packageType: 'IPA',
    defaultOS: 'iOS 15+',
  },
  macos: {
    title: '添加macOS版本',
    platformLabel: 'macOS',
    accept: '.dmg,.pkg',
    extensions: ['.dmg', '.pkg'],
    extensionHint: '支持扩展名：.dmg、.pkg',
    packageType: 'DMG/PKG',
    defaultOS: 'macOS 12+',
  },
  windows: {
    title: '添加Windows版本',
    platformLabel: 'Windows',
    accept: '.exe,.msi',
    extensions: ['.exe', '.msi'],
    extensionHint: '支持扩展名：.exe、.msi',
    packageType: 'EXE/MSI',
    defaultOS: 'Windows 10/11',
  },
};

/** 新增弹框提交结果：仅元数据，不携带 File / Base64 / 伪造下载地址 */
export type VersionCreatePayload = {
  platform: VersionCreatePlatform;
  versionNo: string;
  buildNo: string;
  forceUpdate: boolean;
  scopeId: string;
  scopeLabel: string;
  description: string;
  content: string;
  packageFileName: string;
  packageSizeLabel: string;
  packageExt: string;
  logoFileName: string;
};

/** 弹框需要感知的既有记录（用于构建号与版本号查重） */
export type VersionCreateExistingRecord = {
  platform: VersionCreatePlatform;
  versionNo: string;
  buildNo: string;
};

const SCOPE_ALL_ID = 'all';
const LOGO_REQUIRED_SIZE = 48;

/** 构建号：YYYYMMDD + 当日三位序号；同日已有记录时取最大序号加一 */
const generateBuildNo = (records: VersionCreateExistingRecord[]) => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const prefix = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  let maxSeq = 0;
  records.forEach(record => {
    if (record.buildNo.length === 11 && record.buildNo.startsWith(prefix)) {
      const seq = Number(record.buildNo.slice(8));
      if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
    }
  });
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getFileExtension = (name: string) => {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
};

type PackageFileState = { name: string; sizeLabel: string; ext: string };
type LogoFileState = { fileName: string; previewUrl: string };

export default function VersionCreateDialog({
  open,
  platform,
  existingRecords,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  platform: VersionCreatePlatform;
  existingRecords: VersionCreateExistingRecord[];
  onCancel: () => void;
  onSubmit: (payload: VersionCreatePayload) => void;
}) {
  const config = versionCreatePlatformConfig[platform];
  const [buildNo, setBuildNo] = useState('');
  const [versionNo, setVersionNo] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [scopeId, setScopeId] = useState('');
  const [scopeOptions, setScopeOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [packageFile, setPackageFile] = useState<PackageFileState | null>(null);
  const [logoFile, setLogoFile] = useState<LogoFileState | null>(null);
  const [errors, setErrors] = useState({ package: '', logo: '', version: '', content: '' });

  const packageInputRef = useRef<HTMLInputElement | null>(null);
  const packageButtonRef = useRef<HTMLButtonElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const logoButtonRef = useRef<HTMLButtonElement | null>(null);
  const versionInputRef = useRef<HTMLInputElement | null>(null);
  const contentInputRef = useRef<HTMLTextAreaElement | null>(null);
  // 当前有效的 Logo 预览 object URL（用于释放，避免内存泄漏）
  const logoPreviewUrlRef = useRef('');

  // 异步释放：等待当前渲染提交（img 移除/替换）后再 revoke，
  // 避免正在加载中的 blob 请求被中断并在控制台产生 ERR_FILE_NOT_FOUND
  const releaseLogoPreview = () => {
    const url = logoPreviewUrlRef.current;
    logoPreviewUrlRef.current = '';
    if (url) window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  // 打开时重置表单并重新计算构建号；关闭时清理预览
  useEffect(() => {
    if (!open) {
      releaseLogoPreview();
      return;
    }
    setVersionNo('');
    setDescription('');
    setContent('');
    setForceUpdate(false);
    setScopeId('');
    setPackageFile(null);
    setLogoFile(null);
    setErrors({ package: '', logo: '', version: '', content: '' });
    releaseLogoPreview();
    setBuildNo(generateBuildNo(existingRecords));
    setScopeOptions([
      { id: SCOPE_ALL_ID, label: '全员' },
      ...getUserGroups().map(group => ({ id: group.id, label: group.name })),
    ]);
    packageButtonRef.current?.focus();
    // existingRecords / platform 仅在打开瞬间读取，不作为重置触发条件
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 组件卸载时释放预览
  useEffect(() => () => { releaseLogoPreview(); }, []);

  // 最新关闭逻辑（供 document 级 Esc 监听使用，避免闭包过期）
  const handleCloseRef = useRef<() => void>(() => {});
  useEffect(() => {
    handleCloseRef.current = () => {
      releaseLogoPreview();
      onCancel();
    };
  });

  // Esc 关闭：监听 document，焦点不在弹框内（如上传控件获得焦点）时同样可关闭
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const setFieldError = (field: 'package' | 'logo' | 'version' | 'content', message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const handlePackageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const ext = getFileExtension(file.name);
    if (!ext || !config.extensions.includes(ext)) {
      setPackageFile(null);
      setFieldError('package', `不支持的文件类型，${config.extensionHint}`);
      return;
    }
    setPackageFile({ name: file.name, sizeLabel: formatFileSize(file.size), ext });
    setFieldError('package', '');
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const ext = getFileExtension(file.name);
    if (ext !== '.png' || (file.type && file.type !== 'image/png')) {
      setLogoFile(null);
      setFieldError('logo', 'Logo 仅支持 PNG 格式，且尺寸为 48 × 48 像素');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth === LOGO_REQUIRED_SIZE && image.naturalHeight === LOGO_REQUIRED_SIZE) {
        releaseLogoPreview();
        logoPreviewUrlRef.current = previewUrl;
        setLogoFile({ fileName: file.name, previewUrl });
        setFieldError('logo', '');
      } else {
        URL.revokeObjectURL(previewUrl);
        setLogoFile(null);
        setFieldError('logo', `Logo 尺寸必须为 48 × 48 像素，当前为 ${image.naturalWidth} × ${image.naturalHeight}`);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      setLogoFile(null);
      setFieldError('logo', 'Logo 文件无法读取，请上传 48 × 48 像素的 PNG 图片');
    };
    image.src = previewUrl;
  };

  const removeLogo = () => {
    releaseLogoPreview();
    setLogoFile(null);
    setFieldError('logo', '');
    logoButtonRef.current?.focus();
  };

  const removePackage = () => {
    setPackageFile(null);
    setFieldError('package', '');
    packageButtonRef.current?.focus();
  };

  const handleClose = () => {
    handleCloseRef.current();
  };

  const handleSubmit = () => {
    const nextErrors = { package: '', logo: '', version: '', content: '' };
    if (!packageFile) nextErrors.package = '请上传安装包';
    if (!logoFile) nextErrors.logo = '请上传 48 × 48 像素的 PNG Logo';
    const trimmedVersionNo = versionNo.trim();
    if (!trimmedVersionNo) {
      nextErrors.version = '请输入版本号';
    } else if (existingRecords.some(record => record.platform === platform && record.versionNo === trimmedVersionNo)) {
      nextErrors.version = '该版本号已存在';
    }
    const trimmedContent = content.trim();
    if (!trimmedContent) nextErrors.content = '请输入修复内容';
    setErrors(nextErrors);
    if (nextErrors.package || nextErrors.logo || nextErrors.version || nextErrors.content) {
      if (nextErrors.package) packageButtonRef.current?.focus();
      else if (nextErrors.logo) logoButtonRef.current?.focus();
      else if (nextErrors.version) versionInputRef.current?.focus();
      else contentInputRef.current?.focus();
      return;
    }
    const scope = scopeOptions.find(option => option.id === scopeId);
    onSubmit({
      platform,
      versionNo: trimmedVersionNo,
      buildNo,
      forceUpdate,
      scopeId: scope?.id || '',
      scopeLabel: scope?.label || '',
      description: description.trim(),
      content: trimmedContent,
      packageFileName: packageFile.name,
      packageSizeLabel: packageFile.sizeLabel,
      packageExt: packageFile.ext,
      logoFileName: logoFile.fileName,
    });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4"
      onMouseDown={(event) => { if (event.target === event.currentTarget) handleClose(); }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-create-dialog-title"
        className="flex max-h-[calc(100vh-64px)] w-full max-w-[800px] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 id="version-create-dialog-title" className="text-base font-bold text-gray-900">{config.title}</h3>
          <button
            type="button"
            aria-label="关闭"
            onClick={handleClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="divide-y divide-gray-200 overflow-hidden border border-gray-200">
            {/* 安装包 */}
            <div className="grid grid-cols-[128px_minmax(0,1fr)]">
              <span className="bg-gray-50 px-4 py-3 text-right text-gray-700"><span className="text-red-500">*</span> 安装包</span>
              <div className="space-y-1.5 p-3">
                <input
                  ref={packageInputRef}
                  type="file"
                  accept={config.accept}
                  aria-label={`选择${config.title}安装包文件`}
                  className="sr-only"
                  onChange={handlePackageChange}
                />
                {packageFile ? (
                  <div className="flex max-w-md items-center gap-3 rounded border border-gray-300 bg-gray-50 px-3 py-2">
                    <FileArchive size={16} className="shrink-0 text-[#337ab7]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-gray-800" title={packageFile.name}>{packageFile.name}</div>
                      <div className="text-xs text-gray-400">{packageFile.sizeLabel}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => packageInputRef.current?.click()}
                      className="shrink-0 text-sm text-[#337ab7] hover:text-[#215991] hover:underline"
                    >替换</button>
                    <button
                      type="button"
                      onClick={removePackage}
                      className="shrink-0 text-sm text-[#337ab7] hover:text-[#215991] hover:underline"
                    >移除</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    ref={packageButtonRef}
                    onClick={() => packageInputRef.current?.click()}
                    className="inline-flex h-9 items-center gap-1.5 rounded border border-gray-300 bg-white px-4 text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                  >
                    <Upload size={15} />
                    上传文件
                  </button>
                )}
                <p className="text-xs text-gray-400">{config.extensionHint}</p>
                {errors.package && <p role="alert" className="text-xs text-red-600">{errors.package}</p>}
              </div>
            </div>

            {/* Logo */}
            <div className="grid grid-cols-[128px_minmax(0,1fr)]">
              <span className="bg-gray-50 px-4 py-3 text-right text-gray-700"><span className="text-red-500">*</span> Logo</span>
              <div className="space-y-1.5 p-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,.png"
                  aria-label={`选择${config.title}Logo图片`}
                  className="sr-only"
                  onChange={handleLogoChange}
                />
                {logoFile ? (
                  <div className="flex items-center gap-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded border border-gray-200 bg-white">
                      <img src={logoFile.previewUrl} alt="Logo 预览" className="h-12 w-12" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm text-gray-800" title={logoFile.fileName}>{logoFile.fileName}</div>
                      <div className="mt-1.5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          className="text-sm text-[#337ab7] hover:text-[#215991] hover:underline"
                        >替换</button>
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="text-sm text-[#337ab7] hover:text-[#215991] hover:underline"
                        >移除</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    ref={logoButtonRef}
                    onClick={() => logoInputRef.current?.click()}
                    aria-label="上传 Logo 封面"
                    className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded border border-dashed border-gray-300 bg-gray-50 transition hover:border-[#337ab7] hover:bg-blue-50/30"
                  >
                    <Plus size={18} className="text-gray-400" />
                    <span className="text-xs text-gray-500">上传封面</span>
                  </button>
                )}
                <p className="text-xs text-gray-400">仅支持 PNG，尺寸为 48 × 48 像素</p>
                {errors.logo && <p role="alert" className="text-xs text-red-600">{errors.logo}</p>}
              </div>
            </div>

            {/* 版本号 */}
            <div className="grid grid-cols-[128px_minmax(0,1fr)]">
              <span className="bg-gray-50 px-4 py-3 text-right text-gray-700">版本号</span>
              <div className="space-y-1.5 p-3">
                <input
                  ref={versionInputRef}
                  value={versionNo}
                  onChange={(event) => { setVersionNo(event.target.value); setFieldError('version', ''); }}
                  placeholder="请输入版本号"
                  className="h-9 w-full max-w-md rounded border border-gray-300 px-3 outline-none transition focus:border-[#337ab7] focus:ring-2 focus:ring-[#337ab7]/10"
                />
                {errors.version && <p role="alert" className="text-xs text-red-600">{errors.version}</p>}
              </div>
            </div>

            {/* 构建号 */}
            <div className="grid grid-cols-[128px_minmax(0,1fr)]">
              <span className="bg-gray-50 px-4 py-3 text-right text-gray-700">构建号</span>
              <div className="p-3">
                <input
                  value={buildNo}
                  readOnly
                  title="构建号按日期和当日序号自动生成，不可编辑"
                  className="h-9 w-full max-w-md cursor-not-allowed rounded border border-gray-200 bg-gray-50 px-3 text-gray-500 outline-none"
                />
              </div>
            </div>

            {/* 强制更新 */}
            <div className="grid grid-cols-[128px_minmax(0,1fr)]">
              <span className="bg-gray-50 px-4 py-3 text-right text-gray-700"><span className="text-red-500">*</span> 强制更新</span>
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={forceUpdate}
                  aria-label="强制更新"
                  onClick={() => setForceUpdate(value => !value)}
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${forceUpdate ? 'bg-[#337ab7]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${forceUpdate ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
                <span className="text-gray-700">{forceUpdate ? '是' : '否'}</span>
                <span className="text-xs text-gray-400">启用后，旧版本用户必须完成升级</span>
              </div>
            </div>

            {/* 适用范围 */}
            <div className="grid grid-cols-[128px_minmax(0,1fr)]">
              <span className="bg-gray-50 px-4 py-3 text-right text-gray-700">适用范围</span>
              <div className="p-3">
                <select
                  value={scopeId}
                  onChange={(event) => setScopeId(event.target.value)}
                  className="h-9 w-full max-w-md rounded border border-gray-300 bg-white px-3 outline-none transition focus:border-[#337ab7] focus:ring-2 focus:ring-[#337ab7]/10"
                >
                  <option value="">请选择适用范围</option>
                  {scopeOptions.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 描述 */}
            <div className="grid grid-cols-[128px_minmax(0,1fr)]">
              <span className="bg-gray-50 px-4 py-3 text-right text-gray-700">描述</span>
              <div className="p-3">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="请输入描述"
                  className="h-20 w-full max-w-lg resize-y rounded border border-gray-300 px-3 py-2 outline-none transition focus:border-[#337ab7] focus:ring-2 focus:ring-[#337ab7]/10"
                />
              </div>
            </div>

            {/* 修复内容 */}
            <div className="grid grid-cols-[128px_minmax(0,1fr)]">
              <span className="bg-gray-50 px-4 py-3 text-right text-gray-700"><span className="text-red-500">*</span> 修复内容</span>
              <div className="space-y-1.5 p-3">
                <textarea
                  ref={contentInputRef}
                  value={content}
                  onChange={(event) => { setContent(event.target.value); setFieldError('content', ''); }}
                  placeholder="请输入修复内容"
                  className="h-24 w-full max-w-lg resize-y rounded border border-gray-300 px-3 py-2 outline-none transition focus:border-[#337ab7] focus:ring-2 focus:ring-[#337ab7]/10"
                />
                {errors.content && <p role="alert" className="text-xs text-red-600">{errors.content}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 rounded border border-gray-300 bg-white px-5 text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
          >取消</button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-9 rounded border border-[#337ab7] bg-[#337ab7] px-5 font-medium text-white transition hover:border-[#5695c4] hover:bg-[#5695c4] active:border-[#215991] active:bg-[#215991]"
          >确定</button>
        </div>
      </div>
    </div>
  );
}
