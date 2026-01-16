"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = { id: string; name: string; stockCurrent: number };

export default function NewSalePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  function addItem() {
    setItems([...items, { productId: "", quantity: 1 }]);
  }

  function updateItem(i: number, field: string, value: any) {
    const copy = [...items];
    (copy[i] as any)[field] = value;
    setItems(copy);
  }

  async function submit() {
    setError(null);
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error ?? "Error creando venta");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800 }}>Nueva venta</h1>

      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <select
            value={it.productId}
            onChange={(e) => updateItem(i, "productId", e.target.value)}
          >
            <option value="">Producto…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (stock {p.stockCurrent})
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={it.quantity}
            onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
          />
        </div>
      ))}

      <div style={{ marginTop: 16 }}>
        <button onClick={addItem}>+ Agregar producto</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={submit}>Registrar venta</button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
