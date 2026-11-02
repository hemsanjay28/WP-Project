import React from "react";
import { useState, useRef } from "react";
import { Battery, ScanLine, UploadCloud, AlertTriangle } from "lucide-react";
import api from "../../api";
import { Link } from "react-router-dom";

export default function Scan() {
  const [loading, setLoading] = useState(false);
  const [b, setB] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Only CSV files are allowed to prevent fraudulent data formats.");
      return;
    }

    const formData = new FormData();
    formData.append("batteryLog", file);

    setLoading(true);
    setError("");
    setB(null);

    try {
      const { data } = await api.post("/batteries/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setB(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error uploading or parsing CSV");
    } finally {
      setLoading(false);
      // Reset input so they can upload again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <span className="kicker">SECURE LOG UPLOAD</span>
          <h1>Upload Battery Log</h1>
          <div className="muted small">Upload BMS CSV exports directly into the system.</div>
        </div>
      </div>
      <div className="two-col">
        <div className="card" style={{ minHeight: 360, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div className="feature-icon" style={{ margin: "auto", width: 65, height: 65 }}>
              {loading ? <ScanLine size={30} /> : <UploadCloud size={30} />}
            </div>
            <h2 style={{ fontFamily: "Space Grotesk" }}>{loading ? "Analyzing Log Data..." : "Upload BMS CSV Log"}</h2>
            <p className="muted" style={{ maxWidth: 300, margin: "0 auto 20px" }}>
              Secure CSV upload. The system actively scans for data anomalies to prevent fraudulent battery logs.
            </p>
            
            {error && <div style={{ color: "#ff5e63", marginBottom: 15, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><AlertTriangle size={15} /> {error}</div>}
            
            <input 
              type="file" 
              accept=".csv" 
              style={{ display: "none" }} 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            
            <button className="btn" disabled={loading} onClick={() => fileInputRef.current.click()}>
              {loading ? "Processing..." : "Select .CSV File"}
            </button>
          </div>
        </div>
        {b ? <Result b={b} /> : (
          <div className="card" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
            <div className="muted">Your verified diagnostic result will appear here.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Result({ b }) {
  return (
    <div className="card">
      <div className="kicker">SCAN COMPLETE & VERIFIED</div>
      <h2 style={{ fontFamily: "Space Grotesk" }}>{b.id}</h2>
      <div className="big-soh" style={{ fontSize: 60, marginTop: 25 }}>{b.soh}%</div>
      <div className="center muted">State of Health</div>
      <div className="progress" style={{ marginTop: 20 }}><div style={{ width: `${b.soh}%` }} /></div>
      
      <div className="passport-grid" style={{ marginTop: 20 }}>
        <div className="passport-stat"><span>Chemistry</span><strong>{b.chemistry}</strong></div>
        <div className="passport-stat"><span>Cycles</span><strong>{b.cycles}</strong></div>
        <div className="passport-stat"><span>Capacity</span><strong>{b.capacity} Ah</strong></div>
        <div className="passport-stat"><span>Residual Value</span><strong>₹{b.price.toLocaleString()}</strong></div>
      </div>
      
      <div style={{ marginTop: 18 }}>
        <span className={`pill ${b.status === "GOOD" ? "good" : b.status === "FAIR" ? "fair" : "recycle"}`}>{b.status}</span>
        <span className="muted small" style={{ marginLeft: 8 }}>
          {b.status === "GOOD" ? "Direct second-life resale" : b.status === "FAIR" ? "Repurpose for storage / UPS" : "Material recovery recommended"}
        </span>
      </div>
      
      <Link to={`/verify/${b.id}`} className="btn" style={{ display: "inline-block", marginTop: 20 }}>
        View Passport
      </Link>
    </div>
  );
}
