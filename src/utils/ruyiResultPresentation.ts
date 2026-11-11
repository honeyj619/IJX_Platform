/**
 * F2：成果统一安全展示（共享纯函数）
 * 所有展示 forbidden/invalid/可用成果的入口必须经由本模块，
 * 禁止在各组件内分散判断 status === 'forbidden'。
 */
import type { RuyiResultReference } from '../types/ruyi';

/** forbidden 固定安全文案 */
export const RUYI_RESTRICTED_RESULT_TITLE = '受限成果';
export const RUYI_RESTRICTED_RESULT_REASON = '无权限查看该成果内容';

/** 展示标题：forbidden 一律脱敏为安全占位，其余保留原标题 */
export function getRuyiResultDisplayTitle(result: RuyiResultReference): string {
  if (result.status === 'forbidden') return RUYI_RESTRICTED_RESULT_TITLE;
  return result.title;
}

/** 展示状态原因：forbidden 使用固定安全文案，不透出数据中的 statusReason */
export function getRuyiResultDisplayReason(result: RuyiResultReference): string | undefined {
  if (result.status === 'forbidden') return RUYI_RESTRICTED_RESULT_REASON;
  return result.statusReason;
}

/** 是否允许打开：仅 editable/completed 且有工作台路径（forbidden/invalid 一律禁止） */
export function canOpenRuyiResult(result: RuyiResultReference): boolean {
  if (result.status === 'forbidden' || result.status === 'invalid') return false;
  if (!result.workbenchHref) return false;
  return result.status === 'editable' || result.status === 'completed';
}

/** 打开地址：forbidden/invalid 返回 null（禁止构造 URL 绕过状态判断） */
export function getRuyiResultOpenHref(result: RuyiResultReference): string | null {
  return canOpenRuyiResult(result) ? result.workbenchHref : null;
}
