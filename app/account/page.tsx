"use client";

import { useState } from "react";

export default function AccountPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMsg(null);
    setLoading(true);

    const res = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error ?? "Error actualizando contraseña");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setMsg("Contraseña actualizada ✅");
  }

  return (
    <main className="page-card" style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Mi cuenta</h1>

      <section style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 900 }}>Cambiar contraseña</h2>

        <form onSubmit={submit} style={{ marginTop: 12, display: "grid", gap: 10 }}>
          <input
            type="password"
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
          />

          <input
            type="password"
            placeholder="Nueva contraseña (mín 8)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
          />

          <button
            disabled={loading}
            type="submit"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #000", fontWeight: 800 }}
          >
            {loading ? "Guardando..." : "Actualizar"}
          </button>

          {error && <p style={{ color: "crimson" }}>{error}</p>}
          {msg && <p style={{ color: "green" }}>{msg}</p>}
        </form>
      </section>
    </main>
  );
}
