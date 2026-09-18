import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import LoginScreen from "./components/LoginScreen";
import { API_BASE_URL } from "./config";
import AboutDesk from "./components/AboutDesk";
import AdminDashboard from "./components/AdminDashboard";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfUse from "./components/TermsOfUse";
import CookieSettings from "./components/CookieSettings";
import Footer from "./components/Footer";
import HomeFeed from "./components/HomeFeed";
import BlogPage from "./components/BlogPage";
import BookPage from "./components/BookPage"; 
import RssFeedPage from "./components/RssFeedPage";

const TOKEN_KEY = "newsai_token";
const USER_KEY = "newsai_user";
const ITEMS_PER_PAGE = 14; 

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(USER_KEY) || "null"); } 
    catch { return null; }
  });
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  
  const [authScreen, setAuthScreen] = useState(() => {
    const savedScreen = sessionStorage.getItem("newsai_screen");
    const savedUser = JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
    if (savedScreen === "admin" && (!savedUser || !savedUser.is_admin)) return null;
    return savedScreen || null;
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (authScreen) sessionStorage.setItem("newsai_screen", authScreen);
    else sessionStorage.removeItem("newsai_screen");
  }, [authScreen]);

  const [articles, setArticles] = useState([]);
  const [totalSources, setTotalSources] = useState(0); 
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showSubPopup, setShowSubPopup] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subStatus, setSubStatus] = useState("idle"); 
  const [subError, setSubError] = useState("");

  const navigate = (path) => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" }); 
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  useEffect(() => {
    const handleRouting = (event) => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      if (window.location.hash.startsWith("#/")) {
        const cleanPath = window.location.hash.replace("#", "");
        window.history.replaceState({}, "", cleanPath);
      }

      let path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      setCurrentPage(1);

      if (path === "/search" && !event) {
        window.history.replaceState({}, "", "/");
        path = "/";
      }

      if (path === "/admin") {
        const currentToken = sessionStorage.getItem(TOKEN_KEY);
        const savedUser = JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
        
        if (currentToken && savedUser && savedUser.is_admin) {
          setAuthScreen("admin");
        } else {
          window.history.replaceState({}, "", "/login");
          setAuthScreen("login");
        }
      } else if (path === "/login") {
        setAuthScreen("login");
      } else if (path === "/blogs" || path === "/blog") {
        setAuthScreen("blog");
      } else if (path === "/books" || path === "/book") { 
        setAuthScreen("book");
      } else if (path === "/rss") {
        setAuthScreen("rss");
      } else if (path === "/how") {
        setAuthScreen("about");
      } else if (path === "/privacy") {
        setAuthScreen("privacy");
      } else if (path === "/terms") {
        setAuthScreen("terms");
      } else if (path === "/cookies") {
        setAuthScreen("cookies");
      } else if (path.startsWith("/section/")) {
        setAuthScreen(null);
        const slug = path.replace("/section/", "");
        const cats = { "cybersecurity": "Cybersecurity" };
        setSelectedCategory(cats[slug] || "All");
        setSearchQuery("");
      } else if (path === "/search") {
        setAuthScreen(null);
        setSearchQuery(searchParams.get("q") || "");
      } else {
        setAuthScreen(null);
        setSelectedCategory("All");
        setSearchQuery("");
      }
    };

    window.addEventListener("popstate", handleRouting);
    window.addEventListener("hashchange", handleRouting); 
    
    handleRouting(); 
    
    return () => {
      window.removeEventListener("popstate", handleRouting);
      window.removeEventListener("hashchange", handleRouting);
    };
  }, []);

  const saveSession = async (data) => {
    setToken(data.token);
    setUser(data.user);
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    
    if (data.user?.is_admin) navigate("/admin");
    else navigate("/");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  const handleCategorySelect = (category) => {
    navigate(category === "All" ? "/" : `/section/${category.toLowerCase().replace(/\s+/g, "-")}`);
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" }); 
  };

  const fetchNews = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true); else setLoading(true);
      setError("");
      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Token ${token}`;
      const response = await fetch(`${API_BASE_URL}/news/`, { headers, credentials: 'include' });
      if (!response.ok) throw new Error(`News API returned ${response.status}`);
      const result = await response.json();
      setArticles(result.articles || []);
      
      if (result.total_sources !== undefined) {
        setTotalSources(result.total_sources);
      }
    } catch {
      setError("Unable to load news. Check that the Django server is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authScreen || authScreen === "admin" || authScreen === "rss") {
      fetchNews(); 
      const intervalId = setInterval(() => { fetchNews(false); }, 1800000); 
      return () => clearInterval(intervalId); 
    }
  }, [authScreen, fetchNews]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const isSubscriber = searchParams.get("sub") === "true";

    if (isSubscriber) {
      sessionStorage.setItem("hasSeenPopup", "true");
    }

    if (!authScreen && !sessionStorage.getItem("hasSeenPopup")) {
      const timer = setTimeout(() => {
        setShowSubPopup(true);
        sessionStorage.setItem("hasSeenPopup", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [authScreen]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    setSubStatus("loading");
    
    try {
      const res = await fetch(`${API_BASE_URL}/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail }),
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.ok) {
        if (data.status === "already_subscribed") setSubStatus("already");
        else setSubStatus("success");
        setTimeout(() => {
          setShowSubPopup(false);
          setSubStatus("idle"); 
          setSubEmail("");
        }, 3500);
      } else {
        setSubStatus("error");
        setSubError(data.error || "Failed to subscribe.");
      }
    } catch (err) {
      setSubStatus("error");
      setSubError("Network error.");
    }
  };

  const filteredArticles = useMemo(() => {
    let activeArticles = articles.filter(a => a.is_active !== false); 
    if (selectedCategory !== "All") {
      activeArticles = activeArticles.filter((article) => (article.category || "").toLowerCase() === selectedCategory.toLowerCase());
    }
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      activeArticles = activeArticles.filter((article) => 
        (article.title || "").toLowerCase().includes(lowerQ) || 
        (article.ai_headline || "").toLowerCase().includes(lowerQ) || 
        (article.summary || "").toLowerCase().includes(lowerQ) || 
        (article.source || "").toLowerCase().includes(lowerQ)
      );
    }
    return activeArticles;
  }, [articles, selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const currentArticles = filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const mostCoveredArticles = useMemo(() => {
    const active = articles.filter(a => a.is_active !== false);
    let morning = active.filter(a => {
      if (!a.published) return false;
      const hours = new Date(a.published).getHours();
      return hours >= 7 && hours <= 9;
    });
    if (morning.length < 3) {
      const needed = 3 - morning.length;
      morning = [...morning, ...active.filter(a => !morning.includes(a)).slice(0, needed)];
    }
    return morning.slice(0, 3);
  }, [articles]);

  const inBriefArticles = useMemo(() => {
    const active = articles.filter(a => a.is_active !== false);
    const available = active.filter(a => !mostCoveredArticles.includes(a));
    return [...available].sort(() => 0.5 - Math.random()).slice(0, 8);
  }, [articles, mostCoveredArticles]);

  // --- FIX: Now explicitly pulls the first ACTIVE/FILTERED article instead of the raw database first ---
  const latestArticle = filteredArticles[0] || null;
  const currentYear = new Date().getFullYear();

  const handleFooterNavigation = (screen) => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" }); 
    if (screen === "privacy") navigate("/privacy");
    if (screen === "terms") navigate("/terms");
    if (screen === "cookies") navigate("/cookies");
  };

  return (
    <div className="app" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {authScreen !== "admin" && (
        <Navbar
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategorySelect} 
          user={user}
          onSignin={() => navigate("/login")}
          onHome={handleHome} 
          onRss={() => navigate("/rss")}
          onAbout={() => navigate("/how")}
          onBlogs={() => navigate("/blogs")}
          onBooks={() => navigate("/books")}
          onAdmin={() => navigate("/admin")} 
          onSubscribe={() => setShowSubPopup(true)} 
          onSearch={handleSearch} 
          latestHeadline={latestArticle?.title || ""}
          latestSummary={latestArticle?.summary || ""}
          latestPublished={latestArticle?.published || ""}
          totalStories={filteredArticles.length} 
          totalSources={totalSources} 
        />
      )}

      <div style={{ flex: 1 }}>
        {authScreen === "login" ? <LoginScreen onLogin={saveSession} onBack={() => navigate("/")} />
        : authScreen === "blog" ? <BlogPage onBack={() => navigate("/")} />
        : authScreen === "book" ? <BookPage onBack={() => navigate("/")} />
        : authScreen === "rss" ? (
            loading ? (
              <div style={{ textAlign: "center", padding: "80px", fontFamily: "Georgia, serif", fontSize: "16px", color: "#5E574C" }}>
                Loading intelligence sources...
              </div>
            ) : (
              <RssFeedPage articles={articles} onBack={() => navigate("/")} />
            )
          )
        : authScreen === "about" ? <AboutDesk onBack={() => navigate("/")} />
        : authScreen === "privacy" ? <PrivacyPolicy onBack={() => navigate("/")} />
        : authScreen === "terms" ? <TermsOfUse onBack={() => navigate("/")} />
        : authScreen === "cookies" ? <CookieSettings onBack={() => navigate("/")} />
        : authScreen === "admin" && user?.is_admin ? <AdminDashboard user={user} articles={articles} token={token} onRefresh={() => fetchNews(true)} onBack={() => navigate("/")} onLogout={handleLogout} />
        : (
          <HomeFeed 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery} 
            filteredArticles={filteredArticles} 
            currentArticles={currentArticles} 
            loading={loading} 
            error={error} 
            refreshing={refreshing} 
            fetchNews={fetchNews} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            handlePageChange={handlePageChange} 
            mostCoveredArticles={mostCoveredArticles} 
            inBriefArticles={inBriefArticles} 
            articles={articles} 
          />
        )}
      </div>

      {authScreen !== "admin" && authScreen !== "login" && (
        <Footer currentYear={currentYear} setAuthScreen={handleFooterNavigation} />
      )}

      {showSubPopup && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(22,20,18,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "20px" }}>
          <div style={{ backgroundColor: "#F3EEE3", padding: "40px", width: "100%", maxWidth: "450px", border: "3px solid #161412", textAlign: "center", position: "relative" }}>
            <button onClick={() => setShowSubPopup(false)} style={{ position: "absolute", top: "10px", right: "15px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#5E574C", fontWeight: "bold" }}>✕</button>
            
            {subStatus === "success" ? (
              <>
                <h2 style={{ fontFamily: "Georgia, serif", color: "#1F3A2E", fontSize: "28px", margin: "0 0 15px 0" }}>You're on the list!</h2>
                <p style={{ color: "#5E574C", fontSize: "16px", lineHeight: "1.5", margin: 0 }}>You have been successfully added to our subscriber list. You will receive our next daily briefing.</p>
              </>
            ) : subStatus === "already" ? (
              <>
                <h2 style={{ fontFamily: "Georgia, serif", color: "#8F7118", fontSize: "28px", margin: "0 0 15px 0" }}>Already Subscribed</h2>
                <p style={{ color: "#5E574C", fontSize: "16px", lineHeight: "1.5", margin: 0 }}>This email is already on our list. You are all set to receive the daily briefings!</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: "12px", color: "#C9A227", fontWeight: "bold", letterSpacing: "1px", marginBottom: "10px" }}>GET THE BRIEFING</div>
                <h2 style={{ fontFamily: "Georgia, serif", color: "#161412", fontSize: "32px", margin: "0 0 15px 0", lineHeight: "1.1" }}>Your daily desk,<br/>delivered.</h2>
                <p style={{ color: "#5E574C", fontSize: "15px", marginBottom: "25px" }}>Subscribe to receive the top 5 AI and Cybersecurity stories formatted perfectly for your inbox.</p>
                <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <input type="email" required value={subEmail} onChange={(e) => setSubEmail(e.target.value)} placeholder="Enter your email address" style={{ padding: "15px", border: "1px solid #161412", fontSize: "15px", outline: "none", textAlign: "center" }} />
                  {subStatus === "error" && <div style={{ color: "#D32F2F", fontSize: "13px", fontWeight: "bold" }}>{subError}</div>}
                  <button type="submit" disabled={subStatus === "loading"} style={{ padding: "15px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", fontSize: "14px", cursor: "pointer", letterSpacing: "1px" }}>{subStatus === "loading" ? "ADDING..." : "SUBSCRIBE NOW"}</button>
                </form>
                <div style={{ marginTop: "20px", fontSize: "11px", color: "#5E574C" }}>We will never share your email with third parties.</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
