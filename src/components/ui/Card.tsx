import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * Base rounded, bordered surface used throughout open-docs for
 * grouping related content (endpoint panels, schema blocks, callouts).
 */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface shadow-subtle",
        className,
      )}
      {...props}
    />
  );
}

/** Padded header row for a {@link Card}, typically holding a title. */
export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-border px-4 py-2.5",
        className,
      )}
      {...props}
    />
  );
}

/** Padded body region for a {@link Card}. */
export function CardBody({ className, ...props }: CardProps) {
  return <div className={cn("px-4 py-3", className)} {...props} />;
}
