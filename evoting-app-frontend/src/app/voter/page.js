"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

export default function VoterDashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/voting/open-polls/").then(setPolls).catch(() => {});
    api.get("/voting/history/").then(setHistory).catch(() => {});
  }, []);

  const available = polls.filter((p) => !p.has_voted);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.full_name}</h1>
          <p className="subtitle">Your voter dashboard</p>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-value">{polls.length}</div>
          <div className="stat-label">Open Polls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: available.length > 0 ? "var(--green)" : "var(--gray-400)" }}>{available.length}</div>
          <div className="stat-label">Available to Vote</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{history.length}</div>
          <div className="stat-label">Polls Voted In</div>
        </div>
      </div>

      {available.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem", border: "2px solid var(--gold-light)" }}>
          <div className="card-header" style={{ background: "var(--cream)" }}>
            <h3 style={{ color: "var(--gold-dark)" }}>Polls Awaiting Your Vote</h3>
            <Link href="/voter/vote" className="btn btn-primary">Cast Vote →</Link>
          </div>
          <div className="card-body">
            {available.map((p) => (
              <div key={p.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                <strong>{p.title}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginLeft: "0.75rem" }}>{p.election_type} &middot; {p.start_date} to {p.end_date}</span>
                <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
                  {p.positions?.length} position{p.positions?.length !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {available.length === 0 && polls.length > 0 && (
        <div className="alert alert-success">You have voted in all available polls. Thank you for participating!</div>
      )}

      {polls.length === 0 && (
        <div className="card"><div className="empty-state"><p>No open polls at this time. Check back later.</p></div></div>
      )}
    </>
  );
}
