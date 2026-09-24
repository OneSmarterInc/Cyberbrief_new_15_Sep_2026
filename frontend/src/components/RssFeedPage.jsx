import React, { useState, useMemo, useEffect } from "react";
import { API_BASE_URL } from "../config";

const feedImages = [
  "/images/Feed_1.jpg", "/images/Feed_2.jpg", "/images/Feed_3.jpg",
  "/images/Feed_4.jpg", "/images/Feed_5.jpg", "/images/Feed_6.jpg", 
  "/images/Feed_7.jpg"
];

const PROF_NAMES = [
  "Arion Vale", "Lyra Sen", "Kael Nore", "Elara Quinn", 
  "Dorian Kade", "Mira Solen", "Orion Blake", "Seraphina Rowe"
];
const getProfName = (id) => PROF_NAMES[(id || 1) - 1] || PROF_NAMES[0];

const getArticleImage = (article) => {
  if (!article) return "/images/Proff_1.png";
  const profId = article.professor_id || 1; 
  return `/images/Proff_${profId}.png`; 
};

// Added Voice Profiles for TTS
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

export default function RssFeedPage({ articles, onBack }) {
  const [selectedSource, setSelectedSource] = useState(() => {
    return new URLSearchParams(window.location.search).get("source") || null;
  });
  const [selectedArticleId, setSelectedArticleId] = useState(() => {
    return new URLSearchParams(window.location.search).get("article") || null;
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [dbSources, setDbSources] = useState([]);

  // TTS and Submit Query States
  const [speakingArticleId, setSpeakingArticleId] = useState(null);
  const [queryArticle, setQueryArticle] = useState(null);
  const [queryText, setQueryText] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    // Fetch all feeds from database
    fetch(`${API_BASE_URL}/admin/feeds/?limit=500`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        const feedList = data.results || data.feeds || data || [];
        if (Array.isArray(feedList)) {
          const allNames = feedList.map(f => f.name || f.title || f);
          setDbSources(allNames);
        }
      })
      .catch(err => console.error("Failed to fetch RSS feeds", err));
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedSource(params.get("source"));
      setSelectedArticleId(params.get("article"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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

  // GLOBAL AUDIO CONFLICT FIX
  useEffect(() => {
    const handleGlobalStopAudio = (e) => {
      if (e.detail !== speakingArticleId && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
        setSpeakingArticleId(null);
      }
    };
    window.addEventListener("stop-other-audio", handleGlobalStopAudio);
    return () => window.removeEventListener("stop-other-audio", handleGlobalStopAudio);
  }, [speakingArticleId]);

  const selectedArticle = useMemo(() => {
    if (!selectedArticleId || !articles) return null;
    return articles.find(a => String(a.id) === String(selectedArticleId)) || null;
  }, [articles, selectedArticleId]);

  // Combine database sources and article sources, counting news volume, and sorting highest stories first
  const uniqueSources = useMemo(() => {
    const sourceCounts = {};
    articles.forEach(a => {
      if (a.source) {
        sourceCounts[a.source] = (sourceCounts[a.source] || 0) + 1;
      }
    });

    const allSourceNames = Array.from(new Set([...dbSources, ...articles.map(a => a.source).filter(Boolean)]));

    // Sort descending by article count (sources with the highest stories first)
    return allSourceNames.sort((a, b) => {
      const countA = sourceCounts[a] || 0;
      const countB = sourceCounts[b] || 0;
      if (countB !== countA) {
        return countB - countA; // Higher story count comes first
      }
      return a.localeCompare(b); // Alphabetical fallback if counts match
    });
  }, [dbSources, articles]);

  const sourceArticles = useMemo(() => {
    if (!selectedSource) return [];
    
    return articles.filter(a => {
      if (a.source !== selectedSource) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (a.original_title || a.title || "").toLowerCase().includes(query) ||
          (a.summary || "").toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [articles, selectedSource, searchQuery]);

  const handleBack = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingArticleId(null);

    if (selectedArticleId) {
      const url = `/rss?source=${encodeURIComponent(selectedSource)}`;
      window.history.pushState({}, "", url);
      setSelectedArticleId(null);
      window.scrollTo(0, 0);
    } else if (selectedSource) {
      window.history.pushState({}, "", "/rss");
      setSelectedSource(null);
      setSearchQuery("");
      window.scrollTo(0, 0);
    } else {
      onBack();
    }
  };

  const openSource = (source) => {
    const url = `/rss?source=${encodeURIComponent(source)}`;
    window.history.pushState({}, "", url);
    setSelectedSource(source);
    setSelectedArticleId(null);
    window.scrollTo(0, 0);
  };

  const openArticle = (article) => {
    const url = `/rss?source=${encodeURIComponent(selectedSource)}&article=${article.id}`;
    window.history.pushState({}, "", url);
    setSelectedArticleId(String(article.id));
    window.scrollTo(0, 0);
  };

  // TTS Handler
  const handleCardListen = (e, article) => {
    e.preventDefault();
    e.stopPropagation();

    if (!('speechSynthesis' in window)) return;

    if (speakingArticleId === article.id) {
      window.speechSynthesis.cancel();
      setSpeakingArticleId(null);
      return;
    }

    window.dispatchEvent(new CustomEvent("stop-other-audio", { detail: article.id }));
    window.speechSynthesis.cancel();

    const profId = parseInt(article.professor_id) || 1;
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

      if (genderFilteredVoices.length === 0 && profile.gender === "male") {
        utterance.pitch = Math.max(0.1, profile.pitch - 0.4); 
      }

      let pool = genderFilteredVoices.length > 0 ? genderFilteredVoices : englishVoices;
      if (pool.length > 0) {
        utterance.voice = pool[profile.voiceOffset % pool.length];
      }
    }

    utterance.onstart = () => setSpeakingArticleId(article.id);
    utterance.onend = () => setSpeakingArticleId(null);
    utterance.onerror = () => setSpeakingArticleId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Submit Query API
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

  return (
    <div className="rss-page-wrapper">
      <style>{`
        .rss-page-wrapper {
          min-height: 100vh;
          background-color: #F3EEE3;
          font-family: Arial, sans-serif;
          color: #161412;
          padding: 40px 20px;
          position: relative;
        }
        
        .rss-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Source Grid */
        .rss-source-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 40px;
        }

        .rss-source-card {
          background-color: #F3EEE3;
          border: 1px solid #161412;
          border-radius: 10px;
          padding: 40px 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }

        .rss-source-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.12);
        }

        /* Article List Card */
        .rss-article-card {
          display: flex;
          flex-direction: row;
          background-color: #F3EEE3;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0,0,0,0.04);
          border: 1px solid #161412;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .rss-article-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.08);
        }

        .rss-article-img-wrapper {
          width: 380px;
          min-width: 380px;
          padding: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0b1a13;
          flex-shrink: 0;
        }

        .rss-article-img-wrapper img {
          width: 100%;
          height: 240px;
          object-fit: contain;
          border-radius: 4px;
        }

        .rss-article-content {
          padding: 30px 40px 30px 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        /* Action Buttons */
        .article-btn-group {
          display: flex;
          gap: 12px;
          margin-top: auto;
          padding-top: 20px;
          flex-wrap: wrap;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .article-btn {
          padding: 8px 16px;
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

        .original-link {
          color: #d32f2f;
          text-decoration: none;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: bold;
        }

        .original-link:hover {
          opacity: 0.7;
        }

        /* Detail View */
        .rss-detail-hero {
          position: relative;
          width: 100%;
          height: 450px;
          background-color: #111;
        }

        .rss-detail-overlay {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%);
          padding: 50px 40px 30px 40px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .rss-detail-title {
          font-family: Georgia, serif;
          font-size: 36px;
          color: #F3EEE3;
          margin: 0 0 20px 0;
          line-height: 1.25;
          font-weight: bold;
        }

        .rss-detail-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #C9C1B0;
          padding-top: 25px;
          flex-wrap: wrap;
          gap: 20px;
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

        /* Breakpoints */
        @media (max-width: 900px) {
          .rss-detail-hero { height: 350px; }
          .rss-article-img-wrapper { width: 280px; min-width: 280px; padding: 15px; }
          .rss-article-img-wrapper img { height: 200px; }
        }

        @media (max-width: 768px) {
          .rss-page-wrapper { padding: 20px 15px; }
          
          /* Cards stack to columns */
          .rss-article-card { flex-direction: column; }
          .rss-article-img-wrapper { width: 100%; min-width: 100%; padding: 15px; height: 200px; }
          .rss-article-img-wrapper img { height: 100%; object-fit: cover; }
          .rss-article-content { padding: 20px; }
          .rss-article-content h3 { font-size: 20px !important; margin-bottom: 10px !important; }
          
          .article-btn-group { flex-direction: column; align-items: stretch; width: 100%; }
          .article-btn { justify-content: center; width: 100%; }
          .original-link { justify-content: center; width: 100%; margin-bottom: 10px; }
          
          /* Details shrink */
          .rss-detail-hero { height: 280px; }
          .rss-detail-overlay { padding: 30px 20px 20px 20px; }
          .rss-detail-title { font-size: 24px; margin-bottom: 15px; }
          
          /* Actions stack */
          .rss-detail-actions { flex-direction: column; align-items: stretch; gap: 15px; }
          .rss-detail-actions > div { flex-direction: column; align-items: stretch !important; gap: 10px; width: 100%; }
          .rss-detail-actions a, .rss-detail-actions button { width: 100%; justify-content: center; margin: 0 !important; }
        }

        @media (max-width: 480px) {
          .rss-source-grid { grid-template-columns: 1fr; gap: 20px; }
          .rss-source-card { padding: 30px 20px; }
        }
      `}</style>

      {/* Query Modal Overlay */}
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

      <div className="rss-container">
        
        {/* Render Details View */}
        {selectedArticle ? (
          (() => {
            const displayImage = getArticleImage(selectedArticle);
            let hash = 0;
            const sourceName = selectedArticle.source || "News";
            for (let i = 0; i < sourceName.length; i++) hash = sourceName.charCodeAt(i) + ((hash << 5) - hash);
            const avatarColor = "#" + "00000".substring(0, 6 - (hash & 0x00FFFFFF).toString(16).toUpperCase().length) + (hash & 0x00FFFFFF).toString(16).toUpperCase();
            
            return (
              <div style={{ maxWidth: "950px", margin: "0 auto", width: "100%" }}>
                <div style={{ backgroundColor: "#F3EEE3", borderRadius: "12px", border: "1px solid #161412", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
                  
                  <div className="rss-detail-hero">
                    <img 
                      src={displayImage} 
                      alt={getProfName(selectedArticle.professor_id)} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    
                    <div className="rss-detail-overlay">
                      <h1 className="rss-detail-title">
                        {selectedArticle.ai_headline || selectedArticle.title}
                      </h1>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ 
                          width: "36px", height: "36px", borderRadius: "50%", backgroundColor: avatarColor, 
                          display: "flex", alignItems: "center", justifyContent: "center", 
                          color: "#fff", fontWeight: "bold", fontSize: "16px", border: "2px solid #F3EEE3", flexShrink: 0
                        }}>
                          {sourceName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "bold", color: "#F3EEE3", letterSpacing: "0.5px" }}>
                            {sourceName} • {getProfName(selectedArticle.professor_id).toUpperCase()}
                          </div>
                          <div style={{ fontSize: "13px", color: "#C9C1B0", marginTop: "2px" }}>
                            {selectedArticle.published || "Recently Added"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: "40px", backgroundColor: "#F3EEE3" }}>
                    <p style={{ fontSize: "18px", color: "#161412", lineHeight: "1.8", margin: "0 0 50px 0", fontFamily: "Arial, sans-serif" }}>
                      {selectedArticle.summary || "No summary is available for this article at this time. Click the original article link below to read the full coverage."}
                    </p>
                    
                    <div className="rss-detail-actions">
                      <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                        {selectedArticle.link && (
                          <a 
                            href={selectedArticle.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: "#d32f2f", textDecoration: "none", fontSize: "15px", display: "flex", alignItems: "center", gap: "6px", transition: "opacity 0.2s", fontWeight: "bold" }}
                            onMouseOver={e => e.currentTarget.style.opacity = "0.7"}
                            onMouseOut={e => e.currentTarget.style.opacity = "1"}
                          >
                            Original Article 
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        )}

                        <button 
                          className="article-btn"
                          onClick={(e) => handleCardListen(e, selectedArticle)}
                          style={{ 
                            backgroundColor: speakingArticleId === selectedArticle.id ? "#161412" : "transparent", 
                            color: speakingArticleId === selectedArticle.id ? "#F3EEE3" : "#161412", 
                            border: "1px solid #161412"
                          }}
                        >
                          <span>{speakingArticleId === selectedArticle.id ? "■" : "▶"}</span> {speakingArticleId === selectedArticle.id ? "STOP READING" : "LISTEN"}
                        </button>

                        <button 
                          className="article-btn"
                          onClick={(e) => { e.stopPropagation(); setQueryArticle(selectedArticle); }}
                          style={{ backgroundColor: "#EBE4D5", color: "#161412", border: "none" }}
                        >
                          SUBMIT QUERY <span style={{ fontSize: "14px", fontWeight: "900" }}>?</span>
                        </button>
                      </div>

                      <button 
                        onClick={handleBack}
                        style={{ 
                          backgroundColor: "#d32f2f", color: "#ffffff", border: "none", 
                          padding: "12px 24px", fontWeight: "bold", cursor: "pointer", 
                          borderRadius: "6px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
                          transition: "background 0.2s, transform 0.1s" 
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = "#b71c1c"}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = "#d32f2f"}
                      >
                        <span style={{ fontSize: "16px", marginBottom: "2px" }}>←</span> Back to Articles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()

        /* Render Source Grid View */
        ) : !selectedSource ? (
          uniqueSources.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#F3EEE3", border: "1px solid #161412", borderRadius: "8px" }}>
              <p style={{ color: "#5E574C", fontSize: "18px" }}>No RSS sources currently found.</p>
            </div>
          ) : (
            <div className="rss-source-grid">
              {uniqueSources.map((source, index) => {
                const sourceImage = feedImages[index % feedImages.length];

                return (
                  <div 
                    key={source} 
                    onClick={() => openSource(source)}
                    className="rss-source-card"
                  >
                    <img 
                      src={sourceImage} 
                      alt={source}
                      style={{ 
                        width: "120px", 
                        height: "120px", 
                        borderRadius: "50%", 
                        objectFit: "cover",
                        marginBottom: "20px",
                        border: "2px solid #161412",
                        backgroundColor: "#EBE4D5" 
                      }}
                    />
                    <h3 style={{ margin: 0, fontSize: "22px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#161412", lineHeight: "1.3" }}>
                      {source}
                    </h3>
                  </div>
                );
              })}
            </div>
          )
        
        /* Render Article List View */
        ) : (
          <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
            
            <h1 style={{ textAlign: "center", color: "#161412", fontFamily: "Georgia, serif", fontSize: "clamp(28px, 6vw, 42px)", fontWeight: "bold", margin: "0 0 25px 0" }}>
              {selectedSource}
            </h1>

            <div style={{ display: "flex", justifyContent: "center", marginBottom: "50px" }}>
              <input 
                type="text" 
                placeholder="Search news by title or summary..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: "100%", 
                  maxWidth: "800px", 
                  padding: "16px 25px", 
                  fontSize: "16px", 
                  borderRadius: "4px", 
                  border: "1px solid #161412", 
                  background: "#F3EEE3",
                  color: "#161412",
                  outline: "none",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
              {sourceArticles.length === 0 ? (
                <p style={{ textAlign: "center", color: "#5E574C", fontSize: "18px", marginTop: "20px" }}>No articles match your search or this source has not fetched articles yet.</p>
              ) : (
                sourceArticles.map((article) => {
                  const displayImage = getArticleImage(article);
                  
                  return (
                    <div 
                      key={article.id} 
                      onClick={() => openArticle(article)}
                      className="rss-article-card"
                    >
                      <div className="rss-article-img-wrapper">
                        <img 
                          src={displayImage} 
                          alt={getProfName(article.professor_id)} 
                        />
                      </div>

                      <div className="rss-article-content">
                        <h3 
                          style={{ 
                            textDecoration: "none", 
                            color: "#161412", 
                            fontSize: "24px", 
                            fontFamily: "Georgia, serif", 
                            fontWeight: "bold", 
                            lineHeight: "1.3", 
                            margin: "0 0 12px 0"
                          }}
                        >
                          {article.original_title || article.title}
                        </h3>
                        
                        <div style={{ fontSize: "14px", color: "#8F7118", fontWeight: "bold", marginBottom: "15px" }}>
                          {article.published || "Recent"} • {getProfName(article.professor_id).toUpperCase()}
                        </div>
                        
                        <p style={{ fontSize: "16px", color: "#5E574C", lineHeight: "1.6", margin: 0 }}>
                          {article.summary 
                            ? (article.summary.length > 300 ? article.summary.substring(0, 300) + "..." : article.summary) 
                            : "No summary available for this article."}
                        </p>

                        <div className="article-btn-group">
                          {article.link && (
                            <a 
                              href={article.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="original-link"
                            >
                              Original Article 
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                            </a>
                          )}
                          
                          <button 
                            className="article-btn"
                            onClick={(e) => handleCardListen(e, article)}
                            style={{ 
                              backgroundColor: speakingArticleId === article.id ? "#161412" : "transparent", 
                              color: speakingArticleId === article.id ? "#F3EEE3" : "#161412", 
                              border: "1px solid #161412"
                            }}
                          >
                            <span>{speakingArticleId === article.id ? "■" : "▶"}</span> {speakingArticleId === article.id ? "STOP READING" : "LISTEN"}
                          </button>

                          <button 
                            className="article-btn"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQueryArticle(article); }}
                            style={{ backgroundColor: "#EBE4D5", color: "#161412", border: "none" }}
                          >
                            SUBMIT QUERY <span style={{ fontSize: "13px", fontWeight: "900" }}>?</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}