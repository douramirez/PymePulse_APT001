"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function MoveInventoryPage() {
  const params = useSearchParams();
  const router = useRouter();

  const productId = params.get("productId") || "";
  const type = (params.get("type") || "IN").toUpperCase();

  const title = useMemo(() => (type === "OUT" ? "Registrar salida" : "Registrar entrada"), [type]);

  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/inventory/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, type, quantity, reason }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Error registrando movimiento");
      return;
    }

    router.push("/inventory");
  }

  return (
    <main style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>{title}</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Cantidad
          <input
            type="number"
            value={quantity}
            min={1}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          Motivo (opcional)
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Compra, merma, ajuste, etc."
            style={{ padding: 10, border: "1px solid #ccc", borderRadius: 8 }}
          />
        </label>

        <button
          disabled={loading || !productId}
          type="submit"
          style={{ padding: 10, borderRadius: 8, border: "1px solid #000", fontWeight: 600 }}
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
        {!productId && <p style={{ color: "crimson" }}>Falta productId en la URL.</p>}
      </form>
    </main>
  );
}
