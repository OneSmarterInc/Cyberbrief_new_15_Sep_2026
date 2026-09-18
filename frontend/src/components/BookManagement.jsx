import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function BookManagement({ authToken }) {
  const [books, setBooks] = useState([]);
  const [bookTitle, setBookTitle] = useState("");
  const [bookDesc, setBookDesc] = useState("");
  const [bookImage, setBookImage] = useState(null);
  const [purchaseUrl, setPurchaseUrl] = useState(""); 
  const [bookSubmitting, setBookSubmitting] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);

  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "alert", onConfirm: null });

  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false, strikeThrough: false,
    justifyLeft: false, justifyCenter: false, justifyRight: false, justifyFull: false,
  });

  const inputStyle = { width: "100%", padding: "10px", border: "1px solid #C9C1B0", outline: "none", fontSize: "14px", boxSizing: "border-box", backgroundColor: "#fff" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px", color: "#161412", letterSpacing: "0.5px" };

  useEffect(() => {
    fetchBooks();
  }, []);

 const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/administration/books/`, {
        headers: { "Authorization": `Token ${authToken}` },
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) setBooks(data.books || []);
    } catch (err) {
      console.error("Failed to load books", err);
    }
  };

  useEffect(() => {
    const editor = document.getElementById("rich-book-editor");
    if (editor && editor.innerHTML !== bookDesc) {
      editor.innerHTML = bookDesc;
    }
  }, [editingBookId]);

  const checkActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        justifyFull: document.queryCommandState('justifyFull'),
      });
    } catch (e) {}
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    const editor = document.getElementById("rich-book-editor");
    if (editor) {
      setBookDesc(editor.innerHTML);
      editor.focus();
    }
    checkActiveFormats();
  };

  const handleEditorInput = (e) => {
    setBookDesc(e.currentTarget.innerHTML);
    checkActiveFormats();
  };

  const handleStartEdit = (book) => {
    setEditingBookId(book.id);
    setBookTitle(book.title);
    setBookDesc(book.description || "");
    setPurchaseUrl(book.url || "");
    setBookImage(null);
    const editor = document.getElementById("rich-book-editor");
    if (editor) editor.innerHTML = book.description || "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingBookId(null);
    setBookTitle("");
    setBookDesc("");
    setPurchaseUrl("");
    setBookImage(null);
    const editor = document.getElementById("rich-book-editor");
    if (editor) editor.innerHTML = "";
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    setBookSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", bookTitle);
    formData.append("description", bookDesc);
    formData.append("url", purchaseUrl);
    if (bookImage) formData.append("image", bookImage);

    const url = editingBookId 
      ? `${API_BASE_URL}/administration/books/${editingBookId}/` 
      : `${API_BASE_URL}/administration/books/`;
    
    const method = editingBookId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Authorization": `Token ${authToken}` },
        credentials: "include", // <-- FIXED: Added missing credentials
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setModal({ show: true, title: "Success", message: editingBookId ? "Book updated successfully!" : "Book added successfully!", type: "alert" });
        if (editingBookId) {
          setBooks(books.map(b => b.id === editingBookId ? data.book : b));
        } else {
          setBooks([data.book, ...books]);
        }
        handleCancelEdit();
      } else {
        setModal({ show: true, title: "Error", message: data.error || "Failed to save book.", type: "alert" });
      }
    } catch (err) {
      setModal({ show: true, title: "Network Error", message: "Failed to connect to the server.", type: "alert" });
    } finally {
      setBookSubmitting(false);
    }
  };

  const confirmDeleteBook = (id) => {
    setModal({
      show: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to permanently delete this book?",
      type: "confirm",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/administration/books/${id}/`, {
            method: "DELETE",
            headers: { "Authorization": `Token ${authToken}` },
            credentials: "include" // <-- FIXED: Added missing credentials
          });
          if (res.ok) {
            setBooks(books.filter(b => b.id !== id));
            if (editingBookId === id) handleCancelEdit();
            setModal({ show: false });
          } else {
            setModal({ show: true, title: "Error", message: "Failed to delete book.", type: "alert" });
          }
        } catch (err) {
          setModal({ show: true, title: "Error", message: "Network error deleting book.", type: "alert" });
        }
      }
    });
  };

  const getToolBtnStyle = (isActive) => ({
    background: isActive ? "#161412" : "transparent",
    color: isActive ? "#F3EEE3" : "#333",
    border: "1px solid",
    borderColor: isActive ? "#161412" : "transparent",
    borderRadius: "4px",
    padding: "5px 10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "bold",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s ease"
  });

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http") || url.startsWith("data:image")) return url;
    
    const base = API_BASE_URL.replace(/\/api\/?$/, ""); 
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${base}${cleanUrl}`;
  };

  const renderImageCell = (book) => {
    const imgPath = book.image || book.image_url;
    
    if (!imgPath) {
      return <span style={{ fontSize: "11px", color: "#999" }}>No image</span>;
    }

    return (
      <div style={{ position: "relative", width: "40px", height: "40px" }}>
        <div style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5", borderRadius: "4px", border: "1px solid #ddd", zIndex: 1, fontSize: "9px", color: "#999", textAlign: "center", lineHeight: "1.1" }}>
          Error
        </div>
        <img
          src={getImageUrl(imgPath)}
          alt="Thumb"
          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px", border: "1px solid #ccc", position: "absolute", top: 0, left: 0, zIndex: 2, backgroundColor: "#fff" }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: "60px", position: "relative" }}>
      {modal.show && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#F3EEE3", border: "2px solid #161412", padding: "30px", maxWidth: "400px", width: "100%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", borderRadius: "4px" }}>
            <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 10px 0", color: "#161412", fontSize: "18px" }}>{modal.title}</h3>
            <p style={{ fontSize: "14px", color: "#5E574C", lineHeight: "1.5", marginBottom: "25px" }}>{modal.message}</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              {modal.type === "confirm" ? (
                <>
                  <button onClick={() => setModal({ show: false })} style={{ padding: "8px 16px", backgroundColor: "#fff", border: "1px solid #161412", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Cancel</button>
                  <button onClick={modal.onConfirm} style={{ padding: "8px 16px", backgroundColor: "#D32F2F", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                </>
              ) : (
                <button onClick={() => setModal({ show: false })} style={{ padding: "8px 20px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}

      <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px", color: "#161412" }}>Book Management</h1>
      
      <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", marginTop: "25px", flexWrap: "wrap" }}>
        
        <div style={{ flex: "1 1 400px", maxWidth: "600px" }}>
          <form onSubmit={handleSaveBook} style={{ backgroundColor: "#fff", border: "1px solid #161412", borderRadius: "4px", padding: "30px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid #EBE4D5", paddingBottom: "15px" }}>
              <h2 style={{ fontSize: "18px", color: "#161412", margin: 0, fontFamily: "Georgia, serif" }}>
                {editingBookId ? `Edit Book #${editingBookId}` : "Add New Book"}
              </h2>
              {editingBookId && (
                <button type="button" onClick={handleCancelEdit} style={{ padding: "6px 14px", backgroundColor: "#EBE4D5", color: "#161412", border: "1px solid #161412", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>Cancel Edit</button>
              )}
            </div>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>BOOK TITLE</label>
              <input type="text" required value={bookTitle} onChange={e => setBookTitle(e.target.value)} style={inputStyle} placeholder="Enter book title..." />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>PURCHASE URL</label>
              <input type="url" required value={purchaseUrl} onChange={e => setPurchaseUrl(e.target.value)} style={inputStyle} placeholder="https://amazon.com/..." />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={labelStyle}>DESCRIPTION / SUMMARY</label>
              <div style={{ border: "1px solid #C9C1B0", borderRadius: "4px", backgroundColor: "#fff" }}>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "8px 12px", borderBottom: "1px solid #C9C1B0", backgroundColor: "#F8F9FA", alignItems: "center" }}>
                  <button type="button" onClick={() => formatText('undo')} title="Undo" style={getToolBtnStyle(false)}>↩</button>
                  <button type="button" onClick={() => formatText('redo')} title="Redo" style={getToolBtnStyle(false)}>↪</button>
                  <div style={{ borderRight: "1px solid #ddd", height: "18px", margin: "0 4px" }}></div>
                  
                  <button type="button" onClick={() => formatText('bold')} title="Bold" style={{ ...getToolBtnStyle(activeFormats.bold), fontWeight: "bold" }}>B</button>
                  <button type="button" onClick={() => formatText('italic')} title="Italic" style={{ ...getToolBtnStyle(activeFormats.italic), fontStyle: "italic" }}>I</button>
                  <button type="button" onClick={() => formatText('underline')} title="Underline" style={{ ...getToolBtnStyle(activeFormats.underline), textDecoration: "underline" }}>U</button>
                </div>
                
                <div 
                  id="rich-book-editor"
                  contentEditable="true"
                  onInput={handleEditorInput}
                  onKeyUp={checkActiveFormats}
                  onMouseUp={checkActiveFormats}
                  style={{ width: "100%", minHeight: "150px", padding: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", overflowY: "auto", fontSize: "14px", lineHeight: "1.5" }}
                  suppressContentEditableWarning={true}
                />
              </div>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label style={labelStyle}>BOOK COVER PHOTO {editingBookId && "(Leave blank to keep existing image)"}</label>
              <input type="file" accept="image/*" onChange={e => setBookImage(e.target.files[0])} style={{ ...inputStyle, padding: "8px" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #EBE4D5", paddingTop: "20px" }}>
              <button type="submit" disabled={bookSubmitting} style={{ padding: "12px 35px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "14px", letterSpacing: "0.5px" }}>
                {bookSubmitting ? "SAVING..." : editingBookId ? "UPDATE BOOK" : "ADD BOOK"}
              </button>
            </div>
          </form>
        </div>

        <div style={{ flex: "1 1 500px", minWidth: "0" }}>
          <h2 style={{ fontFamily: "Georgia, serif", margin: "0 0 15px 0", fontSize: "20px", color: "#161412" }}>
            Listed Books ({books.length})
          </h2>
          <div style={{ backgroundColor: "#fff", border: "1px solid #161412", borderRadius: "4px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ backgroundColor: "#EBE4D5", borderBottom: "1px solid #161412" }}>
                  <th style={{ padding: "12px 15px" }}>ID</th>
                  <th style={{ padding: "12px 15px" }}>Image</th>
                  <th style={{ padding: "12px 15px", width: "40%" }}>Title</th>
                  <th style={{ padding: "12px 15px" }}>Purchase Link</th>
                  <th style={{ padding: "12px 15px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#666" }}>No books added yet.</td></tr>
                ) : books.map(book => (
                  <tr key={book.id} style={{ borderBottom: "1px solid #EBE4D5" }}>
                    <td style={{ padding: "12px 15px" }}>#{book.id}</td>
                    
                    <td style={{ padding: "10px 15px" }}>
                      {renderImageCell(book)}
                    </td>

                    <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{book.title}</td>
                    <td style={{ padding: "12px 15px", color: "#5E574C", wordBreak: "break-all" }}>
                      <a href={book.url} target="_blank" rel="noreferrer" style={{ color: "#8F7118" }}>View Link</a>
                    </td>
                    <td style={{ padding: "12px 15px", textAlign: "right" }}>
                      <button onClick={() => handleStartEdit(book)} style={{ padding: "6px 12px", marginRight: "8px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "11px", borderRadius: "3px" }}>EDIT</button>
                      <button onClick={() => confirmDeleteBook(book.id)} style={{ padding: "6px 12px", backgroundColor: "#D32F2F", color: "#FFF", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "11px", borderRadius: "3px" }}>DELETE</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
