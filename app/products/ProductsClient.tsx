"use client";

import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  unit: string | null;
  salePrice: number;        // ✅ ya viene convertido desde el server
  stockCurrent: number;
  stockMin: number;
};

export default function ProductsClient({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(s) ||
        (p.sku?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [q, products]);

  return (
    <>
      {/* Buscador (sirve para escáner: el lector “escribe” y puedes dar Enter) */}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o escanear código (SKU/EAN)..."
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            fontWeight: 700,
          }}
        />
        <button
          onClick={() => setQ("")}
          className="btn"
          style={{ padding: "10px 12px", borderRadius: 12 }}
        >
          Limpiar
        </button>
      </div>

      {/* Grid */}
      <div className="products-grid" style={{ marginTop: 16 }}>
        {filtered.map((p) => {
          const low = p.stockCurrent <= p.stockMin;

          return (
            <div key={p.id} className="product-card">
              <div className="product-img">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} />
                ) : (
                  <div className="product-img-placeholder">Sin imagen</div>
                )}
              </div>

              <div className="product-body">
                <div className="product-title">{p.name}</div>

                <div className="product-meta">
                  <span className="chip">{p.unit ?? "unidad"}</span>
                  {p.sku && <span className="chip">SKU: {p.sku}</span>}
                  {low ? (
                    <span className="chip danger">Stock bajo</span>
                  ) : (
                    <span className="chip ok">OK</span>
                  )}
                </div>

                <div className="product-row">
                  <div>
                    <div className="muted">Stock</div>
                    <div className="strong">
                      {p.stockCurrent}{" "}
                      <span className="muted">/ mín {p.stockMin}</span>
                    </div>
                  </div>

                  <div>
                    <div className="muted">Precio</div>
                    <div className="strong">
                      ${p.salePrice.toLocaleString("es-CL")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p style={{ marginTop: 16, opacity: 0.8 }}>
          No se encontraron productos con ese nombre/SKU.
        </p>
      )}
    </>
  );
}
