import React, { useState } from "react";
import { API_BASE_URL } from "../config";

const localImages = [
  "/images/news_1.jpg", "/images/news_2.jpg", "/images/news_3.jpg",
  "/images/news_4.jpg", "/images/news_5.jpg", "/images/news_6.jpg", 
  "/images/news_7.jpg", "/images/news_8.jpg", "/images/news_9.jpg", 
  "/images/news_10.jpg", "/images/news_11.jpg", "/images/news_12.jpg", 
  "/images/news_13.jpg", "/images/news_14.jpg", "/images/news_15.jpg",
];

// Helper to get a persistent image per article ID
const getArticleImage = (article) => {
  if (!article) return localImages[0];
  const numericId = Number(article.id) || Math.abs(article.title?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) || 1;
  return localImages[numericId % localImages.length];
};

// Helper to format date to Eastern Time
const formatToEST = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if parsing fails

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export default function NewsCard({ article, index, onArticleClick }) {
  const [speaking, setSpeaking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);

  const [modal, setModal] = useState({ show: false, title: "", message: "" });

  // UPDATED: Now strictly cuts off at 50 words
  const getTruncatedSummary = (text) => {
    if (!text) return "Summary unavailable.";
    const words = text.split(/\s+/);
    if (words.length > 50) {
      return words.slice(0, 50).join(" ") + "...";
    }
    return text;
  };

  const handleListen = () => {
    if (speaking) {
      window.audioPlayer?.pause();
      setSpeaking(false);
      return;
    }
    if (window.audioPlayer) {
      window.audioPlayer.pause();
    }

    const textToSpeak = article.summary || article.title || "Summary unavailable.";
    const audioUrl = `${API_BASE_URL}/audio/?text=${encodeURIComponent(textToSpeak)}`;
    window.audioPlayer = new Audio(audioUrl);
    
    window.audioPlayer.onplay = () => setSpeaking(true);
    window.audioPlayer.onended = () => setSpeaking(false);
    window.audioPlayer.onerror = () => setSpeaking(false);

    window.audioPlayer.addEventListener("pause", () => {
      setSpeaking(false);
    });

    window.audioPlayer.play().catch(err => {
      console.error("Failed to play audio:", err);
      setSpeaking(false);
    });
  };

  const handleOpenExternal = () => {
    if (article.link) window.open(article.link, "_blank", "noopener,noreferrer");
  };

  const handleCardClick = () => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      handleOpenExternal();
    }
  };

  const submitQuery = async () => {
    if (!queryText.trim()) return;
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

  const articleImage = getArticleImage(article);

  return (
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
          <div style={{ backgroundColor: "#F3EEE3", border: "2px solid #161412", padding: "25px", maxWidth: "350px", width: "100%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", borderRadius: "4px", textAlign: "left", cursor: "default" }}>
            <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 10px 0", color: "#161412", fontSize: "17px" }}>{modal.title}</h3>
            <p style={{ fontSize: "13px", color: "#5E574C", lineHeight: "1.5", marginBottom: "20px" }}>{modal.message}</p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setModal({ show: false })} style={{ padding: "6px 16px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "11px" }}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Article Image */}
      <img className="news-image" src={articleImage} alt="" />

      <div className="news-content">
        <div className="meta">
          <span className="category">{(article.category || "NEWS").toUpperCase()}</span>
          <span>{article.source || "NEWS DESK"}</span><i />
          <span>{formatToEST(article.published) || "LATEST"}</span>
        </div>

        <h2>{article.title || article.original_title}</h2>
        <div className="rule" />
        
        {/* Render 50-word Truncated Summary */}
        <p>{getTruncatedSummary(article.summary)}</p>

        <div className="card-bottom" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button 
            className={`listen ${speaking ? "active" : ""}`} 
            onClick={(e) => { e.stopPropagation(); handleListen(); }}
          >
            <span>{speaking ? "■" : "▶"}</span> {speaking ? "STOP READING" : "LISTEN"}
          </button>
          
          <button 
            className="read" 
            onClick={(e) => { e.stopPropagation(); setShowModal(true); }} 
            style={{ backgroundColor: "#EBE4D5", color: "#161412" }}
          >
            SUBMIT QUERY <span>?</span>
          </button>

          <button 
            className="read" 
            onClick={(e) => { e.stopPropagation(); handleCardClick(); }} 
            style={{ marginLeft: "auto" }}
          >
            VIEW DETAILS <span>→</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(22,20,18,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, padding: "20px", cursor: "default" }}
        >
          <div style={{ backgroundColor: "#F3EEE3", padding: "30px", width: "100%", maxWidth: "400px", border: "2px solid #C9A227", borderRadius: "4px" }}>
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
  );
}
