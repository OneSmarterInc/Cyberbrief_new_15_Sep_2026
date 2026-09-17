import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function Footer({ setAuthScreen }) {
  const [socials, setSocials] = useState({
    twitter: "",
    youtube: "",
    email: "",
    insta: "",
    facebook: ""
  });

  // Calculate the current year dynamically
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetch(`${API_BASE_URL}/social/`)
      .then(res => res.json())
      .then(data => {
        if (data) setSocials(data);
      })
      .catch(err => console.error("Failed to load social links", err));
  }, []);

  // Inline SVG icons for clean, modern look without external icon libraries
  const icons = {
    twitter: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
      </svg>
    ),
    youtube: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path>
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor"></polygon>
      </svg>
    ),
    insta: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ),
    facebook: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    ),
    email: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    )
  };

  const iconLinkStyle = {
    color: "#C9C1B0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "1px solid #332F2C",
    backgroundColor: "#1F1C19",
    transition: "all 0.2s ease"
  };

  return (
    <footer style={{ backgroundColor: "#161412", color: "#F3EEE3", padding: "40px 20px", marginTop: "auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        
        {/* Left Side: Brand & Copyright */}
        <div>
          <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 5px 0", fontSize: "20px", color: "#F3EEE3" }}>Cyberbriefs</h3>
          <p style={{ fontSize: "12px", color: "#C9C1B0", margin: 0 }}>© {currentYear} The Aggregate Desk. All rights reserved.</p>
        </div>

        {/* Center: Dynamic Social Icons (Only renders if URL is provided in Admin) */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {socials.twitter && (
            <a href={socials.twitter} target="_blank" rel="noopener noreferrer" title="Twitter / X" style={iconLinkStyle}>
              {icons.twitter}
            </a>
          )}
          {socials.youtube && (
            <a href={socials.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" style={iconLinkStyle}>
              {icons.youtube}
            </a>
          )}
          {socials.insta && (
            <a href={socials.insta} target="_blank" rel="noopener noreferrer" title="Instagram" style={iconLinkStyle}>
              {icons.insta}
            </a>
          )}
          {socials.facebook && (
            <a href={socials.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" style={iconLinkStyle}>
              {icons.facebook}
            </a>
          )}
          {socials.email && (
            <a href={socials.email.startsWith("http") || socials.email.startsWith("mailto") ? socials.email : `mailto:${socials.email}`} title="Contact Email" style={iconLinkStyle}>
              {icons.email}
            </a>
          )}
        </div>

        {/* Right Side: Legal Links */}
        <div style={{ display: "flex", gap: "15px", fontSize: "12px" }}>
          <button onClick={() => setAuthScreen("privacy")} style={{ background: "none", border: "none", color: "#C9C1B0", cursor: "pointer", padding: 0 }}>Privacy Policy</button>
          <span>•</span>
          <button onClick={() => setAuthScreen("terms")} style={{ background: "none", border: "none", color: "#C9C1B0", cursor: "pointer", padding: 0 }}>Terms of Use</button>
          <span>•</span>
          <button onClick={() => setAuthScreen("cookies")} style={{ background: "none", border: "none", color: "#C9C1B0", cursor: "pointer", padding: 0 }}>Cookie Settings</button>
        </div>

      </div>
    </footer>
  );
}