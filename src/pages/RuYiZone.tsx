import { useState, useEffect, useMemo, useRef, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { RuyiCapability, RuyiMessage, RuyiMessageActionType, RuyiMessageFeedback, RuyiCapabilitySubmission, RuyiGenerationSnapshot } from "../types/ruyi";
import { canOpenRuyiResult } from "../utils/ruyiResultPresentation";
import { useRuyiStore, RUYI_MAIN_OWNER_ID } from "../store/ruyiStore";
import {
  getRuyiCapability,
  ruyiBuiltinCapabilities,
  ruyiAgents,
  getRuyiAgentByCapabilityId,
} from "../data/ruyiCapabilities";
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
import { DEFAULT_RUYI_SHOWCASE_CONVERSATION_ID } from "../data/ruyiShowcaseConversations";
import {
  createInitialPanelDrafts,
  type RuyiPanelDrafts,
} from "../components/ruyi/capability/RuyiCapabilityPanel";
import { FIXED_SYSTEM_CONVERSATION_ID, ruyiDemoScenarioDefinitions, type RuyiDemoScenarioId } from "../data/ruyiDemoScenarios";
// P2：三大工作台懒加载，降低主包体积
const DocumentEditor = lazy(() => import("./DocumentEditor"));
const PresentationWorkbench = lazy(() => import("./PresentationWorkbench"));
const AdvisorWorkbench = lazy(() => import("./AdvisorWorkbench"));
// V4：成果中心（懒加载）；AI 任务中心已下线
const RuyiResultCenter = lazy(() => import("./RuyiResultCenter"));
import RuyiConversationView from "../components/ruyi/RuyiConversationView";
import RuyiEmptyState from "../components/ruyi/RuyiEmptyState";
import RuyiResultPreviewModal from "../components/ruyi/RuyiResultPreviewModal";
import { downloadRuyiResult } from "../utils/ruyiResultDownload";

const lengthOptions = ["300-500", "500-800", "600-1200", "1000-1500", "1500-2000"];

const capabilitySamples: Record<RuyiCapability["id"], string> = {
  "work-query": "我还有哪些待办流程？",
  translation: "把“智能办公平台”翻译成英文",
  "it-service": "VPN 无法连接，帮我反馈一下",
  document: "帮我起草一份会议通知",
  presentation: "帮我做一份产品发布 PPT",
  advisor: "帮我生成本周项目周报",
  iknow: "差旅报销标准是什么？",
  "hr-xiaofu": "我今年还有几天年假？",
};

export default function RuYiZone() {
  const location = useLocation();
  const navigate = useNavigate();
  const store = useRuyiStore();
  const { send: sendToConversation, regenerateAssistantResponse: regenerateToConversation } = useRuyiSend();

  // P0/V3.3：?demo= 场景加载——快照优先（恢复上次操作后记录），无快照用 builder；独立命名空间不污染普通数据
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
    // 未知 demo：不动 store、不动 localStorage，仅提示（fixture 仅用于边界验收，不做场景留存）
    const ok = useRuyiStore.getState().applyDemoScenario(demoScenarioId);
    setDemoNotFound(!ok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoScenarioId]);

  // demo 场景加载后自动打开入口会话（仅首次进入且当前不在具体路由时）
  const scenarioEntryAppliedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!demoScenarioId || demoNotFound) return;
    if (routeConversationId || resultCenterPath) return;
    if (scenarioEntryAppliedRef.current === demoScenarioId) return;
    const definition = ruyiDemoScenarioDefinitions[demoScenarioId as RuyiDemoScenarioId];
    const liveConversations = useRuyiStore.getState().conversations;
    if (definition?.entryConversationId && liveConversations[definition.entryConversationId]) {
      scenarioEntryAppliedRef.current = demoScenarioId;
      navigateInZone(`/pc_client/ruyi-zone/conversations/${definition.entryConversationId}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoScenarioId, demoNotFound, store.demoScenarioId]);

  // P0：刷新恢复——持久化的 executing 任务转为可重试状态，避免永久显示"处理中"（demo 场景由 fixture 决定，无需恢复）
  useEffect(() => {
    if (!demoScenarioId) {
      useRuyiStore.getState().recoverInterruptedExecutions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // V3.1/P2：消息页"前往如意空间继续创作"跳转——?capabilityId=&prompt=&conversationId=
  // 打开如意空间时定位到同一会话（或固定系统会话）、自动选中对应插件、把已有需求带入输入框草稿（用户确认后再提交）
  const initialHandoffRef = useRef<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const capabilityId = params.get('capabilityId');
    const prompt = params.get('prompt') ?? '';
    const conversationId = params.get('conversationId') ?? '';
    const handoffKey = `${conversationId}:${capabilityId}:${prompt}`;
    if (!capabilityId || initialHandoffRef.current === handoffKey) return;
    initialHandoffRef.current = handoffKey;
    if (!['document', 'presentation', 'advisor', 'translation'].includes(capabilityId)) return;
    // 定位：消息页固定会话存在则进入该会话；否则留在首页
    if (conversationId && store.conversations[conversationId]) {
      navigateInZone(`/pc_client/ruyi-zone/conversations/${conversationId}`);
      store.selectCapability(conversationId, capabilityId as RuyiCapability['id']);
    } else {
      setActiveCapabilityId(capabilityId as RuyiCapability['id']);
    }
    // 已有对话需求带入输入框草稿（不自动提交）
    if (prompt) setInput(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const pathname = location.pathname;
  const documentWorkspacePath = pathname.endsWith("/ruyi-zone/document");
  const presentationWorkspacePath = pathname.endsWith("/ruyi-zone/presentation");
  const advisorWorkspacePath = pathname.endsWith("/ruyi-zone/advisor");
  const conversationMatch = pathname.match(/\/ruyi-zone\/conversations\/([^/]+)/);
  const routeConversationId = conversationMatch?.[1];
  // V4 路由：成果中心；AI 任务中心已下线
  const resultCenterPath = /\/ruyi-zone\/results\/?$/.test(pathname);
  // V5 草稿会话：新对话/切换智能体进入草稿窗口，首条真实消息才落库进历史
  const isDraftPath = /\/ruyi-zone\/draft\/?$/.test(pathname);
  // V3.4：/ruyi-zone 根路径默认打开最近预置会话（无 history 参数；预置被删则最近会话；全无则新建空白）
  const defaultOpenAppliedRef = useRef(false);
  useEffect(() => {
    if (demoScenarioId || defaultOpenAppliedRef.current) return;
    if (routeConversationId || resultCenterPath || isDraftPath) { defaultOpenAppliedRef.current = true; return; }
    if (documentWorkspacePath || presentationWorkspacePath || advisorWorkspacePath) return;
    defaultOpenAppliedRef.current = true;
    const state = useRuyiStore.getState();
    if (state.conversations[DEFAULT_RUYI_SHOWCASE_CONVERSATION_ID]) {
      navigate(`/pc_client/ruyi-zone/conversations/${DEFAULT_RUYI_SHOWCASE_CONVERSATION_ID}`);
      return;
    }
    const owner = state.users[ownerId];
    const fallback = owner?.conversationIds
      .map((id) => state.conversations[id])
      .filter((c): c is NonNullable<typeof c> => !!c && c.id !== FIXED_SYSTEM_CONVERSATION_ID)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
    if (fallback) {
      navigate(`/pc_client/ruyi-zone/conversations/${fallback.id}`);
    } else {
      const conv = state.createConversation(ownerId);
      navigate(`/pc_client/ruyi-zone/conversations/${conv.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeConversationId, resultCenterPath, demoScenarioId]);

  const [showSidebar, setShowSidebar] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [input, setInput] = useState("");
  const [activeCapabilityId, setActiveCapabilityId] = useState<RuyiCapability["id"] | null>(null);
  // V3：统一能力面板草稿（按能力分槽，切换能力保留各自草稿）
  const [panelDrafts, setPanelDrafts] = useState<RuyiPanelDrafts>(createInitialPanelDrafts);
  const [capabilitySubmitting, setCapabilitySubmitting] = useState(false);
  const handlePanelDraftChange = (patch: Partial<RuyiPanelDrafts>) =>
    setPanelDrafts((prev) => ({ ...prev, ...patch }));
  // V5：工具锁定会话的"重新生成"展开态（临时展开对应工具输入 UI，预填快照参数）
  const [regenerateToolOpen, setRegenerateToolOpen] = useState(false);
  // V4：成果预览弹框（会话内成果卡）
  const [previewResultId, setPreviewResultId] = useState<string | null>(null);

  // V5：草稿窗口预选智能体（?agent=）——进入草稿或切换参数时同步本地选择态
  const draftAgentAppliedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isDraftPath) {
      draftAgentAppliedRef.current = null;
      return;
    }
    const agentParam = new URLSearchParams(location.search).get('agent');
    const key = agentParam ?? '';
    if (draftAgentAppliedRef.current === key) return;
    draftAgentAppliedRef.current = key;
    setActiveCapabilityId((agentParam as RuyiCapability['id']) ?? null);
    setRegenerateToolOpen(false);
  }, [isDraftPath, location.search]);

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

  // V4：成果关联摘要（侧栏角标 + 筛选）；搜索匹配含会话用户消息文本
  const ownerResults = store.getOwnerResults(ownerId);
  const resultSummary = useMemo(() => {
    const byConversation: Record<string, number> = {};
    for (const r of ownerResults) {
      if (r.status === "completed" && r.conversationId) byConversation[r.conversationId] = (byConversation[r.conversationId] ?? 0) + 1;
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

  // 智能体调用：首页取本地选择态，会话页取会话已持久化的能力
  const homeAgent = getRuyiAgentByCapabilityId(activeCapabilityId);
  const conversationAgent = getRuyiAgentByCapabilityId(
    conversation?.activeCapabilityId ?? activeCapabilityId,
  );

  const handleConversationSend = (conversationId: string, text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    sendToConversation(conversationId, content);
    setInput("");
  };

  /** V3/V3.6.1：统一能力提交——创作类插件提交直达工作台；其余写入会话 */
  const handleSubmitCapability = (submission: RuyiCapabilitySubmission, targetConversationId?: string) => {
    const capability = getRuyiCapability(submission.capabilityId);
    if (!capability) return;
    setCapabilitySubmitting(true);
    try {
      const isCreative = capability.mode === "creative" && capability.workbenchPath;
      if (targetConversationId) {
        // 会话内提交
        store.submitCapability(targetConversationId, submission);
        setInput("");
        if (isCreative) {
          // V3.6.1：插件提交直达工作台（参数已预写上下文）——退出面板并导航
          store.selectCapability(targetConversationId, null);
          navigateInZone(withDemoParam(`${capability.workbenchPath}?sourceConversationId=${targetConversationId}`));
        }
      } else {
        // 首页提交：创建新会话 → 一次完整能力提交写入
        const conv = store.createConversation(ownerId);
        store.submitCapability(conv.id, submission);
        setInput("");
        setActiveCapabilityId(null);
        if (isCreative) {
          // V3.6.1：直达工作台
          navigateInZone(withDemoParam(`${capability.workbenchPath}?sourceConversationId=${conv.id}`));
          return;
        }
        navigateInZone(`/pc_client/ruyi-zone/conversations/${conv.id}`);
      }
    } finally {
      setCapabilitySubmitting(false);
    }
  };

  const handleHomeSend = () => {
    const content = input.trim();
    if (!content) return;
    // 首页普通问答：保持原有发送方式（未激活能力时）
    const conv = store.createConversation(ownerId);
    if (activeCapabilityId) {
      store.selectCapability(conv.id, activeCapabilityId);
    }
    sendToConversation(conv.id, content);
    setInput("");
    setActiveCapabilityId(null);
    navigateInZone(`/pc_client/ruyi-zone/conversations/${conv.id}`);
  };

  // V5：新对话 = 进入草稿聊天窗口（不落库）；发出首条真实消息后才创建会话并记入历史列表
  const handleNewConversation = () => {
    setInput("");
    setActiveCapabilityId(null);
    setShowEditor(false);
    setEmbedEditorInRuyiZone(false);
    setShowPresentationEditor(false);
    setRegenerateToolOpen(false);
    navigateInZone("/pc_client/ruyi-zone/draft");
  };

  const handleSelectConversation = (id: string) => {
    setInput("");
    setRegenerateToolOpen(false);
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

    // V3.1：非插件能力（查询/IT）不再展开配置面板——转为快捷问题直发
    if (!['document', 'presentation', 'advisor', 'translation'].includes(capabilityId)) {
      const quick = capabilitySamples[capabilityId];
      if (quick) {
        if (routeConversationId && conversation) {
          store.selectCapability(routeConversationId, null);
          sendToConversation(routeConversationId, quick);
          setInput("");
          return;
        }
        handleQuickPromptSend(quick);
      }
      return;
    }

    // V3.1：插件（公文/PPT/参谋/翻译）——再次点击当前插件 = 收起面板，保留已输入文字，不创建空会话
    if (routeConversationId) {
      const current = conversation?.activeCapabilityId ?? null;
      if (current === capabilityId) {
        store.selectCapability(routeConversationId, null);
        return;
      }
      // 会话内选择插件：激活并展开面板（不跳工作台、不自动发送）
      store.selectCapability(routeConversationId, capabilityId);
      setInput("");
      return;
    }
    // 首页选择插件：仅切换选中态展开面板；不创建会话、不跳转（发送后才创建会话）
    if (activeCapabilityId === capabilityId) {
      setActiveCapabilityId(null);
      return;
    }
    setActiveCapabilityId(capabilityId);
  };

  /** V3.1/V3.2：预设问题直发（侧栏固定入口/非插件能力共用；不展开插件面板）
   *  首页：创建新会话发送并跳转；会话内：直接发送 */
  const handleQuickPromptSend = (prompt: string) => {
    if (!prompt.trim()) return;
    if (routeConversationId && conversation) {
      sendToConversation(routeConversationId, prompt);
      setInput("");
      return;
    }
    const conv = store.createConversation(ownerId);
    sendToConversation(conv.id, prompt);
    setInput("");
    setActiveCapabilityId(null);
    navigateInZone(`/pc_client/ruyi-zone/conversations/${conv.id}`);
  };

  const handleExitCapability = () => {
    if (routeConversationId) {
      store.selectCapability(routeConversationId, null);
    }
  };

  /** V5：切换当前调用智能体 = 总是新开聊天窗口（草稿态）。
   *  - 已在草稿窗口：原地切换智能体（草稿没有真实对话，可自由换）；
   *  - 在具体会话/首页：导航到草稿窗口并预选智能体。 */
  const handleSelectAgent = (capabilityId: RuyiCapability["id"] | null) => {
    setInput("");
    setRegenerateToolOpen(false);
    if (isDraftPath) {
      setActiveCapabilityId(capabilityId);
      return;
    }
    const params = new URLSearchParams();
    if (capabilityId) params.set("agent", capabilityId);
    if (demoScenarioId) params.set("demo", demoScenarioId);
    const query = params.toString();
    navigate(`/pc_client/ruyi-zone/draft${query ? `?${query}` : ""}`);
  };

  /** V5：把生成快照预填进对应插件的输入面板（重新生成时带入上次参数/模板） */
  const prefillDraftsFromSnapshot = (capabilityId: RuyiCapability["id"], result: { title: string; snapshot?: RuyiGenerationSnapshot }) => {
    const snapshot = result.snapshot;
    if (!snapshot) return;
    setPanelDrafts((prev) => {
      if (capabilityId === "document") {
        return { ...prev, document: { ...prev.document, docTitle: result.title || prev.document.docTitle, selectedTemplate: snapshot.templateName || prev.document.selectedTemplate } };
      }
      if (capabilityId === "presentation") {
        return { ...prev, presentation: { ...prev.presentation, topic: result.title || prev.presentation.topic, template: snapshot.templateName || prev.presentation.template } };
      }
      if (capabilityId === "advisor") {
        const target = snapshot.paramsSummary.find((p) => p.label === "汇报对象")?.value;
        return { ...prev, advisor: { ...prev.advisor, analysisTarget: target || prev.advisor.analysisTarget } };
      }
      return prev;
    });
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
      case "copy":
        void navigator.clipboard.writeText(message.content);
        break;
      case "open-result":
      case "preview-result": {
        // V4：打开成果不再跳工作台——统一为会话内预览弹框
        const previewTarget = message.resultId ? store.getResultById(message.resultId) : null;
        if (previewTarget && canOpenRuyiResult(previewTarget)) {
          setPreviewResultId(message.resultId);
        }
        break;
      }
      case "download-result": {
        const downloadTarget = message.resultId ? store.getResultById(message.resultId) : null;
        if (downloadTarget && downloadTarget.status === "completed") {
          downloadRuyiResult(downloadTarget);
        }
        break;
      }
      case "regenerate-with-tool": {
        // V5：工具锁定会话的重新生成——展开对应工具输入 UI（预填生成快照参数）
        const regenResult = message.resultId ? store.getResultById(message.resultId) : null;
        const regenConversation = routeConversationId ? store.getConversationById(routeConversationId) : null;
        const lockedCapabilityId = regenConversation?.activeCapabilityId ?? regenResult?.capabilityId;
        if (!regenResult || !regenConversation || regenResult.status !== "completed") break;
        if (lockedCapabilityId) {
          store.selectCapability(regenConversation.id, lockedCapabilityId);
          prefillDraftsFromSnapshot(lockedCapabilityId, regenResult);
        }
        setRegenerateToolOpen(true);
        break;
      }
      case "open-route": {
        // V3.5：普通内部路由跳转（知识库/流程中心等）；契约校验由渲染层保证
        const href = typeof (payload as { href?: string } | undefined)?.href === 'string' ? (payload as { href: string }).href : '';
        if (href) navigate(href);
        break;
      }
      case "open-workbench": {
        const capability = message.capabilityId ? getRuyiCapability(message.capabilityId) : null;
        if (capability?.workbenchPath) {
          // P0/V3：从对话进入工作台必须携带来源会话；启动上下文按"触发按钮所属消息"生成——
          // 优先读该消息关联的 capabilitySubmission（提交消息），其次读消息本体，避免误取最后一条消息
          const sourceId = routeConversationId ?? FIXED_SYSTEM_CONVERSATION_ID;
          const workbenchCap = capability.id as 'document' | 'presentation' | 'advisor';
          // 提交链路生成的助手确认消息挂在 userMessage 之后：向上找最近一条用户消息的 submission
          const conversationMessages = store.getConversationMessages(sourceId);
          const messageIndex = conversationMessages.findIndex((m) => m.id === message.id);
          const relatedUserMessage = messageIndex >= 0
            ? conversationMessages.slice(0, messageIndex + 1).reverse().find((m) => m.sender === 'user')
            : undefined;
          const sourceMessageId = relatedUserMessage?.capabilitySubmission?.capabilityId === capability.id
            ? relatedUserMessage.id
            : undefined;
          store.saveWorkbenchLaunchContext(sourceId, workbenchCap, sourceMessageId);
          navigate(withDemoParam(`${capability.workbenchPath}?sourceConversationId=${sourceId}`));
        }
        break;
      }
      case "continue-in-zone": {
        // V3.1：消息页/空间内创作类引导——选中对应插件并带入需求草稿（不自动提交、不进工作台）
        const capability = message.capabilityId ? getRuyiCapability(message.capabilityId) : null;
        if (!capability) break;
        if (routeConversationId) {
          const current = conversation?.activeCapabilityId ?? null;
          if (current !== capability.id) {
            store.selectCapability(routeConversationId, capability.id);
          }
        } else {
          setActiveCapabilityId(capability.id);
        }
        // 已有需求带入输入框草稿
        const conversationMessages = store.getConversationMessages(routeConversationId ?? FIXED_SYSTEM_CONVERSATION_ID);
        const messageIndex = conversationMessages.findIndex((m) => m.id === message.id);
        const relatedUserMessage = messageIndex >= 0
          ? conversationMessages.slice(0, messageIndex + 1).reverse().find((m) => m.sender === 'user')
          : undefined;
        if (relatedUserMessage?.content?.trim()) {
          setInput(relatedUserMessage.content.trim());
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

  const renderWorkbench = () => {
    const wb = renderWorkbenchInner();
    return wb ? <Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-gray-400">工作台加载中…</div>}>{wb}</Suspense> : null;
  };

  const renderWorkbenchInner = () => {
    if (advisorWorkspacePath) {
      return <AdvisorWorkbench onBack={handleBackFromEditor} />;
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
      {/* ?demo= 边界验收提示条（仅场景名 + 退出；不做场景留存） */}
      {demoScenarioId && (
        <div
          className="absolute left-0 right-0 top-0 z-40 flex flex-wrap items-center justify-center gap-2 bg-amber-50/95 px-4 py-1.5 text-xs text-amber-800 shadow-sm dark:bg-amber-900/30 dark:text-amber-200"
          data-requirement-id="ruyi-demo-banner"
        >
          <span className="font-semibold">演示场景：{demoScenarioId}</span>
          <span className="opacity-70">边界验收 fixture（不持久化）</span>
          <button type="button" onClick={() => navigate('/pc_client/ruyi-zone')} className="rounded border border-amber-300 px-2 py-0.5 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50">返回普通如意空间</button>
        </div>
      )}
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
          capabilities={ruyiBuiltinCapabilities}
          agents={ruyiAgents}
          activeAgent={routeConversationId ? conversationAgent : homeAgent}
          activeConversationId={routeConversationId ?? null}
          activeCapabilityId={conversation?.activeCapabilityId ?? activeCapabilityId}
          resultSummary={resultSummary}
          activeNav={resultCenterPath ? "results" : null}
          onOpenResults={() => navigateInZone("/pc_client/ruyi-zone/results")}
          searchMatches={liveSearchMatches}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onSelectCapability={handleSelectCapability}
          onSelectAgent={handleSelectAgent}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
        />

        <div className="flex flex-1 flex-col h-full overflow-hidden">
          {workbench ? (
            workbench
          ) : routeConversationId ? (
            conversation ? (
              // V3.4：空会话（新对话）复用 RuyiAssistantHome 内容区（快捷能力+推荐问题+统一输入）；预置/历史会话走会话视图
              messages.length === 0 && conversation.id !== FIXED_SYSTEM_CONVERSATION_ID ? (
                <RuyiAssistantHome
                  ownerName={MAIN_USER_NAME}
                  capabilities={ruyiBuiltinCapabilities}
                  activeAgent={conversationAgent}
                  activeCapabilityId={activeCapabilityId ?? null}
                  suggestedPrompts={conversationAgent.samplePrompts}
                  input={input}
                  onInputChange={setInput}
                  onSend={() => conversation && handleConversationSend(conversation.id)}
                  onSelectCapability={handleSelectCapability}
                  onSelectAgent={handleSelectAgent}
                  panelDrafts={panelDrafts}
                  onPanelDraftChange={handlePanelDraftChange}
                  onSubmitCapability={(submission) => conversation && handleSubmitCapability(submission, conversation.id)}
                  capabilitySubmitting={capabilitySubmitting}
                />
              ) : (
                <RuyiConversationView
                  conversation={conversation}
                  messages={messages}
                  activeCapability={activeCapability}
                  agent={conversationAgent}
                  onExitCapability={handleExitCapability}
                  capabilities={ruyiBuiltinCapabilities}
                  input={input}
                  onInputChange={setInput}
                  onSend={() => conversation && handleConversationSend(conversation.id)}
                  onSelectPlugin={handleSelectCapability}
                  onAction={handleMessageAction}
                  panelDrafts={panelDrafts}
                  onPanelDraftChange={handlePanelDraftChange}
                  onSubmitCapability={(submission) => conversation && handleSubmitCapability(submission, conversation.id)}
                  capabilitySubmitting={capabilitySubmitting}
                />
              )
            ) : (
              <RuyiEmptyState variant="not-found" />
            )
          ) : (
            <RuyiAssistantHome
              ownerName={MAIN_USER_NAME}
              capabilities={ruyiBuiltinCapabilities}
              activeAgent={homeAgent}
              activeCapabilityId={activeCapabilityId}
              suggestedPrompts={homeAgent.samplePrompts}
              input={input}
              onInputChange={setInput}
              onSend={handleHomeSend}
              onSelectCapability={handleSelectCapability}
              onSelectAgent={handleSelectAgent}
              panelDrafts={panelDrafts}
              onPanelDraftChange={handlePanelDraftChange}
              onSubmitCapability={(submission) => handleSubmitCapability(submission)}
              capabilitySubmitting={capabilitySubmitting}
            />
          )}
        </div>
      </div>

      {/* V4：成果预览弹框（会话内成果卡共用） */}
      {previewResultId && (() => {
        const previewResult = store.getResultById(previewResultId);
        return previewResult && previewResult.status === "completed" ? (
          <RuyiResultPreviewModal
            result={previewResult}
            onClose={() => setPreviewResultId(null)}
            onDownload={(r) => downloadRuyiResult(r)}
          />
        ) : null;
      })()}
    </div>
  );
}
