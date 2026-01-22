import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UsersTableClient from "./UsersTableClient";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session as any).role as string;
  if (!(role === "OWNER" || role === "ADMIN")) redirect("/dashboard");

  const organizationId = (session as any).organizationId as string;

  const users = await prisma.user.findMany({
    where: { organizationId },
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });

  return (
    <main className="page-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>Usuarios</h1>
        <Link href="/users/new" style={{ border: "1px solid #000", padding: "8px 12px", borderRadius: 8 }}>
          + Nuevo
        </Link>
      </div>

      {users.length === 0 ? <p style={{ marginTop: 16 }}>No hay usuarios.</p> : <UsersTableClient users={users as any} />}
    </main>
  );
}
