"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationName, ownerName, email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error ?? "Error registrando pyme");
      return;
    }

    router.push("/login");
  }

  return (
    <main className="page-card" style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Registrar Pyme</h1>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Crea tu organización y tu usuario OWNER.
      </p>

      <form onSubmit={submit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <input
          placeholder="Nombre de la Pyme"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <input
          placeholder="Nombre del dueño"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <input
          placeholder="Contraseña (mín 8)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
        />

        <button
          disabled={loading}
          type="submit"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #000", fontWeight: 900 }}
        >
          {loading ? "Creando..." : "Crear cuenta"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <p style={{ fontSize: 13, opacity: 0.8 }}>
          ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
        </p>
      </form>
    </main>
  );
}
