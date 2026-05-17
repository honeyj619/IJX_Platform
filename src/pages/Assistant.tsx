import { MessageSquare, Send, RefreshCw, Copy } from "lucide-react";

export default function Assistant() {
  return (
    
      <div className="flex-1 flex flex-col bg-gray-50 h-full">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">如意助手</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src="https://api.dicebear.com/7.x/initials/svg?seed=如意助手&backgroundColor=ec4899"
                alt="如意助手"
                className="w-12 h-12 rounded-full"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm max-w-2xl">
              <p className="text-gray-700">您的使用问题已反馈至系统负责人</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <span>12:21</span>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <div className="bg-pink-100 p-4 rounded-lg shadow-sm max-w-2xl">
              <p className="text-gray-700">如何创建会议纪要？</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <span>12:22</span>
                <button className="p-1 hover:bg-pink-200 rounded-full">
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img
                src="https://api.dicebear.com/7.x/initials/svg?seed=梁吉力&backgroundColor=8b5cf6"
                alt="用户头像"
                className="w-12 h-12 rounded-full"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src="https://api.dicebear.com/7.x/initials/svg?seed=如意助手2&backgroundColor=f97316"
                alt="如意助手"
                className="w-12 h-12 rounded-full"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm max-w-2xl">
              <p className="text-gray-700">您可以通过以下方式创建会议纪要：</p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-700">
                <li>关联已有：打开弹框，在线文档选择</li>
                <li>创建空白：调用知识库创建在线文档接口，根据配置的会议纪要模板预先置入标题</li>
                <li>根据录音创建：使用录音文件生成文档</li>
              </ul>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                <span>12:23</span>
                <button className="p-1 hover:bg-gray-100 rounded-full">
                  <Copy size={16} />
                </button>
              </div>
              <div className="mt-2 flex gap-2">
                <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <RefreshCw size={14} /> 重新生成
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="请输入您的问题..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button className="bg-pink-500 text-white p-2 rounded-full hover:bg-pink-600 transition-colors">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    
  );
}