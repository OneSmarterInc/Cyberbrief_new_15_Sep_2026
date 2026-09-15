import React, { useState } from "react";
import { API_BASE_URL } from "../config";

export default function RegisterScreen({ onRegister, onLogin, onBack }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !email.trim() || !password) {
      setError("Username, email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      onRegister(data);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-kicker">THE AGGREGATE</div>
        <h1>Create account</h1>
        <p className="auth-subtitle">Build your personal news desk.</p>

        <form onSubmit={submit} className="auth-form">
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="Choose username"
          />

          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
          />

          {error ? <div className="auth-error">{error}</div> : null}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <button className="auth-link-button" onClick={onLogin}>
          Already have an account? Sign in
        </button>

        <button className="auth-back-button" onClick={onBack}>
          Back to news
        </button>
      </div>
    </div>
  );
}
