import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export type JwtUser = {
  userId: string;
  username: string;
  role: "ADMIN" | "CASHIER";
};

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET in env");

export function signToken(user: JwtUser) {
  return jwt.sign(user, JWT_SECRET!, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtUser {
  return jwt.verify(token, JWT_SECRET!) as JwtUser;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
