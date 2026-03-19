"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Modal from "@/components/Modal";

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [positions, setPositions] = useState([]);
  const [stations, setStations] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [assignPP, setAssignPP] = useState(null);
  const [selectedCands, setSelectedCands] = useState([]);

  const load = () => {
    api.get("/elections/polls/").then((d) => setPolls(d.results || [])).catch(() => {});
    api.get("/elections/positions/").then((d) => setPositions(d.results || [])).catch(() => {});
    api.get("/elections/stations/").then((d) => setStations(d.results || [])).catch(() => {});
    api.get("/elections/candidates/").then((d) => setCandidates(d.results || [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const toggleSelect = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const createPoll = async () => {
    setError(""); setLoading(true);
    try {
      await api.post("/elections/polls/", {
        ...form,
        position_ids: form.position_ids || [],
        station_ids: form.station_ids || [],
      });
      setModal(null); load();
    } catch (err) { setError(err?.data ? Object.values(err.data).flat().join(", ") : "Failed."); }
    finally { setLoading(false); }
  };

  const toggleStatus = async (id, action) => {
    if (!confirm(`${action === "open" ? "Open" : "Close"} this poll?`)) return;
    try { await api.post(`/elections/polls/${id}/toggle-status/`, { action }); load(); }
    catch (err) { alert(err?.data?.detail || "Failed."); }
  };

  const deletePoll = async (id) => {
    if (!confirm("Delete this poll permanently?")) return;
    try { await api.del(`/elections/polls/${id}/delete/`); load(); }
    catch (err) { alert(err?.data?.detail || "Cannot delete."); }
  };

  const assignCandidates = async () => {
    setLoading(true);
    try {
      await api.post("/elections/polls/assign-candidates/", { poll_position_id: assignPP.id, candidate_ids: selectedCands });
      setAssignPP(null); setSelectedCands([]); load();
    } catch (err) { alert(err?.data?.detail || "Failed."); }
    finally { setLoading(false); }
  };

  const statusColor = (s) => s === "open" ? "badge-success" : s === "draft" ? "badge-warning" : "badge-danger";

  return (
    <>
      <div className="page-header">
        <div><h1>Polls & Elections</h1><p className="subtitle">Create and manage elections</p></div>
        <button className="btn btn-primary" onClick={() => { setForm({ title: "", description: "", election_type: "General", start_date: "", end_date: "", position_ids: [], station_ids: [] }); setError(""); setModal("create"); }}>+ New Poll</button>
      </div>

      {polls.map((poll) => (
        <div className="card" key={poll.id} style={{ marginBottom: "1rem" }}>
          <div className="card-header">
            <div>
              <h3 style={{ marginBottom: "0.25rem" }}>{poll.title}</h3>
              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                {poll.election_type} &middot; {poll.start_date} to {poll.end_date} &middot; <strong>{poll.total_votes_cast}</strong> votes
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span className={`badge ${statusColor(poll.status)}`}>{poll.status.toUpperCase()}</span>
              {poll.status === "draft" && <button className="btn btn-success btn-sm" onClick={() => toggleStatus(poll.id, "open")}>Open</button>}
              {poll.status === "open" && <button className="btn btn-danger btn-sm" onClick={() => toggleStatus(poll.id, "close")}>Close</button>}
              {poll.status === "closed" && <button className="btn btn-outline btn-sm" onClick={() => toggleStatus(poll.id, "open")}>Reopen</button>}
              {poll.status !== "open" && <button className="btn btn-outline btn-sm" style={{ color: "var(--red)", borderColor: "var(--red)" }} onClick={() => deletePoll(poll.id)}>Delete</button>}
            </div>
          </div>
          <div className="card-body">
            {poll.poll_positions?.map((pp) => (
              <div key={pp.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--gray-100)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{pp.position.title}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginLeft: "0.5rem" }}>({pp.position.max_winners} seat{pp.position.max_winners > 1 ? "s" : ""})</span>
                  </div>
                  {poll.status !== "open" && (
                    <button className="btn btn-outline btn-sm" onClick={() => { setAssignPP(pp); setSelectedCands(pp.candidates.map((c) => c.id)); }}>
                      Assign Candidates ({pp.candidates.length})
                    </button>
                  )}
                </div>
                {pp.candidates.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                    {pp.candidates.map((c) => (
                      <span key={c.id} className="badge badge-info">{c.full_name} ({c.party})</span>
                    ))}
                  </div>
                )}
                {pp.candidates.length === 0 && <p style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: "0.25rem" }}>No candidates assigned yet.</p>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {polls.length === 0 && <div className="card"><div className="empty-state"><p>No polls created yet.</p></div></div>}

      {modal === "create" && (
        <Modal title="Create New Poll" onClose={() => setModal(null)} footer={
          <><button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={createPoll} disabled={loading}>{loading ? "Creating..." : "Create"}</button></>
        }>
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={set("title")} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={set("description")} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div className="form-group"><label className="form-label">Type</label><select className="form-select" value={form.election_type} onChange={set("election_type")}><option>General</option><option>Primary</option><option>By-election</option><option>Referendum</option></select></div>
            <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.start_date} onChange={set("start_date")} /></div>
            <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.end_date} onChange={set("end_date")} /></div>
          </div>
          <div className="form-group">
            <label className="form-label">Positions</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {positions.filter((p) => p.is_active).map((p) => (
                <button key={p.id} type="button" className={`btn btn-sm ${form.position_ids?.includes(p.id) ? "btn-primary" : "btn-outline"}`}
                  onClick={() => { const ids = form.position_ids || []; setForm({ ...form, position_ids: ids.includes(p.id) ? ids.filter((x) => x !== p.id) : [...ids, p.id] }); }}>
                  {p.title}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Stations</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {stations.filter((s) => s.is_active).map((s) => (
                <button key={s.id} type="button" className={`btn btn-sm ${form.station_ids?.includes(s.id) ? "btn-primary" : "btn-outline"}`}
                  onClick={() => { const ids = form.station_ids || []; setForm({ ...form, station_ids: ids.includes(s.id) ? ids.filter((x) => x !== s.id) : [...ids, s.id] }); }}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {assignPP && (
        <Modal title={`Assign Candidates — ${assignPP.position.title}`} onClose={() => setAssignPP(null)} footer={
          <><button className="btn btn-outline" onClick={() => setAssignPP(null)}>Cancel</button><button className="btn btn-primary" onClick={assignCandidates} disabled={loading}>{loading ? "Saving..." : `Assign (${selectedCands.length})`}</button></>
        }>
          <p style={{ fontSize: "0.85rem", color: "var(--gray-500)", marginBottom: "1rem" }}>Select candidates for this position:</p>
          {candidates.filter((c) => c.is_active).map((c) => (
            <div key={c.id} className={`vote-card ${selectedCands.includes(c.id) ? "selected" : ""}`} onClick={() => toggleSelect(selectedCands, setSelectedCands, c.id)}>
              <div className="cand-name">{c.full_name}</div>
              <div className="cand-party">{c.party}</div>
              <div className="cand-details">Age: {c.age} &middot; Education: {c.education} &middot; Exp: {c.years_experience} yrs</div>
            </div>
          ))}
        </Modal>
      )}
    </>
  );
}
