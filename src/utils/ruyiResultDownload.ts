/**
 * V4：成果预览内容与下载（前端原型：无真实文件，按类型生成占位正文）
 */
import type { RuyiResultReference } from '../types/ruyi';

export const RUYI_RESULT_TYPE_LABELS: Record<RuyiResultReference['type'], string> = {
  document: '公文',
  presentation: 'PPT',
  report: '汇报',
  translation: '翻译',
};

/** 成果文件扩展名（下载用） */
const RESULT_FILE_EXT: Record<RuyiResultReference['type'], string> = {
  document: 'docx',
  presentation: 'pptx',
  report: 'md',
  translation: 'txt',
};

/** 原型占位正文：优先用生成快照的 contentPreview，否则按类型生成演示内容 */
export function buildRuyiResultPreviewContent(result: RuyiResultReference): string {
  if (result.snapshot?.contentPreview?.trim()) return result.snapshot.contentPreview;
  const title = result.title;
  switch (result.type) {
    case 'document':
      return `${title}\n\n一、背景与目的\n本文件为原型演示生成的公文正文占位内容，用于验证预览与下载链路。\n\n二、主要内容\n正式环境中此处展示 AI 生成的完整公文正文，包含依据、事项与执行要求。\n\n三、执行要求\n请各单位按照文件要求组织实施。`;
    case 'presentation':
      return `${title}（PPT 演示大纲）\n\n1. 封面：${title}\n2. 背景与目标\n3. 现状分析\n4. 方案介绍\n5. 实施计划\n6. 总结与展望\n\n（原型演示内容，正式环境展示完整幻灯片预览）`;
    case 'report':
      return `${title}\n\n【总体进展】本周各项工作按计划推进，关键节点按期完成。\n\n【风险与对策】无重大风险项。\n\n【下一步计划】持续推进既定安排。\n\n（原型演示内容）`;
    case 'translation':
      return `${title}\n\n原文：\n（原型演示）智能办公平台助力企业协同提效。\n\n译文：\nThe intelligent office platform helps enterprises improve collaboration efficiency.\n\n（原型演示内容）`;
    default:
      return title;
  }
}

/** 触发浏览器下载（原型阶段用 Blob；真实文件接入后替换为文件 URL 即可） */
export function downloadRuyiResult(result: RuyiResultReference): void {
  const content = buildRuyiResultPreviewContent(result);
  const ext = RESULT_FILE_EXT[result.type] ?? 'txt';
  const safeName = result.title.replace(/[\\/:*?"<>|]/g, '_') || '成果';
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeName}.${ext}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
