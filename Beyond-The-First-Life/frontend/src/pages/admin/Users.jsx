import React from "react";
import { useEffect,useState } from "react";
import api from "../../api";
export default function Users(){const [u,setU]=useState([]);useEffect(()=>{api.get("/admin/users").then(r=>setU(r.data))},[]);return <div className="content"><div className="page-heading"><div><span className="kicker">ECOSYSTEM MEMBERS</span><h1>Users / Fleets</h1></div></div><div className="card"><table className="table"><thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Location</th><th>Role</th></tr></thead><tbody>{(u || []).map(x=><tr key={x.id}><td>{x.name}</td><td>{x.company}</td><td>{x.email}</td><td>{x.location}</td><td><span className="pill blue">{x.role}</span></td></tr>)}</tbody></table></div></div>}
