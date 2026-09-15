import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function BlogPage({ onBack }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogId, setSelectedBlogId] = useState(null);

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

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif", color: "#111111", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Top Navigation Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "1px solid #e0e0e0", paddingBottom: "15px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", margin: 0, fontSize: "20px", fontWeight: "normal", letterSpacing: "0.5px" }}>Cyberbriefs</h2>
          <button onClick={onBack} style={{ padding: "8px 16px", backgroundColor: "#111111", color: "#fff", border: "none", fontSize: "12px", fontWeight: "bold", cursor: "pointer", borderRadius: "4px" }}>← Back to News</button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#666" }}>Loading article...</p>
        ) : blogs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", border: "1px solid #e0e0e0" }}>
            <p style={{ color: "#666" }}>No blog posts available right now.</p>
          </div>
        ) : (
          /* Two-Column Editorial Layout */
          <div style={{ display: "flex", gap: "50px", alignItems: "flex-start", flexWrap: "wrap" }}>
            
            {/* Left Column: Main Article Detail View */}
            <div style={{ flex: "1", minWidth: "300px", maxWidth: "700px" }}>
              {currentBlog.image_url && (
                <div style={{ marginBottom: "15px", backgroundColor: "#1a1a1a", padding: "10px", borderRadius: "4px" }}>
                  <img src={currentBlog.image_url} alt={currentBlog.title} style={{ width: "100%", maxHeight: "400px", objectFit: "contain", display: "block", margin: "0 auto" }} />
                </div>
              )}

              <div style={{ fontSize: "12px", color: "#333", marginBottom: "8px" }}>
                Posted On: {currentBlog.created_at}
              </div>

              <h1 style={{ color: "#cc0000", fontFamily: "Georgia, serif", fontSize: "22px", margin: "0 0 25px 0", lineHeight: "1.3" }}>
                {currentBlog.title}
              </h1>

              <div style={{ fontSize: "13px", color: "#333", fontStyle: "italic", marginBottom: "25px", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
                Cyberbriefs Research | {currentBlog.created_at}
              </div>

              {/* Formatted HTML Description */}
              <div 
                dangerouslySetInnerHTML={{ __html: currentBlog.description }} 
                style={{ fontSize: "15px", color: "#222", lineHeight: "1.7", fontFamily: "Georgia, serif" }} 
              />
            </div>

            {/* Right Column: Recent Blogs Sidebar */}
            <div style={{ width: "300px", flexShrink: "0" }}>
              <h3 style={{ fontFamily: "Arial, sans-serif", fontSize: "15px", fontWeight: "bold", borderBottom: "1px solid #111", paddingBottom: "8px", marginBottom: "20px", marginTop: 0 }}>
                Recent Blogs
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {recentBlogs.length === 0 ? (
                  <p style={{ fontSize: "12px", color: "#666" }}>No other recent blogs.</p>
                ) : recentBlogs.map(blog => (
                  <div 
                    key={blog.id} 
                    onClick={() => { setSelectedBlogId(blog.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    style={{ display: "flex", gap: "12px", cursor: "pointer", alignItems: "flex-start" }}
                  >
                    {blog.image_url ? (
                      <img src={blog.image_url} alt={blog.title} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ddd", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: "60px", height: "60px", backgroundColor: "#eee", borderRadius: "4px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📄</div>
                    )}
                    <div>
                      <div style={{ fontSize: "11px", color: "#cc0000", marginBottom: "3px" }}>{blog.created_at}</div>
                      <div style={{ fontSize: "13px", color: "#111", lineHeight: "1.3", fontWeight: "500", fontFamily: "Arial, sans-serif" }}>
                        {blog.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}