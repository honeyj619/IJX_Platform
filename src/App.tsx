import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}
