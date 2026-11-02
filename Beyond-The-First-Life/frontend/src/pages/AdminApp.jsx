import React from "react";
import { Routes,Route,useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Overview from "./admin/Overview";
import Integrations from "./admin/Integrations";
import AdminBatteries from "./admin/Batteries";
import Users from "./admin/Users";
import AdminDecay from "./admin/Decay";
import AdminMarketplace from "./admin/Marketplace";
import AdminTransactions from "./admin/Transactions";
import AdminZKP from "./admin/ZKP";
import AdminPricing from "./admin/Pricing";
import AdminMatchmaker from "./admin/Simple"; // Reused Simple for Matchmaker

export default function AdminApp(){
 const loc=useLocation();
 return <div className="app-shell"><Sidebar admin/><main className="main"><Topbar admin title={loc.pathname==="/admin"?"Control Center":""}/><Routes>
  <Route path="/" element={<Overview/>}/>
  <Route path="/integrations" element={<Integrations/>}/>
  <Route path="/batteries" element={<AdminBatteries/>}/>
  <Route path="/users" element={<Users/>}/>
  <Route path="/matchmaker" element={<AdminMatchmaker/>}/>
  <Route path="/decay" element={<AdminDecay/>}/>
  <Route path="/marketplace" element={<AdminMarketplace/>}/>
  <Route path="/transactions" element={<AdminTransactions/>}/>
  <Route path="/zkp" element={<AdminZKP/>}/>
  <Route path="/pricing" element={<AdminPricing/>}/>
  <Route path="/reports" element={<div className="content"><div className="card">Reports under construction for hackathon</div></div>}/>
  <Route path="/settings" element={<div className="content"><div className="card">Settings under construction for hackathon</div></div>}/>
 </Routes></main></div>
}
