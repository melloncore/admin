"use client";

import { useCallback, useEffect, useState } from "react";

interface SettingsApi<T> {
  get: () => Promise<T>;
  update: (data: Partial<T>) => Promise<T>;
  replace: (data: T) => Promise<T>;
}

export function useSettings<T>(api: SettingsApi<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const value = await api.get();
    setData(value);
    setIsLoading(false);
  }, [api]);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(
    async (patch: Partial<T>) => {
      setIsSaving(true);
      try {
        const next = await api.update(patch);
        setData(next);
        return next;
      } finally {
        setIsSaving(false);
      }
    },
    [api],
  );

  const saveAll = useCallback(
    async (value: T) => {
      setIsSaving(true);
      try {
        const next = await api.replace(value);
        setData(next);
        return next;
      } finally {
        setIsSaving(false);
      }
    },
    [api],
  );

  return { data, setData, isLoading, isSaving, refresh, save, saveAll };
}
