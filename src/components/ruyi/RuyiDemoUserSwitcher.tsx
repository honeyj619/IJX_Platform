import { useRuyiStore } from "../../store/ruyiStore";
import { UserRound, Users } from "lucide-react";

/**
 * 演示用户切换器——仅在 ?demo=user-isolation 场景渲染。
 * 只切换 currentOwnerId 指针，不复制、不修改任何用户的数据。
 */
export default function RuyiDemoUserSwitcher() {
  const users = useRuyiStore((state) => state.users);
  const currentOwnerId = useRuyiStore((state) => state.currentOwnerId);
  const setCurrentOwner = useRuyiStore((state) => state.setCurrentOwner);

  const userList = Object.values(users);
  if (userList.length < 2) return null;

  const displayName = (ownerId: string) =>
    ownerId === "user-a" ? "用户A" : ownerId === "user-b" ? "用户B" : ownerId;

  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 dark:border-amber-900/30 dark:bg-amber-900/20">
      <Users size={14} className="shrink-0 text-amber-700 dark:text-amber-300" />
      <span className="shrink-0 text-xs font-medium text-amber-800 dark:text-amber-200">演示用户</span>
      <div className="ml-auto flex gap-1">
        {userList.map((user) => (
          <button
            key={user.ownerId}
            type="button"
            onClick={() => setCurrentOwner(user.ownerId)}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              currentOwnerId === user.ownerId
                ? "bg-amber-600 text-white"
                : "bg-white text-amber-700 hover:bg-amber-100 dark:bg-gray-800 dark:text-amber-300 dark:hover:bg-gray-700"
            }`}
          >
            {currentOwnerId === user.ownerId && <UserRound size={11} />}
            {displayName(user.ownerId)}
          </button>
        ))}
      </div>
    </div>
  );
}
