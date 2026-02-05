"use client";

import { useEffect, useMemo, useState } from "react";
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

type Alert = {
  id: string;
  type: string;
  severity: string;
  message: string;
  status: string;
  createdAt: string | Date;
};

type DailyMetric = { day: string; sales: number; profit: number };

type Category = { id: string; name: string };

type TopRow = {
  productId: string;
  name: string;
  qty: number;
  sales: number;
  profit: number;
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDay(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" });
}

export default function DashboardClient({
  sales,
  alerts,
  dailyMetrics,
  categories,
  initialTopRange,
}: {
  sales: Sale[];
  alerts: Alert[];
  dailyMetrics: DailyMetric[];
  categories: Category[];
  initialTopRange: 7 | 30 | 90;
}) {
  const [range, setRange] = useState<7 | 30 | 90>(30);

  // Top filters
  const [topRange, setTopRange] = useState<7 | 30 | 90>(initialTopRange);
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [metric, setMetric] = useState<"PROFIT" | "SALES" | "QTY">("PROFIT");

  const [topRows, setTopRows] = useState<TopRow[]>([]);
  const [loadingTop, setLoadingTop] = useState(false);

  const from = daysAgo(range);

  const metrics = useMemo(() => {
    return dailyMetrics.filter(m => new Date(m.day) >= from);
  }, [dailyMetrics, from]);

  const kpis = useMemo(() => {
    const salesTotal = metrics.reduce((a, m) => a + m.sales, 0);
    const profitTotal = metrics.reduce((a, m) => a + m.profit, 0);
    const margin = salesTotal > 0 ? (profitTotal / salesTotal) * 100 : 0;
    return { salesTotal, profitTotal, margin };
  }, [metrics]);

  const avgTicket = useMemo(() => {
    const filtered = sales.filter(s => new Date(s.dateTime) >= from);
    return filtered.length ? kpis.salesTotal / filtered.length : 0;
  }, [sales, from, kpis.salesTotal]);

  async function loadTop() {
    setLoadingTop(true);
    try {
      const qs = new URLSearchParams({
        range: String(topRange),
        metric,
        categoryId,
      });
      const res = await fetch(`/api/dashboard/top-products?${qs.toString()}`);
      const data = await res.json();
      setTopRows(Array.isArray(data?.rows) ? data.rows : []);
    } finally {
      setLoadingTop(false);
    }
  }

  useEffect(() => {
    loadTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topRange, metric, categoryId]);

  const topValueKey = metric === "QTY" ? "qty" : metric === "SALES" ? "sales" : "profit";
  const topTitle = metric === "QTY" ? "Unidades" : metric === "SALES" ? "Ventas" : "Ganancia";

  return (
    <>
      {/* Selector principal */}
      <div className="dash-toolbar">
        <div className="segmented">
          {[7, 30, 90].map(r => (
            <button
              key={r}
              className={`seg ${range === r ? "on" : ""}`}
              onClick={() => setRange(r as any)}
            >
              {r}d
            </button>
          ))}
        </div>

        <div className="mini-kpi">
          <span className="muted">Ticket prom.</span>
          <span className="strong">${Math.round(avgTicket).toLocaleString("es-CL")}</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="dash-grid-pro">
        <div className="card kpi-card">
          <div className="kpi-label">Ventas</div>
          <div className="kpi-val">${Math.round(kpis.salesTotal).toLocaleString("es-CL")}</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-label">Ganancia</div>
          <div className="kpi-val">${Math.round(kpis.profitTotal).toLocaleString("es-CL")}</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-label">Margen</div>
          <div className="kpi-val">{kpis.margin.toFixed(1)}%</div>
        </div>

        <div className="card kpi-card">
          <div className="kpi-label">Alertas</div>
          <div className="kpi-val">{alerts.length}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dash-panels-pro">
        <section className="card panel">
          <div className="panel-title">Ventas vs Ganancia</div>
          <ResponsiveContainer height={260}>
            <AreaChart data={metrics}>
              <XAxis dataKey="day" tickFormatter={fmtDay} />
              <YAxis />
              <Tooltip />
              <Area dataKey="sales" fillOpacity={0.2} />
              <Area dataKey="profit" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="card panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div>
              <div className="panel-title">Top productos por {topTitle.toLowerCase()}</div>
              <div className="muted">Filtra por categoría</div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select value={topRange} onChange={(e) => setTopRange(Number(e.target.value) as any)} className="btn">
                <option value={7}>7d</option>
                <option value={30}>30d</option>
                <option value={90}>90d</option>
              </select>

              <select value={metric} onChange={(e) => setMetric(e.target.value as any)} className="btn">
                <option value="PROFIT">Ganancia</option>
                <option value="SALES">Ventas</option>
                <option value="QTY">Unidades</option>
              </select>

              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="btn">
                <option value="ALL">Todas</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ width: "100%", height: 260, marginTop: 8, opacity: loadingTop ? 0.6 : 1 }}>
            <ResponsiveContainer>
              <BarChart
                data={topRows.map(r => ({
                  name: r.name.slice(0, 14),
                  value: Math.round((r as any)[topValueKey]),
                }))}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {topRows.length === 0 && !loadingTop && (
            <div className="muted" style={{ marginTop: 8 }}>
              No hay datos para este filtro.
            </div>
          )}
        </section>
      </div>
    </>
  );
}
