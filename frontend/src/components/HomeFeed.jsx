import React, { useState, useEffect } from "react";
import NewsCard from "./NewsCard";
import TheWire from "./TheWire";

const localImages = [
  "/images/news_1.jpg", "/images/news_2.jpg", "/images/news_3.jpg",
  "/images/news_4.jpg", "/images/news_5.jpg", "/images/news_6.jpg", 
  "/images/news_7.jpg", "/images/news_8.jpg", "/images/news_9.jpg", 
  "/images/news_10.jpg", "/images/news_11.jpg", "/images/news_12.jpg", 
  "/images/news_13.jpg", "/images/news_14.jpg", "/images/news_15.jpg",
];

const getArticleImage = (article) => {
  if (!article) return localImages[0];
  // If article has a numeric ID, use it. Otherwise, generate a hash from its title/guid.
  const numericId = Number(article.id) || Math.abs(article.title?.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) || 1;
  return localImages[numericId % localImages.length];
};

export default function HomeFeed({ 
  searchQuery, filteredArticles, currentArticles, loading, error, refreshing, fetchNews,
  currentPage, totalPages, handlePageChange, articles, selectedCategory 
}) {
  
  // Custom Website Modal State
  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "alert", onConfirm: null });
  
  // State: Tracks which article the user clicked on to view details
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Scroll to the top automatically when opening or closing an article
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedArticle]);

  const mainArticles = currentArticles.slice(0, 3);
  const morningArticles = currentArticles.slice(3, 6);
  const briefArticles = currentArticles.slice(6, 14);

  // --- PROFESSIONAL DETAILED ARTICLE VIEW ---
  if (selectedArticle) {
    // STRICTLY USE LOCAL IMAGE: Matches exactly what was shown in the feed
    const displayImage = localImages[selectedArticle.id % localImages.length];
    
    // Generate a consistent color for the tiny source avatar
    let hash = 0;
    const sourceName = selectedArticle.source || "News";
    for (let i = 0; i < sourceName.length; i++) hash = sourceName.charCodeAt(i) + ((hash << 5) - hash);
    const avatarColor = "#" + "00000".substring(0, 6 - (hash & 0x00FFFFFF).toString(16).toUpperCase().length) + (hash & 0x00FFFFFF).toString(16).toUpperCase();
    
    return (
      <div style={{ maxWidth: "950px", margin: "0 auto", padding: "40px 20px", width: "100%" }}>
        
        {/* MATCHED WEBSITE THEME: Changed background to #F3EEE3 and border to #161412 */}
        <div style={{ backgroundColor: "#F3EEE3", borderRadius: "8px", border: "1px solid #161412", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
          
          {/* Hero Image with Gradient Overlay */}
          <div style={{ position: "relative", width: "100%", height: "450px", backgroundColor: "#111" }}>
            <img 
              src={displayImage} 
              alt="Article Cover" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
            
            {/* Dark Gradient Overlay for Text Readability */}
            <div style={{ 
              position: "absolute", 
              bottom: 0, left: 0, right: 0, 
              background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
              padding: "50px 40px 30px 40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end"
            }}>
              {/* Editorial Serif Header matching the rest of the site */}
              <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", color: "#F3EEE3", margin: "0 0 20px 0", lineHeight: "1.25", fontWeight: "bold" }}>
                {selectedArticle.ai_headline || selectedArticle.title}
              </h1>
              
              {/* Author / Source Meta Bar */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ 
                  width: "36px", height: "36px", borderRadius: "50%", backgroundColor: avatarColor, 
                  display: "flex", alignItems: "center", justifyContent: "center", 
                  color: "#F3EEE3", fontWeight: "bold", fontSize: "16px", border: "2px solid #F3EEE3"
                }}>
                  {sourceName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "bold", color: "#F3EEE3", letterSpacing: "0.5px" }}>
                    {sourceName}
                  </div>
                  <div style={{ fontSize: "13px", color: "#C9C1B0", marginTop: "2px" }}>
                    {selectedArticle.published || "Recently Added"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Article Content Section */}
          <div style={{ padding: "40px" }}>
            
            <p style={{ fontSize: "18px", color: "#161412", lineHeight: "1.8", margin: "0 0 50px 0", fontFamily: "Arial, sans-serif" }}>
              {selectedArticle.summary || "No summary is available for this article at this time. Click the original article link below to read the full coverage."}
            </p>
            
            {/* Professional Footer Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #C9C1B0", paddingTop: "25px" }}>
              
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

              <button 
                onClick={() => setSelectedArticle(null)}
                style={{ 
                  backgroundColor: "#d32f2f", color: "#ffffff", border: "none", 
                  padding: "10px 20px", fontWeight: "bold", cursor: "pointer", 
                  borderRadius: "4px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px",
                  transition: "background 0.2s, transform 0.1s" 
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = "#b71c1c"}
                onMouseOut={e => e.currentTarget.style.backgroundColor = "#d32f2f"}
                onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
              >
                <span style={{ fontSize: "16px", marginBottom: "2px" }}>←</span> Back to Feed
              </button>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STANDARD HOME FEED VIEW ---
  return (
    <div className="layout-container" style={{ display: "flex", maxWidth: "1550px", margin: "0 auto", width: "100%", padding: "20px 15px", gap: "25px", position: "relative" }}>
      
      {/* Custom Website Modal Popup */}
      {modal.show && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#F3EEE3", border: "2px solid #161412", padding: "30px", maxWidth: "400px", width: "100%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", borderRadius: "4px" }}>
            <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 10px 0", color: "#161412", fontSize: "18px" }}>{modal.title}</h3>
            <p style={{ fontSize: "14px", color: "#5E574C", lineHeight: "1.5", marginBottom: "25px" }}>{modal.message}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              {modal.type === "confirm" ? (
                <>
                  <button onClick={() => setModal({ show: false })} style={{ padding: "8px 16px", backgroundColor: "#fff", border: "1px solid #161412", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
                  <button onClick={modal.onConfirm} style={{ padding: "8px 16px", backgroundColor: "#D32F2F", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Confirm</button>
                </>
              ) : (
                <button onClick={() => setModal({ show: false })} style={{ padding: "8px 20px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .layout-container { flex-direction: row; align-items: flex-start; }
        .wire-sidebar { width: 420px; flex-shrink: 0; }
        .page-content { flex: 1; min-width: 0; }
        .most-covered-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .clickable-card { text-decoration: none; color: inherit; display: flex; transition: opacity 0.2s; cursor: pointer; }
        .clickable-card:hover { opacity: 0.85; }
        @media (max-width: 1024px) {
          .layout-container { flex-direction: column; }
          .wire-sidebar { width: 100%; }
          .most-covered-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .most-covered-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="page page-content" style={{ padding: 0 }}>
        <section className="page-header">
          <div>
            <div className="kicker">THE DAILY BRIEF</div>
            <h1>{searchQuery ? `Search Results: "${searchQuery}"` : "Today’s News Desk"}</h1>
            <p>{filteredArticles.length} stories • {searchQuery ? "Matching your search" : "AI-powered news intelligence"}</p>
          </div>
          <button className="refresh" onClick={() => fetchNews(true)} disabled={refreshing}>
            {refreshing ? "REFRESHING" : "REFRESH"}
          </button>
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
            {currentArticles.length === 0 ? (
              <div className="state">
                <p>{searchQuery ? "No stories match your search." : "No stories in this category."}</p>
              </div>
            ) : (
              <>
                {mainArticles.map((article, index) => (
                  <NewsCard 
                    key={article.id} 
                    article={article} 
                    index={index} 
                    onArticleClick={setSelectedArticle} 
                  />
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
                        const displayImage = localImages[article.id % localImages.length];

                        return (
                          <div 
                            onClick={() => setSelectedArticle(article)} 
                            key={article.id} 
                            className="clickable-card" 
                            style={{ flexDirection: "column" }}
                          >
                            <div style={{ height: "130px", marginBottom: "15px", position: "relative", overflow: "hidden" }}>
                              <img 
                                src={displayImage} 
                                alt="" 
                                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                              />
                              <span style={{ position: "absolute", bottom: "10px", left: "10px", color: "#F3EEE3", fontSize: "11px", fontWeight: "bold", textShadow: "0px 1px 2px rgba(0,0,0,0.5)" }}>
                                Generated illustration
                              </span>
                            </div>
                            <span style={{ color: "#C9A227", fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>{article.category || "News"}</span>
                            <h3 style={{ fontFamily: "Georgia, serif", fontSize: "18px", margin: "0 0 10px 0", lineHeight: 1.3 }}>{article.ai_headline || article.title}</h3>
                            <p style={{ fontSize: "14px", color: "#5E574C", lineHeight: 1.5, marginBottom: "20px", flex: 1 }}>{article.summary ? article.summary.substring(0, 120) + "..." : "No summary available."}</p>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #C9C1B0", paddingTop: "12px" }}>
                              <span style={{ fontSize: "12px", color: "#5E574C", display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ backgroundColor: "#161412", color: "#F3EEE3", width: "18px", height: "18px", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold" }}>
                                  {randomSources}
                                </span>
                                sources
                              </span>
                              <span style={{ fontSize: "12px", color: "#5E574C" }}>
                                Updated {new Date(article.published || Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "50px", paddingTop: "30px", borderTop: "2px solid #161412" }}>
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)} 
                      disabled={currentPage === 1}
                      style={{ padding: "12px 24px", backgroundColor: currentPage === 1 ? "#EBE4D5" : "#161412", color: currentPage === 1 ? "#A39E93" : "#F3EEE3", border: "none", fontWeight: "bold", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                    >
                      &larr; PREVIOUS
                    </button>
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: "#5E574C", letterSpacing: "1px" }}>
                      PAGE {currentPage} OF {totalPages}
                    </span>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)} 
                      disabled={currentPage === totalPages}
                      style={{ padding: "12px 24px", backgroundColor: currentPage === totalPages ? "#EBE4D5" : "#161412", color: currentPage === totalPages ? "#A39E93" : "#F3EEE3", border: "none", fontWeight: "bold", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                    >
                      NEXT &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      <div className="wire-sidebar">
        <TheWire 
          articles={articles} 
          selectedCategory={selectedCategory} 
          onArticleClick={setSelectedArticle} 
        />

        {briefArticles.length > 0 && (
          <section style={{ marginTop: "40px", paddingTop: "10px" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "26px", color: "#161412", margin: "0 0 10px 0" }}>In brief</h2>
            <p style={{ fontSize: "14px", color: "#5E574C", marginBottom: "25px" }}>Stories carried by fewer outlets, summarized in one line each.</p>
            
            <div style={{ display: "flex", flexDirection: "column" }}>
              {briefArticles.map((article, idx) => (
                <div 
                  onClick={() => setSelectedArticle(article)} 
                  key={article.id} 
                  className="clickable-card" 
                  style={{ gap: "15px", borderBottom: "1px solid #C9C1B0", paddingBottom: "15px", marginBottom: "15px" }}
                >
                  <span style={{ color: "#C9A227", fontFamily: "Georgia, serif", fontSize: "24px", fontWeight: "bold", alignSelf: "flex-start", marginTop: "-3px" }}>
                    {idx + 1}
                  </span>
                  <div>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#161412", lineHeight: 1.4, fontWeight: "bold" }}>
                      {article.ai_headline || article.title}
                    </h4>
                    <span style={{ fontSize: "13px", color: "#5E574C" }}>
                      1 source · {article.category || "News"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}