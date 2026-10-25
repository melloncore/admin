import { ApiError, apiRequest } from "./http";
import { clearStorage, readExistingStorage } from "@/lib/utils/storage";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function createBackendCollectionApi<T extends { id: string }>(storageKey: string) {
  const path = `/admin/content/${encodeURIComponent(storageKey)}`;

  async function list(): Promise<T[]> {
    const response = await apiRequest<ApiResponse<T[]>>(path);
    const legacyItems = readExistingStorage<T[]>(storageKey);
    if (!legacyItems?.length) return response.data;

    const validItems = legacyItems.filter(
      (item): item is T => !!item && typeof item.id === "string" && item.id.length > 0,
    );
    if (validItems.length === 0) return response.data;

    const imported = await apiRequest<ApiResponse<T[]>>(`${path}/import`, {
      method: "POST",
      body: JSON.stringify({ items: validItems }),
    });
    clearStorage(storageKey);
    return imported.data;
  }

  async function get(id: string): Promise<T | undefined> {
    try {
      const response = await apiRequest<ApiResponse<T>>(
        `${path}/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return undefined;
      throw error;
    }
  }

  async function create(data: Omit<T, "id">): Promise<T> {
    const response = await apiRequest<ApiResponse<T>>(path, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async function update(id: string, data: Partial<T>): Promise<T | undefined> {
    try {
      const response = await apiRequest<ApiResponse<T>>(
        `${path}/${encodeURIComponent(id)}`,
        { method: "PATCH", body: JSON.stringify(data) },
      );
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return undefined;
      throw error;
    }
  }

  async function reorder(orderedIds: string[]): Promise<T[]> {
    const response = await apiRequest<ApiResponse<T[]>>(`${path}/order`, {
      method: "PUT",
      body: JSON.stringify({ ids: orderedIds }),
    });
    return response.data;
  }

  async function remove(id: string): Promise<void> {
    await apiRequest<void>(`${path}/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  return { storageKey, list, get, create, update, remove, reorder };
}

export function createBackendSettingsApi<T>(storageKey: string, seed: T) {
  const path = `/admin/settings/${encodeURIComponent(storageKey)}`;

  async function replace(data: T): Promise<T> {
    const response = await apiRequest<ApiResponse<T>>(path, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async function get(): Promise<T> {
    try {
      const response = await apiRequest<ApiResponse<T>>(path);
      return response.data;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error;
    }

    const legacyValue = readExistingStorage<T>(storageKey);
    if (legacyValue === undefined) return seed;
    return replace(legacyValue);
  }

  async function update(data: Partial<T>): Promise<T> {
    const current = await get();
    const next = { ...current, ...data };
    return replace(next);
  }

  return { storageKey, get, update, replace };
}
