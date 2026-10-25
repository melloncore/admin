"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface SettingsApi<T> {
  storageKey: string;
  get: () => Promise<T>;
  update: (data: Partial<T>) => Promise<T>;
  replace: (data: T) => Promise<T>;
}

export function useSettings<T>(api: SettingsApi<T>) {
  const queryClient = useQueryClient();
  const queryKey = ["settings", api.storageKey];
  const query = useQuery({ queryKey, queryFn: api.get });
  const updateMutation = useMutation({
    mutationFn: api.update,
    onSuccess: (next) => queryClient.setQueryData(queryKey, next),
  });
  const replaceMutation = useMutation({
    mutationFn: api.replace,
    onSuccess: (next) => queryClient.setQueryData(queryKey, next),
  });

  return {
    data: query.data ?? null,
    setData: (data: T) => queryClient.setQueryData(queryKey, data),
    isLoading: query.isLoading,
    isSaving: updateMutation.isPending || replaceMutation.isPending,
    error: query.error,
    refresh: () => query.refetch(),
    save: (patch: Partial<T>) => updateMutation.mutateAsync(patch),
    saveAll: (value: T) => replaceMutation.mutateAsync(value),
  };
}
