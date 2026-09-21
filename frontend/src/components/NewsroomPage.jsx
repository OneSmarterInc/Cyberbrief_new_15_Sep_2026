import React, { useEffect, useState, useMemo } from "react";

const PROF_NAMES = [
  "Arion Vale", "Lyra Sen", "Kael Nore", "Elara Quinn", 
  "Dorian Kade", "Mira Solen", "Orion Blake", "Seraphina Rowe"
];
const getProfName = (id) => PROF_NAMES[(id || 1) - 1] || PROF_NAMES[0];

const formatToEST = (dateString) => {
  if (!dateString) return "Recent";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "EST", month: "short", day: "numeric", year: "numeric"
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export default function NewsroomPage({ articles, onBack, onArticleClick }) {
  const [profId, setProfId] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prof = parseInt(params.get("prof")) || 1;
    setProfId(prof);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const profArticles = useMemo(() => {
    return articles.filter(a => (a.professor_id || 1) === profId);
  }, [articles, profId]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3EEE3", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", backgroundColor: "#FFFFFF", padding: window.innerWidth < 768 ? "20px" : "60px", border: "1px solid #EBE4D5", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#8F7118", fontWeight: "bold", fontSize: "13px", marginBottom: "30px", display: "flex", alignItems: "center", gap: "5px", letterSpacing: "1px" }}>
          ← BACK TO FEED
        </button>

        <div style={{ marginBottom: "60px" }}>
          <img 
            src={`/images/Proff_${profId}.png`} 
            alt={getProfName(profId)} 
            style={{ width: "100%", height: "500px", objectFit: "cover", objectPosition: "top", borderBottom: "4px solid #161412" }} 
          />
          
          <div style={{ marginTop: "35px" }}>
            <div style={{ display: "inline-block", border: "1px solid #C9A227", color: "#C9A227", padding: "4px 10px", fontSize: "12px", fontWeight: "bold", letterSpacing: "1.5px", marginBottom: "20px", textTransform: "uppercase" }}>
              Cybersecurity Desk
            </div>
            
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "48px", color: "#161412", margin: "0 0 15px 0", lineHeight: "1.1", letterSpacing: "-1px" }}>
              Intelligence Briefings by {getProfName(profId)}
            </h1>
            
            <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "22px", color: "#5E574C", margin: "0 0 25px 0", lineHeight: "1.5" }}>
              A curated look into emerging cyber threats, vulnerability assessments, and automated threat hunting. Reviewing all intelligence currently assigned to this desk.
            </p>
            
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#8F7118", letterSpacing: "1px", textTransform: "uppercase" }}>
              BY {getProfName(profId).toUpperCase()}, STAFF EDITOR
            </div>
          </div>
        </div>

        <div style={{ borderBottom: "3px solid #161412", marginBottom: "40px", paddingBottom: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "#161412", letterSpacing: "2px", textTransform: "uppercase" }}>
            MORE FROM THE WIRE
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
          {profArticles.length > 0 ? (
            profArticles.map(article => (
              <div 
                key={article.id} 
                onClick={() => onArticleClick(article)}
                style={{ display: "flex", gap: "25px", textDecoration: "none", color: "inherit", paddingBottom: "35px", borderBottom: "1px solid #EBE4D5", cursor: "pointer", flexDirection: window.innerWidth < 768 ? "column" : "row" }}
              >
                {/* RESTORED TO PROFF IMAGE AND ADDED objectPosition: 'top' TO FIX CROPPING */}
                <img 
                  src={`/images/Proff_${profId}.png`} 
                  alt={getProfName(profId)} 
                  style={{ width: window.innerWidth < 768 ? "100%" : "220px", height: "150px", objectFit: "cover", objectPosition: "top", flexShrink: 0, border: "1px solid #161412" }}
                />
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontSize: "11px", color: "#8F7118", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                    {article.category || "TECHNOLOGY"} &nbsp; {formatToEST(article.published).toUpperCase()}
                  </div>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "24px", margin: "0 0 12px 0", color: "#161412", lineHeight: "1.2" }}>
                    {article.original_title || article.title}
                  </h3>
                  <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "16px", color: "#5E574C", margin: "0 0 15px 0", lineHeight: "1.5" }}>
                    {article.summary ? article.summary.substring(0, 180) + "..." : "Summary unavailable."}
                  </p>
                  <div style={{ fontSize: "10px", color: "#8F7118", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}>
                    BY {getProfName(profId).toUpperCase()}, CORRESPONDENT
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "60px", color: "#5E574C", fontStyle: "italic", fontSize: "18px" }}>
              No articles are currently assigned to {getProfName(profId)}'s desk.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
