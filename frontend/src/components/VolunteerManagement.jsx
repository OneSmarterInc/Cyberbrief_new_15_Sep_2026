import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function VolunteerManagement({ authToken }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/volunteers/`, {
        headers: { "Authorization": `Token ${authToken}` }, credentials: 'include'
      });
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [authToken]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this application?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/admin/volunteers/${id}/`, {
        method: "DELETE", headers: { "Authorization": `Token ${authToken}` }, credentials: "include"
      });
      if (res.ok) setApplications(applications.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Parses Base64 and opens native PDF viewer in a new tab
  const handleOpenDocument = async (dataUrl) => {
    if (!dataUrl) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } catch (err) {
      alert("Could not open document. It may not be a valid PDF.");
    }
  };

  if (loading) return <p>Loading applications...</p>;

  return (
    <>
      <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px" }}>Volunteer Applications</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
        {applications.length === 0 ? (
          <p style={{ color: "#5E574C", fontStyle: "italic", fontSize: "16px" }}>No applications received yet.</p>
        ) : applications.map(app => (
          <div key={app.id} style={{ border: "1px solid #161412", padding: "25px", backgroundColor: "#fff", borderRadius: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
              <div>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "22px", fontFamily: "Georgia, serif" }}>{app.full_name}</h3>
                <p style={{ margin: 0, fontSize: "14px", color: "#5E574C" }}>
                  <a href={`mailto:${app.email}`} style={{ color: "#161412", fontWeight: "bold" }}>{app.email}</a> • Submitted on {app.created_at}
                </p>
              </div>
              <span style={{ backgroundColor: "#EBE4D5", color: "#161412", border: "1px solid #161412", padding: "5px 12px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>
                {app.position}
              </span>
            </div>
            
            {app.preferred_desk && (
              <p style={{ fontSize: "14px", margin: "0 0 15px 0" }}>
                <strong>Preferred Desk:</strong> {app.preferred_desk}
              </p>
            )}
            
            <div style={{ fontSize: "15px", fontStyle: "italic", color: "#5E574C", borderLeft: "4px solid #C9A227", paddingLeft: "15px", margin: "20px 0", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
              "{app.pitch}"
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "25px", paddingTop: "20px", borderTop: "1px solid #EBE4D5" }}>
              {app.portfolio_url && (
                <a href={app.portfolio_url} target="_blank" rel="noreferrer" style={{ padding: "8px 15px", backgroundColor: "#161412", color: "#F3EEE3", textDecoration: "none", fontSize: "12px", fontWeight: "bold" }}>
                  VIEW PORTFOLIO
                </a>
              )}
              
              {app.resume_data && (
                <div style={{ display: "flex", border: "1px solid #161412", overflow: "hidden" }}>
                  <button onClick={() => handleOpenDocument(app.resume_data)} style={{ padding: "8px 15px", backgroundColor: "#F3EEE3", border: "none", borderRight: "1px solid #161412", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                    VIEW CV
                  </button>
                  <a href={app.resume_data} download={`Resume_${app.full_name.replace(/\s+/g, '_')}`} style={{ padding: "8px 15px", backgroundColor: "#fff", color: "#161412", textDecoration: "none", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center" }}>
                    DOWNLOAD
                  </a>
                </div>
              )}
              
              {app.samples_data && (
                <div style={{ display: "flex", border: "1px solid #161412", overflow: "hidden" }}>
                  <button onClick={() => handleOpenDocument(app.samples_data)} style={{ padding: "8px 15px", backgroundColor: "#F3EEE3", border: "none", borderRight: "1px solid #161412", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                    VIEW SAMPLES
                  </button>
                  <a href={app.samples_data} download={`Samples_${app.full_name.replace(/\s+/g, '_')}`} style={{ padding: "8px 15px", backgroundColor: "#fff", color: "#161412", textDecoration: "none", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center" }}>
                    DOWNLOAD
                  </a>
                </div>
              )}
              
              <button onClick={() => handleDelete(app.id)} style={{ padding: "8px 15px", backgroundColor: "#D32F2F", color: "#FFF", border: "none", fontWeight: "bold", cursor: "pointer", marginLeft: "auto", fontSize: "12px" }}>
                DELETE APP
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
