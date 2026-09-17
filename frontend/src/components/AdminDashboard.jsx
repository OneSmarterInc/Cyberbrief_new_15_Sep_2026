import React, { useState, useMemo, useEffect } from "react";
import { API_BASE_URL } from "../config";
import BlogManagement from "./BlogManagement";
import BookManagement from "./BookManagement"; 

export default function AdminDashboard({ user, articles, token, onRefresh, onBack, onLogout }) {
  const [view, setView] = useState(() => sessionStorage.getItem("newsai_admin_view") || "overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); 

  useEffect(() => {
    sessionStorage.setItem("newsai_admin_view", view);
    setMobileMenuOpen(false); 
  }, [view]);

  const [loadingId, setLoadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [queries, setQueries] = useState([]);

  const [subscribers, setSubscribers] = useState([]);
  const [subSearch, setSubSearch] = useState("");
  const [newSubEmail, setNewSubEmail] = useState("");
  const [subLoading, setSubLoading] = useState(false);

  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "alert", onConfirm: null });

  const [feeds, setFeeds] = useState([]);
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedCategory, setNewFeedCategory] = useState("Cybersecurity");

  const [socialForm, setSocialForm] = useState({
    twitter: "", youtube: "", email: "", insta: "", facebook: "", linkedin: ""
  });
  const [socialSaving, setSocialSaving] = useState(false);

  const [smtpForm, setSmtpForm] = useState({ 
    name: "", email: "", reply_to: "", host: "", port: 587, 
    username: "", password: "", security_protocol: "TLS", 
    daily_send_time: "08:00" 
  });
  
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [blastLoading, setBlastLoading] = useState(false);

  const totalArticles = articles.length;
  const authToken = token || localStorage.getItem("newsai_token");

  useEffect(() => {
    const checkAuth = (res) => {
      if (res.status === 401 || res.status === 403) {
        onLogout();
        throw new Error("Unauthorized API Access. Logging out.");
      }
      return res.json();
    };

    if (view === "queries") {
      fetch(`${API_BASE_URL}/administration/queries/`, { headers: { "Authorization": `Token ${authToken}` }, credentials: "include" })
      .then(checkAuth).then(data => setQueries(data.queries || [])).catch(console.error);
    } else if (view === "smtp") {
      fetch(`${API_BASE_URL}/administration/smtp/`, { headers: { "Authorization": `Token ${authToken}` }, credentials: "include" })
      .then(checkAuth).then(data => {
        if (data.host) setSmtpForm({ 
          name: data.name || "", email: data.email || "", reply_to: data.reply_to || "", 
          host: data.host || "", port: data.port || 587, username: data.username || "", 
          security_protocol: data.security_protocol || "TLS", 
          daily_send_time: data.daily_send_time || "08:00",
          password: "" 
        });
      }).catch(console.error);
    } else if (view === "subscribers") {
      fetch(`${API_BASE_URL}/administration/subscribers/`, { headers: { "Authorization": `Token ${authToken}` }, credentials: "include" })
      .then(checkAuth).then(data => setSubscribers(data.subscribers || [])).catch(console.error);
    } else if (view === "feeds") {
      fetch(`${API_BASE_URL}/administration/feeds/`, { headers: { "Authorization": `Token ${authToken}` }, credentials: "include" })
      .then(checkAuth).then(data => setFeeds(data.feeds || [])).catch(console.error);
    } else if (view === "social") {
      fetch(`${API_BASE_URL}/administration/social/`, { headers: { "Authorization": `Token ${authToken}` }, credentials: "include" })
      .then(checkAuth).then(data => {
        if (data) {
          setSocialForm({
            twitter: data.twitter || "", youtube: data.youtube || "",
            email: data.email || "", insta: data.insta || "", facebook: data.facebook || "", linkedin: data.linkedin || ""
          });
        }
      }).catch(() => {});
    }
  }, [view, authToken, onLogout]);

  const saveSocial = async (e) => {
    e.preventDefault();
    setSocialSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/administration/social/`, { 
        method: "POST", 
        headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" }, 
        credentials: "include",
        body: JSON.stringify(socialForm) 
      });
      if (res.ok) {
        setModal({ show: true, title: "Success", message: "Social media links updated successfully!", type: "alert" });
      } else {
        setModal({ show: true, title: "Error", message: "Failed to update social links.", type: "alert" });
      }
    } catch (err) { 
      setModal({ show: true, title: "Network Error", message: "Failed to update social links.", type: "alert" });
    } finally { 
      setSocialSaving(false); 
    }
  };

  const toggleVisibility = async (id) => {
    setLoadingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/news/${id}/toggle/`, { method: "POST", headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" }, credentials: "include" });
      if (response.ok) onRefresh();
    } finally { setLoadingId(null); }
  };

  const resolveQuery = async (queryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/administration/queries/${queryId}/toggle/`, { method: "POST", headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" }, credentials: "include" });
      if (response.ok) setQueries(queries.map(q => q.id === queryId ? { ...q, is_resolved: !q.is_resolved } : q));
    } catch (err) { console.error(err); }
  };

  const disableArticleAndResolve = async (articleId, queryId) => {
    try {
      await fetch(`${API_BASE_URL}/news/${articleId}/toggle/`, { method: "POST", headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" }, credentials: "include" });
      await fetch(`${API_BASE_URL}/administration/queries/${queryId}/toggle/`, { method: "POST", headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" }, credentials: "include" });
      setQueries(queries.map(q => q.id === queryId ? { ...q, is_resolved: true, article_is_active: false } : q));
      onRefresh();
    } catch (err) { console.error(err); }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newSubEmail.trim()) return;
    setSubLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/administration/subscribers/`, {
        method: "POST",
        headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newSubEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribers([data.subscriber, ...subscribers]);
        setNewSubEmail("");
      } else {
        setModal({ show: true, title: "Error", message: data.error, type: "alert" });
      }
    } catch (err) { console.error(err); }
    setSubLoading(false);
  };

  const handleToggleSubscriber = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/administration/subscribers/${id}/toggle/`, {
        method: "POST", headers: { "Authorization": `Token ${authToken}` }, credentials: "include"
      });
      if (res.ok) setSubscribers(subscribers.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s));
    } catch (err) { console.error(err); }
  };

  const handleDeleteSubscriber = async (id) => {
    setModal({
      show: true,
      title: "Confirm Deletion",
      message: "Are you sure you want to permanently delete this subscriber? This action cannot be undone.",
      type: "confirm",
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/administration/subscribers/${id}/delete/`, {
            method: "DELETE", headers: { "Authorization": `Token ${authToken}` }, credentials: "include"
          });
          if (res.ok) {
            setSubscribers(subscribers.filter(s => s.id !== id));
            setModal({ show: false });
          } else {
            const data = await res.json();
            setModal({ show: true, title: "Error", message: data.error || "Failed to delete subscriber.", type: "alert" });
          }
        } catch (err) { console.error(err); }
      }
    });
  };

  const saveSMTP = async (e) => {
    e.preventDefault();
    setSmtpSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/administration/smtp/`, { method: "POST", headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(smtpForm) });
      if (res.ok) {
        setModal({ show: true, title: "Success", message: "Email configuration settings saved successfully!", type: "alert" });
      }
    } catch (err) { console.error(err); } finally { setSmtpSaving(false); }
  };

  const triggerMassBlast = async () => {
    setModal({
      show: true,
      title: "Confirm Daily Blast",
      message: "Are you sure you want to send the daily briefing to ALL active subscribers right now?",
      type: "confirm",
      onConfirm: async () => {
        setBlastLoading(true);
        try {
          const res = await fetch(`${API_BASE_URL}/administration/smtp/blast/`, { method: "POST", headers: { "Authorization": `Token ${authToken}` }, credentials: "include" });
          const data = await res.json();
          if (res.ok) { 
            setModal({ show: true, title: "Blast Sent", message: data.message, type: "alert" });
            setView("subscribers"); 
          } else {
            setModal({ show: true, title: "Error", message: data.error, type: "alert" });
          }
        } catch (err) { 
          setModal({ show: true, title: "Network Error", message: "Failed to send daily blast.", type: "alert" });
        } finally {
          setBlastLoading(false);
        }
      }
    });
  };

  const filteredSubscribers = useMemo(() => subscribers.filter(s => s.email.toLowerCase().includes(subSearch.toLowerCase())), [subscribers, subSearch]);

  const processedArticles = useMemo(() => {
    let result = articles.filter(a => ((a.original_title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (a.source || "").toLowerCase().includes(searchQuery.toLowerCase())));
    result.sort((a, b) => {
      if (sortBy === "newest") return b.id - a.id;
      if (sortBy === "status") return (a.is_active !== false ? 1 : 0) - (b.is_active !== false ? 1 : 0);
      return 0;
    });
    return result;
  }, [articles, searchQuery, sortBy]);

  const timeObj = useMemo(() => {
    const timeStr = smtpForm.daily_send_time || "08:00";
    const [h, m] = timeStr.split(':');
    return { hour: (h || "00").padStart(2, '0'), min: m || "00" };
  }, [smtpForm.daily_send_time]);

  const handleTimeChange = (type, value) => {
    let { hour, min } = timeObj;
    if (type === 'hour') hour = value;
    if (type === 'min') {
      min = value;
      if (parseInt(min) > 59) min = "59";
      if (min.length > 2) min = min.slice(-2);
    }
    setSmtpForm({ ...smtpForm, daily_send_time: `${hour.padStart(2, '0')}:${min}` });
  };

  const handleTimeBlur = () => {
    let { hour, min } = timeObj;
    if (!min || isNaN(parseInt(min))) min = "00";
    setSmtpForm({ ...smtpForm, daily_send_time: `${hour.padStart(2, '0')}:${min.padStart(2, '0')}` });
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const inputStyle = { width: "100%", padding: "10px", border: "1px solid #C9C1B0", outline: "none", fontSize: "14px", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: "12px", fontWeight: "bold", marginBottom: "5px", color: "#161412" };

  return (
    <div className="admin-layout" style={{ display: "flex", minHeight: "100vh", backgroundColor: "#F3EEE3", fontFamily: "Arial, sans-serif", position: "relative" }}>
      
      <style>{`
        .admin-layout { flex-direction: row; }
        .admin-sidebar { width: 260px; height: 100vh; position: sticky; top: 0; display: flex; flex-direction: column; background-color: #161412; color: #F3EEE3; flex-shrink: 0; z-index: 100; transition: transform 0.3s ease; }
        .admin-main { flex: 1; padding: 40px; overflow-y: auto; width: 100%; box-sizing: border-box; }
        .mobile-header { display: none; background-color: #161412; color: #C9A227; padding: 15px 20px; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 110; border-bottom: 1px solid #333; }
        .menu-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 90; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .table-responsive { overflow-x: auto; background-color: #fff; border: 1px solid #161412; border-radius: 4px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; marginTop: 30px; }
        
        @media (max-width: 900px) {
          .admin-layout { flex-direction: column; }
          .mobile-header { display: flex; }
          .admin-sidebar { position: fixed; left: 0; top: 0; transform: translateX(${mobileMenuOpen ? '0' : '-100%'}); }
          .menu-overlay { display: ${mobileMenuOpen ? 'block' : 'none'}; }
          .admin-main { padding: 20px; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="mobile-header">
        <h2 style={{ margin: 0, fontFamily: "Georgia, serif", color: "#F3EEE3", fontSize: "20px" }}>Admin Desk</h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", color: "#C9A227", fontSize: "24px", cursor: "pointer" }}>
          ☰
        </button>
      </div>

      <div className="menu-overlay" onClick={() => setMobileMenuOpen(false)}></div>

      {modal.show && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
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

      <div className="admin-sidebar">
        <div style={{ padding: "30px 20px" }}>
          <div style={{ fontSize: "12px", color: "#C9A227", fontWeight: "bold", letterSpacing: "1px", marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
            ADMIN DESK
            <span className="close-menu-btn" onClick={() => setMobileMenuOpen(false)} style={{ display: window.innerWidth <= 900 ? 'block' : 'none', cursor: 'pointer', fontSize: '16px' }}>✕</span>
          </div>
          <h2 style={{ margin: 0, fontFamily: "Georgia, serif" }}>Cyberbriefs</h2>
        </div>

        <nav style={{ flex: 1, padding: "0 20px", overflowY: "auto" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li onClick={() => setView("overview")} style={{ padding: "12px 0", borderBottom: "1px solid #333", color: view === "overview" ? "#C9A227" : "#F3EEE3", fontWeight: view === "overview" ? "bold" : "normal", cursor: "pointer" }}>Overview</li>
            <li onClick={() => setView("manage")} style={{ padding: "12px 0", borderBottom: "1px solid #333", color: view === "manage" ? "#C9A227" : "#F3EEE3", fontWeight: view === "manage" ? "bold" : "normal", cursor: "pointer" }}>Manage Articles</li>
            <li onClick={() => setView("queries")} style={{ padding: "12px 0", borderBottom: "1px solid #333", color: view === "queries" ? "#C9A227" : "#F3EEE3", fontWeight: view === "queries" ? "bold" : "normal", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
              Reader Queries {queries.filter(q => !q.is_resolved).length > 0 && <span style={{ backgroundColor: "#C9A227", color: "#161412", padding: "2px 6px", borderRadius: "10px", fontSize: "11px" }}>{queries.filter(q => !q.is_resolved).length}</span>}
            </li>
            <li onClick={() => setView("subscribers")} style={{ padding: "12px 0", borderBottom: "1px solid #333", color: view === "subscribers" ? "#C9A227" : "#F3EEE3", fontWeight: view === "subscribers" ? "bold" : "normal", cursor: "pointer" }}>Subscribers</li>
            <li onClick={() => setView("feeds")} style={{ padding: "12px 0", borderBottom: "1px solid #333", color: view === "feeds" ? "#C9A227" : "#F3EEE3", fontWeight: view === "feeds" ? "bold" : "normal", cursor: "pointer" }}>RSS Feeds</li>
            
            <li onClick={() => setView("blogs")} style={{ padding: "12px 0", borderBottom: "1px solid #333", color: view === "blogs" ? "#C9A227" : "#F3EEE3", fontWeight: view === "blogs" ? "bold" : "normal", cursor: "pointer" }}>Manage Blogs</li>
            
            <li onClick={() => setView("books")} style={{ padding: "12px 0", borderBottom: "1px solid #333", color: view === "books" ? "#C9A227" : "#F3EEE3", fontWeight: view === "books" ? "bold" : "normal", cursor: "pointer" }}>Manage Books</li>
            
            <li onClick={() => setView("social")} style={{ padding: "12px 0", borderBottom: "1px solid #333", color: view === "social" ? "#C9A227" : "#F3EEE3", fontWeight: view === "social" ? "bold" : "normal", cursor: "pointer" }}>Social Media</li>
            <li onClick={() => setView("smtp")} style={{ padding: "12px 0", borderBottom: "1px solid #333", color: view === "smtp" ? "#C9A227" : "#F3EEE3", fontWeight: view === "smtp" ? "bold" : "normal", cursor: "pointer" }}>Email Settings</li>
          </ul>
        </nav>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <button onClick={onBack} style={{ width: "100%", padding: "12px", backgroundColor: "#C9A227", color: "#161412", border: "none", fontWeight: "bold", cursor: "pointer" }}>← BACK TO SITE</button>
          <button onClick={onLogout} style={{ width: "100%", padding: "12px", backgroundColor: "transparent", color: "#F3EEE3", border: "2px solid #D32F2F", fontWeight: "bold", cursor: "pointer" }}>LOGOUT</button>
        </div>
      </div>

      <div className="admin-main">
        
        {view === "overview" && (
          <>
            <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px" }}>System Overview</h1>
            <div className="stats-grid">
              <div style={{ backgroundColor: "#fff", border: "1px solid #161412", padding: "20px", textAlign: "center" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#5E574C" }}>TOTAL STORIES</h3>
                <div style={{ fontSize: "36px", fontWeight: "bold", color: "#161412" }}>{totalArticles}</div>
              </div>
              <div style={{ backgroundColor: "#fff", border: "1px solid #161412", padding: "20px", textAlign: "center" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#5E574C" }}>PENDING QUERIES</h3>
                <div style={{ fontSize: "36px", fontWeight: "bold", color: "#8F7118" }}>{queries.filter(q => !q.is_resolved).length}</div>
              </div>
              <div style={{ backgroundColor: "#fff", border: "1px solid #161412", padding: "20px", textAlign: "center" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#5E574C" }}>SUBSCRIBERS</h3>
                <div style={{ fontSize: "36px", fontWeight: "bold", color: "#1F3A2E" }}>{subscribers.length || 0}</div>
              </div>
            </div>
          </>
        )}

        {view === "manage" && (
          <>
            <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px" }}>Manage Articles</h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", alignItems: "center", marginTop: "20px", marginBottom: "20px" }}>
              <input type="text" placeholder="Search by headline or source..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: "10px 15px", flex: "1", minWidth: "200px", maxWidth: "350px", border: "1px solid #C9C1B0", outline: "none" }} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: "10px", border: "1px solid #C9C1B0", outline: "none", cursor: "pointer", width: "150px" }}>
                <option value="newest">Newest First</option>
                <option value="status">Disabled First</option>
              </select>
            </div>
            <div className="table-responsive">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px", minWidth: "600px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#EBE4D5", borderBottom: "1px solid #161412" }}>
                    <th style={{ padding: "12px 15px" }}>ID</th>
                    <th style={{ padding: "12px 15px" }}>Source</th>
                    <th style={{ padding: "12px 15px", width: "45%" }}>Headline</th>
                    <th style={{ padding: "12px 15px" }}>Status</th>
                    <th style={{ padding: "12px 15px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {processedArticles.map((article) => (
                    <tr key={article.id} style={{ borderBottom: "1px solid #EBE4D5", opacity: article.is_active === false ? 0.6 : 1 }}>
                      <td style={{ padding: "12px 15px" }}>#{article.id}</td>
                      <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{article.source}</td>
                      <td style={{ padding: "12px 15px" }}>{article.original_title.substring(0, 70)}...</td>
                      <td style={{ padding: "12px 15px" }}><span style={{ padding: "4px 8px", fontSize: "12px", backgroundColor: article.is_active !== false ? "#1F3A2E" : "#8F7118", color: "#F3EEE3", whiteSpace: "nowrap" }}>{article.is_active !== false ? "LIVE" : "HIDDEN"}</span></td>
                      <td style={{ padding: "12px 15px", textAlign: "right" }}><button onClick={() => toggleVisibility(article.id)} style={{ padding: "6px 12px", cursor: "pointer", whiteSpace: "nowrap" }}>{article.is_active !== false ? "DISABLE" : "ENABLE"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === "queries" && (
          <>
            <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px" }}>Reader Queries</h1>
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
              {queries.length === 0 ? <p>No queries submitted yet.</p> : queries.map(q => (
                  <div key={q.id} style={{ backgroundColor: "#fff", border: "1px solid #161412", padding: "20px", opacity: q.is_resolved ? 0.6 : 1 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", marginBottom: "15px" }}>
                      <span style={{ fontSize: "12px", color: "#5E574C", fontWeight: "bold" }}>STORY #{q.article_id} • {q.created_at} {q.article_is_active === false && <span style={{ color: "#D32F2F", marginLeft: "10px" }}>(STORY DISABLED)</span>}</span>
                      <span style={{ fontSize: "12px", padding: "3px 8px", backgroundColor: q.is_resolved ? "#1F3A2E" : "#D32F2F", color: "#F3EEE3", fontWeight: "bold" }}>{q.is_resolved ? "RESOLVED" : "NEEDS ATTENTION"}</span>
                    </div>
                    <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>{q.article_title}</h3>
                    <div style={{ backgroundColor: "#F3EEE3", padding: "15px", borderLeft: "3px solid #C9A227", fontStyle: "italic", marginBottom: "15px", wordBreak: "break-word" }}>"{q.query_text}"</div>
                    
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      <button onClick={() => resolveQuery(q.id)} style={{ padding: "8px 15px", backgroundColor: q.is_resolved ? "#EBE4D5" : "#161412", color: q.is_resolved ? "#161412" : "#F3EEE3", border: "1px solid #161412", cursor: "pointer", fontWeight: "bold", width: "100%", maxWidth: "200px" }}>{q.is_resolved ? "MARK UNRESOLVED" : "MARK RESOLVED"}</button>
                      {q.article_is_active !== false && !q.is_resolved && (
                        <button onClick={() => disableArticleAndResolve(q.article_id, q.id)} style={{ padding: "8px 15px", backgroundColor: "#D32F2F", color: "#FFF", border: "none", cursor: "pointer", fontWeight: "bold", width: "100%", maxWidth: "250px" }}>DISABLE STORY & RESOLVE</button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}

        {view === "subscribers" && (
          <>
            <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px" }}>Newsletter Subscribers</h1>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", alignItems: "center", marginTop: "20px", marginBottom: "20px" }}>
              <input type="text" placeholder="Search emails..." value={subSearch} onChange={(e) => setSubSearch(e.target.value)} style={{ padding: "10px 15px", flex: "1", minWidth: "200px", maxWidth: "350px", border: "1px solid #C9C1B0", outline: "none" }} />
              
              <form onSubmit={handleAddSubscriber} style={{ display: "flex", gap: "10px", width: "100%", maxWidth: "400px" }}>
                <input type="email" required placeholder="Add new email..." value={newSubEmail} onChange={e => setNewSubEmail(e.target.value)} style={{ padding: "10px", flex: 1, border: "1px solid #C9C1B0", outline: "none" }} />
                <button type="submit" disabled={subLoading} style={{ padding: "10px 15px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", cursor: "pointer", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  {subLoading ? "..." : "ADD"}
                </button>
              </form>
            </div>

            <div className="table-responsive">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px", minWidth: "700px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#EBE4D5", borderBottom: "1px solid #161412" }}>
                    <th style={{ padding: "12px 15px", width: "35%" }}>Email Address</th>
                    <th style={{ padding: "12px 15px", textAlign: "center" }}>Subscribed On</th>
                    <th style={{ padding: "12px 15px", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "12px 15px", textAlign: "center" }}>Emails Sent</th>
                    <th style={{ padding: "12px 15px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: "20px", textAlign: "center" }}>No subscribers found.</td></tr>
                  ) : filteredSubscribers.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: "1px solid #EBE4D5", opacity: sub.is_active ? 1 : 0.6 }}>
                      <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{sub.email}</td>
                      <td style={{ padding: "12px 15px", textAlign: "center", color: "#5E574C" }}>
                        {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                      </td>
                      <td style={{ padding: "12px 15px", textAlign: "center" }}>
                        <span style={{ backgroundColor: sub.is_active ? "#1F3A2E" : "#8F7118", color: "#F3EEE3", padding: "4px 8px", borderRadius: "3px", fontSize: "11px", fontWeight: "bold" }}>
                          {sub.is_active ? "ACTIVE" : "PAUSED"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 15px", textAlign: "center" }}>
                        <span style={{ backgroundColor: "#161412", color: "#F3EEE3", padding: "4px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: "bold" }}>
                          {sub.emails_received || 0}
                        </span>
                      </td>
                      <td style={{ padding: "12px 15px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button onClick={() => handleToggleSubscriber(sub.id)} style={{ padding: "6px 12px", border: sub.is_active ? "1px solid #8F7118" : "1px solid #1F3A2E", backgroundColor: sub.is_active ? "#fff" : "#1F3A2E", color: sub.is_active ? "#8F7118" : "#F3EEE3", cursor: "pointer", fontWeight: "bold", fontSize: "11px", whiteSpace: "nowrap" }}>
                            {sub.is_active ? "PAUSE" : "RESUME"}
                          </button>
                          <button onClick={() => handleDeleteSubscriber(sub.id)} style={{ padding: "6px 12px", border: "1px solid #D32F2F", backgroundColor: "#D32F2F", color: "#F3EEE3", cursor: "pointer", fontWeight: "bold", fontSize: "11px" }}>
                            DELETE
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === "feeds" && (
          <>
            <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px" }}>RSS Feed Sources</h1>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch(`${API_BASE_URL}/administration/feeds/`, {
                method: "POST",
                headers: { "Authorization": `Token ${authToken}`, "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newFeedName, url: newFeedUrl, category: newFeedCategory })
              });
              const data = await res.json();
              if (res.ok) {
                setFeeds([data.feed, ...feeds]);
                setNewFeedName("");
                setNewFeedUrl("");
                if (onRefresh) onRefresh(); 
              } else {
                setModal({ show: true, title: "Error", message: data.error, type: "alert" });
              }
            }} style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "20px 0", backgroundColor: "#fff", padding: "20px", border: "1px solid #161412" }}>
              <input type="text" placeholder="Feed Name (e.g. Wired)" value={newFeedName} onChange={e => setNewFeedName(e.target.value)} required style={{ padding: "10px", flex: "1 1 200px", border: "1px solid #C9C1B0", minWidth: "150px" }} />
              <input type="url" placeholder="RSS URL (https://...)" value={newFeedUrl} onChange={e => setNewFeedUrl(e.target.value)} required style={{ padding: "10px", flex: "2 1 300px", border: "1px solid #C9C1B0", minWidth: "200px" }} />
              <select value={newFeedCategory} onChange={e => setNewFeedCategory(e.target.value)} style={{ padding: "10px", border: "1px solid #C9C1B0", flex: "1 1 150px" }}>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
              <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", flex: "1 1 100%" }}>Add Feed</button>
            </form>

            <div className="table-responsive">
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px", minWidth: "600px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#EBE4D5", borderBottom: "1px solid #161412" }}>
                    <th style={{ padding: "12px 15px" }}>Name</th>
                    <th style={{ padding: "12px 15px" }}>URL</th>
                    <th style={{ padding: "12px 15px" }}>Category</th>
                    <th style={{ padding: "12px 15px", textAlign: "center" }}>Status</th>
                    <th style={{ padding: "12px 15px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feeds.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: "20px", textAlign: "center" }}>No RSS feeds configured.</td></tr>
                  ) : feeds.map(feed => (
                    <tr key={feed.id} style={{ borderBottom: "1px solid #EBE4D5" }}>
                      <td style={{ padding: "12px 15px", fontWeight: "bold" }}>{feed.name}</td>
                      <td style={{ padding: "12px 15px", color: "#5E574C", wordBreak: "break-all" }}>{feed.url}</td>
                      <td style={{ padding: "12px 15px" }}>{feed.category}</td>
                      <td style={{ padding: "12px 15px", textAlign: "center" }}>
                        <span style={{ backgroundColor: feed.is_active ? "#1F3A2E" : "#8F7118", color: "#F3EEE3", padding: "4px 8px", fontSize: "11px", fontWeight: "bold" }}>
                          {feed.is_active ? "ACTIVE" : "PAUSED"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 15px", textAlign: "right" }}>
                        <button onClick={async () => {
                          const res = await fetch(`${API_BASE_URL}/administration/feeds/${feed.id}/`, { method: "POST", headers: { "Authorization": `Token ${authToken}` }, credentials: "include" });
                          if (res.ok) {
                            setFeeds(feeds.map(f => f.id === feed.id ? { ...f, is_active: !f.is_active } : f));
                            if (onRefresh) onRefresh(); 
                          }
                        }} style={{ padding: "6px 10px", marginRight: "8px", cursor: "pointer" }}>{feed.is_active ? "Pause" : "Resume"}</button>
                        <button onClick={async () => {
                          setModal({
                            show: true,
                            title: "Confirm Deletion",
                            message: "Delete this RSS feed source?",
                            type: "confirm",
                            onConfirm: async () => {
                              const res = await fetch(`${API_BASE_URL}/administration/feeds/${feed.id}/`, { method: "DELETE", headers: { "Authorization": `Token ${authToken}` }, credentials: "include" });
                              if (res.ok) {
                                setFeeds(feeds.filter(f => f.id !== feed.id));
                                if (onRefresh) onRefresh(); 
                              }
                              setModal({ show: false });
                            }
                          });
                        }} style={{ padding: "6px 10px", backgroundColor: "#D32F2F", color: "#FFF", border: "none", cursor: "pointer" }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {view === "blogs" && (
          <BlogManagement authToken={authToken} />
        )}

        {view === "books" && (
          <BookManagement authToken={authToken} />
        )}

        {view === "social" && (
          <>
            <h1 style={{ fontFamily: "Georgia, serif", borderBottom: "2px solid #161412", paddingBottom: "10px" }}>Social Media Links</h1>
            <p style={{ color: "#5E574C", marginBottom: "20px", marginTop: "10px" }}>Provide the links below. Only channels with entered URLs will appear in the site footer.</p>
            
            <form onSubmit={saveSocial} style={{ backgroundColor: "#fff", border: "1px solid #161412", padding: "30px", maxWidth: "800px" }}>
              <div className="form-grid">
                <div>
                  <label style={labelStyle}>TWITTER / X URL</label>
                  <input type="url" placeholder="https://twitter.com/..." value={socialForm.twitter} onChange={e => setSocialForm({...socialForm, twitter: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>YOUTUBE URL</label>
                  <input type="url" placeholder="https://youtube.com/..." value={socialForm.youtube} onChange={e => setSocialForm({...socialForm, youtube: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>CONTACT EMAIL / MAILTO</label>
                  <input type="text" placeholder="mailto:contact@example.com or link" value={socialForm.email} onChange={e => setSocialForm({...socialForm, email: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>INSTAGRAM URL</label>
                  <input type="url" placeholder="https://instagram.com/..." value={socialForm.insta} onChange={e => setSocialForm({...socialForm, insta: e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>LINKEDIN URL</label>
                  <input type="url" placeholder="https://linkedin.com/..." value={socialForm.linkedin} onChange={e => setSocialForm({...socialForm, linkedin: e.target.value})} style={inputStyle} />
                </div>
                
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={labelStyle}>FACEBOOK URL</label>
                  <input type="url" placeholder="https://facebook.com/..." value={socialForm.facebook} onChange={e => setSocialForm({...socialForm, facebook: e.target.value})} style={inputStyle} />
                </div>
          
              </div>
              <div style={{ borderTop: "1px solid #EBE4D5", paddingTop: "20px", marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={socialSaving} style={{ padding: "12px 24px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", width: "100%", maxWidth: "200px" }}>{socialSaving ? "SAVING..." : "SAVE SOCIAL LINKS"}</button>
              </div>
            </form>
          </>
        )}

        {view === "smtp" && (
          <>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #161412", paddingBottom: "10px" }}>
              <h1 style={{ fontFamily: "Georgia, serif", margin: 0 }}>Email Config</h1>
              <button onClick={triggerMassBlast} disabled={blastLoading} style={{ padding: "10px 20px", backgroundColor: "#C9A227", color: "#161412", border: "2px solid #161412", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap" }}>
                {blastLoading ? "SENDING BLAST..." : "▶ SEND BLAST NOW"}
              </button>
            </div>
            <p style={{ color: "#5E574C", marginBottom: "20px", marginTop: "10px" }}>Configure SMTP to allow the desk to send newsletters and subscription alerts.</p>
            
            <form onSubmit={saveSMTP} style={{ backgroundColor: "#fff", border: "1px solid #161412", padding: "30px", maxWidth: "800px" }}>
              <div style={{ backgroundColor: "#F3EEE3", borderLeft: "4px solid #C9A227", padding: "20px", marginBottom: "30px" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "15px" }}>Automated Daily Briefing</h3>
                <label style={labelStyle}>DAILY SEND TIME (24H FORMAT - EST)</label>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <select value={timeObj.hour} onChange={e => handleTimeChange('hour', e.target.value)} style={{ ...inputStyle, width: "80px", cursor: "pointer", textAlign: "center" }}>
                    {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span style={{ fontSize: "24px", fontWeight: "bold" }}>:</span>
                  <input type="number" min="0" max="59" value={timeObj.min} onChange={e => handleTimeChange('min', e.target.value)} onBlur={handleTimeBlur} style={{ ...inputStyle, width: "80px", textAlign: "center" }} />
                </div>
                <p style={{ fontSize: "12px", color: "#5E574C", margin: "12px 0 0 0" }}>Set the exact time (00:00 - 23:59 EST) the server should automatically email all subscribers.</p>
              </div>

              <div className="form-grid" style={{ marginBottom: "20px" }}>
                <div><label style={labelStyle}>SENDER NAME</label><input required type="text" value={smtpForm.name} onChange={e => setSmtpForm({...smtpForm, name: e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>SENDER EMAIL</label><input required type="email" value={smtpForm.email} onChange={e => setSmtpForm({...smtpForm, email: e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>REPLY-TO EMAIL (Optional)</label><input type="email" value={smtpForm.reply_to} onChange={e => setSmtpForm({...smtpForm, reply_to: e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>SECURITY PROTOCOL</label><select value={smtpForm.security_protocol} onChange={e => setSmtpForm({...smtpForm, security_protocol: e.target.value})} style={inputStyle}><option value="TLS">TLS</option><option value="SSL">SSL</option><option value="NONE">None</option></select></div>
                <div><label style={labelStyle}>SMTP HOST</label><input required type="text" value={smtpForm.host} onChange={e => setSmtpForm({...smtpForm, host: e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>SMTP PORT</label><input required type="number" value={smtpForm.port} onChange={e => setSmtpForm({...smtpForm, port: e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>SMTP USERNAME</label><input type="text" value={smtpForm.username} onChange={e => setSmtpForm({...smtpForm, username: e.target.value})} style={inputStyle} /></div>
                <div><label style={labelStyle}>SMTP PASSWORD</label><input type="password" value={smtpForm.password} onChange={e => setSmtpForm({...smtpForm, password: e.target.value})} style={inputStyle} placeholder="Leave blank to keep existing" /></div>
              </div>
              <div style={{ borderTop: "1px solid #EBE4D5", paddingTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={smtpSaving} style={{ padding: "12px 24px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", width: "100%", maxWidth: "250px" }}>{smtpSaving ? "SAVING..." : "SAVE CONFIGURATION"}</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
