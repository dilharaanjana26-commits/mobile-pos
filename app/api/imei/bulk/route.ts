import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import ImeiUnit from "@/models/ImeiUnit";

const Body = z.object({
  units: z.array(
    z.object({
      brand: z.string().min(1),
      model: z.string().min(1),
      color: z.string().optional(),
      storage: z.string().optional(),
      imei1: z.string().min(8),
      imei2: z.string().optional(),
      purchasePrice: z.number().nonnegative(),
      sellingPrice: z.number().nonnegative(),
      warrantyMonths: z.number().int().nonnegative().optional(),
      purchaseDate: z.string().optional(),
    })
  ).min(1),
});

export async function POST(req: Request) {
  const body = Body.parse(await req.json());
  await dbConnect();

  const docs = body.units.map((u) => ({
    ...u,
    purchaseDate: u.purchaseDate ? new Date(u.purchaseDate) : undefined,
    status: "IN_STOCK",
  }));

  const created = await ImeiUnit.insertMany(docs, { ordered: false });
  return NextResponse.json({ ok: true, count: created.length });
}
