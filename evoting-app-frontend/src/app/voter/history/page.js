"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  useEffect(() => { api.get("/voting/history/").then(setHistory).catch(() => {}); }, []);

  return (
    <>
      <div className="page-header"><div><h1>My Voting History</h1><p className="subtitle">Polls you have participated in</p></div></div>
      {history.length === 0 && <div className="card"><div className="empty-state"><p>You have not voted in any polls yet.</p></div></div>}
      {history.map((h) => (
        <div className="card" key={h.poll_id} style={{ marginBottom: "1rem" }}>
          <div className="card-header">
            <div>
              <h3>{h.poll_title}</h3>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{h.election_type}</div>
            </div>
            <span className={`badge ${h.poll_status === "open" ? "badge-success" : "badge-danger"}`}>{h.poll_status.toUpperCase()}</span>
          </div>
          <div className="card-body">
            {h.positions.map((pos, i) => (
              <div key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid var(--gray-100)", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--gray-500)" }}>{pos.position_title}</span>
                {pos.abstained ? (
                  <span style={{ color: "var(--gray-400)" }}>ABSTAINED</span>
                ) : (
                  <span style={{ fontWeight: 600, color: "var(--green)" }}>{pos.candidate_name}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
