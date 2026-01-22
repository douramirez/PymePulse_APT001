import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const expensesRaw = await prisma.expense.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
    take: 50,
    select: {
      id: true,
      date: true,
      amount: true,
      description: true,
      category: { select: { name: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  const expenses = expensesRaw.map((e) => ({
    ...e,
    amount: Number(e.amount),
  }));

  return (
    <main className="page-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>Gastos</h1>
        <Link className="btn primary" href="/expenses/new">
          + Nuevo gasto
        </Link>
      </div>

      <div style={{ marginTop: 14, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.75 }}>
              <th style={{ padding: 10 }}>Fecha</th>
              <th style={{ padding: 10 }}>Categoría</th>
              <th style={{ padding: 10 }}>Descripción</th>
              <th style={{ padding: 10 }}>Monto</th>
              <th style={{ padding: 10 }}>Usuario</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <td style={{ padding: 10 }}>{new Date(e.date).toLocaleDateString("es-CL")}</td>
                <td style={{ padding: 10 }}>{e.category?.name ?? "—"}</td>
                <td style={{ padding: 10 }}>{e.description ?? "—"}</td>
                <td style={{ padding: 10, fontWeight: 1000 }}>${e.amount.toLocaleString("es-CL")}</td>
                <td style={{ padding: 10 }}>{e.createdBy?.name ?? e.createdBy?.email ?? "—"}</td>
              </tr>
            ))}

            {expenses.length === 0 && (
              <tr>
                <td style={{ padding: 10, opacity: 0.7 }} colSpan={5}>
                  No hay gastos aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
