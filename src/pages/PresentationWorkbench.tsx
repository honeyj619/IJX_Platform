import { useLocation, useNavigate } from "react-router-dom";
import PresentationEditor from "./PresentationEditor";
import type { PresentationModeId } from "../data/presentation";

interface PresentationRouteState {
  mode?: PresentationModeId;
  title?: string;
  prompt?: string;
  pageCount?: string;
  audience?: string;
  scene?: string;
  tone?: string;
  language?: string;
  textStyle?: string;
  attachments?: string[];
}

export default function PresentationWorkbench() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as PresentationRouteState;

  return (
    <PresentationEditor
      mode={state.mode || "ai"}
      title={state.title || "AI赋能企业效率革新"}
      prompt={state.prompt || "围绕企业效率革新主题，生成适合内部汇报的PPT。"}
      pageCount={state.pageCount || "10-15页"}
      audience={state.audience || "大众"}
      scene={state.scene || "通用"}
      tone={state.tone || "专业"}
      language={state.language || "简体中文"}
      textStyle={state.textStyle || "简洁"}
      attachments={state.attachments || []}
      embedded
      onBack={() => navigate("/web_client/ruyi-zone")}
    />
  );
}