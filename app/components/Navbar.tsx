"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const role = (session as any)?.role as string | undefined;

  // En /login lo ocultamos
  if (pathname === "/login") return null;

  const authed = status === "authenticated";

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="nav-left">
          <Link href={authed ? "/dashboard" : "/"} className="brand">
            PymePulse
          </Link>

          {authed && (
            <nav className="nav-links">
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/products">Productos</Link>
              <Link href="/inventory">Inventario</Link>
              <Link href="/inventory/history">Historial</Link>
              <Link href="/sales">Ventas</Link>
              <Link href="/expenses">Gastos</Link>
              <Link href="/alerts">Alertas</Link>
              <Link href="/account">Mi cuenta</Link>

              {(role === "OWNER" || role === "ADMIN") && (
                <Link href="/users">Usuarios</Link>
              )}
            </nav>
          )}
        </div>

        <div className="nav-right">
          {authed ? (
            <button className="btn-nav" onClick={() => signOut({ callbackUrl: "/login" })}>
              Cerrar sesión
            </button>
          ) : (
            <Link className="btn-nav" href="/login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
