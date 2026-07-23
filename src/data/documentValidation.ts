export type DocumentMode = "writing" | "validation";

export type DocumentValidationIssueType = "typo" | "punctuation";

export interface DocumentValidationIssue {
  id: string;
  type: DocumentValidationIssueType;
  label: string;
  excerpt: string;
  suggestion: string;
  position: string;
}

export const documentValidationRules = [
  {
    id: "typo",
    title: "错别字校验",
    desc: "检查常见错字、别字和同音误用，给出建议替换词。",
  },
  {
    id: "punctuation",
    title: "标点使用校验",
    desc: "检查中文标点、顿号逗号混用、引号和句末标点缺失。",
  },
];

export const documentValidationIssues: DocumentValidationIssue[] = [
  {
    id: "issue-typo-1",
    type: "typo",
    label: "错别字",
    excerpt: "请各部门高度重视，确保系统平稳远行。",
    suggestion: "将“远行”修改为“运行”。",
    position: "正文第三段第 1 句",
  },
  {
    id: "issue-typo-2",
    type: "typo",
    label: "错别字",
    excerpt: "持续提升员工协同办公效律。",
    suggestion: "将“效律”修改为“效率”。",
    position: "正文第一段第 2 句",
  },
  {
    id: "issue-punctuation-1",
    type: "punctuation",
    label: "标点使用不正确",
    excerpt: "请各单位完成培训、上线、反馈等工作,并按时报送。",
    suggestion: "将英文逗号“,”修改为中文逗号“，”。",
    position: "正文第三段第 2 句",
  },
  {
    id: "issue-punctuation-2",
    type: "punctuation",
    label: "标点使用不正确",
    excerpt: "系统包括流程处理、知识服务、智能写作、等能力。",
    suggestion: "删除“智能写作”后的顿号。",
    position: "正文第二段第 1 句",
  },
];

export const documentValidationSummary = {
  title: "公文校验结果",
  fileName: "如意空间智能办公建设通知.docx",
  total: documentValidationIssues.length,
  typoCount: documentValidationIssues.filter((item) => item.type === "typo").length,
  punctuationCount: documentValidationIssues.filter((item) => item.type === "punctuation").length,
  conclusion: "已完成错别字和标点使用校验，建议先修订 4 处问题后再生成最终公文文件。",
};

export const validationSampleContent = `为深入推进智能化办公体系建设，持续提升员工协同办公效律，现决定依托如意助手平台，建设如意空间智能操作环境。

如意空间将实现流程处理、知识服务、智能写作、等能力，帮助员工减少跨系统切换，提高日常办公处理效率。

请各部门高度重视，确保系统平稳远行。请各单位完成培训、上线、反馈等工作,并按时报送。`;
