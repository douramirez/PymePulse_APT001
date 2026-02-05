import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const organizationId = (session as any).organizationId as string;

  const { searchParams } = new URL(req.url);
  const range = Number(searchParams.get("range") ?? "90");
  const metric = (searchParams.get("metric") ?? "PROFIT").toUpperCase();
  const categoryId = searchParams.get("categoryId");

  const safeRange = range === 7 || range === 30 || range === 90 ? range : 90;
  const from = daysAgo(safeRange);

  const orderBy =
    metric === "SALES"
      ? { _sum: { lineTotal: "desc" as const } }
      : metric === "QTY"
      ? { _sum: { quantity: "desc" as const } }
      : { _sum: { lineProfit: "desc" as const } };

  const grouped = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: {
      sale: { organizationId, dateTime: { gte: from } },
      product: categoryId && categoryId !== "ALL" ? { categoryId } : undefined,
    },
    _sum: { quantity: true, lineTotal: true, lineProfit: true },
    orderBy,
    take: 8,
  });

  const ids = grouped.map(g => g.productId);
  const products = ids.length
    ? await prisma.product.findMany({
        where: { organizationId, id: { in: ids } },
        select: { id: true, name: true },
      })
    : [];

  const pMap = new Map(products.map(p => [p.id, p.name]));

  const rows = grouped.map(g => ({
    productId: g.productId,
    name: pMap.get(g.productId) ?? "—",
    qty: Number(g._sum.quantity ?? 0),
    sales: Number(g._sum.lineTotal ?? 0),
    profit: Number(g._sum.lineProfit ?? 0),
  }));

  return NextResponse.json({ rows });
}
