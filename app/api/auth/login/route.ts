import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth";

const Body = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const json = await req.json();
  const body = Body.parse(json);

  await dbConnect();
  const user = await User.findOne({ username: body.username, isActive: true }).lean();
  if (!user) return NextResponse.json({ error: "Invalid login" }, { status: 401 });

  const ok = await comparePassword(body.password, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Invalid login" }, { status: 401 });

  const token = signToken({
    userId: String(user._id),
    username: user.username,
    role: user.role,
  });

  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
