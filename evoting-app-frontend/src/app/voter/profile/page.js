"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [pwForm, setPwForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get("/accounts/profile/").then(setProfile).catch(() => {}); }, []);

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null); setLoading(true);
    try {
      const res = await api.post("/accounts/change-password/", pwForm);
      setPwMsg({ type: "success", text: res.detail });
      setPwForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err?.data?.detail || err?.data?.confirm_password?.[0] || "Failed." });
    } finally { setLoading(false); }
  };

  if (!profile) return <div className="empty-state"><p>Loading profile...</p></div>;

  const u = profile.user;
  const fields = [
    ["Full Name", u.first_name + " " + u.last_name],
    ["National ID", profile.national_id],
    ["Voter Card", profile.voter_card_number],
    ["Date of Birth", profile.date_of_birth],
    ["Age", profile.age],
    ["Gender", profile.gender === "M" ? "Male" : profile.gender === "F" ? "Female" : "Other"],
    ["Address", profile.address],
    ["Phone", profile.phone],
    ["Email", u.email],
    ["Station", profile.station_name || `Station #${profile.station}`],
    ["Verified", u.is_verified ? "Yes" : "No"],
    ["Registered", new Date(u.date_joined).toLocaleDateString()],
  ];

  return (
    <>
      <div className="page-header"><div><h1>My Profile</h1><p className="subtitle">Your voter information</p></div></div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <div className="card-header"><h3>Personal Information</h3></div>
          <div className="card-body">
            {fields.map(([label, value]) => (
              <div key={label} style={{ display: "flex", padding: "0.625rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                <span style={{ flex: "0 0 130px", fontSize: "0.8rem", fontWeight: 600, color: "var(--gray-500)", textTransform: "uppercase" }}>{label}</span>
                <span style={{ fontWeight: label === "Voter Card" ? 700 : 400, color: label === "Voter Card" ? "var(--gold-dark)" : "var(--charcoal)", fontFamily: label === "Voter Card" ? "monospace" : "inherit", letterSpacing: label === "Voter Card" ? "0.08em" : "normal" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Change Password</h3></div>
          <div className="card-body">
            {pwMsg && <div className={`alert alert-${pwMsg.type}`}>{pwMsg.text}</div>}
            <form onSubmit={changePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" required value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" required minLength={6} value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-input" type="password" required minLength={6} value={pwForm.confirm_password} onChange={(e) => setPwForm({ ...pwForm, confirm_password: e.target.value })} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Changing..." : "Change Password"}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
