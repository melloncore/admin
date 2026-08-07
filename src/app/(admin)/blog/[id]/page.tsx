"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, PageLoading, EmptyState } from "@/components/ui/Feedback";
import { BlogForm, type BlogFormValues } from "@/components/domain/BlogForm";
import { blogApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { BlogPost } from "@/types";

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    blogApi.get(id).then((p) => setPost(p ?? null));
  }, [id]);

  if (post === undefined) return <PageLoading />;
  if (post === null) {
    return <EmptyState title="Post not found" description="It may have already been deleted." />;
  }

  const handleSubmit = async (values: BlogFormValues, status: "draft" | "published") => {
    setIsSubmitting(true);
    await blogApi.update(id, values);
    setIsSubmitting(false);
    showToast(status === "published" ? "Post published." : "Draft saved.");
    router.push("/blog");
  };

  return (
    <div>
      <PageHeader title={`Edit "${post.title}"`} description="Update this article." />
      <BlogForm initialValues={post} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
