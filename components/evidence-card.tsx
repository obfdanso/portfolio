import Link from "next/link";
import type { ResolvedEvidence } from "@/lib/skills";

export function EvidenceCard({ evidence }: { evidence: ResolvedEvidence }) {
  return (
    <Link
      href={evidence.href}
      className="card-lift block h-full rounded-2xl border border-fg-muted/15 bg-surface/40 p-5"
    >
      <span className="block text-step-0 font-medium">{evidence.title}</span>
      <span className="mt-1 block text-step-xs text-fg-muted">{evidence.note}</span>
    </Link>
  );
}
