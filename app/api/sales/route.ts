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
        unitPrice: z.coerce.number().nonnegative(), // lo ignoramos (tomamos salePrice real del producto)
      })
    )
    .min(1),
});

// ✅ GET /api/sales  -> historial (últimas 50)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId as string;

  const sales = await prisma.sale.findMany({
    where: { organizationId },
    orderBy: { dateTime: "desc" },
    take: 50,
    select: {
      id: true,
      dateTime: true,
      paymentMethod: true,
      total: true, // Decimal
      createdBy: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  const plain = sales.map((s) => ({ ...s, total: Number(s.total) }));
  return NextResponse.json(plain);
}

// ✅ POST /api/sales -> crear venta (POS)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session as any).role as Role;
  if (!(role === "ADMIN" || role === "STAFF" || role === "OWNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId as string;

  // ✅ más robusto (depende de cómo lo estés seteando en next-auth)
  const userId =
    ((session as any).user?.id as string | undefined) ??
    ((session as any).userId as string | undefined);

  if (!userId) {
    return NextResponse.json({ error: "Session sin userId" }, { status: 400 });
  }

  const raw = await req.json().catch(() => null);
  const parsed = SaleCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { paymentMethod, items } = parsed.data;

  const ids = items.map((i) => i.productId);

  // ✅ trae costPrice para congelarlo en SaleItem
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, organizationId, isActive: true },
    select: {
      id: true,
      name: true,
      stockCurrent: true,
      stockMin: true,
      salePrice: true,
      costPrice: true,
    },
  });

  const map = new Map(products.map((p) => [p.id, p]));

  const itemsFixed = items.map((i) => {
    const p = map.get(i.productId);
    if (!p) return null;

    const unitPrice = Number(p.salePrice); // ignoramos el del client
    const unitCost = Number(p.costPrice ?? 0);

    return {
      productId: i.productId,
      quantity: i.quantity,
      unitPrice,
      unitCost,
      name: p.name,
      stockMin: p.stockMin,
    };
  });

  if (itemsFixed.some((i) => !i)) {
    return NextResponse.json({ error: "Producto inválido" }, { status: 400 });
  }

  const total = itemsFixed.reduce((acc, i) => acc + i!.quantity * i!.unitPrice, 0);

  let result: { id: string; receiptNumber: number | null };

  try {
    let attempts = 0;

    while (true) {
      attempts += 1;
      try {
        // ✅ TRANSACCIÓN CORRECTA
        result = await prisma.$transaction(
          async (tx) => {
            // siguiente número de boleta por org
            const last = await tx.sale.findFirst({
              where: { organizationId, receiptNumber: { not: null } },
              orderBy: { receiptNumber: "desc" },
              select: { receiptNumber: true },
            });

            const nextReceipt = (last?.receiptNumber ?? 0) + 1;

            // crear venta + items con unitCost y lineProfit
            const sale = await tx.sale.create({
              data: {
                organizationId,
                paymentMethod,
                total: total as any,
                createdByUserId: userId,
                receiptNumber: nextReceipt,
                items: {
                  create: itemsFixed.map((i) => ({
                    productId: i!.productId,
                    quantity: i!.quantity,
                    unitPrice: i!.unitPrice as any,
                    lineTotal: (i!.quantity * i!.unitPrice) as any,

                    // ✅ NUEVO
                    unitCost: i!.unitCost as any,
                    lineProfit: ((i!.unitPrice - i!.unitCost) * i!.quantity) as any,
                  })),
                },
              },
              select: { id: true, receiptNumber: true },
            });

            // stock + movimientos + alertas
            for (const i of itemsFixed) {
              const p = map.get(i!.productId)!;

              const updated = await tx.product.updateMany({
                where: {
                  id: i!.productId,
                  organizationId,
                  isActive: true,
                  stockCurrent: { gte: i!.quantity },
                },
                data: { stockCurrent: { decrement: i!.quantity } },
              });

              if (updated.count === 0) {
                throw new Error(`Stock insuficiente: ${p.name}`);
              }

              const fresh = await tx.product.findUnique({
                where: { id: i!.productId },
                select: { stockCurrent: true, stockMin: true, name: true },
              });

              await tx.inventoryMovement.create({
                data: {
                  organizationId,
                  productId: i!.productId,
                  type: "OUT",
                  quantity: i!.quantity,
                  reason: `Venta ${sale.id}`,
                  createdByUserId: userId,
                },
              });

              if (fresh && fresh.stockCurrent <= fresh.stockMin) {
                await tx.alert.create({
                  data: {
                    organizationId,
                    type: "LOW_STOCK",
                    severity: "MEDIA",
                    message: `Stock bajo: ${fresh.name} (${fresh.stockCurrent})`,
                  },
                });
              }
            }

            return sale;
          },
          { maxWait: 5000, timeout: 15000 }
        );

        break;
      } catch (err: any) {
        // Colisión boleta unique -> reintentar
        if (err?.code === "P2002" && attempts < 3) continue;
        throw err;
      }
    }
  } catch (e: any) {
    if (e instanceof Error && e.message.startsWith("Stock insuficiente")) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: e?.message ?? "Error creando venta" }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, saleId: result.id, receiptNumber: result.receiptNumber },
    { status: 201 }
  );
}
