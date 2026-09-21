import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function BlogPage({ onBack }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  
  // Pagination State for the Sidebar
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  useEffect(() => {
    fetch(`${API_BASE_URL}/blogs/`)
      .then(res => res.json())
      .then(data => {
        const fetchedBlogs = data.blogs || [];
        setBlogs(fetchedBlogs);
        if (fetchedBlogs.length > 0) {
          setSelectedBlogId(fetchedBlogs[0].id); // Default to latest blog
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const currentBlog = blogs.find(b => b.id === selectedBlogId) || blogs[0];
  const recentBlogs = blogs.filter(b => b.id !== currentBlog?.id);

  // Pagination Logic
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentSidebarBlogs = recentBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const totalPages = Math.ceil(recentBlogs.length / blogsPerPage);

  // HELPER: Resolves the image URL safely (Handles absolute, relative, and Base64 strings)
  const getImageUrl = (blogObj) => {
    const rawImg = blogObj?.image || blogObj?.image_data || blogObj?.image_url;
    if (!rawImg) return null;
    if (rawImg.startsWith("http") || rawImg.startsWith("data:image")) return rawImg;
    
    const base = API_BASE_URL.replace(/\/api\/?$/, ""); 
    const cleanUrl = rawImg.startsWith("/") ? rawImg : `/${rawImg}`;
    return `${base}${cleanUrl}`;
  };

  const handleBlogClick = (id) => {
    setSelectedBlogId(id);
    setCurrentPage(1); // Reset sidebar pagination when viewing a new blog
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3EEE3", fontFamily: "Arial, sans-serif", color: "#161412", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1350px", margin: "0 auto" }}>

        {loading ? (
          <p style={{ textAlign: "center", color: "#5E574C", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "18px" }}>Loading article...</p>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", border: "1px solid #161412", backgroundColor: "#FDFBF7" }}>
            <p style={{ color: "#5E574C", fontFamily: "Georgia, serif", fontSize: "18px", fontStyle: "italic" }}>No blog posts available right now.</p>
          </div>
        ) : (
          /* Two-Column Editorial Layout */
          <div style={{ display: "flex", gap: "60px", alignItems: "flex-start", flexWrap: "wrap" }}>
            
            {/* Left Column: Main Article Detail View */}
            <div style={{ flex: "1", minWidth: "300px", maxWidth: "850px", backgroundColor: "#FDFBF7", padding: "40px", border: "1px solid #161412", borderTop: "4px solid #161412" }}>
              {getImageUrl(currentBlog) && (
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
                Posted: {currentBlog.created_at}
              </div>

              {/* Theme-matched Headline */}
              <h1 style={{ color: "#161412", fontFamily: "Georgia, serif", fontSize: "36px", margin: "0 0 20px 0", lineHeight: "1.2" }}>
                {currentBlog.title}
              </h1>

              <div style={{ fontSize: "14px", color: "#5E574C", fontStyle: "italic", marginBottom: "35px", borderBottom: "1px solid #EBE4D5", paddingBottom: "20px" }}>
                Cyberbriefs Research Desk | Authored {currentBlog.created_at}
              </div>

              {/* Formatted HTML Description */}
              <div 
                dangerouslySetInnerHTML={{ __html: currentBlog.description }} 
                style={{ fontSize: "18px", color: "#333", lineHeight: "1.8", fontFamily: "Georgia, serif" }} 
              />
            </div>

            {/* Right Column: Recent Blogs Sidebar with Pagination */}
            <div style={{ width: "380px", flexShrink: "0" }}>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "bold", borderBottom: "2px solid #161412", paddingBottom: "10px", marginBottom: "25px", marginTop: 0, color: "#161412" }}>
                Recent Editorials
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                {currentSidebarBlogs.length === 0 ? (
                  <p style={{ fontSize: "14px", color: "#5E574C", fontStyle: "italic" }}>No other recent blogs.</p>
                ) : currentSidebarBlogs.map(blog => {
                  const thumbImg = getImageUrl(blog);
                  return (
                    <div 
                      key={blog.id} 
                      onClick={() => handleBlogClick(blog.id)}
                      style={{ display: "flex", gap: "15px", cursor: "pointer", alignItems: "flex-start", padding: "10px", backgroundColor: "#FDFBF7", border: "1px solid #EBE4D5", transition: "border 0.2s" }}
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
                        <div style={{ fontSize: "11px", color: "#5E574C", marginBottom: "5px", fontWeight: "bold", textTransform: "uppercase" }}>{blog.created_at}</div>
                        <div style={{ fontSize: "16px", color: "#161412", lineHeight: "1.4", fontWeight: "bold", fontFamily: "Georgia, serif" }}>
                          {blog.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PAGINATION CONTROLS */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "30px", borderTop: "1px solid #C9C1B0", paddingTop: "20px" }}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{ 
                      padding: "6px 14px", 
                      backgroundColor: currentPage === 1 ? "transparent" : "#161412", 
                      color: currentPage === 1 ? "#C9C1B0" : "#F3EEE3", 
                      border: `1px solid ${currentPage === 1 ? "#C9C1B0" : "#161412"}`, 
                      cursor: currentPage === 1 ? "default" : "pointer",
                      fontWeight: "bold",
                      fontSize: "12px"
                    }}
                  >
                    &larr; PREV
                  </button>
                  
                  <span style={{ fontSize: "12px", color: "#5E574C", fontWeight: "bold", letterSpacing: "1px" }}>
                    PAGE {currentPage} OF {totalPages}
                  </span>
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{ 
                      padding: "6px 14px", 
                      backgroundColor: currentPage === totalPages ? "transparent" : "#161412", 
                      color: currentPage === totalPages ? "#C9C1B0" : "#F3EEE3", 
                      border: `1px solid ${currentPage === totalPages ? "#C9C1B0" : "#161412"}`, 
                      cursor: currentPage === totalPages ? "default" : "pointer",
                      fontWeight: "bold",
                      fontSize: "12px"
                    }}
                  >
                    NEXT &rarr;
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
