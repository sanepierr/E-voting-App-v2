"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin, loginVoter } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  const [tab, setTab] = useState("admin");
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { updateUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let user;
      if (tab === "admin") {
        user = await loginAdmin(form.username, form.password);
        updateUser(user);
        router.push("/admin");
      } else {
        user = await loginVoter(form.voter_card_number, form.password);
        updateUser(user);
        router.push("/voter");
      }
    } catch (err) {
      setError(err?.detail || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-area">
          <img src="/logo.png" alt="Electoral Commission" />
          <h1>E-Voting System</h1>
          <p>The Electoral Commission</p>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${tab === "admin" ? "active" : ""}`} onClick={() => { setTab("admin"); setError(""); }}>
            Admin Login
          </button>
          <button className={`login-tab ${tab === "voter" ? "active" : ""}`} onClick={() => { setTab("voter"); setError(""); }}>
            Voter Login
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {tab === "admin" ? (
            <>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input className="form-input" type="text" required onChange={set("username")} placeholder="Enter username" />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" required onChange={set("password")} placeholder="Enter password" />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Voter Card Number</label>
                <input className="form-input" type="text" required onChange={set("voter_card_number")} placeholder="e.g. A1B2C3D4E5F6" maxLength={12} style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" required onChange={set("password")} placeholder="Enter password" />
              </div>
            </>
          )}

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--gray-200)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--gray-500)" }}>
            New voter? <Link href="/register" style={{ fontWeight: 600 }}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
