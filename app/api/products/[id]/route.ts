import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { canManageCatalog } from "@/lib/permissions";
import { Role } from "@prisma/client";

const ProductUpdateSchema = z.object({
  name: z.string().min(1),
  sku: z.string().trim().min(1).optional().nullable(),
  imageUrl: z.string().trim().url().optional().nullable(),
  unit: z.string().trim().min(1).optional().nullable(),
  salePrice: z.coerce.number().nonnegative().default(0),
  costPrice: z.coerce.number().nonnegative().default(0),
  stockMin: z.coerce.number().int().nonnegative().default(0),
  stockCurrent: z.coerce.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...product,
    salePrice: Number(product.salePrice),
    costPrice: Number(product.costPrice),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session as any).role as Role;
  if (!canManageCatalog(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId as string;
  const { id } = await params;

  const raw = await req.json().catch(() => null);
  const parsed = ProductUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const {
    name,
    sku,
    imageUrl,
    unit,
    salePrice,
    costPrice,
    stockMin,
    stockCurrent,
    isActive,
  } = parsed.data;

  const target = await prisma.product.findFirst({
    where: { id, organizationId },
    select: { id: true },
  });

  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: name.trim(),
      sku: sku ? sku.trim() : null,
      imageUrl: imageUrl ? imageUrl.trim() : null,
      unit: unit ? unit.trim() : null,
      salePrice: salePrice as any,
      costPrice: costPrice as any,
      stockMin,
      stockCurrent,
      isActive,
    },
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

  return NextResponse.json({
    ...updated,
    salePrice: Number(updated.salePrice),
    costPrice: Number(updated.costPrice),
  });
}
