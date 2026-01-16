import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { clp } from "@/lib/money";

export default async function SalesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const sales = await prisma.sale.findMany({
    where: { organizationId },
    orderBy: { dateTime: "desc" },
    take: 50,
    include: {
      items: { include: { product: { select: { name: true } } } },
    },
  });

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Ventas</h1>
        <Link href="/sales/new" style={{ border: "1px solid #000", padding: "8px 12px", borderRadius: 8 }}>
          + Nueva
        </Link>
      </div>

      {sales.length === 0 ? (
        <p style={{ marginTop: 16 }}>No hay ventas aún.</p>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {sales.map((s) => (
            <div key={s.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{new Date(s.dateTime).toLocaleString()}</div>
                  <div style={{ opacity: 0.8, marginTop: 4 }}>Ítems: {s.items.length}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {clp(Number(s.total))}
                </div>
              </div>

              <ul style={{ marginTop: 10 }}>
                {s.items.map((it) => (
                  <li key={it.id}>
                    {it.product.name} × {it.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
