interface RuyiConversationDialogsProps {
  renameOpen: boolean;
  renameTitle: string;
  onRenameTitleChange: (value: string) => void;
  onRenameConfirm: () => void;
  onRenameCancel: () => void;
  deleteOpen: boolean;
  deleteConversationTitle: string;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
}

export default function RuyiConversationDialogs({
  renameOpen,
  renameTitle,
  onRenameTitleChange,
  onRenameConfirm,
  onRenameCancel,
  deleteOpen,
  deleteConversationTitle,
  onDeleteConfirm,
  onDeleteCancel,
}: RuyiConversationDialogsProps) {
  return (
    <>
      {renameOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-800">
            <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white">重命名会话</h3>
            <input
              type="text"
              value={renameTitle}
              onChange={(e) => onRenameTitleChange(e.target.value)}
              placeholder="输入会话标题（1-40 字）"
              maxLength={40}
              className="mb-4 h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-theme-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onRenameCancel}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                type="button"
                onClick={onRenameConfirm}
                disabled={!renameTitle.trim() || renameTitle.trim().length > 40}
                className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/35 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-800">
            <h3 className="mb-2 text-base font-bold text-gray-900 dark:text-white">删除会话</h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              确定要删除「{deleteConversationTitle || "该会话"}」吗？删除后无法恢复。
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onDeleteCancel}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                取消
              </button>
              <button
                type="button"
                onClick={onDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
