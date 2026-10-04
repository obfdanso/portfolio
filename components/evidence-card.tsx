import Link from "next/link";
import type { ResolvedEvidence } from "@/lib/skills";

const CARD = "card-lift block h-full rounded-2xl border border-fg-muted/15 bg-surface/40 p-5";

export function EvidenceCard({ evidence }: { evidence: ResolvedEvidence }) {
  const body = (
    <>
      <span className="block text-step-0 font-medium">{evidence.title}</span>
      <span className="mt-1 block text-step-xs text-fg-muted">{evidence.note}</span>
    </>
  );

  // Case studies go through next/link for client-side navigation. The
  // repository is an ordinary link, consistent with the Source pills.
  return evidence.external ? (
    <a href={evidence.href} className={CARD}>
      {body}
    </a>
  ) : (
    <Link href={evidence.href} className={CARD}>
      {body}
    </Link>
  );
}
