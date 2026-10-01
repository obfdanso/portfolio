"use client";

import { useState } from "react";
import { contactSchema } from "@/lib/contact-schema";

type Status =
  { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const FIELD =
  "mt-1.5 w-full rounded-lg border border-fg-muted/25 bg-surface/50 px-3 py-2.5 text-step-0 " +
  "transition-colors duration-(--duration-base) ease-(--ease-brand) focus:border-accent/60";

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [values, setValues] = useState({ name: "", email: "", message: "" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = contactSchema.safeParse({ ...values, website: "" });
    if (!parsed.success) {
      setStatus({ kind: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." });
      return;
    }

    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      if (!response.ok) {
        const body: { error?: string } = await response.json().catch(() => ({}));
        setStatus({ kind: "error", message: body.error ?? "Something went wrong." });
        return;
      }

      // Only clear the fields once the message is definitely away, so a
      // failure never costs someone what they typed.
      setStatus({ kind: "sent" });
      setValues({ name: "", email: "", message: "" });
    } catch {
      setStatus({ kind: "error", message: "Network error. Please email me directly." });
    }
  }

  if (status.kind === "sent") {
    return (
      <p role="status" className="rounded-xl border border-accent/40 bg-surface/40 p-6">
        Message sent. I will reply to the address you gave.
      </p>
    );
  }

  return (
    // action and method live on the element itself, so the form posts and
    // works even if the JavaScript never loads.
    <form
      action="/api/contact"
      method="post"
      onSubmit={onSubmit}
      className="max-w-xl space-y-5"
      noValidate
    >
      <p aria-hidden="true" className="hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <label className="block">
        <span className="text-step-xs text-fg-muted">Name</span>
        <input
          required
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          className={FIELD}
        />
      </label>

      <label className="block">
        <span className="text-step-xs text-fg-muted">Email</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          className={FIELD}
        />
      </label>

      <label className="block">
        <span className="text-step-xs text-fg-muted">Message</span>
        <textarea
          required
          name="message"
          rows={6}
          value={values.message}
          onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
          className={FIELD}
        />
      </label>

      {status.kind === "error" && (
        <p role="alert" className="text-step-xs text-accent">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.kind === "sending"}
        className="btn btn-solid rounded-full bg-fg px-6 py-3 text-step-xs font-medium text-ground disabled:opacity-60"
      >
        {status.kind === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
