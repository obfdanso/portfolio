import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page py-32">
      <h1 className="text-step-4">Page not found</h1>
      <p className="mt-4 text-fg-muted">That page does not exist.</p>
      <Link href="/" className="mt-8 inline-block text-accent underline underline-offset-4">
        Back home
      </Link>
    </div>
  );
}
