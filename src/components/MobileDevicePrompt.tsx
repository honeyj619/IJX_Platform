import { useState, useEffect } from 'react';

export default function MobileDevicePrompt() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-pink-950 dark:via-rose-950 dark:to-purple-950">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* 装饰性圆形 */}
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/20 to-rose-300/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-gradient-to-tl from-purple-400/15 to-pink-400/10 rounded-full blur-3xl" />
          
          {/* 装饰性几何图形 */}
          <div className="absolute top-20 left-10 w-16 h-16 border-2 border-pink-200/30 rotate-45" />
          <div className="absolute bottom-40 right-20 w-20 h-20 border-2 border-rose-200/25 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-pink-100/40 rounded-full" />
        </div>
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 flex items-center justify-center h-screen px-6 py-12">
        <div className={`w-full max-w-md text-center transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* 图标区域 */}
          <div className="mb-10 relative">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-300/30 to-rose-300/30 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900 dark:to-rose-900 p-8 rounded-3xl shadow-2xl border border-pink-200/50 dark:border-pink-800/50">
                <svg viewBox="0 0 120 120" fill="none" className="w-24 h-24" xmlns="http://www.w3.org/2000/svg">
                  {/* 手机轮廓 */}
                  <rect x="30" y="10" width="60" height="100" rx="8" fill="url(#phoneGradient)" stroke="url(#phoneStroke)" strokeWidth="2" />
                  <rect x="35" y="15" width="50" height="90" rx="6" fill="url(#screenGradient)" />
                  <circle cx="60" cy="108" r="4" fill="url(#phoneStroke)" />
                  
                  {/* 吉祥文字装饰 */}
                  <text x="60" y="65" textAnchor="middle" fill="url(#textGradient)" fontSize="24" fontFamily="serif" fontWeight="bold">
                    吉
                  </text>
                  
                  {/* 装饰性圆圈 */}
                  <circle cx="60" cy="60" r="35" stroke="url(#circleStroke)" strokeWidth="1.5" strokeDasharray="8 4" fill="none" className="animate-spin" style={{ animationDuration: '20s' }} />
                  
                  <defs>
                    <linearGradient id="phoneGradient" x1="30" y1="10" x2="90" y2="110" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#e11d48" />
                    </linearGradient>
                    <linearGradient id="phoneStroke" x1="30" y1="10" x2="90" y2="110" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#9d174d" />
                      <stop offset="100%" stopColor="#500724" />
                    </linearGradient>
                    <linearGradient id="screenGradient" x1="35" y1="15" x2="85" y2="105" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fce7f3" />
                      <stop offset="100%" stopColor="#fecdd3" />
                    </linearGradient>
                    <linearGradient id="textGradient" x1="48" y1="45" x2="72" y2="75" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#be185d" />
                      <stop offset="100%" stopColor="#7f1d1d" />
                    </linearGradient>
                    <linearGradient id="circleStroke" x1="25" y1="60" x2="95" y2="60" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#f472b6" stopOpacity="0.6" />
                      <stop offset="50%" stopColor="#e11d48" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#f472b6" stopOpacity="0.6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* 标题 */}
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-pink-800 via-rose-700 to-pink-800 dark:from-pink-200 dark:via-rose-300 dark:to-pink-200 bg-clip-text text-transparent" style={{ fontFamily: '"Noto Serif SC", "Songti SC", serif' }}>
            手机端请使用
          </h1>

          {/* 品牌名称 */}
          <div className="mb-8">
            <span className="inline-block px-8 py-4 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/50 dark:to-rose-900/50 rounded-2xl border border-pink-200/60 dark:border-pink-800/60 shadow-lg">
              <span className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-pink-700 to-rose-600 dark:from-pink-400 dark:to-rose-500 bg-clip-text text-transparent" style={{ fontFamily: '"Noto Serif SC", "Songti SC", serif' }}>
                i吉祥
              </span>
              <span className="block text-sm text-pink-600/80 dark:text-pink-400/80 mt-2 font-medium">
                app
              </span>
            </span>
          </div>

          {/* 分隔线 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex-1 max-w-24 h-px bg-gradient-to-r from-transparent to-pink-300/50 dark:to-pink-700/50" />
            <span className="text-pink-500 dark:text-pink-400 text-2xl">✦</span>
            <div className="flex-1 max-w-24 h-px bg-gradient-to-l from-transparent to-pink-300/50 dark:to-pink-700/50" />
          </div>

          {/* 提示文字 */}
          <div className="mb-10">
            <p className="text-lg md:text-xl text-pink-800/80 dark:text-pink-200/80 mb-4 font-medium leading-relaxed">
              或请在宽屏打开哦
            </p>
            <p className="text-base text-pink-700/60 dark:text-pink-300/60">
              为了获得最佳体验
            </p>
          </div>

          {/* 底部装饰 */}
          <div className="mt-12 flex items-center justify-center gap-2 text-pink-400/50 dark:text-pink-600/50">
            <span className="text-2xl">◆</span>
            <span className="text-sm tracking-widest uppercase">Best Experience on Desktop</span>
            <span className="text-2xl">◆</span>
          </div>
        </div>
      </div>

      {/* 样式补充 */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 20s linear infinite;
        }
      `}</style>
    </div>
  );
}
