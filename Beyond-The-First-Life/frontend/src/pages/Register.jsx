import React from "react";
import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import api from "../api";
import { Battery } from "lucide-react";

export default function Register(){
  const [form,setForm]=useState({name:"",email:"",password:"",company:"",location:"Coimbatore"}),[error,setError]=useState("");
  const navigate=useNavigate();
  const set=(k,v)=>setForm({...form,[k]:v});
  async function submit(e){e.preventDefault();try{await api.post("/auth/register",form);navigate("/login")}catch(err){setError(err.response?.data?.message||"Registration failed")}}
  return <div className="auth-page"><div className="auth-box glass">
    <div className="logo"><div className="logo-mark"><Battery/></div><span>BEYOND THE FIRST LIFE</span></div>
    <h1 style={{marginTop:25}}>Create account</h1><p>Join the battery circular economy.</p>
    <form className="auth-form" onSubmit={submit}>
      <Field label="Full name" value={form.name} setValue={v=>set("name",v)}/>
      <Field label="Email" type="email" value={form.email} setValue={v=>set("email",v)}/>
      <Field label="Password" type="password" value={form.password} setValue={v=>set("password",v)}/>
      <Field label="Company / Fleet" value={form.company} setValue={v=>set("company",v)}/>
      <Field label="Location" value={form.location} setValue={v=>set("location",v)}/>
      {error&&<div className="red small">{error}</div>}
      <button className="btn">Create Account</button>
    </form>
    <div className="auth-footer">Already registered? <Link to="/login">Login</Link></div>
  </div></div>
}
function Field({label,type="text",value,setValue}){return <div className="form-group"><label>{label}</label><input className="input" type={type} value={value} onChange={e=>setValue(e.target.value)} required/></div>}
