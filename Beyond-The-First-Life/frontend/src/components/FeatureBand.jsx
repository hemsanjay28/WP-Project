import React from "react";
const features = [
  ["1.","Instant API Integration","Connect fleet platforms like Pulse Energy, Kazam, Ola and Switch EV."],
  ["2.","Second-Life Matchmaking","Match each battery to its best second-life application automatically."],
  ["3.","Battery Health Decay Simulator","Project health over 1, 3 and 5 years for high and light usage."],
  ["4.","Zero-Knowledge Proof (ZKP)","Prove health without exposing routes, schedules or proprietary habits."],
  ["5.","Residual Value Real-Time Pricing","Dynamic valuation using commodity signals and local demand."]
];
export default function FeatureBand(){
  return <section className="feature-band"><div className="container feature-band-grid">{features.map(f=><div className="feature-band-item" key={f[0]}><h4>{f[0]} {f[1]}</h4><p>{f[2]}</p></div>)}</div></section>
}
