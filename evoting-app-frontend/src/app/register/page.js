"use client";
import { useState, useEffect } from "react";
import { registerVoter, api } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({});
  const [stations, setStations] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/elections/stations/").then((d) => setStations(d.results || [])).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await registerVoter({ ...form, station_id: parseInt(form.station_id) });
      setSuccess(data);
    } catch (err) {
      const d = err?.data;
      if (d && typeof d === "object") {
        const msgs = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n");
        setError(msgs);
      } else {
        setError("Registration failed. Please check your details.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ textAlign: "center" }}>
          <div className="logo-area">
            <img src="/logo.png" alt="Logo" />
            <h1>Registration Successful</h1>
          </div>
          <div className="alert alert-success" style={{ textAlign: "left" }}>Your registration is pending admin verification.</div>
          <div style={{ background: "var(--cream)", border: "2px dashed var(--gold)", borderRadius: "var(--radius-md)", padding: "1.5rem", margin: "1.5rem 0" }}>
            <p style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginBottom: "0.5rem" }}>YOUR VOTER CARD NUMBER</p>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", letterSpacing: "0.15em", color: "var(--gold-dark)" }}>{success.voter_card_number}</p>
          </div>
          <div className="alert alert-warning" style={{ textAlign: "left" }}>Save this number! You need it to log in.</div>
          <Link href="/login" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "1rem" }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 520 }}>
        <div className="logo-area">
          <img src="/logo.png" alt="Logo" />
          <h1>Voter Registration</h1>
          <p>Register to participate in elections</p>
        </div>
        {error && <div className="alert alert-error" style={{ whiteSpace: "pre-line" }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required onChange={set("full_name")} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">National ID</label>
              <input className="form-input" required onChange={set("national_id")} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input className="form-input" type="date" required onChange={set("date_of_birth")} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" required onChange={set("gender")}>
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" required onChange={set("phone")} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required onChange={set("email")} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" required onChange={set("address")} rows={2} />
          </div>
          <div className="form-group">
            <label className="form-label">Voting Station</label>
            <select className="form-select" required onChange={set("station_id")}>
              <option value="">Select station</option>
              {stations.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.location}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" required minLength={6} onChange={set("password")} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" required minLength={6} onChange={set("confirm_password")} />
            </div>
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
          <Link href="/login" style={{ fontSize: "0.875rem" }}>← Back to login</Link>
        </div>
      </div>
    </div>
  );
}
