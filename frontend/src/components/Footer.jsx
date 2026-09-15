import React from "react";

export default function Footer({ currentYear, setAuthScreen }) {
  return (
    <footer style={{ backgroundColor: "#161412", color: "#F3EEE3", padding: "40px 20px", textAlign: "center", marginTop: "auto" }}>
      <style>{`
        .footer-link { background: none; border: none; color: #C9C1B0; cursor: pointer; text-decoration: none; padding: 0; font-family: inherit; font-size: 13px; transition: color 0.2s ease; }
        .footer-link:hover { color: #C9A227; text-decoration: underline; }
      `}</style>
      
      <p style={{ fontSize: "14px", marginBottom: "15px", color: "#C9C1B0", fontFamily: "Georgia, serif" }}>
        © {currentYear} Cyberbriefs. All Rights Reserved.
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "25px" }}>
        <button onClick={() => { setAuthScreen("privacy"); window.scrollTo(0,0); }} className="footer-link">Privacy Policy</button>
        <button onClick={() => { setAuthScreen("terms"); window.scrollTo(0,0); }} className="footer-link">Terms Of Use</button>
        <button onClick={() => { setAuthScreen("cookies"); window.scrollTo(0,0); }} className="footer-link">Cookie Settings</button>
      </div>
    </footer>
  );
}