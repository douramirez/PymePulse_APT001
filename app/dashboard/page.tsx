import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  // Traemos data suficiente para filtrar en el client sin refetch (90 días)
  const from90 = daysAgo(90);

  const sales = await prisma.sale.findMany({
    where: { organizationId, dateTime: { gte: from90 } },
    orderBy: { dateTime: "desc" },
    select: { id: true, dateTime: true, total: true, paymentMethod: true, createdBy: { select: { name: true, email: true } } },
    take: 300,
  });

  const expenses = await prisma.expense.findMany({
    where: { organizationId, date: { gte: from90 } },
    orderBy: { date: "desc" },
    select: { id: true, date: true, amount: true, description: true, category: { select: { name: true } }, createdBy: { select: { name: true, email: true } } },
    take: 300,
  });

  const alerts = await prisma.alert.findMany({
    where: { organizationId, status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, type: true, severity: true, message: true, createdAt: true, status: true },
  });

  // Top vendidos 90 días (para que el client filtre por rango)
  const topItems = await prisma.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { organizationId, dateTime: { gte: from90 } } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 8,
  });

  const topIds = topItems.map((t) => t.productId);
  const topProducts = topIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topIds }, organizationId },
        select: { id: true, name: true, sku: true, imageUrl: true },
      })
    : [];

  return (
    <main className="page-card">
      <div className="dash-head">
        <div>
          <h1 className="h1">Dashboard</h1>
          <p className="muted">Indicadores y actividad reciente</p>
        </div>

        <div className="dash-actions">
          <Link className="btn" href="/sales/new">+ Venta</Link>
          <Link className="btn" href="/expenses/new">+ Gasto</Link>
        </div>
      </div>

      <DashboardClient
        sales={sales.map(s => ({ ...s, total: Number(s.total) }))}
        expenses={expenses.map(e => ({ ...e, amount: Number(e.amount) }))}
        alerts={alerts}
        topItems={topItems.map(t => ({ productId: t.productId, quantity: Number(t._sum.quantity ?? 0) }))}
        topProducts={topProducts}
      />
    </main>
  );
}
