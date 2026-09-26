import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

export default function LoginScreen({ onLogin, onBack }) {
  const [view, setView] = useState("LOGIN"); // LOGIN, REGISTER, FORGOT, RESET_CONFIRM, SETUP, VERIFY
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // URL token states captured from email link
  const [resetUid, setResetUid] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [challengeId, setChallengeId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Automatically check URL query parameters on component mount for password reset links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get("reset_uid");
    const token = params.get("reset_token");
    if (uid && token) {
      setResetUid(uid);
      setResetToken(token);
      setView("RESET_CONFIRM");
    }
  }, []);

  const switchView = (newView) => {
    setView(newView);
    setError("");
    setSuccessMsg("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEmail("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          onLogin(data);
        } else if (data.challenge_id) {
          setChallengeId(data.challenge_id);
          if (data.status === "setup_required") {
            fetchSetup(data.challenge_id);
          } else {
            setView("VERIFY");
          }
        }
      } else {
        setError(data.error || "Invalid username or password.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          onLogin(data);
        } else {
          setSuccessMsg("Account created successfully! Please log in.");
          setView("LOGIN");
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        setError(data.error || "Registration failed. Username or email may already exist.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await fetch(`${API_BASE_URL}/password-reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Check your email for reset instructions.");
      } else {
        setError(data.error || "Failed to send reset request.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/password-reset-confirm/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: resetUid, token: resetToken, new_password: password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Password updated successfully. Redirecting to sign in...");
        setTimeout(() => {
          // Clean URL params and return to login screen
          window.history.replaceState({}, document.title, window.location.pathname);
          setView("LOGIN");
          setPassword("");
          setConfirmPassword("");
        }, 3000);
      } else {
        setError(data.error || "The reset link is invalid or has expired.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSetup = async (cid) => {
    try {
      const res = await fetch(`${API_BASE_URL}/setup-2fa/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: cid })
      });

      const data = await res.json();

      if (res.ok) {
        setQrCode(data.qr_image);
        setView("SETUP");
      } else {
        setError(data.error || "Failed to setup 2FA");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/verify-2fa/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challenge_id: challengeId,
          code: totpCode
        }),
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || "Invalid code. Try again.");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ show }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      )}
    </svg>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F3EEE3", padding: "20px" }}>
      <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "8px", border: "2px solid #161412", maxWidth: "420px", width: "100%", textAlign: "center", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        
        <h2 style={{ fontFamily: "Georgia, serif", margin: "0 0 25px 0", fontSize: "28px" }}>
          {view === "REGISTER" ? "Join Cyberbriefs" : view === "FORGOT" ? "Reset Password" : view === "RESET_CONFIRM" ? "Set New Password" : "Welcome Back"}
        </h2>

        {(view === "LOGIN" || view === "REGISTER") && (
          <div style={{ display: "flex", marginBottom: "25px", borderBottom: "2px solid #EBE4D5" }}>
            <button
              onClick={() => switchView("LOGIN")}
              style={{ flex: 1, padding: "10px", background: "none", border: "none", borderBottom: view === "LOGIN" ? "2px solid #161412" : "none", fontWeight: "bold", color: view === "LOGIN" ? "#161412" : "#A39E93", cursor: "pointer", marginBottom: "-2px" }}
            >
              SIGN IN
            </button>
            <button
              onClick={() => switchView("REGISTER")}
              style={{ flex: 1, padding: "10px", background: "none", border: "none", borderBottom: view === "REGISTER" ? "2px solid #161412" : "none", fontWeight: "bold", color: view === "REGISTER" ? "#161412" : "#A39E93", cursor: "pointer", marginBottom: "-2px" }}
            >
              CREATE ACCOUNT
            </button>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: "#ffebee", color: "#D32F2F", padding: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "bold", border: "1px solid #ffcdd2" }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div style={{ backgroundColor: "#e8f5e9", color: "#2E7D32", padding: "10px", marginBottom: "20px", fontSize: "14px", fontWeight: "bold", border: "1px solid #c8e6c9" }}>
            {successMsg}
          </div>
        )}

        {/* FORGOT PASSWORD FORM */}
        {view === "FORGOT" && (
          <form onSubmit={handleForgotPassword} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p style={{ fontSize: "13px", color: "#5E574C", textAlign: "left", lineHeight: "1.4" }}>Enter your account email address and we will send you a secure link to reset your password.</p>
            <input type="email" placeholder="Enter your email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "14px", border: "1px solid #161412", outline: "none", fontSize: "15px", boxSizing: "border-box" }} />
            <button type="submit" disabled={loading} style={{ padding: "14px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer" }}>
              {loading ? "Sending..." : "SEND RESET LINK"}
            </button>
            <button type="button" onClick={() => switchView("LOGIN")} style={{ background: "none", border: "none", color: "#5E574C", textDecoration: "underline", cursor: "pointer", fontSize: "13px" }}>
              Back to Sign In
            </button>
          </form>
        )}

        {/* PASSWORD UPDATE / CONFIRMATION FORM */}
        {view === "RESET_CONFIRM" && (
          <form onSubmit={handleResetConfirm} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p style={{ fontSize: "13px", color: "#5E574C", textAlign: "left", lineHeight: "1.4" }}>Please enter your new password below.</p>
            <div style={{ position: "relative", width: "100%" }}>
              <input type={showPassword ? "text" : "password"} placeholder="New Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "14px 45px 14px 14px", border: "1px solid #161412", outline: "none", fontSize: "15px", width: "100%", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5E574C", padding: 0 }}>
                <EyeIcon show={showPassword} />
              </button>
            </div>
            <div style={{ position: "relative", width: "100%" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Confirm New Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ padding: "14px 45px 14px 14px", border: "1px solid #161412", outline: "none", fontSize: "15px", width: "100%", boxSizing: "border-box" }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: "14px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer" }}>
              {loading ? "Updating..." : "UPDATE PASSWORD"}
            </button>
          </form>
        )}

        {view === "LOGIN" && (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} style={{ padding: "14px", border: "1px solid #161412", outline: "none", fontSize: "15px", boxSizing: "border-box" }} />

            <div style={{ position: "relative", width: "100%" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "14px 45px 14px 14px", border: "1px solid #161412", outline: "none", fontSize: "15px", width: "100%", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5E574C", padding: 0 }} title={showPassword ? "Hide password" : "Show password"}>
                <EyeIcon show={showPassword} />
              </button>
            </div>

            <div style={{ textAlign: "right" }}>
              <button type="button" onClick={() => switchView("FORGOT")} style={{ background: "none", border: "none", color: "#8F7118", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>
                Forgot password?
              </button>
            </div>

            <button type="submit" disabled={loading} style={{ padding: "14px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}>
              {loading ? "Authenticating..." : "CONTINUE"}
            </button>
          </form>
        )}

        {view === "REGISTER" && (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input type="email" placeholder="Email Address" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "14px", border: "1px solid #161412", outline: "none", fontSize: "15px", boxSizing: "border-box" }} />
            <input type="text" placeholder="Choose a Username" required value={username} onChange={e => setUsername(e.target.value)} style={{ padding: "14px", border: "1px solid #161412", outline: "none", fontSize: "15px", boxSizing: "border-box" }} />

            <div style={{ position: "relative", width: "100%" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Create Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: "14px 45px 14px 14px", border: "1px solid #161412", outline: "none", fontSize: "15px", width: "100%", boxSizing: "border-box" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#5E574C", padding: 0 }}>
                <EyeIcon show={showPassword} />
              </button>
            </div>

            <div style={{ position: "relative", width: "100%" }}>
              <input type={showPassword ? "text" : "password"} placeholder="Confirm Password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ padding: "14px 45px 14px 14px", border: "1px solid #161412", outline: "none", fontSize: "15px", width: "100%", boxSizing: "border-box" }} />
            </div>

            <button type="submit" disabled={loading} style={{ padding: "14px", backgroundColor: "#C9A227", color: "#161412", border: "none", fontWeight: "bold", cursor: "pointer", transition: "0.2s" }}>
              {loading ? "Creating Account..." : "SIGN UP"}
            </button>
          </form>
        )}

        {view === "SETUP" && (
          <div>
            <p style={{ fontSize: "14px", color: "#5E574C", marginBottom: "20px", lineHeight: "1.5" }}>
              Scan this QR code with Google Authenticator or Authy to complete setup.
            </p>
            <img src={qrCode} alt="2FA QR Code" style={{ width: "200px", height: "200px", marginBottom: "20px", border: "1px solid #EBE4D5" }} />
            <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              <input type="text" placeholder="Enter 6-digit code" required value={totpCode} onChange={e => setTotpCode(e.target.value)} style={{ padding: "14px", border: "1px solid #161412", outline: "none", textAlign: "center", letterSpacing: "3px", fontSize: "20px", boxSizing: "border-box" }} />
              <button type="submit" disabled={loading} style={{ padding: "14px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer" }}>
                {loading ? "Verifying..." : "VERIFY & LOGIN"}
              </button>
            </form>
          </div>
        )}

        {view === "VERIFY" && (
          <form onSubmit={handleVerify} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p style={{ fontSize: "14px", color: "#5E574C", marginBottom: "5px" }}>Enter the 2FA code from your authenticator app.</p>
            <input type="text" placeholder="Enter 6-digit code" required value={totpCode} onChange={e => setTotpCode(e.target.value)} style={{ padding: "14px", border: "1px solid #161412", outline: "none", textAlign: "center", letterSpacing: "3px", fontSize: "20px", boxSizing: "border-box" }} />
            <button type="submit" disabled={loading} style={{ padding: "14px", backgroundColor: "#161412", color: "#F3EEE3", border: "none", fontWeight: "bold", cursor: "pointer" }}>
              {loading ? "Verifying..." : "VERIFY"}
            </button>
          </form>
        )}

        {view !== "FORGOT" && view !== "RESET_CONFIRM" && (
          <button onClick={onBack} style={{ marginTop: "25px", background: "none", border: "none", color: "#5E574C", textDecoration: "underline", cursor: "pointer", fontSize: "13px" }}>
            Cancel & Return to Site
          </button>
        )}
      </div>
    </div>
  );
}