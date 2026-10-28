import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import MobileDevicePrompt from "@/components/MobileDevicePrompt";
import Home from "@/pages/Home";
import Enterprise from "@/pages/Enterprise";
import Assistant from "@/pages/Assistant";
import Process from "@/pages/Process";
import Profile from "@/pages/Profile";
import RuYiZone from "@/pages/RuYiZone";
import HelpFeedback from "@/pages/HelpFeedback";
import AgentSquarePage from "@/pages/AgentSquarePage";
import EKB from "@/pages/EKB";
import Calendar from "@/pages/Calendar";
import Business from "@/pages/Business";
import SettingsPage from "@/pages/SettingsPage";
import Admin from "@/pages/Admin";
import WorkReport from "@/pages/WorkReport";
import OkrModule from "@/pages/OkrModule";
import Download from "@/pages/Download";
import PcWebPortal from "@/pages/PcWebPortal";
import { RequirementModeLayer, RequirementModeProvider } from "@/components/requirements/RequirementMode";

function shouldShowMobileView(width: number, height: number): boolean {
  const aspectRatio = width / height;
  const isLandscape = aspectRatio > 1.3;
  
  // 横屏模式判断
  if (isLandscape) {
    // 手机横屏宽度通常 < 800px
    // 折叠屏/平板横屏宽度通常 >= 800px
    if (width < 800) {
      return true; // 手机横屏 → 移动模式
    }
    return false; // 折叠屏/平板横屏 → 桌面模式
  }
  
  // 竖屏模式判断
  // 折叠屏展开：宽度 >= 600px
  // 普通手机：宽度 < 600px
  if (width >= 600) {
    return false; // 折叠屏展开 → 桌面模式
  }
  
  return true; // 普通手机 → 移动模式
}

// 客户端路由前缀：/pc_client 及其会重定向到客户端的旧路由
const CLIENT_ROUTE_PREFIXES = [
  '/pc_client',
  '/web_client',
  '/enterprise',
  '/assistant',
  '/process',
  '/ekb',
  '/profile',
  '/agent-square',
  '/ruyi-zone',
  '/presentation',
  '/calendar',
  '/business',
  '/work-report',
  '/work-items',
  '/okr',
  '/settings',
];

function getPathWithoutBase(pathname: string): string {
  const base = import.meta.env.BASE_URL;
  if (base && base !== '/') {
    const trimmedBase = base.replace(/\/+$/, '');
    if (pathname.startsWith(trimmedBase)) {
      const rest = pathname.slice(trimmedBase.length);
      return rest.startsWith('/') ? rest : `/${rest}`;
    }
  }
  return pathname;
}

function isClientRoutePath(pathname: string): boolean {
  const path = getPathWithoutBase(pathname);
  if (path === '/') return true;
  return CLIENT_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function LegacyRouteRedirect({ from, to }: { from: string; to: string }) {
  const location = useLocation();
  const pathname = getPathWithoutBase(location.pathname);
  const suffix = pathname.startsWith(from) ? pathname.slice(from.length) : '';
  return <Navigate to={`${to}${suffix}${location.search}`} replace />;
}

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      const isLandscape = aspectRatio > 1.3;
      
      const shouldMobile = shouldShowMobileView(width, height);
      setIsMobile(shouldMobile);
      
      // 详细的调试信息
      let deviceType = '';
      if (isLandscape) {
        deviceType = width < 800 ? '手机横屏' : '折叠屏/平板横屏';
      } else {
        deviceType = width >= 600 ? '折叠屏展开' : '手机竖屏';
      }
      
      console.log('🔍 屏幕尺寸检测:');
      console.log(`   尺寸: ${width} x ${height} px`);
      console.log(`   宽高比: ${aspectRatio.toFixed(2)}`);
      console.log(`   屏幕方向: ${isLandscape ? '横屏' : '竖屏'}`);
      console.log(`   设备类型: ${deviceType}`);
      console.log(`   显示模式: ${shouldMobile ? '❌ 移动端提示' : '✅ 桌面端应用'}`);
    };

    checkIsMobile();
    
    // 使用防抖来优化 resize 事件
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkIsMobile, 150);
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      // 折叠屏需要更长的时间让布局稳定
      setTimeout(checkIsMobile, 500);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  const isDownloadPage = window.location.pathname.includes('/download');
  const isClientPage = isClientRoutePath(window.location.pathname);

  // 客户端页面不再显示移动端提示（含 / 及会重定向到 pc_client 的旧路由）；
  // /admin 和 /download 保留原有行为。
  if (isMobile && !isDownloadPage && !isClientPage) {
    return <MobileDevicePrompt />;
  }

  const webClientRoutes = (
    <div className="web-client-viewport">
      <Layout>
        <Routes>
          <Route index element={<Home />} />
          <Route path="enterprise" element={<Enterprise />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="process" element={<Process />} />
          <Route path="ekb" element={<EKB />} />
          <Route path="profile" element={<Profile />} />
          <Route path="agent-square" element={<AgentSquarePage />} />
          <Route path="ruyi-zone/*" element={<RuYiZone />} />
          <Route path="presentation" element={<Navigate to="/pc_client/ruyi-zone/presentation" replace />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="business" element={<Business />} />
          <Route path="work-report" element={<WorkReport />} />
          <Route path="work-items" element={<Navigate to="/pc_client/enterprise" replace />} />
          <Route path="okr" element={<OkrModule />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="help-feedback" element={<HelpFeedback />} />
          <Route path="help-feedback/:feedbackId" element={<HelpFeedback />} />
        </Routes>
      </Layout>
    </div>
  );

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <RequirementModeProvider>
        <Routes>
          {/* 管理后台 — 独立页面，不嵌套在 Layout 中 */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/download" element={<Download />} />
          <Route path="/pc_web" element={<PcWebPortal />} />
          <Route path="/pc_web/contacts" element={<PcWebPortal />} />
          <Route path="/web_client/*" element={<LegacyRouteRedirect from="/web_client" to="/pc_client" />} />
          <Route path="/pc-web/*" element={<LegacyRouteRedirect from="/pc-web" to="/pc_web" />} />
          <Route path="/" element={<Navigate to="/pc_client" replace />} />
          <Route path="/pc_client/*" element={webClientRoutes} />
          <Route path="/enterprise" element={<Navigate to="/pc_client/enterprise" replace />} />
          <Route path="/assistant" element={<Navigate to="/pc_client/assistant" replace />} />
          <Route path="/process" element={<Navigate to="/pc_client/process" replace />} />
          <Route path="/ekb" element={<Navigate to="/pc_client/ekb" replace />} />
          <Route path="/profile" element={<Navigate to="/pc_client/profile" replace />} />
          <Route path="/agent-square" element={<Navigate to="/pc_client/agent-square" replace />} />
          <Route path="/ruyi-zone" element={<Navigate to="/pc_client/ruyi-zone" replace />} />
          <Route path="/presentation" element={<Navigate to="/pc_client/ruyi-zone/presentation" replace />} />
          <Route path="/calendar" element={<Navigate to="/pc_client/calendar" replace />} />
          <Route path="/business" element={<Navigate to="/pc_client/business" replace />} />
          <Route path="/work-report" element={<Navigate to="/pc_client/work-report" replace />} />
          <Route path="/work-items" element={<Navigate to="/pc_client/enterprise" replace />} />
          <Route path="/okr" element={<Navigate to="/pc_client/okr" replace />} />
          <Route path="/settings" element={<Navigate to="/pc_client/settings" replace />} />
        </Routes>
        <RequirementModeLayer />
      </RequirementModeProvider>
    </Router>
  );
}
