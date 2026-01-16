"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("dueno@demo.cl");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) setError("Credenciales inválidas");
    else router.push("/dashboard");
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>PymePulse</h1>
      <p style={{ marginTop: 6 }}>Inicia sesión</p>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <button
          disabled={loading}
          type="submit"
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #000",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>

      <p style={{ marginTop: 16, fontSize: 13, opacity: 0.8 }}>
        Demo: <b>dueno@demo.cl</b> / <b>Admin123!</b>
      </p>
    </main>
  );
}
