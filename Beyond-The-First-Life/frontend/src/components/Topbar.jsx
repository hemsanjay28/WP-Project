import React from "react";
import { Bell, UserCircle } from "lucide-react";
import { useAuth } from "../auth";

export default function Topbar({admin=false,title=""}) {
  const {user} = useAuth();
  return (
    <header className="topbar">
      <div>
        <span className="muted small">{admin ? "PLATFORM CONTROL CENTER" : "BATTERY OPERATIONS"}</span>
        {title && <strong style={{display:"block",fontFamily:"Space Grotesk"}}>{title}</strong>}
      </div>
      <div className="topbar-actions">
        <button className="btn secondary" style={{padding:"9px"}}><Bell size={17}/></button>
        <div className="avatar"><UserCircle size={20}/></div>
        <span className="muted small">{user?.name}</span>
      </div>
    </header>
  );
}
