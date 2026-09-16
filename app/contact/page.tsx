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
      <h1 className="enter enter--solid text-step-4">Contact</h1>
      <p className="mt-5 max-w-xl text-fg-muted">
        I am looking for frontend roles and internships. Send a message below, or email me directly
        at{" "}
        <a href={`mailto:${SITE.email}`} className="link-grow text-accent">
          {SITE.email}
        </a>
        . The direct address always works, even if the form does not.
      </p>

      <div className="mt-12">
        <ContactForm />
      </div>

      <p className="mt-12 text-step-xs text-fg-muted">
        Also on{" "}
        <a href={SITE.github} className="link-grow text-accent">
          GitHub
        </a>{" "}
        and{" "}
        <a href={SITE.linkedin} className="link-grow text-accent">
          LinkedIn
        </a>
        .
      </p>
    </div>
  );
}
