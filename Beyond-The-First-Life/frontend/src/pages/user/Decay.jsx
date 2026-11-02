import React from "react";
import { useEffect, useState } from "react";
import { Activity, Thermometer, Battery, Zap, TrendingDown, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import api from "../../api";
import DecayChart from "../../components/DecayChart";

const scenarios = [
  { value: "fleet_taxi", label: "Fleet Taxi / Ride-share", desc: "High mileage, deep cycling, frequent fast charging" },
  { value: "delivery", label: "Delivery Vehicle", desc: "Moderate mileage, daily deep discharge cycles" },
  { value: "normal", label: "Normal Usage", desc: "Standard driving patterns, balanced charging" },
  { value: "personal", label: "Personal Vehicle", desc: "Light daily use, moderate charging habits" },
  { value: "storage", label: "Stationary Storage", desc: "Minimal cycling, controlled environment" }
];

function StatusBadge({ soh }) {
  if (soh >= 75) return <span className="pill good">GOOD — Direct Resale</span>;
  if (soh >= 40) return <span className="pill fair">FAIR — Repurpose</span>;
  return <span className="pill recycle">RECYCLE — Material Recovery</span>;
}

export default function Decay() {
  const [soh, setSoh] = useState(82);
  const [chemistry, setChemistry] = useState("NMC");
  const [temperature, setTemperature] = useState(30);
  const [dod, setDod] = useState(80);
  const [scenario, setScenario] = useState("normal");
  const [data, setData] = useState([]);
  const [advanced, setAdvanced] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.post("/decay/simulate-advanced", { soh, chemistry, temperature, dod, scenario })
      .then(r => {
        setAdvanced(r.data);
        setData(r.data.highUsage.map((x, i) => ({
          year: x.year,
          high: x.soh,
          light: r.data.lightUsage[i].soh
        })));
        setLoading(false);
      })
      .catch(() => {
        // Fallback to basic endpoint
        api.post("/decay/simulate", { soh }).then(r => {
          setData(r.data.highUsage.map((x, i) => ({
            year: x.year,
            high: x.soh,
            light: r.data.lightUsage[i].soh
          })));
          setLoading(false);
        });
      });
  }, [soh, chemistry, temperature, dod, scenario]);

  const predictions = advanced?.predictions;
  const factors = advanced?.factors;

  return (
    <div className="content decay-simulator">
      <div className="page-heading">
        <div>
          <span className="kicker">PREDICTIVE BATTERY INTELLIGENCE</span>
          <h1>Battery Health Decay Simulator</h1>
          <div className="muted small">Compare high-usage and light-usage battery life over five years with chemistry-specific modeling.</div>
        </div>
        <span className="pill blue">REAL-TIME SIMULATION</span>
      </div>

      {/* ═══ CONTROL PANEL ═══ */}
      <div className="decay-controls" style={{ marginBottom: 14 }}>
        {/* SOH Slider */}
        <div className="decay-control-card">
          <label><Battery size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />CURRENT BATTERY SOH</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range" min="20" max="100" value={soh}
              onChange={e => setSoh(Number(e.target.value))}
              className="decay-slider" style={{ flex: 1 }}
            />
            <span style={{ fontFamily: "Space Grotesk", fontSize: 28, fontWeight: 700, color: soh >= 75 ? "#41e38b" : soh >= 40 ? "#f5b94c" : "#ff5e63", minWidth: 72, textAlign: "right" }}>
              {soh}%
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <StatusBadge soh={soh} />
          </div>
        </div>

        {/* Chemistry & Scenario */}
        <div className="decay-control-card">
          <label><Zap size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />BATTERY CHEMISTRY</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            {["NMC", "LFP"].map(c => (
              <button
                key={c}
                className={`btn ${chemistry === c ? "" : "secondary"}`}
                style={{ flex: 1, fontSize: 13 }}
                onClick={() => setChemistry(c)}
              >
                {c}
                <div style={{ fontSize: 9, fontWeight: 400, marginTop: 2, opacity: .7 }}>
                  {c === "NMC" ? "Higher density" : "More stable"}
                </div>
              </button>
            ))}
          </div>
          <label><Activity size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />USAGE SCENARIO</label>
          <select className="input" value={scenario} onChange={e => setScenario(e.target.value)}>
            {scenarios.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <div className="muted" style={{ fontSize: 10, marginTop: 6 }}>
            {scenarios.find(s => s.value === scenario)?.desc}
          </div>
        </div>

        {/* Temperature & DoD */}
        <div className="decay-control-card">
          <label><Thermometer size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />OPERATING TEMPERATURE</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range" min="15" max="50" value={temperature}
              onChange={e => setTemperature(Number(e.target.value))}
              className="decay-slider" style={{ flex: 1 }}
            />
            <span style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 700, color: temperature > 40 ? "#ff5e63" : temperature > 35 ? "#f5b94c" : "#41e38b", minWidth: 52, textAlign: "right" }}>
              {temperature}°C
            </span>
          </div>
          <div className="muted small" style={{ marginTop: 4 }}>{temperature > 40 ? "⚠️ High temp accelerates degradation" : temperature > 35 ? "Elevated operating temperature" : "✓ Normal operating range"}</div>

          <label style={{ marginTop: 14 }}><TrendingDown size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />DEPTH OF DISCHARGE (DoD)</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range" min="20" max="100" value={dod}
              onChange={e => setDod(Number(e.target.value))}
              className="decay-slider" style={{ flex: 1 }}
            />
            <span style={{ fontFamily: "Space Grotesk", fontSize: 22, fontWeight: 700, color: dod > 90 ? "#ff5e63" : dod > 70 ? "#f5b94c" : "#41e38b", minWidth: 52, textAlign: "right" }}>
              {dod}%
            </span>
          </div>
          <div className="muted small" style={{ marginTop: 4 }}>{dod > 90 ? "⚠️ Deep cycling accelerates wear" : dod > 70 ? "Moderate discharge depth" : "✓ Shallow cycling extends life"}</div>
        </div>
      </div>

      {/* ═══ MAIN CHART ═══ */}
      {loading ? (
        <div className="card chart-card" style={{ display: "grid", placeItems: "center" }}>
          <div className="loading-spinner" />
        </div>
      ) : (
        <DecayChart
          data={data}
          height={390}
          title={`${chemistry} Battery — ${scenarios.find(s => s.value === scenario)?.label} Scenario`}
          subtitle={`Starting at ${soh}% SOH • ${temperature}°C operating temp • ${dod}% depth of discharge`}
        />
      )}

      {/* ═══ YEAR 1, 3, 5 PREDICTION CARDS ═══ */}
      <div className="decay-prediction-cards">
        {[
          { label: "YEAR 1", index: 1, icon: "📅" },
          { label: "YEAR 3", index: 3, icon: "📊" },
          { label: "YEAR 5", index: 5, icon: "🔮" }
        ].map(({ label, index, icon }) => {
          const highVal = data[index]?.high;
          const lightVal = data[index]?.light;
          return (
            <div className="prediction-card animate-in" key={label}>
              <div className="year-label">{icon} {label} PROJECTION</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#748094", marginBottom: 4 }}>HIGH USAGE</div>
                  <div className="soh-value" style={{ color: highVal >= 75 ? "#41e38b" : highVal >= 40 ? "#f5b94c" : "#ff5e63" }}>
                    {highVal ?? "—"}%
                  </div>
                  <div className="soh-status">
                    {highVal != null && <StatusBadge soh={highVal} />}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div className="progress"><div style={{ width: `${highVal || 0}%`, background: highVal >= 75 ? "var(--green)" : highVal >= 40 ? "var(--yellow)" : "var(--red)" }} /></div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "#748094", marginBottom: 4 }}>LIGHT USAGE</div>
                  <div className="soh-value" style={{ color: lightVal >= 75 ? "#35b9ff" : lightVal >= 40 ? "#f5b94c" : "#ff5e63" }}>
                    {lightVal ?? "—"}%
                  </div>
                  <div className="soh-status">
                    {lightVal != null && <StatusBadge soh={lightVal} />}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div className="progress"><div style={{ width: `${lightVal || 0}%`, background: lightVal >= 75 ? "var(--cyan)" : lightVal >= 40 ? "var(--yellow)" : "var(--red)" }} /></div>
                  </div>
                </div>
              </div>
              {highVal != null && lightVal != null && (
                <div className="muted" style={{ fontSize: 10, marginTop: 10 }}>
                  Δ Difference: <strong style={{ color: "#35b9ff" }}>{lightVal - highVal}%</strong> — light usage retains <strong>{Math.round((lightVal / Math.max(highVal, 1) - 1) * 100)}%</strong> more health
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══ IMPACT FACTORS ═══ */}
      {factors && (
        <div className="decay-factors">
          <div className="factor-card animate-in">
            <div className="factor-name">CHEMISTRY</div>
            <div className="factor-value">{factors.chemistry.name}</div>
            <div className="factor-desc">{factors.chemistry.description}</div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#748094" }}>Factor: ×{factors.chemistry.factor}</div>
          </div>
          <div className="factor-card animate-in">
            <div className="factor-name">TEMPERATURE</div>
            <div className="factor-value" style={{ color: factors.temperature.factor > 1.1 ? "#ff5e63" : "#41e38b" }}>{factors.temperature.value}°C</div>
            <div className="factor-desc">{factors.temperature.description}</div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#748094" }}>Factor: ×{factors.temperature.factor}</div>
          </div>
          <div className="factor-card animate-in">
            <div className="factor-name">DEPTH OF DISCHARGE</div>
            <div className="factor-value" style={{ color: factors.dod.factor > 1.0 ? "#f5b94c" : "#41e38b" }}>{factors.dod.value}%</div>
            <div className="factor-desc">{factors.dod.description}</div>
            <div style={{ marginTop: 6, fontSize: 11, color: "#748094" }}>Factor: ×{factors.dod.factor}</div>
          </div>
          <div className="factor-card animate-in">
            <div className="factor-name">USAGE SCENARIO</div>
            <div className="factor-value">{scenarios.find(s => s.value === factors.scenario.name)?.label.split(" ")[0] || factors.scenario.name}</div>
            <div className="factor-desc">High: ×{factors.scenario.multipliers.high} / Light: ×{factors.scenario.multipliers.light}</div>
          </div>
        </div>
      )}

      {/* ═══ RISK ANALYSIS ═══ */}
      {predictions && (
        <div className="two-col" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="chart-title" style={{ fontFamily: "Space Grotesk" }}>⚡ High Usage Risk Analysis</div>
            <div className="list" style={{ marginTop: 12 }}>
              <div className="list-row">
                <span>Drops below <strong>GOOD</strong> (75%)</span>
                {predictions.highUsage.crossesGood ?
                  <span className="yellow" style={{ fontFamily: "Space Grotesk", fontWeight: 700 }}>Year {predictions.highUsage.crossesGood.year} ({predictions.highUsage.crossesGood.soh}%)</span> :
                  <span className="green"><CheckCircle2 size={14} style={{ verticalAlign: "middle" }} /> Stays above 75%</span>
                }
              </div>
              <div className="list-row">
                <span>Drops below <strong>FAIR</strong> (40%)</span>
                {predictions.highUsage.crossesFair ?
                  <span className="red" style={{ fontFamily: "Space Grotesk", fontWeight: 700 }}>Year {predictions.highUsage.crossesFair.year} ({predictions.highUsage.crossesFair.soh}%)</span> :
                  <span className="green"><CheckCircle2 size={14} style={{ verticalAlign: "middle" }} /> Stays above 40%</span>
                }
              </div>
              <div className="list-row">
                <span>5-Year residual value</span>
                <strong className="green">₹{(advanced?.highUsage?.[5]?.value || 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="chart-title" style={{ fontFamily: "Space Grotesk" }}>🌿 Light Usage Risk Analysis</div>
            <div className="list" style={{ marginTop: 12 }}>
              <div className="list-row">
                <span>Drops below <strong>GOOD</strong> (75%)</span>
                {predictions.lightUsage.crossesGood ?
                  <span className="yellow" style={{ fontFamily: "Space Grotesk", fontWeight: 700 }}>Year {predictions.lightUsage.crossesGood.year} ({predictions.lightUsage.crossesGood.soh}%)</span> :
                  <span className="cyan"><CheckCircle2 size={14} style={{ verticalAlign: "middle" }} /> Stays above 75%</span>
                }
              </div>
              <div className="list-row">
                <span>Drops below <strong>FAIR</strong> (40%)</span>
                {predictions.lightUsage.crossesFair ?
                  <span className="red" style={{ fontFamily: "Space Grotesk", fontWeight: 700 }}>Year {predictions.lightUsage.crossesFair.year} ({predictions.lightUsage.crossesFair.soh}%)</span> :
                  <span className="cyan"><CheckCircle2 size={14} style={{ verticalAlign: "middle" }} /> Stays above 40%</span>
                }
              </div>
              <div className="list-row">
                <span>5-Year residual value</span>
                <strong className="cyan">₹{(advanced?.lightUsage?.[5]?.value || 0).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
