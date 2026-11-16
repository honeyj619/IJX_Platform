import type { RuyiCapability } from "../../../types/ruyi";
import { ruyiPluginCapabilityIds } from "../../../data/ruyiToolPanel";
import { FileText, PresentationIcon, Target, Languages } from "lucide-react";

/**
 * V3.1 插件入口行（输入框下方）：公文 / PPT / 参谋 / 翻译 四个胶囊按钮。
 * - 点击选中并展开配置面板；再次点击收起；切换插件直接切换面板
 * - 不创建会话、不跳工作台、不自动发送
 * - 与快捷能力（预设问题直发）是两套体系，禁止混用
 */

const pluginIcons: Record<string, React.ReactNode> = {
  document: <FileText size={14} />,
  presentation: <PresentationIcon size={14} />,
  advisor: <Target size={14} />,
  translation: <Languages size={14} />,
};

interface RuyiPluginBarProps {
  /** 全量能力表（用于取 name） */
  capabilities: RuyiCapability[];
  /** 当前选中插件 id（null = 未选） */
  activePluginId: RuyiCapability['id'] | null;
  onSelect: (capabilityId: RuyiCapability['id']) => void;
}

export default function RuyiPluginBar({ capabilities, activePluginId, onSelect }: RuyiPluginBarProps) {
  const plugins = ruyiPluginCapabilityIds
    .map((id) => capabilities.find((c) => c.id === id))
    .filter((c): c is RuyiCapability => !!c);

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      data-requirement-id="ruyi-plugin-bar"
      role="group"
      aria-label="创作插件"
    >
      {plugins.map((plugin) => {
        const active = activePluginId === plugin.id;
        return (
          <button
            key={plugin.id}
            type="button"
            onClick={() => onSelect(plugin.id)}
            aria-pressed={active}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "border-theme-600 bg-theme-600 text-white shadow-sm"
                : "border-gray-200 bg-white text-gray-600 hover:border-theme-200 hover:bg-theme-50 hover:text-theme-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-theme-800 dark:hover:bg-theme-900/30 dark:hover:text-theme-300"
            }`}
          >
            {pluginIcons[plugin.id]}
            {plugin.name}
          </button>
        );
      })}
    </div>
  );
}
