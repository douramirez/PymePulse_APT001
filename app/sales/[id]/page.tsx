import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function SaleDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;
  const id = params.id;

  const sale = await prisma.sale.findFirst({
    where: { id, organizationId },
    select: {
      id: true,
      dateTime: true,
      paymentMethod: true,
      total: true, // Decimal
      createdBy: { select: { name: true, email: true } },
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          quantity: true,
          unitPrice: true, // Decimal
          lineTotal: true, // Decimal
          product: { select: { name: true, sku: true } },
        },
      },
    },
  });

  if (!sale) {
    return (
      <main className="page-card">
        <Link className="btn" href="/sales">
          ← Volver
        </Link>
        <p style={{ marginTop: 12 }}>Venta no encontrada.</p>
      </main>
    );
  }

  const total = Number(sale.total);

  return (
    <main className="page-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <Link className="btn" href="/sales">
            ← Volver
          </Link>

          <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 10 }}>
            Venta #{sale.id.slice(0, 6)}
          </h1>

          <div style={{ opacity: 0.75 }}>
            {new Date(sale.dateTime).toLocaleString("es-CL")} • {sale.paymentMethod} •{" "}
            {sale.createdBy?.name ?? sale.createdBy?.email ?? "—"}
          </div>
        </div>

        <div style={{ fontSize: 22, fontWeight: 1000 }}>
          Total: ${total.toLocaleString("es-CL")}
        </div>
      </div>

      <div style={{ marginTop: 16, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", opacity: 0.75 }}>
              <th style={{ padding: 10 }}>Producto</th>
              <th style={{ padding: 10 }}>SKU</th>
              <th style={{ padding: 10 }}>Cant.</th>
              <th style={{ padding: 10 }}>P. Unit</th>
              <th style={{ padding: 10 }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((i) => {
              const unitPrice = Number(i.unitPrice);
              const lineTotal = Number(i.lineTotal);

              return (
                <tr key={i.id} style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                  <td style={{ padding: 10, fontWeight: 900 }}>{i.product?.name ?? "—"}</td>
                  <td style={{ padding: 10 }}>{i.product?.sku ?? "—"}</td>
                  <td style={{ padding: 10 }}>{i.quantity}</td>
                  <td style={{ padding: 10 }}>${unitPrice.toLocaleString("es-CL")}</td>
                  <td style={{ padding: 10, fontWeight: 900 }}>${lineTotal.toLocaleString("es-CL")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
