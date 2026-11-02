import React from "react";
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import { ShieldCheck, ArrowLeft, Activity, Target } from "lucide-react";
import DecayChart from "../components/DecayChart";

export default function Verify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [b, setB] = useState(null);
  const [error, setError] = useState("");
  const [decayData, setDecayData] = useState([]);

  useEffect(() => {
    api.get(`/batteries/${id}`).then(r => {
      setB(r.data);
      // Fetch 5-year decay simulation for this battery
      api.post("/decay/simulate-advanced", { 
        soh: r.data.soh, 
        chemistry: r.data.chemistry,
        temperature: 30,
        dod: 80,
        scenario: "normal"
      }).then(res => {
        setDecayData(res.data.highUsage.map((x, i) => ({
          year: x.year,
          high: x.soh,
          light: res.data.lightUsage[i].soh
        })));
      });
    }).catch(e => setError(e.response?.data?.message || "Battery not found"));
  }, [id]);

  if (error) return <div className="verify"><div className="card">{error}<div style={{ marginTop: 15 }}><button onClick={() => navigate(-1)} className="btn">Back</button></div></div></div>;
  if (!b) return <div className="verify"><div className="muted">Loading passport...</div></div>;

  const getRecommendations = (soh) => {
    if (soh >= 75) return ["Residential Solar Backup", "EV Charging Station Storage", "Telecom Tower Backup"];
    if (soh >= 40) return ["Agricultural Water Pumps", "Forklifts & Carts", "Small UPS Systems"];
    return ["Black Mass Material Recovery (Lithium/Cobalt/Nickel Extraction)"];
  };

  const recs = getRecommendations(b.soh);

  return (
    <div style={{ padding: 25, maxWidth: 1400, margin: "auto" }}>
      <button onClick={() => navigate(-1)} style={{ display: "inline-flex", gap: 7, alignItems: "center", marginBottom: 20, color: "#41e38b", background: "none", border: "none" }}>
        <ArrowLeft size={15} /> Back to platform
      </button>

      <div className="page-heading">
        <div>
          <span className="kicker">VERIFIED BATTERY PASSPORT</span>
          <h1>Battery {b.id}</h1>
          <div className="muted small">Digital identity • 5-Year Lifecycle Projection • Second-life readiness</div>
        </div>
        <ShieldCheck className="green" size={36} />
      </div>

      <div className="two-col" style={{ gridTemplateColumns: "1.2fr 0.8fr", gap: 20 }}>
        {/* Left Side: 5 Year Chart & Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <DecayChart 
            data={decayData} 
            title="5-Year Health Decay Projection" 
            subtitle={`Starting SOH: ${b.soh}% • Chemistry: ${b.chemistry}`} 
            height={320}
          />
          <div className="card glass">
            <div className="chart-title" style={{ marginBottom: 12 }}>Technical Specifications</div>
            <div className="passport-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              <P label="State of Health" value={`${b.soh}%`} />
              <P label="Chemistry" value={b.chemistry} />
              <P label="Voltage" value={`${b.voltage}V`} />
              <P label="Capacity" value={`${b.capacity} Ah`} />
              <P label="Age" value={`${b.age} years`} />
              <P label="Cycles" value={b.cycles} />
            </div>
          </div>
        </div>

        {/* Right Side: Health & Recommendations */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card glass">
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div className="feature-icon" style={{ width: 44, height: 44 }}><Activity size={20} /></div>
              <div>
                <h3 style={{ fontFamily: "Space Grotesk", margin: 0 }}>Health Assessment</h3>
                <div className="muted small">Current status and residual value</div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "#8e99aa", fontWeight: 700, letterSpacing: ".08em", marginBottom: 4 }}>BATTERY STATUS</div>
                <span style={{ fontSize: 16 }} className={`pill ${b.status === "GOOD" ? "good" : b.status === "FAIR" ? "fair" : "recycle"}`}>{b.status}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#8e99aa", fontWeight: 700, letterSpacing: ".08em", marginBottom: 4 }}>EST. VALUE</div>
                <strong style={{ fontFamily: "Space Grotesk", fontSize: 24, color: "#fff" }}>₹{b.price.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <div className="card glass" style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div className="feature-icon" style={{ width: 44, height: 44, background: "rgba(53,185,255,.1)", color: "#35b9ff" }}><Target size={20} /></div>
              <div>
                <h3 style={{ fontFamily: "Space Grotesk", margin: 0 }}>Recommended Applications</h3>
                <div className="muted small">Algorithmic second-life matching</div>
              </div>
            </div>
            
            <div className="list">
              {recs.map((rec, i) => (
                <div className="list-row" key={i}>
                  <div>
                    <strong style={{ display: "block" }}>{rec}</strong>
                    <span className="muted small">{b.soh >= 40 ? "High fit confidence" : "Recycling processing"}</span>
                  </div>
                  <span className="match-score">{b.soh >= 75 ? (95 - i*4) : b.soh >= 40 ? (88 - i*5) : 99}%</span>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 16, alignItems: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <p className="muted small" style={{ margin: 0 }}>This passport verifies the battery profile and 5-year trajectory.</p>
              <div className="qr" style={{ width: 100, height: 100, borderWidth: 6 }}><div style={{ fontSize: 16, lineHeight: 1.1 }}>BTL<br /><span style={{ fontSize: 9 }}>{b.id.slice(-4)}</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function P({ label, value }) { return <div className="passport-stat"><span>{label}</span><strong>{value}</strong></div> }
