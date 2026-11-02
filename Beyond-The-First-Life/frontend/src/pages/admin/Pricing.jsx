import React from "react";
import { useEffect,useState } from "react";
import api from "../../api";
export default function Pricing(){const [p,setP]=useState([]);useEffect(()=>{api.get("/pricing").then(r=>setP(r.data))},[]);return <div className="content"><div className="page-heading"><div><span className="kicker">MARKET VALUATION</span><h1>Price Index</h1></div></div><div className="dashboard-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>{(p || []).map(x=><div className="card stat-card" key={x.name}><div className="muted small">{x.name}</div><div className="stat-value">₹{x.value.toLocaleString()}</div><div className={x.change>=0?"stat-change":"red small"}>{x.change>=0?"+":""}{x.change}%</div><div className="muted small">{x.unit}</div></div>)}</div></div>}
