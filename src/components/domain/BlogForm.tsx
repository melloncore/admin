"use client";

import { useState, type FormEvent } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FieldError, FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { BlogImageManager } from "@/components/domain/BlogImageManager";
import { RichTextEditor } from "@/components/domain/RichTextEditor";
import type { BlogPost } from "@/types";
import { slugify } from "@/lib/utils/id";

export type BlogFormValues = Omit<BlogPost, "id">;

interface BlogFormProps {
  initialValues: BlogFormValues;
  onSubmit: (values: BlogFormValues, status: BlogPost["status"]) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function BlogForm({ initialValues, onSubmit, isSubmitting }: BlogFormProps) {
  const [form, setForm] = useState<BlogFormValues>(initialValues);
  const [validationError, setValidationError] = useState("");
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const update = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug === slugify(prev.title) || !prev.slug ? slugify(title) : prev.slug,
    }));
  };

  const handleSubmit = (e: FormEvent, status: BlogPost["status"]) => {
    e.preventDefault();
    if (
      !form.title.trim() ||
      !form.slug.trim() ||
      !form.excerpt.trim() ||
      !form.content.trim() ||
      !form.category.trim() ||
      !form.author.trim() ||
      !form.date ||
      !form.readTime.trim()
    ) {
      setValidationError(
        "Complete all required post details and article body before saving.",
      );
      return;
    }
    if (isUploadingImages) {
      setValidationError("Wait for the image upload to finish before saving.");
      return;
    }
    if (form.images.length < 1 || form.images.length > 3) {
      setValidationError("Upload between 1 and 3 images before saving this post.");
      return;
    }
    if (form.images.some((image) => !image.alt.trim())) {
      setValidationError("Add an image description for each uploaded image.");
      return;
    }
    setValidationError("");
    onSubmit({ ...form, status }, status);
  };

  return (
    <form className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="Post content" />
        <CardBody className="space-y-4">
          <FormField label="Title" htmlFor="post-title" required>
            <Input
              id="post-title"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </FormField>
          <FormField label="Slug" htmlFor="post-slug" required>
            <Input
              id="post-slug"
              value={form.slug}
              onChange={(e) => update("slug", slugify(e.target.value))}
              required
            />
          </FormField>
          <FormField
            label="Excerpt"
            htmlFor="post-excerpt"
            hint="Shown on the blog list card"
            required
          >
            <Textarea
              id="post-excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => update("excerpt", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Body" htmlFor="post-body">
            <RichTextEditor
              value={form.content}
              onChange={(html) => update("content", html)}
              placeholder="Write your article here…"
            />
          </FormField>
        </CardBody>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Images" />
          <CardBody>
            <BlogImageManager
              images={form.images}
              onChange={(images) => update("images", images)}
              onUploadingChange={setIsUploadingImages}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Details" />
          <CardBody className="space-y-4">
            <FormField label="Category" htmlFor="post-category" required>
              <Input
                id="post-category"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              />
            </FormField>
            <FormField label="Author" htmlFor="post-author" required>
              <Input
                id="post-author"
                value={form.author}
                onChange={(e) => update("author", e.target.value)}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Date" htmlFor="post-date" required>
                <Input
                  id="post-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                />
              </FormField>
              <FormField label="Read time" htmlFor="post-readtime" required>
                <Input
                  id="post-readtime"
                  value={form.readTime}
                  onChange={(e) => update("readTime", e.target.value)}
                  placeholder="5 min read"
                />
              </FormField>
            </div>
            <FormField label="Status" htmlFor="post-status">
              <Select
                id="post-status"
                value={form.status}
                onChange={(e) => update("status", e.target.value as BlogPost["status"])}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </FormField>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-2">
          <FieldError>{validationError}</FieldError>
          <Button
            type="button"
            disabled={isUploadingImages}
            isLoading={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
          >
            Publish
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isUploadingImages}
            isLoading={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
          >
            Save as draft
          </Button>
        </div>
      </div>
    </form>
  );
}
