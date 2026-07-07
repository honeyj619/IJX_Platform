import { MAIN_USER_NAME, getDemoPerson } from "../data/people";
import { Hexagon, CheckCircle, Clock, XCircle } from "lucide-react";

interface ProcessItem {
  id: number;
  title: string;
  applicant: string;
  time: string;
  status: 'pending' | 'approved' | 'rejected';
}

const processes: ProcessItem[] = [
  {
    id: 1,
    title: "项目立项申请",
    applicant: MAIN_USER_NAME,
    time: "2025-07-21 10:30",
    status: "pending",
  },
  {
    id: 2,
    title: "合同签署授权委托书",
    applicant: getDemoPerson(4),
    time: "2025-07-20 15:45",
    status: "pending",
  },
  {
    id: 3,
    title: "预算调整申请",
    applicant: getDemoPerson(3),
    time: "2025-07-19 09:15",
    status: "approved",
  },
  {
    id: 4,
    title: "设备采购申请",
    applicant: getDemoPerson(1),
    time: "2025-07-18 14:20",
    status: "rejected",
  },
];

export default function Process() {
  return (
    
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900">流程管理</h1>
        </div>

        <div className="p-4">
          <div className="flex gap-4 mb-4">
            <button className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">
              待审批
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
              已审批
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
              我发起的
            </button>
          </div>

          <div className="space-y-4">
            {processes.map((process) => (
              <ProcessCard key={process.id} process={process} />
            ))}
          </div>
        </div>
      </div>
    
  );
}

function ProcessCard({ process }: { process: ProcessItem }) {
  const getStatusIcon = () => {
    switch (process.status) {
      case 'pending':
        return <Clock size={20} className="text-yellow-500" />;
      case 'approved':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={20} className="text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (process.status) {
      case 'pending':
        return '待审批';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900">{process.title}</h3>
        <div className="flex items-center gap-1 text-sm">
          {getStatusIcon()}
          <span className={`font-medium ${process.status === 'pending' ? 'text-yellow-500' : process.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
            {getStatusText()}
          </span>
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-3">
        申请人：{process.applicant}
      </div>
      <div className="text-sm text-gray-400 mb-4">
        提交时间：{process.time}
      </div>
      {process.status === 'pending' && (
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
            批准
          </button>
          <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
            拒绝
          </button>
        </div>
      )}
    </div>
  );
}


