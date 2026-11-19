import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FolderKanban,
  Megaphone,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type {
  BusinessMessageCardCategory,
  BusinessMessageCardData,
  BusinessMessageCardTone,
} from '../../types/businessMessageCard';

interface BusinessMessageCardProps {
  card: BusinessMessageCardData;
  compact?: boolean;
}

const categoryConfig: Record<BusinessMessageCardCategory, { label: string; icon: typeof Clock3; className: string }> = {
  attendance: { label: '考勤', icon: Clock3, className: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' },
  approval: { label: '流程', icon: ClipboardCheck, className: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300' },
  schedule: { label: '日程', icon: CalendarDays, className: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300' },
  project: { label: '项目', icon: FolderKanban, className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300' },
  knowledge: { label: '知识', icon: BookOpen, className: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/20 dark:text-cyan-300' },
  notice: { label: '通知', icon: Megaphone, className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  workbench: { label: '工作台', icon: ExternalLink, className: 'bg-theme-50 text-theme-600 dark:bg-theme-900/20 dark:text-theme-300' },
  meeting: { label: '会议', icon: Video, className: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300' },
};

const toneClasses: Record<BusinessMessageCardTone, string> = {
  brand: 'bg-theme-50 text-theme-700 dark:bg-theme-900/20 dark:text-theme-300',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300',
  danger: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300',
  neutral: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const toneTextClasses: Record<BusinessMessageCardTone, string> = {
  brand: 'text-theme-700 dark:text-theme-300',
  info: 'text-blue-700 dark:text-blue-300',
  success: 'text-emerald-700 dark:text-emerald-300',
  warning: 'text-amber-700 dark:text-amber-300',
  danger: 'text-red-700 dark:text-red-300',
  neutral: 'text-gray-600 dark:text-gray-300',
};

export default function BusinessMessageCard({ card, compact = false }: BusinessMessageCardProps) {
  const navigate = useNavigate();
  const config = categoryConfig[card.category];
  const CategoryIcon = config.icon;
  const defaultHref = card.href || card.actions.find((action) => action.variant === 'primary')?.href;

  const open = (href?: string) => {
    if (href) navigate(href);
  };

  return (
    <article
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 ${compact ? 'max-w-xl' : 'w-full max-w-2xl'}`}
      data-message-card-id={card.id}
    >
      <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.className}`}>
            <CategoryIcon size={18} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{card.source}</span>
              <span aria-hidden="true">·</span>
              <span>{config.label}</span>
            </div>
            <h3 className="mt-0.5 text-base font-semibold leading-6 text-gray-900 dark:text-white">{card.title}</h3>
            {card.subtitle && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{card.subtitle}</p>}
          </div>
        </div>
        {card.status && (
          <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${toneClasses[card.status.tone]}`}>
            {card.status.label}
          </span>
        )}
      </header>

      <button
        type="button"
        onClick={() => open(defaultHref)}
        disabled={!defaultHref}
        className="block w-full cursor-pointer px-4 py-3 text-left disabled:cursor-default"
        aria-label={defaultHref ? `打开${card.title}` : undefined}
      >
        {card.summary && <p className="text-sm leading-6 text-gray-600 dark:text-gray-300">{card.summary}</p>}

        {card.metrics && card.metrics.length > 0 && (
          <div className={`grid gap-2 ${compact && card.metrics.length >= 4 ? 'grid-cols-2' : card.metrics.length >= 4 ? 'grid-cols-4' : card.metrics.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} ${card.summary ? 'mt-3' : ''}`}>
            {card.metrics.map((metric) => (
              <div key={`${metric.label}-${metric.value}`} className="rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-900/40">
                <div className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</div>
                <div className={`mt-1 text-lg font-semibold ${metric.tone ? toneTextClasses[metric.tone] : 'text-gray-900 dark:text-white'}`}>
                  {metric.value}<span className="ml-0.5 text-xs font-normal">{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {card.fields && card.fields.length > 0 && (
          <dl className={`${card.summary || card.metrics?.length ? 'mt-3' : ''} grid grid-cols-2 gap-x-4 gap-y-2 text-sm`}>
            {card.fields.map((field) => (
              <div key={`${field.label}-${field.value}`} className="min-w-0">
                <dt className="text-xs text-gray-500 dark:text-gray-400">{field.label}</dt>
                <dd className={`mt-0.5 truncate ${field.emphasis ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{field.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </button>

      {card.items && card.items.length > 0 && (
        <div className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-700 dark:border-gray-700">
          {card.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => open(item.href || defaultHref)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-500 dark:hover:bg-gray-700/50"
            >
              <CheckCircle2 size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-gray-900 dark:text-white">{item.title}</span>
                {item.description && <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">{item.description}</span>}
              </span>
              {item.status && <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${toneClasses[item.status.tone]}`}>{item.status.label}</span>}
              <ChevronRight size={16} className="shrink-0 text-gray-400" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {(card.tags?.length || card.timestamp) && (
        <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
          {card.tags?.map((tag) => <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-700">{tag}</span>)}
          {card.timestamp && <span className="ml-auto">{card.timestamp}</span>}
        </div>
      )}

      {card.actions.length > 0 && (
        <footer className="flex flex-wrap items-center gap-2 border-t border-gray-100 px-4 py-3 dark:border-gray-700">
          {card.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => open(action.href)}
              className={action.variant === 'primary'
                ? 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-theme-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-theme-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-300'
                : action.variant === 'secondary'
                  ? 'inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  : 'inline-flex min-h-9 items-center justify-center gap-1.5 px-1 py-2 text-sm font-medium text-theme-600 hover:text-theme-700 focus-visible:outline-none focus-visible:underline dark:text-theme-300'}
            >
              {action.label}
              {(action.variant === 'primary' || action.variant === 'link') && <ExternalLink size={14} aria-hidden="true" />}
            </button>
          ))}
        </footer>
      )}
    </article>
  );
}
