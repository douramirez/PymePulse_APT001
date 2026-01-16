import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";

const ExpenseCreateSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive(),
  description: z.string().optional(),
  date: z.string().optional(), // yyyy-mm-dd
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId as string;

  const expenses = await prisma.expense.findMany({
    where: { organizationId },
    orderBy: { date: "desc" },
    take: 100,
    include: {
      category: { select: { name: true } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId as string;
  const userId = (session as any).userId as string;

  const raw = await req.json().catch(() => null);
  const parsed = ExpenseCreateSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { categoryId, amount, description, date } = parsed.data;

  const created = await prisma.expense.create({
    data: {
      organizationId,
      categoryId,
      amount: amount as any,
      description: description?.trim() || null,
      date: date ? new Date(date) : new Date(),
      createdByUserId: userId,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
