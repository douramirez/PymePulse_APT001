"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  unit: string | null;
  salePrice: number;
  costPrice: number;
  stockMin: number;
  stockCurrent: number;
  isActive: boolean;
};

export default function EditProductClient({ product }: { product: Product }) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [sku, setSku] = useState(product.sku ?? "");
  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const [unit, setUnit] = useState(product.unit ?? "unidad");
  const [costPrice, setCostPrice] = useState(product.costPrice);
  const [salePrice, setSalePrice] = useState(product.salePrice);
  const [stockMin, setStockMin] = useState(product.stockMin);
  const [stockCurrent, setStockCurrent] = useState(product.stockCurrent);
  const [isActive, setIsActive] = useState(product.isActive);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        sku: sku.trim() || null,
        imageUrl: imageUrl.trim() || null,
        unit: unit.trim() || null,
        costPrice,
        salePrice,
        stockMin,
        stockCurrent,
        isActive,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d?.error ?? "Error actualizando producto");
      return;
    }

    router.push("/products");
  }

  return (
    <main className="page-card" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 26, fontWeight: 900 }}>Editar producto</h1>

      <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <div className="form-grid">
          <label className="field">
            <span>Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label className="field">
            <span>Código de barras (SKU/EAN)</span>
            <input value={sku} onChange={(e) => setSku(e.target.value)} />
          </label>

          <label className="field">
            <span>Imagen (URL)</span>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </label>

          <label className="field">
            <span>Unidad</span>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} />
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

          <label className="field">
            <span>Stock actual</span>
            <input type="number" value={stockCurrent} onChange={(e) => setStockCurrent(Number(e.target.value))} />
          </label>

          <label className="field">
            <span>Activo</span>
            <select value={isActive ? "yes" : "no"} onChange={(e) => setIsActive(e.target.value === "yes")}>
              <option value="yes">Sí</option>
              <option value="no">No</option>
            </select>
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
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </main>
  );
}
