"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { NormalizedDocument } from "@/types/openapi";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export interface DocsShellProps {
  document: NormalizedDocument;
  children: ReactNode;
}

/**
 * Top-level three-pane layout: fixed top bar, scrollable left sidebar,
 * and a scrollable main content region for the active page.
 *
 * Below the `md:` breakpoint the sidebar becomes an off-canvas drawer
 * toggled from the top bar's hamburger button, with a backdrop that
 * closes it on click, focus moved into the drawer on open (and back to
 * the trigger on close), and automatic closing on route change.
 */
export function DocsShell({ document, children }: DocsShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const pathname = usePathname();
  const menuButtonRef = useRef<HTMLElement | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close the drawer automatically whenever the route changes.
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Remember the trigger element so focus can return to it on close,
  // and move focus into the drawer when it opens.
  useEffect(() => {
    if (isDrawerOpen) {
      menuButtonRef.current = globalThis.document?.activeElement as
        | HTMLElement
        | null;
      drawerRef.current?.focus();
    } else {
      menuButtonRef.current?.focus?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDrawerOpen]);

  // Close on Escape while the drawer is open.
  useEffect(() => {
    if (!isDrawerOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsDrawerOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  return (
    <div className="flex h-screen flex-col bg-canvas text-ink">
      <Topbar
        document={document}
        onMenuClick={() => setIsDrawerOpen((open) => !open)}
      />
      <div className="flex min-h-0 flex-1">
        {/* Persistent sidebar at md: and above */}
        <aside className="hidden w-64 shrink-0 border-r border-border md:block">
          <Sidebar document={document} />
        </aside>

        {/* Mobile off-canvas drawer, below md: */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 bg-ink/40"
              onClick={() => setIsDrawerOpen(false)}
            />
            <div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              tabIndex={-1}
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-canvas shadow-lg outline-none"
            >
              <Sidebar document={document} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
