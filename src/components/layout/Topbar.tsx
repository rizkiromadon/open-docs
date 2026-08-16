import type { NormalizedDocument } from "@/types/openapi";
import { Badge } from "@/components/ui/Badge";

export interface TopbarProps {
  document: NormalizedDocument;
  onMenuClick?: () => void;
}

/**
 * Slim top bar showing the active document's supported OpenAPI
 * version. Kept minimal in line with the compact, monochrome layout.
 * Below the `md:` breakpoint, shows a hamburger button that toggles
 * the sidebar drawer via `onMenuClick`.
 */
export function Topbar({ document, onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-canvas px-4">
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Toggle navigation menu"
            className="-ml-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink md:hidden"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M3 5.5h14M3 10h14M3 14.5h14" />
            </svg>
          </button>
        )}
        <span className="text-sm font-semibold text-ink">open-docs</span>
        <span className="hidden text-xs text-ink-faint sm:inline">
          / {document.title}
        </span>
      </div>
      <Badge tone="neutral">OpenAPI {document.openApiVersion}</Badge>
    </header>
  );
}
