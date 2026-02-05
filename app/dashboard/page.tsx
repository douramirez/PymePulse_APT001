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
  const from90 = daysAgo(90);

  // ✅ Ventas recientes (actividad + ticket)
  const sales = await prisma.sale.findMany({
    where: { organizationId, dateTime: { gte: from90 } },
    orderBy: { dateTime: "desc" },
    take: 400,
    select: {
      id: true,
      dateTime: true,
      total: true,
      paymentMethod: true,
      createdBy: { select: { name: true, email: true } },
    },
  });

  // ✅ Alertas abiertas
  const alerts = await prisma.alert.findMany({
    where: { organizationId, status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, type: true, severity: true, message: true, createdAt: true, status: true },
  });

  // ✅ Categorías de productos (para filtro Top)
  const categories = await prisma.productCategory.findMany({
    where: { organizationId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // ✅ Ventas por día (90d)
  // OJO: groupBy por dateTime agrupa por timestamp exacto.
  // Para dashboard, construiremos la serie diaria iterando días y sumando desde las ventas ya traídas (simple y robusto).
  const salesByDayMap = new Map<string, number>();
  for (const s of sales) {
    const key = new Date(s.dateTime).toISOString().slice(0, 10);
    salesByDayMap.set(key, (salesByDayMap.get(key) ?? 0) + Number(s.total));
  }

  // ✅ Ganancia por día usando SaleItem.lineProfit (90d)
  // Traemos ganancias por saleId y luego las asignamos al día de esa venta usando "sales" ya cargadas.
  const profitBySale = await prisma.saleItem.groupBy({
    by: ["saleId"],
    where: { sale: { organizationId, dateTime: { gte: from90 } } },
    _sum: { lineProfit: true },
  });

  const saleDayById = new Map<string, string>();
  for (const s of sales) {
    saleDayById.set(s.id, new Date(s.dateTime).toISOString().slice(0, 10));
  }

  const profitByDayMap = new Map<string, number>();
  for (const p of profitBySale) {
    const day = saleDayById.get(p.saleId);
    if (!day) continue;
    profitByDayMap.set(day, (profitByDayMap.get(day) ?? 0) + Number(p._sum.lineProfit ?? 0));
  }

  // ✅ Serie diaria completa (90d)
  const dailyMetrics: { day: string; sales: number; profit: number }[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().slice(0, 10);
    dailyMetrics.push({
      day: key,
      sales: salesByDayMap.get(key) ?? 0,
      profit: profitByDayMap.get(key) ?? 0,
    });
  }

  return (
    <main className="page-card">
      <div className="dash-head">
        <div>
          <h1 className="h1">Dashboard</h1>
          <p className="muted">Indicadores financieros y operación</p>
        </div>

        <div className="dash-actions">
          <Link className="btn" href="/sales/new">
            + Venta
          </Link>
          <Link className="btn" href="/products">
            Productos
          </Link>
        </div>
      </div>

      <DashboardClient
        sales={sales.map((s) => ({ ...s, total: Number(s.total) }))}
        alerts={alerts}
        dailyMetrics={dailyMetrics}
        categories={categories}
        initialTopRange={90}
      />
    </main>
  );
}
