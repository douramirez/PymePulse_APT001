import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { canMoveInventory } from "@/lib/permissions";

const MoveSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["IN", "OUT", "ADJUST"]),
  quantity: z.coerce.number().positive(),
  reason: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session as any).role;
  if (!canMoveInventory(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId;
  const userId = (session as any).userId;

  const raw = await req.json().catch(() => null);
  const parsed = MoveSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { productId, type, quantity, reason } = parsed.data;

  const result = await prisma.$transaction(async (tx) => {
    const exists = await tx.product.findFirst({
      where: { id: productId, organizationId, isActive: true },
      select: { id: true },
    });

    if (!exists) {
      return { error: "Producto no encontrado", status: 404 as const };
    }

    if (type === "OUT") {
      const updated = await tx.product.updateMany({
        where: {
          id: productId,
          organizationId,
          isActive: true,
          stockCurrent: { gte: quantity },
        },
        data: { stockCurrent: { decrement: quantity } },
      });

      if (updated.count === 0) {
        return { error: "Stock insuficiente", status: 400 as const };
      }
    } else if (type === "IN") {
      await tx.product.updateMany({
        where: { id: productId, organizationId, isActive: true },
        data: { stockCurrent: { increment: quantity } },
      });
    } else {
      await tx.product.updateMany({
        where: { id: productId, organizationId, isActive: true },
        data: { stockCurrent: quantity },
      });
    }

    await tx.inventoryMovement.create({
      data: {
        organizationId,
        productId,
        type,
        quantity,
        reason,
        createdByUserId: userId,
      },
    });

    const updatedProduct = await tx.product.findUnique({
      where: { id: productId },
    });

    return { product: updatedProduct };
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.product);
}
