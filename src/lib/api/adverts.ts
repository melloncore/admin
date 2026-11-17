import type { MarketplaceAdvert } from "@/types";
import { apiRequest } from "./http";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export type AdvertInput = Omit<MarketplaceAdvert, "id" | "createdAt" | "updatedAt">;

export const advertsApi = {
  storageKey: "marketplace-adverts",

  async list(): Promise<MarketplaceAdvert[]> {
    const response = await apiRequest<ApiResponse<MarketplaceAdvert[]>>("/adverts/admin");
    return response.data;
  },

  async create(input: AdvertInput): Promise<MarketplaceAdvert> {
    const response = await apiRequest<ApiResponse<MarketplaceAdvert>>("/adverts/admin", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return response.data;
  },

  async update(id: string, input: Partial<AdvertInput>): Promise<MarketplaceAdvert> {
    const response = await apiRequest<ApiResponse<MarketplaceAdvert>>(
      `/adverts/admin/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) },
    );
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/adverts/admin/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async uploadImage(file: File): Promise<{ url: string; publicId: string }> {
    const response = await apiRequest<ApiResponse<{ url: string; publicId: string }>>(
      "/adverts/admin/uploads",
      {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      },
    );
    return response.data;
  },
};
