/**
 * 通讯录 → 消息页共享桥接（2026-11-17 PC Client 通讯录）。
 * 统一 PC Web 与 PC Client 的“联系人发消息”入口，避免各页面自造 localStorage key。
 * 消费端：src/pages/Home.tsx（读取 ijx-pcweb-message-target，创建或复用单聊并自动选中）。
 */

const MESSAGE_TARGET_KEY = 'ijx-pcweb-message-target';
/** 有效期：5 分钟（与 Home.tsx 消费端一致） */
const MESSAGE_TARGET_TTL_MS = 5 * 60 * 1000;

export type MessageTargetPayload = {
  name: string;
  createdAt: number;
};

/** 写入联系人消息目标并跳转消息页（navigate 由调用方传入，保持 Router 上下文一致） */
export function openChatWithContact(name: string, navigate: (path: string) => void) {
  const payload: MessageTargetPayload = { name, createdAt: Date.now() };
  try {
    window.localStorage.setItem(MESSAGE_TARGET_KEY, JSON.stringify(payload));
  } catch {
    // 持久化失败时仍尝试导航：Home 页无 payload 则不创建会话，不崩溃
  }
  navigate('/pc_client');
}

/** 读取并清除消息目标（供 Home 消费端使用；过期返回 null） */
export function consumeMessageTarget(): MessageTargetPayload | null {
  try {
    const raw = window.localStorage.getItem(MESSAGE_TARGET_KEY);
    if (!raw) return null;
    window.localStorage.removeItem(MESSAGE_TARGET_KEY);
    const payload = JSON.parse(raw) as MessageTargetPayload;
    if (!payload.name || Date.now() - payload.createdAt > MESSAGE_TARGET_TTL_MS) return null;
    return payload;
  } catch {
    return null;
  }
}
