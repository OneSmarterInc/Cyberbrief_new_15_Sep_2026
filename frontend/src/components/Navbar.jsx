import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";

export default function Navbar({ 
  selectedCategory, setSelectedCategory, user, onSignin, 
  onHome, onRss, onAbout, onBlogs, onBooks, onAdmin, onSubscribe, 
  latestHeadline, latestSummary, latestPublished, latestSource, latestCategory, 
  totalStories = 0, totalSources = 0, onSearch 
}) {
  const [speaking, setSpeaking] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false); 
  const [progress, setProgress] = useState(0); 
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());
  
  // Left Side Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const navigate = (path) => {
    setDrawerOpen(false); 
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const goHome = () => {
    setDrawerOpen(false);
    if (onHome) onHome();
    if (setSelectedCategory) setSelectedCategory("All");
    navigate("/");
  };

  const handleNavClick = (e, path, callback) => {
    e.preventDefault();
    if (callback) callback();
    navigate(path);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (!search.trim()) return;
    onSearch ? onSearch(search.trim()) : navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const readSummary = () => {
    if (speaking || isBuffering) {
      window.audioPlayer?.pause();
      setSpeaking(false);
      setIsBuffering(false);
      setProgress(0);
      return;
    }

    const textToSpeak = latestSummary || latestHeadline || "Latest news is loading.";
    const audioUrl = `${API_BASE_URL}/audio/?text=${encodeURIComponent(textToSpeak)}`;
  
    setIsBuffering(true);
  
    window.audioPlayer = new Audio(audioUrl);
  
    window.audioPlayer.onplay = () => { 
      setIsBuffering(false); 
      setSpeaking(true); 
      setProgress(0); 
    };
  
    window.audioPlayer.ontimeupdate = () => {
      if (window.audioPlayer.duration) {
        const currentProgress = (window.audioPlayer.currentTime / window.audioPlayer.duration) * 100;
        setProgress(currentProgress);
      }
    };
  
    window.audioPlayer.onended = () => { 
      setSpeaking(false); 
      setProgress(100); 
      setTimeout(() => setProgress(0), 1000); 
    };

    window.audioPlayer.onerror = () => {
      setIsBuffering(false);
      setSpeaking(false);
      console.error("Failed to load audio from backend.");
    };
  
    window.audioPlayer.play().catch(e => {
      setIsBuffering(false);
      console.error("Audio playback prevented:", e);
    });
  };

  const currentDate = useMemo(() => now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }), [now]);

  const displaySummary = useMemo(() => {
    if (!latestSummary) return "AI-powered news intelligence from your live RSS feeds. Each item links back to the reporting it was built from.";
    const words = latestSummary.split(" ");
    if (words.length > 30) {
      return words.slice(0, 30).join(" ") + "...";
    }
    return latestSummary;
  }, [latestSummary]);

  return (
    <header className="aggregate-clone">
      <style>{`
        .aggregate-clone { background: #F3EEE3; color: #161412; width: 100%; font-family: Arial, Helvetica, sans-serif; }
        .aggregate-clone * { box-sizing: border-box; }
        .aggregate-wrap { width: 100%; max-width: 1455px; margin: 0 auto; padding: 0 20px; }
  
        .aggregate-topbar { min-height: 43px; border-top: 1px solid #161412; border-bottom: 1px solid #161412; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; color: #5E574C; font-size: 14px; width: 100%; flex-wrap: wrap; background: #F3EEE3; position: relative; z-index: 50; }
        .aggregate-top-left { display: flex; align-items: center; gap: 10px; padding: 10px 0; flex: 1; }
        .aggregate-live-dot { width: 9px; height: 9px; border-radius: 50%; background: #1F3A2E; display: inline-block; flex: none; }
  
        .hamburger-icon { background: transparent; border: none; color: #161412; font-size: 22px; cursor: pointer; display: flex; align-items: center; padding: 0 10px 0 0; transition: color 0.2s ease; }
        .hamburger-icon:hover { color: #C9A227; }

        .aggregate-top-right { display: flex; align-items: stretch; height: 43px; }
        .aggregate-top-link { position: relative; color: #5E574C; text-decoration: none; display: flex; align-items: center; padding: 0 14px; cursor: pointer; transition: color .2s ease, background-color .2s ease; }
        .aggregate-top-link::after { content: ""; position: absolute; left: 14px; right: 14px; bottom: 7px; height: 2px; background: #C9A227; transform: scaleX(0); transform-origin: center; transition: transform .2s ease; }
        .aggregate-top-link:focus-visible, .aggregate-top-link:hover { color: #161412; background: rgba(201,162,39,.08); outline: 0; }
        .aggregate-top-link:focus-visible::after, .aggregate-top-link:hover::after { transform: scaleX(1); }
  
        .aggregate-subscribe { border: 0; background: #C9A227; color: #161412; font-weight: 700; padding: 0 18px; cursor: pointer; font-size: 14px; transition: background-color .2s ease, color .2s ease, transform .15s ease; display: inline-flex; align-items: center; justify-content: center; }
        .aggregate-subscribe:focus-visible, .aggregate-subscribe:hover { background: #8F7118; color: #F3EEE3; outline: 0; }
        .aggregate-subscribe:active { transform: translateY(1px); }
  
        .aggregate-masthead { padding: 30px 20px; border-bottom: 1px solid #161412; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .aggregate-brand-container { border: 0; background: transparent; padding: 0; margin: 0; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 15px; transition: opacity .2s ease, transform .2s ease; }
        .aggregate-brand-container:hover { opacity: 0.9; }
        .aggregate-brand-container:active { transform: scale(.995); }
  
        .aggregate-brand { font-family: Georgia, "Times New Roman", serif; font-size: clamp(50px, 7vw, 95px); line-height: .82; font-weight: 900; letter-spacing: -4px; color: #161412; margin: 0; }
        .aggregate-logo-img { width: clamp(50px, 7vw, 90px); height: clamp(50px, 7vw, 90px); object-fit: contain; border-radius: 8px; }

        .aggregate-briefing { padding: 15px 0; background: #EBE4D5; border-bottom: 1px solid #161412; }
        .aggregate-briefing-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
        .aggregate-briefing-label { color: #8F7118; font-size: 12px; font-weight: 700; }
        .aggregate-briefing-meta { color: #5E574C; font-weight: 400; }
        .aggregate-briefing-title { font-family: Georgia, "Times New Roman", serif; font-size: 26px; line-height: 1.1; font-weight: 700; margin: 6px 0; max-width: 760px; }
        .aggregate-briefing-summary { color: #5E574C; font-size: 14px; line-height: 1.4; max-width: 760px; }
  
        .aggregate-player-container { display: flex; flex-direction: column; gap: 10px; width: 100%; }
        .aggregate-player { border: 1px solid #161412; padding: 10px 15px; display: flex; align-items: center; gap: 12px; background: #F3EEE3; min-height: 54px; }
        .aggregate-play { width: 38px; height: 38px; border-radius: 50%; border: 0; background: #161412; color: #F3EEE3; display: flex; align-items: center; justify-content: center; cursor: pointer; flex: none; font-size: 16px; }
        .aggregate-play.active, .aggregate-play:hover { background: #8F7118; }
  
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .buffering-icon { display: inline-block; animation: spin 2s linear infinite; font-size: 14px; }

        .aggregate-player-main { flex: 1; min-width: 0; }
        .aggregate-progress { height: 6px; background: #C9C1B0; position: relative; border-radius: 3px; overflow: hidden; }
        .aggregate-progress-fill { height: 100%; background: #161412; }

        .side-drawer-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 9998; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .side-drawer-overlay.open { opacity: 1; pointer-events: auto; }
  
        .side-drawer { position: fixed; top: 0; left: -320px; width: 300px; height: 100vh; background: #161412; color: #F3EEE3; z-index: 9999; transition: left 0.3s ease; padding: 40px 30px; box-shadow: 5px 0 15px rgba(0,0,0,0.5); display: flex; flex-direction: column; }
        .side-drawer.open { left: 0; }
        .drawer-close { align-self: flex-end; background: transparent; border: none; color: #C9C1B0; font-size: 24px; cursor: pointer; padding: 0; margin-bottom: 40px; transition: color 0.2s; }
        .drawer-close:hover { color: #C9A227; }
  
        .drawer-link { display: block; color: #F3EEE3; text-decoration: none; font-size: 22px; font-family: Georgia, serif; padding: 15px 0; border-bottom: 1px solid #332F2C; cursor: pointer; transition: color 0.2s ease, padding-left 0.2s ease; }
        .drawer-link:hover { color: #C9A227; padding-left: 10px; }
  
        @media (max-width: 980px) {
          .aggregate-briefing-inner { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (max-width: 760px) {
          .aggregate-topbar { padding: 0 15px; }
          .aggregate-top-left { font-size: 12px; }
          .aggregate-top-right { display: none; }
          .aggregate-subscribe { margin-top: 10px; height: 40px; align-self: flex-start; }
          .aggregate-masthead { padding: 20px 15px; }
          .aggregate-brand { font-size: clamp(40px, 9vw, 65px); letter-spacing: -3px; }
          .aggregate-logo-img { width: clamp(40px, 9vw, 65px); height: clamp(40px, 9vw, 65px); }
          .aggregate-briefing-title { font-size: clamp(22px, 5vw, 26px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .aggregate-clone *, .aggregate-clone *::after, .aggregate-clone *::before { transition: none !important; }
        }
      `}</style>

      {/* Slide-out Overlay */}
      <div 
        className={`side-drawer-overlay ${drawerOpen ? "open" : ""}`} 
        onClick={() => setDrawerOpen(false)}
      ></div>

      {/* Slide-out Menu Panel */}
      <div className={`side-drawer ${drawerOpen ? "open" : ""}`}>
        <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
        <a className="drawer-link" onClick={goHome}>Home</a>
        <a className="drawer-link" onClick={(e) => handleNavClick(e, "/rss", onRss)}>RSS Feed</a>
        <a className="drawer-link" onClick={(e) => handleNavClick(e, "/how", onAbout)}>About the desk</a>
        <a className="drawer-link" onClick={(e) => handleNavClick(e, "/blogs", onBlogs)}>Blogs</a>
        <a className="drawer-link" onClick={(e) => handleNavClick(e, "/books", onBooks)}>Books</a>
        {/* Admin Link added to mobile menu drawer */}
        <a 
          className="drawer-link" 
          href="http://backend.cyberbriefs.org/admin/" 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={() => setDrawerOpen(false)}
          style={{ color: "#C9A227" }}
        >
          Admin Panel ↗
        </a>
        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
          <button 
            className="aggregate-subscribe" 
            style={{ width: "100%", padding: "15px", fontSize: "16px" }} 
            onClick={(e) => { e.preventDefault(); setDrawerOpen(false); if (onSubscribe) onSubscribe(); }}
          >
            Subscribe
          </button>
        </div>
      </div>
  
      <div className="aggregate-topbar">
        <div className="aggregate-top-left">
          <button className="hamburger-icon" onClick={() => setDrawerOpen(true)}>☰</button>
          <span>{currentDate} · {totalStories} stories compiled today from {totalSources} sources</span>
        </div>
  
        <div className="aggregate-top-right">
          <a className="aggregate-top-link" href="/how" onClick={(e) => handleNavClick(e, "/how", onAbout)}>About the desk</a>
          <a className="aggregate-top-link" href="/blogs" onClick={(e) => handleNavClick(e, "/blogs", onBlogs)}>Blogs</a>
          <a className="aggregate-top-link" href="/books" onClick={(e) => handleNavClick(e, "/books", onBooks)}>Books</a>
          {/* Admin Link added to top-right desktop bar */}
          <a 
            className="aggregate-top-link" 
            href="http://backend.cyberbriefs.org/admin/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ fontWeight: "bold", color: "#8F7118" }}
          >
            Admin ↗
          </a>
          <button className="aggregate-subscribe" type="button" onClick={(e) => { e.preventDefault(); if (onSubscribe) onSubscribe(); }}>Subscribe</button>
        </div>
      </div>

      <div className="aggregate-masthead">
        <button className="aggregate-brand-container" type="button" onClick={goHome}>
          <h1 className="aggregate-brand">Cyberbriefs</h1>
          <img src="/images/logo.png" alt="Cyberbriefs Logo" className="aggregate-logo-img" />
        </button>
      </div>

      <section className="aggregate-briefing">
        <div className="aggregate-wrap aggregate-briefing-inner">
  
          <div>
            <div className="aggregate-briefing-label">Latest news briefing <span className="aggregate-briefing-meta">· recorded 6:00 AM ET</span></div>
            <h2 className="aggregate-briefing-title">{latestHeadline || "Three stories that will shape your Thursday, read by the desk."}</h2>
            <div className="aggregate-briefing-summary">{displaySummary}</div>
          </div>
  
          <div className="aggregate-player-container">
            <div className="aggregate-player">
              <button 
                type="button" 
                className={`aggregate-play ${speaking || isBuffering ? "active" : ""}`} 
                onClick={readSummary} 
                aria-label={speaking ? "Stop reading" : "Read briefing"}
              >
                {isBuffering ? <span className="buffering-icon">⏳</span> : speaking ? "■" : "▶"}
              </button>
              <div className="aggregate-player-main">
                <div className="aggregate-progress">
                  <div 
                    className="aggregate-progress-fill" 
                    style={{ 
                      width: `${progress}%`, 
                      transition: "width 0.1s linear" 
                    }} 
                  />
                </div>
              </div>
            </div>

            <form onSubmit={submitSearch} style={{ display: "flex", height: "34px", width: "100%" }}>
              <input 
                type="search" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search stories..." 
                aria-label="Search stories"
                style={{ flex: 1, border: "1px solid #C9C1B0", borderRight: "none", background: "#F3EEE3", color: "#161412", padding: "0 12px", fontSize: "13px", outline: "none", minWidth: 0 }}
              />
              <button 
                type="submit"
                style={{ backgroundColor: "#161412", color: "#F3EEE3", border: "none", padding: "0 15px", fontWeight: "bold", cursor: "pointer", fontSize: "12px", transition: "background 0.2s" }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#8F7118"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#161412"}
              >
                SEARCH
              </button>
            </form>
          </div>
  
        </div>
      </section>
    </header>
  );
}
