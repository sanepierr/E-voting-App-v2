"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/voting/statistics/").then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="empty-state"><p>Loading dashboard...</p></div>;

  const o = stats.overview;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">System overview at a glance</p>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-value">{o.polls.open}</div>
          <div className="stat-label">Open Polls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{o.total_votes}</div>
          <div className="stat-label">Total Votes Cast</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{o.voters.total}</div>
          <div className="stat-label">Registered Voters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{o.voters.verified}</div>
          <div className="stat-label">Verified Voters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{o.candidates.active}</div>
          <div className="stat-label">Active Candidates</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{o.stations.active}</div>
          <div className="stat-label">Active Stations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{o.polls.total}</div>
          <div className="stat-label">Total Polls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{o.polls.closed}</div>
          <div className="stat-label">Closed Polls</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <div className="card-header"><h3>Station Load</h3></div>
          <div className="card-body">
            {stats.station_load?.length === 0 && <p style={{ color: "var(--gray-400)", fontSize: "0.9rem" }}>No stations yet.</p>}
            {stats.station_load?.map((s) => (
              <div className="result-bar-wrap" key={s.station_id}>
                <div className="result-bar-info">
                  <span className="name">{s.station_name}</span>
                  <span>{s.registered}/{s.capacity} ({s.load_percentage}%)</span>
                </div>
                <div className="result-bar-track">
                  <div className={`result-bar-fill ${s.load_percentage > 100 ? "winner" : "other"}`} style={{ width: `${Math.min(s.load_percentage, 100)}%`, background: s.load_percentage > 100 ? "var(--red)" : s.load_percentage > 75 ? "var(--gold)" : "var(--green)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Party Distribution</h3></div>
          <div className="card-body">
            {stats.party_distribution?.length === 0 && <p style={{ color: "var(--gray-400)", fontSize: "0.9rem" }}>No candidates yet.</p>}
            {stats.party_distribution?.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ fontWeight: 600 }}>{p.party}</span>
                <span className="badge badge-info">{p.count} candidate{p.count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
