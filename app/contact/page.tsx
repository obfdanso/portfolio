import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${SITE.name}.`,
};

export default function ContactPage() {
  return (
    <div className="container-page py-24">
      <h1 className="text-step-4">Contact</h1>
      <p className="mt-5 max-w-xl text-fg-muted">
        I am looking for frontend roles and internships. Send a message below, or email me directly
        at{" "}
        <a href={`mailto:${SITE.email}`} className="text-accent underline underline-offset-4">
          {SITE.email}
        </a>
        . The direct address always works, even if the form does not.
      </p>

      <div className="mt-12">
        <ContactForm />
      </div>

      <p className="mt-12 text-step-xs text-fg-muted">
        Also on{" "}
        <a href={SITE.github} className="text-accent underline underline-offset-4">
          GitHub
        </a>{" "}
        and{" "}
        <a href={SITE.linkedin} className="text-accent underline underline-offset-4">
          LinkedIn
        </a>
        .
      </p>
    </div>
  );
}
