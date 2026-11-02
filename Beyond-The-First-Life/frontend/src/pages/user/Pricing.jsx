import React from "react";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, CircleDollarSign, BarChart3, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import api from "../../api";

const colors = ["#41e38b", "#35b9ff", "#9d75ff", "#f5b94c"];

function PriceTrendChart({ commodity, color, index }) {
  if (!commodity.trend) return null;
  return (
    <div className="card" style={{ animation: `fadeInUp .5s ease-out ${index * 0.08}s both` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="muted small" style={{ fontWeight: 600 }}>{commodity.name}</div>
          <div style={{ fontFamily: "Space Grotesk", fontSize: 28, fontWeight: 700, marginTop: 6 }}>
            ₹{commodity.current.toLocaleString()}
          </div>
          <div className="muted small">{commodity.unit}</div>
        </div>
        <div className={`price-ticker ${commodity.change >= 0 ? "up" : "down"}`}>
          {commodity.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {commodity.change >= 0 ? "+" : ""}{commodity.change}%
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={commodity.trend} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${index}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.03)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#748094", fontSize: 9 }} interval={6} axisLine={false} tickLine={false} />
          <YAxis hide domain={['dataMin - 20', 'dataMax + 20']} />
          <Tooltip
            contentStyle={{ background: "#0b111b", border: `1px solid ${color}30`, borderRadius: 10, fontSize: 12 }}
            formatter={v => [`₹${v.toLocaleString()}`, commodity.name]}
            labelStyle={{ color: "#748094", fontSize: 10 }}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${index})`} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Pricing() {
  const [pricing, setPricing] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/pricing"),
      api.get("/pricing/trends").catch(() => ({ data: null }))
    ]).then(([priceRes, trendRes]) => {
      setPricing(priceRes.data);
      setTrends(trendRes.data);
      setLoading(false);
    });
  }, []);

  const commodities = trends?.commodities || pricing.map(p => ({ ...p, current: p.value, trend: null }));
  const valuation = trends?.batteryValuation;

  return (
    <div className="content">
      <div className="page-heading">
        <div>
          <span className="kicker">RESIDUAL VALUE INTELLIGENCE</span>
          <h1>Real-Time Pricing Index</h1>
          <div className="muted small">Live commodity signals anchored to battery residual value calculation.</div>
        </div>
        <span className="pill blue">
          <span className="dot" style={{ width: 6, height: 6, margin: 0, marginRight: 6, display: "inline-block" }} /> LIVE
        </span>
      </div>

      {loading ? (
        <div style={{ display: "grid", placeItems: "center", minHeight: 300 }}><div className="loading-spinner" /></div>
      ) : (
        <>
          {/* Price Ticker Strip */}
          <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            {commodities.map((c, i) => (
              <div key={c.name} className={`price-ticker ${c.change >= 0 ? "up" : "down"}`} style={{ padding: "8px 14px" }}>
                <strong style={{ marginRight: 6 }}>{c.name.split(" ")[0]}</strong>
                ₹{c.current.toLocaleString()}
                <span style={{ marginLeft: 6 }}>{c.change >= 0 ? "↑" : "↓"}{Math.abs(c.change)}%</span>
              </div>
            ))}
          </div>

          {/* Trend Charts */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {commodities.map((c, i) => (
              <PriceTrendChart key={c.name} commodity={c} color={colors[i]} index={i} />
            ))}
          </div>

          {/* Valuation Section */}
          {valuation && (
            <div style={{ marginTop: 14 }}>
              <div className="card valuation-card" style={{ animation: "fadeInUp .5s ease-out .3s both" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div className="feature-icon" style={{ width: 44, height: 44 }}>
                    <CircleDollarSign size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "Space Grotesk", margin: 0 }}>Battery Residual Value Calculator</h3>
                    <div className="muted small">Commodity signals + chemistry + SOH + capacity + local demand → ₹/kWh</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                  <div className="factor-card">
                    <div className="factor-name">NMC ₹/kWh</div>
                    <div className="factor-value">₹{valuation.nmcPerKwh}</div>
                  </div>
                  <div className="factor-card">
                    <div className="factor-name">LFP ₹/kWh</div>
                    <div className="factor-value" style={{ color: "#35b9ff" }}>₹{valuation.lfpPerKwh}</div>
                  </div>
                  <div className="factor-card">
                    <div className="factor-name">AVG GOOD</div>
                    <div className="factor-value">₹{valuation.avgResidualGood.toLocaleString()}</div>
                  </div>
                  <div className="factor-card">
                    <div className="factor-name">AVG FAIR</div>
                    <div className="factor-value" style={{ color: "#f5b94c" }}>₹{valuation.avgResidualFair.toLocaleString()}</div>
                  </div>
                  <div className="factor-card">
                    <div className="factor-name">AVG RECYCLE</div>
                    <div className="factor-value" style={{ color: "#ff5e63" }}>₹{valuation.avgResidualRecycle.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How Pricing Works */}
          <div className="card" style={{ marginTop: 14, animation: "fadeInUp .5s ease-out .4s both" }}>
            <h3 style={{ fontFamily: "Space Grotesk" }}>
              <Zap size={16} style={{ verticalAlign: "middle", marginRight: 6, color: "#41e38b" }} />
              How pricing feeds the platform
            </h3>
            <div className="muted" style={{ lineHeight: 1.8 }}>
              Real-time commodity spot prices (Lithium, Nickel, Cobalt, Manganese) are combined with battery chemistry type, remaining State of Health (SOH), capacity in kWh, and local buyer demand to calculate a dynamic residual value in <strong style={{ color: "#41e38b" }}>₹/kWh</strong>. This replaces arbitrary scrap-by-weight pricing with transparent, market-anchored valuation.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
              {["Commodity Prices", "Battery Chemistry", "SOH & Capacity", "Local Demand"].map((item, i) => (
                <div key={item} style={{ textAlign: "center", padding: 12, borderRadius: 10, background: "rgba(255,255,255,.02)", border: "1px solid var(--line)" }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{["📊", "⚗️", "🔋", "📍"][i]}</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
