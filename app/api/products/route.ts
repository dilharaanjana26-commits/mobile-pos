import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Product from "@/models/Product";
import { z } from "zod";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  await dbConnect();
  const filter: any = { isActive: true };
  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { sku: { $regex: q, $options: "i" } },
      { barcode: q },
    ];
  }

  const items = await Product.find(filter).sort({ updatedAt: -1 }).limit(100).lean();
  return NextResponse.json({ items });
}

const CreateBody = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().optional(),
  category: z.string().optional(),
  barcode: z.string().optional(),
  purchasePrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  stockQty: z.number().int().nonnegative().default(0),
  reorderLevel: z.number().int().nonnegative().default(0),
});

export async function POST(req: Request) {
  const body = CreateBody.parse(await req.json());
  await dbConnect();
  const created = await Product.create(body);
  return NextResponse.json({ ok: true, item: created });
}
