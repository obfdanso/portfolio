import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SentCheck } from "@/components/sent-check";

// Where the contact API sends a form that posted without JavaScript, once
// the email is away. A page of its own rather than /contact?sent=1: reading
// the query string would make /contact render per request, and a script
// reading it would never run for the very visitors who land here.
export const metadata: Metadata = {
  title: "Message sent",
  description: "Your message is on its way.",
  alternates: { canonical: "/contact/sent" },
  // A confirmation is not a page to find in a search.
  robots: { index: false, follow: true },
};

export default function ContactSentPage() {
  return (
    <PageHeader>
      <SentCheck className="mb-6 size-12" />
      <h1 className="enter enter--solid text-step-4">Message sent</h1>
      <p className="mt-5 max-w-xl text-fg-muted">
        Thank you. I will reply to the address you gave.
      </p>
      <Link
        href="/"
        className="btn btn-outline magnetic mt-8 inline-block rounded-full border border-fg-muted/30 px-6 py-3 text-step-xs"
      >
        Back home
      </Link>
    </PageHeader>
  );
}
