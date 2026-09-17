import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function BookPage({ onBack }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/books/`)
      .then(res => res.json())
      .then(data => {
        setBooks(data.books || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // HELPER: Resolves the image URL safely
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:image")) return url;
    
    const base = API_BASE_URL.replace(/\/api\/?$/, ""); 
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${base}${cleanUrl}`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3EEE3", fontFamily: "Arial, sans-serif", color: "#161412", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Top Navigation Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "2px solid #161412", paddingBottom: "15px" }}>
          <h2 style={{ fontFamily: "Georgia, serif", margin: 0, fontSize: "28px", fontWeight: "bold", letterSpacing: "0.5px", color: "#161412" }}>
            {selectedBook ? "Library // Book Details" : "Library & Reading"}
          </h2>
          <button onClick={onBack} style={{ padding: "8px 16px", backgroundColor: "transparent", color: "#161412", border: "1px solid #161412", fontSize: "12px", fontWeight: "bold", cursor: "pointer", borderRadius: "2px", transition: "all 0.2s" }}
            onMouseOver={(e) => { e.target.style.backgroundColor = "#161412"; e.target.style.color = "#F3EEE3"; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#161412"; }}
          >
            ← BACK TO NEWS
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: "center", color: "#5E574C", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "18px" }}>Loading library...</p>
        ) : selectedBook ? (
          
          /* =========================================
             TWO-COLUMN DETAIL VIEW (Editorial Theme)
             ========================================= */
          <div style={{ backgroundColor: "#FDFBF7", padding: "40px", border: "1px solid #161412", borderTop: "4px solid #161412" }}>
            <button 
              onClick={() => setSelectedBook(null)} 
              style={{ background: "none", border: "none", color: "#5E574C", cursor: "pointer", fontSize: "12px", padding: 0, marginBottom: "30px", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}
            >
              &larr; Return to Library Grid
            </button>

            {/* Flex Container for Left Image / Right Text */}
            <div style={{ display: "flex", gap: "50px", alignItems: "flex-start", flexWrap: "wrap" }}>
              
              {/* Left Column: Image */}
              <div style={{ flex: "0 0 350px", maxWidth: "100%" }}>
                {selectedBook.image_url ? (
                  <img 
                    src={getImageUrl(selectedBook.image_url)} 
                    alt={selectedBook.title} 
                    style={{ width: "100%", height: "auto", display: "block", border: "1px solid #C9C1B0", padding: "5px", backgroundColor: "#fff" }} 
                  />
                ) : (
                  <div style={{ width: "100%", height: "450px", backgroundColor: "#EBE4D5", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #C9C1B0" }}>
                    <span style={{ color: "#5E574C", fontSize: "50px" }}>📚</span>
                  </div>
                )}
                <p style={{ fontSize: "11px", color: "#5E574C", fontStyle: "italic", marginTop: "10px", marginBottom: "0", textAlign: "center" }}>
                  Cover imagery & preview.
                </p>
              </div>

              {/* Right Column: Information */}
              <div style={{ flex: "1", minWidth: "300px" }}>
                <p style={{ fontSize: "12px", color: "#5E574C", marginTop: "0", marginBottom: "8px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Posted: {selectedBook.created_at || "Recently"}
                </p>

                {/* Main Serif Headline */}
                <h1 style={{ fontSize: "32px", color: "#161412", margin: "0 0 25px 0", fontFamily: "Georgia, serif", fontWeight: "bold", lineHeight: "1.2" }}>
                  {selectedBook.title}
                </h1>

                {/* Editorial Body Text */}
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedBook.description }} 
                  style={{ fontSize: "16px", color: "#333", lineHeight: "1.8", marginBottom: "40px", fontFamily: "Georgia, serif" }} 
                />

                <div style={{ borderTop: "1px solid #EBE4D5", paddingTop: "25px" }}>
                  <a 
                    href={selectedBook.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ display: "inline-block", padding: "12px 35px", backgroundColor: "#161412", color: "#FDFBF7", textDecoration: "none", fontWeight: "bold", fontSize: "13px", letterSpacing: "1px", transition: "background 0.2s" }}
                    onMouseOver={(e) => e.target.style.backgroundColor = "#333"}
                    onMouseOut={(e) => e.target.style.backgroundColor = "#161412"}
                  >
                    PURCHASE BOOK
                  </a>
                </div>
              </div>

            </div>
          </div>

        ) : books.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px", border: "1px solid #161412", backgroundColor: "#FDFBF7" }}>
            <p style={{ color: "#5E574C", fontFamily: "Georgia, serif", fontSize: "18px", fontStyle: "italic" }}>No books available in the library right now.</p>
          </div>
        ) : (

          /* =========================================
             REFINED GRID VIEW (Editorial Cards)
             ========================================= */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "40px" }}>
            {books.map(book => (
              <div key={book.id} style={{ 
                display: "flex", 
                flexDirection: "column", 
                backgroundColor: "#FDFBF7", 
                border: "1px solid #161412", 
                padding: "20px",
                position: "relative"
              }}>
                
                {/* Image Container with editorial matte border */}
                <div style={{ border: "1px solid #EBE4D5", padding: "5px", backgroundColor: "#fff", marginBottom: "20px" }}>
                  {book.image_url ? (
                    <img 
                      src={getImageUrl(book.image_url)} 
                      alt={book.title} 
                      style={{ width: "100%", height: "300px", objectFit: "contain", display: "block" }} 
                    />
                  ) : (
                    <div style={{ width: "100%", height: "300px", backgroundColor: "#EBE4D5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#5E574C", fontSize: "40px" }}>📚</span>
                    </div>
                  )}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
                  
                  {/* Card Title - Serif */}
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", margin: "0 0 12px 0", color: "#161412", lineHeight: "1.3" }}>
                    {book.title}
                  </h3>
                  
                  {/* Grid Summary - Faded bottom */}
                  <div style={{ flex: "1", overflow: "hidden", maxHeight: "100px", marginBottom: "25px", position: "relative" }}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: book.description }} 
                      style={{ fontSize: "14px", color: "#444", lineHeight: "1.6", fontFamily: "Georgia, serif" }} 
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40px", backgroundImage: "linear-gradient(to bottom, rgba(253,251,247,0), rgba(253,251,247,1))" }} />
                  </div>
                  
                  {/* Ghost Button */}
                  <div style={{ marginTop: "auto", borderTop: "1px solid #EBE4D5", paddingTop: "15px" }}>
                    <button 
                      onClick={() => setSelectedBook(book)}
                      style={{ 
                        display: "block", 
                        width: "100%",
                        padding: "10px 0", 
                        backgroundColor: "transparent", 
                        color: "#161412", 
                        border: "1px solid #161412", 
                        cursor: "pointer",
                        fontWeight: "bold", 
                        fontSize: "12px", 
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        transition: "all 0.2s" 
                      }}
                      onMouseOver={(e) => { e.target.style.backgroundColor = "#161412"; e.target.style.color = "#FDFBF7"; }}
                      onMouseOut={(e) => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "#161412"; }}
                    >
                      Read Details
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}