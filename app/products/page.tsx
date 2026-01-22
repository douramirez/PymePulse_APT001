import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import ProductsClient from "./ProductsClient";

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const productsRaw = await prisma.product.findMany({
    where: { organizationId, isActive: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      sku: true,
      imageUrl: true,
      unit: true,
      salePrice: true,      // Decimal en Prisma
      stockCurrent: true,
      stockMin: true,
    },
  });

  // ✅ Convertir Decimal -> number para poder pasar a Client Component
  const products = productsRaw.map((p) => ({
    ...p,
    salePrice: Number(p.salePrice),
  }));

  return (
    <main className="page-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>Productos</h1>

        <Link className="btn primary" href="/products/news">
          + Nuevo producto
        </Link>
      </div>

      <ProductsClient products={products} />
    </main>
  );
}
