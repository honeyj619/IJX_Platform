import { useCallback, useEffect, useRef } from "react";
import { useRuyiStore } from "../store/ruyiStore";
import { getRuyiCapability } from "../data/ruyiCapabilities";
import { routeUserInput, generateLoadingMessage, createMessage } from "../services/ruyiMockRuntime";

export function useRuyiSend() {
  const sendUserMessage = useRuyiStore((state) => state.sendUserMessage);
  const appendAssistantMessage = useRuyiStore((state) => state.appendAssistantMessage);
  const updateMessage = useRuyiStore((state) => state.updateMessage);
  const getConversationById = useRuyiStore((state) => state.getConversationById);
  const getActiveTask = useRuyiStore((state) => state.getActiveTask);
  const startMeetingTask = useRuyiStore((state) => state.startMeetingTask);
  const updateMeetingTask = useRuyiStore((state) => state.updateMeetingTask);
  // P0：文本确认后的执行收尾定时器（组件卸载时统一清理，避免卸载后仍执行回调）
  const finalizeTimersRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    const timers = finalizeTimersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  const send = useCallback(
    (conversationId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      sendUserMessage(conversationId, trimmed);

      const conversation = getConversationById(conversationId);
      if (!conversation) return;

      const activeTask = getActiveTask(conversationId);
      const activeCapability = getRuyiCapability(conversation.activeCapabilityId ?? "");
      // V2：会话内全部可继续任务（多任务歧义判定）
      const pendingTasks = useRuyiStore.getState().getConversationPendingTasks(conversationId);

      const loadingMsg = generateLoadingMessage(conversationId);
      appendAssistantMessage(loadingMsg);

      window.setTimeout(() => {
        const result = routeUserInput(trimmed, {
          conversation,
          activeTask,
          activeCapability,
          currentDate: new Date(),
          pendingTasks,
        });

        const assistantMessages = result.messages.filter((msg) => msg.sender !== "user");

        if (assistantMessages.length > 0) {
          // V2：多任务候选挂到首条助手消息上（渲染歧义选择卡片）
          const first = { ...assistantMessages[0] };
          if (result.multiTaskCandidates) {
            first.multiTaskCandidates = result.multiTaskCandidates.map((t) => ({
              taskId: t.id,
              title: t.title ?? "未命名任务",
              status: t.status,
              updatedAt: t.updatedAt,
              nextAction: t.nextAction,
            }));
            first.selectionResolved = null;
          }
          updateMessage({ ...first, id: loadingMsg.id });
          assistantMessages.slice(1).forEach((msg) => appendAssistantMessage(msg));
        } else {
          updateMessage({ ...loadingMsg, kind: "text", content: "已收到您的消息。" });
        }

        if (result.taskUpdate) {
          if (activeTask) {
            updateMeetingTask(activeTask.id, result.taskUpdate);
          } else if (result.taskUpdate.type) {
            const task = startMeetingTask(conversationId, trimmed);
            if (task) {
              updateMeetingTask(task.id, result.taskUpdate);
            }
          }
        }

        // P0：文本确认进入 executing 后，安排完成/失败收尾（与按钮确认同口径）
        const latestTask = getActiveTask(conversationId);
        if (latestTask && result.taskUpdate?.status === "executing") {
          const taskId = latestTask.id;
          const timer = window.setTimeout(() => {
            finalizeTimersRef.current.delete(timer);
            const task = useRuyiStore.getState().getTaskById(taskId);
            if (!task || task.status !== "executing") return;
            if (task.failureReason) {
              useRuyiStore.getState().failTask(taskId, task.failureReason);
              useRuyiStore.getState().appendAssistantMessage(
                createMessage(conversationId, "assistant", "text", `会议创建失败：${task.failureReason}`, {
                  taskId,
                  actions: [{ type: "retry", label: "重试" }],
                }),
              );
              return;
            }
            const slots = task.slots;
            const summary = `会议创建成功：\n标题：${slots.title || "项目沟通会"}\n日期：${slots.dateText || ""}（${slots.resolvedDate || ""}）\n时间：${slots.startTime || ""} - ${slots.endTime || ""}\n参会人：${slots.attendeeNames?.join("、") || ""}\n地点：${slots.location || "线上会议"}`;
            useRuyiStore.getState().completeTask(taskId);
            useRuyiStore.getState().appendAssistantMessage(
              createMessage(conversationId, "assistant", "text", summary, { taskId }),
            );
          }, 1600);
          finalizeTimersRef.current.add(timer);
        }
      }, 600);
    },
    [
      sendUserMessage,
      appendAssistantMessage,
      updateMessage,
      getConversationById,
      getActiveTask,
      startMeetingTask,
      updateMeetingTask,
    ],
  );

  // 独立重新生成入口：不新增用户消息，保留旧回复，追加 loading + 新助手回复
  const regenerateAssistantResponse = useCallback(
    (conversationId: string, sourceUserMessage: string) => {
      const trimmed = sourceUserMessage.trim();
      if (!trimmed) return;
      const conversation = getConversationById(conversationId);
      if (!conversation) return;
      const activeCapability = getRuyiCapability(conversation.activeCapabilityId ?? "");
      const loadingMsg = generateLoadingMessage(conversationId);
      appendAssistantMessage(loadingMsg);
      window.setTimeout(() => {
        const result = routeUserInput(trimmed, {
          conversation,
          activeTask: null, // 重新生成走通用路由，不触发任务状态机
          activeCapability,
          currentDate: new Date(),
        });
        const assistantMessages = result.messages.filter((msg) => msg.sender !== "user");
        if (assistantMessages.length > 0) {
          updateMessage({ ...assistantMessages[0], id: loadingMsg.id });
          assistantMessages.slice(1).forEach((msg) => appendAssistantMessage(msg));
        } else {
          updateMessage({ ...loadingMsg, kind: "text", content: "已重新生成。" });
        }
      }, 600);
    },
    [appendAssistantMessage, getConversationById, updateMessage],
  );

  return { send, regenerateAssistantResponse };
}
