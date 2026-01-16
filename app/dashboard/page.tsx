import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { clp } from "@/lib/money";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const organizationId = (session as any).organizationId as string;

  const since30 = daysAgo(30);
  const since7 = daysAgo(7);

  const [products, sales30, expenses30, sales7, lowStockCount] = await Promise.all([
    prisma.product.findMany({
      where: { organizationId, isActive: true },
      select: { stockCurrent: true, stockMin: true },
    }),
    prisma.sale.findMany({
      where: { organizationId, dateTime: { gte: since30 } },
      select: { total: true },
    }),
    prisma.expense.findMany({
      where: { organizationId, date: { gte: since30 } },
      select: { amount: true },
    }),
    prisma.sale.findMany({
      where: { organizationId, dateTime: { gte: since7 } },
      select: { total: true },
    }),
    prisma.product
      .findMany({
        where: { organizationId, isActive: true },
        select: { stockCurrent: true, stockMin: true },
      })
      .then((ps) => ps.filter((p) => p.stockCurrent <= p.stockMin).length),
  ]);

  const totalSales30 = sales30.reduce((a, s) => a + Number(s.total), 0);
  const totalExpenses30 = expenses30.reduce((a, e) => a + Number(e.amount), 0);
  const totalSales7 = sales7.reduce((a, s) => a + Number(s.total), 0);

  const avgSalesDay30 = totalSales30 / 30;
  const avgExpensesDay30 = totalExpenses30 / 30;

  const forecastSales7 = avgSalesDay30 * 7;
  const forecastSales30 = avgSalesDay30 * 30;

  const forecastExpenses7 = avgExpensesDay30 * 7;
  const forecastExpenses30 = avgExpensesDay30 * 30;

  const cashRisk7 = forecastSales7 < forecastExpenses7;
  const cashRisk30 = forecastSales30 < forecastExpenses30;

  const productCount = products.length;

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>Dashboard</h1>
      <p style={{ marginTop: 6, opacity: 0.8 }}>
        Resumen últimos 30 días + proyección simple (promedio diario)
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          marginTop: 16,
        }}
      >
        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <div style={{ opacity: 0.8 }}>Productos</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{productCount}</div>
          <div style={{ marginTop: 6, fontSize: 13, color: lowStockCount > 0 ? "crimson" : undefined }}>
            Bajo mínimo: {lowStockCount}
          </div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <div style={{ opacity: 0.8 }}>Ventas (30 días)</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{clp(totalSales30)}</div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
            Ventas (7 días): {clp(totalSales7)}
          </div>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <div style={{ opacity: 0.8 }}>Gastos (30 días)</div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>{clp(totalExpenses30)}</div>
          <div style={{ marginTop: 6, fontSize: 13, opacity: 0.8 }}>
            Prom. gasto diario: {clp(avgExpensesDay30)}
          </div>
        </div>
      </div>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Predicción (heurística)</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
            marginTop: 12,
          }}
        >
          <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 800 }}>Próximos 7 días</div>
            <div style={{ marginTop: 8 }}>
              Ventas estimadas: <b>{clp(forecastSales7)}</b>
            </div>
            <div>
              Gastos estimados: <b>{clp(forecastExpenses7)}</b>
            </div>
            <div style={{ marginTop: 8, color: cashRisk7 ? "crimson" : "green" }}>
              {cashRisk7 ? "Riesgo: ventas < gastos" : "OK: ventas ≥ gastos"}
            </div>
          </div>

          <div style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
            <div style={{ fontWeight: 800 }}>Próximos 30 días</div>
            <div style={{ marginTop: 8 }}>
              Ventas estimadas: <b>{clp(forecastSales30)}</b>
            </div>
            <div>
              Gastos estimados: <b>{clp(forecastExpenses30)}</b>
            </div>
            <div style={{ marginTop: 8, color: cashRisk30 ? "crimson" : "green" }}>
              {cashRisk30 ? "Riesgo: ventas < gastos" : "OK: ventas ≥ gastos"}
            </div>
          </div>
        </div>

        <p style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
          * Proyección basada en promedio diario de los últimos 30 días.
        </p>
      </section>

      <div style={{ marginTop: 22, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/sales" style={{ textDecoration: "underline" }}>Ventas</Link>
        <Link href="/sales/new" style={{ textDecoration: "underline" }}>Nueva venta</Link>
        <Link href="/expenses" style={{ textDecoration: "underline" }}>Gastos</Link>
        <Link href="/inventory" style={{ textDecoration: "underline" }}>Inventario</Link>
        <Link href="/inventory/history" style={{ textDecoration: "underline" }}>Historial</Link>
        <Link href="/products" style={{ textDecoration: "underline" }}>Productos</Link>
      </div>
    </main>
  );
}
