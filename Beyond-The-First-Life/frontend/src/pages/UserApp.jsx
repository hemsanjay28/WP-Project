import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import UserDashboard from "./user/Dashboard";
import Batteries from "./user/Batteries";
import Scan from "./user/Scan";
import Matchmaker from "./user/Matchmaker";
import Decay from "./user/Decay";
import Marketplace from "./user/Marketplace";
import Transactions from "./user/Transactions";
import ZKP from "./user/ZKP";
import Pricing from "./user/Pricing";
import Profile from "./user/Profile";
import Settings from "./user/Settings";
import FleetIntegrations from "./user/FleetIntegrations";

export default function UserApp() {
  const loc = useLocation();
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Topbar title={loc.pathname === "/app" ? "Dashboard" : ""} />
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/batteries" element={<Batteries />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/fleet" element={<FleetIntegrations />} />
          <Route path="/matchmaker" element={<Matchmaker />} />
          <Route path="/decay" element={<Decay />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/zkp" element={<ZKP />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
