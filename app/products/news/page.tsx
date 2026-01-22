"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sku, setSku] = useState(""); // barcode
  const [imageUrl, setImageUrl] = useState("");
  const [unit, setUnit] = useState("unidad");
  const [costPrice, setCostPrice] = useState(0);
  const [salePrice, setSalePrice] = useState(0);
  const [stockMin, setStockMin] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        sku: sku.trim() || null,
        imageUrl: imageUrl.trim() || null,
        unit,
        costPrice,
        salePrice,
        stockMin,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error ?? "Error creando producto");
      return;
    }

    router.push("/products");
  }

  return (
    <main className="page-card" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Nuevo producto</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <div className="form-grid">
          <label className="field">
            <span>Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Bebida 1.5L" />
          </label>

          <label className="field">
            <span>Código de barras (SKU/EAN)</span>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Ej: 7801234567890"
            />
          </label>

          <label className="field">
            <span>Imagen (URL)</span>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </label>

          <label className="field">
            <span>Unidad</span>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="unidad/kg/lt" />
          </label>

          <label className="field">
            <span>Precio costo</span>
            <input type="number" value={costPrice} onChange={(e) => setCostPrice(Number(e.target.value))} />
          </label>

          <label className="field">
            <span>Precio venta</span>
            <input type="number" value={salePrice} onChange={(e) => setSalePrice(Number(e.target.value))} />
          </label>

          <label className="field">
            <span>Stock mínimo</span>
            <input type="number" value={stockMin} onChange={(e) => setStockMin(Number(e.target.value))} />
          </label>
        </div>

        {imageUrl?.trim() && (
          <div className="preview">
            <div className="preview-label">Vista previa</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="preview" />
          </div>
        )}

        <button className="btn primary" disabled={loading} type="submit">
          {loading ? "Guardando..." : "Crear producto"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </main>
  );
}
