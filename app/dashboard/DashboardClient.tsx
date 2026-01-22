"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar,
} from "recharts";

type Sale = {
  id: string;
  dateTime: string | Date;
  total: number;
  paymentMethod: string;
  createdBy?: { name: string | null; email: string | null } | null;
};

type Expense = {
  id: string;
  date: string | Date;
  amount: number;
  description?: string | null;
  category?: { name: string } | null;
  createdBy?: { name: string | null; email: string | null } | null;
};

type Alert = {
  id: string;
  type: string;
  severity: string;
  message: string;
  status: string;
  createdAt: string | Date;
};

type TopItem = { productId: string; quantity: number };
type Product = { id: string; name: string; sku: string | null; imageUrl: string | null };

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
}

export default function DashboardClient({
  sales,
  expenses,
  alerts,
  topItems,
  topProducts,
}: {
  sales: Sale[];
  expenses: Expense[];
  alerts: Alert[];
  topItems: TopItem[];
  topProducts: Product[];
}) {
  const [range, setRange] = useState<7 | 30 | 90>(30);

  const from = useMemo(() => daysAgo(range), [range]);

  const filteredSales = useMemo(
    () => sales.filter(s => new Date(s.dateTime) >= from),
    [sales, from]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter(e => new Date(e.date) >= from),
    [expenses, from]
  );

  const kpis = useMemo(() => {
    const salesTotal = filteredSales.reduce((a, s) => a + s.total, 0);
    const expensesTotal = filteredExpenses.reduce((a, e) => a + e.amount, 0);
    const profit = salesTotal - expensesTotal;

    // Ticket promedio (si hay ventas)
    const avgTicket = filteredSales.length ? salesTotal / filteredSales.length : 0;

    return { salesTotal, expensesTotal, profit, avgTicket };
  }, [filteredSales, filteredExpenses]);

  // Serie diaria (ventas vs gastos)
  const series = useMemo(() => {
    const map = new Map<string, { day: string; sales: number; expenses: number }>();

    for (let i = range - 1; i >= 0; i--) {
      const d = daysAgo(i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, { day: fmtDay(d), sales: 0, expenses: 0 });
    }

    filteredSales.forEach(s => {
      const d = new Date(s.dateTime);
      const key = d.toISOString().slice(0, 10);
      const row = map.get(key);
      if (row) row.sales += s.total;
    });

    filteredExpenses.forEach(e => {
      const d = new Date(e.date);
      const key = d.toISOString().slice(0, 10);
      const row = map.get(key);
      if (row) row.expenses += e.amount;
    });

    return Array.from(map.values());
  }, [filteredSales, filteredExpenses, range]);

  // Top vendidos (filtra con lo que venga en topItems 90d; para demo sirve)
  const topMap = useMemo(() => new Map(topProducts.map(p => [p.id, p])), [topProducts]);
  const topList = useMemo(() => {
    return topItems
      .slice(0, 6)
      .map(t => ({ ...t, product: topMap.get(t.productId) }))
      .filter(x => x.product);
  }, [topItems, topMap]);

  // Actividad reciente (mezcla ventas/gastos)
  const activity = useMemo(() => {
    const salesAct = filteredSales.slice(0, 6).map(s => ({
      type: "VENTA" as const,
      at: new Date(s.dateTime),
      title: `Venta (${s.paymentMethod})`,
      amount: s.total,
      meta: s.createdBy?.name ?? s.createdBy?.email ?? "—",
      href: `/sales/${s.id}`,
    }));

    const expAct = filteredExpenses.slice(0, 6).map(e => ({
      type: "GASTO" as const,
      at: new Date(e.date),
      title: `Gasto (${e.category?.name ?? "Sin categoría"})`,
      amount: e.amount,
      meta: e.createdBy?.name ?? e.createdBy?.email ?? "—",
      href: `/expenses`,
    }));

    return [...salesAct, ...expAct]
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 8);
  }, [filteredSales, filteredExpenses]);

  return (
    <>
      {/* Selector */}
      <div className="dash-toolbar">
        <div className="segmented">
          <button className={`seg ${range === 7 ? "on" : ""}`} onClick={() => setRange(7)}>7d</button>
          <button className={`seg ${range === 30 ? "on" : ""}`} onClick={() => setRange(30)}>30d</button>
          <button className={`seg ${range === 90 ? "on" : ""}`} onClick={() => setRange(90)}>90d</button>
        </div>

        <div className="mini-kpi">
          <span className="muted">Ticket prom.</span>
          <span className="strong">${Math.round(kpis.avgTicket).toLocaleString("es-CL")}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="dash-grid-pro">
        <div className="card kpi-card">
          <div className="kpi-label">Ventas ({range}d)</div>
          <div className="kpi-val">${Math.round(kpis.salesTotal).toLocaleString("es-CL")}</div>
          <div className="kpi-sub muted">{filteredSales.length} ventas</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-label">Gastos ({range}d)</div>
          <div className="kpi-val">${Math.round(kpis.expensesTotal).toLocaleString("es-CL")}</div>
          <div className="kpi-sub muted">{filteredExpenses.length} gastos</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-label">Utilidad</div>
          <div className={`kpi-val ${kpis.profit < 0 ? "neg" : "pos"}`}>
            {kpis.profit < 0 ? "-" : ""}${Math.abs(Math.round(kpis.profit)).toLocaleString("es-CL")}
          </div>
          <div className="kpi-sub muted">(Ventas - Gastos)</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-label">Alertas abiertas</div>
          <div className="kpi-val">{alerts.length}</div>
          <div className="kpi-sub muted">Stock / Caja</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dash-panels-pro">
        <section className="card panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Tendencia ventas vs gastos</div>
              <div className="muted">Serie diaria ({range} días)</div>
            </div>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={series}>
                <XAxis dataKey="day" tickMargin={8} />
                <YAxis tickMargin={8} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" fillOpacity={0.18} />
                <Area type="monotone" dataKey="expenses" fillOpacity={0.18} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Top productos vendidos</div>
              <div className="muted">Ranking (90d base)</div>
            </div>
            <Link className="btn" href="/products">Ver productos</Link>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <BarChart
                data={topList.map(x => ({ name: x.product!.name.slice(0, 14), qty: x.quantity }))}
              >
                <XAxis dataKey="name" tickMargin={8} />
                <YAxis tickMargin={8} />
                <Tooltip />
                <Bar dataKey="qty" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Activity + Alerts */}
      <div className="dash-panels-pro" style={{ marginTop: 14 }}>
        <section className="card panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Actividad reciente</div>
              <div className="muted">Últimos movimientos</div>
            </div>
          </div>

          <div className="list-pro">
            {activity.map((a, idx) => (
              <Link key={idx} className="row-pro" href={a.href}>
                <div className="left">
                  <span className={`pill ${a.type === "VENTA" ? "ok" : "warn"}`}>{a.type}</span>
                  <div>
                    <div className="strong">{a.title}</div>
                    <div className="muted small">{a.at.toLocaleString("es-CL")} • {a.meta}</div>
                  </div>
                </div>
                <div className="strong">${Math.round(a.amount).toLocaleString("es-CL")}</div>
              </Link>
            ))}

            {activity.length === 0 && <div className="muted">Sin actividad en este rango.</div>}
          </div>
        </section>

        <section className="card panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Alertas</div>
              <div className="muted">Abiertas</div>
            </div>
            <Link className="btn" href="/alerts">Ver todas</Link>
          </div>

          <div className="list-pro">
            {alerts.map(a => (
              <div key={a.id} className="row-pro static">
                <div className="left">
                  <span className={`pill ${a.severity === "ALTA" ? "danger" : "warn"}`}>{a.type}</span>
                  <div>
                    <div className="strong">{a.message}</div>
                    <div className="muted small">{new Date(a.createdAt).toLocaleString("es-CL")}</div>
                  </div>
                </div>
                <span className={`chip ${a.severity === "ALTA" ? "danger" : "ok"}`}>{a.severity}</span>
              </div>
            ))}
            {alerts.length === 0 && <div className="muted">No hay alertas abiertas 🎉</div>}
          </div>
        </section>
      </div>
    </>
  );
}
