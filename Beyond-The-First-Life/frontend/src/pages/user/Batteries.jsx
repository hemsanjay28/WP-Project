import React from "react";
import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

export default function Batteries(){
  const [b,setB]=useState([]);
  useEffect(()=>{api.get("/batteries").then(r=>setB(r.data))},[]);
  return <div className="content"><div className="page-heading"><div><span className="kicker">INVENTORY</span><h1>My Batteries</h1></div><Link className="btn" to="/app/scan">+ Scan Battery</Link></div>
    <div className="card"><table className="table"><thead><tr><th>Battery</th><th>SOH</th><th>Chemistry</th><th>Cycles</th><th>Status</th><th>Value</th><th>Passport</th></tr></thead><tbody>{b.map(x=><tr key={x.id}><td><strong>{x.id}</strong><div className="muted small">{x.voltage}V • {x.capacity}Ah</div></td><td>{x.soh}%</td><td>{x.chemistry}</td><td>{x.cycles}</td><td><span className={`pill ${x.status==="GOOD"?"good":x.status==="FAIR"?"fair":"recycle"}`}>{x.status}</span></td><td>₹{x.price.toLocaleString()}</td><td><Link className="green small" to={`/verify/${x.id}`}>View →</Link></td></tr>)}</tbody></table></div>
  </div>
}
