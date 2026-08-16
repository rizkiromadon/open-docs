import Link from "next/link";

/**
 * Fallback rendered when an operation slug does not match any
 * operation in the active document.
 */
export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas text-ink">
      <h1 className="text-lg font-semibold">Endpoint not found</h1>
      <p className="text-sm text-ink-muted">
        This operation does not exist in the loaded specification.
      </p>
      <Link
        href="/"
        className="rounded-sm border border-border-strong px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        Back to documentation
      </Link>
    </div>
  );
}
