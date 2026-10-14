import { useState, type ReactNode } from 'react';
import { MessageSquareText, Send, UserPlus, X } from 'lucide-react';
import ContactPicker from './ContactPicker';
import { splitRecipientNames } from '../data/reportSendRecords';

/**
 * 汇报发送确认流（共享组件）
 * 统一参谋师工作台与工作汇报详情的发送确认交互：
 * 一级「工作汇报发送确认」（收件人编辑 + 导入上次 + 条件企微分区 + 摘要）→ 二级「再次确认发送」。
 */
export interface ReportSendFlowReportMeta {
  title: string;
  reportType: string;
  sender: string;
  period: string;
  /** 项目信息（项目汇报用于匹配历史记录与企微规则） */
  projectId?: string;
  projectName?: string;
  /** 健康灯：黄/红灯触发企微分区；无则不显示企微 */
  healthLight?: 'green' | 'yellow' | 'red';
}

export interface ReportSendFlowHistoryRecord {
  reportTo: string[];
  copyTo: string[];
  receipts: { channel: string; target: string }[];
}

export interface ReportSendFlowPayload {
  reportTo: string[];
  copyTo: string[];
  wecomRecipients: string[];
}

interface ReportSendFlowProps {
  /** 是否打开（一级+二级整体由父级控制挂载） */
  open: boolean;
  meta: ReportSendFlowReportMeta;
  /** 主通道名（参谋师=邮件；工作汇报=PC门户） */
  primaryChannel: string;
  /** 企微固定接收人（锁定不可删），healthLight 为黄/红时展示企微分区 */
  requiredWecomRecipients: string[];
  /** 最近一次同规则发送记录（无则导入按钮禁用） */
  previousRecord: ReportSendFlowHistoryRecord | null;
  onClose: () => void;
  /** 二级确认后的最终执行 */
  onConfirmSend: (payload: ReportSendFlowPayload) => void;
  /** 受控收件人（参谋师模式：ContactPicker 选择，由父级持有状态）。不传则组件内部用文本输入管理 */
  recipients?: { reportTo: string[]; copyTo: string[]; wecomExtra: string[] };
  onRecipientsChange?: (next: { reportTo: string[]; copyTo: string[]; wecomExtra: string[] }) => void;
  /** 二级摘要附加行（参谋师：项目名 + 固定推送人数说明） */
  reconfirmExtra?: (payload: ReportSendFlowPayload) => ReactNode;
}

