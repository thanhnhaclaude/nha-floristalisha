import { NextResponse, after } from "next/server";
import { fieldErrors, inquirySchema } from "@/lib/schemas";
import { insert, newId, type InquiryRecord } from "@/lib/store";
import { sendInquiryEmails } from "@/lib/mailer";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimit(`inquiry:${ip}`, 6, 10 * 60_000)) {
    return NextResponse.json({ message: "Too many requests. Please wait a few minutes." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Please check the highlighted fields.", errors: fieldErrors(parsed.error) }, { status: 422 });
  }
  const { company, ...data } = parsed.data;
  if (company) return NextResponse.json({ id: newId("EV") });

  const record: InquiryRecord = {
    ...data,
    id: newId(data.kind === "event" ? "EV" : "MSG"),
    createdAt: new Date().toISOString(),
    status: "new",
    ip,
  };

  try {
    await insert("inquiries", record);
  } catch (e) {
    console.error("[inquiries] save failed:", e);
    return NextResponse.json({ message: "We couldn't send your message. Please email us directly." }, { status: 500 });
  }

  after(() => sendInquiryEmails(record));
  return NextResponse.json({ id: record.id }, { status: 201 });
}
