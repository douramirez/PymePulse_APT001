import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import { Role } from "@prisma/client";

const Schema = z.object({
  organizationName: z.string().min(2),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = Schema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { organizationName, ownerName, password } = parsed.data;
  const email = parsed.data.email.toLowerCase().trim();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "Ese email ya existe" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name: organizationName.trim() },
      select: { id: true, name: true },
    });

    const user = await tx.user.create({
      data: {
        organizationId: org.id,
        name: ownerName.trim(),
        email,
        passwordHash,
        role: Role.OWNER,
        // isActive tiene default true, pero si quieres explícito:
        // isActive: true,
      },
      select: { id: true, email: true, role: true, organizationId: true },
    });

    return { org, user };
  });

  return NextResponse.json(created, { status: 201 });
}
