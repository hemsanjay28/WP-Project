import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Battery, Upload, GitCompareArrows, LineChart,
  Store, ReceiptText, ShieldCheck, CircleDollarSign, UserRound,
  Settings, LogOut, PlugZap, Users, BarChart3, FileText, Activity
} from "lucide-react";
import { useAuth } from "../auth";

const userItems = [
  ["Dashboard","/app",LayoutDashboard],
  ["My Batteries","/app/batteries",Battery],
  ["Upload / Scan","/app/scan",Upload],
  ["Fleet Integrations","/app/fleet",PlugZap],
  ["Matchmaker","/app/matchmaker",GitCompareArrows],
  ["Decay Simulator","/app/decay",LineChart],
  ["Marketplace","/app/marketplace",Store],
  ["Transactions","/app/transactions",ReceiptText],
  ["ZKP Verification","/app/zkp",ShieldCheck],
  ["Price Index","/app/pricing",CircleDollarSign],
  ["Profile","/app/profile",UserRound],
  ["Settings","/app/settings",Settings]
];

const adminItems = [
  ["Overview","/admin",LayoutDashboard],
  ["Fleet Integrations","/admin/integrations",PlugZap],
  ["All Batteries","/admin/batteries",Battery],
  ["Users / Fleets","/admin/users",Users],
  ["Matchmaker Engine","/admin/matchmaker",GitCompareArrows],
  ["Decay Analytics","/admin/decay",LineChart],
  ["Marketplace","/admin/marketplace",Store],
  ["Transactions","/admin/transactions",ReceiptText],
  ["ZKP Verifications","/admin/zkp",ShieldCheck],
  ["Price Index","/admin/pricing",CircleDollarSign],
  ["Reports","/admin/reports",FileText],
  ["Settings","/admin/settings",Settings]
];

export default function Sidebar({admin=false}) {
  const {logout} = useAuth();
  const items = admin ? adminItems : userItems;
  return (
    <aside className={`sidebar ${admin ? "admin-accent" : ""}`}>
      <div className="sidebar-brand">
        <div className="logo">
          <div className="logo-mark"><Battery size={21}/></div>
          <span className="brand-text">BEYOND<br/>THE FIRST LIFE</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {items.map(([label,to,Icon])=>(
          <NavLink key={to} to={to} end={to===`/${admin?"admin":"app"}`} className={({isActive})=>`nav-item ${isActive?"active":""}`}>
            <Icon size={17}/><span className="nav-text">{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={logout} style={{width:"100%",background:"transparent"}}><LogOut size={17}/><span className="nav-text">Logout</span></button>
      </div>
    </aside>
  );
}
