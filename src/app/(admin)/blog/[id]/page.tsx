"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, PageLoading, EmptyState } from "@/components/ui/Feedback";
import { BlogForm, type BlogFormValues } from "@/components/domain/BlogForm";
import { blogApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const postQuery = useQuery({
    queryKey: ["collection", "blog", "item", id],
    queryFn: () => blogApi.get(id),
  });
  const updateMutation = useMutation({
    mutationFn: (values: BlogFormValues) => blogApi.update(id, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["collection", "blog"] });
      showToast("Post saved.");
      router.push("/blog");
    },
    onError: (error) => {
      showToast(
        error instanceof Error ? error.message : "Could not save the post.",
        "error",
      );
    },
  });

  if (postQuery.isLoading) return <PageLoading />;
  if (postQuery.error || !postQuery.data) {
    return (
      <EmptyState
        title={postQuery.error ? "Could not load this post" : "Post not found"}
        description={
          postQuery.error instanceof Error
            ? postQuery.error.message
            : "It may have been deleted."
        }
      />
    );
  }

  const handleSubmit = async (values: BlogFormValues, status: "draft" | "published") => {
    await updateMutation.mutateAsync({ ...values, status });
  };

  return (
    <div>
      <PageHeader
        title={`Edit "${postQuery.data.title}"`}
        description="Update this article."
      />
      <BlogForm
        initialValues={postQuery.data}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
