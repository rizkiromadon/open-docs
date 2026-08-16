import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "warning" | "danger" | "success";
}

const TONE_STYLES: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "border-border-strong bg-surface-raised text-ink-muted",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger",
  success: "border-success/30 bg-success/10 text-success",
};

/** Small rounded label used for status codes, deprecation, and tags. */
export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-mono",
        TONE_STYLES[tone],
        className,
      )}
      {...props}
    />
  );
}
