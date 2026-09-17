import React, { useState, useMemo, useEffect } from "react";

// Local fallback images from the public folder
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

export default function RssFeedPage({ articles, onBack }) {
  // 1. Initialize state directly from the URL so Refreshing the page works
  const [selectedSource, setSelectedSource] = useState(() => {
    return new URLSearchParams(window.location.search).get("source") || null;
  });
  const [selectedArticleId, setSelectedArticleId] = useState(() => {
    return new URLSearchParams(window.location.search).get("article") || null;
  });
  
  const [searchQuery, setSearchQuery] = useState("");

  // 2. Listen to the Browser's Back/Forward buttons and update the view automatically
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedSource(params.get("source"));
      setSelectedArticleId(params.get("article"));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 3. Find the actual article object based on the ID in the URL
  const selectedArticle = useMemo(() => {
    if (!selectedArticleId || !articles) return null;
    return articles.find(a => String(a.id) === String(selectedArticleId)) || null;
  }, [articles, selectedArticleId]);

  const uniqueSources = useMemo(() => {
    return Array.from(
      new Set(articles.filter(a => a.is_active !== false && a.source).map(a => a.source))
    ).sort();
  }, [articles]);

  const sourceArticles = useMemo(() => {
    if (!selectedSource) return [];
    
    return articles.filter(a => {
      if (a.is_active === false || a.source !== selectedSource) return false;
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

  // Handle clicking the on-screen "Back" button
  const handleBack = () => {
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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3EEE3", fontFamily: "Arial, sans-serif", color: "#161412", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Top Navigation Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "2px solid #161412", paddingBottom: "15px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", margin: 0, fontSize: "28px", color: "#161412" }}>
            {selectedArticle 
              ? "Article Details" 
              : selectedSource 
                ? "Source Feed" 
                : "Our Intelligence Sources"}
          </h2>
          <button 
            onClick={handleBack} 
            style={{ padding: "10px 20px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontSize: "14px", fontWeight: "bold", cursor: "pointer", borderRadius: "4px", transition: "background 0.2s" }} 
            onMouseOver={e => e.target.style.backgroundColor = "#8F7118"} 
            onMouseOut={e => e.target.style.backgroundColor = "#161412"}
          >
            ← {selectedArticle 
                ? "Back to Articles" 
                : selectedSource 
                  ? "Back to Sources" 
                  : "Back to News"}
          </button>
        </div>

        {/* CONDITION 3: SHOW PROFESSIONAL DETAILED ARTICLE VIEW */}
        {selectedArticle ? (
          (() => {
            const displayImage = localImages[selectedArticle.id % localImages.length];
            let hash = 0;
            const sourceName = selectedArticle.source || "News";
            for (let i = 0; i < sourceName.length; i++) hash = sourceName.charCodeAt(i) + ((hash << 5) - hash);
            const avatarColor = "#" + "00000".substring(0, 6 - (hash & 0x00FFFFFF).toString(16).toUpperCase().length) + (hash & 0x00FFFFFF).toString(16).toUpperCase();
            
            return (
              <div style={{ maxWidth: "950px", margin: "0 auto", width: "100%" }}>
                <div style={{ backgroundColor: "#F3EEE3", borderRadius: "12px", border: "1px solid #161412", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
                  
                  {/* Hero Image with Gradient Overlay */}
                  <div style={{ position: "relative", width: "100%", height: "450px", backgroundColor: "#111" }}>
                    <img 
                      src={displayImage} 
                      alt="Article Cover" 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    />
                    
                    <div style={{ 
                      position: "absolute", 
                      bottom: 0, left: 0, right: 0, 
                      background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
                      padding: "50px 40px 30px 40px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end"
                    }}>
                      <h1 style={{ fontFamily: "Georgia, serif", fontSize: "36px", color: "#F3EEE3", margin: "0 0 20px 0", lineHeight: "1.25", fontWeight: "bold" }}>
                        {selectedArticle.ai_headline || selectedArticle.title}
                      </h1>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ 
                          width: "36px", height: "36px", borderRadius: "50%", backgroundColor: avatarColor, 
                          display: "flex", alignItems: "center", justifyContent: "center", 
                          color: "#fff", fontWeight: "bold", fontSize: "16px", border: "2px solid #F3EEE3"
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
                  <div style={{ padding: "40px", backgroundColor: "#F3EEE3" }}>
                    <p style={{ fontSize: "18px", color: "#161412", lineHeight: "1.8", margin: "0 0 50px 0", fontFamily: "Arial, sans-serif" }}>
                      {selectedArticle.summary || "No summary is available for this article at this time. Click the original article link below to read the full coverage."}
                    </p>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #C9C1B0", paddingTop: "25px", flexWrap: "wrap", gap: "15px" }}>
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

        /* CONDITION 1: SHOW THE GRID OF RSS SOURCES */
        ) : !selectedSource ? (
          uniqueSources.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#F3EEE3", border: "1px solid #161412", borderRadius: "8px" }}>
              <p style={{ color: "#5E574C", fontSize: "18px" }}>No RSS sources currently active.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "40px" }}>
              {uniqueSources.map((source, index) => {
                const sourceImage = localImages[index % localImages.length];

                return (
                  <div 
                    key={source} 
                    onClick={() => openSource(source)}
                    style={{ 
                      backgroundColor: "#F3EEE3", 
                      border: "1px solid #161412",
                      borderRadius: "10px", 
                      padding: "50px 30px", 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center", 
                      justifyContent: "center",
                      textAlign: "center",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.05)" 
                    }}
                    onMouseOver={e => { 
                      e.currentTarget.style.transform = "translateY(-6px)"; 
                      e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.12)"; 
                    }}
                    onMouseOut={e => { 
                      e.currentTarget.style.transform = "translateY(0)"; 
                      e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)"; 
                    }}
                  >
                    <img 
                      src={sourceImage} 
                      alt={source}
                      style={{ 
                        width: "130px", 
                        height: "130px", 
                        borderRadius: "50%", 
                        objectFit: "cover",
                        marginBottom: "25px",
                        border: "2px solid #161412",
                        backgroundColor: "#EBE4D5" 
                      }}
                    />
                    <h3 style={{ margin: 0, fontSize: "24px", fontFamily: "Georgia, serif", fontWeight: "bold", color: "#161412", lineHeight: "1.3" }}>
                      {source}
                    </h3>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          
          /* CONDITION 2: SHOW THE DETAILED LIST OF ARTICLES FOR THE SELECTED SOURCE */
          <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
            
            <h1 style={{ textAlign: "center", color: "#161412", fontFamily: "Georgia, serif", fontSize: "42px", fontWeight: "bold", margin: "0 0 25px 0" }}>
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
                  fontSize: "18px", 
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
                <p style={{ textAlign: "center", color: "#5E574C", fontSize: "20px", marginTop: "20px" }}>No articles match your search.</p>
              ) : (
                sourceArticles.map((article) => {
                  const displayImage = localImages[article.id % localImages.length];
                  
                  return (
                    <div 
                      key={article.id} 
                      onClick={() => openArticle(article)}
                      style={{ 
                        display: "flex", 
                        backgroundColor: "#F3EEE3", 
                        borderRadius: "8px", 
                        overflow: "hidden", 
                        boxShadow: "0 4px 15px rgba(0,0,0,0.04)", 
                        border: "1px solid #161412",
                        flexDirection: window.innerWidth < 768 ? "column" : "row",
                        cursor: "pointer",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease"
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08)";
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.04)";
                      }}
                    >
                      <div style={{ 
                        width: window.innerWidth < 768 ? "100%" : "380px", 
                        minWidth: "380px",
                        padding: "25px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#0b1a13"
                      }}>
                        <img 
                          src={displayImage} 
                          alt="Article" 
                          style={{ width: "100%", height: "240px", objectFit: "contain", borderRadius: "4px" }} 
                        />
                      </div>

                      <div style={{ padding: "30px 40px 30px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        
                        <h3 
                          style={{ 
                            textDecoration: "none", 
                            color: "#161412", 
                            fontSize: "24px", 
                            fontFamily: "Georgia, serif", 
                            fontWeight: "bold", 
                            lineHeight: "1.3", 
                            marginBottom: "12px",
                            margin: "0 0 12px 0"
                          }}
                        >
                          {article.original_title || article.title}
                        </h3>
                        
                        <div style={{ fontSize: "14px", color: "#8F7118", fontWeight: "bold", marginBottom: "15px" }}>
                          {article.published || "Recent"}
                        </div>
                        
                        <p style={{ fontSize: "16px", color: "#5E574C", lineHeight: "1.6", margin: 0 }}>
                          {article.summary 
                            ? (article.summary.length > 300 ? article.summary.substring(0, 300) + "..." : article.summary) 
                            : "No summary available for this article."}
                        </p>

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