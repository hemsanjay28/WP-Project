import React from "react";
import { useEffect,useState } from "react";
import api from "../../api";
import DecayChart from "../../components/DecayChart";
export default function Decay(){const [d,setD]=useState([]);useEffect(()=>{api.post("/decay/simulate",{soh:88}).then(r=>setD(r.data.highUsage.map((x,i)=>({year:x.year,high:x.soh,light:r.data.lightUsage[i].soh}))))},[]);return <div className="content"><div className="page-heading"><div><span className="kicker">FLEET-WIDE PREDICTION</span><h1>Decay Analytics</h1><div className="muted small">High-use vs light-use projected health across five years.</div></div></div><DecayChart data={d} height={430}/></div>}
