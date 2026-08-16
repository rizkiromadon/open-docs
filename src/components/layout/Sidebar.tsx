"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NormalizedDocument } from "@/types/openapi";
import { MethodBadge } from "@/components/ui/MethodBadge";
import { operationSlug } from "@/lib/openapi/display";
import { cn } from "@/lib/utils/cn";

export interface SidebarProps {
  document: NormalizedDocument;
}

/**
 * Left navigation rail listing every operation grouped by tag, plus a
 * link to the introduction and authentication sections. Highlights
 * the operation matching the current route, if any. Includes a
 * client-side search box that filters operations by summary, path,
 * or operationId, hiding tag groups with no matches.
 */
export function Sidebar({ document }: SidebarProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "/") return;
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isTyping) return;
      event.preventDefault();
      searchInputRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return document.tagGroups;

    return document.tagGroups
      .map((group) => ({
        ...group,
        operations: group.operations.filter((operation) => {
          const haystack = [
            operation.summary,
            operation.path,
            operation.operationId,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedQuery);
        }),
      }))
      .filter((group) => group.operations.length > 0);
  }, [document.tagGroups, query]);

  return (
    <nav className="flex h-full w-full flex-col overflow-y-auto px-3 py-4 text-sm">
      <div className="px-2 pb-4">
        <div className="text-sm font-semibold text-ink">{document.title}</div>
        <div className="font-mono text-xs text-ink-faint">
          v{document.version} · OpenAPI {document.openApiVersion}
        </div>
      </div>

      <div className="px-2 pb-3">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search endpoints..."
            aria-label="Search endpoints"
            className="w-full rounded-sm border border-border bg-surface-sunken px-2 py-1.5 pr-7 text-xs text-ink placeholder:text-ink-faint focus:border-border-strong focus:outline-none"
          />
          {!query && (
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-sm border border-border-strong px-1 font-mono text-[10px] text-ink-faint">
              /
            </kbd>
          )}
        </div>
      </div>

      <SidebarLink href="/#introduction" label="Introduction" />
      {Object.keys(document.securitySchemes).length > 0 && (
        <SidebarLink href="/#authentication" label="Authentication" />
      )}

      <div className="mt-4 flex flex-col gap-4">
        {filteredGroups.map((group) => (
          <div key={group.name}>
            <div className="px-2 pb-1.5 text-xs font-medium uppercase tracking-wide text-ink-faint">
              {group.name}
            </div>
            <div className="flex flex-col gap-0.5">
              {group.operations.map((operation) => {
                const href = `/operations/${operationSlug(operation.method, operation.path, operation.operationId)}`;
                const isActive = pathname === href;

                return (
                  <Link
                    key={`${operation.method}-${operation.path}`}
                    href={href}
                    className={cn(
                      "flex items-center gap-2 rounded-sm px-2 py-1.5 transition-colors hover:bg-surface-raised hover:text-ink",
                      isActive ? "bg-surface-raised text-ink" : "text-ink-muted",
                    )}
                  >
                    <MethodBadge method={operation.method} />
                    <span className="truncate font-mono text-xs">
                      {operation.summary ?? operation.path}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        {query && filteredGroups.length === 0 && (
          <p className="px-2 text-xs text-ink-faint">No endpoints match "{query}".</p>
        )}
      </div>
    </nav>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-sm px-2 py-1.5 text-ink-muted transition-colors hover:bg-surface-raised hover:text-ink"
    >
      {label}
    </Link>
  );
}
