import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ImeiUnit from "@/models/ImeiUnit";
import { z } from "zod";

const PatchBody = z.object({
  sellingPrice: z.number().nonnegative().optional(),
  status: z.enum(["IN_STOCK", "SOLD", "RETURNED", "IN_REPAIR"]).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = PatchBody.parse(await req.json());

  await dbConnect();
  const item = await ImeiUnit.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json({ ok: true, item });
}
