"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function ResultsPage() {
  const [polls, setPolls] = useState([]);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    api.get("/elections/polls/").then((d) => setPolls(d.results || [])).catch(() => {});
  }, []);

  const loadResults = async (id) => {
    setSelected(id);
    try { const d = await api.get(`/voting/results/${id}/`); setResults(d); }
    catch { setResults(null); }
  };

  return (
    <>
      <div className="page-header"><div><h1>Poll Results</h1><p className="subtitle">View voting outcomes</p></div></div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="card-body">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Select a Poll</label>
            <select className="form-select" value={selected || ""} onChange={(e) => loadResults(parseInt(e.target.value))}>
              <option value="">Choose poll...</option>
              {polls.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.status})</option>)}
            </select>
          </div>
        </div>
      </div>

      {results && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3>{results.poll_title}</h3>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem" }}>
                {results.election_type} &middot; <span className={`badge ${results.status === "open" ? "badge-success" : "badge-danger"}`}>{results.status.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="grid-stats" style={{ marginBottom: "2rem" }}>
              <div className="stat-card"><div className="stat-value">{results.total_votes_cast}</div><div className="stat-label">Total Votes</div></div>
              <div className="stat-card"><div className="stat-value">{results.total_eligible}</div><div className="stat-label">Eligible Voters</div></div>
              <div className="stat-card"><div className="stat-value" style={{ color: results.turnout_percentage > 50 ? "var(--green)" : "var(--red)" }}>{results.turnout_percentage}%</div><div className="stat-label">Turnout</div></div>
            </div>

            {results.positions?.map((pos) => (
              <div key={pos.position_id} style={{ marginBottom: "2rem" }}>
                <h3 style={{ marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "2px solid var(--gold-light)" }}>
                  {pos.position_title}
                  <span style={{ fontSize: "0.8rem", color: "var(--gray-400)", fontFamily: "var(--font-body)", marginLeft: "0.5rem" }}>({pos.max_winners} seat{pos.max_winners > 1 ? "s" : ""})</span>
                </h3>
                {pos.results.map((r) => (
                  <div className="result-bar-wrap" key={r.candidate_id}>
                    <div className="result-bar-info">
                      <span className="name">
                        {r.is_winner && <span style={{ color: "var(--green)", marginRight: "0.5rem" }}>★</span>}
                        {r.candidate_name} <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>({r.party})</span>
                      </span>
                      <span>{r.vote_count} votes ({r.percentage}%)</span>
                    </div>
                    <div className="result-bar-track">
                      <div className={`result-bar-fill ${r.is_winner ? "winner" : "other"}`} style={{ width: `${Math.max(r.percentage, 3)}%` }}>
                        {r.percentage > 8 ? `${r.percentage}%` : ""}
                      </div>
                    </div>
                  </div>
                ))}
                {pos.abstain_count > 0 && (
                  <p style={{ fontSize: "0.85rem", color: "var(--gray-400)", marginTop: "0.5rem" }}>
                    Abstained: {pos.abstain_count} ({pos.total_votes > 0 ? ((pos.abstain_count / pos.total_votes) * 100).toFixed(1) : 0}%)
                  </p>
                )}
                {pos.results.length === 0 && <p style={{ color: "var(--gray-400)" }}>No votes recorded for this position.</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
