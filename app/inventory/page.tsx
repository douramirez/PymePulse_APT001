import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function InventoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const products = await prisma.product.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Inventario</h1>
        <Link href="/products/new" style={{ border: "1px solid #000", padding: "8px 12px", borderRadius: 8 }}>
          + Producto
        </Link>
      </div>

      {products.length === 0 ? (
        <p style={{ marginTop: 16 }}>No hay productos. Crea uno primero.</p>
      ) : (
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Producto</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Stock</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Mín</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ddd", padding: 8 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const low = p.stockCurrent <= p.stockMin;
              return (
                <tr key={p.id}>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8 }}>
                    {p.name} {low ? <span style={{ color: "crimson" }}>● Bajo</span> : null}
                  </td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8, textAlign: "right" }}>{p.stockCurrent}</td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8, textAlign: "right" }}>{p.stockMin}</td>
                  <td style={{ borderBottom: "1px solid #f0f0f0", padding: 8, textAlign: "right" }}>
                    <a
                      href={`/inventory/move?productId=${p.id}&type=IN`}
                      style={{ marginRight: 10, textDecoration: "underline" }}
                    >
                      Entrada
                    </a>
                    <a
                      href={`/inventory/move?productId=${p.id}&type=OUT`}
                      style={{ textDecoration: "underline" }}
                    >
                      Salida
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
