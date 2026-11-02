import React from "react";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Eye, EyeOff, Fingerprint, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import api from "../../api";

const stages = [
  { label: "Select Battery", icon: "🔋" },
  { label: "Set Threshold", icon: "📏" },
  { label: "Generate Proof", icon: "🔐" },
  { label: "Verify Result", icon: "✅" }
];

export default function ZKP() {
  const [b, setB] = useState([]);
  const [id, setId] = useState("");
  const [threshold, setThreshold] = useState(70);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    api.get("/batteries").then(r => { setB(r.data); if (r.data[0]) setId(r.data[0].id); });
    api.get("/zkp/history").then(r => setHistory(r.data)).catch(() => {});
  }, []);

  async function prove() {
    setLoading(true);
    setResult(null);
    setStage(1);
    await new Promise(r => setTimeout(r, 400));
    setStage(2);
    await new Promise(r => setTimeout(r, 600));
    setStage(3);

    const x = b.find(v => v.id === id);
    const { data } = await api.post("/zkp/prove", { batteryId: id, soh: x.soh, threshold });

    await new Promise(r => setTimeout(r, 500));
    setStage(4);
    setResult(data);
    setLoading(false);

    // Refresh history
    api.get("/zkp/history").then(r => setHistory(r.data)).catch(() => {});
  }

  const selectedBattery = b.find(x => x.id === id);

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <span className="kicker">PRIVACY-PRESERVING VERIFICATION</span>
          <h1>Zero-Knowledge Proof</h1>
          <div className="muted small">Prove battery health without revealing sensitive fleet operating data.</div>
        </div>
        <span className="pill blue">ZKP PROTOCOL</span>
      </div>

      {/* Stage Indicator */}
      <div className="zkp-stages" style={{ marginBottom: 18 }}>
        {stages.map((s, i) => (
          <div key={i} className={`zkp-stage ${stage > i ? "completed" : stage === i ? "active" : ""}`}>
            <div className="stage-num">{stage > i ? "✓" : s.icon}</div>
            <span className="stage-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="two-col">
        {/* Left: Proof Generator */}
        <div className="card" style={{ animation: "fadeInUp .5s ease-out both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div className="feature-icon" style={{ width: 48, height: 48 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 style={{ fontFamily: "Space Grotesk", margin: 0 }}>Generate Health Proof</h2>
              <div className="muted small">Cryptographic verification without data exposure</div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label>Select Battery</label>
            <select className="input" value={id} onChange={e => { setId(e.target.value); setStage(0); setResult(null); }}>
              {b.map(x => (
                <option key={x.id} value={x.id}>{x.id} — {x.soh}% SOH — {x.chemistry} — {x.status}</option>
              ))}
            </select>
          </div>

          {selectedBattery && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 12 }}>
              <div className="factor-card">
                <div className="factor-name">SOH</div>
                <div className="factor-value" style={{ fontSize: 18 }}>{selectedBattery.soh}%</div>
              </div>
              <div className="factor-card">
                <div className="factor-name">CHEMISTRY</div>
                <div className="factor-value" style={{ fontSize: 18 }}>{selectedBattery.chemistry}</div>
              </div>
              <div className="factor-card">
                <div className="factor-name">STATUS</div>
                <div style={{ marginTop: 8 }}><span className={`pill ${selectedBattery.status === "GOOD" ? "good" : selectedBattery.status === "FAIR" ? "fair" : "recycle"}`}>{selectedBattery.status}</span></div>
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Required SOH Threshold (%)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input className="input" type="number" min="10" max="100" value={threshold} onChange={e => setThreshold(e.target.value)} style={{ flex: 1 }} />
              <span style={{ fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 700, color: selectedBattery && selectedBattery.soh >= threshold ? "#41e38b" : "#ff5e63" }}>
                {selectedBattery && selectedBattery.soh >= threshold ? "✓ Will Pass" : "✗ Will Fail"}
              </span>
            </div>
          </div>

          <button
            className="btn"
            style={{ marginTop: 18, width: "100%", padding: 14, fontSize: 15 }}
            disabled={loading || !id}
            onClick={prove}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span className="loading-spinner" style={{ width: 18, height: 18, margin: 0, borderWidth: 2 }} />
                Generating Zero-Knowledge Proof...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Fingerprint size={18} /> Generate ZKP
              </span>
            )}
          </button>
        </div>

        {/* Right: Result or Placeholder */}
        {result ? (
          <div className="card" style={{ animation: "fadeInUp .5s ease-out both" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              {result.result === "VERIFIED" ? (
                <div style={{ display: "inline-flex", width: 64, height: 64, borderRadius: "50%", background: "rgba(65,227,139,.12)", placeItems: "center", justifyContent: "center", alignItems: "center" }}>
                  <CheckCircle2 size={32} color="#41e38b" />
                </div>
              ) : (
                <div style={{ display: "inline-flex", width: 64, height: 64, borderRadius: "50%", background: "rgba(255,94,99,.12)", placeItems: "center", justifyContent: "center", alignItems: "center" }}>
                  <AlertTriangle size={32} color="#ff5e63" />
                </div>
              )}
            </div>

            <div style={{ textAlign: "center" }}>
              <span className={`pill ${result.result === "VERIFIED" ? "good" : "recycle"}`} style={{ fontSize: 13, padding: "6px 16px" }}>
                {result.result}
              </span>
              <h3 style={{ fontFamily: "Space Grotesk", marginTop: 12 }}>{result.statement}</h3>
            </div>

            {/* Privacy Shield */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: "#748094", fontWeight: 700, letterSpacing: ".08em", marginBottom: 10 }}>
                <Lock size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />
                PROTECTED DATA — NOT EXPOSED
              </div>
              <div className="privacy-shield">
                {(result.protectedData || [
                  "Fleet route history",
                  "Operational schedules",
                  "Charging patterns",
                  "Driver behavior data",
                  "Proprietary fleet analytics"
                ]).map(item => (
                  <div className="privacy-item" key={item}>
                    <EyeOff size={15} className="shield-icon" />
                    <span>{item}</span>
                    <Lock size={12} style={{ marginLeft: "auto", color: "#41e38b" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Proof Hash */}
            <div className="card" style={{ marginTop: 16, background: "#080d15", wordBreak: "break-all" }}>
              <div style={{ fontSize: 10, color: "#748094", letterSpacing: ".08em", fontWeight: 700, marginBottom: 6 }}>CRYPTOGRAPHIC PROOF</div>
              <code style={{ fontSize: 13, color: "#35b9ff", fontFamily: "monospace" }}>{result.proof}</code>
            </div>

            <div className="muted small" style={{ marginTop: 12, textAlign: "center" }}>
              {result.privacy}
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: "grid", placeItems: "center", textAlign: "center", animation: "fadeInUp .5s ease-out .1s both" }}>
            <div>
              <div style={{ display: "inline-flex", width: 72, height: 72, borderRadius: "50%", background: "rgba(65,227,139,.06)", placeItems: "center", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
                <ShieldCheck size={36} color="#41e38b" style={{ opacity: .4 }} />
              </div>
              <h3 style={{ fontFamily: "Space Grotesk", color: "#748094" }}>Verification Result</h3>
              <p className="muted small">Your cryptographic zero-knowledge proof result will appear here after generation.</p>
            </div>
          </div>
        )}
      </div>

      {/* Verification History */}
      {history.length > 0 && (
        <div className="card" style={{ marginTop: 14, animation: "fadeInUp .5s ease-out .2s both" }}>
          <div className="chart-head">
            <div>
              <div className="chart-title" style={{ fontFamily: "Space Grotesk" }}>Verification History</div>
              <div className="chart-sub">Recent ZKP proof generation log</div>
            </div>
            <span className="pill blue">{history.length} PROOFS</span>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Battery</th>
                <th>SOH</th>
                <th>Threshold</th>
                <th>Result</th>
                <th>Verifier</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 8).map(z => (
                <tr key={z.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 11 }}>{z.id}</td>
                  <td><strong>{z.batteryId}</strong></td>
                  <td>{z.soh}%</td>
                  <td>≥{z.threshold}%</td>
                  <td><span className={`pill ${z.result === "VERIFIED" ? "good" : "recycle"}`}>{z.result}</span></td>
                  <td>{z.verifier}</td>
                  <td className="muted small">{new Date(z.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
