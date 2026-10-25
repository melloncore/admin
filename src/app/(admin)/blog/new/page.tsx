"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/Feedback";
import { BlogForm, type BlogFormValues } from "@/components/domain/BlogForm";
import { blogApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const BLANK: BlogFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  images: [],
  category: "",
  author: "",
  status: "draft",
  date: new Date().toISOString().slice(0, 10),
  readTime: "5 min read",
};

export default function NewBlogPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const createMutation = useMutation({
    mutationFn: (values: BlogFormValues) => blogApi.create(values),
    onSuccess: async (_post, values) => {
      await queryClient.invalidateQueries({ queryKey: ["collection", "blog"] });
      showToast(values.status === "published" ? "Post published." : "Draft saved.");
      router.push("/blog");
    },
    onError: (error) => {
      showToast(
        error instanceof Error ? error.message : "Could not save the post.",
        "error",
      );
    },
  });

  const handleSubmit = async (values: BlogFormValues, status: "draft" | "published") => {
    await createMutation.mutateAsync({ ...values, status });
  };

  return (
    <div>
      <PageHeader title="New blog post" description="Write a new article for the blog." />
      <BlogForm
        initialValues={BLANK}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
