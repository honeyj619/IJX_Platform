import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import MobileDevicePrompt from "@/components/MobileDevicePrompt";
import Home from "@/pages/Home";
import Personal_Enterprise from "@/pages/Personal_Enterprise";
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

  if (isMobile) {
    return <MobileDevicePrompt />;
  }

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/enterprise" element={<Personal_Enterprise />} />
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
