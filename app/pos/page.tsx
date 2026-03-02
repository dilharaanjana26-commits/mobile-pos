"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Product = {
  _id: string;
  sku: string;
  name: string;
  sellingPrice: number;
  stockQty: number;
};

type ImeiUnit = {
  _id: string;
  brand: string;
  model: string;
  imei1: string;
  sellingPrice: number;
  status: string;
};

type CartItem =
  | { type: "PRODUCT"; productId: string; name: string; qty: number; unitPrice: number }
  | { type: "IMEI"; imeiUnitId: string; name: string; qty: 1; unitPrice: number };

export default function PosPage() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [imeiQ, setImeiQ] = useState("");
  const [imei, setImei] = useState<ImeiUnit[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);

  async function loadProducts() {
    const data = await apiFetch<{ items: Product[] }>(`/api/products?q=${encodeURIComponent(q)}`);
    setProducts(data.items);
  }

  async function loadImei() {
    const data = await apiFetch<{ items: ImeiUnit[] }>(
      `/api/imei?q=${encodeURIComponent(imeiQ)}&status=IN_STOCK`
    );
    setImei(data.items);
  }

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { if (q.length === 0 || q.length >= 2) loadProducts(); }, [q]);
  useEffect(() => { if (imeiQ.length === 0 || imeiQ.length >= 4) loadImei(); }, [imeiQ]);

  const subTotal = useMemo(() => cart.reduce((s, x) => s + x.unitPrice * x.qty, 0), [cart]);
  const grandTotal = Math.max(0, subTotal - discount);
  const balance = paid - grandTotal;

  function addProduct(p: Product) {
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.type === "PRODUCT" && x.productId === p._id);
      if (idx >= 0) {
        const copy = [...prev];
        const item = copy[idx] as any;
        copy[idx] = { ...item, qty: item.qty + 1 };
        return copy;
      }
      return [...prev, { type: "PRODUCT", productId: p._id, name: p.name, qty: 1, unitPrice: p.sellingPrice }];
    });
  }

  function addImeiUnit(u: ImeiUnit) {
    setCart((prev) => {
      if (prev.some((x) => x.type === "IMEI" && x.imeiUnitId === u._id)) return prev;
      return [...prev, { type: "IMEI", imeiUnitId: u._id, name: `${u.brand} ${u.model} (${u.imei1})`, qty: 1, unitPrice: u.sellingPrice }];
    });
  }

  function removeAt(i: number) {
    setCart((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function checkout() {
    setError(null);
    setLastInvoice(null);
    try {
      const payload = {
        discount,
        tax: 0,
        payment: { method: "CASH", paidAmount: paid },
        items: cart.map((x) => (x.type === "PRODUCT"
          ? { type: "PRODUCT", productId: x.productId, qty: x.qty }
          : { type: "IMEI", imeiUnitId: x.imeiUnitId }
        )),
      };

      const res = await apiFetch<{ ok: true; sale: any }>("/api/sales", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setLastInvoice(res.sale.invoiceNo);
      setCart([]);
      setDiscount(0);
      setPaid(0);
      await loadProducts();
      await loadImei();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <main style={{ display: "grid", gap: 16 }}>
      <h2>POS</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h3>Products</h3>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name / sku / barcode" />
          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
            {products.map((p) => (
              <button key={p._id} onClick={() => addProduct(p)} style={{ textAlign: "left" }}>
                {p.name} — Rs {p.sellingPrice} (Stock {p.stockQty})
              </button>
            ))}
          </div>
        </section>

        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h3>IMEI Units</h3>
          <input value={imeiQ} onChange={(e) => setImeiQ(e.target.value)} placeholder="Search IMEI / model" />
          <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
            {imei.map((u) => (
              <button key={u._id} onClick={() => addImeiUnit(u)} style={{ textAlign: "left" }}>
                {u.brand} {u.model} — {u.imei1} — Rs {u.sellingPrice}
              </button>
            ))}
          </div>
        </section>
      </div>

      <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
        <h3>Cart</h3>
        {cart.length === 0 ? (
          <p>No items</p>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            {cart.map((x, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  {x.name} — Rs {x.unitPrice} × {x.qty}
                </div>
                <button onClick={() => removeAt(i)}>Remove</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 10, display: "grid", gap: 6, maxWidth: 360 }}>
          <div>Subtotal: Rs {subTotal}</div>
          <label>
            Discount:
            <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value || 0))} />
          </label>
          <div><b>Grand Total: Rs {grandTotal}</b></div>
          <label>
            Paid:
            <input type="number" value={paid} onChange={(e) => setPaid(Number(e.target.value || 0))} />
          </label>
          <div>Balance: Rs {balance}</div>
          <button onClick={checkout} disabled={cart.length === 0}>Checkout</button>

          {error && <div style={{ color: "crimson" }}>{error}</div>}
          {lastInvoice && <div style={{ color: "green" }}>Sale OK: {lastInvoice}</div>}
        </div>
      </section>

      <p>
        Admin pages: <a href="/admin/products">/admin/products</a>
      </p>
    </main>
  );
}
