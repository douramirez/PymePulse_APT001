import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { Role } from "@prisma/client";

const ExpenseCreateSchema = z.object({
  categoryId: z.string(),
  amount: z.coerce.number().positive(),
  description: z.string().trim().optional().nullable(),
  date: z.coerce.date().optional(), // si no mandas, usa now()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId as string;

  const expenses = await prisma.expense.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
    take: 50,
    select: {
      id: true,
      date: true,
      amount: true, // Decimal
      description: true,
      category: { select: { id: true, name: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(
    expenses.map((e) => ({
      ...e,
      amount: Number(e.amount),
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session as any).role as Role;
  if (!(role === "ADMIN" || role === "STAFF" || role === "OWNER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId as string;
  const userId = (session as any).userId as string;

  const raw = await req.json().catch(() => null);
  const parsed = ExpenseCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.format() }, { status: 400 });
  }

  const { categoryId, amount, description, date } = parsed.data;

  // validar que la categoría sea de la organización
  const cat = await prisma.expenseCategory.findUnique({ where: { id: categoryId } });
  if (!cat || cat.organizationId !== organizationId) {
    return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
  }

  const created = await prisma.expense.create({
    data: {
      organizationId,
      categoryId,
      amount: amount as any,
      description: description?.trim() || null,
      date: date ?? new Date(),
      createdByUserId: userId,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}
