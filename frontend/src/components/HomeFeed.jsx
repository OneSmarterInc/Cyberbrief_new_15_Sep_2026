import React, { useState, useEffect, useMemo } from "react";
import NewsCard from "./NewsCard";
import TheWire from "./TheWire";
import { API_BASE_URL } from "../config";
import { cleanSummary, isValidArticle } from "../utils/summaryFilter";

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

const getArticleImage = (article) => {
  if (!article) return "/images/Proff_1.png";
  const profId = parseInt(article.professor_id) || 1; 
  return `/images/Proff_${profId}.png`; 
};

const formatToEST = (dateString) => {
  if (!dateString) return "Just now";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "EST",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short"
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export default function HomeFeed({ 
  searchQuery, filteredArticles, currentArticles, loading, error, refreshing, fetchNews,
  currentPage, totalPages, handlePageChange, articles, selectedCategory 
}) {
  
  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "alert", onConfirm: null });
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [speaking, setSpeaking] = useState(false);
  const [speakingCardId, setSpeakingCardId] = useState(null);
  const [hoveredProf, setHoveredProf] = useState(null);
  const professors = [1, 2, 3, 4, 5, 6, 7, 8];

  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);

  // Filter out invalid/short/looped articles completely from current feed items
  const validArticles = useMemo(() => {
    return (currentArticles || []).filter(isValidArticle);
  }, [currentArticles]);

  const mainArticles = validArticles.slice(0, 3);
  const morningArticles = validArticles.slice(3, 6);
  const briefArticles = validArticles.slice(6, 14);

  useEffect(() => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // GLOBAL AUDIO CONFLICT FIX: Stop speech or audio if another stream is triggered elsewhere
  useEffect(() => {
    const handleGlobalStopAudio = (e) => {
      if (e.detail !== speakingCardId && ('speechSynthesis' in window)) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        setSpeakingCardId(null);
      }
    };
    window.addEventListener("stop-other-audio", handleGlobalStopAudio);
    return () => window.removeEventListener("stop-other-audio", handleGlobalStopAudio);
  }, [speakingCardId]);

  useEffect(() => {
    if (articles && articles.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("article_id");
      if (urlId) {
        const articleFromUrl = articles.find(a => a.id.toString() === urlId);
        if (articleFromUrl && (!selectedArticle || selectedArticle.id !== articleFromUrl.id)) {
          setSelectedArticle(articleFromUrl);
        }
      } else if (selectedArticle) {
        setSelectedArticle(null); 
      }
    }
  }, [articles]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("article_id");
      if (urlId && articles.length > 0) {
        const articleFromUrl = articles.find(a => a.id.toString() === urlId);
        setSelectedArticle(articleFromUrl || null);
      } else {
        setSelectedArticle(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [articles]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if ((speaking || speakingCardId) && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setSpeakingCardId(null);
    }
  }, [selectedArticle]);

  const handleOpenArticle = (article) => {
    setSelectedArticle(article);
    window.history.pushState({}, "", `?article_id=${article.id}`);
  };

  const handleCloseArticle = () => {
    if ((speaking || speakingCardId) && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setSpeakingCardId(null);
    }
    setSelectedArticle(null);
    const url = new URL(window.location);
    url.searchParams.delete('article_id');
    window.history.pushState({}, "", url.pathname + url.search);
  };

  const handleProfClick = (profId) => {
    window.history.pushState({}, "", `/newsroom?prof=${profId}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const submitQuery = async () => {
    if (!queryText.trim() || !selectedArticle?.id) return;
    setSubmitStatus("loading");
    try {
      const res = await fetch(`${API_BASE_URL}/news/${selectedArticle.id}/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query_text: queryText })
      });
      if (res.ok) {
        setSubmitStatus("success");
        setTimeout(() => {
          setShowQueryModal(false);
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

  const handleCardListen = (e, article) => {
    e.stopPropagation();

    if (!('speechSynthesis' in window)) return;

    if (speakingCardId === article.id) {
      window.speechSynthesis.cancel();
      setSpeakingCardId(null);
      return;
    }

    // Stop all other audio streams across the page
    window.dispatchEvent(new CustomEvent("stop-other-audio", { detail: article.id }));
    window.speechSynthesis.cancel();

    const profId = parseInt(article.professor_id) || 1;
    const textToSpeak = `${article?.ai_headline || article?.title || ""}. ${cleanSummary(article?.summary)}`;
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
        utterance.pitch = Math.max(0.1, profile.pitch - 0.4); 
      }

      let pool = genderFilteredVoices.length > 0 ? genderFilteredVoices : englishVoices;
      if (pool.length > 0) {
        utterance.voice = pool[profile.voiceOffset % pool.length];
      }
    }

    utterance.onstart = () => {
      setSpeakingCardId(article.id);
      setSpeaking(false);
    };
    utterance.onend = () => setSpeakingCardId(null);
    utterance.onerror = () => setSpeakingCardId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleListen = () => {
    if (!selectedArticle) return;

    if (!('speechSynthesis' in window)) {
      setModal({ show: true, title: "Not Supported", message: "Text-to-speech is not supported by your browser.", type: "alert" });
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    // Stop all other audio streams across the page
    window.dispatchEvent(new CustomEvent("stop-other-audio", { detail: "selected-article" }));
    window.speechSynthesis.cancel();

    const profId = parseInt(selectedArticle.professor_id) || 1;
    const textToSpeak = `${selectedArticle.ai_headline || selectedArticle.title || ""}. ${cleanSummary(selectedArticle.summary)}`;
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
        utterance.pitch = Math.max(0.1, profile.pitch - 0.4); 
      }

      let pool = genderFilteredVoices.length > 0 ? genderFilteredVoices : englishVoices;
      if (pool.length > 0) {
        const selectedIndex = profile.voiceOffset % pool.length;
        utterance.voice = pool[selectedIndex];
      }
    }

    utterance.onstart = () => {
      setSpeaking(true);
      setSpeakingCardId(null);
    };
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (selectedArticle) {
    const displayImage = getArticleImage(selectedArticle);
    let hash = 0;
    const sourceName = selectedArticle.source || "News";
    for (let i = 0; i < sourceName.length; i++) hash = sourceName.charCodeAt(i) + ((hash << 5) - hash);
    const avatarColor = "#" + "00000".substring(0, 6 - (hash & 0x00FFFFFF).toString(16).toUpperCase().length) + (hash & 0x00FFFFFF).toString(16).toUpperCase();
    
    return (
      <div style={{ maxWidth: "950px", margin: "0 auto", padding: "40px 20px", width: "100%" }}>
        <div style={{ backgroundColor: "#F3EEE3", borderRadius: "8px", border: "1px solid #161412", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", position: "relative" }}>
          
          {showQueryModal && (
            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(22,20,18,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px", cursor: "default" }}
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
                    onClick={() => setShowQueryModal(false)} 
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

          {/* REFINED HERO IMAGE CONTAINER WITH PROPER SCALING & OBJECT-FIT CONTAIN + SOLID BLACK BACKGROUND */}
          <style>{`
            .hero-img-container {
              position: relative;
              width: 100%;
              height: 480px;
              background-color: #000000;
              overflow: hidden;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .hero-img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              object-position: center center;
            }
            .hero-text-overlay {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.2) 80%, transparent 100%);
              padding: 40px 30px 25px 30px;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
            }
            .hero-title {
              font-family: Georgia, serif;
              font-size: 26px;
              color: #F3EEE3;
              margin: 0 0 15px 0;
              line-height: 1.25;
              font-weight: bold;
              text-shadow: 0 2px 4px rgba(0,0,0,0.6);
            }
            @media (max-width: 768px) {
              .hero-img-container {
                height: 320px;
              }
              .hero-title {
                font-size: 20px;
                margin-bottom: 12px;
              }
              .hero-text-overlay {
                padding: 30px 15px 20px 15px;
              }
            }
          `}</style>

          <div className="hero-img-container">
            <img src={displayImage} alt={getProfName(selectedArticle.professor_id)} className="hero-img" />
            <div className="hero-text-overlay">
              <h1 className="hero-title">{selectedArticle.ai_headline || selectedArticle.title}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: "16px", border: "2px solid #F3EEE3", flexShrink: 0 }}>
                  {sourceName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#F3EEE3", letterSpacing: "0.5px" }}>{sourceName} • {getProfName(selectedArticle.professor_id).toUpperCase()}</div>
                  <div style={{ fontSize: "13px", color: "#C9C1B0", marginTop: "2px" }}>{formatToEST(selectedArticle.published) || "Recently Added"}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "40px" }} className="hero-body-padding">
            <style>{`
              @media (max-width: 768px) {
                .hero-body-padding {
                  padding: 20px !important;
                }
              }
            `}</style>
            <p style={{ fontSize: "18px", color: "#161412", lineHeight: "1.8", margin: "0 0 50px 0", fontFamily: "Arial, sans-serif" }}>
              {cleanSummary(selectedArticle.summary)}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #C9C1B0", paddingTop: "25px", flexWrap: "wrap", gap: "20px" }}>
              
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <a href={selectedArticle.link} target="_blank" rel="noopener noreferrer" style={{ color: "#d32f2f", textDecoration: "none", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px", transition: "opacity 0.2s", fontWeight: "bold", marginRight: "10px" }}>
                  Original Article 
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                </a>
                
                <button 
                  onClick={handleListen}
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
                    letterSpacing: "1px",
                    transition: "all 0.2s"
                  }}
                >
                  <span>{speaking ? "■" : "▶"}</span> {speaking ? "STOP READING" : "LISTEN"}
                </button>

                <button 
                  onClick={() => setShowQueryModal(true)} 
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
                    letterSpacing: "1px",
                    transition: "background 0.2s" 
                  }}
                >
                  SUBMIT QUERY <span style={{ fontSize: "14px", fontWeight: "900" }}>?</span>
                </button>
              </div>

              <button onClick={handleCloseArticle} style={{ backgroundColor: "#d32f2f", color: "#ffffff", border: "none", padding: "10px 20px", fontWeight: "bold", cursor: "pointer", borderRadius: "4px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "16px", marginBottom: "2px" }}>←</span> Back to Feed
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="layout-container" style={{ display: "flex", maxWidth: "1550px", margin: "0 auto", width: "100%", padding: "5px 15px 20px 15px", gap: "25px", position: "relative" }}>
        
        {modal.show && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#F3EEE3", border: "2px solid #161412", padding: "30px", maxWidth: "400px", width: "100%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", borderRadius: "4px" }}>
              <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 10px 0", color: "#161412", fontSize: "18px" }}>{modal.title}</h3>
              <p style={{ fontSize: "14px", color: "#5E574C", lineHeight: "1.5", marginBottom: "25px" }}>{modal.message}</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button onClick={() => setModal({ show: false })} style={{ padding: "8px 20px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>OK</button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .layout-container { flex-direction: row; align-items: flex-start; }
          
          .wire-sidebar { width: 420px; flex-shrink: 0; margin-top: 25px; }
          
          .page-content { flex: 1; min-width: 0; }
          .most-covered-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
          .clickable-card { text-decoration: none; color: inherit; display: flex; transition: opacity 0.2s; cursor: pointer; }
          .clickable-card:hover { opacity: 0.85; }
          
          .page-header {
            border-bottom: none !important;
            margin-bottom: 15px !important;
            padding-bottom: 0 !important;
            margin-top: 0 !important;
          }
          
          .professors-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            max-width: 1400px;
            margin: 0 auto 60px auto;
          }

          @media (max-width: 1200px) {
            .professors-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 1024px) {
            .layout-container { flex-direction: column; }
            .wire-sidebar { width: 100%; margin-top: 15px; }
            .most-covered-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 768px) {
            .most-covered-grid { grid-template-columns: 1fr; }
            .page-header h1 { font-size: 28px !important; }
          }
          @media (max-width: 600px) {
            .professors-grid { grid-template-columns: 1fr; }
          }
        `}</style>

        <main className="page page-content" style={{ padding: 0 }}>
          
          <section className="page-header" style={{ marginBottom: "15px", borderBottom: "none", paddingBottom: 0 }}>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", color: "#161412", margin: 0, display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "10px" }}>
              <span style={{ fontFamily: "Arial, sans-serif", fontSize: "14px", fontWeight: "bold", color: "#8F7118", letterSpacing: "1.5px", textTransform: "uppercase", marginRight: "5px" }}>
                THE DAILY BRIEF
              </span>
              {searchQuery ? `Search Results: "${searchQuery}"` : "Today’s News Desk"}
            </h1>
          </section>

          {loading ? (
            <div className="state"><div className="loader" /><p>Loading the latest stories...</p></div>
          ) : error ? (
            <div className="state">
              <p className="error">{error}</p>
              <button className="retry" onClick={() => fetchNews()}>TRY AGAIN</button>
            </div>
          ) : (
            <section className="news-list">
              {validArticles.length === 0 ? (
                <div className="state"><p>{searchQuery ? "No valid stories match your search." : "No valid stories in this category."}</p></div>
              ) : (
                <>
                  {mainArticles.map((article, index) => (
                    <NewsCard key={article.id} article={article} index={index} onArticleClick={handleOpenArticle} />
                  ))}

                  {morningArticles.length > 0 && (
                    <section style={{ marginTop: "50px", paddingTop: "30px", borderTop: "2px solid #161412" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "15px", marginBottom: "25px" }}>
                        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "26px", color: "#161412", margin: 0 }}>Discover More Articles</h2>
                        <span style={{ fontSize: "13px", color: "#5E574C" }}>ranked by how many outlets are on the story</span>
                      </div>
                      
                      <div className="most-covered-grid">
                        {morningArticles.map((article) => {
                          const randomSources = Math.floor(Math.random() * 5) + 3;
                          const displayImage = getArticleImage(article);
                          const cleanedSummarySnippet = cleanSummary(article.summary);

                          return (
                            <div onClick={() => handleOpenArticle(article)} key={article.id} className="clickable-card" style={{ flexDirection: "column", height: "100%" }}>
                              
                              <div style={{ height: "220px", marginBottom: "15px", position: "relative", overflow: "hidden", borderRadius: "6px" }}>
                                <img src={displayImage} alt={getProfName(article.professor_id)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }} />
                                <span style={{ position: "absolute", bottom: "10px", left: "10px", color: "#F3EEE3", fontSize: "11px", fontWeight: "bold", textShadow: "0px 2px 4px rgba(0,0,0,0.8)" }}>Generated illustration</span>
                              </div>

                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ color: "#C9A227", fontSize: "13px", fontWeight: "bold" }}>
                                  {article.category || "News"} • {getProfName(article.professor_id).toUpperCase()}
                                </span>
                                <button 
                                  onClick={(e) => handleCardListen(e, article)}
                                  title={speakingCardId === article.id ? "Stop reading" : "Listen"}
                                  style={{ 
                                    background: speakingCardId === article.id ? "#161412" : "transparent", 
                                    border: "1px solid #161412", 
                                    borderRadius: "3px", 
                                    padding: "2px 6px", 
                                    cursor: "pointer", 
                                    color: speakingCardId === article.id ? "#F3EEE3" : "#161412", 
                                    fontSize: "10px", 
                                    fontWeight: "bold",
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: "3px" 
                                  }}
                                >
                                  {speakingCardId === article.id ? "■" : "▶"} <span>LISTEN</span>
                                </button>
                              </div>

                              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", margin: "0 0 10px 0", lineHeight: 1.3 }}>{article.ai_headline || article.title}</h3>
                              <p style={{ fontSize: "14px", color: "#5E574C", lineHeight: 1.5, marginBottom: "20px", flex: 1 }}>{cleanedSummarySnippet.length > 120 ? cleanedSummarySnippet.substring(0, 120) + "..." : cleanedSummarySnippet}</p>
                              
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #C9C1B0", paddingTop: "12px", marginTop: "auto" }}>
                                <span style={{ fontSize: "12px", color: "#5E574C", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ backgroundColor: "#161412", color: "#F3EEE3", width: "18px", height: "18px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>{randomSources}</span>
                                  sources
                                </span>
                                <span style={{ fontSize: "12px", color: "#5E574C" }}>Updated {formatToEST(article.published)}</span>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "50px", paddingTop: "30px", borderTop: "2px solid #161412", flexWrap: "wrap", gap: "15px" }}>
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ padding: "12px 24px", backgroundColor: currentPage === 1 ? "#EBE4D5" : "#161412", color: currentPage === 1 ? "#A39E93" : "#F3EEE3", border: "none", fontWeight: "bold", cursor: currentPage === 1 ? "not-allowed" : "pointer", flex: window.innerWidth <= 768 ? "1 1 100%" : "none" }}>&larr; PREVIOUS</button>
                      <span style={{ fontSize: "14px", fontWeight: "bold", color: "#5E574C", letterSpacing: "1px", textAlign: "center", flex: window.innerWidth <= 768 ? "1 1 100%" : "none" }}>PAGE {currentPage} OF {totalPages}</span>
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ padding: "12px 24px", backgroundColor: currentPage === totalPages ? "#EBE4D5" : "#161412", color: currentPage === totalPages ? "#A39E93" : "#F3EEE3", border: "none", fontWeight: "bold", cursor: currentPage === totalPages ? "not-allowed" : "pointer", flex: window.innerWidth <= 768 ? "1 1 100%" : "none" }}>NEXT &rarr;</button>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </main>

        <div className="wire-sidebar">
          <TheWire articles={articles} selectedCategory={selectedCategory} onArticleClick={handleOpenArticle} />

          {briefArticles.length > 0 && (
            <section style={{ marginTop: "40px", paddingTop: "10px" }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: "26px", color: "#161412", margin: "0 0 10px 0" }}>In brief</h2>
              <p style={{ fontSize: "14px", color: "#5E574C", marginBottom: "25px" }}>Stories carried by fewer outlets, summarized in one line each.</p>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {briefArticles.map((article, idx) => (
                  <div onClick={() => handleOpenArticle(article)} key={article.id} className="clickable-card" style={{ gap: "15px", borderBottom: "1px solid #C9C1B0", paddingBottom: "15px", marginBottom: "15px" }}>
                    <span style={{ color: "#C9A227", fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "bold", alignSelf: "flex-start", marginTop: "-3px" }}>{idx + 1}</span>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#161412", lineHeight: 1.4, fontWeight: "bold" }}>{article.ai_headline || article.title}</h4>
                      
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                        <span style={{ fontSize: "13px", color: "#5E574C", fontWeight: "bold" }}>
                          {getProfName(article.professor_id).toUpperCase()}
                        </span>
                        
                        <button 
                          onClick={(e) => handleCardListen(e, article)}
                          title={speakingCardId === article.id ? "Stop reading" : "Listen"}
                          style={{ 
                            background: speakingCardId === article.id ? "#161412" : "transparent", 
                            border: "1px solid #161412", 
                            borderRadius: "3px", 
                            padding: "2px 8px", 
                            cursor: "pointer", 
                            color: speakingCardId === article.id ? "#F3EEE3" : "#161412", 
                            fontSize: "10px", 
                            fontWeight: "bold",
                            display: "flex", 
                            alignItems: "center", 
                            gap: "4px",
                            letterSpacing: "0.5px"
                          }}
                        >
                          {speakingCardId === article.id ? "■" : "▶"} <span>LISTEN</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <section style={{ padding: "40px 20px 80px 20px", backgroundColor: "#EBE4D5", borderTop: "1px solid #C9C1B0", marginTop: "0px" }}>
        <div style={{ maxWidth: "1450px", margin: "0 auto" }}>
          <h2 style={{ fontFamily: "Georgia, serif", color: "#161412", textAlign: "center", marginBottom: "50px", fontSize: "36px", fontWeight: "bold" }}>
            Meet the Newsroom
          </h2>
          
          <div className="professors-grid">
            {professors.map(profId => (
              <div 
                key={profId}
                onClick={() => handleProfClick(profId)}
                onMouseEnter={() => setHoveredProf(profId)}
                onMouseLeave={() => setHoveredProf(null)}
                style={{ 
                  cursor: "pointer", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "15px",
                  padding: "15px",
                  backgroundColor: "#F3EEE3", 
                  border: "1px solid #161412",
                  borderRadius: "4px",
                  transition: "all 0.3s ease",
                  transform: hoveredProf === profId ? "translateY(-3px)" : "translateY(0)",
                  boxShadow: hoveredProf === profId ? "0 8px 15px rgba(0,0,0,0.05)" : "none",
                  opacity: hoveredProf && hoveredProf !== profId ? 0.6 : 1,
                  filter: hoveredProf && hoveredProf !== profId ? "grayscale(80%)" : "none"
                }}
              >
                <img 
                  src={`/images/Proff_${profId}.png`} alt={getProfName(profId)} 
                  style={{ 
                    width: "60px", height: "60px",
                    objectFit: "cover", objectPosition: "top", 
                    borderRadius: "4px", 
                    border: hoveredProf === profId ? "2px solid #C9A227" : "1px solid #161412",
                    transition: "all 0.3s ease",
                    flexShrink: 0
                  }} 
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#161412", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {getProfName(profId)}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8F7118", fontWeight: "bold", lineHeight: "1.2" }}>
                    {getProfPosition(profId)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: "2px", backgroundColor: "#D9CBA0", width: "100%", marginBottom: "40px" }}></div>

          <div 
            onClick={() => {
              window.history.pushState({}, "", "/join");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            style={{ 
              backgroundColor: "#FFFFFF", 
              border: "1px solid #D9CBA0",
              padding: "25px 40px", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              cursor: "pointer", 
              marginBottom: "40px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              flexWrap: "wrap",
              gap: "15px"
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.06)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.02)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
              <span style={{ color: "#8F7118", letterSpacing: "2px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>
                Volunteer / Internship seats now open
              </span>
              <span style={{ color: "#8F7118", display: window.innerWidth < 600 ? "none" : "inline" }}>—</span>
              <span style={{ color: "#161412", fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "bold" }}>
                Join the Newswire
              </span>
            </div>
            <div style={{ color: "#161412", letterSpacing: "2px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "5px" }}>
              APPLY <span style={{ color: "#8F7118", fontSize: "16px", marginBottom: "2px" }}>→</span>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}