import React from "react";
import { useEffect, useState } from "react";
import { PlugZap, Wifi, WifiOff, RefreshCw, Battery, Clock, ArrowUpRight } from "lucide-react";
import api from "../../api";

export default function FleetIntegrations() {
  const [stats, setStats] = useState(null);
  const [msg, setMsg] = useState("");
  const [syncing, setSyncing] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/integrations/stats").then(r => { setStats(r.data); setLoading(false); }).catch(() => {
      api.get("/integrations").then(r => {
        setStats({ integrations: r.data, totalIntegrations: r.data.length, connectedCount: r.data.filter(i => i.status === "Connected").length, totalBatteriesSynced: 710, avgUptime: 99.6 });
        setLoading(false);
      });
    });
  };

  useEffect(load, []);

  async function sync(id) {
    setSyncing(id);
    setMsg("");
    const r = await api.post(`/integrations/${id}/sync`);
    setMsg(`✅ ${r.data.message} — ${r.data.records} records ingested`);
    setSyncing("");
    load();
  }

  if (loading) return <div className="content"><div className="loading-spinner" /></div>;

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <span className="kicker">FLEET DATA CONNECTIVITY</span>
          <h1>Fleet API Integrations</h1>
          <div className="muted small">Connect directly into fleet software and eliminate manual CSV friction.</div>
        </div>
        <span className="pill blue">
          <Wifi size={12} style={{ marginRight: 4 }} /> {stats.connectedCount} CONNECTED
        </span>
      </div>

      {/* Stats Row */}
      <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: 18 }}>
        <div className="card stat-card animate-in">
          <div className="stat-head"><span>Total Integrations</span><div className="stat-icon"><PlugZap size={17} /></div></div>
          <div className="stat-value">{stats.totalIntegrations}</div>
          <div className="stat-change">Fleet platforms connected</div>
        </div>
        <div className="card stat-card animate-in">
          <div className="stat-head"><span>Active Connections</span><div className="stat-icon"><Wifi size={17} /></div></div>
          <div className="stat-value">{stats.connectedCount}</div>
          <div className="stat-change">{Math.round(stats.connectedCount / stats.totalIntegrations * 100)}% online</div>
        </div>
        <div className="card stat-card animate-in">
          <div className="stat-head"><span>Batteries Synced</span><div className="stat-icon"><Battery size={17} /></div></div>
          <div className="stat-value">{stats.totalBatteriesSynced.toLocaleString()}</div>
          <div className="stat-change">Total ingested from fleets</div>
        </div>
        <div className="card stat-card animate-in">
          <div className="stat-head"><span>Avg Uptime</span><div className="stat-icon"><ArrowUpRight size={17} /></div></div>
          <div className="stat-value">{stats.avgUptime}%</div>
          <div className="stat-change">Platform reliability</div>
        </div>
      </div>

      {msg && <div className="card green" style={{ marginBottom: 14, animation: "fadeInUp .3s ease-out" }}>{msg}</div>}

      {/* Integration Cards */}
      <div className="three-col" style={{ marginTop: 0 }}>
        {stats.integrations.map((i, idx) => (
          <div className="integration-card animate-in" key={i.id} style={{ animationDelay: `${idx * 0.06}s` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h3 style={{ fontFamily: "Space Grotesk", margin: 0 }}>{i.name}</h3>
                <div className="muted small">{i.type}</div>
              </div>
              <div className={`integration-status ${i.status === "Connected" ? "" : "manual"}`}>
                <span className="status-dot" />
                {i.status}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,.02)", border: "1px solid var(--line)" }}>
                <div className="muted" style={{ fontSize: 10 }}>BATTERIES SYNCED</div>
                <strong style={{ fontFamily: "Space Grotesk", fontSize: 18 }}>{(i.batteriesSynced || 0).toLocaleString()}</strong>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: "rgba(255,255,255,.02)", border: "1px solid var(--line)" }}>
                <div className="muted" style={{ fontSize: 10 }}>UPTIME</div>
                <strong style={{ fontFamily: "Space Grotesk", fontSize: 18, color: "#41e38b" }}>{i.uptime || 100}%</strong>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="muted small" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Clock size={12} /> Last sync: {i.lastSync}
              </div>
              <button
                className="btn secondary"
                style={{ padding: "8px 14px", fontSize: 12 }}
                disabled={syncing === i.id}
                onClick={() => sync(i.id)}
              >
                {syncing === i.id ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <RefreshCw size={12} style={{ animation: "spin .8s linear infinite" }} /> Syncing...
                  </span>
                ) : (
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <PlugZap size={12} /> Sync Now
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
