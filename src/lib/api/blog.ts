import type { BlogImage, BlogPost } from "@/types";
import { apiRequest } from "./http";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

type BlogPostInput = Omit<BlogPost, "id">;
type ApiBlogPost = Omit<BlogPost, "status"> & {
  status: "DRAFT" | "PUBLISHED";
};

function fromApi(post: ApiBlogPost): BlogPost {
  return { ...post, status: post.status.toLowerCase() as BlogPost["status"] };
}

function toApi(post: BlogPostInput): Omit<ApiBlogPost, "id"> {
  return { ...post, status: post.status.toUpperCase() as ApiBlogPost["status"] };
}

export const blogApi = {
  storageKey: "blog",

  async list(): Promise<BlogPost[]> {
    const response = await apiRequest<ApiResponse<ApiBlogPost[]>>("/blog/admin");
    return response.data.map(fromApi);
  },

  async get(id: string): Promise<BlogPost | undefined> {
    const response = await apiRequest<ApiResponse<ApiBlogPost>>(
      `/blog/admin/${encodeURIComponent(id)}`,
    );
    return fromApi(response.data);
  },

  async create(data: BlogPostInput): Promise<BlogPost> {
    const response = await apiRequest<ApiResponse<ApiBlogPost>>("/blog/admin", {
      method: "POST",
      body: JSON.stringify(toApi(data)),
    });
    return fromApi(response.data);
  },

  async update(id: string, data: Partial<BlogPostInput>): Promise<BlogPost | undefined> {
    const response = await apiRequest<ApiResponse<ApiBlogPost>>(
      `/blog/admin/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          ...data,
          ...(data.status ? { status: data.status.toUpperCase() } : {}),
        }),
      },
    );
    return fromApi(response.data);
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/blog/admin/${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  async uploadImage(file: File): Promise<BlogImage> {
    const response = await apiRequest<ApiResponse<{ url: string }>>(
      "/blog/admin/uploads",
      {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      },
    );
    return { url: response.data.url, alt: "" };
  },
};
