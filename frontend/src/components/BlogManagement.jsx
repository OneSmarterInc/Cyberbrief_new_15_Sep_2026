import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function BlogManagement({ authToken }) {
  const [blogs, setBlogs] = useState([]);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogDesc, setBlogDesc] = useState("");
  const [blogImage, setBlogImage] = useState(null);
  const [publishOption, setPublishOption] = useState("now");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);

  // Custom Website Modal State
  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "alert", onConfirm: null });

  // Track active formatting states for toolbar highlights
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false, strikeThrough: false,
    justifyLeft: false, justifyCenter: false, justifyRight: false, justifyFull: false,
  });

  const inputStyle = { width: "100%", padding: "10px", border: "1px solid #C9C1B0", outline: "none", fontSize: "14px", boxSizing: "border-box", backgroundColor: "#fff" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px", color: "#161412", letterSpacing: "0.5px" };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/blogs/`, {
        headers: { "Authorization": `Token ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) setBlogs(data.blogs || []);
    } catch (err) {
      console.error("Failed to load blogs", err);
    }
  };

  useEffect(() => {
    const editor = document.getElementById("rich-blog-editor");
    if (editor && editor.innerHTML !== blogDesc) {
      editor.innerHTML = blogDesc;
    }
  }, [editingBlogId]);

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
    const editor = document.getElementById("rich-blog-editor");
    if (editor) {
      setBlogDesc(editor.innerHTML);
      editor.focus();
    }
    checkActiveFormats();
  };

  const handleEditorInput = (e) => {
    setBlogDesc(e.currentTarget.innerHTML);
    checkActiveFormats();
  };

  const handleStartEdit = (blog) => {
    setEditingBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogDesc(blog.description || "");
    setPublishOption(blog.publish_option || "now");
    setScheduledDateTime(blog.scheduled_for ? blog.scheduled_for.replace(" ", "T") : "");
    setBlogImage(null);
    const editor = document.getElementById("rich-blog-editor");
    if (editor) editor.innerHTML = blog.description || "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingBlogId(null);
    setBlogTitle("");
    setBlogDesc("");
    setPublishOption("now");
    setScheduledDateTime("");
    setBlogImage(null);
    const editor = document.getElementById("rich-blog-editor");
    if (editor) editor.innerHTML = "";
  };

  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (publishOption === "schedule" && !scheduledDateTime) {
      setModal({ show: true, title: "Missing Information", message: "Please select a valid date and time for scheduling.", type: "alert" });
      return;
    }

    setBlogSubmitting(true);
    const formData = new FormData();
    formData.append("title", blogTitle);
    formData.append("description", blogDesc);
    formData.append("publish_option", publishOption);
    if (publishOption === "schedule" && scheduledDateTime) {
      formData.append("scheduled_for", scheduledDateTime.replace("T", " "));
    }
    if (blogImage) formData.append("image", blogImage);

    const url = editingBlogId 
      ? `${API_BASE_URL}/admin/blogs/${editingBlogId}/` 
      : `${API_BASE_URL}/admin/blogs/`;
    
    const method = editingBlogId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Authorization": `Token ${authToken}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setModal({
          show: true,
          title: "Success",
          message: editingBlogId ? "Blog post updated successfully!" : "Blog post published successfully!",
          type: "alert"
        });
        if (editingBlogId) {
          setBlogs(blogs.map(b => b.id === editingBlogId ? data.blog : b));
        } else {
          setBlogs([data.blog, ...blogs]);
        }
        handleCancelEdit();
      } else {
        setModal({ show: true, title: "Error", message: data.error || "Failed to save blog.", type: "alert" });
      }
    } catch (err) {
      console.error(err);
      setModal({ show: true, title: "Network Error", message: "Failed to connect to the server.", type: "alert" });
    } finally {
      setBlogSubmitting(false);
    }
  };

  const confirmDeleteBlog = (id) => {
    setModal({
      show: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to permanently delete this blog post? This action cannot be undone.",
      type: "confirm",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/admin/blogs/${id}/`, {
            method: "DELETE",
            headers: { "Authorization": `Token ${authToken}` }
          });
          if (res.ok) {
            setBlogs(blogs.filter(b => b.id !== id));
            if (editingBlogId === id) handleCancelEdit();
            setModal({ show: false });
          } else {
            setModal({ show: true, title: "Error", message: "Failed to delete blog.", type: "alert" });
          }
        } catch (err) {
          console.error(err);
          setModal({ show: true, title: "Error", message: "Network error deleting blog.", type: "alert" });
        }
      }
    });
  };

  const now = new Date();
  const scheduledBlogs = blogs.filter(b => b.publish_option === "schedule" && new Date(b.scheduled_for) > now);
  const liveBlogs = blogs.filter(b => !(b.publish_option === "schedule" && new Date(b.scheduled_for) > now));

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

  return (
    <div style={{ paddingBottom: "60px", position: "relative" }}>
      
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
                  <button onClick={modal.onConfirm} style={{ padding: "8px 16px", backgroundColor: "#D32F2F", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>Delete</button>
                </>
              ) : (
                <button onClick={() => setModal({ show: false })} style={{ padding: "8px 20px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>OK</button>
              )}
            </div>
          </div>
        </div>
      )}

      <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px", color: "#161412" }}>Blog Management</h1>
      
      <form onSubmit={handleSaveBlog} style={{ backgroundColor: "#fff", border: "1px solid #161412", borderRadius: "4px", padding: "30px", maxWidth: "850px", marginTop: "25px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid #EBE4D5", paddingBottom: "15px" }}>
          <h2 style={{ fontSize: "18px", color: "#161412", margin: 0, fontFamily: "Georgia, serif" }}>
            {editingBlogId ? `Edit Blog Post #${editingBlogId}` : "Add New Blog Post"}
          </h2>
          {editingBlogId && (
            <button type="button" onClick={handleCancelEdit} style={{ padding: "6px 14px", backgroundColor: "#EBE4D5", color: "#161412", border: "1px solid #161412", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>Cancel Edit</button>
          )}
        </div>
        
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>BLOG TITLE</label>
          <input type="text" required value={blogTitle} onChange={e => setBlogTitle(e.target.value)} style={inputStyle} placeholder="Enter blog title..." />
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={labelStyle}>DESCRIPTION / CONTENT</label>
          <div style={{ border: "1px solid #C9C1B0", borderRadius: "4px", backgroundColor: "#fff" }}>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", padding: "8px 12px", borderBottom: "1px solid #C9C1B0", backgroundColor: "#F8F9FA", alignItems: "center" }}>
              <button type="button" onClick={() => formatText('undo')} title="Undo" style={getToolBtnStyle(false)}>↩</button>
              <button type="button" onClick={() => formatText('redo')} title="Redo" style={getToolBtnStyle(false)}>↪</button>
              <div style={{ borderRight: "1px solid #ddd", height: "18px", margin: "0 4px" }}></div>
              <select onChange={(e) => formatText('formatBlock', e.target.value)} defaultValue="p" style={{ padding: "5px 8px", fontSize: "12px", border: "1px solid #ccc", borderRadius: "4px", outline: "none", cursor: "pointer", backgroundColor: "#fff" }}>
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
              </select>
              <div style={{ borderRight: "1px solid #ddd", height: "18px", margin: "0 4px" }}></div>
              
              <button type="button" onClick={() => formatText('bold')} title="Bold" style={{ ...getToolBtnStyle(activeFormats.bold), fontWeight: "bold" }}>B</button>
              <button type="button" onClick={() => formatText('italic')} title="Italic" style={{ ...getToolBtnStyle(activeFormats.italic), fontStyle: "italic" }}>I</button>
              <button type="button" onClick={() => formatText('underline')} title="Underline" style={{ ...getToolBtnStyle(activeFormats.underline), textDecoration: "underline" }}>U</button>
              <button type="button" onClick={() => formatText('strikeThrough')} title="Strikethrough" style={{ ...getToolBtnStyle(activeFormats.strikeThrough), textDecoration: "line-through" }}>S</button>
              
              <div style={{ borderRight: "1px solid #ddd", height: "18px", margin: "0 4px" }}></div>
              
              <button type="button" onClick={() => formatText('justifyLeft')} title="Align Left" style={getToolBtnStyle(activeFormats.justifyLeft)}>Left</button>
              <button type="button" onClick={() => formatText('justifyCenter')} title="Align Center" style={getToolBtnStyle(activeFormats.justifyCenter)}>Center</button>
              <button type="button" onClick={() => formatText('justifyRight')} title="Align Right" style={getToolBtnStyle(activeFormats.justifyRight)}>Right</button>
              <button type="button" onClick={() => formatText('justifyFull')} title="Justify" style={getToolBtnStyle(activeFormats.justifyFull)}>Justify</button>
            </div>
            
            <div 
              id="rich-blog-editor"
              contentEditable="true"
              onInput={handleEditorInput}
              onKeyUp={checkActiveFormats}
              onMouseUp={checkActiveFormats}
              style={{ width: "100%", minHeight: "200px", padding: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", overflowY: "auto", fontSize: "14px", lineHeight: "1.5" }}
              suppressContentEditableWarning={true}
            />

            <div style={{ padding: "8px 14px", fontSize: "11px", color: "#777", borderTop: "1px solid #eee", textAlign: "right", backgroundColor: "#fafafa" }}>
              {blogDesc.replace(/<[^>]*>/g, '').trim() ? blogDesc.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0} words
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "25px" }}>
          <label style={labelStyle}>FEATURED PHOTO {editingBlogId && "(Leave blank to keep existing image)"}</label>
          <input type="file" accept="image/*" onChange={e => setBlogImage(e.target.files[0])} style={{ ...inputStyle, padding: "8px" }} />
        </div>

        <div style={{ marginBottom: "30px", borderTop: "1px solid #EBE4D5", paddingTop: "20px" }}>
          <label style={labelStyle}>PUBLISH SETTINGS</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px", fontSize: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: publishOption === "now" ? "bold" : "normal" }}>
              <input type="radio" name="publish" checked={publishOption === "now"} onChange={() => setPublishOption("now")} /> Post immediately
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontWeight: publishOption === "schedule" ? "bold" : "normal" }}>
              <input type="radio" name="publish" checked={publishOption === "schedule"} onChange={() => setPublishOption("schedule")} /> Schedule for later publication
            </label>

            {publishOption === "schedule" && (
              <div style={{ marginLeft: "24px", marginTop: "5px", padding: "18px", backgroundColor: "#FDFBF7", border: "1px solid #C9C1B0", borderRadius: "4px", maxWidth: "420px" }}>
                <label style={{ ...labelStyle, marginBottom: "8px", color: "#8F7118" }}>SELECT PUBLISH DATE & TIME</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={scheduledDateTime} 
                  onChange={e => setScheduledDateTime(e.target.value)} 
                  style={inputStyle} 
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid #EBE4D5", paddingTop: "20px" }}>
          <button type="submit" disabled={blogSubmitting} style={{ padding: "12px 35px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", borderRadius: "4px", fontWeight: "bold", cursor: "pointer", fontSize: "14px", letterSpacing: "0.5px" }}>
            {blogSubmitting ? "SAVING..." : editingBlogId ? "UPDATE BLOG POST" : "PUBLISH BLOG POST"}
          </button>
        </div>
      </form>

      {/* Pending / Scheduled Blogs Table */}
      <h2 style={{ fontFamily: "Georgia, serif", marginTop: "45px", marginBottom: "15px", fontSize: "20px", color: "#161412" }}>
        Pending / Scheduled Blogs ({scheduledBlogs.length})
      </h2>
      <div style={{ backgroundColor: "#fff", border: "1px solid #161412", maxWidth: "850px", marginBottom: "40px", borderRadius: "4px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#FFF3CD", borderBottom: "1px solid #161412" }}>
              <th style={{ padding: "12px 15px", color: "#856404" }}>ID</th>
              <th style={{ padding: "12px 15px", color: "#856404" }}>Title</th>
              <th style={{ padding: "12px 15px", textAlign: "center", color: "#856404" }}>Scheduled For</th>
              <th style={{ padding: "12px 15px", textAlign: "right", color: "#856404" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduledBlogs.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#666" }}>No pending scheduled blogs.</td></tr>
            ) : scheduledBlogs.map(blog => (
              <tr key={blog.id} style={{ borderBottom: "1px solid #EBE4D5" }}>
                <td style={{ padding: "12px 15px" }}>#{blog.id}</td>
                <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{blog.title}</td>
                <td style={{ padding: "12px 15px", textAlign: "center", color: "#856404", fontWeight: "bold" }}>{blog.scheduled_for}</td>
                <td style={{ padding: "12px 15px", textAlign: "right" }}>
                  <button onClick={() => handleStartEdit(blog)} style={{ padding: "6px 12px", marginRight: "8px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "11px", borderRadius: "3px" }}>EDIT</button>
                  <button onClick={() => confirmDeleteBlog(blog.id)} style={{ padding: "6px 12px", backgroundColor: "#D32F2F", color: "#FFF", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "11px", borderRadius: "3px" }}>DELETE</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Published Blogs Table */}
      <h2 style={{ fontFamily: "Georgia, serif", marginTop: "45px", marginBottom: "15px", fontSize: "20px", color: "#161412" }}>
        Published Blogs ({liveBlogs.length})
      </h2>
      <div style={{ backgroundColor: "#fff", border: "1px solid #161412", maxWidth: "850px", marginBottom: "40px", borderRadius: "4px", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#EBE4D5", borderBottom: "1px solid #161412" }}>
              <th style={{ padding: "12px 15px" }}>ID</th>
              <th style={{ padding: "12px 15px" }}>Title</th>
              <th style={{ padding: "12px 15px", textAlign: "center" }}>Created Date</th>
              <th style={{ padding: "12px 15px", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {liveBlogs.length === 0 ? (
              <tr><td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#666" }}>No published blogs yet.</td></tr>
            ) : liveBlogs.map(blog => (
              <tr key={blog.id} style={{ borderBottom: "1px solid #EBE4D5" }}>
                <td style={{ padding: "12px 15px" }}>#{blog.id}</td>
                <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{blog.title}</td>
                <td style={{ padding: "12px 15px", textAlign: "center", color: "#5E574C" }}>{blog.created_at}</td>
                <td style={{ padding: "12px 15px", textAlign: "right" }}>
                  <button onClick={() => handleStartEdit(blog)} style={{ padding: "6px 12px", marginRight: "8px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "11px", borderRadius: "3px" }}>EDIT</button>
                  <button onClick={() => confirmDeleteBlog(blog.id)} style={{ padding: "6px 12px", backgroundColor: "#D32F2F", color: "#FFF", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: "11px", borderRadius: "3px" }}>DELETE</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}