"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);

  async function login() {
    setError(null);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      window.location.href = "/pos";
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <main>
      <h2>Login</h2>
      <div style={{ display: "grid", gap: 8, maxWidth: 320 }}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button onClick={login}>Login</button>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </div>

      <p style={{ marginTop: 16 }}>
        Create your first admin user directly in MongoDB (see README).
      </p>
    </main>
  );
}
