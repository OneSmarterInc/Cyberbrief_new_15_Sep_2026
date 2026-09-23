import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../config";

export default function BlogPage({ onBack }) {
  const [allFetchedBlogs, setAllFetchedBlogs] = useState([]);
  const [displayedBlogs, setDisplayedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogId, setSelectedBlogId] = useState(null);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAllBlogsSafely();
    }
  }, []);

  // 1. Fetch all blogs safely in one go (or capped pages) to prevent 429 rate-limiting
  const fetchAllBlogsSafely = async () => {
    setLoading(true);
    let page = 1;
    let keepFetching = true;
    let accumulated = [];
    const maxPages = 4; // Safety cap to protect against server rate limits

    try {
      while (keepFetching && page <= maxPages) {
        const res = await fetch(`${API_BASE_URL}/blogs/?page=${page}&limit=5`);
        const data = await res.json();
        const batch = data.results || data.blogs || data || [];

        if (batch.length === 0) {
          keepFetching = false;
          break;
        }

        accumulated = [...accumulated, ...batch];

        if (!data.next && batch.length < 5) {
          keepFetching = false;
        } else {
          page += 1;
        }
      }

      // Once fetched, store them and trigger the one-by-one visual reveal
      if (accumulated.length > 0) {
        setAllFetchedBlogs(accumulated);
        setSelectedBlogId(accumulated[0].id);
        setLoading(false);

        // 2. Reveal blogs one by one on the screen
        revealOneByOne(accumulated);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setLoading(false);
    }
  };

  // Helper to animate/push items into view one after another
  const revealOneByOne = (blogsList) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < blogsList.length) {
        const currentItem = blogsList[index];
        setDisplayedBlogs(prev => {
          if (prev.some(b => b.id === currentItem.id)) return prev;
          return [...prev, currentItem];
        });
        index++;
      } else {
        clearInterval(interval);
      }
    }, 400); // 400ms delay between each blog appearing on screen
  };

  const currentBlog = allFetchedBlogs.find(b => b.id === selectedBlogId) || allFetchedBlogs[0];
  const recentBlogs = displayedBlogs.filter(b => b.id !== currentBlog?.id);

  const getImageUrl = (blogObj) => {
    const rawImg = blogObj?.image || blogObj?.image_data || blogObj?.image_url;
    if (!rawImg) return null;
    if (rawImg.startsWith("http") || rawImg.startsWith("data:image")) return rawImg;
    
    const base = API_BASE_URL.replace(/\/api\/?$/, ""); 
    const cleanUrl = rawImg.startsWith("/") ? rawImg : `/${rawImg}`;
    return `${base}${cleanUrl}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString; 
    
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${month}-${day}-${year}`;
  };

  const handleBlogClick = (id) => {
    setSelectedBlogId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3EEE3", fontFamily: "Arial, sans-serif", color: "#161412", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1350px", margin: "0 auto" }}>

        {loading ? (
          <p style={{ textAlign: "center", color: "#5E574C", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "18px" }}>Loading article...</p>
        ) : allFetchedBlogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", border: "1px solid #161412", backgroundColor: "#FDFBF7" }}>
            <p style={{ color: "#5E574C", fontFamily: "Georgia, serif", fontSize: "18px", fontStyle: "italic" }}>No blog posts available right now.</p>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "60px", alignItems: "flex-start", flexWrap: "wrap" }}>
            
            {/* Left Column: Main Article Detail View */}
            <div style={{ flex: "1", minWidth: "300px", maxWidth: "850px", backgroundColor: "#FDFBF7", padding: "40px", border: "1px solid #161412", borderTop: "4px solid #161412" }}>
              {currentBlog && getImageUrl(currentBlog) && (
                <div style={{ marginBottom: "30px", backgroundColor: "#fff", padding: "5px", border: "1px solid #C9C1B0" }}>
                  <img 
                    src={getImageUrl(currentBlog)} 
                    alt={currentBlog.title} 
                    style={{ width: "100%", maxHeight: "550px", objectFit: "contain", display: "block", margin: "0 auto" }} 
                    onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                  />
                </div>
              )}

              <div style={{ fontSize: "12px", color: "#5E574C", marginBottom: "15px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                Posted: {formatDate(currentBlog?.created_at)}
              </div>

              <h1 style={{ color: "#161412", fontFamily: "Georgia, serif", fontSize: "36px", margin: "0 0 20px 0", lineHeight: "1.2" }}>
                {currentBlog?.title}
              </h1>

              <div style={{ fontSize: "14px", color: "#5E574C", fontStyle: "italic", marginBottom: "35px", borderBottom: "1px solid #EBE4D5", paddingBottom: "20px" }}>
                Cyberbriefs Research Desk | Authored {formatDate(currentBlog?.created_at)}
              </div>

              <div 
                dangerouslySetInnerHTML={{ __html: currentBlog?.description || "" }} 
                style={{ fontSize: "18px", color: "#333", lineHeight: "1.8", fontFamily: "Georgia, serif" }} 
              />
            </div>

            {/* Right Column: One-by-One Sequential Reveal Sidebar */}
            <div style={{ width: "380px", flexShrink: "0" }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", borderBottom: "2px solid #161412", paddingBottom: "10px", marginBottom: "25px", marginTop: 0, color: "#161412" }}>
                Recent Editorials
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                {recentBlogs.length === 0 ? (
                  <p style={{ fontSize: "14px", color: "#5E574C", fontStyle: "italic" }}>Loading editorials...</p>
                ) : recentBlogs.map(blog => {
                  const thumbImg = getImageUrl(blog);
                  return (
                    <div 
                      key={blog.id} 
                      onClick={() => handleBlogClick(blog.id)}
                      style={{ 
                        display: "flex", gap: "15px", cursor: "pointer", alignItems: "flex-start", 
                        padding: "10px", backgroundColor: "#FDFBF7", border: "1px solid #EBE4D5", 
                        transition: "all 0.3s ease",
                        animation: "fadeIn 0.4s ease-in-out" 
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = "#161412"}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = "#EBE4D5"}
                    >
                      {thumbImg ? (
                        <img 
                          src={thumbImg} 
                          alt={blog.title} 
                          style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid #C9C1B0", flexShrink: 0, backgroundColor: "#fff" }} 
                          onError={(e) => { 
                            e.target.style.display = 'none'; 
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; 
                          }}
                        />
                      ) : null}
                      <div style={{ display: thumbImg ? "none" : "flex", width: "80px", height: "80px", backgroundColor: "#EBE4D5", border: "1px solid #C9C1B0", flexShrink: 0, alignItems: "center", justifyContent: "center", fontSize: "24px" }}>📄</div>
                      
                      <div>
                        <div style={{ fontSize: "11px", color: "#5E574C", marginBottom: "5px", fontWeight: "bold", textTransform: "uppercase" }}>{formatDate(blog.created_at)}</div>
                        <div style={{ fontSize: "16px", color: "#161412", lineHeight: "1.4", fontWeight: "bold", fontFamily: "Georgia, serif" }}>
                          {blog.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}