"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function VoterPollsPage() {
  const [polls, setPolls] = useState([]);
  useEffect(() => { api.get("/voting/open-polls/").then(setPolls).catch(() => {}); }, []);

  return (
    <>
      <div className="page-header"><div><h1>Open Polls</h1><p className="subtitle">Current elections available at your station</p></div></div>
      {polls.map((p) => (
        <div className="card" key={p.id} style={{ marginBottom: "1rem" }}>
          <div className="card-header">
            <div>
              <h3>{p.title}</h3>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{p.election_type} &middot; {p.start_date} to {p.end_date}</div>
            </div>
            <span className={`badge ${p.has_voted ? "badge-success" : "badge-warning"}`}>{p.has_voted ? "VOTED" : "NOT YET VOTED"}</span>
          </div>
          <div className="card-body">
            {p.positions?.map((pos) => (
              <div key={pos.poll_position_id} style={{ marginBottom: "1rem" }}>
                <strong>{pos.position_title}</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginLeft: "0.5rem" }}>({pos.max_winners} seat{pos.max_winners > 1 ? "s" : ""})</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {pos.candidates.map((c) => (
                    <span key={c.id} className="badge badge-info" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
                      {c.full_name} ({c.party})
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {!p.has_voted && <Link href="/voter/vote" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>Cast Vote →</Link>}
          </div>
        </div>
      ))}
      {polls.length === 0 && <div className="card"><div className="empty-state"><p>No open polls at this time.</p></div></div>}
    </>
  );
}
