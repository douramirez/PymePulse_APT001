"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link href={href} className={`navlink ${active ? "active" : ""}`}>
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { data } = useSession();
  const role = (data as any)?.role as string | undefined;

  const canManageUsers = role === "ADMIN" || role === "OWNER";
  const canOperate = role === "ADMIN" || role === "OWNER" || role === "STAFF";

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/dashboard" className="brand">
          PymePulse
        </Link>

        <nav className="nav">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/alerts" label="Alertas" />

          {canOperate && (
            <>
              <NavLink href="/products" label="Productos" />
              <NavLink href="/sales" label="Ventas" />
              <NavLink href="/expenses" label="Gastos" />
            </>
          )}

          {canManageUsers && <NavLink href="/users" label="Usuarios" />}
        </nav>

        <button className="btn" onClick={() => signOut({ callbackUrl: "/login" })}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
