import React, { useState } from "react";
import { API_BASE_URL } from "../config";

export default function LoginScreen({ onLogin, onBack }) {
  const [step, setStep] = useState("LOGIN");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // <-- Eye icon toggle state
  const [challengeId, setChallengeId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        setChallengeId(data.challenge_id);

        if (data.status === "setup_required") {
          fetchSetup(data.challenge_id);
        } else {
          setStep("VERIFY");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
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
        setStep("SETUP");
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F3EEE3",
        padding: "20px"
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "8px",
          border: "2px solid #161412",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
        }}
      >
        <h2
          style={{
            fontFamily: "Georgia, serif",
            margin: "0 0 25px 0",
            fontSize: "28px"
          }}
        >
          Admin Desk
        </h2>

        {error && (
          <div
            style={{
              backgroundColor: "#ffebee",
              color: "#D32F2F",
              padding: "10px",
              marginBottom: "20px",
              fontSize: "14px",
              fontWeight: "bold",
              border: "1px solid #ffcdd2"
            }}
          >
            {error}
          </div>
        )}

        {step === "LOGIN" && (
          <form
            onSubmit={handleLogin}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px"
            }}
          >
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{
                padding: "14px",
                border: "1px solid #161412",
                outline: "none",
                fontSize: "15px",
                boxSizing: "border-box"
              }}
            />

            {/* Password Field with Eye Toggle Icon */}
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  padding: "14px 45px 14px 14px",
                  border: "1px solid #161412",
                  outline: "none",
                  fontSize: "15px",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#5E574C",
                  display: "flex",
                  alignItems: "center",
                  padding: 0
                }}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  // Eye Off Icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  // Eye On Icon
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                backgroundColor: "#161412",
                color: "#F3EEE3",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "0.2s"
              }}
            >
              {loading ? "Authenticating..." : "CONTINUE"}
            </button>
          </form>
        )}

        {step === "SETUP" && (
          <div>
            <p
              style={{
                fontSize: "14px",
                color: "#5E574C",
                marginBottom: "20px",
                lineHeight: "1.5"
              }}
            >
              Scan this QR code with Google Authenticator or Authy to complete
              setup.
            </p>

            <img
              src={qrCode}
              alt="2FA QR Code"
              style={{
                width: "200px",
                height: "200px",
                marginBottom: "20px",
                border: "1px solid #EBE4D5"
              }}
            />

            <form
              onSubmit={handleVerify}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px"
              }}
            >
              <input
                type="text"
                placeholder="Enter 6-digit code"
                required
                value={totpCode}
                onChange={e => setTotpCode(e.target.value)}
                style={{
                  padding: "14px",
                  border: "1px solid #161412",
                  outline: "none",
                  textAlign: "center",
                  letterSpacing: "3px",
                  fontSize: "20px",
                  boxSizing: "border-box"
                }}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "14px",
                  backgroundColor: "#161412",
                  color: "#F3EEE3",
                  border: "none",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                {loading ? "Verifying..." : "VERIFY & LOGIN"}
              </button>
            </form>
          </div>
        )}

        {step === "VERIFY" && (
          <form
            onSubmit={handleVerify}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px"
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "#5E574C",
                marginBottom: "5px"
              }}
            >
              Enter the 2FA code from your authenticator app.
            </p>

            <input
              type="text"
              placeholder="Enter 6-digit code"
              required
              value={totpCode}
              onChange={e => setTotpCode(e.target.value)}
              style={{
                padding: "14px",
                border: "1px solid #161412",
                outline: "none",
                textAlign: "center",
                letterSpacing: "3px",
                fontSize: "20px",
                boxSizing: "border-box"
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px",
                backgroundColor: "#161412",
                color: "#F3EEE3",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer"
              }}
            >
              {loading ? "Verifying..." : "VERIFY"}
            </button>
          </form>
        )}

        <button
          onClick={onBack}
          style={{
            marginTop: "25px",
            background: "none",
            border: "none",
            color: "#5E574C",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          Cancel & Return to Site
        </button>
      </div>
    </div>
  );
}
