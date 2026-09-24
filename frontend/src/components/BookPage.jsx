import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function BookPage({ onBack }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);

  // 1. Fetch data and check URL for existing book ID (handles Refresh)
  useEffect(() => {
    fetch(`${API_BASE_URL}/books/`)
      .then(res => res.json())
      .then(data => {
        const fetchedBooks = data.books || [];
        setBooks(fetchedBooks);
        setLoading(false);

        // Check if there is an ID in the URL on load
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get("id");
        if (urlId) {
          const bookFromUrl = fetchedBooks.find(b => b.id.toString() === urlId);
          if (bookFromUrl) setSelectedBook(bookFromUrl);
        }
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // 2. Listen to Browser Back/Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("id");
      if (urlId && books.length > 0) {
        const bookFromUrl = books.find(b => b.id.toString() === urlId);
        setSelectedBook(bookFromUrl || null);
      } else {
        setSelectedBook(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [books]);

  // 3. Custom Handlers to update URL when clicking
  const handleBookClick = (book) => {
    setSelectedBook(book);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.pushState({}, "", `?id=${book.id}`);
  };

  const handleCloseDetail = () => {
    setSelectedBook(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.pushState({}, "", window.location.pathname);
  };

  // HELPER: Resolves the image URL safely
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:image")) return url;
    
    const base = API_BASE_URL.replace(/\/api\/?$/, ""); 
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${base}${cleanUrl}`;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F3EEE3", fontFamily: "Arial, sans-serif", color: "#161412", padding: "40px 20px" }} className="book-page-container">
      
      {/* Responsive Styles Injection */}
      <style>{`
        .book-page-container {
          padding: 40px 20px;
        }

        /* Books Library Grid View */
        .books-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 35px;
        }

        .book-card {
          display: flex;
          flex-direction: row;
          background-color: #FDFBF7;
          border: 1px solid #161412;
          padding: 25px;
          gap: 25px;
          min-height: 280px;
          position: relative;
        }

        .book-card-img-wrapper {
          flex: 0 0 150px;
          border: 1px solid #EBE4D5;
          padding: 5px;
          background-color: #fff;
          height: fit-content;
        }

        .book-card-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        /* Detail View */
        .detail-wrapper {
          background-color: #FDFBF7;
          padding: 40px;
          border: 1px solid #161412;
          border-top: 4px solid #161412;
        }

        .detail-container {
          display: flex;
          gap: 50px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .detail-image-col {
          flex: 0 0 350px;
          max-width: 100%;
        }

        .detail-info-col {
          flex: 1;
          min-width: 300px;
        }

        .detail-title {
          font-size: 32px;
          color: #161412;
          margin: 0 0 25px 0;
          font-family: Georgia, serif;
          font-weight: bold;
          line-height: 1.2;
        }

        /* Breakpoint: Tablets (<= 950px) */
        @media (max-width: 950px) {
          .books-grid {
            grid-template-columns: 1fr; /* Switch grid to 1 column */
          }
          .detail-container {
            gap: 30px;
          }
        }

        /* Breakpoint: Mobile (<= 768px) */
        @media (max-width: 768px) {
          .book-page-container {
            padding: 20px 15px;
          }
          .detail-wrapper {
            padding: 25px;
          }
          .detail-container {
            flex-direction: column;
            align-items: center;
          }
          .detail-image-col {
            flex: 1 1 100%;
            max-width: 300px;
            margin: 0 auto;
          }
          .detail-info-col {
            min-width: 100%;
          }
          .detail-title {
            font-size: 26px;
            text-align: center;
          }
          .detail-posted {
            text-align: center;
          }
          .purchase-btn-container {
            display: flex;
            justify-content: center;
          }
        }

        /* Breakpoint: Small Mobile (<= 550px) */
        @media (max-width: 550px) {
          .book-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 20px;
            gap: 15px;
          }
          .book-card-img-wrapper {
            flex: none;
            width: 100%;
            max-width: 160px;
          }
          .book-card-info h3 {
            font-size: 20px !important;
          }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {loading ? (
          <p style={{ textAlign: "center", color: "#5E574C", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "18px" }}>Loading library...</p>
        ) : selectedBook ? (
          
          /* =========================================
             TWO-COLUMN DETAIL VIEW (Editorial Theme)
             ========================================= */
          <div className="detail-wrapper">
            <button 
              onClick={handleCloseDetail} 
              style={{ background: "none", border: "none", color: "#5E574C", cursor: "pointer", fontSize: "12px", padding: 0, marginBottom: "30px", fontWeight: "bold", letterSpacing: "1px", textTransform: "uppercase" }}
            >
              &larr; Return to Library Grid
            </button>

            {/* Flex Container for Left Image / Right Text */}
            <div className="detail-container">
              
              {/* Left Column: Image */}
              <div className="detail-image-col">
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
              <div className="detail-info-col">
                <p className="detail-posted" style={{ fontSize: "12px", color: "#5E574C", marginTop: "0", marginBottom: "8px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Posted: {selectedBook.created_at || "Recently"}
                </p>

                {/* Main Serif Headline */}
                <h1 className="detail-title">
                  {selectedBook.title}
                </h1>

                {/* Editorial Body Text */}
                <div 
                  dangerouslySetInnerHTML={{ __html: selectedBook.description }} 
                  style={{ fontSize: "16px", color: "#333", lineHeight: "1.8", marginBottom: "40px", fontFamily: "Georgia, serif" }} 
                />

                <div className="purchase-btn-container" style={{ borderTop: "1px solid #EBE4D5", paddingTop: "25px" }}>
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
             REFINED GRID VIEW (Wide Cards with Increased Height)
             ========================================= */
          <div className="books-grid">
            {books.map(book => (
              <div key={book.id} className="book-card">
                
                {/* Left Side: Thumbnail Image */}
                <div className="book-card-img-wrapper">
                  {book.image_url ? (
                    <img 
                      src={getImageUrl(book.image_url)} 
                      alt={book.title} 
                      style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} 
                    />
                  ) : (
                    <div style={{ width: "100%", height: "200px", backgroundColor: "#EBE4D5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#5E574C", fontSize: "30px" }}>📚</span>
                    </div>
                  )}
                </div>
                
                {/* Right Side: Title, Description, and Action Button */}
                <div className="book-card-info">
                  
                  {/* Card Title - Serif */}
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: "19px", margin: "0 0 10px 0", color: "#161412", lineHeight: "1.3" }}>
                    {book.title}
                  </h3>
                  
                  {/* Grid Summary with fade effect */}
                  <div style={{ flex: "1", overflow: "hidden", maxHeight: "115px", marginBottom: "20px", position: "relative" }}>
                    <div 
                      dangerouslySetInnerHTML={{ __html: book.description }} 
                      style={{ fontSize: "13.5px", color: "#444", lineHeight: "1.6", fontFamily: "Georgia, serif" }} 
                    />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "35px", backgroundImage: "linear-gradient(to bottom, rgba(253,251,247,0), rgba(253,251,247,1))" }} />
                  </div>
                  
                  {/* Read Details Button */}
                  <div style={{ marginTop: "auto", borderTop: "1px solid #EBE4D5", paddingTop: "15px" }}>
                    <button 
                      onClick={() => handleBookClick(book)}
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