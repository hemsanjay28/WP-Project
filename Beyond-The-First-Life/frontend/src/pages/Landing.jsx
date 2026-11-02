import React from "react";
import { Link } from "react-router-dom";
import { Battery, ShieldCheck, Zap, Recycle, ArrowRight, PlugZap, LineChart, CircleDollarSign } from "lucide-react";
import FeatureBand from "../components/FeatureBand";

export default function Landing(){
  return <div className="page">
    <nav className="landing-nav container">
      <div className="logo"><div className="logo-mark"><Battery/></div><span>BEYOND THE FIRST LIFE</span></div>
      <div className="navlinks"><a href="#about">About</a><a href="#how">How it works</a><a href="#features">Features</a></div>
      <div style={{display:"flex",gap:8}}><Link className="btn secondary" to="/login">Login</Link><Link className="btn" to="/register">Get Started</Link></div>
    </nav>

    <main>
      <section className="container hero">
        <div>
          <span className="badge">♻️ EV Battery Circular Intelligence Platform</span>
          <h1>Give every battery a <span className="green">second life.</span></h1>
          <p>Beyond The First Life turns retired EV batteries into verified, priced and matched assets — connecting fleet operators, scrap dealers, recyclers and second-life buyers.</p>
          <div className="hero-actions"><Link className="btn" to="/register">Start Processing <ArrowRight size={16} style={{verticalAlign:"middle"}}/></Link><a className="btn secondary" href="#features">Explore Platform</a></div>
          <div style={{display:"flex",gap:22,marginTop:35,color:"#8f9bad",fontSize:12}}><span><PlugZap size={15} className="green"/> Fleet APIs</span><span><ShieldCheck size={15} className="cyan"/> ZKP Privacy</span><span><LineChart size={15} className="purple"/> 5Y Forecast</span><span><CircleDollarSign size={15} className="yellow"/> Live Pricing</span></div>
        </div>
        <div className="hero-visual">
          <div className="battery-visual">
            <div style={{display:"flex",justifyContent:"space-between",color:"#8793a6",fontSize:12}}><Battery/><span>VERIFIED BATTERY</span></div>
            <div className="big-soh">82%</div>
            <div className="center muted">State of Health</div>
            <div className="progress" style={{marginTop:28}}><div style={{width:"82%"}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,fontSize:12}}><span className="green">GOOD</span><span className="muted">NMC • 48V • 42Ah</span></div>
            <div className="card" style={{marginTop:35,padding:13}}><div className="small muted">Recommended second life</div><strong>Residential Solar Backup</strong><div className="green small" style={{marginTop:4}}>92% Match Score</div></div>
          </div>
        </div>
      </section>

      <section className="stats-strip"><div className="container stats-grid">
        <div><strong style={{fontSize:30,fontFamily:"Space Grotesk"}}>12,450+</strong><div className="muted small">Batteries Processed</div></div>
        <div><strong style={{fontSize:30,fontFamily:"Space Grotesk"}}>560T</strong><div className="muted small">E-Waste Diverted</div></div>
        <div><strong style={{fontSize:30,fontFamily:"Space Grotesk"}}>220+</strong><div className="muted small">Active Fleets</div></div>
        <div><strong style={{fontSize:30,fontFamily:"Space Grotesk"}}>₹2.48Cr</strong><div className="muted small">Marketplace Volume</div></div>
      </div></section>

      <section id="how" className="landing-section"><div className="container">
        <div className="center"><span className="kicker">HOW IT WORKS</span><h2 style={{fontFamily:"Space Grotesk",fontSize:38}}>From retired battery to verified asset.</h2></div>
        <div className="feature-grid">
          <Feature icon={<Battery/>} title="1. Ingest" text="Connect fleet APIs or run a one-click battery diagnostic scan."/>
          <Feature icon={<ShieldCheck/>} title="2. Verify" text="Create a health passport and privacy-preserving ZKP proof."/>
          <Feature icon={<Zap/>} title="3. Match" text="Recommend the best second-life application based on battery health."/>
          <Feature icon={<Recycle/>} title="4. Recover" text="Route batteries to reuse, resale or raw-material recovery."/>
        </div>
      </div></section>

      <section id="about" className="landing-section" style={{background:"rgba(255,255,255,.015)"}}><div className="container center" style={{maxWidth:900}}>
        <span className="kicker">ABOUT THE PLATFORM</span>
        <h2 style={{fontFamily:"Space Grotesk",fontSize:38}}>The operating layer for EV battery second-life.</h2>
        <p className="muted" style={{fontSize:17,lineHeight:1.8}}>We help grassroots operators and enterprise fleets understand what a retired battery is worth, where it can go next, and how to prove its health without exposing sensitive operational data.</p>
      </div></section>

      <section id="features"><FeatureBand/></section>
    </main>
  </div>
}
function Feature({icon,title,text}){return <div className="card"><div className="feature-icon">{icon}</div><h3 style={{fontFamily:"Space Grotesk"}}>{title}</h3><p className="muted" style={{lineHeight:1.6}}>{text}</p></div>}
