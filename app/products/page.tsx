import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const products = await prisma.product.findMany({
    where: { organizationId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800 }}>Productos</h1>
        <Link href="/products/news" style={{ border: "1px solid #000", padding: "8px 12px", borderRadius: 8 }}>
          + Nuevo
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        {products.length === 0 ? (
          <p>No hay productos aún. Crea el primero.</p>
        ) : (
          <ul style={{ marginTop: 12 }}>
            {products.map((p) => (
              <li key={p.id}>
                {p.name} — stock: {p.stockCurrent} (mín: {p.stockMin})
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
