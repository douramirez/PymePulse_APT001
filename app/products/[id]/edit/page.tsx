import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import EditProductClient from "./EditProductClient";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: { id, organizationId },
    select: {
      id: true,
      name: true,
      sku: true,
      imageUrl: true,
      unit: true,
      salePrice: true,
      costPrice: true,
      stockMin: true,
      stockCurrent: true,
      isActive: true,
    },
  });

  if (!product) {
    return (
      <main className="page-card">
        <h1 style={{ fontSize: 22, fontWeight: 900 }}>Producto no encontrado</h1>
      </main>
    );
  }

  return (
    <EditProductClient
      product={{
        ...product,
        salePrice: Number(product.salePrice),
        costPrice: Number(product.costPrice),
      }}
    />
  );
}
