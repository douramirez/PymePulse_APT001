import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Role } from "@prisma/client";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session as any).role as Role;
  if (!(role === "ADMIN" || role === "OWNER" || role === "STAFF")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const organizationId = (session as any).organizationId as string;

  // ✅ NEXT: params viene como Promise
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // ✅ updateMany: multi-tenant + no WhereUnique drama
  const result = await prisma.alert.updateMany({
    where: { id, organizationId, status: "OPEN" },
    data: { status: "CLOSED" },
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, id, status: "CLOSED" });
}
