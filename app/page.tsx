import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="landing">
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="brand2">PymePulse</div>
          <nav className="landing-links">
            <a href="#quienes">Quiénes somos</a>
            <a href="#productos">Nuestros productos</a>
            <a href="#beneficios">Beneficios</a>
            <a href="#demo">Demo</a>
          </nav>
          <div className="landing-actions">
            <Link className="btn ghost" href="/login">Ingresar</Link>
            <Link className="btn primary" href="/register">Crear cuenta</Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero2">
        <div className="hero2-inner">
          <div className="hero2-left">
            <div className="badge2 reveal">PymePulse • Capstone</div>

            <h1 className="hero2-title reveal delay-1">
              Ordena tu <span>PYME</span> y vende con control diario
            </h1>

            <p className="hero2-sub reveal delay-2">
              Inventario, ventas y gastos en un solo lugar. Alertas automáticas, caja clara y
              trazabilidad por usuario con un dashboard rápido y seguro (RBAC).
            </p>

            <ul className="hero2-list reveal delay-3">
              <li>Alertas de stock y caja para decidir a tiempo.</li>
              <li>Ventas, gastos y márgenes en minutos, sin planillas.</li>
              <li>Roles y permisos para equipos pequeños.</li>
            </ul>

            <div className="hero2-cta reveal delay-4">
              <Link className="btn primary" href="/register">Crear mi Pyme</Link>
              <a className="btn ghost" href="#demo">Ver demo</a>
              <Link className="btn ghost" href="/login">Ya tengo cuenta</Link>
            </div>

            <div className="hero2-proof reveal delay-5">
              <div className="proof">
                <div className="proof-value">15 min</div>
                <div className="proof-label">Setup inicial</div>
              </div>
              <div className="proof">
                <div className="proof-value">24/7</div>
                <div className="proof-label">Alertas activas</div>
              </div>
              <div className="proof">
                <div className="proof-value">1 panel</div>
                <div className="proof-label">Visión completa</div>
              </div>
            </div>

            <div className="trust reveal delay-6">
              <div className="trust-item">
                <div className="trust-top">RBAC</div>
                <div className="trust-bottom">Roles y permisos</div>
              </div>
            </div>
          </div>

          {/* MOCKUP */}
          <div className="hero2-right" id="demo">
            <div className="mock reveal delay-2">
              <div className="mock-top">
                <div className="dot red" />
                <div className="dot yellow" />
                <div className="dot green" />
                <div className="mock-title">Dashboard • PymePulse</div>
              </div>

              <div className="mock-body">
                <div className="mock-kpis">
                  <div className="mock-kpi">
                    <div className="mk-label">Ventas (30d)</div>
                    <div className="mk-value">$ 1.240.000</div>
                    <div className="mk-hint ok">↑ tendencia</div>
                  </div>
                  <div className="mock-kpi">
                    <div className="mk-label">Gastos (30d)</div>
                    <div className="mk-value">$ 710.000</div>
                    <div className="mk-hint warn">controlable</div>
                  </div>
                  <div className="mock-kpi">
                    <div className="mk-label">Stock bajo</div>
                    <div className="mk-value">3</div>
                    <div className="mk-hint danger">reponer</div>
                  </div>
                  <div className="mock-kpi">
                    <div className="mk-label">Riesgo caja</div>
                    <div className="mk-value">OK</div>
                    <div className="mk-hint ok">7 días</div>
                  </div>
                </div>

                <div className="mock-split">
                  <div className="mock-panel">
                    <div className="mp-title">Actividad reciente</div>

                    <div className="mp-row">
                      <span className="pill ok">VENTA</span>
                      <span>Boleta #A102 • $18.500</span>
                    </div>
                    <div className="mp-row">
                      <span className="pill warn">GASTO</span>
                      <span>Proveedor • $6.200</span>
                    </div>
                    <div className="mp-row">
                      <span className="pill danger">LOW_STOCK</span>
                      <span>Harina: 2 ≤ mín 5</span>
                    </div>
                  </div>

                  <div className="mock-panel">
                    <div className="mp-title">Top vendidos</div>

                    <div className="mp-row">
                      <span className="rank">1</span>
                      <span>Mantequilla Colun</span>
                      <span className="mp-right">3 u.</span>
                    </div>
                    <div className="mp-row">
                      <span className="rank">2</span>
                      <span>Coca 1.5L</span>
                      <span className="mp-right">2 u.</span>
                    </div>
                    <div className="mp-row">
                      <span className="rank">3</span>
                      <span>Harina</span>
                      <span className="mp-right">1 u.</span>
                    </div>
                  </div>
                </div>

                <div className="mock-footer">
                  <span className="chip ok">RBAC</span>
                  <span className="chip">PostgreSQL</span>
                  <span className="chip">Alertas</span>
                  <span className="chip">Dashboard</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* glow decor */}
        <div className="glow g1" />
        <div className="glow g2" />
      </section>

      {/* ABOUT */}
      <section className="section2" id="quienes">
        <div className="section2-head">
          <h2 className="h2">Quiénes somos</h2>
          <p className="muted">Un equipo enfocado en simplificar la gestión diaria de PYMES.</p>
        </div>
        <div className="about-grid">
          <div className="about-card">
            <div className="about-title">Misión</div>
            <div className="about-text">
              Dar visibilidad clara del negocio en un solo panel para tomar mejores decisiones.
            </div>
          </div>
          <div className="about-card">
            <div className="about-title">Visión</div>
            <div className="about-text">
              Que cualquier pyme pueda operar con herramientas modernas sin pagar software complejo.
            </div>
          </div>
          <div className="about-card">
            <div className="about-title">Valores</div>
            <div className="about-text">
              Claridad, rapidez y control para que vendas más y pierdas menos tiempo.
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="section2" id="productos">
        <div className="section2-head">
          <h2 className="h2">Nuestros productos</h2>
          <p className="muted">Módulos pensados para tu operación diaria.</p>
        </div>
        <div className="product-cards">
          <div className="p-card">
            <div className="p-title">Inventario</div>
            <div className="p-text">SKU, stock mínimo, alertas y trazabilidad.</div>
            <div className="p-pill">Control total</div>
          </div>
          <div className="p-card">
            <div className="p-title">Ventas</div>
            <div className="p-text">POS rápido, boletas y top vendidos.</div>
            <div className="p-pill">Flujo ágil</div>
          </div>
          <div className="p-card">
            <div className="p-title">Gastos</div>
            <div className="p-text">Registro simple para comparar margen y caja.</div>
            <div className="p-pill">Caja clara</div>
          </div>
          <div className="p-card">
            <div className="p-title">Alertas</div>
            <div className="p-text">Stock bajo y riesgo de caja en tiempo real.</div>
            <div className="p-pill">Decisiones rápidas</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section2">
        <div className="section2-head">
          <h2 className="h2">Cómo funciona</h2>
          <p className="muted">Un flujo simple para operar día a día sin complicaciones.</p>
        </div>

        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-title">Registra tu Pyme</div>
            <div className="step-text">
              Crea tu organización y tu usuario OWNER. Puedes agregar STAFF/VIEWER según necesidad.
            </div>
          </div>

          <div className="step">
            <div className="step-num">2</div>
            <div className="step-title">Carga productos</div>
            <div className="step-text">
              Guarda SKU/código, precio, costo, mínimos y stock. Ideal para operar y controlar.
            </div>
          </div>

          <div className="step">
            <div className="step-num">3</div>
            <div className="step-title">Vende y controla</div>
            <div className="step-text">
              Registra ventas y gastos; el sistema muestra KPIs y genera alertas por stock/caja.
            </div>
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className="section2">
        <div className="section2-head">
          <h2 className="h2">¿Para quién es?</h2>
          <p className="muted">Pensado para PYMES que necesitan orden sin pagar software caro.</p>
        </div>

        <div className="cases">
          <div className="case">
            <div className="case-title">Minimarket / almacén</div>
            <div className="case-text">Control de stock y productos más vendidos.</div>
            <div className="case-pill">Inventario + Ventas</div>
          </div>

          <div className="case">
            <div className="case-title">Emprendimiento de comida</div>
            <div className="case-text">Costos vs ventas y alertas de reposición.</div>
            <div className="case-pill">Gastos + KPIs</div>
          </div>

          <div className="case">
            <div className="case-title">Tienda online pequeña</div>
            <div className="case-text">Orden de catálogo + control por roles.</div>
            <div className="case-pill">RBAC + Catálogo</div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="section2" id="beneficios">
        <div className="section2-head">
          <h2 className="h2">Qué gana la Pyme</h2>
          <p className="muted">Beneficios concretos que puedes “vender” en la defensa.</p>
        </div>

        <div className="benefits">
          <div className="benefit">
            <div className="benefit-title">Menos quiebres de stock</div>
            <div className="benefit-text">Alertas automáticas cuando un producto cae bajo mínimo.</div>
          </div>
          <div className="benefit">
            <div className="benefit-title">Control financiero básico</div>
            <div className="benefit-text">Comparación ventas vs gastos + utilidad estimada por período.</div>
          </div>
          <div className="benefit">
            <div className="benefit-title">Seguridad y trazabilidad</div>
            <div className="benefit-text">Roles (OWNER/ADMIN/STAFF/VIEWER) y acciones con usuario responsable.</div>
          </div>
          <div className="benefit">
            <div className="benefit-title">Escalable</div>
            <div className="benefit-text">PostgreSQL en la nube (Neon) + ORM Prisma para crecer sin dolores.</div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta2">
        <div className="cta2-card">
          <div>
            <h3 className="h3">Listo para ordenar tu Pyme</h3>
            <p className="muted">
              Registra tu organización y empieza a controlar inventario, ventas y gastos en minutos.
            </p>
          </div>
          <div className="cta2-actions">
            <Link className="btn primary" href="/register">Crear cuenta Pyme</Link>
            <Link className="btn" href="/login">Ya tengo cuenta</Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div>© {new Date().getFullYear()} PymePulse</div>
        <div className="muted">Capstone • Ingeniería Informática</div>
      </footer>
    </main>
  );
}
