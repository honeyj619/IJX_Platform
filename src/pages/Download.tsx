import { ArrowLeft, Apple, Smartphone, Monitor, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/ijx-logo.jpg';

export default function Download() {
  const navigate = useNavigate();

  const openClient = (platform: 'ios' | 'android') => {
    window.open(platform === 'ios' ? 'ijx://download/ios' : 'ijx://download/android', '_blank');
  };

  return (
    <div className="h-full overflow-y-auto bg-white text-gray-950">
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="relative mb-7 flex h-14 items-center justify-center">
          <button
            onClick={() => navigate('/web_client')}
            className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-100"
            title="返回"
          >
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-3xl font-semibold tracking-wide">i吉祥</h1>
        </header>

        <section className="grid gap-6 border-b border-gray-200 pb-7 md:grid-cols-[1fr_180px] md:items-center">
          <div className="flex items-center gap-5">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:h-32 sm:w-32">
              <img src={logo} alt="i吉祥" className="h-full w-full object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">i吉祥</h2>
              <p className="mt-3 text-xl text-slate-500">应用安装包下载</p>
            </div>
          </div>
          <div className="flex justify-start md:justify-end">
            <div className="grid h-32 w-32 grid-cols-5 grid-rows-5 gap-1 rounded bg-white p-2 shadow-sm ring-1 ring-gray-200">
              {Array.from({ length: 25 }).map((_, index) => (
                <span
                  key={index}
                  className={`${[0, 1, 2, 5, 10, 11, 12, 4, 9, 14, 20, 21, 22, 19, 24, 6, 8, 16, 18].includes(index) ? 'bg-gray-950' : 'bg-gray-100'} rounded-[2px]`}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 text-xl text-slate-500">i吉祥APP下载页面</div>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-6">
            <h3 className="text-2xl font-bold">iOS</h3>
            <div className="mt-5 border-t border-gray-100 pt-5 text-xl leading-10 text-slate-500">
              <p>安装包大小： 104.39 MB</p>
              <p>版本： 3.4.2</p>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 p-6">
            <h3 className="text-2xl font-bold">Android</h3>
            <div className="mt-5 border-t border-gray-100 pt-5 text-xl leading-10 text-slate-500">
              <p>安装包大小： 106.63 MB</p>
              <p>版本： 3.4.0</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-3">
          <button
            onClick={() => openClient('ios')}
            className="flex h-16 items-center justify-center gap-4 rounded-full bg-blue-500 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-blue-600 lg:col-span-1"
          >
            <Apple size={30} />
            iOS下载
          </button>
          <button
            onClick={() => openClient('android')}
            className="flex h-16 items-center justify-center gap-4 rounded-full bg-teal-500 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-teal-600 lg:col-span-1"
          >
            <Smartphone size={30} />
            安卓下载
          </button>
          <button
            onClick={() => navigate('/web_client')}
            className="flex h-16 items-center justify-center gap-4 rounded-full bg-pink-700 text-xl font-semibold text-white shadow-sm transition-colors hover:bg-pink-800 lg:col-span-1"
          >
            <Monitor size={28} />
            Web端进入
            <ExternalLink size={20} />
          </button>
        </section>
      </div>
    </div>
  );
}
