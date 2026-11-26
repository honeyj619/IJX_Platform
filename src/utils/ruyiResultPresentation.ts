/**
 * V4：成果统一展示（共享纯函数）
 * 成果状态已收敛为 completed | deleted；本模块提供展示文案与可用性判断。
 */
import type { RuyiResultReference } from '../types/ruyi';

/** 展示标题：删除态脱敏为占位，其余保留原标题 */
export function getRuyiResultDisplayTitle(result: RuyiResultReference): string {
  if (result.status === 'deleted') return '已删除成果';
  return result.title;
}

/** 展示状态原因：删除态使用固定文案 */
export function getRuyiResultDisplayReason(result: RuyiResultReference): string | undefined {
  if (result.status === 'deleted') return '该成果已被删除';
  return result.statusReason;
}

/** 是否可用（预览/下载）：仅 completed */
export function canOpenRuyiResult(result: RuyiResultReference): boolean {
  return result.status === 'completed';
}
