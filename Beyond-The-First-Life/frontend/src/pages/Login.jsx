import React from "react";
import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../auth";
import { Battery } from "lucide-react";

export default function Login(){
  const [email,setEmail]=useState("dealer@beyondlife.demo"),[password,setPassword]=useState("demo123"),[error,setError]=useState("");
  const {login}=useAuth(); const navigate=useNavigate();
  async function submit(e){e.preventDefault();setError("");try{const {data}=await api.post("/auth/login",{email,password});login(data);navigate(data.user.role==="admin"?"/admin":"/app")}catch(err){setError(err.response?.data?.message||"Login failed")}}
  return <Auth title="Welcome back" subtitle="Access your battery intelligence workspace.">
    <form className="auth-form" onSubmit={submit}>
      <Field label="Email" type="email" value={email} setValue={setEmail}/>
      <Field label="Password" type="password" value={password} setValue={setPassword}/>
      {error&&<div className="red small">{error}</div>}
      <button className="btn">Sign In</button>
    </form>
    <div className="auth-footer">New to the platform? <Link to="/register">Create account</Link></div>
    <div className="card small muted" style={{marginTop:18}}>Demo User: dealer@beyondlife.demo / demo123<br/>Demo Admin: admin@beyondlife.demo / admin123</div>
  </Auth>
}
function Field({label,type="text",value,setValue}){return <div className="form-group"><label>{label}</label><input className="input" type={type} value={value} onChange={e=>setValue(e.target.value)} required/></div>}
function Auth({title,subtitle,children}){return <div className="auth-page"><div className="auth-box glass"><div className="logo"><div className="logo-mark"><Battery/></div><span>BEYOND THE FIRST LIFE</span></div><h1 style={{marginTop:25}}>{title}</h1><p>{subtitle}</p>{children}</div></div>}
