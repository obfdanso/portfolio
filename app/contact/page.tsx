import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { PageHeader } from "@/components/page-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader>
        <h1 className="enter enter--solid text-step-4">Contact</h1>
        <p className="mt-5 max-w-xl text-fg-muted">
          I am looking for front-end developer roles and internships. Send a message below, or email
          me directly at{" "}
          <a href={`mailto:${SITE.email}`} className="link-grow text-accent">
            {SITE.email}
          </a>
          .
        </p>
      </PageHeader>

      <div className="container-page py-16">
        <ContactForm />

        <p className="mt-12 text-step-xs text-fg-muted">
          Also on{" "}
          <a href={SITE.github} className="link-grow text-accent">
            GitHub
          </a>
          .
        </p>
      </div>
    </>
  );
}
