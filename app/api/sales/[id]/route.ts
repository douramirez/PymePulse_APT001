import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId as string;
  const id = ctx.params.id;

  const sale = await prisma.sale.findUnique({
    where: { id },
    select: {
      id: true,
      dateTime: true,
      paymentMethod: true,
      total: true,
      createdBy: { select: { name: true, email: true } },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          lineTotal: true,
          product: { select: { name: true, sku: true } },
        },
      },
    },
  });

  if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // seguridad multi-tenant
  const orgCheck = await prisma.sale.findFirst({ where: { id, organizationId }, select: { id: true } });
  if (!orgCheck) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...sale,
    total: Number(sale.total),
    items: sale.items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
    })),
  });
}
