import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { RuyiCapability, RuyiMessage, RuyiMessageActionType, RuyiMessageFeedback } from "../types/ruyi";
import { canOpenRuyiResult } from "../utils/ruyiResultPresentation";
import { useRuyiStore, RUYI_MAIN_OWNER_ID } from "../store/ruyiStore";
import { ruyiCapabilities, getRuyiCapability } from "../data/ruyiCapabilities";
import { MAIN_USER_NAME } from "../data/people";
import { createMessage, buildConfirmationSummary, buildMissingPrompt } from "../services/ruyiMockRuntime";
import { useRuyiSend } from "../hooks/useRuyiSend";
import type { DocumentMode } from "../data/documentValidation";
import { documentValidationIssues } from "../data/documentValidation";
import {
  presentationTemplates,
  presentationSlides,
  presentationOutline,
  presentationModes,
  type PresentationModeId,
} from "../data/presentation";



import RuyiConversationSidebar from "../components/ruyi/RuyiConversationSidebar";
import RuyiAssistantHome from "../components/ruyi/RuyiAssistantHome";
import { FIXED_SYSTEM_CONVERSATION_ID } from "../data/ruyiDemoScenarios";
// P2：三大工作台懒加载，降低主包体积
const DocumentEditor = lazy(() => import("./DocumentEditor"));
const PresentationWorkbench = lazy(() => import("./PresentationWorkbench"));
const AdvisorWorkbench = lazy(() => import("./AdvisorWorkbench"));
// V2：任务中心 / 任务详情 / 成果中心（同样懒加载）
const RuyiTaskCenter = lazy(() => import("./RuyiTaskCenter"));
const RuyiTaskDetail = lazy(() => import("./RuyiTaskDetail"));
const RuyiResultCenter = lazy(() => import("./RuyiResultCenter"));
import RuyiConversationView from "../components/ruyi/RuyiConversationView";
import RuyiEmptyState from "../components/ruyi/RuyiEmptyState";
import type { TaskDetailAction } from "./RuyiTaskDetail";

const lengthOptions = ["300-500", "500-800", "600-1200", "1000-1500", "1500-2000"];

const suggestedPrompts = [
  "我还有什么流程没有处理？",
  "帮我生成本周工作汇报",
  "帮我预约项目会议室",
  "看看我的 OKR 当前进展",
];

const capabilitySamples: Record<RuyiCapability["id"], string> = {
  "work-query": "我还有哪些待办流程？",
  translation: "把“智能办公平台”翻译成英文",
  "it-service": "VPN 无法连接，帮我反馈一下",
  document: "帮我起草一份会议通知",
  presentation: "帮我做一份产品发布 PPT",
  advisor: "帮我生成本周项目周报",
};

function getSuggestedPrompts(activeCapabilityId: RuyiCapability["id"] | null): string[] {
  if (activeCapabilityId) {
    const sample = capabilitySamples[activeCapabilityId];
    return sample ? [sample] : [];
  }
  return suggestedPrompts;
}

