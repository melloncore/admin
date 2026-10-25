/**
 * Thin, SSR-safe localStorage wrapper used by legacy adapters and one-time
 * migration of existing admin data into the backend API.
 */

const NAMESPACE = "nexlayer-admin";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function key(name: string): string {
  return `${NAMESPACE}:${name}`;
}

export function readStorage<T>(name: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key(name));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readExistingStorage<T>(name: string): T | undefined {
  if (!isBrowser()) return undefined;
  try {
    const raw = window.localStorage.getItem(key(name));
    if (!raw) return undefined;
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export function writeStorage<T>(name: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
  } catch {
    // Storage can fail (quota, private mode) — fail silently, the in-memory
    // value still updates for the current session.
  }
}

export function clearStorage(name: string): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(key(name));
}
