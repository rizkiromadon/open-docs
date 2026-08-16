"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
}

/**
 * Minimal, dependency-free tab switcher used for cycling between media
 * types, code samples, or response status codes. Follows the WAI-ARIA
 * Tabs pattern: `role="tablist"`/`"tab"`/`"tabpanel"`, `aria-selected`,
 * `aria-controls`, and roving-tabindex arrow-key navigation.
 */
export function Tabs({ items, defaultTabId }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? items[0]?.id);
  const active = items.find((item) => item.id === activeId) ?? items[0];
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  if (!active) return null;

  function focusAndActivate(id: string) {
    setActiveId(id);
    tabRefs.current[id]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (index + 1) % items.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (index - 1 + items.length) % items.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = items.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextItem = items[nextIndex];
    if (nextItem) {
      focusAndActivate(nextItem.id);
    }
  }

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-border px-1">
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={(el) => {
              tabRefs.current[item.id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={item.id === active.id}
            aria-controls={`panel-${item.id}`}
            tabIndex={item.id === active.id ? 0 : -1}
            onClick={() => setActiveId(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "rounded-t-sm px-2.5 py-1.5 text-xs font-mono transition-colors",
              item.id === active.id
                ? "border-b-2 border-ink text-ink"
                : "border-b-2 border-transparent text-ink-muted hover:text-ink",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        className="pt-3"
      >
        {active.content}
      </div>
    </div>
  );
}
