import { readStorage, writeStorage } from "@/lib/utils/storage";
import { generateId } from "@/lib/utils/id";

/**
 * Creates a small async CRUD client backed by localStorage.
 *
 * This is the seam for a future real API: every function here returns a
 * Promise already, so swapping the body for a `fetch("/api/...")` call is a
 * one-file change per domain — nothing that calls these functions needs to
 * change.
 */
export function createCollectionApi<T extends { id: string }>(
  storageKey: string,
  seed: T[],
  latencyMs = 180,
) {
  function delay<R>(value: R): Promise<R> {
    return new Promise((resolve) => setTimeout(() => resolve(value), latencyMs));
  }

  function readAll(): T[] {
    return readStorage<T[]>(storageKey, seed);
  }

  function writeAll(items: T[]): void {
    writeStorage(storageKey, items);
  }

  async function list(): Promise<T[]> {
    return delay(readAll());
  }

  async function get(id: string): Promise<T | undefined> {
    return delay(readAll().find((item) => item.id === id));
  }

  async function create(data: Omit<T, "id">): Promise<T> {
    const items = readAll();
    const newItem = { ...data, id: generateId() } as T;
    writeAll([...items, newItem]);
    return delay(newItem);
  }

  async function update(id: string, data: Partial<T>): Promise<T | undefined> {
    const items = readAll();
    let updated: T | undefined;
    const next = items.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...data };
      return updated;
    });
    writeAll(next);
    return delay(updated);
  }

  async function remove(id: string): Promise<void> {
    const items = readAll();
    writeAll(items.filter((item) => item.id !== id));
    return delay(undefined);
  }

  async function reorder(orderedIds: string[]): Promise<T[]> {
    const items = readAll();
    const byId = new Map(items.map((item) => [item.id, item]));
    const next = orderedIds.map((id) => byId.get(id)).filter(Boolean) as T[];
    writeAll(next);
    return delay(next);
  }

  return { list, get, create, update, remove, reorder, readAll, writeAll };
}

/** For single-object "settings" style resources (hero, about, footer, ...). */
export function createSettingsApi<T>(storageKey: string, seed: T, latencyMs = 150) {
  function delay<R>(value: R): Promise<R> {
    return new Promise((resolve) => setTimeout(() => resolve(value), latencyMs));
  }

  async function get(): Promise<T> {
    return delay(readStorage<T>(storageKey, seed));
  }

  async function update(data: Partial<T>): Promise<T> {
    const current = readStorage<T>(storageKey, seed);
    const next = { ...current, ...data };
    writeStorage(storageKey, next);
    return delay(next);
  }

  async function replace(data: T): Promise<T> {
    writeStorage(storageKey, data);
    return delay(data);
  }

  return { get, update, replace };
}
