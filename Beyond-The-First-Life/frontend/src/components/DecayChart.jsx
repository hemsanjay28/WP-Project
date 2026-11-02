import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ReferenceLine, ReferenceArea } from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "linear-gradient(145deg, #0d1520, #0b111b)",
      border: "1px solid rgba(65,227,139,.2)",
      borderRadius: 14,
      padding: "14px 18px",
      boxShadow: "0 12px 40px rgba(0,0,0,.4)"
    }}>
      <div style={{ fontSize: 11, color: "#748094", marginBottom: 8, fontWeight: 700, letterSpacing: ".08em" }}>YEAR {label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: i > 0 ? 6 : 0 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, boxShadow: `0 0 8px ${p.color}50` }} />
          <span style={{ color: "#b0bac8", fontSize: 12 }}>{p.name}:</span>
          <strong style={{ color: "#fff", fontFamily: "Space Grotesk", fontSize: 15 }}>{p.value}%</strong>
        </div>
      ))}
    </div>
  );
}

function CustomDot(props) {
  const { cx, cy, value, stroke } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#0b111b" stroke={stroke} strokeWidth={2.5} />
      <circle cx={cx} cy={cy} r={3} fill={stroke} />
    </g>
  );
}

export default function DecayChart({ data, title = "Battery Health Decay Simulator", height = 280, subtitle = "Projected State of Health under customized usage scenarios" }) {
  return (
    <div className="card chart-card" style={{ animation: "fadeInUp .5s ease-out both" }}>
      <div className="chart-head">
        <div>
          <div className="chart-title" style={{ fontSize: 16, fontFamily: "Space Grotesk" }}>{title}</div>
          <div className="chart-sub">{subtitle}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="pill blue">5 YEAR</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, marginBottom: 8, fontSize: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 3, borderRadius: 2, background: "#41e38b" }} />
          <span style={{ color: "#8e99aa" }}>High Usage</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 12, height: 3, borderRadius: 2, background: "#35b9ff" }} />
          <span style={{ color: "#8e99aa" }}>Light Usage</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 24, height: 8, borderRadius: 2, background: "rgba(65,227,139,.08)", border: "1px dashed rgba(65,227,139,.2)" }} />
          <span style={{ color: "#8e99aa" }}>Safe Zone (≥75%)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
          <defs>
            <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#41e38b" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#41e38b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#35b9ff" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#35b9ff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} strokeDasharray="3 3" />
          
          {/* Risk zone backgrounds */}
          <ReferenceArea y1={75} y2={100} fill="rgba(65,227,139,.03)" />
          <ReferenceArea y1={40} y2={75} fill="rgba(245,185,76,.02)" />
          <ReferenceArea y1={0} y2={40} fill="rgba(255,94,99,.02)" />
          
          {/* Threshold lines */}
          <ReferenceLine y={75} stroke="rgba(65,227,139,.25)" strokeDasharray="6 4" label={{ value: "Good ≥75%", position: "right", fill: "#41e38b", fontSize: 9, fontWeight: 700 }} />
          <ReferenceLine y={40} stroke="rgba(255,94,99,.25)" strokeDasharray="6 4" label={{ value: "Recycle <40%", position: "right", fill: "#ff5e63", fontSize: 9, fontWeight: 700 }} />

          <XAxis dataKey="year" tick={{ fill: "#748094", fontSize: 11, fontWeight: 600 }} tickFormatter={v => `Y${v}`} axisLine={{ stroke: "rgba(255,255,255,.06)" }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#748094", fontSize: 11 }} tickFormatter={v => `${v}%`} axisLine={{ stroke: "rgba(255,255,255,.06)" }} />
          <Tooltip content={<CustomTooltip />} />

          <Area type="monotone" dataKey="light" name="Light Usage" stroke="#35b9ff" strokeWidth={3} fill="url(#lightGrad)" dot={<CustomDot />} activeDot={{ r: 7, stroke: "#35b9ff", strokeWidth: 2, fill: "#0b111b" }} />
          <Area type="monotone" dataKey="high" name="High Usage" stroke="#41e38b" strokeWidth={3} fill="url(#highGrad)" dot={<CustomDot />} activeDot={{ r: 7, stroke: "#41e38b", strokeWidth: 2, fill: "#0b111b" }} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 11, color: "#607080" }}>
        <span>📊 Model inputs: cycles, temperature, depth-of-discharge, usage intensity</span>
        <span>•</span>
        <span>Hackathon simulation — replace with real BMS data for production</span>
      </div>
    </div>
  );
}
