import React, { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config";

const PROF_NAMES = [
  "Arion Vale", "Lyra Sen", "Kael Nore", "Elara Quinn", 
  "Dorian Kade", "Mira Solen", "Orion Blake", "Seraphina Rowe"
];

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

export default function CyberbriefChat({ articles = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your Cyberbriefs Desk Assistant. Ask me for the latest news, or search for specific threats, CVEs, or our correspondents."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Unable to retrieve briefings at this moment." }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Connection error. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Parses AI response to remove tags and render UI cards instead
  const renderMessageWithCards = (text) => {
    const articleRegex = /\[ARTICLE:(\d+)\]|\/\?article_id=(\d+)/g;
    const profRegex = /\[PROF:(\d+)\]/g;
    const routeRegex = /\[ROUTE:(\/[\w-]+)\]/g;
    
    const matchedArticleIds = [];
    const matchedProfIds = [];
    const matchedRoutes = [];
    
    // Strip hidden Article tags
    let cleanText = text.replace(articleRegex, (match, p1, p2) => {
      const id = p1 || p2;
      if (id && !matchedArticleIds.includes(id)) matchedArticleIds.push(id);
      return "";
    });

    // Strip hidden Professor tags
    cleanText = cleanText.replace(profRegex, (match, p1) => {
      if (p1 && !matchedProfIds.includes(p1)) matchedProfIds.push(p1);
      return "";
    });
    
    // Strip hidden Route tags
    cleanText = cleanText.replace(routeRegex, (match, p1) => {
      if (p1 && !matchedRoutes.includes(p1)) matchedRoutes.push(p1);
      return "";
    });

    return (
      <div>
        <span style={{ whiteSpace: "pre-wrap" }}>{cleanText.trim()}</span>
        
        {/* Render Page Route Buttons (like Apply/Join) */}
        {matchedRoutes.length > 0 && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {matchedRoutes.map(route => {
              let label = "Visit Page ➔";
              if (route === "/join") label = "Apply to Join the Newswire ➔";
              else if (route === "/how") label = "About CyberBriefs ➔";
              else if (route === "/rss") label = "RSS & Podcasts ➔";
              else if (route === "/newsroom") label = "Meet the Newsroom ➔";
              else if (route === "/blogs") label = "Read our Blogs ➔";
              else if (route === "/books") label = "Recommended Books ➔";

              return (
                <div 
                  key={route} 
                  className="chat-route-btn"
                  onClick={() => {
                    setIsOpen(false);
                    window.history.pushState({}, "", route);
                    window.dispatchEvent(new PopStateEvent("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {label}
                </div>
              );
            })}
          </div>
        )}

        {/* Render Professor Desk Cards */}
        {matchedProfIds.length > 0 && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {matchedProfIds.map(idStr => {
              const pid = parseInt(idStr);
              if (pid < 1 || pid > 8) return null;
              const name = PROF_NAMES[pid - 1];
              const position = PROF_POSITIONS[pid - 1];
              const imgUrl = `/images/Proff_${pid}.png`;

              return (
                <div 
                  key={`prof-${pid}`} 
                  className="chat-mini-card"
                  onClick={() => {
                    setIsOpen(false);
                    window.history.pushState({}, "", `/newsroom?prof=${pid}`);
                    window.dispatchEvent(new PopStateEvent("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <img src={imgUrl} className="chat-mini-img" alt={name} />
                  <div className="chat-mini-content">
                    <div className="chat-mini-title">{name}</div>
                    <div className="chat-mini-meta">{position}</div>
                    <div style={{ fontSize: "10px", color: "#C9A227", marginTop: "4px", fontWeight: "bold" }}>VISIT NEWS DESK ➔</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Render News Article Cards */}
        {matchedArticleIds.length > 0 && (
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {matchedArticleIds.map(idStr => {
              const article = articles.find(a => a.id.toString() === idStr);
              if (!article) return null;
              
              const profId = parseInt(article.professor_id) || 1;
              const imgUrl = `/images/Proff_${profId}.png`;

              return (
                <div 
                  key={`art-${idStr}`} 
                  className="chat-mini-card"
                  onClick={() => {
                    setIsOpen(false);
                    window.history.pushState({}, "", `/?article_id=${article.id}`);
                    window.dispatchEvent(new PopStateEvent("popstate"));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <img src={imgUrl} className="chat-mini-img" alt="Author" />
                  <div className="chat-mini-content">
                    <div className="chat-mini-title">{article.ai_headline || article.title}</div>
                    <div className="chat-mini-meta">{article.source || "News Desk"}</div>
                    <div style={{ fontSize: "10px", color: "#161412", marginTop: "4px", fontWeight: "bold" }}>READ ARTICLE ➔</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        .chat-widget-fab {
          position: fixed;
          bottom: 25px;
          right: 25px;
          background-color: #161412;
          color: #F3EEE3;
          border: 1px solid #C9A227;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          z-index: 9999;
          font-size: 24px;
          transition: transform 0.2s ease;
        }
        .chat-widget-fab:hover {
          transform: scale(1.05);
          background-color: #8F7118;
        }
        .chat-window {
          position: fixed;
          bottom: 90px;
          right: 25px;
          width: 360px;
          max-width: calc(100vw - 40px);
          height: 480px;
          background-color: #F3EEE3;
          border: 1px solid #161412;
          border-radius: 8px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          z-index: 9999;
          overflow: hidden;
          font-family: Arial, sans-serif;
        }
        .chat-header {
          background-color: #161412;
          color: #F3EEE3;
          padding: 14px 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chat-body {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .msg-bubble {
          max-width: 88%;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 13.5px;
          line-height: 1.5;
        }
        .msg-user {
          align-self: flex-end;
          background-color: #161412;
          color: #F3EEE3;
        }
        .msg-bot {
          align-self: flex-start;
          background-color: #FFFFFF;
          color: #161412;
          border: 1px solid #D9CBA0;
        }
        .chat-footer {
          display: flex;
          border-top: 1px solid #D9CBA0;
          background: #FFFFFF;
        }
        .chat-input {
          flex: 1;
          padding: 12px 14px;
          border: none;
          outline: none;
          font-size: 13px;
          background: transparent;
        }
        .chat-send-btn {
          background-color: #161412;
          color: #F3EEE3;
          border: none;
          padding: 0 16px;
          font-weight: bold;
          font-size: 11px;
          letter-spacing: 1px;
          cursor: pointer;
        }
        .chat-send-btn:disabled {
          opacity: 0.6;
        }
        
        /* Mini Card CSS */
        .chat-mini-card {
          display: flex;
          gap: 12px;
          background: #F3EEE3;
          border: 1px solid #D9CBA0;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
        }
        .chat-mini-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0,0,0,0.08);
          border-color: #C9A227;
        }
        .chat-mini-img {
          width: 55px;
          height: 55px;
          border-radius: 4px;
          object-fit: cover;
          border: 1px solid #EBE4D5;
        }
        .chat-mini-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .chat-mini-title {
          font-family: Georgia, serif;
          font-size: 13px;
          font-weight: bold;
          line-height: 1.3;
          margin: 0 0 4px 0;
          color: #161412;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .chat-mini-meta {
          font-size: 9px;
          color: #8F7118;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Route Button CSS */
        .chat-route-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: #161412;
          color: #F3EEE3;
          padding: 10px 14px;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
          text-align: center;
          justify-content: center;
        }
        .chat-route-btn:hover {
          transform: translateY(-2px);
          background-color: #8F7118;
        }
      `}</style>

      <button 
        className="chat-widget-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Chatbot"
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div>
              <div style={{ fontWeight: "bold", fontSize: "14px", letterSpacing: "1px" }}>
                CYBERBRIEFS AI
              </div>
              <div style={{ fontSize: "10px", color: "#C9A227" }}>
                Newsroom Intelligence
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "#F3EEE3", cursor: "pointer", fontSize: "16px" }}
            >
              ✕
            </button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`msg-bubble ${msg.sender === "user" ? "msg-user" : "msg-bot"}`}
              >
                {/* Parse standard text vs Mini Cards and Route Buttons */}
                {msg.sender === "bot" ? renderMessageWithCards(msg.text) : msg.text}
              </div>
            ))}
            {loading && (
              <div className="msg-bubble msg-bot" style={{ fontStyle: "italic", color: "#5E574C" }}>
                Scanning Cyberbriefs wire...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-footer" onSubmit={handleSend}>
            <input 
              type="text" 
              className="chat-input"
              placeholder="Ask about latest news, threats, or jobs..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn" disabled={loading || !input.trim()}>
              SEND
            </button>
          </form>
        </div>
      )}
    </>
  );
}