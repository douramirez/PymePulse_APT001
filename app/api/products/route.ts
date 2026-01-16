import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { canManageCatalog } from "@/lib/permissions";

const ProductCreateSchema = z.object({
  name: z.string().min(1),
  salePrice: z.coerce.number().nonnegative().default(0),
  costPrice: z.coerce.number().nonnegative().default(0),
  stockMin: z.coerce.number().int().nonnegative().default(0),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId;

  const products = await prisma.product.findMany({
    where: { organizationId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session as any).role;
  if (!canManageCatalog(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId;

  const raw = await req.json().catch(() => null);
  const parsed = ProductCreateSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { name, salePrice, costPrice, stockMin } = parsed.data;

  const created = await prisma.product.create({
    data: {
      organizationId,
      name,
      salePrice: salePrice as any,
      costPrice: costPrice as any,
      stockMin,
      stockCurrent: 0,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
