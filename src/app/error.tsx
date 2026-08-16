"use client";

import { useEffect } from "react";

export interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * Route-level error boundary, primarily surfaced when the active
 * OpenAPI spec fails to load or fails validation against the minimum
 * supported version. Shows a generic, friendly message in production
 * (the raw error may contain internal parser/YAML details) and logs
 * the actual error for developer visibility. Detailed error text is
 * only rendered outside production, in a scrollable container so
 * unusually long messages don't break the page layout.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center text-ink">
      <h1 className="text-lg font-semibold">Could not load specification</h1>
      <p className="max-w-md text-sm text-ink-muted">
        {isProduction
          ? "We couldn't load the API specification. Check the server logs for details."
          : "The API specification failed to load. Details below (dev mode only):"}
      </p>
      {!isProduction && (
        <pre className="max-h-48 w-full max-w-md overflow-y-auto rounded-sm border border-border bg-surface-sunken p-3 text-left font-mono text-xs text-ink-muted">
          {error.message}
          {error.digest && `\n\ndigest: ${error.digest}`}
        </pre>
      )}
      <button
        type="button"
        onClick={reset}
        className="rounded-sm border border-border-strong px-3 py-1.5 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        Try again
      </button>
    </div>
  );
}
