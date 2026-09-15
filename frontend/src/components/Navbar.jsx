import React, { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config";

export default function Navbar({ 
  selectedCategory, setSelectedCategory, user, onSignin, 
  onHome, onAbout, onAdmin, onSubscribe, 
  latestHeadline, latestSummary, latestPublished, latestSource, latestCategory, 
  totalStories = 0, totalSources = 48, onSearch 
}) {
  const [speaking, setSpeaking] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const goHome = () => {
    if (onHome) onHome();
    if (setSelectedCategory) setSelectedCategory("All");
    navigate("/");
  };

  const submitSearch = (event) => {
    event.preventDefault();
    if (!search.trim()) return;
    onSearch ? onSearch(search.trim()) : navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const readSummary = () => {
    if (speaking) {
      window.audioPlayer?.pause();
      setSpeaking(false);
      setProgress(0);
      return;
    }

    const textToSpeak = latestSummary || latestHeadline || "Latest news is loading.";
    
    const audioUrl = `${API_BASE_URL}/audio/?text=${encodeURIComponent(textToSpeak)}`;
    window.audioPlayer = new Audio(audioUrl);
    
    window.audioPlayer.onplay = () => { 
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
    
    window.audioPlayer.play();
  };

  const currentDate = useMemo(() => now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }), [now]);

  return (
    <header className="aggregate-clone">
      <style>{`.aggregate-clone{background:#F3EEE3;color:#161412;width:100%;font-family:Arial,Helvetica,sans-serif}.aggregate-clone *{box-sizing:border-box}.aggregate-wrap{width:100%;max-width:1455px;margin:0 auto;padding:0 20px}.aggregate-topbar{height:43px;border-top:1px solid #161412;border-bottom:1px solid #161412;display:flex;align-items:center;justify-content:space-between;padding:0 24px;color:#5E574C;font-size:14px;width:100%}.aggregate-top-left{display:flex;align-items:center;gap:10px}.aggregate-live-dot{width:9px;height:9px;border-radius:50%;background:#1F3A2E;display:inline-block;flex:none}.aggregate-top-right{display:flex;align-items:stretch;height:43px}.aggregate-top-link{position:relative;color:#5E574C;text-decoration:none;display:flex;align-items:center;padding:0 14px;cursor:pointer;transition:color .2s ease,background-color .2s ease}.aggregate-top-link::after{content:"";position:absolute;left:14px;right:14px;bottom:7px;height:2px;background:#C9A227;transform:scaleX(0);transform-origin:center;transition:transform .2s ease}.aggregate-top-link:focus-visible,.aggregate-top-link:hover{color:#161412;background:rgba(201,162,39,.08);outline:0}.aggregate-top-link:focus-visible::after,.aggregate-top-link:hover::after{transform:scaleX(1)}.aggregate-subscribe{border:0;background:#C9A227;color:#161412;font-weight:700;padding:0 18px;cursor:pointer;font-size:14px;transition:background-color .2s ease,color .2s ease,transform .15s ease}.aggregate-subscribe:focus-visible,.aggregate-subscribe:hover{background:#8F7118;color:#F3EEE3;outline:0}.aggregate-subscribe:active{transform:translateY(1px)}.aggregate-masthead{padding:30px 20px;border-bottom:1px solid #161412;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.aggregate-brand{border:0;background:transparent;color:#161412;padding:0;margin:0;cursor:pointer;font-family:Georgia,"Times New Roman",serif;font-size:clamp(60px,8vw,110px);line-height:.82;font-weight:900;letter-spacing:-4px;transition:color .2s ease,transform .2s ease}.aggregate-brand:focus-visible,.aggregate-brand:hover{color:#8F7118;outline:0}.aggregate-brand:active{transform:scale(.995)}.aggregate-briefing{padding:15px 0;background:#EBE4D5;border-bottom:1px solid #161412}.aggregate-briefing-inner{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start}.aggregate-briefing-label{color:#8F7118;font-size:12px;font-weight:700}.aggregate-briefing-meta{color:#5E574C;font-weight:400}.aggregate-briefing-title{font-family:Georgia,"Times New Roman",serif;font-size:26px;line-height:1.1;font-weight:700;margin:6px 0;max-width:760px}.aggregate-briefing-summary{color:#5E574C;font-size:14px;line-height:1.4;max-width:760px}.aggregate-player-container{display:flex;flex-direction:column;gap:10px;width:100%}.aggregate-player{border:1px solid #161412;padding:10px 15px;display:flex;align-items:center;gap:12px;background:#F3EEE3;min-height:54px}.aggregate-play{width:38px;height:38px;border-radius:50%;border:0;background:#161412;color:#F3EEE3;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none;font-size:16px}.aggregate-play.active,.aggregate-play:hover{background:#8F7118}.aggregate-player-main{flex:1;min-width:0}.aggregate-progress{height:6px;background:#C9C1B0;position:relative;border-radius:3px;overflow:hidden}.aggregate-progress-fill{height:100%;background:#161412}@media (max-width:980px){.aggregate-briefing-inner{grid-template-columns:1fr;gap:20px}}@media (max-width:760px){.aggregate-top-left{max-width:100%;overflow:hidden;text-overflow:ellipsis}.aggregate-top-right{display:none}.aggregate-masthead{padding:20px 15px}.aggregate-brand{font-size:clamp(45px,11vw,70px);letter-spacing:-3px}.aggregate-briefing-title{font-size:clamp(22px,5vw,26px)}}@media (prefers-reduced-motion:reduce){.aggregate-clone *,.aggregate-clone *::after,.aggregate-clone *::before{transition:none!important}}`}</style>
      
      <div className="aggregate-topbar">
        <div className="aggregate-top-left">
          <span className="aggregate-live-dot" />
          <span>{currentDate} · {totalStories} stories compiled today from {totalSources} sources</span>
        </div>
        
        <div className="aggregate-top-right">
          <a className="aggregate-top-link" href="/how" onClick={(e) => { e.preventDefault(); navigate("/how"); if(onAbout) onAbout(); }}>About the desk</a>
          <button className="aggregate-subscribe" type="button" onClick={(e) => { e.preventDefault(); if (onSubscribe) onSubscribe(); }}>Subscribe</button>
        </div>
      </div>

      <div className="aggregate-masthead">
        <button className="aggregate-brand" type="button" onClick={goHome}>Cyberbriefs</button>
      </div>

      <section className="aggregate-briefing">
        <div className="aggregate-wrap aggregate-briefing-inner">
          
          <div>
            <div className="aggregate-briefing-label">Morning briefing <span className="aggregate-briefing-meta">· recorded 6:00 AM ET</span></div>
            <h2 className="aggregate-briefing-title">{latestHeadline || "Three stories that will shape your Thursday, read by the desk."}</h2>
            <div className="aggregate-briefing-summary">{latestSummary || "AI-powered news intelligence from your live RSS feeds. Each item links back to the reporting it was built from."}</div>
          </div>
          
          <div className="aggregate-player-container">
            <div className="aggregate-player">
              <button type="button" className={`aggregate-play ${speaking ? "active" : ""}`} onClick={readSummary} aria-label={speaking ? "Stop reading" : "Read briefing"}>
                {speaking ? "■" : "▶"}
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
                style={{ flex: 1, border: "1px solid #C9C1B0", borderRight: "none", background: "#F3EEE3", color: "#161412", padding: "0 12px", fontSize: "13px", outline: "none" }}
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