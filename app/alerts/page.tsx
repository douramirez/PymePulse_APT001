"use client";

import { useEffect, useState } from "react";

type Alert = {
  id: string;
  type: string;
  severity: string;
  message: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/alerts");
    const data = await res.json();
    setAlerts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function recalc() {
    await fetch("/api/alerts/recalculate", { method: "POST" });
    await load();
  }

  async function closeAlert(id: string) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Alertas</h1>
      <button onClick={recalc} style={{ marginTop: 12 }}>
        Recalcular riesgo de caja
      </button>

      {loading ? (
        <p style={{ marginTop: 12 }}>Cargando…</p>
      ) : alerts.length === 0 ? (
        <p style={{ marginTop: 12 }}>No hay alertas.</p>
      ) : (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {alerts.map((a) => (
            <div key={a.id} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>{a.type}</b>
                <span style={{ opacity: 0.8 }}>{a.status}</span>
              </div>
              <p style={{ marginTop: 6 }}>{a.message}</p>
              <p style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                {new Date(a.createdAt).toLocaleString()} — Severidad: {a.severity}
              </p>
              {a.status === "OPEN" && (
                <button onClick={() => closeAlert(a.id)} style={{ marginTop: 8 }}>
                  Cerrar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
