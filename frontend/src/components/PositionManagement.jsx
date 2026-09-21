import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function PositionManagement({ authToken }) {
  const [positions, setPositions] = useState([]);
  const [form, setForm] = useState({ title: "", seats: "", description: "" });
  const [loading, setLoading] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", seats: "", description: "" });

  const fetchPositions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/positions/`, {
        headers: { "Authorization": `Token ${authToken}` }, credentials: 'include'
      });
      const data = await res.json();
      setPositions(data.positions || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPositions(); }, [authToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/positions/`, {
        method: "POST",
        headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ title: "", seats: "", description: "" });
        fetchPositions();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await fetch(`${API_BASE_URL}/admin/positions/${id}/`, {
        method: "PUT",
        headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchPositions();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this open position?")) return;
    try {
      await fetch(`${API_BASE_URL}/admin/positions/${id}/`, {
        method: "DELETE", headers: { "Authorization": `Token ${authToken}` }, credentials: "include"
      });
      fetchPositions();
    } catch (err) { console.error(err); }
  };

  const startEdit = (pos) => {
    setEditingId(pos.id);
    setEditForm({ title: pos.title, seats: pos.seats, description: pos.description });
  };

  const saveEdit = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/admin/positions/${id}/`, {
        method: "PUT",
        headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm)
      });
      setEditingId(null);
      fetchPositions();
    } catch (err) { console.error(err); }
  };

  const inputStyle = { width: "100%", padding: "10px", border: "1px solid #C9C1B0", outline: "none", fontSize: "14px", boxSizing: "border-box" };

  return (
    <>
      <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px" }}>Manage Career Positions</h1>
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: "#fff", border: "1px solid #161412", padding: "20px", marginTop: "20px", marginBottom: "30px" }}>
        <h3 style={{ margin: "0 0 15px 0" }}>Create New Position</h3>
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "15px", marginBottom: "15px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>POSITION TITLE</label>
            <input required type="text" placeholder="e.g. Volunteer Journalist" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>SEATS (NUMBER)</label>
            <input required type="number" min="1" placeholder="e.g. 2" value={form.seats} onChange={e => setForm({...form, seats: e.target.value})} style={inputStyle} />
          </div>
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px" }}>DESCRIPTION</label>
          <textarea required rows="3" placeholder="Job responsibilities and requirements..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ ...inputStyle, resize: "vertical" }} />
        </div>
        <button type="submit" disabled={loading} style={{ padding: "10px 20px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer" }}>
          {loading ? "ADDING..." : "ADD POSITION"}
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {positions.map(pos => (
          <div key={pos.id} style={{ border: "1px solid #EBE4D5", padding: "20px", backgroundColor: "#fff", opacity: pos.is_active ? 1 : 0.6 }}>
            
            {editingId === pos.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} style={inputStyle} />
                <input type="number" value={editForm.seats} onChange={e => setEditForm({...editForm, seats: e.target.value})} style={inputStyle} />
                <textarea rows="3" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} style={{ ...inputStyle, resize: "vertical" }} />
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button onClick={() => saveEdit(pos.id)} style={{ padding: "6px 15px", backgroundColor: "#1F3A2E", color: "#FFF", border: "none", cursor: "pointer", fontWeight: "bold" }}>SAVE</button>
                  <button onClick={() => setEditingId(null)} style={{ padding: "6px 15px", backgroundColor: "#EBE4D5", color: "#161412", border: "1px solid #161412", cursor: "pointer", fontWeight: "bold" }}>CANCEL</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <h3 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "20px" }}>
                    {pos.title} {!pos.is_active && "(HIDDEN)"}
                  </h3>
                  <span style={{ backgroundColor: "#F3EEE3", color: "#8F7118", padding: "4px 10px", fontSize: "10px", fontWeight: "bold", letterSpacing: "1px" }}>
                    {pos.seats} {pos.seats === 1 ? "SEAT" : "SEATS"}
                  </span>
                </div>
                <p style={{ margin: "0 0 15px 0", color: "#5E574C", fontSize: "14px" }}>{pos.description}</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => startEdit(pos)} style={{ padding: "6px 12px", backgroundColor: "#EBE4D5", color: "#161412", border: "1px solid #161412", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                    EDIT
                  </button>
                  <button onClick={() => handleToggle(pos.id, pos.is_active)} style={{ padding: "6px 12px", backgroundColor: pos.is_active ? "#EBE4D5" : "#1F3A2E", color: pos.is_active ? "#161412" : "#F3EEE3", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                    {pos.is_active ? "HIDE" : "PUBLISH"}
                  </button>
                  <button onClick={() => handleDelete(pos.id)} style={{ padding: "6px 12px", backgroundColor: "#D32F2F", color: "#F3EEE3", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "bold", marginLeft: "auto" }}>
                    DELETE
                  </button>
                </div>
              </>
            )}

          </div>
        ))}
      </div>
    </>
  );
}
