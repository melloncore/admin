/**
 * Thin, SSR-safe localStorage wrapper.
 *
 * The whole admin app is built "static-first": every domain in src/lib/api
 * reads and writes through here instead of a real backend. When the real API
 * is ready, only the functions inside src/lib/api/* need to change — every
 * component keeps calling the same hooks.
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
