import React, { useState } from "react";
import { API_BASE_URL } from "../config";

const localImages = [
  "/images/news_1.jpg", "/images/news_2.jpg", "/images/news_3.jpg",
  "/images/news_4.jpg", "/images/news_5.jpg", "/images/news_6.jpg", "/images/news_7.jpg",
];

export default function NewsCard({ article, index }) {
  const [speaking, setSpeaking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleListen = () => {
    // If this card is already speaking, pause it and reset state
    if (speaking) {
      window.audioPlayer?.pause();
      setSpeaking(false);
      return;
    }

    // Stop any other audio currently playing on the site (like the Navbar briefing)
    if (window.audioPlayer) {
      window.audioPlayer.pause();
    }

    const textToSpeak = article.summary || article.title || "Summary unavailable.";
    
    // Call the Django backend endpoint for the premium neural MP3
    const audioUrl = `${API_BASE_URL}/audio/?text=${encodeURIComponent(textToSpeak)}`;
    window.audioPlayer = new Audio(audioUrl);
    
    window.audioPlayer.onplay = () => setSpeaking(true);
    
    window.audioPlayer.onended = () => setSpeaking(false);
    
    window.audioPlayer.onerror = () => setSpeaking(false);

    // If another audio source interrupts this one, update the play button back to "LISTEN"
    window.audioPlayer.addEventListener("pause", () => {
      setSpeaking(false);
    });

    window.audioPlayer.play().catch(err => {
      console.error("Failed to play audio:", err);
      setSpeaking(false);
    });
  };

  const handleOpen = () => {
    if (article.link) window.open(article.link, "_blank", "noopener,noreferrer");
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
        }, 2000);
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    }
  };

  return (
    <article 
      className={`news-card ${index % 2 ? "reverse" : ""}`} 
      style={{ position: "relative", cursor: "pointer", transition: "opacity 0.2s" }}
      onClick={handleOpen}
      onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
      onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
    >
      <img className="news-image" src={localImages[index % localImages.length]} alt="" />

      <div className="news-content">
        <div className="meta">
          <span className="category">{(article.category || "NEWS").toUpperCase()}</span>
          <span>{article.source || "NEWS DESK"}</span><i />
          <span>{article.published || "LATEST"}</span>
        </div>

        <h2>{article.title || article.original_title}</h2>
        <div className="rule" />
        <p>{article.summary || "Summary unavailable."}</p>

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
            onClick={(e) => { e.stopPropagation(); handleOpen(); }} 
            style={{ marginLeft: "auto" }}
          >
            READ FULL STORY <span>→</span>
          </button>
        </div>
      </div>

      {/* QUERY MODAL */}
      {showModal && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(22,20,18,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, padding: "20px", cursor: "default" }}
        >
          <div style={{ backgroundColor: "#F3EEE3", padding: "30px", width: "100%", maxWidth: "400px", border: "2px solid #C9A227" }}>
            <h3 style={{ margin: "0 0 15px 0", fontFamily: "Georgia, serif", color: "#161412" }}>Submit Query to Editor</h3>
            <p style={{ fontSize: "12px", color: "#5E574C", marginBottom: "15px" }}>Ask a question or report an issue regarding this specific story.</p>
            
            <textarea 
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="What would you like to ask?"
              style={{ width: "100%", height: "100px", padding: "10px", border: "1px solid #161412", backgroundColor: "#fff", outline: "none", resize: "none", marginBottom: "15px", fontFamily: "Arial", color: "#161412" }}
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
                style={{ padding: "8px 15px", border: "none", background: "#161412", color: "#F3EEE3", cursor: "pointer", fontWeight: "bold" }}
              >
                {submitStatus === "loading" ? "SENDING..." : submitStatus === "success" ? "SENT!" : "SUBMIT"}
              </button>
            </div>
            {submitStatus === "error" && <p style={{ color: "red", fontSize: "12px", marginTop: "10px" }}>Failed to send query. Try again.</p>}
          </div>
        </div>
      )}
    </article>
  );
}