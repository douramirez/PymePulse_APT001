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

  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId },
  });

  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  let next = product.stockCurrent;
  if (type === "IN") next += quantity;
  if (type === "OUT") next -= quantity;
  if (type === "ADJUST") next = quantity;

  if (next < 0) {
    return NextResponse.json({ error: "Stock negativo" }, { status: 400 });
  }

  await prisma.inventoryMovement.create({
    data: {
      organizationId,
      productId,
      type,
      quantity,
      reason,
      createdByUserId: userId,
    },
  });

  const updated = await prisma.product.update({
    where: { id: productId },
    data: { stockCurrent: next },
  });

  return NextResponse.json(updated);
}
