import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { WORKBENCH_APPS } from '@/data/app/workbench';

/** App 工作台（参照截图 IMG5：搜索+编辑 → 推荐应用 → 综合服务宫格） */
export default function AppWorkbench() {
  const [editing, setEditing] = useState(false);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState('');

  const q = query.trim();
  const apps = WORKBENCH_APPS.filter((a) => !hidden[a.id] && (q ? a.name.includes(q) : true));
  const recommend = apps.filter((a) => a.group === 'recommend');
  const service = apps.filter((a) => a.group === 'service');

  const toggle = (id: string) => setHidden((h) => ({ ...h, [id]: !h[id] }));

  return (
    <div className="flex h-full flex-col bg-[#f7f8fa]">
      {/* 顶部：搜索 + 编辑 */}
      <div className="shrink-0 border-b border-[#ebedf0] bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 flex-1 items-center gap-2 rounded-full bg-[#f2f3f5] px-3">
            <Search size={16} className="text-[#969799]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索"
              className="h-7 min-w-0 flex-1 bg-transparent text-[14px] text-[#323233] outline-none placeholder:text-[#c8c9cc]"
            />
          </div>
          <button
            onClick={() => setEditing((v) => !v)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] ${editing ? 'bg-[#f53a71] text-white' : 'bg-[#f2f3f5] text-[#646566]'}`}
          >
            {editing ? '完成' : '编辑'}
          </button>
        </div>
      </div>

      {/* 宫格区：白底通栏（贴截图：宫格直接铺在白色区域） */}
      <div className="flex-1 overflow-y-auto bg-white px-2 pb-4 pt-3">
        <AppGroup title="推荐应用" apps={recommend} editing={editing} onToggle={toggle} />
        <AppGroup title="综合服务" apps={service} editing={editing} onToggle={toggle} />
        {apps.length === 0 && <div className="py-16 text-center text-[13px] text-[#969799]">未找到相关应用</div>}
      </div>
    </div>
  );
}

function AppGroup({
  title,
  apps,
  editing,
  onToggle,
}: {
  title: string;
  apps: { id: string; name: string; emoji: string }[];
  editing: boolean;
  onToggle: (id: string) => void;
}) {
  if (apps.length === 0) return null;
  return (
    <div className="mb-4">
      <div className="px-2 pb-2 text-[14px] font-medium text-[#323233]">{title}</div>
      <div className="grid grid-cols-4 gap-y-4">
        {apps.map((a) => (
          <button
            key={a.id}
            onClick={() => editing && onToggle(a.id)}
            className="relative flex flex-col items-center gap-1.5"
          >
            <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-[#f2f3f5] text-[24px]">
              {a.emoji}
              {editing && (
                <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full border border-[#ebedf0] bg-white text-[#969799]">
                  <Check size={12} />
                </span>
              )}
            </span>
            <span className="max-w-full truncate px-0.5 text-[12px] text-[#323233]">{a.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
