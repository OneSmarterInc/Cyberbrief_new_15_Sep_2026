import React, { useEffect, useState, useMemo } from "react";
import { API_BASE_URL } from "../config";

const PROF_NAMES = [
  "Arion Vale", "Lyra Sen", "Kael Nore", "Elara Quinn", 
  "Dorian Kade", "Mira Solen", "Orion Blake", "Seraphina Rowe"
];

// Updated to match the new backend AI, Finance, and Cyber-Physical roles
const PROF_POSITIONS = [
  "Security Operations (SOC)",
  "Vulnerability & Application Security",
  "Threat Intelligence & Research",
  "Malware & Ransomware Security",
  "AI & Machine Learning Security",
  "Financial Cybersecurity & FinTech",
  "Cloud & Supply Chain Security",
  "Core Security & Cyber-Physical Defense"
];

const PROF_DESCRIPTIONS = [
  "A specialized look into real-time threat detection, incident response workflows, SIEM analytics, and security operations center readiness.",
  "Deep dives into zero-day vulnerabilities, application security flaws, code injection vectors, and enterprise patch management strategies.",
  "Tracking advanced persistent threat (APT) groups, threat actor tracking, dark web intelligence disclosures, and indicator telemetry.",
  "Analyzing emerging ransomware strains, infostealers, Trojans, rootkits, and reverse-engineering malicious payloads.",
  "Analyzing adversarial machine learning, LLM vulnerabilities, generative AI risks, and defending against automated AI-powered attacks.",
  "Investigating fintech breaches, smart contract vulnerabilities, payment network exploits, and financial fraud vectors.",
  "Examining multi-cloud security posture, container and Kubernetes vulnerabilities, and software supply chain risks.",
  "Covering cyber warfare, critical infrastructure defense, OT/ICS security, and national security implications."
];

const STAFF_VOICE_PROFILES = {
  1: { gender: "male", pitch: 0.85, rate: 0.95, voiceOffset: 0 },
  2: { gender: "female", pitch: 1.15, rate: 1.05, voiceOffset: 1 },
  3: { gender: "male", pitch: 0.70, rate: 0.90, voiceOffset: 2 },
  4: { gender: "female", pitch: 1.25, rate: 1.00, voiceOffset: 3 },
  5: { gender: "male", pitch: 0.95, rate: 1.00, voiceOffset: 4 },
  6: { gender: "female", pitch: 1.05, rate: 0.95, voiceOffset: 2 },
  7: { gender: "male", pitch: 0.80, rate: 1.05, voiceOffset: 1 },
  8: { gender: "female", pitch: 1.20, rate: 0.90, voiceOffset: 0 }
};

