import React, { useState } from "react";
import { API_BASE_URL } from "../config";

export default function LoginScreen({ onLogin, onBack }) {
  const [step, setStep] = useState("credentials"); // credentials, setup_2fa, verify_2fa
  const [userId, setUserId] = useState(null);
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  // 2FA Setup Data
  const [qrImage, setQrImage] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Custom Website Modal State
  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "alert" });

  const submitCredentials = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Login failed.");

      setUserId(data.user_id);

      if (data.status === "setup_required") {
        await fetchQrCode(data.user_id);
      } else if (data.status === "mfa_required") {
        setStep("verify_2fa");
      }
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQrCode = async (uid) => {
    try {
      const res = await fetch(`${API_BASE_URL}/login/setup-2fa/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: uid })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load QR code.");
      
      setQrImage(data.qr_image);
      setSecretKey(data.secret);
      setStep("setup_2fa");
    } catch (err) {
      setError(err.message);
    }
  };

  const submitMfaCode = async (event) => {
    event.preventDefault();
    setError("");
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login/verify-2fa/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, code: otpCode })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Verification failed.");
      
      // Complete Login
      onLogin(data);
    } catch (err) {
      setError(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      
      {/* Custom Website Modal Popup */}
      {modal.show && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#F3EEE3", border: "2px solid #161412", padding: "30px", maxWidth: "400px", width: "100%", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", borderRadius: "4px", textAlign: "left" }}>
            <h3 style={{ fontFamily: "Georgia, serif", margin: "0 0 10px 0", color: "#161412", fontSize: "18px" }}>{modal.title}</h3>
            <p style={{ fontSize: "14px", color: "#5E574C", lineHeight: "1.5", marginBottom: "25px" }}>{modal.message}</p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setModal({ show: false })} style={{ padding: "8px 20px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>OK</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .auth-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background-color: #F3EEE3; font-family: Arial, Helvetica, sans-serif; padding: 20px; position: relative; }
        .auth-card { background: #ffffff; border: 2px solid #161412; padding: 50px 40px; width: 100%; max-width: 420px; text-align: center; box-shadow: 8px 8px 0px #161412; }
        .auth-kicker { font-size: 13px; color: #C9A227; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 12px; text-transform: uppercase; }
        .auth-card h1 { font-family: Georgia, "Times New Roman", serif; font-size: 32px; color: #161412; margin: 0 0 10px 0; line-height: 1.1; }
        .auth-subtitle { color: #5E574C; font-size: 15px; margin-bottom: 30px; line-height: 1.4; }
        .auth-form { display: flex; flex-direction: column; text-align: left; }
        .auth-form label { font-size: 13px; font-weight: bold; color: #161412; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .auth-form input { padding: 14px 15px; border: 1px solid #C9C1B0; background: #F3EEE3; color: #161412; font-size: 15px; margin-bottom: 20px; outline: none; }
        .auth-form input:focus { border-color: #161412; background: #ffffff; }
        .auth-error { color: #D32F2F; background: #FDE8E8; border: 1px solid #D32F2F; padding: 12px; font-size: 13px; margin-bottom: 24px; text-align: center; font-weight: bold; }
        .auth-button { background: #161412; color: #F3EEE3; border: 2px solid #161412; padding: 15px; font-size: 14px; font-weight: bold; cursor: pointer; transition: all 0.2s ease; margin-top: 10px; }
        .auth-button:hover:not(:disabled) { background: #C9A227; border-color: #C9A227; color: #161412; }
        .auth-button:disabled { background: #5E574C; border-color: #5E574C; cursor: not-allowed; }
        .qr-box { border: 1px solid #EBE4D5; padding: 15px; background: #FAFAFA; margin-bottom: 20px; }
        .qr-box img { width: 100%; max-width: 200px; height: auto; display: block; margin: 0 auto; }
        .secret-key { font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px; color: #1F3A2E; margin-top: 15px; }
      `}</style>

      <div className="auth-card">
        <div className="auth-kicker">THE AGGREGATE</div>
        
        {step === "credentials" && (
          <>
            <h1>Admin Login</h1>
            <p className="auth-subtitle">Staff access only.</p>
            <form onSubmit={submitCredentials} className="auth-form">
              <label>Username</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
              <label>Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Authenticating..." : "Login"}
              </button>
            </form>
          </>
        )}

        {step === "setup_2fa" && (
          <>
            <h1>Setup 2FA</h1>
            <p className="auth-subtitle">Scan this QR code using Google Authenticator or Authy to secure your account.</p>
            <div className="qr-box">
              {qrImage && <img src={qrImage} alt="2FA QR Code" />}
              <div className="secret-key">{secretKey}</div>
              <p style={{ fontSize: "11px", color: "#5E574C", marginTop: "10px" }}>Or enter this code manually.</p>
            </div>
            <form onSubmit={submitMfaCode} className="auth-form">
              <label>Enter 6-Digit Code</label>
              <input 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                maxLength={6} 
                placeholder="000000" 
                style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px" }} 
              />
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Enable 2FA"}
              </button>
            </form>
          </>
        )}

        {step === "verify_2fa" && (
          <>
            <h1>Two-Factor Auth</h1>
            <p className="auth-subtitle">Enter the code from your Authenticator app to proceed.</p>
            <form onSubmit={submitMfaCode} className="auth-form">
              <label>6-Digit Code</label>
              <input 
                value={otpCode} 
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} 
                maxLength={6} 
                placeholder="000000" 
                style={{ textAlign: "center", fontSize: "24px", letterSpacing: "8px" }} 
              />
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="auth-button" disabled={loading}>
                {loading ? "Verifying..." : "Authenticate"}
              </button>
            </form>
          </>
        )}

        <button className="auth-back-button" onClick={onBack} style={{ marginTop: "20px", background: "none", border: "none", color: "#5E574C", cursor: "pointer", textDecoration: "underline" }}>
          ← Back to news desk
        </button>
      </div>
    </div>
  );
}