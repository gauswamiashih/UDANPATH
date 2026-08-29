import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes, resolving conflicts using tailwind-merge.
 * It's particularly useful when building reusable UI components where you want to allow
 * custom classes to override the default ones.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
