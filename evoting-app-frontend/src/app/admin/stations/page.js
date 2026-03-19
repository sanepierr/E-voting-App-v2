"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/Modal";

const EMPTY = { name: "", location: "", region: "", capacity: "", supervisor: "", contact: "", opening_time: "08:00", closing_time: "17:00" };

export default function StationsPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => api.get("/elections/stations/").then((d) => setItems(d.results || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async () => {
    setError(""); setLoading(true);
    try {
      const payload = { ...form, capacity: parseInt(form.capacity) || 0 };
      if (modal === "create") await api.post("/elections/stations/", payload);
      else await api.patch(`/elections/stations/${form.id}/`, payload);
      setModal(null); load();
    } catch (err) { setError(err?.data ? Object.values(err.data).flat().join(", ") : "Failed."); }
    finally { setLoading(false); }
  };

  const deactivate = async (id) => {
    if (!confirm("Deactivate this station?")) return;
    try { await api.post(`/elections/stations/${id}/deactivate/`); load(); } catch (err) { alert(err?.data?.detail || "Cannot deactivate."); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Voting Stations</h1><p className="subtitle">Manage polling locations</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setError(""); setModal("create"); }}>+ New Station</button>
      </div>
      <div className="card"><div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Location</th><th>Region</th><th>Capacity</th><th>Registered</th><th>Load</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td>{s.location}</td>
                <td>{s.region}</td>
                <td>{s.capacity}</td>
                <td>{s.registered_voter_count}</td>
                <td><span className={`badge ${s.load_percentage > 100 ? "badge-danger" : s.load_percentage > 75 ? "badge-warning" : "badge-success"}`}>{s.load_percentage}%</span></td>
                <td><span className={`badge ${s.is_active ? "badge-success" : "badge-danger"}`}>{s.is_active ? "Active" : "Inactive"}</span></td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => { setForm(s); setError(""); setModal("edit"); }}>Edit</button>
                  {s.is_active && <button className="btn btn-danger btn-sm" onClick={() => deactivate(s.id)}>Deactivate</button>}
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={9} className="empty-state">No stations yet.</td></tr>}
          </tbody>
        </table>
      </div></div>

      {modal && (
        <Modal title={modal === "create" ? "New Station" : "Edit Station"} onClose={() => setModal(null)} footer={
          <><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button></>
        }>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Station Name</label><input className="form-input" value={form.name} onChange={set("name")} /></div>
          <div className="form-group"><label className="form-label">Location</label><input className="form-input" value={form.location} onChange={set("location")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="form-label">Region</label><input className="form-input" value={form.region} onChange={set("region")} /></div>
            <div className="form-group"><label className="form-label">Capacity</label><input className="form-input" type="number" value={form.capacity} onChange={set("capacity")} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="form-label">Supervisor</label><input className="form-input" value={form.supervisor} onChange={set("supervisor")} /></div>
            <div className="form-group"><label className="form-label">Contact</label><input className="form-input" value={form.contact} onChange={set("contact")} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="form-label">Opening Time</label><input className="form-input" type="time" value={form.opening_time} onChange={set("opening_time")} /></div>
            <div className="form-group"><label className="form-label">Closing Time</label><input className="form-input" type="time" value={form.closing_time} onChange={set("closing_time")} /></div>
          </div>
        </Modal>
      )}
    </>
  );
}
