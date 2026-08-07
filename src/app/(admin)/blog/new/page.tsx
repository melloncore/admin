"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/Feedback";
import { BlogForm, type BlogFormValues } from "@/components/domain/BlogForm";
import { blogApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

const BLANK: BlogFormValues = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  category: "",
  author: "",
  status: "draft",
  date: new Date().toISOString().slice(0, 10),
  readTime: "5 min read",
};

export default function NewBlogPostPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: BlogFormValues, status: "draft" | "published") => {
    setIsSubmitting(true);
    await blogApi.create(values);
    setIsSubmitting(false);
    showToast(status === "published" ? "Post published." : "Draft saved.");
    router.push("/blog");
  };

  return (
    <div>
      <PageHeader title="New blog post" description="Write a new article for the blog." />
      <BlogForm initialValues={BLANK} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
