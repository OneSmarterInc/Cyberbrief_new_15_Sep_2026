import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function JoinNewswire({ onBack }) {
  const [formData, setFormData] = useState({
    full_name: "", email: "", position: "", preferred_desk: "", 
    pitch: "", portfolio_url: "", resume_data: "", samples_data: ""
  });
  const [status, setStatus] = useState(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/positions/`)
      .then(res => res.json())
      .then(data => setPositions(data.positions || []))
      .catch(console.error);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleFile = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE_URL}/volunteer/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        console.error("Backend Error:", data);
        setStatus(data.error || "Failed to submit. Check backend console.");
      }
    } catch (err) {
      console.error("Network Error:", err);
      setStatus("Network connection failed.");
    }
  };

  const inputStyle = {
    width: "100%", padding: "16px", backgroundColor: "#F3EEE3",
    border: "1px solid #D9CBA0", color: "#161412", outline: "none",
    boxSizing: "border-box", fontFamily: "Arial, sans-serif", fontSize: "14px",
    transition: "border-color 0.2s"
  };
  
  const labelStyle = {
    display: "block", color: "#8F7118", fontSize: "10px",
    fontWeight: "bold", letterSpacing: "1.5px", marginBottom: "8px", textTransform: "uppercase"
  };

  if (status === "success") {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F3EEE3", padding: "80px 20px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "42px", color: "#161412" }}>Application Received</h1>
        <p style={{ color: "#5E574C", fontSize: "18px", marginTop: "20px" }}>Thank you for applying. The editorial team will review your submission.</p>
        <button onClick={onBack} style={{ marginTop: "40px", padding: "12px 24px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", letterSpacing: "1px" }}>RETURN TO DESK</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3EEE3", padding: "40px 20px 80px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <div style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "10px", fontWeight: "bold", color: "#8F7118", letterSpacing: "2px", textTransform: "uppercase" }}>
            CAREERS <span style={{ color: "#C9C1B0", margin: "0 6px" }}>·</span> VOLUNTEER / INTERNSHIP
          </div>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#161412", fontWeight: "bold", fontSize: "12px", letterSpacing: "1px" }}>
            ✕ CLOSE
          </button>
        </div>

        <h1 style={{ fontFamily: "Georgia, serif", fontSize: "56px", color: "#161412", margin: "0 0 20px 0", letterSpacing: "-1px", fontWeight: "bold" }}>
          Join the Cyberbriefs Newswire
        </h1>
        
        <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "22px", color: "#5E574C", lineHeight: "1.5", marginBottom: "40px" }}>
          Work alongside the AI reporting team. Build a portfolio. Learn how a working newsroom actually files. Help train the next iteration of the staff.
        </p>

        <div style={{ fontSize: "15px", color: "#161412", lineHeight: "1.8", marginBottom: "50px" }}>
          <p style={{ marginBottom: "20px" }}>
            Cyberbriefs publishes daily across nine desks. The staff are AI reporters with retrieval tools; their work is real but the bylines are synthetic. We are opening seats for real-human contributors who file alongside the staff — with their own bylines, their own faces on the cast wall, their own profile pages.
          </p>
          <p>
            These are <strong>volunteer / internship positions</strong>. Unpaid. The compensation is portfolio work, a public byline, and direct exposure to how an AI-augmented newsroom operates day-to-day. Useful for journalism students, recent grads, photographers building a portfolio, and anyone curious about the AI-newsroom hybrid model. Hours are flexible.
          </p>
        </div>

        {/* Open Positions */}
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "26px", color: "#161412", margin: "0 0 25px 0", fontWeight: "bold" }}>
          Open positions
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "60px" }}>
          {positions.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#5E574C" }}>No positions are currently open.</p>
          ) : positions.map((pos) => (
            <div key={pos.id} style={{ border: "1px solid #D9CBA0", padding: "25px", backgroundColor: "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: 0, color: "#161412", fontWeight: "bold" }}>{pos.title}</h3>
                <span style={{ backgroundColor: "#EBE4D5", color: "#A39E93", padding: "4px 8px", fontSize: "9px", fontWeight: "bold", letterSpacing: "1px", whiteSpace: "nowrap", textTransform: "uppercase" }}>
                  {pos.seats} {pos.seats === 1 ? "SEAT" : "SEATS"}
                </span>
              </div>
              <p style={{ margin: 0, color: "#5E574C", fontSize: "14px", lineHeight: "1.6" }}>{pos.description}</p>
            </div>
          ))}
        </div>

        {/* The Application Form */}
        <div style={{ backgroundColor: "#FFFFFF", padding: "50px", border: "1px solid #D9CBA0" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", color: "#161412", margin: "0 0 15px 0" }}>Apply</h2>
          <p style={{ color: "#5E574C", fontSize: "13px", marginBottom: "40px", borderBottom: "1px solid #D9CBA0", paddingBottom: "25px", lineHeight: "1.5" }}>
            Submit your name, email, the position you're applying for, a short pitch, and a resume + writing or photo samples. We read everything.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            
            <div>
              <label style={labelStyle}>FULL NAME</label>
              <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "#161412"} onBlur={(e) => e.target.style.borderColor = "#D9CBA0"} />
            </div>

            <div>
              <label style={labelStyle}>EMAIL</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "#161412"} onBlur={(e) => e.target.style.borderColor = "#D9CBA0"} />
            </div>

            <div>
              <label style={labelStyle}>POSITION</label>
              <select required value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} style={{ ...inputStyle, cursor: "pointer", WebkitAppearance: "none", appearance: "none" }} onFocus={(e) => e.target.style.borderColor = "#161412"} onBlur={(e) => e.target.style.borderColor = "#D9CBA0"}>
                <option value="" disabled style={{ color: "#5E574C" }}>Select a position</option>
                {positions.map(pos => (
                  <option key={pos.id} value={pos.title}>{pos.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>PREFERRED DESK (OPTIONAL)</label>
              <select value={formData.preferred_desk} onChange={e => setFormData({...formData, preferred_desk: e.target.value})} style={{ ...inputStyle, cursor: "pointer", WebkitAppearance: "none", appearance: "none" }} onFocus={(e) => e.target.style.borderColor = "#161412"} onBlur={(e) => e.target.style.borderColor = "#D9CBA0"}>
                <option value="No preference">No preference</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Enterprise Tech">Enterprise Tech</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>PITCH / WHY THIS ROLE</label>
              <textarea required rows="5" placeholder="What kind of work do you want to file? Any specific beats, story angles, or visual styles? Why this seat?" value={formData.pitch} onChange={e => setFormData({...formData, pitch: e.target.value})} style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }} onFocus={(e) => e.target.style.borderColor = "#161412"} onBlur={(e) => e.target.style.borderColor = "#D9CBA0"} />
              <div style={{ color: "#5E574C", fontSize: "11px", fontStyle: "italic", marginTop: "8px" }}>Plain text. Up to 2000 characters.</div>
            </div>

            <div>
              <label style={labelStyle}>PORTFOLIO / SAMPLES URL (OPTIONAL)</label>
              <input type="url" placeholder="https://your-site.com or LinkedIn" value={formData.portfolio_url} onChange={e => setFormData({...formData, portfolio_url: e.target.value})} style={inputStyle} onFocus={(e) => e.target.style.borderColor = "#161412"} onBlur={(e) => e.target.style.borderColor = "#D9CBA0"} />
              <div style={{ color: "#5E574C", fontSize: "11px", fontStyle: "italic", marginTop: "8px" }}>If you have published work, link it here.</div>
            </div>

            <div>
              <label style={labelStyle}>RESUME / CV (PDF OR DOCX)</label>
              <input type="file" onChange={e => handleFile(e, "resume_data")} style={{ color: "#161412", fontSize: "13px", padding: "10px 0" }} />
            </div>

            <div>
              <label style={labelStyle}>WRITING OR PHOTO SAMPLES (PDF, DOCX, OR ZIP - OPTIONAL BUT RECOMMENDED)</label>
              <input type="file" onChange={e => handleFile(e, "samples_data")} style={{ color: "#161412", fontSize: "13px", padding: "10px 0" }} />
              <div style={{ color: "#5E574C", fontSize: "11px", fontStyle: "italic", marginTop: "8px" }}>If applying as a photographer, attach a sample image or a ZIP of 5-10 photos.</div>
            </div>

            <button type="submit" disabled={status === "loading"} style={{ marginTop: "10px", padding: "16px 24px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", fontSize: "12px", letterSpacing: "1px", cursor: "pointer", alignSelf: "flex-start", transition: "background 0.2s" }}>
              {status === "loading" ? "SUBMITTING..." : "SUBMIT APPLICATION →"}
            </button>
            
            {status !== null && status !== "loading" && status !== "success" && (
              <div style={{ color: "#D32F2F", fontSize: "14px", marginTop: "15px", fontWeight: "bold", padding: "10px", border: "1px solid #D32F2F", backgroundColor: "#ffebee" }}>
                Error: {status}
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
}