export default function ReportSendFlow({ open, meta, primaryChannel, requiredWecomRecipients, previousRecord, onClose, onConfirmSend, recipients, onRecipientsChange, reconfirmExtra }: ReportSendFlowProps) {
  // 非受控（工作汇报详情）：文本输入；受控（参谋师）：ContactPicker，状态在父级
  const [innerReportTo, setInnerReportTo] = useState('');
  const [innerCopyTo, setInnerCopyTo] = useState('');
  const [innerWecomExtra, setInnerWecomExtra] = useState<string[]>([]);
  const [reconfirm, setReconfirm] = useState(false);
  const controlled = Boolean(recipients && onRecipientsChange);
  const reportToText = controlled ? (recipients!.reportTo.join('、')) : innerReportTo;
  const copyToText = controlled ? (recipients!.copyTo.join('、')) : innerCopyTo;
  const wecomExtra = controlled ? recipients!.wecomExtra : innerWecomExtra;
  const setRecipients = (next: { reportTo?: string[]; copyTo?: string[]; wecomExtra?: string[] }) => {
    if (controlled) {
      onRecipientsChange!({ reportTo: next.reportTo ?? recipients!.reportTo, copyTo: next.copyTo ?? recipients!.copyTo, wecomExtra: next.wecomExtra ?? recipients!.wecomExtra });
    } else {
      if (next.reportTo !== undefined) setInnerReportTo(next.reportTo.join('、'));
      if (next.copyTo !== undefined) setInnerCopyTo(next.copyTo.join('、'));
      if (next.wecomExtra !== undefined) setInnerWecomExtra(next.wecomExtra);
    }
  };

  if (!open) return null;

  const showWecom = meta.healthLight === 'yellow' || meta.healthLight === 'red';
  const wecomRecipients = [...new Set([...requiredWecomRecipients, ...wecomExtra])];
  const reportTargets = controlled ? recipients!.reportTo : splitRecipientNames(reportToText);
  const copyTargets = controlled ? recipients!.copyTo : splitRecipientNames(copyToText);

  const importPrevious = () => {
    if (!previousRecord) return;
    const prevWecom = previousRecord.receipts.filter(r => r.channel === '企业微信').map(r => r.target);
    setRecipients({
      reportTo: [...new Set(previousRecord.reportTo)],
      copyTo: [...new Set(previousRecord.copyTo)],
      wecomExtra: [...new Set(prevWecom)].filter(name => !requiredWecomRecipients.includes(name)),
    });
  };

  return (
    <>
      {/* 一级：工作汇报发送确认 */}
      <div className="fixed inset-0 z-[92] flex items-center justify-center bg-gray-950/40 px-4 py-6">
        <div className="flex max-h-[86vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-gray-950">工作汇报发送确认</h3>
              <p className="mt-1 text-xs text-gray-500">{meta.title} · {meta.period}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={importPrevious}
                disabled={!previousRecord}
                className="inline-flex h-7 shrink-0 items-center gap-1 px-1.5 text-xs font-medium text-theme-700 hover:text-theme-800 disabled:cursor-not-allowed disabled:text-gray-300"
                title={previousRecord ? '按汇报人、项目和汇报类型导入最近一次收件人' : '暂无符合条件的历史发送记录'}
              >
                <UserPlus size={13} />导入上次收件人
              </button>
              <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="返回编辑"><X size={18} /></button>
            </div>
          </div>
          <div className="scrollbar-hover min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">汇报对象</p>
                <span className="text-[11px] text-gray-400">多个对象以顿号分隔</span>
              </div>
              {controlled ? (
                <ContactPicker
                  selected={recipients!.reportTo}
                  onChange={next => setRecipients({ reportTo: next })}
                  disabledNames={recipients!.copyTo}
                />
              ) : (
                <input
                  autoFocus
                  value={reportToText}
                  onChange={event => setRecipients({ reportTo: splitRecipientNames(event.target.value) })}
                  placeholder="请输入汇报对象，如：接总、任总"
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-theme-400"
                />
              )}
            </section>
            <section>
              <p className="mb-2 text-sm font-semibold text-gray-800">抄送对象</p>
              {controlled ? (
                <ContactPicker
                  selected={recipients!.copyTo}
                  onChange={next => setRecipients({ copyTo: next })}
                  disabledNames={recipients!.reportTo}
                />
              ) : (
                <input
                  value={copyToText}
                  onChange={event => setRecipients({ copyTo: splitRecipientNames(event.target.value) })}
                  placeholder="请输入抄送对象，可为空"
                  className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-theme-400"
                />
              )}
            </section>
            {showWecom && (
              <section className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-gray-900">
                  <MessageSquareText size={15} className="text-amber-600" />企业微信
                  <span className="text-xs font-normal text-amber-700">项目{meta.healthLight === 'yellow' ? '黄灯（关注）' : '红灯（风险）'}，需通过企微渠道提醒干系人</span>
                </p>
                <div className="mt-3 text-xs font-semibold text-gray-500">
                  <p className="mb-1.5">企微接收人（成员 / 群） <span className="text-red-500">*</span></p>
                  <ContactPicker
                    selected={wecomRecipients}
                    onChange={next => setRecipients({ wecomExtra: next.filter(name => !requiredWecomRecipients.includes(name)) })}
                    kind="wecom"
                    placeholder="搜索成员姓名"
                    lockedNames={requiredWecomRecipients}
                  />
                  <span className="mt-2 block text-[11px] font-normal leading-5 text-amber-700">固定推送：业务项目经理、承接处室经理、IT项目经理、接总、任总、孔丰汇及全部项目管理工程师；可增加其他人员，固定人员不可删除。</span>
                </div>
              </section>
            )}
            {!showWecom && meta.healthLight === 'green' && (
              <p className="rounded-lg bg-gray-50 px-4 py-3 text-xs leading-5 text-gray-400">当前项目为绿灯（正常），仅通过{primaryChannel}渠道分发，不展示企业微信分区。</p>
            )}
            <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-semibold text-gray-600">发送内容摘要</p>
              <div className="mt-2 space-y-1.5 text-sm text-gray-700">
                <p><span className="text-gray-400">标题：</span>{meta.title}</p>
                <p><span className="text-gray-400">类型：</span>{meta.reportType} · 通道：{primaryChannel}{showWecom ? ' + 企业微信' : ''}</p>
                <p><span className="text-gray-400">发送人：</span>{meta.sender}</p>
              </div>
            </section>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">返回编辑</button>
            <button
              type="button"
              disabled={reportTargets.length === 0 || (showWecom && wecomRecipients.length === 0)}
              onClick={() => setReconfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-theme-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-theme-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={15} />确认发送
            </button>
          </div>
        </div>
      </div>

      {/* 二级：再次确认发送 */}
      {reconfirm && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-gray-950/30 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-950">再次确认发送</h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">发送后将生成发送记录，并通知所选汇报对象。</p>
              </div>
              <button type="button" onClick={() => setReconfirm(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100" title="关闭"><X size={18} /></button>
            </div>
            <div className="mt-5 space-y-2 rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
              <p><span className="text-gray-400">标题：</span>{meta.title}</p>
              <p><span className="text-gray-400">汇报周期：</span>{meta.period}</p>
              <p><span className="text-gray-400">汇报接收：</span>{reportTargets.length} 人{copyTargets.length > 0 ? `，抄送 ${copyTargets.length} 人` : ''}{showWecom ? `；企微 ${wecomRecipients.length} 人` : ''}</p>
              {reconfirmExtra && reconfirmExtra({ reportTo: reportTargets, copyTo: copyTargets, wecomRecipients })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setReconfirm(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">返回检查</button>
              <button
                type="button"
                onClick={() => onConfirmSend({ reportTo: reportTargets, copyTo: copyTargets, wecomRecipients: showWecom ? wecomRecipients : [] })}
                className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700"
              >确认并发送</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
