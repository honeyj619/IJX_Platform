import { useMemo, useState } from "react";
import { Inbox, Search, X } from "lucide-react";
import {
  isSupportedReferenceAttachment,
  processReferenceFlows,
  supportedReferenceFileFormats,
  type ProcessReferenceAttachment,
} from "../data/processReferenceFiles";

const PAGE_SIZE = 5;

type ProcessReferenceFilePickerProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (files: ProcessReferenceAttachment[]) => void;
};

export default function ProcessReferenceFilePicker({
  open,
  onClose,
  onConfirm,
}: ProcessReferenceFilePickerProps) {
  const [selectedFlowId, setSelectedFlowId] = useState("");
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [flowKeyword, setFlowKeyword] = useState("");
  const [attachmentKeyword, setAttachmentKeyword] = useState("");
  const [flowPage, setFlowPage] = useState(1);
  const [attachmentPage, setAttachmentPage] = useState(1);
  const selectedFlow = processReferenceFlows.find((flow) => flow.id === selectedFlowId) || null;

  const filteredFlows = useMemo(() => {
    const keyword = flowKeyword.trim();
    if (!keyword) return processReferenceFlows;
    return processReferenceFlows.filter((flow) => (
      `${flow.status}${flow.title}${flow.processName}${flow.code}${flow.department}${flow.applicant}${flow.submittedAt}${flow.currentNode}`.includes(keyword)
    ));
  }, [flowKeyword]);

  const filteredAttachments = useMemo(() => {
    if (!selectedFlow) return [];
    const keyword = attachmentKeyword.trim();
    if (!keyword) return selectedFlow.attachments;
    return selectedFlow.attachments.filter((attachment) => (
      `${attachment.name}${attachment.format}${attachment.size}`.includes(keyword)
    ));
  }, [attachmentKeyword, selectedFlow]);

  const selectedAttachments = useMemo(() => (
    selectedFlow?.attachments.filter((attachment) => selectedAttachmentIds.includes(attachment.id)) || []
  ), [selectedAttachmentIds, selectedFlow]);

  if (!open) return null;

  const flowPageCount = Math.max(1, Math.ceil(filteredFlows.length / PAGE_SIZE));
  const safeFlowPage = Math.min(flowPage, flowPageCount);
  const pagedFlows = filteredFlows.slice((safeFlowPage - 1) * PAGE_SIZE, safeFlowPage * PAGE_SIZE);
  const attachmentPageCount = Math.max(1, Math.ceil(filteredAttachments.length / PAGE_SIZE));
  const safeAttachmentPage = Math.min(attachmentPage, attachmentPageCount);
  const pagedAttachments = filteredAttachments.slice((safeAttachmentPage - 1) * PAGE_SIZE, safeAttachmentPage * PAGE_SIZE);

  const getPagerItems = (currentPage: number, pageCount: number): Array<number | "..."> => {
    if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);
    const pages: Array<number | "..."> = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(pageCount - 1, currentPage + 1);
    if (start > 2) pages.push("...");
    for (let page = start; page <= end; page += 1) pages.push(page);
    if (end < pageCount - 1) pages.push("...");
    pages.push(pageCount);
    return pages;
  };

  const renderPager = (
    total: number,
    currentPage: number,
    pageCount: number,
    onChange: (nextPage: number) => void,
  ) => (
    <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 border-t border-gray-100 px-5 py-2 text-sm text-gray-600">
      <span className="mr-1 shrink-0">共 {total} 条</span>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          ‹
        </button>
        {getPagerItems(currentPage, pageCount).map((item, index) => (
          item === "..." ? (
            <span key={`ellipsis-${index}`} className="flex h-8 w-8 items-center justify-center text-gray-400">...</span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`flex h-8 min-w-8 items-center justify-center rounded border px-2 ${
                item === currentPage
                  ? "border-[#d7af81] bg-[#d7af81] text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {item}
            </button>
          )
        ))}
        <button
          type="button"
          onClick={() => onChange(Math.min(pageCount, currentPage + 1))}
          disabled={currentPage >= pageCount}
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          ›
        </button>
      </div>
      <label className="ml-auto flex shrink-0 items-center gap-2">
        <span>跳至</span>
        <input
          type="number"
          min={1}
          max={pageCount}
          className="h-8 w-14 rounded border border-gray-200 px-2 text-center text-sm outline-none focus:border-theme-300"
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            const value = Number((event.target as HTMLInputElement).value);
            if (!Number.isFinite(value)) return;
            onChange(Math.min(pageCount, Math.max(1, value)));
            (event.target as HTMLInputElement).value = "";
          }}
        />
        <span>页</span>
      </label>
    </div>
  );

  const handleSelectFlow = (flowId: string) => {
    setSelectedFlowId(flowId);
    setSelectedAttachmentIds([]);
    setAttachmentKeyword("");
    setAttachmentPage(1);
  };

  const toggleAttachment = (attachment: ProcessReferenceAttachment) => {
    if (!isSupportedReferenceAttachment(attachment)) return;
    setSelectedAttachmentIds((current) => (
      current.includes(attachment.id)
        ? current.filter((id) => id !== attachment.id)
        : [...current, attachment.id]
    ));
  };

  const handleConfirm = () => {
    if (selectedAttachments.length === 0) return;
    onConfirm(selectedAttachments);
    setSelectedAttachmentIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[640px] max-h-[88vh] w-full max-w-[980px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 px-6">
          <div className="min-w-0">
            <div className="text-base font-semibold text-gray-900">从流程中选择参考文件</div>
            <div className="mt-1 truncate text-xs text-gray-500">先选择发文申请流程，再勾选流程附件作为参考文件。</div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto overscroll-contain md:grid-cols-[360px_minmax(0,1fr)]">
          <section className="flex min-h-[260px] min-w-0 flex-col border-b border-gray-100 md:min-h-0 md:border-b-0 md:border-r">
            <div className="flex shrink-0 items-start justify-between px-5 py-3">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-theme-600 text-[11px] font-semibold text-white">1</span>
                  <span className="truncate text-sm font-semibold text-gray-900">选择需要应用的“发文申请流程”</span>
                </div>
                <div className="mt-1 truncate pl-7 text-xs text-gray-500">仅展示已归档的流程。</div>
              </div>
            </div>

            <div className="shrink-0 px-5 pb-3">
              <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3">
                <input
                  value={flowKeyword}
                  onChange={(event) => {
                    setFlowKeyword(event.target.value);
                    setFlowPage(1);
                  }}
                  className="min-w-0 flex-1 border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                  placeholder="搜索流程标题、申请人"
                />
                <Search size={15} className="text-gray-300" />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-5">
              {filteredFlows.length > 0 ? (
                pagedFlows.map((flow) => {
                  const selected = flow.id === selectedFlow?.id;
                  return (
                    <button
                      key={flow.id}
                      onClick={() => handleSelectFlow(flow.id)}
                      className={`mb-1 flex h-[68px] w-full items-center gap-3 rounded-lg px-3 text-left transition ${
                        selected ? "bg-theme-50 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected ? "border-theme-500" : "border-gray-300"
                      }`}>
                        {selected && <span className="h-2 w-2 rounded-full bg-theme-600" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-600">{flow.status}</span>
                          <span className="truncate whitespace-nowrap text-sm font-medium">{flow.title}</span>
                        </span>
                        <span className="mt-1 block truncate whitespace-nowrap text-xs text-gray-500">
                          【{flow.processName}】 编号{flow.code}　由{flow.applicant} 创建于{flow.submittedAt}　当前节点：{flow.currentNode}
                        </span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-sm text-gray-400">
                  <Inbox size={42} strokeWidth={1.2} className="mb-3 text-gray-300" />
                  暂无流程
                </div>
              )}
            </div>
            {filteredFlows.length > 0 && renderPager(filteredFlows.length, safeFlowPage, flowPageCount, setFlowPage)}
          </section>

          <section className="flex min-h-[300px] min-w-0 flex-col md:min-h-0">
            <div className="flex h-12 shrink-0 items-center justify-between px-5">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-theme-600 text-[11px] font-semibold text-white">2</span>
                <span className="truncate text-sm font-semibold text-gray-900">选择流程中的附件</span>
              </div>
            </div>

            {selectedFlow && (
              <div className="mx-5 mb-3 shrink-0 rounded-lg bg-gray-50 px-3 py-2">
                <div className="truncate text-xs font-medium text-gray-700">{selectedFlow.title}</div>
                <div className="mt-0.5 truncate text-xs text-gray-400">{selectedFlow.department} · {selectedFlow.applicant}</div>
              </div>
            )}

            {selectedFlow && (
              <div className="shrink-0 px-5 pb-3">
                <div className="flex h-9 items-center rounded-lg border border-gray-200 bg-white px-3">
                  <input
                    value={attachmentKeyword}
                    onChange={(event) => {
                      setAttachmentKeyword(event.target.value);
                      setAttachmentPage(1);
                    }}
                    className="min-w-0 flex-1 border-none bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    placeholder="搜索附件名称"
                  />
                  <Search size={15} className="text-gray-300" />
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-5">
              {!selectedFlow ? (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-sm text-gray-400">
                  <Inbox size={46} strokeWidth={1.2} className="mb-3 text-gray-300" />
                  <div className="font-medium text-gray-500">请先选择左侧流程</div>
                  <div className="mt-1 text-xs text-gray-400">选择流程后将在这里展示可用附件</div>
                </div>
              ) : filteredAttachments.length > 0 ? (
                pagedAttachments.map((attachment) => {
                  const supported = isSupportedReferenceAttachment(attachment);
                  const selected = selectedAttachmentIds.includes(attachment.id);
                  return (
                    <button
                      key={attachment.id}
                      onClick={() => toggleAttachment(attachment)}
                      disabled={!supported}
                      title={supported ? attachment.name : `${attachment.name}，仅支持 ${supportedReferenceFileFormats.join("、")}`}
                      className={`mb-1 flex h-12 w-full items-center gap-3 rounded-lg px-3 text-left transition ${
                        !supported
                          ? "cursor-not-allowed bg-gray-50 text-gray-300"
                          : selected
                            ? "bg-theme-50 text-gray-900"
                            : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        selected ? "border-theme-500 bg-theme-600" : "border-gray-300 bg-white"
                      }`}>
                        {selected && <span className="h-1.5 w-1.5 rounded-sm bg-white" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate whitespace-nowrap text-sm font-medium">{attachment.name}</span>
                    </button>
                  );
                })
              ) : (
                <div className="flex h-full min-h-[240px] flex-col items-center justify-center text-sm text-gray-400">
                  <Inbox size={42} strokeWidth={1.2} className="mb-3 text-gray-300" />
                  暂无附件
                </div>
              )}
            </div>

            {selectedFlow && filteredAttachments.length > 0 && renderPager(filteredAttachments.length, safeAttachmentPage, attachmentPageCount, setAttachmentPage)}

            <div className="shrink-0 border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
              支持格式：{supportedReferenceFileFormats.join("、")}。其他格式暂不可作为参考文件。
            </div>
          </section>
        </div>

        <div className="flex h-16 shrink-0 items-center justify-between border-t border-gray-100 px-6">
          <div className="truncate text-sm text-gray-500">
            {selectedAttachments.length > 0 ? `已选择 ${selectedAttachments.length} 个参考文件` : "请选择需要带入的流程附件"}
          </div>
          <div className="ml-4 flex shrink-0 items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedAttachments.length === 0}
              className="rounded-lg bg-theme-600 px-4 py-2 text-sm font-semibold text-white hover:bg-theme-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              确认选择
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
