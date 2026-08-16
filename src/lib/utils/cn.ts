import { clsx, type ClassValue } from "clsx";

/**
 * Combines conditional class name fragments into a single string.
 * Thin wrapper around `clsx` kept as a project-local export so the
 * dependency can be swapped without touching call sites.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
