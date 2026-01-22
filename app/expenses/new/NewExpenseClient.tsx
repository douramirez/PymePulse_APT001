"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Category = { id: string; name: string };

export default function NewExpenseClient({ categories }: { categories: Category[] }) {
  const router = useRouter();

  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [newCatName, setNewCatName] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasCats = useMemo(() => categories.length > 0, [categories.length]);

  async function createCategory() {
    setMsg(null);
    const name = newCatName.trim();
    if (!name) return;

    setLoading(true);
    const res = await fetch("/api/expense-categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d?.error ?? "No se pudo crear categoría");
      return;
    }

    const created = await res.json();
    setMsg("✅ Categoría creada. Recarga la página para verla en el listado.");
    setNewCatName("");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!categoryId) {
      setMsg("Debes seleccionar una categoría.");
      return;
    }
    if (!amount || amount <= 0) {
      setMsg("Monto inválido.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryId,
        amount,
        description: description.trim() || null,
        date,
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d?.error ?? "Error creando gasto");
      return;
    }

    setMsg("✅ Gasto creado.");
    router.push("/expenses");
  }

  return (
    <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div className="form-grid">
          <label className="field">
            <span>Fecha</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>

          <label className="field">
            <span>Categoría</span>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={!hasCats}
              style={{
                padding: 10,
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.18)",
                background: "rgba(255,255,255,0.9)",
                fontWeight: 700,
              }}
            >
              {hasCats ? (
                categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))
              ) : (
                <option value="">No hay categorías</option>
              )}
            </select>
          </label>

          <label className="field">
            <span>Monto</span>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </label>

          <label className="field">
            <span>Descripción</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
          </label>
        </div>

        <button className="btn primary" disabled={loading} type="submit">
          {loading ? "Guardando..." : "Crear gasto"}
        </button>
      </form>

      <div style={{ borderTop: "1px solid rgba(0,0,0,0.12)", paddingTop: 12 }}>
        <div style={{ fontWeight: 1000, marginBottom: 8 }}>Crear nueva categoría (opcional)</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Ej: Arriendo, Luz, Sueldos..."
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              fontWeight: 700,
            }}
          />
          <button className="btn" onClick={createCategory} disabled={loading} type="button">
            {loading ? "..." : "Crear"}
          </button>
        </div>
      </div>

      {msg && <p style={{ fontWeight: 800 }}>{msg}</p>}
    </div>
  );
}
