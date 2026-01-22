import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import SalesPOSClient from "./SalesPOSClient";

export default async function SalesNewPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const productsRaw = await prisma.product.findMany({
    where: { organizationId, isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      imageUrl: true,
      unit: true,
      salePrice: true, // Decimal
      stockCurrent: true,
    },
  });

  const products = productsRaw.map((p) => ({
    ...p,
    salePrice: Number(p.salePrice),
  }));

  return (
    <main className="page-card">
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Nueva venta</h1>
      <p style={{ opacity: 0.8, marginTop: 6 }}>
        Escanea el código (SKU/EAN) o busca por nombre y agrega al carrito.
      </p>

      <SalesPOSClient products={products} />
    </main>
  );
}
