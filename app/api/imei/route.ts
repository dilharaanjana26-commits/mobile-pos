import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ImeiUnit from "@/models/ImeiUnit";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = (searchParams.get("status") || "").trim();

  await dbConnect();
  const filter: any = {};
  if (status) filter.status = status;

  if (q) {
    filter.$or = [
      { imei1: q },
      { imei2: q },
      { brand: { $regex: q, $options: "i" } },
      { model: { $regex: q, $options: "i" } },
    ];
  }

  const items = await ImeiUnit.find(filter).sort({ updatedAt: -1 }).limit(100).lean();
  return NextResponse.json({ items });
}
