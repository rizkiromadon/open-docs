import type { HttpMethod } from "@/types/openapi";
import { methodLabel } from "@/lib/openapi/display";
import { cn } from "@/lib/utils/cn";

const METHOD_STYLES: Record<HttpMethod, string> = {
  get: "text-method-get border-method-get/30 bg-method-get/10",
  post: "text-method-post border-method-post/30 bg-method-post/10",
  put: "text-method-put border-method-put/30 bg-method-put/10",
  patch: "text-method-patch border-method-patch/30 bg-method-patch/10",
  delete: "text-method-delete border-method-delete/30 bg-method-delete/10",
  options: "text-method-options border-method-options/30 bg-method-options/10",
  head: "text-method-head border-method-head/30 bg-method-head/10",
  trace: "text-method-trace border-method-trace/30 bg-method-trace/10",
};

export interface MethodBadgeProps {
  method: HttpMethod;
  size?: "sm" | "md";
}

/**
 * Compact pill badge indicating an operation's HTTP method, colored via
 * the monochrome-with-single-accent method palette.
 */
export function MethodBadge({ method, size = "sm" }: MethodBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border font-mono font-medium tracking-tight",
        METHOD_STYLES[method],
        size === "sm" ? "h-5 px-1.5 text-[10px]" : "h-6 px-2 text-xs",
      )}
    >
      {methodLabel(method)}
    </span>
  );
}
