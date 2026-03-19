"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function VotersPage() {
  const [voters, setVoters] = useState([]);
  const [search, setSearch] = useState({ type: "name", value: "" });

  const load = () => {
    let q = "/accounts/voters/";
    if (search.value) q += `?${search.type}=${encodeURIComponent(search.value)}`;
    api.get(q).then((d) => setVoters(d.results || [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const verify = async (id) => {
    try { await api.post(`/accounts/voters/${id}/verify/`); load(); } catch (err) { alert(err?.data?.detail || "Failed."); }
  };

  const verifyAll = async () => {
    if (!confirm("Verify all pending voters?")) return;
    try { const d = await api.post("/accounts/voters/verify-all/"); alert(d.detail); load(); } catch (err) { alert("Failed."); }
  };

  const deactivate = async (id) => {
    if (!confirm("Deactivate this voter?")) return;
    try { await api.post(`/accounts/voters/${id}/deactivate/`); load(); } catch (err) { alert(err?.data?.detail || "Failed."); }
  };

  const unverifiedCount = voters.filter((v) => !v.is_verified).length;

  return (
    <>
      <div className="page-header">
        <div><h1>Voters</h1><p className="subtitle">Manage registered voters</p></div>
        {unverifiedCount > 0 && <button className="btn btn-success" onClick={verifyAll}>Verify All Pending ({unverifiedCount})</button>}
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="card-body" style={{ display: "flex", gap: "0.75rem", alignItems: "end" }}>
          <div className="form-group" style={{ margin: 0, flex: "0 0 140px" }}>
            <label className="form-label">Search By</label>
            <select className="form-select" value={search.type} onChange={(e) => setSearch({ ...search, type: e.target.value })}>
              <option value="name">Name</option>
              <option value="card">Card Number</option>
              <option value="national_id">National ID</option>
              <option value="station_id">Station ID</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label className="form-label">Value</label>
            <input className="form-input" value={search.value} onChange={(e) => setSearch({ ...search, value: e.target.value })} placeholder="Type to search..." />
          </div>
          <button className="btn btn-primary" onClick={load}>Search</button>
          <button className="btn btn-outline" onClick={() => { setSearch({ type: "name", value: "" }); setTimeout(load, 0); }}>Clear</button>
        </div>
      </div>

      <div className="card"><div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Card Number</th><th>National ID</th><th>Station</th><th>Verified</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {voters.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td style={{ fontWeight: 600 }}>{v.full_name}</td>
                <td style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>{v.voter_card_number}</td>
                <td>{v.national_id}</td>
                <td>{v.station_id}</td>
                <td><span className={`badge ${v.is_verified ? "badge-success" : "badge-danger"}`}>{v.is_verified ? "Yes" : "No"}</span></td>
                <td><span className={`badge ${v.is_active ? "badge-success" : "badge-danger"}`}>{v.is_active ? "Yes" : "No"}</span></td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  {!v.is_verified && <button className="btn btn-success btn-sm" onClick={() => verify(v.id)}>Verify</button>}
                  {v.is_active && <button className="btn btn-danger btn-sm" onClick={() => deactivate(v.id)}>Deactivate</button>}
                </td>
              </tr>
            ))}
            {voters.length === 0 && <tr><td colSpan={8} className="empty-state">No voters found.</td></tr>}
          </tbody>
        </table>
      </div></div>
    </>
  );
}
