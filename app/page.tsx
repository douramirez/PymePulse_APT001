import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="home page-pad">
      <header className="hero">
        <div className="hero-inner">
          <div className="badge">PymePulse • Capstone</div>

          <h1 className="title">
            Gestión inteligente para <span>PYMES</span>
          </h1>

          <p className="subtitle">
            Controla inventario, ventas y gastos en un solo lugar. Recibe alertas de stock y riesgo de caja,
            con un dashboard claro y proyecciones simples.
          </p>

          <div className="cta">
            <Link className="btn primary" href="/login">
              Iniciar sesión
            </Link>
            <a className="btn ghost" href="#features">
              Ver funcionalidades
            </a>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-num">RBAC</div>
              <div className="stat-label">Roles y permisos</div>
            </div>
            <div className="stat">
              <div className="stat-num">Alertas</div>
              <div className="stat-label">Stock / Caja</div>
            </div>
            <div className="stat">
              <div className="stat-num">Neon + Prisma</div>
              <div className="stat-label">PostgreSQL</div>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-top">
            <div className="dot red" />
            <div className="dot yellow" />
            <div className="dot green" />
          </div>

          <div className="card-body">
            <div className="kpi-grid">
              <div className="kpi">
                <div className="kpi-label">Ventas (30d)</div>
                <div className="kpi-value">$ 1.240.000</div>
                <div className="kpi-hint">↑ tendencia</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Gastos (30d)</div>
                <div className="kpi-value">$ 710.000</div>
                <div className="kpi-hint">controlable</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Bajo mínimo</div>
                <div className="kpi-value">3</div>
                <div className="kpi-hint danger">reponer</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Riesgo caja</div>
                <div className="kpi-value">OK</div>
                <div className="kpi-hint ok">7 días</div>
              </div>
            </div>

            <div className="list">
              <div className="list-title">Alertas recientes</div>
              <div className="list-item">
                <span className="pill danger">LOW_STOCK</span>
                <span>Stock bajo: Harina (2 ≤ mín 5)</span>
              </div>
              <div className="list-item">
                <span className="pill warn">CASH_RISK</span>
                <span>Riesgo caja en 30 días</span>
              </div>
              <div className="list-item">
                <span className="pill ok">OK</span>
                <span>Ventas ≥ gastos (7 días)</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="section">
        <h2 className="section-title">Funcionalidades</h2>
        <div className="grid">
          <div className="feature">
            <div className="feature-title">Inventario en tiempo real</div>
            <div className="feature-text">
              Movimientos IN/OUT/ADJUST con historial y alertas automáticas cuando el stock cae bajo mínimo.
            </div>
          </div>
          <div className="feature">
            <div className="feature-title">Ventas y gastos</div>
            <div className="feature-text">
              Registro simple con totales, impacto directo en stock y consolidación por periodo.
            </div>
          </div>
          <div className="feature">
            <div className="feature-title">Dashboard + predicción</div>
            <div className="feature-text">
              KPIs claros y proyección heurística (promedio diario) para anticipar riesgo de caja.
            </div>
          </div>
          <div className="feature">
            <div className="feature-title">Seguridad (RBAC)</div>
            <div className="feature-text">
              OWNER/ADMIN gestionan; STAFF opera; VIEWER solo lectura. APIs protegidas por rol.
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div>© {new Date().getFullYear()} PymePulse</div>
        <div className="footer-right">
          <span>Capstone • Ingeniería Informática</span>
        </div>
      </footer>
    </main>
  );
}
