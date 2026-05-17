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

function shouldShowMobileView(width: number, height: number): boolean {
  // 判断逻辑：
  // 1. 折叠屏展开（宽度 >= 600px）→ 桌面模式
  // 2. 手机横屏（宽度 >= 800px 且 宽高比 > 1.3）→ 移动模式
  // 3. 普通手机 → 移动模式
  
  const aspectRatio = width / height;
  const isLandscape = aspectRatio > 1.3;
  
  // 如果是横屏模式，需要更严格的判断
  if (isLandscape) {
    // 手机横屏：宽度通常 < 850px
    // 折叠屏展开横屏：宽度通常 >= 850px
    if (width < 850) {
      return true; // 手机横屏 → 移动模式
    }
    // 宽度 >= 850px，可能是折叠屏展开横屏 → 桌面模式
    return false;
  }
  
  // 竖屏模式
  // 折叠屏展开：宽度 >= 600px
  // 普通手机：宽度 < 600px
  if (width >= 600) {
    return false; // 折叠屏展开 → 桌面模式
  }
  
  return true; // 普通手机 → 移动模式
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
      
      // 打印详细的检测信息，方便调试
      let reason = '';
      if (isLandscape) {
        reason = width < 850 ? '手机横屏' : '折叠屏/平板横屏';
      } else {
        reason = width >= 600 ? '折叠屏展开' : '手机竖屏';
      }
      
      const mode = shouldMobile ? '移动端模式 ❌' : '桌面端模式 ✅';
      console.log(`🔍 设备检测: ${width}x${height} (比例: ${aspectRatio.toFixed(2)}, ${isLandscape ? '横屏' : '竖屏'})`);
      console.log(`📱 判定: ${reason} → ${mode}`);
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
