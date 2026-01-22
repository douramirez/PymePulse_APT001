import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { PaymentMethod, Role } from "@prisma/client";


const SaleCreateSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.OTHER),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.coerce.number().int().positive(),
        unitPrice: z.coerce.number().nonnegative(), // lo mandamos desde UI (salePrice)
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session as any).role as Role;

  // ✅ Si no tienes canCreateSales, comenta esto y usa el fallback de abajo
  //if (typeof canCreateSales === "function" && !canCreateSales(role)) {
    //return NextResponse.json({ error: "Forbidden" }, { status: 403 });
 // }
  // Fallback simple si no existe canCreateSales:
   if (!(role === "ADMIN" || role === "STAFF" || role === "OWNER")) {
     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
   }

  const organizationId = (session as any).organizationId as string;
  const userId = (session as any).userId as string;

  const raw = await req.json().catch(() => null);
  const parsed = SaleCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.format() }, { status: 400 });
  }

  const { paymentMethod, items } = parsed.data;

  // 1) Traer productos y validar organización
  const ids = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, organizationId, isActive: true },
    select: { id: true, name: true, stockCurrent: true, stockMin: true },
  });

  const map = new Map(products.map((p) => [p.id, p]));
  for (const i of items) {
    const p = map.get(i.productId);
    if (!p) return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
    if (p.stockCurrent - i.quantity < 0) {
      return NextResponse.json({ error: `Stock insuficiente: ${p.name}` }, { status: 400 });
    }
  }

  // 2) Total
  const total = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);

  // 3) Transacción: sale + saleItems + movimientos + update stock
  const result = await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        organizationId,
        paymentMethod,
        total: total as any,
        createdByUserId: userId,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.unitPrice as any,
            lineTotal: (i.quantity * i.unitPrice) as any,
          })),
        },
      },
      select: { id: true },
    });

    for (const i of items) {
      const p = map.get(i.productId)!;

      // movimiento OUT
      await tx.inventoryMovement.create({
        data: {
          organizationId,
          productId: i.productId,
          type: "OUT",
          quantity: i.quantity,
          reason: `Venta ${sale.id}`,
          createdByUserId: userId,
        },
      });

      const newStock = p.stockCurrent - i.quantity;

      await tx.product.update({
        where: { id: i.productId },
        data: { stockCurrent: newStock },
      });

      // alerta stock bajo
      if (newStock <= p.stockMin) {
        await tx.alert.create({
          data: {
            organizationId,
            type: "LOW_STOCK",
            severity: "MEDIA",
            message: `Stock bajo: ${p.name} (${newStock})`,
          },
        });
      }
    }

    return sale;
  });

  return NextResponse.json({ ok: true, saleId: result.id }, { status: 201 });
}
