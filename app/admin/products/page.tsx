"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminProducts() {
  const [items, setItems] = useState<any[]>([]);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stockQty, setStockQty] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await apiFetch<{ items: any[] }>("/api/products");
    setItems(res.items);
  }

  useEffect(() => { load(); }, []);

  async function create() {
    setMsg(null);
    await apiFetch("/api/products", {
      method: "POST",
      body: JSON.stringify({ sku, name, purchasePrice, sellingPrice, stockQty }),
    });
    setSku(""); setName(""); setPurchasePrice(0); setSellingPrice(0); setStockQty(0);
    setMsg("Created");
    await load();
  }

  return (
    <main style={{ display: "grid", gap: 12 }}>
      <h2>Admin: Products</h2>

      <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, maxWidth: 520, display: "grid", gap: 8 }}>
        <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU (unique)" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value || 0))} placeholder="Purchase Price" />
        <input type="number" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value || 0))} placeholder="Selling Price" />
        <input type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value || 0))} placeholder="Stock Qty" />
        <button onClick={create}>Create</button>
        {msg && <div style={{ color: "green" }}>{msg}</div>}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {items.map((p) => (
          <div key={p._id} style={{ border: "1px solid #eee", padding: 10, borderRadius: 8 }}>
            <b>{p.name}</b> — {p.sku} — Rs {p.sellingPrice} — Stock {p.stockQty}
          </div>
        ))}
      </div>
    </main>
  );
}
