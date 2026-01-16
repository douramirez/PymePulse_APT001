import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { clp } from "@/lib/money";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const expenses = await prisma.expense.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
    take: 100,
    include: { category: { select: { name: true } } },
  });

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Gastos</h1>
        <Link href="/expenses/new" style={{ border: "1px solid #000", padding: "8px 12px", borderRadius: 8 }}>
          + Nuevo
        </Link>
      </div>

      {expenses.length === 0 ? (
        <p style={{ marginTop: 16 }}>No hay gastos aún.</p>
      ) : (
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Fecha</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Categoría</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Descripción</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                  {new Date(e.date).toLocaleDateString()}
                </td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{e.category.name}</td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{e.description ?? "-"}</td>
                <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8, textAlign: "right" }}>
                  {clp(Number(e.amount))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
