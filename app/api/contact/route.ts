import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";
import { checkRateLimit } from "@/lib/rate-limit";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later, or email me directly." },
      { status: 429 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  // Accepting both encodings is what makes the no-JavaScript form work.
  const raw = isJson ? await request.json() : Object.fromEntries(await request.formData());
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission." },
      { status: 400 },
    );
  }

  const { name, email, message } = parsed.data;

  try {
    const resend = new Resend(requiredEnv("RESEND_API_KEY"));
    await resend.emails.send({
      from: "portfolio@danso.dev",
      to: requiredEnv("CONTACT_TO_EMAIL"),
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
  } catch {
    return NextResponse.json(
      { error: "Could not send the message. Please email me directly." },
      { status: 502 },
    );
  }

  if (!isJson) {
    return NextResponse.redirect(new URL("/contact?sent=1", request.url), 303);
  }

  return NextResponse.json({ ok: true });
}
