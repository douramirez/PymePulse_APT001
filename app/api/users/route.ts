import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcrypt";
import { z } from "zod";
import { canManageCatalog } from "@/lib/permissions";
import { Role } from "@prisma/client";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "STAFF", "VIEWER"]),
  password: z.string().min(8),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionRole = (session as any).role;
  if (!canManageCatalog(sessionRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId as string;

  const users = await prisma.user.findMany({
    where: { organizationId},
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionRole = (session as any).role;
  if (!canManageCatalog(sessionRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId as string;

  const raw = await req.json().catch(() => null);
  const parsed = CreateUserSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Ese email ya existe" }, { status: 409 });
  }

  // Evitar múltiples OWNER por organización (opcional pero recomendado)
  if (parsed.data.role === "OWNER") {
    const ownerExists = await prisma.user.findFirst({
      where: { organizationId, role: "OWNER" as Role, isActive: true },
    });
    if (ownerExists) {
      return NextResponse.json({ error: "Ya existe un OWNER en esta organización" }, { status: 400 });
    }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const created = await prisma.user.create({
    data: {
      organizationId,
      name: parsed.data.name.trim(),
      email,
      role: parsed.data.role as Role,
      passwordHash,
      isActive: true,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(created, { status: 201 });
}
