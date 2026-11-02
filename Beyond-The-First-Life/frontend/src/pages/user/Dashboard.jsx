import React from "react";
import { useEffect, useState } from "react";
import { Battery, CheckCircle2, AlertTriangle, Recycle, WalletCards, Eye, PlugZap, ShieldCheck, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";
import StatCard from "../../components/StatCard";
import DecayChart from "../../components/DecayChart";
import { useAuth } from "../../auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [b, setB] = useState([]);
  const [decay, setDecay] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    api.get("/batteries").then(r => setB(r.data));
    api.post("/decay/simulate", { soh: 82 }).then(r =>
      setDecay(r.data.highUsage.map((x, i) => ({
        year: x.year, high: x.soh, light: r.data.lightUsage[i].soh
      })))
    );
    api.get("/activity").then(r => setActivity(r.data));
  }, []);

  const good = b.filter(x => x.status === "GOOD").length;
  const fair = b.filter(x => x.status === "FAIR").length;
  const recycle = b.filter(x => x.status === "RECYCLE").length;
  const totalValue = b.reduce((s, x) => s + (x.price || 0), 0);

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <span className="kicker">BATTERY OPERATIONS</span>
          <h1>Dashboard</h1>
          <div className="muted small">Welcome back, {user?.name || "GreenFleet Co."}</div>
        </div>
        <Link className="btn" to="/app/scan">＋ Upload Battery Log</Link>
      </div>

      <div className="dashboard-grid">
        <StatCard icon={Battery} title="Total Batteries" value={b.length || 128} change="+12 this month" />
        <StatCard icon={CheckCircle2} title="Good (≥75%)" value={good || 48} change={`${b.length ? Math.round(good / b.length * 100) : 37.5}%`} />
        <StatCard icon={AlertTriangle} title="Fair (40-74%)" value={fair || 56} change={`${b.length ? Math.round(fair / b.length * 100) : 43.8}%`} tone="yellow" />
        <StatCard icon={Recycle} title="Recycle (<40%)" value={recycle || 24} change={`${b.length ? Math.round(recycle / b.length * 100) : 18.7}%`} tone="red" />
        <StatCard icon={WalletCards} title="Est. Total Value" value={`₹${totalValue ? totalValue.toLocaleString() : "18,64,200"}`} change="+8.2% vs last month" />
      </div>

      <div className="two-col">
        <DecayChart data={decay} />
        <Recent batteries={b} />
      </div>

      <div className="two-col">
        <Matches />
        <Activity items={activity} />
      </div>

      {/* Quick Actions */}
      <div className="four-col" style={{ marginTop: 14 }}>
        <Link to="/app/fleet" className="card" style={{ textDecoration: "none", textAlign: "center", padding: 20 }}>
          <PlugZap size={24} style={{ color: "#41e38b", marginBottom: 8 }} />
          <div style={{ fontWeight: 600 }}>Fleet Integrations</div>
          <div className="muted small">Connect fleet APIs</div>
        </Link>
        <Link to="/app/matchmaker" className="card" style={{ textDecoration: "none", textAlign: "center", padding: 20 }}>
          <TrendingUp size={24} style={{ color: "#35b9ff", marginBottom: 8 }} />
          <div style={{ fontWeight: 600 }}>Matchmaker</div>
          <div className="muted small">Find second-life matches</div>
        </Link>
        <Link to="/app/zkp" className="card" style={{ textDecoration: "none", textAlign: "center", padding: 20 }}>
          <ShieldCheck size={24} style={{ color: "#9d75ff", marginBottom: 8 }} />
          <div style={{ fontWeight: 600 }}>ZKP Verification</div>
          <div className="muted small">Privacy-preserving proofs</div>
        </Link>
        <Link to="/app/pricing" className="card" style={{ textDecoration: "none", textAlign: "center", padding: 20 }}>
          <WalletCards size={24} style={{ color: "#f5b94c", marginBottom: 8 }} />
          <div style={{ fontWeight: 600 }}>Price Index</div>
          <div className="muted small">Live commodity pricing</div>
        </Link>
      </div>
    </div>
  );
}

function Recent({ batteries }) {
  return (
    <div className="card" style={{ animation: "fadeInUp .5s ease-out .1s both" }}>
      <div className="chart-head">
        <div>
          <div className="chart-title">Recent Batteries</div>
          <div className="chart-sub">Latest diagnostic records</div>
        </div>
        <Link className="muted small" to="/app/batteries">View All →</Link>
      </div>
      <table className="table">
        <thead><tr><th>ID</th><th>SOH</th><th>Status</th><th>Chemistry</th><th>Value</th><th /></tr></thead>
        <tbody>
          {batteries.slice(0, 5).map(b => (
            <tr key={b.id}>
              <td><strong>{b.id}</strong></td>
              <td>{b.soh}%</td>
              <td><span className={`pill ${b.status === "GOOD" ? "good" : b.status === "FAIR" ? "fair" : "recycle"}`}>{b.status}</span></td>
              <td>{b.chemistry}</td>
              <td>₹{b.price.toLocaleString()}</td>
              <td><Link to={`/verify/${b.id}`}><Eye size={15} /></Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Matches() {
  return (
    <div className="card" style={{ animation: "fadeInUp .5s ease-out .15s both" }}>
      <div className="chart-title">Top Matched Applications</div>
      <div className="chart-sub">Recommended second-life demand</div>
      <div className="list" style={{ marginTop: 14 }}>
        {[
          ["Residential Solar Backup", "High Demand", 92],
          ["Telecom Tower Backup", "High Demand", 87],
          ["Agricultural Pumps", "Medium Demand", 81],
          ["UPS Backup Systems", "Medium Demand", 76]
        ].map(x => (
          <div className="list-row" key={x[0]}>
            <div>
              <strong>{x[0]}</strong>
              <div className="small muted">{x[1]}</div>
            </div>
            <span className="match-score">{x[2]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Activity({ items }) {
  return (
    <div className="card" style={{ animation: "fadeInUp .5s ease-out .2s both" }}>
      <div className="chart-title">Live Activity</div>
      <div className="list" style={{ marginTop: 10 }}>
        {(items || []).slice(0, 5).map(x => (
          <div className="activity-row" key={x.id}>
            <div className="dot" />
            <div>
              <div className="small">{x.text}</div>
              <div className="muted" style={{ fontSize: 10 }}>{x.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
