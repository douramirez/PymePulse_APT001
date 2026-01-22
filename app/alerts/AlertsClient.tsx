"use client";

import { useMemo, useState } from "react";

type Alert = {
  id: string;
  type: string;
  severity: string;
  message: string;
  status: string;
  createdAt: string | Date;
};

export default function AlertsClient({ alerts }: { alerts: Alert[] }) {
  const [items, setItems] = useState<Alert[]>(alerts);
  const [filter, setFilter] = useState<"ALL" | "OPEN" | "CLOSED">("OPEN");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((a) => a.status === filter);
  }, [items, filter]);

  async function closeAlert(id: string) {
    setLoadingId(id);
    const res = await fetch(`/api/alerts/${id}`, { method: "PATCH" });
    setLoadingId(null);

    if (!res.ok) {
      alert("No se pudo cerrar la alerta");
      return;
    }

    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: "CLOSED" } : a)));
  }

  return (
    <>
      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <button className={`btn ${filter === "OPEN" ? "primary" : ""}`} onClick={() => setFilter("OPEN")}>
          Abiertas
        </button>
        <button className={`btn ${filter === "CLOSED" ? "primary" : ""}`} onClick={() => setFilter("CLOSED")}>
          Cerradas
        </button>
        <button className={`btn ${filter === "ALL" ? "primary" : ""}`} onClick={() => setFilter("ALL")}>
          Todas
        </button>
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {filtered.map((a) => {
          const created = new Date(a.createdAt).toLocaleString("es-CL");
          const sevClass = a.severity === "ALTA" ? "danger" : "ok";
          const isClosed = a.status === "CLOSED";

          return (
            <div key={a.id} className="alert-row">
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ fontWeight: 1000 }}>{a.type}</div>
                  <span className={`chip ${sevClass}`}>{a.severity}</span>
                  <span className="chip">{a.status}</span>
                </div>

                <div style={{ opacity: 0.85, marginTop: 4 }}>{a.message}</div>
                <div style={{ opacity: 0.6, fontSize: 12, marginTop: 4 }}>{created}</div>
              </div>

              {!isClosed ? (
                <button className="btn" onClick={() => closeAlert(a.id)} disabled={loadingId === a.id}>
                  {loadingId === a.id ? "..." : "Cerrar"}
                </button>
              ) : (
                <span style={{ fontWeight: 900, opacity: 0.7 }}>✅</span>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ opacity: 0.7 }}>
            No hay alertas para este filtro.
          </div>
        )}
      </div>
    </>
  );
}
