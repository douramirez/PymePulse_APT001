"use client";

import { useMemo, useRef, useState } from "react";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  imageUrl: string | null;
  unit: string | null;
  salePrice: number;
  stockCurrent: number;
};

type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  sku: string | null;
};

export default function SalesPOSClient({ products }: { products: Product[] }) {
  const [scan, setScan] = useState("");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "TRANSFER" | "OTHER">("OTHER");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scanRef = useRef<HTMLInputElement>(null);

  const productBySku = useMemo(() => {
    const m = new Map<string, Product>();
    for (const p of products) {
      if (p.sku) m.set(p.sku.toLowerCase(), p);
    }
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return products.slice(0, 20);
    return products
      .filter((p) => p.name.toLowerCase().includes(s) || (p.sku?.toLowerCase().includes(s) ?? false))
      .slice(0, 40);
  }, [products, query]);

  function addToCart(p: Product, qty = 1) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.productId === p.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      }
      return [
        ...prev,
        { productId: p.id, name: p.name, unitPrice: p.salePrice, quantity: qty, sku: p.sku },
      ];
    });
    setMsg(null);
  }

  function inc(id: string) {
    setCart((prev) => prev.map((i) => (i.productId === id ? { ...i, quantity: i.quantity + 1 } : i)));
  }
  function dec(id: string) {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }
  function remove(id: string) {
    setCart((prev) => prev.filter((i) => i.productId !== id));
  }

  const total = useMemo(() => cart.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0), [cart]);

  function onScanKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const code = scan.trim().toLowerCase();
    if (!code) return;

    const p = productBySku.get(code);
    if (!p) {
      setMsg("No encontrado: revisa el SKU/EAN.");
      setScan("");
      return;
    }

    addToCart(p, 1);
    setScan("");
    setMsg(`Agregado: ${p.name}`);
  }

  async function confirmSale() {
    setMsg(null);
    if (cart.length === 0) {
      setMsg("Carrito vacío.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentMethod,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setMsg(d?.error ?? "Error creando venta");
      return;
    }

    const d = await res.json().catch(() => ({}));
    setCart([]);
    setScan("");
    setQuery("");
    setMsg(`✅ Venta creada (${d.saleId}). Stock actualizado.`);
    scanRef.current?.focus();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 14, marginTop: 16 }}>
      {/* Left: buscador + listado */}
      <section style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            ref={scanRef}
            value={scan}
            onChange={(e) => setScan(e.target.value)}
            onKeyDown={onScanKeyDown}
            placeholder="Escanear SKU/EAN y Enter…"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              fontWeight: 800,
            }}
          />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.15)",
              fontWeight: 800,
            }}
          >
            <option value="OTHER">Otro</option>
            <option value="CASH">Efectivo</option>
            <option value="CARD">Tarjeta</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o SKU…"
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.15)",
            fontWeight: 700,
          }}
        />

        <div className="products-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => addToCart(p, 1)}
              className="product-card"
              style={{ textAlign: "left", cursor: "pointer" }}
            >
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
                  {p.sku && <span className="chip">SKU: {p.sku}</span>}
                  <span className="chip">{p.unit ?? "unidad"}</span>
                  <span className="chip">Stock: {p.stockCurrent}</span>
                </div>
                <div className="strong">${p.salePrice.toLocaleString("es-CL")}</div>
              </div>
            </button>
          ))}
        </div>

        {msg && <p style={{ marginTop: 6, fontWeight: 800 }}>{msg}</p>}
      </section>

      {/* Right: carrito */}
      <aside
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 16,
          padding: 12,
          background: "rgba(255,255,255,0.75)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 1000 }}>Carrito</div>
          <button className="btn" onClick={() => setCart([])}>
            Vaciar
          </button>
        </div>

        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          {cart.map((i) => (
            <div
              key={i.productId}
              style={{
                border: "1px solid rgba(0,0,0,0.10)",
                borderRadius: 14,
                padding: 10,
                background: "rgba(255,255,255,0.9)",
              }}
            >
              <div style={{ fontWeight: 1000 }}>{i.name}</div>
              <div style={{ opacity: 0.75, fontSize: 12 }}>
                {i.sku ? `SKU: ${i.sku}` : "Sin SKU"} • ${i.unitPrice.toLocaleString("es-CL")}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button className="btn" onClick={() => dec(i.productId)}>-</button>
                  <div style={{ fontWeight: 1000 }}>{i.quantity}</div>
                  <button className="btn" onClick={() => inc(i.productId)}>+</button>
                </div>
                <div style={{ fontWeight: 1000 }}>
                  ${(i.quantity * i.unitPrice).toLocaleString("es-CL")}
                </div>
              </div>

              <button className="btn" style={{ marginTop: 8, width: "100%" }} onClick={() => remove(i.productId)}>
                Quitar
              </button>
            </div>
          ))}

          {cart.length === 0 && <p style={{ opacity: 0.7 }}>Aún no agregas productos.</p>}
        </div>

        <div style={{ marginTop: 12, borderTop: "1px solid rgba(0,0,0,0.12)", paddingTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 1000, fontSize: 18 }}>
            <span>Total</span>
            <span>${total.toLocaleString("es-CL")}</span>
          </div>

          <button
            className="btn primary"
            onClick={confirmSale}
            disabled={loading}
            style={{ marginTop: 12, width: "100%" }}
          >
            {loading ? "Procesando..." : "Confirmar venta"}
          </button>
        </div>
      </aside>
    </div>
  );
}
