import React from "react";
import { useEffect,useState } from "react";
import api from "../../api";

export default function Marketplace(){
  const [items,setItems]=useState([]),[msg,setMsg]=useState("");
  useEffect(()=>{api.get("/marketplace").then(r=>setItems(r.data))},[]);
  async function offer(x){const r=await api.post(`/marketplace/${x.id}/offer`,{amount:x.offer});setMsg(`Offer submitted: ${r.data.id} • ₹${r.data.amount.toLocaleString()}`)}
  return <div className="content"><div className="page-heading"><div><span className="kicker">SECOND-LIFE MARKETPLACE</span><h1>Marketplace</h1><div className="muted small">Buyer demand, matched applications and residual offers.</div></div></div>{msg&&<div className="card green" style={{marginBottom:14}}>{msg}</div>}<div className="three-col">{items.map(x=><div className="card" key={x.id}><div style={{display:"flex",justifyContent:"space-between"}}><span className="pill good">{x.status}</span><span className="match-score">{x.match}% match</span></div><h3 style={{fontFamily:"Space Grotesk"}}>{x.application}</h3><p className="muted small">{x.batteryId} • {x.buyer} • {x.distance} km</p><div className="progress" style={{marginTop:18}}><div style={{width:`${x.match}%`}}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:18}}><span className="muted">{x.demand} demand</span><strong>₹{x.offer.toLocaleString()}</strong></div><button className="btn" style={{width:"100%",marginTop:18}} onClick={()=>offer(x)}>Make Offer</button></div>)}</div></div>
}
