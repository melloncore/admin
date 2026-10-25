"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface CollectionApi<T extends { id: string }> {
  storageKey: string;
  list: () => Promise<T[]>;
  create: (data: Omit<T, "id">) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T | undefined>;
  remove: (id: string) => Promise<void>;
  reorder?: (orderedIds: string[]) => Promise<T[]>;
}

export function useCollection<T extends { id: string }>(api: CollectionApi<T>) {
  const queryClient = useQueryClient();
  const queryKey = ["collection", api.storageKey];
  const query = useQuery({ queryKey, queryFn: api.list });

  const createMutation = useMutation({
    mutationFn: api.create,
    onSuccess: (created) => {
      queryClient.setQueryData<T[]>(queryKey, (items = []) => [...items, created]);
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => api.update(id, data),
    onSuccess: (updated, { id }) => {
      if (!updated) return;
      queryClient.setQueryData<T[]>(queryKey, (items = []) =>
        items.map((item) => (item.id === id ? updated : item)),
      );
    },
  });
  const removeMutation = useMutation({
    mutationFn: api.remove,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<T[]>(queryKey, (items = []) =>
        items.filter((item) => item.id !== id),
      );
    },
  });
  const reorderMutation = useMutation({
    mutationFn: (orderedIds: string[]) => {
      if (!api.reorder) {
        throw new Error("Reordering is not supported for this collection.");
      }
      return api.reorder(orderedIds);
    },
    onSuccess: (items) => queryClient.setQueryData(queryKey, items),
  });

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? "Couldn't load this data. Try refreshing the page." : null,
    refresh: () => query.refetch(),
    create: (data: Omit<T, "id">) => createMutation.mutateAsync(data),
    update: (id: string, data: Partial<T>) => updateMutation.mutateAsync({ id, data }),
    remove: (id: string) => removeMutation.mutateAsync(id),
    reorder: (orderedIds: string[]) => reorderMutation.mutateAsync(orderedIds),
  };
}
