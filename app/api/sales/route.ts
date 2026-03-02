import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import ImeiUnit from "@/models/ImeiUnit";
import Sale from "@/models/Sale";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

function nextInvoiceNo() {
  const y = new Date().getFullYear();
  return `INV-${y}-${Date.now()}`;
}

const Body = z.object({
  customer: z.object({ name: z.string().optional(), phone: z.string().optional() }).optional(),
  discount: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  payment: z.object({
    method: z.enum(["CASH", "CARD", "UPI", "MIXED"]),
    paidAmount: z.number().nonnegative(),
    ref: z.string().optional(),
  }),
  items: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("PRODUCT"),
        productId: z.string().min(1),
        qty: z.number().int().positive(),
      }),
      z.object({
        type: z.literal("IMEI"),
        imeiUnitId: z.string().min(1),
      }),
    ])
  ).min(1),
});

export async function POST(req: Request) {
  const tokenCookie = cookies().get("token")?.value;
  if (!tokenCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user;
  try {
    user = verifyToken(tokenCookie);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = Body.parse(await req.json());
  await dbConnect();

  const session = await mongoose.startSession();
  try {
    let saleDoc: any = null;

    await session.withTransaction(async () => {
      const saleItems: any[] = [];

      for (const it of body.items) {
        if (it.type === "PRODUCT") {
          const prod = await Product.findById(it.productId).session(session);
          if (!prod || !prod.isActive) throw new Error("Product not found");
          if (prod.stockQty < it.qty) throw new Error(`Not enough stock for ${prod.name}`);

          prod.stockQty -= it.qty;
          await prod.save({ session });

          saleItems.push({
            type: "PRODUCT",
            productId: prod._id,
            name: prod.name,
            qty: it.qty,
            unitPrice: prod.sellingPrice,
            cost: prod.purchasePrice,
          });
        } else {
          const unit = await ImeiUnit.findById(it.imeiUnitId).session(session);
          if (!unit) throw new Error("IMEI unit not found");
          if (unit.status !== "IN_STOCK") throw new Error(`IMEI not available: ${unit.imei1}`);

          unit.status = "SOLD";
          unit.soldAt = new Date();
          await unit.save({ session });

          saleItems.push({
            type: "IMEI",
            imeiUnitId: unit._id,
            name: `${unit.brand} ${unit.model} ${unit.storage || ""}`.trim(),
            qty: 1,
            unitPrice: unit.sellingPrice,
            cost: unit.purchasePrice,
          });
        }
      }

      const subTotal = saleItems.reduce((s, x) => s + x.unitPrice * x.qty, 0);
      const discount = body.discount ?? 0;
      const tax = body.tax ?? 0;
      const grandTotal = Math.max(0, subTotal - discount + tax);

      const paidAmount = body.payment.paidAmount;
      const balance = paidAmount - grandTotal;

      const invoiceNo = nextInvoiceNo();

      saleDoc = await Sale.create(
        [
          {
            invoiceNo,
            date: new Date(),
            customer: body.customer || {},
            items: saleItems,
            subTotal,
            discount,
            tax,
            grandTotal,
            payment: {
              method: body.payment.method,
              paidAmount,
              balance,
              ref: body.payment.ref,
            },
            cashier: { userId: user.userId, username: user.username },
            status: "COMPLETED",
          },
        ],
        { session }
      );

      const saleId = saleDoc[0]._id;
      for (const x of saleItems) {
        if (x.type === "IMEI") {
          await ImeiUnit.updateOne({ _id: x.imeiUnitId }, { $set: { saleId } }, { session });
        }
      }
    });

    return NextResponse.json({ ok: true, sale: saleDoc?.[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Sale failed" }, { status: 400 });
  } finally {
    session.endSession();
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);

  await dbConnect();
  const items = await Sale.find({}).sort({ date: -1 }).limit(limit).lean();
  return NextResponse.json({ items });
}
