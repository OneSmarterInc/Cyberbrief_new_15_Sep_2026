import React, { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "../config";

export default function BlogPage({ onBack }) {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [recentPage, setRecentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const RECENT_PER_PAGE = 5;
  const AUTO_FETCH_DELAY = 5000;

  const startedRef = useRef(false);
  const fetchingRef = useRef(false);
  const firstArticleRef = useRef(null);
  const timerRef = useRef(null);
  const hasMoreRef = useRef(true);

  const fetchBlog = async (page) => {
    if (fetchingRef.current) {
      return;
    }

    if (!hasMoreRef.current && page !== 1) {
      return;
    }

    fetchingRef.current = true;
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/blogs/?page=${page}&limit=1`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const fetchedBlogs = Array.isArray(data)
        ? data
        : data.blogs || data.results || [];

      if (!fetchedBlogs.length) {
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      const newBlog = fetchedBlogs[0];

      setBlogs((previousBlogs) => {
        const exists = previousBlogs.some(
          (blog) => String(blog.id) === String(newBlog.id)
        );

        if (exists) {
          return previousBlogs;
        }

        return [...previousBlogs, newBlog];
      });

      if (firstArticleRef.current === null) {
        firstArticleRef.current = newBlog.id;
        setSelectedBlogId(newBlog.id);
      }

      let moreAvailable = false;

      if (data.next !== undefined && data.next !== null) {
        moreAvailable = true;
      } else if (
        data.total_pages !== undefined &&
        data.current_page !== undefined
      ) {
        moreAvailable =
          Number(data.current_page) < Number(data.total_pages);
      } else if (data.count !== undefined) {
        moreAvailable = page < Number(data.count);
      } else {
        moreAvailable = fetchedBlogs.length > 0;
      }

      hasMoreRef.current = moreAvailable;
      setHasMore(moreAvailable);

      if (moreAvailable) {
        clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
          fetchBlog(page + 1);
        }, AUTO_FETCH_DELAY);
      }
    } catch (error) {
      console.error("Failed to fetch blog:", error);

      clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        fetchBlog(page);
      }, AUTO_FETCH_DELAY);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;

    fetchBlog(1);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  const currentBlog =
    blogs.find(
      (blog) => String(blog.id) === String(selectedBlogId)
    ) || blogs[0];

  const recentBlogs = blogs.filter(
    (blog) =>
      String(blog.id) !== String(currentBlog?.id)
  );

  const recentTotalPages = Math.max(
    1,
    Math.ceil(recentBlogs.length / RECENT_PER_PAGE)
  );

  const safeRecentPage = Math.min(
    recentPage,
    recentTotalPages
  );

  const recentStartIndex =
    (safeRecentPage - 1) * RECENT_PER_PAGE;

  const paginatedRecentBlogs = recentBlogs.slice(
    recentStartIndex,
    recentStartIndex + RECENT_PER_PAGE
  );

  useEffect(() => {
    if (recentPage > recentTotalPages) {
      setRecentPage(recentTotalPages);
    }
  }, [recentPage, recentTotalPages]);

  const getImageUrl = (blogObj) => {
    const rawImg =
      blogObj?.image ||
      blogObj?.image_data ||
      blogObj?.image_url;

    if (!rawImg) {
      return null;
    }

    if (
      rawImg.startsWith("http://") ||
      rawImg.startsWith("https://") ||
      rawImg.startsWith("data:image")
    ) {
      return rawImg;
    }

    const base = API_BASE_URL.replace(/\/api\/?$/, "");

    const cleanUrl = rawImg.startsWith("/")
      ? rawImg
      : `/${rawImg}`;

    return `${base}${cleanUrl}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
  };

  const handleBlogClick = (id) => {
    setSelectedBlogId(id);
    setRecentPage(1);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handlePrevious = () => {
    if (safeRecentPage > 1) {
      setRecentPage((page) => page - 1);
    }
  };

  const handleNext = () => {
    if (safeRecentPage < recentTotalPages) {
      setRecentPage((page) => page + 1);
    }
  };

  const mainImage = getImageUrl(currentBlog);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F3EEE3",
        fontFamily: "Arial, sans-serif",
        color: "#161412",
        padding: "40px 20px"
      }}
    >
      <div
        style={{
          maxWidth: "1350px",
          margin: "0 auto"
        }}
      >
        {loading && blogs.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              color: "#5E574C",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: "18px"
            }}
          >
            Loading article...
          </p>
        ) : blogs.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              border: "1px solid #161412",
              backgroundColor: "#FDFBF7"
            }}
          >
            <p
              style={{
                color: "#5E574C",
                fontFamily: "Georgia, serif",
                fontSize: "18px",
                fontStyle: "italic"
              }}
            >
              No blog posts available right now.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              gap: "60px",
              alignItems: "flex-start",
              flexWrap: "wrap"
            }}
          >
            <div
              style={{
                flex: "1",
                minWidth: "300px",
                maxWidth: "850px",
                backgroundColor: "#FDFBF7",
                padding: "40px",
                border: "1px solid #161412",
                borderTop: "4px solid #161412"
              }}
            >
              {mainImage && (
                <div
                  style={{
                    marginBottom: "30px",
                    backgroundColor: "#fff",
                    padding: "5px",
                    border: "1px solid #C9C1B0"
                  }}
                >
                  <img
                    src={mainImage}
                    alt={currentBlog?.title || "Blog"}
                    style={{
                      width: "100%",
                      maxHeight: "550px",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto"
                    }}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  fontSize: "12px",
                  color: "#5E574C",
                  marginBottom: "15px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  letterSpacing: "1px"
                }}
              >
                Posted: {formatDate(currentBlog?.created_at)}
              </div>

              <h1
                style={{
                  color: "#161412",
                  fontFamily: "Georgia, serif",
                  fontSize: "36px",
                  margin: "0 0 20px 0",
                  lineHeight: "1.2"
                }}
              >
                {currentBlog?.title}
              </h1>

              <div
                style={{
                  fontSize: "14px",
                  color: "#5E574C",
                  fontStyle: "italic",
                  marginBottom: "35px",
                  borderBottom: "1px solid #EBE4D5",
                  paddingBottom: "20px"
                }}
              >
                Cyberbriefs Research Desk | Authored{" "}
                {formatDate(currentBlog?.created_at)}
              </div>

              <div
                dangerouslySetInnerHTML={{
                  __html: currentBlog?.description || ""
                }}
                style={{
                  fontSize: "18px",
                  color: "#333",
                  lineHeight: "1.8",
                  fontFamily: "Georgia, serif"
                }}
              />
            </div>

            <div
              style={{
                width: "380px",
                flexShrink: 0
              }}
            >
              <h3
                style={{
                  fontFamily: "Georgia, serif",
                  fontSize: "22px",
                  fontWeight: "bold",
                  borderBottom: "2px solid #161412",
                  paddingBottom: "10px",
                  marginBottom: "25px",
                  marginTop: 0,
                  color: "#161412"
                }}
              >
                Recent Editorials
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "25px"
                }}
              >
                {paginatedRecentBlogs.length === 0 ? (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#5E574C",
                      fontStyle: "italic"
                    }}
                  >
                    No other recent blogs on this page.
                  </p>
                ) : (
                  paginatedRecentBlogs.map((blog) => {
                    const imageUrl = getImageUrl(blog);

                    return (
                      <div
                        key={blog.id}
                        onClick={() => handleBlogClick(blog.id)}
                        style={{
                          display: "flex",
                          gap: "15px",
                          cursor: "pointer",
                          alignItems: "flex-start",
                          padding: "10px",
                          backgroundColor: "#FDFBF7",
                          border: "1px solid #EBE4D5",
                          transition: "border 0.2s"
                        }}
                        onMouseOver={(event) => {
                          event.currentTarget.style.borderColor =
                            "#161412";
                        }}
                        onMouseOut={(event) => {
                          event.currentTarget.style.borderColor =
                            "#EBE4D5";
                        }}
                      >
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            flexShrink: 0,
                            backgroundColor: "#EBE4D5",
                            border: "1px solid #C9C1B0",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={blog.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block"
                              }}
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                                event.currentTarget.parentElement.innerHTML =
                                  "📄";
                              }}
                            />
                          ) : (
                            <span
                              style={{
                                fontSize: "24px"
                              }}
                            >
                              📄
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            minWidth: 0
                          }}
                        >
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#5E574C",
                              marginBottom: "5px",
                              fontWeight: "bold",
                              textTransform: "uppercase"
                            }}
                          >
                            {formatDate(blog.created_at)}
                          </div>

                          <div
                            style={{
                              fontSize: "16px",
                              color: "#161412",
                              lineHeight: "1.4",
                              fontWeight: "bold",
                              fontFamily: "Georgia, serif"
                            }}
                          >
                            {blog.title}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {recentBlogs.length > RECENT_PER_PAGE && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "30px",
                    borderTop: "1px solid #C9C1B0",
                    paddingTop: "20px"
                  }}
                >
                  <button
                    onClick={handlePrevious}
                    disabled={safeRecentPage === 1}
                    style={{
                      padding: "6px 14px",
                      backgroundColor:
                        safeRecentPage === 1
                          ? "transparent"
                          : "#161412",
                      color:
                        safeRecentPage === 1
                          ? "#C9C1B0"
                          : "#F3EEE3",
                      border: `1px solid ${
                        safeRecentPage === 1
                          ? "#C9C1B0"
                          : "#161412"
                      }`,
                      cursor:
                        safeRecentPage === 1
                          ? "default"
                          : "pointer",
                      fontWeight: "bold",
                      fontSize: "12px"
                    }}
                  >
                    &larr; PREV
                  </button>

                  <span
                    style={{
                      fontSize: "12px",
                      color: "#5E574C",
                      fontWeight: "bold",
                      letterSpacing: "1px"
                    }}
                  >
                    PAGE {safeRecentPage} OF {recentTotalPages}
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={
                      safeRecentPage === recentTotalPages
                    }
                    style={{
                      padding: "6px 14px",
                      backgroundColor:
                        safeRecentPage === recentTotalPages
                          ? "transparent"
                          : "#161412",
                      color:
                        safeRecentPage === recentTotalPages
                          ? "#C9C1B0"
                          : "#F3EEE3",
                      border: `1px solid ${
                        safeRecentPage === recentTotalPages
                          ? "#C9C1B0"
                          : "#161412"
                      }`,
                      cursor:
                        safeRecentPage === recentTotalPages
                          ? "default"
                          : "pointer",
                      fontWeight: "bold",
                      fontSize: "12px"
                    }}
                  >
                    NEXT &rarr;
                  </button>
                </div>
              )}

              {loading && blogs.length > 0 && hasMore && (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                    color: "#5E574C",
                    fontSize: "12px",
                    fontStyle: "italic"
                  }}
                >
                  Loading next article...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}