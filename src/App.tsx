import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import MobileDevicePrompt from "@/components/MobileDevicePrompt";
import Home from "@/pages/Home";
import Enterprise from "@/pages/Enterprise";
import Assistant from "@/pages/Assistant";
import Process from "@/pages/Process";
import Knowledge from "@/pages/Knowledge";
import Profile from "@/pages/Profile";
import RuYiZone from "@/pages/RuYiZone";
import AgentSquarePage from "@/pages/AgentSquarePage";
import EKB from "@/pages/EKB";
import Calendar from "@/pages/Calendar";
import Business from "@/pages/Business";
import SettingsPage from "@/pages/SettingsPage";
import Admin from "@/pages/Admin";

const MOBILE_BREAKPOINT = 768;

function shouldShowMobileView(width: number, height: number): boolean {
  // 如果宽度足够，直接显示桌面视图
  if (width >= MOBILE_BREAKPOINT) {
    return false;
  }
  
  // 如果宽度小于 768 但高度较大（> 1000），可能是折叠屏展开状态
  // 这种情况下也允许显示桌面视图
  if (height > 1000 && width >= 600) {
    return false;
  }
  
  // 宽度小于 768 且高度也不大，这才是真正的手机
  return true;
}

export default function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      
      const shouldMobile = shouldShowMobileView(width, height);
      setIsMobile(shouldMobile);
      
      // 打印详细的检测信息
      console.log(`🔍 设备检测: ${width}x${height} (DPR: ${dpr})`);
      console.log(`📱 ${shouldMobile ? '移动端模式' : '桌面端模式'}`);
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

  if (isMobile) {
    return <MobileDevicePrompt />;
  }

  return (
    <Router basename="/IJX_Platform/">
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/process" element={<Process />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/ekb" element={<EKB />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/agent-square" element={<AgentSquarePage />} />
          <Route path="/ruyi-zone" element={<RuYiZone />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/business" element={<Business />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}
