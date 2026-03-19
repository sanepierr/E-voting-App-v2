"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function VoterResultsPage() {
  const [results, setResults] = useState([]);
  useEffect(() => { api.get("/voting/results/closed/").then(setResults).catch(() => {}); }, []);

  return (
    <>
      <div className="page-header"><div><h1>Election Results</h1><p className="subtitle">Outcomes from completed elections</p></div></div>
      {results.length === 0 && <div className="card"><div className="empty-state"><p>No closed polls with results.</p></div></div>}
      {results.map((r) => (
        <div className="card" key={r.poll_id} style={{ marginBottom: "1.5rem" }}>
          <div className="card-header">
            <div>
              <h3>{r.poll_title}</h3>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>{r.election_type} &middot; {r.total_votes_cast} votes &middot; {r.turnout_percentage}% turnout</div>
            </div>
          </div>
          <div className="card-body">
            {r.positions?.map((pos) => (
              <div key={pos.position_id} style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "2px solid var(--gold-light)" }}>{pos.position_title}</h3>
                {pos.results.map((c) => (
                  <div className="result-bar-wrap" key={c.candidate_id}>
                    <div className="result-bar-info">
                      <span className="name">{c.is_winner && <span style={{ color: "var(--green)", marginRight: "0.5rem" }}>★</span>}{c.candidate_name} <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>({c.party})</span></span>
                      <span>{c.vote_count} ({c.percentage}%)</span>
                    </div>
                    <div className="result-bar-track">
                      <div className={`result-bar-fill ${c.is_winner ? "winner" : "other"}`} style={{ width: `${Math.max(c.percentage, 3)}%` }} />
                    </div>
                  </div>
                ))}
                {pos.abstain_count > 0 && <p style={{ fontSize: "0.85rem", color: "var(--gray-400)", marginTop: "0.5rem" }}>Abstained: {pos.abstain_count}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
