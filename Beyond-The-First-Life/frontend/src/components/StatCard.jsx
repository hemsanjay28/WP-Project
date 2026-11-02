import React from "react";
export default function StatCard({icon:Icon,title,value,change,tone=""}) {
  return (
    <div className="card stat-card">
      <div className="stat-head">
        <span>{title}</span>
        <div className={`stat-icon ${tone}`}>{Icon && <Icon size={17}/>}</div>
      </div>
      <div className="stat-value">{value}</div>
      {change && <div className="stat-change">{change}</div>}
    </div>
  );
}
