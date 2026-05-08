import { ChevronLeft } from 'lucide-react';

interface MessageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  extraContent?: React.ReactNode;
}

export function MessageHeader({ title, showBackButton = false, onBack, extraContent }: MessageHeaderProps) {
  if (showBackButton) {
    return (
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2 shrink-0">
        <button 
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex-shrink-0"
          onClick={onBack}
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-gray-900 dark:text-white truncate flex-1 min-w-0">{title}</h3>
        {extraContent}
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-white shrink-0 overflow-hidden">
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate flex-shrink-0 min-w-0">{title}</h2>
        {extraContent}
      </div>
    </div>
  );
}
