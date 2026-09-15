import React, { useMemo } from "react";

export default function TheWire({ articles, selectedCategory = "All" }) {
  // Grab exactly 10 random, active stories filtered by category
  const wireArticles = useMemo(() => {
    if (!articles || articles.length === 0) return [];
    
    // Only use active articles
    let activeArticles = articles.filter(a => a.is_active !== false);
    
    // Filter by the selected category from the Navbar
    if (selectedCategory !== "All") {
      activeArticles = activeArticles.filter(
        article => (article.category || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Shuffle the array randomly
    const shuffled = [...activeArticles].sort(() => 0.5 - Math.random());
    
    // Return exactly 10
    return shuffled.slice(0, 10);
  }, [articles, selectedCategory]);

  // Generate a mock time offset to simulate a live updating feed
  const formatTime = (dateString, index) => {
    const d = dateString ? new Date(dateString) : new Date();
    d.setMinutes(d.getMinutes() - (index * 6)); // Space them out by 6 minutes
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <aside style={{ backgroundColor: "#1F3A2E", color: "#F3EEE3", padding: "30px 25px", fontFamily: "Arial, Helvetica, sans-serif", height: "100%" }}>
      
      {/* Add a quick hover effect for the links */}
      <style>{`
        .wire-clickable { text-decoration: none; color: inherit; display: flex; transition: opacity 0.2s; }
        .wire-clickable:hover { opacity: 0.75; }
      `}</style>

      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(243, 238, 227, 0.2)", paddingBottom: "20px", marginBottom: "20px" }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "36px", margin: 0, color: "#F3EEE3", letterSpacing: "-0.5px" }}>The wire</h2>
        <div style={{ fontSize: "13px", color: "#C9C1B0", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#C9A227", display: "inline-block" }}></span>
          Live · {selectedCategory}
        </div>
      </div>

      {/* List of articles */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {wireArticles.length > 0 ? (
          wireArticles.map((article, i) => {
            const isLead = i % 4 === 0;
            const isBreach = i % 7 === 0;
            let badgeText = "new story";
            if (isLead) badgeText = "adds to lead story";
            if (isBreach) badgeText = "adds to breach story";

            return (
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                key={article.id || i} 
                className="wire-clickable"
                style={{ gap: "15px", paddingBottom: "20px", marginBottom: "20px", borderBottom: "1px solid rgba(243, 238, 227, 0.1)" }}
              >
                {/* Left Column: Timestamp */}
                <div style={{ color: "#C9C1B0", fontSize: "14px", width: "45px", flexShrink: 0, marginTop: "2px" }}>
                  {formatTime(article.published, i)}
                </div>
                
                {/* Right Column: Headline and Source */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", lineHeight: "1.4", color: "#F3EEE3", fontWeight: "bold" }}>
                    {article.ai_headline || article.title}
                  </h4>
                  <div style={{ fontSize: "13px", color: "#C9C1B0" }}>
                    {article.source || "News Source"} · <span style={{ color: badgeText !== "new story" ? "#C9A227" : "#C9C1B0" }}>{badgeText}</span>
                  </div>
                </div>
              </a>
            );
          })
        ) : (
          <div style={{ color: "#C9C1B0", fontSize: "14px", fontStyle: "italic" }}>
            No stories currently available for {selectedCategory}.
          </div>
        )}
      </div>
    </aside>
  );
}