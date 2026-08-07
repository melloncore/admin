"use client";

import { useCallback, useEffect, useState } from "react";

interface CollectionApi<T extends { id: string }> {
  list: () => Promise<T[]>;
  create: (data: Omit<T, "id">) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T | undefined>;
  remove: (id: string) => Promise<void>;
  reorder: (orderedIds: string[]) => Promise<T[]>;
}

/**
 * Wraps a collection API module (see src/lib/api) with loading state and
 * optimistic-ish local state updates so list/detail pages stay simple.
 */
export function useCollection<T extends { id: string }>(api: CollectionApi<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.list();
      setItems(data);
    } catch {
      setError("Couldn't load this data. Try refreshing the page.");
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = useCallback(
    async (data: Omit<T, "id">) => {
      const created = await api.create(data);
      setItems((prev) => [...prev, created]);
      return created;
    },
    [api],
  );

  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      const updated = await api.update(id, data);
      if (updated) {
        setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
      return updated;
    },
    [api],
  );

  const remove = useCallback(
    async (id: string) => {
      await api.remove(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [api],
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      const next = await api.reorder(orderedIds);
      setItems(next);
      return next;
    },
    [api],
  );

  return { items, isLoading, error, refresh, create, update, remove, reorder };
}
