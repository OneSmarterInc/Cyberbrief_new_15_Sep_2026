import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const PROF_NAMES = [
  "Arion Vale", "Lyra Sen", "Kael Nore", "Elara Quinn", 
  "Dorian Kade", "Mira Solen", "Orion Blake", "Seraphina Rowe"
];

// Fallback logic requires strict number parsing
const getProfName = (id) => {
  const numericId = parseInt(id) || 1;
  return PROF_NAMES[numericId - 1] || PROF_NAMES[0];
};

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

const getRelativeTime = (dateString) => {
  if (!dateString) return "Just now";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? "year" : "years"} ago`;
  } catch (e) {
    return dateString;
  }
};

export default function NewsCard({ article, index, onArticleClick }) {
  // CRASH PREVENTION
  if (!article) return null;

  const [speaking, setSpeaking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [modal, setModal] = useState({ show: false, title: "", message: "" });

  // PRE-WARM VOICES BUG FIX: Forces browser to load voices immediately
  useEffect(() => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // GLOBAL AUDIO CONFLICT FIX: Listen for custom event to stop reading if another card starts
  useEffect(() => {
    const handleGlobalStopAudio = (e) => {
      // If the event detail ID doesn't match this article's ID, stop speaking
      if (e.detail !== article?.id && speaking) {
        setSpeaking(false);
      }
    };
    window.addEventListener("stop-other-audio", handleGlobalStopAudio);
    return () => window.removeEventListener("stop-other-audio", handleGlobalStopAudio);
  }, [speaking, article?.id]);

  const profId = parseInt(article?.professor_id) || 1;
  const fullName = getProfName(profId);
  const articleImage = `/images/Proff_${profId}.png`;

  const getTruncatedSummary = (text) => {
    if (!text) return "Summary unavailable.";
    const words = text.split(/\s+/);
    if (words.length > 50) {
      return words.slice(0, 50).join(" ") + "...";
    }
    return text;
  };

  const handleListen = () => {
    if (!('speechSynthesis' in window)) {
      setModal({ show: true, title: "Not Supported", message: "Text-to-speech is not supported by your browser." });
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Stop any other card currently reading before starting this one
    window.dispatchEvent(new CustomEvent("stop-other-audio", { detail: article?.id }));
    window.speechSynthesis.cancel();

    const textToSpeak = `${article?.ai_headline || article?.title || ""}. ${article?.summary || ""}`;
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

      // MOBILE FALLBACK: If we want a male voice but the phone only has female voices available
      if (genderFilteredVoices.length === 0 && profile.gender === "male") {
        // Artificially lower the pitch to simulate a male voice
        utterance.pitch = Math.max(0.1, profile.pitch - 0.4); 
      }

      let pool = genderFilteredVoices.length > 0 ? genderFilteredVoices : englishVoices;
      
      if (pool.length > 0) {
        const selectedIndex = profile.voiceOffset % pool.length;
        utterance.voice = pool[selectedIndex];
      }
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleOpenExternal = () => {
    if (article?.link) window.open(article.link, "_blank", "noopener,noreferrer");
  };

  const handleCardClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      handleOpenExternal();
    }
  };

  const submitQuery = async () => {
    if (!queryText.trim() || !article?.id) return;
    setSubmitStatus("loading");
    try {
      const res = await fetch(`${API_BASE_URL}/news/${article.id}/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_text: queryText })
      });
      if (res.ok) {
        setSubmitStatus("success");
        setTimeout(() => {
          setShowModal(false);
          setSubmitStatus(null);
          setQueryText("");
        }, 1500);
      } else {
        setSubmitStatus(null);
        setModal({ show: true, title: "Submission Error", message: "Failed to send query to the editor. Please try again." });
      }
    } catch {
      setSubmitStatus(null);
      setModal({ show: true, title: "Network Error", message: "Could not connect to the server." });
    }
  };

  return (
    <>
      {/* Responsive Styles scoped for NewsCard */}
      <style>{`
        @media (max-width: 850px) {
          .news-card {
            flex-direction: column !important;
            height: auto !important;
          }
          .news-card.reverse {
            flex-direction: column !important;
          }
          .news-card .news-image {
            width: 100% !important;
            height: 250px !important;
            max-height: 250px !important;
            object-fit: cover !important;
            object-position: center 15% !important;
          }
          .news-card .news-content {
            width: 100% !important;
            padding: 20px !important;
          }
          .news-card .card-bottom {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .news-card .card-bottom button {
            width: 100% !important;
            justify-content: center !important;
            margin-left: 0 !important;
          }
          .news-card .meta {
            flex-wrap: wrap !important;
            line-height: 1.6 !important;
          }
        }
      `}</style>

      <article 
        className={`news-card ${index % 2 ? "reverse" : ""}`} 
        style={{ position: "relative", cursor: "pointer", transition: "opacity 0.2s" }}
        onClick={handleCardClick}
        onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
        onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
      >
        {modal.show && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, padding: "20px" }}
          >
            <div style={{ backgroundColor: "#F3EEE3", border: "2px solid #161412", padding: "25px", maxWidth: "350px", width: "100%", boxSizing: "border-box", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", borderRadius: "4px", textAlign: "left", cursor: "default" }}>
              <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 10px 0", color: "#161412", fontSize: "17px" }}>{modal.title}</h3>
              <p style={{ fontSize: "13px", color: "#5E574C", lineHeight: "1.5", marginBottom: "20px" }}>{modal.message}</p>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setModal({ show: false })} style={{ padding: "6px 16px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>OK</button>
              </div>
            </div>
          </div>
        )}

        <img className="news-image" src={articleImage} alt={fullName} />

        <div className="news-content">
          <div className="meta">
            <span className="category">{(article?.category || "NEWS").toUpperCase()}</span>
            <span>{article?.source || "NEWS DESK"}</span><i />
            
            <span style={{ color: "#C9A227", fontWeight: "bold" }}>{fullName.toUpperCase()}</span><i />
            
            <span>{getRelativeTime(article?.published).toUpperCase()}</span>
          </div>

          <h2>{article?.title || article?.original_title || "Untitled Article"}</h2>
          <div className="rule" />
          
          <p>{getTruncatedSummary(article?.summary)}</p>

          <div className="card-bottom" style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginTop: "auto", paddingTop: "15px" }}>
            
            <button 
              className={`listen ${speaking ? "active" : ""}`} 
              onClick={(e) => { e.stopPropagation(); handleListen(); }}
              style={{ 
                backgroundColor: speaking ? "#161412" : "transparent", 
                color: speaking ? "#F3EEE3" : "#161412", 
                border: "1px solid #161412", 
                padding: "8px 16px", 
                fontWeight: "bold", 
                cursor: "pointer", 
                fontSize: "11px", 
                display: "flex", 
                alignItems: "center", 
                gap: "6px",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
            >
              <span>{speaking ? "■" : "▶"}</span> {speaking ? "STOP READING" : "LISTEN"}
            </button>
            
            <button 
              className="read" 
              onClick={(e) => { e.stopPropagation(); setShowModal(true); }} 
              style={{ 
                backgroundColor: "#EBE4D5", 
                color: "#161412", 
                border: "none", 
                padding: "9px 16px", 
                fontWeight: "bold", 
                cursor: "pointer", 
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
            >
              SUBMIT QUERY <span style={{ fontSize: "14px", fontWeight: "900" }}>?</span>
            </button>

            <button 
              className="read" 
              onClick={(e) => { e.stopPropagation(); handleCardClick(); }} 
              style={{ 
                marginLeft: "auto", 
                background: "transparent", 
                border: "none", 
                color: "#8F7118", 
                fontWeight: "bold", 
                fontSize: "11px", 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                textTransform: "uppercase",
                letterSpacing: "1px"
              }}
            >
              VIEW DETAILS <span style={{ fontSize: "14px" }}>→</span>
            </button>
          </div>
        </div>

        {showModal && (
          <div 
            onClick={(e) => e.stopPropagation()} 
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(22,20,18,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, padding: "20px", cursor: "default" }}
          >
            <div style={{ backgroundColor: "#F3EEE3", padding: "30px", width: "100%", maxWidth: "400px", border: "2px solid #C9A227", borderRadius: "4px", boxSizing: "border-box" }}>
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
                  onClick={(e) => { e.stopPropagation(); setShowModal(false); }} 
                  style={{ padding: "8px 15px", border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold", color: "#5E574C" }}
                >
                  CANCEL
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); submitQuery(); }} 
                  disabled={submitStatus === "loading" || !queryText.trim()}
                  style={{ padding: "8px 15px", border: "none", background: "#161412", color: "#F3EEE3", cursor: "pointer", fontWeight: "bold", borderRadius: "3px" }}
                >
                  {submitStatus === "loading" ? "SENDING..." : submitStatus === "success" ? "SENT!" : "SUBMIT"}
                </button>
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  );
}