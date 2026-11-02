import React from "react";
import { useEffect, useState } from "react";
import { Battery, Recycle, Users, WalletCards, ShieldCheck, ArrowUpRight } from "lucide-react";
import api from "../../api";
import StatCard from "../../components/StatCard";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DecayChart from "../../components/DecayChart";

export default function Overview() {
  const [s, setS] = useState(null);
  const [decay, setDecay] = useState([]);
  const [txns, setTxns] = useState([]);
  const [ints, setInts] = useState([]);
  const [pricing, setPricing] = useState([]);

  useEffect(() => {
    api.get("/admin/overview").then(r => setS(r.data));
    api.post("/decay/simulate-advanced", { soh: 88, chemistry: "LFP", temperature: 30, dod: 80, scenario: "normal" }).then(r => {
      setDecay(r.data.highUsage.map((x, i) => ({ year: x.year, high: x.soh, light: r.data.lightUsage[i].soh })));
    });
    api.get("/transactions").then(r => setTxns(r.data));
    api.get("/integrations").then(r => setInts(r.data));
    api.get("/pricing").then(r => setPricing(r.data));
  }, []);

  if (!s) return <div className="content"><div className="muted">Loading control center...</div></div>;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return (
    <div className="content admin-accent">
      <div className="page-heading">
        <div>
          <span className="kicker">REAL-TIME ECOSYSTEM STATISTICS</span>
          <h1>Platform Overview</h1>
        </div>
        <span className="pill blue">LIVE DB METRICS</span>
      </div>
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
        <StatCard icon={Battery} title="Total Batteries" value={s.totalBatteries.toLocaleString()} change="Current inventory" />
        <StatCard icon={Recycle} title="E-Waste Diverted" value={`${s.eWasteDiverted} Tons`} change="Total weight" />
        <StatCard icon={Users} title="Active Fleets" value={s.activeFleets} change="Connected APIs" />
        <StatCard icon={WalletCards} title="Marketplace Volume" value={`₹${s.marketplaceVolume} Crores`} change="Total value" />
        <StatCard icon={ArrowUpRight} title="Completed Transactions" value={s.completedTransactions.toLocaleString()} change="Successful trades" />
        <StatCard icon={ShieldCheck} title="ZKP Verifications" value={s.zkpVerifications.toLocaleString()} change="Total proofs" />
      </div>
      <div className="three-col">
        <Donut title="Battery Chemistry Distribution" values={[["NMC", s.chemistry.NMC], ["LFP", s.chemistry.LFP], ["Lead Acid", s.chemistry.LeadAcid]]} />
        <Donut title="Health Distribution" values={[["Good", s.health.good], ["Fair", s.health.fair], ["Recycle", s.health.recycle]]} />
        <div className="card chart-card">
          <div className="chart-title">Monthly Battery Processing</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={months.map((m, i) => ({ m, v: s.monthly[i] }))}>
              <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
              <XAxis dataKey="m" tick={{ fill: "#748094", fontSize: 10 }} />
              <YAxis tick={{ fill: "#748094", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#0b111b", border: "1px solid #263246" }} />
              <Line dataKey="v" stroke="#a67cff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="three-col">
        <TransactionsMini txns={txns} />
        <IntegrationsMini ints={ints} />
        <DecayChart data={decay} title="Battery Health Decay Simulator (Admin View)" height={245} />
      </div>
      <div className="two-col">
        <WasteChart data={months.map((m, i) => ({ m, v: s.waste[i] }))} />
        <PricingMini pricing={pricing} />
      </div>
    </div>
  );
}

function Donut({ title, values }) {
  const total = values.reduce((a, b) => a + b[1], 0);
  let start = 0;
  const colors = ["#41e38b", "#35b9ff", "#9d75ff"];
  const stops = total === 0 ? "rgba(255,255,255,.1) 0% 100%" : values.map((v, i) => {
    const end = start + v[1] / Math.max(total, 1) * 100;
    const s = `${colors[i]} ${start}% ${end}%`;
    start = end;
    return s;
  }).join(",");
  
  return (
    <div className="card chart-card">
      <div className="chart-title">{title}</div>
      <div style={{ display: "grid", placeItems: "center", marginTop: 25 }}>
        <div style={{ width: 145, height: 145, borderRadius: "50%", background: `conic-gradient(${stops})`, display: "grid", placeItems: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#0b111b", display: "grid", placeItems: "center", fontFamily: "Space Grotesk", fontWeight: 700 }}>
            {total > 0 ? "100%" : "0%"}
          </div>
        </div>
      </div>
      <div className="list" style={{ marginTop: 18 }}>
        {values.map((v, i) => (
          <div className="list-row" key={v[0]}>
            <span>{v[0]}</span><strong>{v[1]}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionsMini({ txns }) {
  return (
    <div className="card">
      <div className="chart-title">Recent Transactions</div>
      <table className="table" style={{ marginTop: 10 }}>
        <tbody>
          {(txns || []).slice(0, 4).map(x => (
            <tr key={x.id}>
              <td>{x.id}</td>
              <td>{x.buyer}</td>
              <td>₹{x.amount.toLocaleString()}</td>
              <td><span className={`pill ${x.status === "Completed" ? "good" : "fair"}`}>{x.status}</span></td>
            </tr>
          ))}
          {(!txns || txns.length === 0) && <tr><td colSpan="4" className="muted center">No transactions yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function IntegrationsMini({ ints }) {
  return (
    <div className="card">
      <div className="chart-title">Fleet Integrations (API)</div>
      <div className="list" style={{ marginTop: 10 }}>
        {(ints || []).slice(0, 4).map(x => (
          <div className="list-row" key={x.id}>
            <span>{x.name}</span>
            <span className={x.status === "Connected" ? "green small" : "muted small"}>● {x.status}</span>
          </div>
        ))}
        {(!ints || ints.length === 0) && <div className="muted center">No fleets connected</div>}
      </div>
    </div>
  );
}

function WasteChart({ data }) {
  return (
    <div className="card chart-card">
      <div className="chart-title">E-Waste Diverted (Tons)</div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,.06)" vertical={false} />
          <XAxis dataKey="m" tick={{ fill: "#748094", fontSize: 10 }} />
          <YAxis tick={{ fill: "#748094", fontSize: 10 }} />
          <Tooltip contentStyle={{ background: "#0b111b", border: "1px solid #263246" }} />
          <Bar dataKey="v" fill="#a67cff" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PricingMini({ pricing }) {
  return (
    <div className="card">
      <div className="chart-title">Real-Time Price Index</div>
      <div className="chart-sub">Last updated just now</div>
      <div className="list" style={{ marginTop: 15 }}>
        {(pricing || []).slice(0, 4).map(x => (
          <div className="list-row" key={x.name}>
            <span>{x.name}</span>
            <span>
              <strong>₹{x.value.toLocaleString()} {x.unit}</strong>{" "}
              <span className={x.change < 0 ? "red" : "green"}>{x.change >= 0 ? "+" : ""}{x.change}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
