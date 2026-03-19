"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#C8A415", "#1B7340", "#C41E3A", "#1565C0", "#6A1B9A", "#E65100"];
const GENDER_MAP = { M: "Male", F: "Female", OTHER: "Other" };

export default function StatisticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/voting/statistics/").then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="empty-state"><p>Loading statistics...</p></div>;

  const ageData = Object.entries(stats.demographics?.age_groups || {}).map(([k, v]) => ({ name: k, count: v }));
  const genderData = (stats.demographics?.gender || []).map((g) => ({ name: GENDER_MAP[g.gender] || g.gender, value: g.count }));

  return (
    <>
      <div className="page-header"><div><h1>Detailed Statistics</h1><p className="subtitle">System-wide analytics and demographics</p></div></div>

      <div className="grid-stats">
        <div className="stat-card"><div className="stat-value">{stats.overview.candidates.total}</div><div className="stat-label">Total Candidates</div></div>
        <div className="stat-card"><div className="stat-value">{stats.overview.voters.total}</div><div className="stat-label">Total Voters</div></div>
        <div className="stat-card"><div className="stat-value">{stats.overview.stations.total}</div><div className="stat-label">Total Stations</div></div>
        <div className="stat-card"><div className="stat-value">{stats.overview.total_votes}</div><div className="stat-label">Total Votes</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div className="card">
          <div className="card-header"><h3>Voter Age Distribution</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><p>No voter data available.</p></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Gender Distribution</h3></div>
          <div className="card-body" style={{ height: 300 }}>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="empty-state"><p>No voter data available.</p></div>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <div className="card-header"><h3>Station Load</h3></div>
          <div className="card-body">
            {stats.station_load?.map((s) => (
              <div className="result-bar-wrap" key={s.station_id}>
                <div className="result-bar-info"><span className="name">{s.station_name}</span><span>{s.registered}/{s.capacity}</span></div>
                <div className="result-bar-track">
                  <div className="result-bar-fill other" style={{ width: `${Math.min(s.load_percentage, 100)}%`, background: s.load_percentage > 100 ? "var(--red)" : s.load_percentage > 75 ? "var(--gold)" : "var(--green)" }} />
                </div>
              </div>
            ))}
            {!stats.station_load?.length && <p style={{ color: "var(--gray-400)" }}>No station data.</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Education Levels (Candidates)</h3></div>
          <div className="card-body">
            {stats.education_distribution?.map((e, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ fontWeight: 500 }}>{e.education}</span>
                <span className="badge badge-info">{e.count}</span>
              </div>
            ))}
            {!stats.education_distribution?.length && <p style={{ color: "var(--gray-400)" }}>No candidate data.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
