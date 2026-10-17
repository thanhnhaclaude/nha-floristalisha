import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/auth";
import { INQUIRY_STATUSES, ORDER_STATUSES, update } from "@/lib/store";

const patchSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("orders"), id: z.string().min(1), status: z.enum(ORDER_STATUSES).optional(), adminNote: z.string().max(2000).optional() }),
  z.object({ kind: z.literal("inquiries"), id: z.string().min(1), status: z.enum(INQUIRY_STATUSES).optional(), adminNote: z.string().max(2000).optional() }),
]);

export async function PATCH(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  const { kind, id, ...patch } = parsed.data;
  const updated = await update(kind, id, patch);
  if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, record: updated });
}
