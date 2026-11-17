import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";
import { checkRateLimit } from "@/lib/rate-limit";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/**
 * Says what went wrong in a shape the sender can read. The page's script
 * asked for JSON and shows the message beside the form. A form that posted
 * without JavaScript is shown this response as a page, so it gets one: plain
 * HTML with no assets, in the visitor's light or dark scheme.
 */
function failure(isJson: boolean, message: string, status: number) {
  if (isJson) return NextResponse.json({ error: message }, { status });

  const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<meta name="color-scheme" content="dark light">
<title>Message not sent</title>
<style>body{font-family:system-ui,sans-serif;line-height:1.6;max-width:36rem;margin:0 auto;padding:4rem 1.5rem}</style>
</head>
<body>
<h1>Message not sent</h1>
<p>${escapeHtml(message)}</p>
<p>Your browser's back button returns to the form with what you typed. Or <a href="/contact">start again</a>.</p>
</body>
</html>`;
  return new NextResponse(page, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const contentType = request.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  // Accepting both encodings is what makes the no-JavaScript form work.
  // A body that cannot be read at all is the sender's mistake, so it gets a
  // 400 rather than an unhandled 500.
  let raw: unknown;
  try {
    raw = isJson ? await request.json() : Object.fromEntries(await request.formData());
  } catch {
    return failure(isJson, "Invalid submission.", 400);
  }
  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    return failure(isJson, parsed.error.issues[0]?.message ?? "Invalid submission.", 400);
  }

  // Counted only once a message is valid: someone fixing a typo in their
  // email must not use up the hour's three messages without sending any.
  if (!checkRateLimit(ip)) {
    return failure(isJson, "Too many messages. Please try again later, or email me directly.", 429);
  }

  const { name, email, message } = parsed.data;

  try {
    const resend = new Resend(requiredEnv("RESEND_API_KEY"));
    // Resend reports a rejected email (a bad key, an address it won't send
    // to) in the result rather than by throwing. Unchecked, the visitor was
    // told the message was sent when it never left.
    const { error } = await resend.emails.send({
      from: "portfolio@danso.dev",
      to: requiredEnv("CONTACT_TO_EMAIL"),
      replyTo: email,
      subject: `Portfolio message from ${name}`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });
    if (error) throw new Error(`Resend rejected the message: ${error.message}`);
  } catch {
    return failure(isJson, "Could not send the message. Please email me directly.", 502);
  }

  if (!isJson) {
    // A form posted without JavaScript: the browser follows this to a page
    // that says the message was sent.
    return NextResponse.redirect(new URL("/contact/sent", request.url), 303);
  }

  return NextResponse.json({ ok: true });
}
