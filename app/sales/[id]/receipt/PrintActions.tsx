"use client";

export default function PrintActions() {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
      <button className="btn primary" onClick={() => window.print()}>
        Imprimir
      </button>
    </div>
  );
}
