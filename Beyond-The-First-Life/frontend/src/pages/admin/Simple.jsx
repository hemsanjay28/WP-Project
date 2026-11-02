import React from "react";
import { useEffect, useState } from "react";
import { GitCompareArrows, BarChart3, Target, CheckCircle2, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import api from "../../api";
import StatCard from "../../components/StatCard";

const colors = ["#41e38b", "#35b9ff", "#9d75ff", "#f5b94c", "#ff5e63", "#aab4c4"];

export default function AdminMatchmaker() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/matchmaker-analytics").then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="content"><div className="loading-spinner" /></div>;
  if (!data) return <div className="content"><div className="muted">Failed to load analytics.</div></div>;

  return (
    <div className="content admin-accent">
      <div className="page-heading">
        <div>
          <span className="kicker">ALGORITHMIC MATCHING</span>
          <h1>Matchmaker Engine Analytics</h1>
          <div className="muted small">Monitor application recommendations, buyer demand and matching confidence across the network.</div>
        </div>
        <span className="pill blue">LIVE</span>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 14 }}>
        <StatCard icon={GitCompareArrows} title="Total Matches Made" value={data.totalMatches.toLocaleString()} change="+14.2%" />
        <StatCard icon={Target} title="Avg Match Score" value={`${data.avgMatchScore}%`} change="Confidence rating" />
        <StatCard icon={CheckCircle2} title="Conversion Rate" value={`${data.conversionRate}%`} change="Offer accepted rate" />
        <StatCard icon={DollarSign} title="Total Value Unlocked" value={`₹${(data.totalRevenue / 10000000).toFixed(2)}Cr`} change="+22.4%" />
      </div>

      <div className="two-col">
        {/* Top Applications Chart */}
        <div className="card chart-card" style={{ animation: "fadeInUp .5s ease-out .1s both" }}>
          <div className="chart-head">
            <div>
              <div className="chart-title" style={{ fontFamily: "Space Grotesk", fontSize: 16 }}>Top Applications by Volume</div>
              <div className="chart-sub">Where are retired batteries going?</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.applications} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid stroke="rgba(255,255,255,.05)" horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fill: "#748094", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fill: "#b0bac8", fontSize: 11 }} width={140} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(166,124,255,.05)" }}
                contentStyle={{ background: "#0b111b", border: "1px solid rgba(166,124,255,.2)", borderRadius: 10 }}
              />
              <Bar dataKey="totalMatched" radius={[0, 4, 4, 0]} barSize={20}>
                {data.applications.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application Stats Table */}
        <div className="card" style={{ animation: "fadeInUp .5s ease-out .2s both" }}>
          <div className="chart-head">
            <div className="chart-title" style={{ fontFamily: "Space Grotesk", fontSize: 16 }}>Application Metrics</div>
          </div>
          <table className="table" style={{ marginTop: 10 }}>
            <thead>
              <tr>
                <th>Application</th>
                <th>Demand</th>
                <th>Avg Score</th>
                <th>MoM Growth</th>
              </tr>
            </thead>
            <tbody>
              {data.applications.map(a => (
                <tr key={a.name}>
                  <td><strong>{a.name}</strong></td>
                  <td>
                    <span className={`pill ${a.demand === "High" ? "good" : a.demand === "Medium" ? "fair" : "recycle"}`}>
                      {a.demand}
                    </span>
                  </td>
                  <td>{a.avgScore}%</td>
                  <td className="green">+{a.growth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="three-col" style={{ marginTop: 14 }}>
        {/* Demand Heatmap */}
        <div className="card" style={{ animation: "fadeInUp .5s ease-out .3s both" }}>
          <div className="chart-title" style={{ fontFamily: "Space Grotesk" }}>Regional Demand Heatmap</div>
          <div className="muted small" style={{ marginBottom: 14 }}>Aggregated buyer intent across regions</div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, fontSize: 10, color: "#748094", fontWeight: 700, paddingBottom: 8, borderBottom: "1px solid var(--line)", marginBottom: 8 }}>
            <div>REGION</div>
            <div style={{ width: 45, textAlign: "center" }}>SOLAR</div>
            <div style={{ width: 45, textAlign: "center" }}>TOWER</div>
            <div style={{ width: 45, textAlign: "center" }}>AGRI</div>
          </div>
          
          <div className="list">
            {data.demandHeatmap.map(h => (
              <div key={h.region} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, alignItems: "center", padding: "6px 0" }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{h.region}</div>
                <div className="heatmap-cell" style={{ width: 45, background: `rgba(65,227,139,${h.solar/100})`, color: h.solar > 60 ? "#000" : "#fff" }}>{h.solar}</div>
                <div className="heatmap-cell" style={{ width: 45, background: `rgba(53,185,255,${h.telecom/100})`, color: h.telecom > 60 ? "#000" : "#fff" }}>{h.telecom}</div>
                <div className="heatmap-cell" style={{ width: 45, background: `rgba(245,185,76,${h.agri/100})`, color: h.agri > 60 ? "#000" : "#fff" }}>{h.agri}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Buyers */}
        <div className="card" style={{ animation: "fadeInUp .5s ease-out .4s both" }}>
          <div className="chart-title" style={{ fontFamily: "Space Grotesk" }}>Top Corporate Buyers</div>
          <div className="muted small" style={{ marginBottom: 14 }}>Highest volume acquirers</div>
          <div className="list">
            {data.topBuyers.map(b => (
              <div className="list-row" key={b.name}>
                <div>
                  <strong>{b.name}</strong>
                  <div className="muted small">{b.purchases} batteries acquired</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="green" style={{ fontWeight: 700 }}>₹{(b.totalSpent / 100000).toFixed(1)}L</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithm Factors */}
        <div className="card" style={{ animation: "fadeInUp .5s ease-out .5s both", background: "linear-gradient(145deg, #0f1724, #0b111b)" }}>
          <div className="chart-title" style={{ fontFamily: "Space Grotesk" }}>Matching Algorithm</div>
          <div className="muted small" style={{ marginBottom: 16 }}>Key decision weights used for recommendations</div>
          
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span>Remaining SOH vs Application Req.</span>
                <strong style={{ color: "#a67cff" }}>35%</strong>
              </div>
              <div className="progress"><div style={{ width: "35%", background: "#a67cff" }} /></div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span>Chemistry Fit (NMC/LFP)</span>
                <strong style={{ color: "#35b9ff" }}>25%</strong>
              </div>
              <div className="progress"><div style={{ width: "25%", background: "#35b9ff" }} /></div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span>Logistics Distance (Km)</span>
                <strong style={{ color: "#41e38b" }}>20%</strong>
              </div>
              <div className="progress"><div style={{ width: "20%", background: "#41e38b" }} /></div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                <span>Buyer Price Offer vs Market Index</span>
                <strong style={{ color: "#f5b94c" }}>20%</strong>
              </div>
              <div className="progress"><div style={{ width: "20%", background: "#f5b94c" }} /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
