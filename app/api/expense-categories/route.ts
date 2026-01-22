import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { Role } from "@prisma/client";

const CategoryCreateSchema = z.object({
  name: z.string().trim().min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId as string;

  const cats = await prisma.expenseCategory.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return NextResponse.json(cats);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session as any).role as Role;
  if (!(role === "ADMIN" || role === "OWNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId as string;

  const raw = await req.json().catch(() => null);
  const parsed = CategoryCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.format() }, { status: 400 });
  }

  const created = await prisma.expenseCategory.create({
    data: { organizationId, name: parsed.data.name },
    select: { id: true, name: true },
  });

  return NextResponse.json(created, { status: 201 });
}
