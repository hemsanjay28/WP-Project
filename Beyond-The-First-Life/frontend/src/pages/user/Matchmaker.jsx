import React from "react";
import { useEffect,useState } from "react";
import api from "../../api";

export default function Matchmaker(){
  const [b,setB]=useState([]),[selected,setSelected]=useState(""),[matches,setMatches]=useState([]);
  useEffect(()=>{api.get("/batteries").then(r=>{setB(r.data);if(r.data[0])setSelected(r.data[0].id)})},[]);
  useEffect(()=>{if(selected)api.get(`/matchmaking/${selected}`).then(r=>setMatches(r.data.matches))},[selected]);
  return <div className="content"><div className="page-heading"><div><span className="kicker">SECOND-LIFE INTELLIGENCE</span><h1>Matchmaker</h1><div className="muted small">Turn battery health metrics into buyer value.</div></div></div>
    <div className="card"><div className="form-group"><label>Select battery</label><select className="input" value={selected} onChange={e=>setSelected(e.target.value)}>{b.map(x=><option key={x.id} value={x.id}>{x.id} — {x.soh}% SOH — {x.status}</option>)}</select></div></div>
    <div className="three-col">{matches.map(m=><div className="card" key={m.id}><div className="kicker">MATCH {m.match}%</div><h3 style={{fontFamily:"Space Grotesk"}}>{m.application}</h3><p className="muted small">{m.buyer} • {m.distance} km away</p><div style={{display:"flex",justifyContent:"space-between",marginTop:20}}><span className="green">{m.demand} Demand</span><strong>₹{m.offer.toLocaleString()}</strong></div><button className="btn" style={{marginTop:18,width:"100%"}}>Recommended</button></div>)}</div>
  </div>
}
