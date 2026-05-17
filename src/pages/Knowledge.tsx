import { Folder, FileText, Upload } from "lucide-react";

interface DocumentItem {
  id: number;
  title: string;
  type: string;
  size: string;
  modified: string;
}

const documents: DocumentItem[] = [
  {
    id: 1,
    title: "会议纪要模板.docx",
    type: "Word文档",
    size: "2.5 MB",
    modified: "2025-07-20 14:30",
  },
  {
    id: 2,
    title: "项目立项申请流程.pdf",
    type: "PDF文档",
    size: "1.8 MB",
    modified: "2025-07-19 10:15",
  },
  {
    id: 3,
    title: "2025年度工作计划.xlsx",
    type: "Excel文档",
    size: "3.2 MB",
    modified: "2025-07-18 09:45",
  },
  {
    id: 4,
    title: "系统使用说明.md",
    type: "Markdown文档",
    size: "0.5 MB",
    modified: "2025-07-17 16:20",
  },
];

export default function Knowledge() {
  return (
    
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">知识库</h1>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option>关联已有</option>
                <option>创建空白</option>
                <option>根据录音创建</option>
              </select>
              <button className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors flex items-center gap-1">
                <FileText size={16} /> 创建文档
              </button>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索文档..."
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 pl-10"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center gap-1">
                <Upload size={16} /> 上传
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-5 border-b border-gray-200 bg-gray-50 py-2 px-4 font-medium text-gray-600">
              <div>文档名称</div>
              <div>类型</div>
              <div>大小</div>
              <div>修改时间</div>
              <div>操作</div>
            </div>
            <div className="divide-y divide-gray-100">
              {documents.map((doc) => (
                <DocumentRow key={doc.id} document={doc} />
              ))}
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            文件上传限制：大小 &gt;=1KB && &lt;=100MB，数量 &lt;=50个
          </div>
        </div>
      </div>
    
  );
}

function DocumentRow({ document }: { document: DocumentItem }) {
  return (
    <div className="grid grid-cols-5 py-3 px-4 hover:bg-gray-50 transition-colors">
      <div className="font-medium text-gray-900 flex items-center gap-2">
        <FileText size={16} className="text-gray-500" />
        {document.title}
      </div>
      <div className="text-gray-500">{document.type}</div>
      <div className="text-gray-500">{document.size}</div>
      <div className="text-gray-500">{document.modified}</div>
      <div className="flex gap-2">
        <button className="text-blue-600 hover:underline text-sm">查看</button>
        <button className="text-green-600 hover:underline text-sm">编辑</button>
        <button className="text-red-600 hover:underline text-sm">删除</button>
      </div>
    </div>
  );
}