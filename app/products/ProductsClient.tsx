"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

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
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    setPage(1);
  }, [q]);

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  function getPages() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    pages.add(safePage);
    pages.add(safePage - 1);
    pages.add(safePage + 1);
    return Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
  }

  return (
    <>
      <div className="products-toolbar">
        <div className="products-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o escanear código (SKU/EAN)..."
          />
          <button onClick={() => setQ("")} className="btn">
            Limpiar
          </button>
        </div>
        <div className="products-meta">
          <span className="chip">{filtered.length} productos</span>
          <span className="chip">Página {safePage} / {totalPages}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="products-grid" style={{ marginTop: 16 }}>
        {pageItems.map((p) => {
          const low = p.stockCurrent <= p.stockMin;

          return (
            <div key={p.id}>
              <div className="product-card">
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

              <div className="product-footer">
                <Link className="btn" href={`/products/${p.id}/edit`}>
                  Editar
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <div className="products-pagination">
        <button
          className="btn"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={safePage <= 1}
        >
          ←
        </button>

        {getPages().map((p, idx, arr) => {
          const prev = arr[idx - 1];
          const gap = prev && p - prev > 1;
          return (
            <span key={p} className="page-group">
              {gap && <span className="page-ellipsis">…</span>}
              <button
                className={`page-btn ${p === safePage ? "active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            </span>
          );
        })}

        <button
          className="btn"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage >= totalPages}
        >
          →
        </button>
      </div>

      {filtered.length === 0 && (
        <p style={{ marginTop: 16, opacity: 0.8 }}>
          No se encontraron productos con ese nombre/SKU.
        </p>
      )}
    </>
  );
}
