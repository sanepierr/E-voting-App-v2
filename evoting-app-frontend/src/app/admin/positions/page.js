"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/Modal";

const EMPTY = { title: "", description: "", level: "National", max_winners: 1, min_candidate_age: 25 };

export default function PositionsPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => api.get("/elections/positions/").then((d) => setItems(d.results || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setError(""); setLoading(true);
    try {
      const payload = { ...form, max_winners: parseInt(form.max_winners) || 1, min_candidate_age: parseInt(form.min_candidate_age) || 25 };
      if (modal === "create") await api.post("/elections/positions/", payload);
      else await api.patch(`/elections/positions/${form.id}/`, payload);
      setModal(null); load();
    } catch (err) { setError(err?.data ? Object.values(err.data).flat().join(", ") : "Failed."); }
    finally { setLoading(false); }
  };

  const deactivate = async (id) => {
    if (!confirm("Deactivate this position?")) return;
    try { await api.post(`/elections/positions/${id}/deactivate/`); load(); } catch (err) { alert(err?.data?.detail || "Cannot deactivate."); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Positions</h1><p className="subtitle">Define electoral positions and seats</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setError(""); setModal("create"); }}>+ New Position</button>
      </div>
      <div className="card"><div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Title</th><th>Level</th><th>Seats</th><th>Min Age</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td style={{ fontWeight: 600 }}>{p.title}</td>
                <td><span className="badge badge-info">{p.level}</span></td>
                <td>{p.max_winners}</td>
                <td>{p.min_candidate_age}</td>
                <td><span className={`badge ${p.is_active ? "badge-success" : "badge-danger"}`}>{p.is_active ? "Active" : "Inactive"}</span></td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => { setForm(p); setError(""); setModal("edit"); }}>Edit</button>
                  {p.is_active && <button className="btn btn-danger btn-sm" onClick={() => deactivate(p.id)}>Deactivate</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="empty-state">No positions yet.</td></tr>}
          </tbody>
        </table>
      </div></div>

      {modal && (
        <Modal title={modal === "create" ? "New Position" : "Edit Position"} onClose={() => setModal(null)} footer={
          <><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button></>
        }>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={set("title")} placeholder="e.g. President, Governor" /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={set("description")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="form-label">Level</label><select className="form-select" value={form.level} onChange={set("level")}><option>National</option><option>Regional</option><option>Local</option></select></div>
            <div className="form-group"><label className="form-label">Seats</label><input className="form-input" type="number" min="1" value={form.max_winners} onChange={set("max_winners")} /></div>
            <div className="form-group"><label className="form-label">Min Age</label><input className="form-input" type="number" min="18" value={form.min_candidate_age} onChange={set("min_candidate_age")} /></div>
          </div>
        </Modal>
      )}
    </>
  );
}
