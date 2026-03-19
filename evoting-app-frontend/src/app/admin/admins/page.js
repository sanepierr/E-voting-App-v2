"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Modal from "@/components/Modal";

const EMPTY = { username: "", full_name: "", email: "", role: "election_officer", password: "" };
const ROLE_LABELS = { super_admin: "Super Admin", election_officer: "Election Officer", station_manager: "Station Manager", auditor: "Auditor" };

export default function AdminsPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => api.get("/accounts/admins/").then((d) => setAdmins(d.results || [])).catch(() => {});
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async () => {
    setError(""); setLoading(true);
    try { await api.post("/accounts/admins/create/", form); setModal(false); load(); }
    catch (err) { setError(err?.data ? Object.values(err.data).flat().join(", ") : "Failed."); }
    finally { setLoading(false); }
  };

  const deactivate = async (id) => {
    if (!confirm("Deactivate this admin?")) return;
    try { await api.post(`/accounts/admins/${id}/deactivate/`); load(); }
    catch (err) { alert(err?.data?.detail || "Cannot deactivate."); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Admin Accounts</h1><p className="subtitle">Manage system administrators</p></div>
        {user?.role === "super_admin" && <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setError(""); setModal(true); }}>+ New Admin</button>}
      </div>

      <div className="card"><div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Username</th><th>Full Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td style={{ fontWeight: 600 }}>{a.username}</td>
                <td>{a.full_name}</td>
                <td>{a.email}</td>
                <td><span className="badge badge-info">{ROLE_LABELS[a.role] || a.role}</span></td>
                <td><span className={`badge ${a.is_active ? "badge-success" : "badge-danger"}`}>{a.is_active ? "Yes" : "No"}</span></td>
                <td>
                  {user?.role === "super_admin" && a.id !== user.id && a.is_active && (
                    <button className="btn btn-danger btn-sm" onClick={() => deactivate(a.id)}>Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>

      {modal && (
        <Modal title="Create Admin" onClose={() => setModal(false)} footer={
          <><button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={create} disabled={loading}>{loading ? "Creating..." : "Create"}</button></>
        }>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Username</label><input className="form-input" value={form.username} onChange={set("username")} /></div>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.full_name} onChange={set("full_name")} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={set("email")} /></div>
          <div className="form-group"><label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={set("role")}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Password</label><input className="form-input" type="password" value={form.password} onChange={set("password")} /></div>
        </Modal>
      )}
    </>
  );
}
