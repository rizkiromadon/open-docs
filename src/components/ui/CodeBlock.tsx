"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

/**
 * Monospace code display with a copy-to-clipboard control. Does not
 * perform syntax highlighting to keep the bundle lean; relies on
 * monochrome styling consistent with the rest of the interface.
 */
export function CodeBlock({ code, language, className }: CodeBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  async function handleCopy() {
    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      let fallbackSucceeded = false;
      try {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        fallbackSucceeded = document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch {
        fallbackSucceeded = false;
      }
      setCopyState(fallbackSucceeded ? "copied" : "failed");
    } finally {
      setTimeout(() => setCopyState("idle"), 1500);
    }
  }

  return (
    <div
      className={cn(
        "group relative rounded-sm border border-border bg-surface-sunken",
        className,
      )}
    >
      {language && (
        <div className="border-b border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-faint">
          {language}
        </div>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-sm border border-border-strong bg-surface px-2 py-1 text-xs text-ink-muted opacity-40 transition-opacity hover:text-ink hover:opacity-100 focus-visible:opacity-100 focus:opacity-100 group-hover:opacity-100"
      >
        {copyState === "copied"
          ? "Copied"
          : copyState === "failed"
            ? "Copy failed"
            : "Copy"}
      </button>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-ink">
        <code>{code}</code>
      </pre>
    </div>
  );
}
