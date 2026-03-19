"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/Modal";

const EDU_LABELS = { bachelors: "Bachelor's", masters: "Master's", phd: "PhD", doctorate: "Doctorate" };
const EMPTY = { full_name: "", national_id: "", date_of_birth: "", gender: "M", education: "bachelors", party: "", manifesto: "", address: "", phone: "", email: "", has_criminal_record: false, years_experience: 0 };

export default function CandidatesPage() {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => api.get("/elections/candidates/").then((d) => setItems(d.results || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const save = async () => {
    setError(""); setLoading(true);
    try {
      if (modal === "create") await api.post("/elections/candidates/", form);
      else await api.patch(`/elections/candidates/${form.id}/`, { full_name: form.full_name, party: form.party, manifesto: form.manifesto, phone: form.phone, email: form.email, address: form.address, years_experience: parseInt(form.years_experience) || 0 });
      setModal(null); load();
    } catch (err) {
      const d = err?.data;
      setError(d ? Object.values(d).flat().join(", ") : "Failed to save.");
    } finally { setLoading(false); }
  };

  const deactivate = async (id) => {
    if (!confirm("Deactivate this candidate?")) return;
    try { await api.post(`/elections/candidates/${id}/deactivate/`); load(); } catch (err) { alert(err?.data?.detail || "Cannot deactivate."); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Candidates</h1><p className="subtitle">Manage election candidates</p></div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setError(""); setModal("create"); }}>+ New Candidate</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Party</th><th>Age</th><th>Education</th><th>Experience</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.full_name}</td>
                  <td>{c.party}</td>
                  <td>{c.age}</td>
                  <td>{EDU_LABELS[c.education] || c.education}</td>
                  <td>{c.years_experience} yrs</td>
                  <td><span className={`badge ${c.is_active ? "badge-success" : "badge-danger"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                  <td style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => { setForm(c); setError(""); setModal("edit"); }}>Edit</button>
                    {c.is_active && <button className="btn btn-danger btn-sm" onClick={() => deactivate(c.id)}>Deactivate</button>}
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={8} className="empty-state">No candidates yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal === "create" ? "New Candidate" : "Edit Candidate"} onClose={() => setModal(null)} footer={
          <><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</button></>
        }>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.full_name} onChange={set("full_name")} /></div>
          {modal === "create" && <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group"><label className="form-label">National ID</label><input className="form-input" value={form.national_id} onChange={set("national_id")} /></div>
              <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={form.date_of_birth} onChange={set("date_of_birth")} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group"><label className="form-label">Gender</label><select className="form-select" value={form.gender} onChange={set("gender")}><option value="M">Male</option><option value="F">Female</option><option value="Other">Other</option></select></div>
              <div className="form-group"><label className="form-label">Education</label><select className="form-select" value={form.education} onChange={set("education")}>{Object.entries(EDU_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            </div>
          </>}
          <div className="form-group"><label className="form-label">Party</label><input className="form-input" value={form.party} onChange={set("party")} /></div>
          <div className="form-group"><label className="form-label">Manifesto</label><textarea className="form-textarea" value={form.manifesto} onChange={set("manifesto")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone} onChange={set("phone")} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={form.email} onChange={set("email")} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={set("address")} /></div>
            <div className="form-group"><label className="form-label">Years Experience</label><input className="form-input" type="number" value={form.years_experience} onChange={set("years_experience")} /></div>
          </div>
        </Modal>
      )}
    </>
  );
}
