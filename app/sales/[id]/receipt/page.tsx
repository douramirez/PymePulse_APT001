import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import PrintActions from "./PrintActions";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;
  const { id } = await params;

  const sale = await prisma.sale.findFirst({
    where: { id, organizationId },
    select: {
      id: true,
      dateTime: true,
      paymentMethod: true,
      total: true,
      receiptNumber: true,
      organization: { select: { name: true } },
      createdBy: { select: { name: true, email: true } },
      items: {
        select: {
          quantity: true,
          unitPrice: true,
          lineTotal: true,
          product: { select: { name: true, sku: true, unit: true } },
        },
      },
    },
  });

  if (!sale) {
    return (
      <main className="page-card">
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Boleta no encontrada</h1>
      </main>
    );
  }

  const total = Number(sale.total);

  return (
    <main style={{ maxWidth: 480, margin: "24px auto", padding: 16, background: "white" }}>
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          main { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 1000 }}>{sale.organization.name}</div>
        <div style={{ opacity: 0.7, marginTop: 4 }}>Boleta</div>
        <div style={{ marginTop: 6, fontWeight: 800 }}>
          Nº {sale.receiptNumber ?? "—"}
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
        <div>Venta: {sale.id}</div>
        <div>Fecha: {new Date(sale.dateTime).toLocaleString("es-CL")}</div>
        <div>Cajero: {sale.createdBy.name}</div>
        <div>Pago: {sale.paymentMethod}</div>
      </div>

      <div style={{ marginTop: 12, borderTop: "1px dashed #aaa", paddingTop: 10 }}>
        {sale.items.map((i, idx) => (
          <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, marginBottom: 6 }}>
            <div>
              <div style={{ fontWeight: 800 }}>{i.product?.name ?? "Producto"}</div>
              <div style={{ fontSize: 12, opacity: 0.75 }}>
                {i.product?.sku ? `SKU: ${i.product.sku}` : "Sin SKU"} • {i.quantity} {i.product?.unit ?? "unidad"} x{" "}
                ${Number(i.unitPrice).toLocaleString("es-CL")}
              </div>
            </div>
            <div style={{ fontWeight: 800 }}>${Number(i.lineTotal).toLocaleString("es-CL")}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12, borderTop: "1px dashed #aaa", paddingTop: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 1000, fontSize: 18 }}>
          <span>Total</span>
          <span>${total.toLocaleString("es-CL")}</span>
        </div>
      </div>

      <div className="no-print">
        <PrintActions />
      </div>
    </main>
  );
}
