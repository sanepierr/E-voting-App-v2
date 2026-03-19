"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const ACTION_COLORS = {
  CREATE: "badge-success", REGISTER: "badge-success", VERIFY: "badge-success", OPEN: "badge-success",
  DELETE: "badge-danger", DEACTIVATE: "badge-danger", CLOSE: "badge-danger",
  UPDATE: "badge-warning", ASSIGN: "badge-warning",
  LOGIN: "badge-info", LOGOUT: "badge-info", CAST_VOTE: "badge-info",
};

function actionBadge(action) {
  const key = Object.keys(ACTION_COLORS).find((k) => action.includes(k));
  return key ? ACTION_COLORS[key] : "badge-info";
}

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [types, setTypes] = useState([]);
  const [filter, setFilter] = useState({ action: "", user: "" });

  const load = () => {
    let q = "/audit/logs/?";
    if (filter.action) q += `action=${filter.action}&`;
    if (filter.user) q += `user=${encodeURIComponent(filter.user)}&`;
    api.get(q).then((d) => setLogs(d.results || [])).catch(() => {});
  };

  useEffect(() => {
    load();
    api.get("/audit/action-types/").then(setTypes).catch(() => {});
  }, []);

  return (
    <>
      <div className="page-header"><div><h1>Audit Log</h1><p className="subtitle">Complete system activity trail</p></div></div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="card-body" style={{ display: "flex", gap: "0.75rem", alignItems: "end" }}>
          <div className="form-group" style={{ margin: 0, flex: "0 0 200px" }}>
            <label className="form-label">Action Type</label>
            <select className="form-select" value={filter.action} onChange={(e) => setFilter({ ...filter, action: e.target.value })}>
              <option value="">All Actions</option>
              {types.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label className="form-label">User / Card Number</label>
            <input className="form-input" value={filter.user} onChange={(e) => setFilter({ ...filter, user: e.target.value })} placeholder="Filter by user..." />
          </div>
          <button className="btn btn-primary" onClick={load}>Filter</button>
          <button className="btn btn-outline" onClick={() => { setFilter({ action: "", user: "" }); setTimeout(load, 0); }}>Clear</button>
        </div>
      </div>

      <div className="card"><div className="table-wrap">
        <table>
          <thead><tr><th>Timestamp</th><th>Action</th><th>User</th><th>Details</th></tr></thead>
          <tbody>
            {logs.map((entry) => (
              <tr key={entry.id}>
                <td style={{ fontSize: "0.8rem", color: "var(--gray-500)", whiteSpace: "nowrap" }}>{new Date(entry.timestamp).toLocaleString()}</td>
                <td><span className={`badge ${actionBadge(entry.action)}`}>{entry.action}</span></td>
                <td style={{ fontWeight: 500 }}>{entry.user_identifier}</td>
                <td style={{ fontSize: "0.85rem", color: "var(--gray-600)", maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.details}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={4} className="empty-state">No audit records found.</td></tr>}
          </tbody>
        </table>
      </div></div>
    </>
  );
}
