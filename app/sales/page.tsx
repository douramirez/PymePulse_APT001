import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const salesRaw = await prisma.sale.findMany({
    where: { organizationId },
    orderBy: { dateTime: "desc" },
    take: 50,
    select: {
      id: true,
      dateTime: true,
      paymentMethod: true,
      total: true, // Decimal
      createdBy: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  // ✅ Decimal -> number para render seguro
  const sales = salesRaw.map((s) => ({
    ...s,
    total: Number(s.total),
  }));

  return (
    <main className="page-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>Ventas</h1>
        <Link className="btn primary" href="/sales/new">
          + Nueva venta
        </Link>
      </div>

      <div style={{ marginTop: 14, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.75 }}>
              <th style={{ padding: 10 }}>Fecha</th>
              <th style={{ padding: 10 }}>Items</th>
              <th style={{ padding: 10 }}>Pago</th>
              <th style={{ padding: 10 }}>Total</th>
              <th style={{ padding: 10 }}>Usuario</th>
              <th style={{ padding: 10 }}></th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <td style={{ padding: 10 }}>{new Date(s.dateTime).toLocaleString("es-CL")}</td>
                <td style={{ padding: 10 }}>{s._count?.items ?? 0}</td>
                <td style={{ padding: 10 }}>{s.paymentMethod}</td>
                <td style={{ padding: 10, fontWeight: 1000 }}>
                  ${Number(s.total).toLocaleString("es-CL")}
                </td>
                <td style={{ padding: 10 }}>{s.createdBy?.name ?? s.createdBy?.email ?? "—"}</td>
                <td style={{ padding: 10 }}>
                  <Link className="btn" href={`/sales/${s.id}`}>
                    Ver
                  </Link>
                </td>
              </tr>
            ))}

            {sales.length === 0 && (
              <tr>
                <td style={{ padding: 10, opacity: 0.7 }} colSpan={6}>
                  No hay ventas aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
