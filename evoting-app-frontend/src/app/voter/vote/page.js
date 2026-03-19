"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function CastVotePage() {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [votes, setVotes] = useState({});
  const [step, setStep] = useState("select");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { api.get("/voting/open-polls/").then(setPolls).catch(() => {}); }, []);

  const available = polls.filter((p) => !p.has_voted);

  const selectCandidate = (ppId, candId) => {
    setVotes({ ...votes, [ppId]: candId });
  };

  const handleSubmit = async () => {
    if (!confirm("Confirm your votes? This cannot be undone.")) return;
    setLoading(true);
    try {
      const votePayload = selectedPoll.positions.map((pos) => {
        const choice = votes[pos.poll_position_id];
        if (choice === "abstain" || !choice) return { poll_position_id: pos.poll_position_id, abstain: true };
        return { poll_position_id: pos.poll_position_id, candidate_id: choice, abstain: false };
      });
      const res = await api.post("/voting/cast/", { poll_id: selectedPoll.id, votes: votePayload });
      setResult(res);
      setStep("done");
    } catch (err) {
      alert(err?.data?.detail || "Failed to cast vote.");
    } finally { setLoading(false); }
  };

  if (step === "done" && result) {
    return (
      <>
        <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✓</div>
          <h1 style={{ color: "var(--green)", marginBottom: "0.5rem" }}>Vote Recorded Successfully</h1>
          <p style={{ color: "var(--gray-500)", marginBottom: "2rem" }}>Thank you for participating in the democratic process!</p>
          <div style={{ background: "var(--cream)", border: "2px dashed var(--gold)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "inline-block" }}>
            <p style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginBottom: "0.25rem" }}>VOTE REFERENCE</p>
            <p style={{ fontFamily: "monospace", fontSize: "1.5rem", color: "var(--gold-dark)", letterSpacing: "0.1em" }}>{result.vote_reference}</p>
          </div>
        </div>
      </>
    );
  }

  if (step === "confirm") {
    return (
      <>
        <div className="page-header"><div><h1>Confirm Your Votes</h1><p className="subtitle">{selectedPoll.title}</p></div></div>
        <div className="card">
          <div className="card-body">
            <div className="alert alert-warning">Please review carefully. Your vote cannot be changed after submission.</div>
            {selectedPoll.positions.map((pos) => {
              const choice = votes[pos.poll_position_id];
              const cand = pos.candidates.find((c) => c.id === choice);
              return (
                <div key={pos.poll_position_id} style={{ padding: "1rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--gray-400)", fontWeight: 600, textTransform: "uppercase" }}>{pos.position_title}</div>
                  {cand ? (
                    <div style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--green)", marginTop: "0.25rem" }}>{cand.full_name} <span style={{ fontWeight: 400, color: "var(--gray-500)" }}>({cand.party})</span></div>
                  ) : (
                    <div style={{ fontSize: "1.1rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>ABSTAINED</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--gray-200)", display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={() => setStep("vote")}>← Go Back</button>
            <button className="btn btn-success btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Confirm & Submit Vote"}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (step === "vote" && selectedPoll) {
    return (
      <>
        <div className="page-header">
          <div><h1>Cast Your Vote</h1><p className="subtitle">{selectedPoll.title}</p></div>
        </div>

        {selectedPoll.positions.map((pos) => (
          <div className="card" key={pos.poll_position_id} style={{ marginBottom: "1.5rem" }}>
            <div className="card-header">
              <h3>{pos.position_title}</h3>
              <span style={{ fontSize: "0.8rem", color: "var(--gray-400)" }}>{pos.max_winners} seat{pos.max_winners > 1 ? "s" : ""} — Select one candidate</span>
            </div>
            <div className="card-body">
              {pos.candidates.map((c) => (
                <div key={c.id} className={`vote-card ${votes[pos.poll_position_id] === c.id ? "selected" : ""}`}
                  onClick={() => selectCandidate(pos.poll_position_id, c.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="cand-name">{c.full_name}</div>
                      <div className="cand-party">{c.party}</div>
                      <div className="cand-details">Age: {c.age} &middot; Education: {c.education} &middot; Experience: {c.years_experience} yrs</div>
                      {c.manifesto && <div style={{ fontSize: "0.8rem", color: "var(--gray-500)", marginTop: "0.25rem", fontStyle: "italic" }}>{c.manifesto.slice(0, 120)}{c.manifesto.length > 120 ? "..." : ""}</div>}
                    </div>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${votes[pos.poll_position_id] === c.id ? "var(--gold)" : "var(--gray-300)"}`, background: votes[pos.poll_position_id] === c.id ? "var(--gold)" : "transparent", flexShrink: 0 }} />
                  </div>
                </div>
              ))}
              <div className={`vote-card ${votes[pos.poll_position_id] === "abstain" ? "selected" : ""}`}
                onClick={() => selectCandidate(pos.poll_position_id, "abstain")}
                style={{ borderStyle: "dashed" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><div className="cand-name" style={{ color: "var(--gray-400)" }}>Abstain / Skip</div></div>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px solid ${votes[pos.poll_position_id] === "abstain" ? "var(--gold)" : "var(--gray-300)"}`, background: votes[pos.poll_position_id] === "abstain" ? "var(--gold)" : "transparent", flexShrink: 0 }} />
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button className="btn btn-outline" onClick={() => setStep("select")}>← Back</button>
          <button className="btn btn-primary btn-lg" onClick={() => setStep("confirm")}>
            Review & Confirm →
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header"><div><h1>Cast Your Vote</h1><p className="subtitle">Select a poll to vote in</p></div></div>
      {available.length === 0 && <div className="card"><div className="empty-state"><p>No available polls to vote in.</p></div></div>}
      {available.map((p) => (
        <div className="card" key={p.id} style={{ marginBottom: "1rem", cursor: "pointer" }} onClick={() => { setSelectedPoll(p); setVotes({}); setStep("vote"); }}>
          <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3>{p.title}</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>{p.election_type} &middot; {p.positions?.length} position{p.positions?.length !== 1 ? "s" : ""}</p>
            </div>
            <button className="btn btn-primary">Vote →</button>
          </div>
        </div>
      ))}
    </>
  );
}
