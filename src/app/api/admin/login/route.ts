import { NextResponse } from "next/server";
import { checkPassword, createSessionToken, adminConfigured, SESSION_COOKIE } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 6, 15 * 60_000)) {
    return NextResponse.json({ message: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  if (!adminConfigured()) {
    return NextResponse.json({ message: "Admin is not configured. Set ADMIN_PASSWORD and AUTH_SECRET." }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  if (typeof body.password !== "string" || !checkPassword(body.password)) {
    return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
  }
  const { token, maxAge } = createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
  return res;
}