const getProfName = (id) => PROF_NAMES[(parseInt(id) || 1) - 1] || PROF_NAMES[0];
const getProfPosition = (id) => PROF_POSITIONS[(parseInt(id) || 1) - 1] || PROF_POSITIONS[0];
const getProfDescription = (id) => PROF_DESCRIPTIONS[(parseInt(id) || 1) - 1] || PROF_DESCRIPTIONS[0];

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
  const [speakingArticleId, setSpeakingArticleId] = useState(null);

  // States for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // States for Submit Query on the Newsroom Page
  const [queryArticle, setQueryArticle] = useState(null);
  const [queryText, setQueryText] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);

  // PRE-WARM VOICES BUG FIX
  useEffect(() => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prof = parseInt(params.get("prof")) || 1;
    setProfId(prof);
    setCurrentPage(1); // Reset to page 1 when changing professors
    window.scrollTo({ top: 0, behavior: "smooth" });

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [window.location.search]); // Depend on search params

  const profArticles = useMemo(() => {
    return articles.filter(a => (a.professor_id || 1) === profId);
  }, [articles, profId]);

  // Pagination Logic
  const totalPages = Math.ceil(profArticles.length / ITEMS_PER_PAGE);
  const currentArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return profArticles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [profArticles, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submitQuery = async () => {
    if (!queryText.trim() || !queryArticle?.id) return;
    setSubmitStatus("loading");
    try {
      const res = await fetch(`${API_BASE_URL}/news/${queryArticle.id}/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_text: queryText })
      });
      if (res.ok) {
        setSubmitStatus("success");
        setTimeout(() => {
          setQueryArticle(null);
          setSubmitStatus(null);
          setQueryText("");
        }, 1500);
      } else {
        setSubmitStatus(null);
        alert("Failed to send query to the editor. Please try again.");
      }
    } catch {
      setSubmitStatus(null);
      alert("Network Error: Could not connect to the server.");
    }
  };

  const handleListen = (e, article) => {
    e.stopPropagation();

    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (speakingArticleId === article.id) {
      window.speechSynthesis.cancel();
      setSpeakingArticleId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = `${article?.original_title || article?.title || ""}. ${article?.summary || ""}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    const profile = STAFF_VOICE_PROFILES[profId] || STAFF_VOICE_PROFILES[1];
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const englishVoices = voices.filter(v => v.lang.startsWith("en"));
      
      let genderFilteredVoices = englishVoices.filter(v => {
        const name = v.name.toLowerCase();
        if (profile.gender === "female") {
          return name.includes("female") || /zira|samantha|karen|victoria|moira|susan|hazel|amelia|olivia|tessa|ava|siri|melina|veena/i.test(name);
        } else {
          return name.includes("male") || /david|mark|george|daniel|oliver|james|ryan|arthur|alex|fred|bruce|albert|aaron|eddy|floyd|reed|rocko/i.test(name);
        }
      });

      // Mobile Fallback for Male Voices
      if (genderFilteredVoices.length === 0 && profile.gender === "male") {
        utterance.pitch = Math.max(0.1, profile.pitch - 0.4); 
      }

      let pool = genderFilteredVoices.length > 0 ? genderFilteredVoices : englishVoices;
      if (pool.length > 0) {
        const selectedIndex = profile.voiceOffset % pool.length;
        utterance.voice = pool[selectedIndex];
      }
    }

    utterance.onstart = () => setSpeakingArticleId(article.id);
    utterance.onend = () => setSpeakingArticleId(null);
    utterance.onerror = () => setSpeakingArticleId(null);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="newsroom-page-wrapper" style={{ minHeight: "100vh", backgroundColor: "#F3EEE3", position: "relative" }}>
      
      <style>{`
        .newsroom-page-wrapper {
          padding: 40px 20px;
        }
        
        .newsroom-main-card {
          max-width: 1000px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border: 1px solid #EBE4D5;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          padding: 60px;
        }

        .newsroom-hero-img {
          width: 100%;
          height: 500px;
          object-fit: cover;
          object-position: top;
          border-bottom: 4px solid #161412;
        }

        .newsroom-title {
          font-family: Georgia, serif;
          font-size: 48px;
          color: #161412;
          margin: 0 0 15px 0;
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .newsroom-desc {
          font-family: Georgia, serif;
          font-style: italic;
          font-size: 22px;
          color: #5E574C;
          margin: 0 0 25px 0;
          line-height: 1.5;
        }

        /* Article List Items */
        .article-row {
          display: flex;
          gap: 25px;
          padding-bottom: 35px;
          border-bottom: 1px solid #EBE4D5;
          cursor: pointer;
          flex-direction: row;
        }

        .article-img {
          width: 220px;
          height: 150px;
          object-fit: cover;
          object-position: top;
          flex-shrink: 0;
          border: 1px solid #161412;
        }

        .article-content {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          flex: 1;
        }

        .article-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          flex-wrap: wrap;
          gap: 10px;
        }

        .article-btn-group {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .article-btn {
          padding: 6px 14px;
          font-weight: bold;
          cursor: pointer;
          border-radius: 3px;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .article-author-tag {
          font-size: 10px;
          color: #8F7118;
          font-weight: bold;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* Modals */
        .app-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: rgba(22,20,18,0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          cursor: default;
        }

        .app-modal-content {
          background-color: #F3EEE3;
          padding: 30px;
          width: 100%;
          max-width: 400px;
          border: 2px solid #C9A227;
          border-radius: 4px;
          box-sizing: border-box;
        }

        /* Pagination */
        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #161412;
          flex-wrap: wrap;
          gap: 15px;
        }

        .page-btn {
          padding: 12px 24px;
          border: none;
          font-weight: bold;
          transition: all 0.2s;
        }

        .page-btn:not(:disabled) {
          background-color: #161412;
          color: #F3EEE3;
          cursor: pointer;
        }

        .page-btn:disabled {
          background-color: #EBE4D5;
          color: #A39E93;
          cursor: not-allowed;
        }

        .page-indicator {
          font-size: 14px;
          font-weight: bold;
          color: #5E574C;
          letter-spacing: 1px;
          text-align: center;
        }

        /* Responsive Breakpoints */
        @media (max-width: 900px) {
          .newsroom-hero-img { height: 400px; }
          .newsroom-title { font-size: 38px; }
          .newsroom-desc { font-size: 19px; }
        }

        @media (max-width: 768px) {
          .newsroom-page-wrapper { padding: 20px 10px; }
          .newsroom-main-card { padding: 25px; }
          .newsroom-hero-img { height: 280px; }
          .newsroom-title { font-size: 30px; }
          .newsroom-desc { font-size: 17px; }

          .article-row { flex-direction: column; gap: 15px; }
          .article-img { width: 100%; height: auto; aspect-ratio: 16/9; }
          
          .article-actions { flex-direction: column; align-items: stretch; gap: 15px; margin-top: 20px; }
          .article-btn-group { flex-direction: column; align-items: stretch; width: 100%; }
          .article-btn { width: 100%; justify-content: center; padding: 10px; }
          .article-author-tag { text-align: center; margin-top: 5px; }
          
          .app-modal-content { padding: 20px; }

          /* Responsive Pagination */
          .pagination-container { flex-direction: column; align-items: stretch; }
          .page-btn { width: 100%; }
          .page-indicator { margin: 10px 0; }
        }
      `}</style>

      {/* Submit Query Modal */}
      {queryArticle && (
        <div className="app-modal-overlay" onClick={(e) => { e.stopPropagation(); setQueryArticle(null); }}>
          <div className="app-modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 15px 0", fontFamily: "Georgia, serif", color: "#161412" }}>Submit Query to Editor</h3>
            <p style={{ fontSize: "12px", color: "#5E574C", marginBottom: "15px" }}>Ask a question or report an issue regarding this specific story.</p>
            
            <textarea 
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="What would you like to ask?"
              style={{ width: "100%", height: "100px", padding: "10px", border: "1px solid #161412", backgroundColor: "#fff", outline: "none", resize: "none", marginBottom: "15px", fontFamily: "Arial", color: "#161412", boxSizing: "border-box" }}
            />
            
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button 
                onClick={() => setQueryArticle(null)} 
                style={{ padding: "8px 15px", border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold", color: "#5E574C" }}
              >
                CANCEL
              </button>
              <button 
                onClick={submitQuery} 
                disabled={submitStatus === "loading" || !queryText.trim()}
                style={{ padding: "8px 15px", border: "none", background: "#161412", color: "#F3EEE3", cursor: "pointer", fontWeight: "bold", borderRadius: "3px" }}
              >
                {submitStatus === "loading" ? "SENDING..." : submitStatus === "success" ? "SENT!" : "SUBMIT"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="newsroom-main-card">
        
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "#8F7118", fontWeight: "bold", fontSize: "13px", marginBottom: "30px", display: "flex", alignItems: "center", gap: "5px", letterSpacing: "1px" }}>
          ← BACK TO FEED
        </button>

        <div style={{ marginBottom: "60px" }}>
          <img 
            src={`/images/Proff_${profId}.png`} 
            alt={getProfName(profId)} 
            className="newsroom-hero-img"
          />
          
          <div style={{ marginTop: "35px" }}>
            <div style={{ display: "inline-block", border: "1px solid #C9A227", color: "#C9A227", padding: "4px 10px", fontSize: "12px", fontWeight: "bold", letterSpacing: "1.5px", marginBottom: "20px", textTransform: "uppercase" }}>
              {getProfPosition(profId)}
            </div>
            
            <h1 className="newsroom-title">
              Intelligence Briefings by {getProfName(profId)}
            </h1>
            
            <p className="newsroom-desc">
              {getProfDescription(profId)}
            </p>
            
            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#8F7118", letterSpacing: "1px", textTransform: "uppercase" }}>
              BY {getProfName(profId).toUpperCase()}, {getProfPosition(profId).toUpperCase()} LEAD
            </div>
          </div>
        </div>

        <div style={{ borderBottom: "3px solid #161412", marginBottom: "40px", paddingBottom: "10px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "#161412", letterSpacing: "2px", textTransform: "uppercase" }}>
            MORE FROM THE WIRE
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
          {currentArticles.length > 0 ? (
            currentArticles.map(article => (
              <div 
                key={article.id} 
                onClick={() => onArticleClick(article)}
                className="article-row"
              >
                <img 
                  src={`/images/Proff_${profId}.png`} 
                  alt={getProfName(profId)} 
                  className="article-img"
                />
                <div className="article-content">
                  <div style={{ fontSize: "11px", color: "#8F7118", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>
                    {article.category || "TECHNOLOGY"} &nbsp; {formatToEST(article.published).toUpperCase()}
                  </div>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "24px", margin: "0 0 12px 0", color: "#161412", lineHeight: "1.2" }}>
                    {article.original_title || article.title}
                  </h3>
                  <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "16px", color: "#5E574C", margin: "0 0 15px 0", lineHeight: "1.5" }}>
                    {article.summary ? article.summary.substring(0, 180) + "..." : "Summary unavailable."}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="article-actions">
                    <div className="article-btn-group">
                      <button 
                        className="article-btn"
                        onClick={(e) => handleListen(e, article)}
                        style={{ 
                          backgroundColor: speakingArticleId === article.id ? "#161412" : "transparent", 
                          color: speakingArticleId === article.id ? "#F3EEE3" : "#161412", 
                          border: "1px solid #161412"
                        }}
                      >
                        <span>{speakingArticleId === article.id ? "■" : "▶"}</span> 
                        {speakingArticleId === article.id ? "STOP READING" : `LISTEN`}
                      </button>

                      <button 
                        className="article-btn"
                        onClick={(e) => { e.stopPropagation(); setQueryArticle(article); }}
                        style={{ 
                          backgroundColor: "#EBE4D5", color: "#161412", border: "none"
                        }}
                      >
                        SUBMIT QUERY <span style={{ fontSize: "13px", fontWeight: "900" }}>?</span>
                      </button>
                    </div>

                    <div className="article-author-tag">
                      BY {getProfName(profId).toUpperCase()}, CORRESPONDENT
                    </div>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-container">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1} 
              className="page-btn"
            >
              &larr; PREVIOUS
            </button>
            <span className="page-indicator">
              PAGE {currentPage} OF {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages} 
              className="page-btn"
            >
              NEXT &rarr;
            </button>
          </div>
        )}

      </div>
    </div>
  );
}