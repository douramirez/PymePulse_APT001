import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { canSell } from "@/lib/permissions";

const SaleSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      quantity: z.coerce.number().int().positive(),
    })
  ).min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId;

  const sales = await prisma.sale.findMany({
    where: { organizationId },
    orderBy: { dateTime: "desc" },
    include: {
      items: { include: { product: { select: { name: true } } } },
    },
  });

  return NextResponse.json(sales);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session as any).role;
  if (!canSell(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId;
  const userId = (session as any).userId;

  const raw = await req.json().catch(() => null);
  const parsed = SaleSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { items } = parsed.data;

  const sale = await prisma.$transaction(async (tx) => {
    let total = 0;

    for (const it of items) {
      const product = await tx.product.findFirst({
        where: { id: it.productId, organizationId },
      });

      if (!product || product.stockCurrent < it.quantity) {
        throw new Error("Stock insuficiente");
      }

      total += Number(product.salePrice) * it.quantity;
    }

    const sale = await tx.sale.create({
      data: {
        organizationId,
        total: total as any,
        createdByUserId: userId,
      },
    });

    for (const it of items) {
      await tx.product.update({
        where: { id: it.productId },
        data: { stockCurrent: { decrement: it.quantity } },
      });
    }

    return sale;
  });

  return NextResponse.json(sale, { status: 201 });
}
