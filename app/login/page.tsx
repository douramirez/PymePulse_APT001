"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="auth">
      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-badge">PymePulse</div>
          <h1 className="auth-title">Tu negocio ordenado en minutos</h1>
          <p className="auth-sub">
            Accede al panel y controla inventario, ventas y gastos con alertas inteligentes.
          </p>

          <div className="auth-points">
            <div className="auth-point">✔︎ Stock bajo y caja controlada</div>
            <div className="auth-point">✔︎ Ventas rápidas y trazables</div>
            <div className="auth-point">✔︎ Roles para tu equipo</div>
          </div>

          <div className="auth-glow" />
        </div>

        <div className="auth-right">
          <div className="auth-head">
            <div className="auth-logo">PymePulse</div>
            <div className="auth-kicker">Inicia sesión</div>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            <label className="auth-field">
              <span>Email</span>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span>Contraseña</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button disabled={loading} type="submit" className="auth-submit">
              {loading ? "Entrando..." : "Entrar"}
            </button>

            {error && <p className="auth-error">{error}</p>}
          </form>

          <p className="auth-footer">
            ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
