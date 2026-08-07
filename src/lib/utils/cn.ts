import { clsx, type ClassValue } from "clsx";

/** Merge class name fragments, dropping falsy values. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