export default function RuYiZone() {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useRuyiStore();
  const { send: sendToConversation, regenerateAssistantResponse: regenerateToConversation } = useRuyiSend();

  // P0：?demo= 场景加载——确定性 fixture，不写入默认 localStorage（store 层 demo 态跳过 persist）
  const demoScenarioId = useMemo(() => new URLSearchParams(location.search).get('demo'), [location.search]);
  /** demo 模式下内部导航必须透传 ?demo= 参数，否则 effect 会误判退出 demo 并写 localStorage */
  const navigateInZone = (to: string) => {
    navigate(demoScenarioId ? `${to}?demo=${demoScenarioId}` : to);
  };
  /** 工作台地址可能已带 query（?sourceConversationId=），demo 参数用 & 追加 */
  const withDemoParam = (to: string) =>
    demoScenarioId ? `${to}${to.includes('?') ? '&' : '?'}demo=${demoScenarioId}` : to;
  const demoAppliedRef = useRef<string | null>(null);
  const [demoNotFound, setDemoNotFound] = useState(false);
  useEffect(() => {
    if (!demoScenarioId) {
      // 离开 demo 地址：恢复进入前的正常 store
      setDemoNotFound(false);
      if (demoAppliedRef.current !== null) {
        demoAppliedRef.current = null;
        useRuyiStore.getState().exitDemoScenario();
      }
      return;
    }
    if (demoAppliedRef.current === demoScenarioId) return;
    demoAppliedRef.current = demoScenarioId;
    // 未知 demo：不动 store、不动 localStorage，仅提示
    const ok = useRuyiStore.getState().applyDemoScenario(demoScenarioId);
    setDemoNotFound(!ok);
  }, [demoScenarioId]);

  // P0：刷新恢复——持久化的 executing 任务转为可重试状态，避免永久显示"处理中"（demo 场景由 fixture 决定，无需恢复）
  useEffect(() => {
    if (!demoScenarioId) {
      useRuyiStore.getState().recoverInterruptedExecutions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pathname = location.pathname;
  const documentWorkspacePath = pathname.endsWith("/ruyi-zone/document");
  const presentationWorkspacePath = pathname.endsWith("/ruyi-zone/presentation");
  const advisorWorkspacePath = pathname.endsWith("/ruyi-zone/advisor");
  const conversationMatch = pathname.match(/\/ruyi-zone\/conversations\/([^/]+)/);
  const routeConversationId = conversationMatch?.[1];
  // V2 路由：AI 任务中心 / 任务详情 / 成果中心
  const taskCenterPath = /\/ruyi-zone\/tasks\/?$/.test(pathname);
  const taskDetailMatch = pathname.match(/\/ruyi-zone\/tasks\/([^/]+)/);
  const routeTaskId = taskDetailMatch?.[1];
  const resultCenterPath = /\/ruyi-zone\/results\/?$/.test(pathname);

  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [input, setInput] = useState("");
  const [activeCapabilityId, setActiveCapabilityId] = useState<RuyiCapability["id"] | null>(null);
  // V2：任务详情执行收尾定时器（卸载时统一清理）
  const taskFinalizeTimers = useRef<Set<number>>(new Set());
  useEffect(() => {
    const timers = taskFinalizeTimers.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  // 工作台状态（保留以维持 /document、/presentation、/advisor 可渲染）
  const [showEditor, setShowEditor] = useState(false);
  const [embedEditorInRuyiZone, setEmbedEditorInRuyiZone] = useState(false);
  const [editorSessionId, setEditorSessionId] = useState(0);
  const [docType, setDocType] = useState("通知");
  const [docTitle, setDocTitle] = useState("");
  const [docLength, setDocLength] = useState("600-1200");
  const [docContent, setDocContent] = useState("");
  const [docAttachments, setDocAttachments] = useState<string[]>([]);
  const [documentMode, setDocumentMode] = useState<DocumentMode>("writing");
  const [validationFileName, setValidationFileName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [validationReady, setValidationReady] = useState(false);
  const [legacyEditorStartsInRequirements, setLegacyEditorStartsInRequirements] = useState(false);
  const [legacyEditorStartsInOutline, setLegacyEditorStartsInOutline] = useState(false);

  const [pptMode] = useState<PresentationModeId>("ai");
  const [pptPageCount, setPptPageCount] = useState("6-10页");
  const [pptAudience, setPptAudience] = useState("大众");
  const [pptScene, setPptScene] = useState("通用");
  const [pptTone, setPptTone] = useState("专业");
  const [pptLanguage, setPptLanguage] = useState("中文");
  const [pptTextStyle, setPptTextStyle] = useState("简洁");
  const [pptAttachments, setPptAttachments] = useState<string[]>([]);
  const [pptTemplate, setPptTemplate] = useState(presentationTemplates[0]);
  const [presentationReady, setPresentationReady] = useState(false);
  const [presentationPrompt, setPresentationPrompt] = useState("");
  const [presentationTitle, setPresentationTitle] = useState("");
  const [presentationConfirmMessage, setPresentationConfirmMessage] = useState("");
  const [presentationAdjustments, setPresentationAdjustments] = useState<string[]>([]);
  const [showPresentationEditor, setShowPresentationEditor] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const ownerId = store.currentOwnerId ?? RUYI_MAIN_OWNER_ID;
  const conversations = store.getOwnerConversations(ownerId);
  const conversation = routeConversationId ? store.getConversationById(routeConversationId) : null;
  const messages = conversation ? store.getConversationMessages(conversation.id) : [];

  // V2：任务/成果关联摘要（侧栏角标 + 筛选）；搜索匹配含会话用户消息文本
  const ownerTasks = store.getOwnerTasks(ownerId);
  const ownerResults = store.getOwnerResults(ownerId);
  const taskSummary = useMemo(() => {
    const byConversation: Record<string, number> = {};
    let pendingCount = 0;
    for (const t of ownerTasks) {
      if (["collecting", "interrupted", "awaiting-confirmation", "failed"].includes(t.status)) {
        byConversation[t.conversationId] = (byConversation[t.conversationId] ?? 0) + 1;
        pendingCount += 1;
      }
    }
    return { pendingCount, byConversation };
  }, [ownerTasks]);
  const resultSummary = useMemo(() => {
    const byConversation: Record<string, number> = {};
    for (const r of ownerResults) {
      if (r.conversationId) byConversation[r.conversationId] = (byConversation[r.conversationId] ?? 0) + 1;
    }
    return { byConversation };
  }, [ownerResults]);
  // V2：会话搜索需匹配用户消息文本（关键词命中任意用户消息即算匹配）
  const searchMatchesFor = (keyword: string): Set<string> | null => {
    const kw = keyword.trim();
    if (!kw) return null;
    const state = useRuyiStore.getState();
    const matched = new Set<string>();
    for (const conv of conversations) {
      if (conv.title.includes(kw)) continue; // 标题已能匹配，跳过消息扫描
      const hit = state.getConversationMessages(conv.id).some((m) => m.sender === "user" && m.content.includes(kw));
      if (hit) matched.add(conv.id);
    }
    return matched;
  };

  const [sidebarSearch, setSidebarSearch] = useState("");
  const liveSearchMatches = useMemo(() => searchMatchesFor(sidebarSearch), [sidebarSearch, conversations, store.messages]);

  // 用户隔离演示：切换 owner 后，当前路由会话若不属于新 owner 则回如意空间主页
  useEffect(() => {
    if (!routeConversationId || !conversation) return;
    if (conversation.ownerId !== ownerId) {
      navigateInZone("/pc_client/ruyi-zone");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId, routeConversationId]);
  const activeCapability = conversation?.activeCapabilityId
    ? getRuyiCapability(conversation.activeCapabilityId) ?? null
    : null;

  const handleConversationSend = (conversationId: string, text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    sendToConversation(conversationId, content);
    setInput("");
  };

  const handleHomeSend = () => {
    const content = input.trim();
    if (!content) return;
    const conv = store.createConversation(ownerId);
    if (activeCapabilityId) {
      store.selectCapability(conv.id, activeCapabilityId);
    }
    sendToConversation(conv.id, content);
    setInput("");
    setActiveCapabilityId(null);
    navigateInZone(`/pc_client/ruyi-zone/conversations/${conv.id}`);
  };

  const handleNewConversation = () => {
    setInput("");
    setActiveCapabilityId(null);
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
    navigate("/pc_client/ruyi-zone");
  };

  const handleSelectConversation = (id: string) => {
    setInput("");
    navigateInZone(`/pc_client/ruyi-zone/conversations/${id}`);
    if (isMobile) setMobileMenuOpen(false);
  };

  const handleRenameConversation = (id: string, title: string) => {
    store.renameConversation(id, title);
  };

  const handleDeleteConversation = (id: string) => {
    store.deleteConversation(id);
    if (id === routeConversationId) {
      setInput("");
      navigate("/pc_client/ruyi-zone");
    }
  };

  const handleSelectCapability = (capabilityId: RuyiCapability["id"]) => {
    const capability = getRuyiCapability(capabilityId);
    if (!capability) return;

    // 创作型能力：跳转工作台并携带来源会话 ID（写入启动上下文，供工作台带入需求）
    if (capability.workbenchPath) {
      const sourceId = routeConversationId ?? store.createConversation(ownerId).id;
      store.saveWorkbenchLaunchContext(sourceId, capability.id as 'document' | 'presentation' | 'advisor');
      navigate(withDemoParam(`${capability.workbenchPath}?sourceConversationId=${sourceId}`));
      return;
    }

    // 在已有会话中切换能力：激活能力并预填示例
    if (routeConversationId) {
      store.selectCapability(routeConversationId, capabilityId);
      setInput(capabilitySamples[capabilityId] ?? "");
      return;
    }

    // 主页选择能力：创建新会话、激活能力、预填示例并跳转
    const conv = store.createConversation(ownerId);
    store.selectCapability(conv.id, capabilityId);
    setInput(capabilitySamples[capabilityId] ?? "");
    setActiveCapabilityId(null);
    navigateInZone(`/pc_client/ruyi-zone/conversations/${conv.id}`);
  };

  const handleExitCapability = () => {
    if (routeConversationId) {
      store.selectCapability(routeConversationId, null);
    }
  };

  const handleMessageAction = (type: RuyiMessageActionType, message: RuyiMessage, payload?: { reason?: RuyiMessageFeedback["reason"]; taskId?: string; resolvedDate?: string; dateText?: string; [key: string]: unknown }) => {
    switch (type) {
      case "select-task": {
        // V2 多任务选择：追加"继续：任务名"用户消息 → 恢复所选任务（选择消息置为已完成，避免重复选择）
        const selectedId = payload?.taskId;
        if (!selectedId) break;
        const store2 = useRuyiStore.getState();
        const task = store2.getTaskById(selectedId);
        // 标记选择消息已完成（保留历史）
        store2.updateMessage({ ...message, selectionResolved: selectedId });
        if (!task) break;
        // 追加新的用户消息
        store2.sendUserMessage(message.conversationId, `继续：${task.title ?? "任务"}`);
        store2.selectTaskToResume(message.conversationId, selectedId);
        // 恢复后的助手消息（缺参提示或确认卡）
        if (task.type === "create-meeting" && task.missingSlots.length === 0) {
          store2.updateMeetingTask(selectedId, { status: "awaiting-confirmation" });
          store2.appendAssistantMessage(
            createMessage(message.conversationId, "assistant", "confirmation", buildConfirmationSummary(task.slots), {
              taskId: selectedId,
              actions: [
                { type: "confirm-task", label: "确认创建" },
                { type: "modify-task", label: "修改" },
                { type: "cancel-task", label: "取消" },
              ],
            }),
          );
        } else {
          store2.resumeTask(selectedId);
          store2.appendAssistantMessage(
            createMessage(message.conversationId, "assistant", "text", `好的，继续「${task.title ?? "任务"}」。${task.nextAction ?? (task.missingSlots.length ? buildMissingPrompt(task.missingSlots) : "请补充剩余参数。")}`, {
              taskId: selectedId,
            }),
          );
        }
        break;
      }
      case "confirm-date": {
        // F1：跨日相对日期重确认——严格读取点击 action 的 payload，禁止扫描 actions 猜测
        const resolvedDate = typeof payload?.resolvedDate === "string" ? payload.resolvedDate : "";
        const dateText = typeof payload?.dateText === "string" ? payload.dateText : "";
        if (!message.taskId || !resolvedDate || !dateText) break;
        const store2 = useRuyiStore.getState();
        const task = store2.getTaskById(message.taskId);
        // 合法性校验：任务存在、属于当前会话、处于等待日期确认的合法状态
        if (!task || task.conversationId !== message.conversationId) break;
        if (!["interrupted", "awaiting-confirmation", "collecting"].includes(task.status)) break;
        // 防重复点击：原日期确认消息清除 actions（保留为只读历史）
        const msgInStore = store2.messages[message.id];
        if (!msgInStore || msgInStore.actions?.some((a) => a.type === "confirm-date")) {
          if (msgInStore) store2.updateMessage({ ...msgInStore, actions: [] });
        } else {
          break; // actions 已被清除 → 视为重复点击，不重复执行
        }
        // 追加用户消息（方案 2.5 第 2 步）
        store2.sendUserMessage(message.conversationId, `确认日期：${dateText}（${resolvedDate}）`);
        // 更新 slots + relativeDateConfirmedAt；保持 awaiting-confirmation，不直接执行
        store2.updateMeetingTask(task.id, {
          status: "awaiting-confirmation",
          slots: { ...task.slots, dateText, resolvedDate },
          relativeDateConfirmedAt: new Date().toISOString(),
        });
        store2.appendTaskEvent(task.id, { type: "parameter-updated", label: `重新确认相对日期「${dateText}」→ ${resolvedDate}`, status: "awaiting-confirmation" });
        const updated = useRuyiStore.getState().getTaskById(task.id);
        if (updated) {
          store2.appendAssistantMessage(
            createMessage(message.conversationId, "assistant", "confirmation", buildConfirmationSummary(updated.slots), {
              taskId: task.id,
              actions: [
                { type: "confirm-task", label: "确认创建" },
                { type: "modify-task", label: "修改" },
                { type: "cancel-task", label: "取消" },
              ],
            }),
          );
        }
        break;
      }
      case "open-task-center": {
        navigateInZone("/pc_client/ruyi-zone/tasks");
        break;
      }
      case "copy":
        void navigator.clipboard.writeText(message.content);
        break;
      case "open-result": {
        const result = message.resultId ? store.getResultById(message.resultId) : null;
        // F2 双重保护：仅可打开状态允许导航（共享安全函数，防直接调用绕过 UI）
        if (result && canOpenRuyiResult(result)) {
          navigate(withDemoParam(result.workbenchHref));
        }
        break;
      }
      case "open-workbench": {
        const capability = message.capabilityId ? getRuyiCapability(message.capabilityId) : null;
        if (capability?.workbenchPath) {
          // P0：从对话进入工作台必须携带来源会话，成果回流与返回依赖它；
          // 同时写入启动上下文（持久化），工作台自动带入标题与需求描述
          const sourceId = routeConversationId ?? FIXED_SYSTEM_CONVERSATION_ID;
          store.saveWorkbenchLaunchContext(sourceId, capability.id as 'document' | 'presentation' | 'advisor');
          navigate(withDemoParam(`${capability.workbenchPath}?sourceConversationId=${sourceId}`));
        }
        break;
      }
      case "confirm-task": {
        if (message.taskId) {
          store.confirmTask(message.taskId);
          store.appendAssistantMessage(
            createMessage(message.conversationId, "assistant", "text", "正在创建会议，请稍候…", {
              taskId: message.taskId,
            }),
          );
          // 批次5：模拟执行完成后回写成功消息并终结任务（日期敏感任务跨日恢复需重新确认相对日期）
          window.setTimeout(() => {
            const task = useRuyiStore.getState().getTaskById(message.taskId!);
            if (!task || task.status !== 'executing') return;
            const slots = task.slots;
            if (task.failureReason) {
              // 失败演示：终结任务为 failed，输出失败原因与重试入口
              useRuyiStore.getState().failTask(message.taskId!, task.failureReason);
              useRuyiStore.getState().appendAssistantMessage(
                createMessage(message.conversationId, "assistant", "text", `会议创建失败：${task.failureReason}`, {
                  taskId: message.taskId,
                  actions: [{ type: "retry", label: "重试" }],
                }),
              );
              return;
            }
            const summary = `会议创建成功：\n标题：${slots.title || '项目沟通会'}\n日期：${slots.dateText || ''}（${slots.resolvedDate || ''}）\n时间：${slots.startTime || ''} - ${slots.endTime || ''}\n参会人：${slots.attendeeNames?.join('、') || ''}\n地点：${slots.location || '线上会议'}`;
            useRuyiStore.getState().completeTask(message.taskId!);
            useRuyiStore.getState().appendAssistantMessage(
              createMessage(message.conversationId, "assistant", "text", summary, {
                taskId: message.taskId,
              }),
            );
          }, 1600);
        }
        break;
      }
      case "cancel-task": {
        if (message.taskId) {
          store.cancelTask(message.taskId);
          store.appendAssistantMessage(
            createMessage(message.conversationId, "system", "text", "会议创建已取消。", {
              taskId: message.taskId,
            }),
          );
        }
        break;
      }
      case "resume-task": {
        if (message.taskId) {
          const task = store.getTaskById(message.taskId);
          if (task && task.missingSlots.length === 0) {
            // 参数已完整：恢复为确认态并重新展示完整确认卡片
            store.updateMeetingTask(message.taskId, { status: "awaiting-confirmation" });
            store.appendAssistantMessage(
              createMessage(message.conversationId, "assistant", "confirmation", buildConfirmationSummary(task.slots), {
                taskId: message.taskId,
                actions: [
                  { type: "confirm-task", label: "确认创建" },
                  { type: "modify-task", label: "修改" },
                  { type: "cancel-task", label: "取消" },
                ],
              }),
            );
          } else {
            store.resumeTask(message.taskId);
            store.appendAssistantMessage(
              createMessage(message.conversationId, "assistant", "text", "好的，继续为您创建会议。" + (task ? buildMissingPrompt(task.missingSlots) : ""), {
                taskId: message.taskId,
              }),
            );
          }
        }
        break;
      }
      case "modify-task": {
        // P1：修改任务——回到补参态并提示当前可修改项
        if (message.taskId) {
          store.updateMeetingTask(message.taskId, { status: "collecting" });
          store.appendAssistantMessage(
            createMessage(message.conversationId, "assistant", "text", "好的，请直接输入要调整的内容（如时间、参会人），我会更新后再次向您确认。", {
              taskId: message.taskId,
            }),
          );
        }
        break;
      }
      case "retry": {
        // P1：重试——失败任务回到确认态重新执行
        if (message.taskId) {
          const task = store.getTaskById(message.taskId);
          if (task && task.status === "failed") {
            store.updateMeetingTask(message.taskId, { status: "awaiting-confirmation", failureReason: undefined });
            store.appendAssistantMessage(
              createMessage(message.conversationId, "assistant", "text", "正在重试创建会议，请稍候…", { taskId: message.taskId }),
            );
            window.setTimeout(() => {
              const current = useRuyiStore.getState().getTaskById(message.taskId!);
              if (!current || current.status !== "awaiting-confirmation") return;
              useRuyiStore.getState().confirmTask(message.taskId!);
              window.setTimeout(() => {
                const t = useRuyiStore.getState().getTaskById(message.taskId!);
                if (!t || t.status !== "executing") return;
                const slots = t.slots;
                const summary = `会议创建成功：\n标题：${slots.title || "项目沟通会"}\n日期：${slots.dateText || ""}（${slots.resolvedDate || ""}）\n时间：${slots.startTime || ""} - ${slots.endTime || ""}\n参会人：${slots.attendeeNames?.join("、") || ""}\n地点：${slots.location || "线上会议"}`;
                useRuyiStore.getState().completeTask(message.taskId!);
                useRuyiStore.getState().appendAssistantMessage(createMessage(message.conversationId, "assistant", "text", summary, { taskId: message.taskId }));
              }, 1600);
            }, 600);
          } else {
            store.appendAssistantMessage(
              createMessage(message.conversationId, "assistant", "text", "该任务当前无需重试。", { taskId: message.taskId }),
            );
          }
        }
        break;
      }
      case "feedback-useful": {
        // 反馈记录到消息本体（幂等：重复点击不重复生成回执）
        if (!message.feedback || message.feedback.rating !== 'useful') {
          store.updateMessage({ ...message, feedback: { rating: 'useful' } });
        }
        break;
      }
      case "feedback-useless": {
        // 没用：展开原因选择——点击带原因的操作时记录评分+原因
        const reason = payload?.reason as RuyiMessageFeedback['reason'] | undefined;
        if (reason) {
          if (message.feedback?.rating !== 'useless' || message.feedback.reason !== reason) {
            store.updateMessage({ ...message, feedback: { rating: 'useless', reason } });
          }
        } else if (!message.feedback || message.feedback.rating !== 'useless') {
          // 未选原因时先标记评分（原因待选）
          store.updateMessage({ ...message, feedback: { rating: 'useless' } });
        }
        break;
      }
      case "regenerate": {
        // 独立重新生成入口：不重复用户消息、不覆盖旧回复，追加新助手回复
        const original = store.getConversationMessages(message.conversationId)
          .filter((m) => m.sender === "user")
          .slice(-1)[0];
        if (original) {
          regenerateToConversation(message.conversationId, original.content);
        } else {
          store.appendAssistantMessage(
            createMessage(message.conversationId, "assistant", "text", "未找到可重新生成的原始请求。"),
          );
        }
        break;
      }
      default:
        break;
    }
  };

  const handleBackFromEditor = () => {
    // 批次4：带来源会话时返回来源会话（展示成果卡片），否则回主页
    const sourceId = new URLSearchParams(window.location.search).get('sourceConversationId');
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
    if (sourceId) {
      navigateInZone(`/pc_client/ruyi-zone/conversations/${sourceId}`);
      return;
    }
    navigate("/pc_client/ruyi-zone");
  };

  /** V2 任务详情操作矩阵：每次操作生成任务事件 + 对应新消息（对话存在的操作） */
  const handleTaskDetailAction = (action: TaskDetailAction, task: NonNullable<ReturnType<typeof store.getTaskById>>) => {
    const store2 = useRuyiStore.getState();
    const conversationExists = !!store2.conversations[task.conversationId];
    const appendMsg = (kind: RuyiMessage["kind"], content: string, options: Partial<RuyiMessage> = {}) => {
      if (!conversationExists) return;
      store2.appendAssistantMessage(createMessage(task.conversationId, "assistant", kind, content, { taskId: task.id, ...options }));
    };
    switch (action) {
      case "continue": {
        // 继续任务：恢复为原推进态（缺参→collecting；齐参→确认卡）
        if (task.missingSlots.length === 0 || (task.parameters ?? []).every((p) => !p.required || p.value)) {
          store2.updateMeetingTask(task.id, { status: "awaiting-confirmation" });
          store2.appendTaskEvent(task.id, { type: "resumed", label: `继续任务「${task.title ?? task.id}」`, status: "awaiting-confirmation" });
          appendMsg("confirmation", `请确认任务信息：\n${task.goal ?? task.title ?? ""}`, {
            actions: [
              { type: "confirm-task", label: "确认执行" },
              { type: "modify-task", label: "修改" },
              { type: "cancel-task", label: "取消" },
            ],
          });
        } else {
          store2.resumeTask(task.id);
          store2.appendTaskEvent(task.id, { type: "resumed", label: `继续任务「${task.title ?? task.id}」`, status: "collecting" });
          appendMsg("text", `好的，继续「${task.title ?? "任务"}」。${task.nextAction ?? "请补充剩余参数。"}`);
        }
        if (conversationExists) navigateInZone(`/pc_client/ruyi-zone/conversations/${task.conversationId}`);
        break;
      }
      case "confirm": {
        store2.confirmTask(task.id);
        store2.appendTaskEvent(task.id, { type: "confirmed", label: "确认执行", status: "executing" });
        store2.appendTaskEvent(task.id, { type: "executing", label: "开始执行", status: "executing" });
        appendMsg("text", `正在执行「${task.title ?? "任务"}」，请稍候…`);
        scheduleTaskFinalize(task.id, task.conversationId);
        break;
      }
      case "modify":
      case "retry-modified": {
        store2.updateMeetingTask(task.id, { status: "collecting" });
        store2.appendTaskEvent(task.id, { type: "parameter-updated", label: "进入参数修改", status: "collecting" });
        appendMsg("text", "好的，请直接输入要调整的参数，我会更新后再次向您确认。");
        if (conversationExists) navigateInZone(`/pc_client/ruyi-zone/conversations/${task.conversationId}`);
        break;
      }
      case "cancel": {
        store2.cancelTask(task.id);
        store2.appendTaskEvent(task.id, { type: "cancelled", label: "取消任务", status: "cancelled" });
        appendMsg("text", `任务「${task.title ?? ""}」已取消。`);
        break;
      }
      case "retry": {
        const ok = store2.retryTask(task.id); // 仅 failed 可进入执行
        if (ok) {
          store2.appendTaskEvent(task.id, { type: "executing", label: "重试执行中", status: "executing" });
          appendMsg("text", `正在重试「${task.title ?? "任务"}」，请稍候…`);
          scheduleTaskFinalize(task.id, task.conversationId);
        }
        break;
      }
      case "reopen": {
        // 再次处理：创建新任务（原任务保持 completed）
        const newTask = store2.createFollowUpTask(task.id);
        if (newTask && conversationExists) {
          appendMsg("text", `已基于「${task.title ?? "原任务"}」创建新任务，可继续补充参数。`);
          navigateInZone(`/pc_client/ruyi-zone/tasks/${newTask.id}`);
        }
        break;
      }
      case "remove-context": {
        const reference = task.contextReferenceId ? store2.getContextReferenceById(task.contextReferenceId) : null;
        store2.removeContext(task.conversationId);
        if (reference && conversationExists) {
          store2.appendAssistantMessage(
            createMessage(task.conversationId, "system", "system", `已取消引用业务对象「${reference.title}」。再次使用需重新关联。`),
          );
        }
        break;
      }
    }
  };

  /** V2：任务执行收尾定时器（统一走可清理机制；取消/刷新后不再写入完成态） */
  const scheduleTaskFinalize = (taskId: string, conversationId: string) => {
    const timer = window.setTimeout(() => {
      taskFinalizeTimers.current.delete(timer);
      const store2 = useRuyiStore.getState();
      const task = store2.getTaskById(taskId);
      if (!task || task.status !== "executing") return; // 已取消/中断：不写入
      // 确定性结果：demo 场景 fixture 指定 failureReason 则失败，否则成功
      if (task.failureReason) {
        store2.failTask(taskId, task.failureReason);
        store2.appendTaskEvent(taskId, { type: "failed", label: `执行失败：${task.failureReason}`, status: "failed" });
        store2.appendAssistantMessage(
          createMessage(conversationId, "assistant", "error", `任务「${task.title ?? ""}」执行失败：${task.failureReason}`, {
            taskId,
            actions: [{ type: "retry", label: "重试" }, { type: "cancel-task", label: "取消任务" }],
          }),
        );
        return;
      }
      store2.completeTask(taskId);
      store2.appendTaskEvent(taskId, { type: "completed", label: "任务已完成", status: "completed" });
      store2.appendAssistantMessage(
        createMessage(conversationId, "assistant", "text", `任务「${task.title ?? ""}」已完成。`, { taskId }),
      );
    }, 1600);
    taskFinalizeTimers.current.add(timer);
  };

  const renderWorkbench = () => {
    const wb = renderWorkbenchInner();
    return wb ? <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-gray-400">工作台加载中…</div>}>{wb}</Suspense> : null;
  };

  const renderWorkbenchInner = () => {
    if (advisorWorkspacePath) {
      return <AdvisorWorkbench onBack={handleBackFromEditor} />;
    }
    if (taskCenterPath) {
      return <RuyiTaskCenter demoId={demoScenarioId} />;
    }
    if (routeTaskId) {
      return <RuyiTaskDetail taskId={routeTaskId} demoId={demoScenarioId} onTaskAction={handleTaskDetailAction} />;
    }
    if (resultCenterPath) {
      return <RuyiResultCenter demoId={demoScenarioId} />;
    }
    if (presentationWorkspacePath || showPresentationEditor) {
      return (
        <PresentationWorkbench
          initialState={{
            mode: pptMode,
            title: presentationTitle,
            prompt: presentationPrompt,
            pageCount: pptPageCount,
            audience: pptAudience,
            scene: pptScene,
            tone: pptTone,
            language: pptLanguage,
            textStyle: pptTextStyle,
            template: pptTemplate,
            attachments: pptAttachments,
            autoGenerate: showPresentationEditor,
          }}
          onBack={handleBackFromEditor}
        />
      );
    }
    if ((showEditor && embedEditorInRuyiZone) || documentWorkspacePath) {
      return (
        <DocumentEditor
          key={`ruyi-editor-${editorSessionId}`}
          docType={docType}
          docTitle={docTitle}
          docLength={docLength}
          docContent={docContent}
          attachments={docAttachments}
          documentMode={documentMode}
          validationFileName={validationFileName || docAttachments[0]}
          validationIssues={documentValidationIssues}
          startInRequirements={legacyEditorStartsInRequirements}
          startInOutline={legacyEditorStartsInOutline}
          embedded
          onBack={handleBackFromEditor}
        />
      );
    }
    return null;
  };

  const workbench = renderWorkbench();

  // 未知 demo 场景：不进入正常渲染，提示并给返回入口
  if (demoNotFound) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-900">演示场景不存在</p>
          <p className="mt-2 text-sm text-gray-500">未找到场景 <span className="font-mono">{demoScenarioId}</span>，当前数据未做任何修改。</p>
          <button
            type="button"
            onClick={() => navigate('/pc_client/ruyi-zone')}
            className="mt-5 inline-flex h-9 items-center justify-center rounded-lg bg-theme-600 px-5 text-sm font-medium text-white hover:bg-theme-700"
          >
            返回普通如意空间
          </button>
        </div>
      </div>
    );
  }

  if (showEditor && !embedEditorInRuyiZone) {
    return (
      <DocumentEditor
        key={`editor-${editorSessionId}`}
        docType={docType}
        docTitle={docTitle}
        docLength={docLength}
        docContent={docContent}
        attachments={docAttachments}
        documentMode={documentMode}
        validationFileName={validationFileName || docAttachments[0]}
        validationIssues={documentValidationIssues}
        startInOutline={legacyEditorStartsInOutline}
        onBack={handleBackFromEditor}
      />
    );
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-gray-50 via-white to-theme-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {isMobile && (
        <button
          className="fixed top-6 right-6 z-50 rounded-full bg-white p-2 shadow-lg dark:bg-gray-800"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <span>✕</span> : <span>☰</span>}
        </button>
      )}

      <div className="flex min-h-0 flex-1">
        <RuyiConversationSidebar
          showDemoUserSwitcher={demoScenarioId === 'user-isolation'}
          ownerId={ownerId}
          conversations={conversations}
          capabilities={ruyiCapabilities}
          activeConversationId={routeConversationId ?? null}
          activeCapabilityId={conversation?.activeCapabilityId ?? activeCapabilityId}
          taskSummary={taskSummary}
          resultSummary={resultSummary}
          activeNav={taskCenterPath || routeTaskId ? "tasks" : resultCenterPath ? "results" : null}
          onOpenTasks={() => navigateInZone("/pc_client/ruyi-zone/tasks")}
          onOpenResults={() => navigateInZone("/pc_client/ruyi-zone/results")}
          searchMatches={liveSearchMatches}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onSelectCapability={handleSelectCapability}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
        />

        <div className="flex flex-1 flex-col h-full overflow-hidden">
          {workbench ? (
            workbench
          ) : routeConversationId ? (
            conversation ? (
              <RuyiConversationView
                conversation={conversation}
                messages={messages}
                activeCapability={activeCapability}
                onExitCapability={handleExitCapability}
                input={input}
                onInputChange={setInput}
                onSend={() => conversation && handleConversationSend(conversation.id)}
                onAction={handleMessageAction}
              />
            ) : (
              <RuyiEmptyState variant="not-found" />
            )
          ) : (
            <RuyiAssistantHome
              ownerName={MAIN_USER_NAME}
              capabilities={ruyiCapabilities}
              activeCapabilityId={activeCapabilityId}
              suggestedPrompts={suggestedPrompts}
              input={input}
              onInputChange={setInput}
              onSend={handleHomeSend}
              onSelectCapability={handleSelectCapability}
            />
          )}
        </div>
      </div>
    </div>
  );
}
