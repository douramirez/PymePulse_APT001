import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function InventoryHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const moves = await prisma.inventoryMovement.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      product: { select: { name: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Historial de inventario</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>Últimos 50 movimientos</p>

      <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Fecha</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Producto</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Tipo</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Cantidad</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Motivo</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {moves.map((m) => (
            <tr key={m.id}>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                {new Date(m.createdAt).toLocaleString()}
              </td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{m.product.name}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{m.type}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8, textAlign: "right" }}>{m.quantity}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>{m.reason ?? "-"}</td>
              <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                {m.createdBy.name} ({m.createdBy.email})
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
