import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  /** 总条数 */
  total: number;
  /** 当前页（1 起） */
  page: number;
  /** 每页条数 */
  pageSize: number;
  /** 翻页回调 */
  onChange: (page: number) => void;
  /** 附着的 className（默认右对齐行） */
  className?: string;
}

/** 生成分页页码序列：首末页必显，当前页邻域 ±1，其余折叠为省略号 */
function buildPageItems(current: number, totalPages: number): Array<number | 'ellipsis-l' | 'ellipsis-r'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const items: Array<number | 'ellipsis-l' | 'ellipsis-r'> = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(totalPages - 1, current + 1);
  if (left > 2) items.push('ellipsis-l');
  for (let page = left; page <= right; page += 1) items.push(page);
  if (right < totalPages - 1) items.push('ellipsis-r');
  items.push(totalPages);
  return items;
}

/**
 * 管理后台通用分页组件（样式统一：主题蓝 #2f75b5、共 N 条、上/下一页、页码省略折叠）。
 * 受控组件：分页状态由调用方持有，翻页仅回调不内置。
 */
export default function AdminPagination({ total, page, pageSize, onChange, className = '' }: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const safeOnChange = (next: number) => {
    if (next < 1 || next > totalPages || next === current) return;
    onChange(next);
  };
  if (total === 0) return null;

  return (
    <div className={`mt-3 flex items-center justify-end gap-2 text-sm text-gray-500 ${className}`}>
      <span>共 {total} 条</span>
      <button
        type="button"
        aria-label="上一页"
        disabled={current <= 1}
        onClick={() => safeOnChange(current - 1)}
        className="rounded border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-[#2f75b5] hover:text-[#2f75b5] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400"
      >
        <ChevronLeft size={16} />
      </button>
      {buildPageItems(current, totalPages).map(item =>
        item === 'ellipsis-l' || item === 'ellipsis-r' ? (
          <span key={item} className="px-1 text-gray-300">…</span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => safeOnChange(item)}
            className={`min-w-8 rounded border px-2.5 py-1.5 transition-colors ${
              item === current
                ? 'border-[#2f75b5] bg-[#2f75b5] font-semibold text-white'
                : 'border-gray-200 text-gray-600 hover:border-[#2f75b5] hover:text-[#2f75b5]'
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        type="button"
        aria-label="下一页"
        disabled={current >= totalPages}
        onClick={() => safeOnChange(current + 1)}
        className="rounded border border-gray-200 p-1.5 text-gray-400 transition-colors hover:border-[#2f75b5] hover:text-[#2f75b5] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-400"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
