export type ProcessReferenceAttachment = {
  id: string;
  name: string;
  format: string;
  size: string;
};

export type ProcessReferenceFlow = {
  id: string;
  status: string;
  title: string;
  type: "发文申请流程";
  processName: string;
  code: string;
  department: string;
  applicant: string;
  submittedAt: string;
  currentNode: string;
  attachments: ProcessReferenceAttachment[];
};

export const supportedReferenceFileFormats = ["PDF", "Word", "Excel"];

export const isSupportedReferenceAttachment = (attachment: ProcessReferenceAttachment) => (
  supportedReferenceFileFormats.includes(attachment.format)
);

export const processReferenceFlows: ProcessReferenceFlow[] = [
  {
    id: "flow-doc-001",
    status: "正常",
    title: "如意空间智能办公建设通知发文申请",
    type: "发文申请流程",
    processName: "IT产品运营迭代需求申请流程",
    code: "ITRCXQ-2026-00059",
    department: "信息管理部",
    applicant: "梁吉力",
    submittedAt: "2026-08-18 11:05:02",
    currentNode: "归档",
    attachments: [
      { id: "att-doc-001-1", name: "智能办公建设通知正文.docx", format: "Word", size: "86 KB" },
      { id: "att-doc-001-2", name: "建设背景材料.pdf", format: "PDF", size: "1.2 MB" },
      { id: "att-doc-001-3", name: "部门反馈明细.xlsx", format: "Excel", size: "432 KB" },
      { id: "att-doc-001-4", name: "会议录音.m4a", format: "音频", size: "6.8 MB" },
    ],
  },
  {
    id: "flow-doc-002",
    status: "正常",
    title: "客服知识库质检机制通知发文申请",
    type: "发文申请流程",
    processName: "客服服务发文申请流程",
    code: "KFFW-2026-00018",
    department: "客服中心",
    applicant: "鲁肃",
    submittedAt: "2026-08-15 16:10:00",
    currentNode: "归档",
    attachments: [
      { id: "att-doc-002-1", name: "客服知识库质检说明.pdf", format: "PDF", size: "980 KB" },
      { id: "att-doc-002-2", name: "问题样本归类表.xlsx", format: "Excel", size: "316 KB" },
      { id: "att-doc-002-3", name: "质检流程图.png", format: "图片", size: "240 KB" },
    ],
  },
  {
    id: "flow-doc-003",
    status: "正常",
    title: "IT 服务需求响应闭环通知发文申请",
    type: "发文申请流程",
    processName: "IT服务发文申请流程",
    code: "ITSF-2026-00031",
    department: "IT服务处",
    applicant: "郭嘉",
    submittedAt: "2026-08-12 09:32:00",
    currentNode: "归档",
    attachments: [
      { id: "att-doc-003-1", name: "IT服务响应闭环通知.docx", format: "Word", size: "74 KB" },
      { id: "att-doc-003-2", name: "需求响应统计.xlsx", format: "Excel", size: "512 KB" },
      { id: "att-doc-003-3", name: "接口联调日志.txt", format: "文本", size: "42 KB" },
    ],
  },
];
