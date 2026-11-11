import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { RuyiCapability, RuyiResultReference, RuyiResultType, RuyiWorkbenchLaunchContext } from '../types/ruyi';
import { useRuyiStore } from '../store/ruyiStore';

interface BridgeOptions {
  capabilityId: RuyiCapability['id'];
  /** 成果类型（公文/PPT/汇报） */
  resultType: RuyiResultType;
  workbenchPath: string;
}

export interface WorkbenchResultBridge {
  /** 来源会话 ID（URL query）；无来源时为 null */
  sourceConversationId: string | null;
  /** 任务2：store 中的工作台启动上下文（来源会话+能力），用于预填标题/需求描述；无来源时为 null */
  launchContext: RuyiWorkbenchLaunchContext | null;
  /** 保存/生成完成后调用：写入成果索引并在来源会话追加成果卡片消息（幂等，同会话同能力同标题只更新） */
  recordResult: (title: string, status?: RuyiResultReference['status']) => void;
  /** 从工作台返回：有来源时回来源会话，否则回如意空间主页 */
  backToSource: () => void;
}

/**
 * 批次4：专业工作台 ↔ 如意会话 成果回流桥。
 * - RuYiZone 跳转工作台时带 ?sourceConversationId=xxx（批次3已实现）。
 * - 工作台保存/生成完成时调用 recordResult：写成果 + 来源会话追加成果卡片（RuyiResultCard）。
 * - backToSource 返回来源会话，用户立即看到成果消息。
 * - 删除会话不删除成果（store 层保证：仅清空来源关联，成果保留）。
 */
export function useWorkbenchResultBridge({ capabilityId, resultType, workbenchPath }: BridgeOptions): WorkbenchResultBridge {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sourceConversationId = searchParams.get('sourceConversationId');
  // 任务2：挂载时读取一次启动上下文（不依赖 location.state，刷新工作台也不丢失）
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const launchContext = useMemo(() => {
    if (!sourceConversationId) return null;
    return useRuyiStore.getState().getWorkbenchLaunchContext(sourceConversationId, capabilityId as 'document' | 'presentation' | 'advisor');
  }, [sourceConversationId]);
  // demo 场景透传：工作台地址与返回地址必须携带 ?demo=，否则 demo 会被误判退出
  const demoId = searchParams.get('demo');
  const withDemo = (to: string) => (demoId ? `${to}${to.includes('?') ? '&' : '?'}demo=${demoId}` : to);

  const recordResult = useCallback((title: string, status: RuyiResultReference['status'] = 'editable') => {
    if (!sourceConversationId) return;
    useRuyiStore.getState().recordWorkbenchResult(sourceConversationId, {
      title,
      type: resultType,
      capabilityId,
      status,
      workbenchHref: withDemo(`${workbenchPath}?sourceConversationId=${sourceConversationId}`),
    });
  }, [sourceConversationId, capabilityId, resultType, workbenchPath, demoId]);

  const backToSource = useCallback(() => {
    if (sourceConversationId) {
      navigate(withDemo(`/pc_client/ruyi-zone/conversations/${sourceConversationId}`));
      return;
    }
    navigate('/pc_client/ruyi-zone');
  }, [sourceConversationId, navigate, demoId]);

  return { sourceConversationId, launchContext, recordResult, backToSource };
}
