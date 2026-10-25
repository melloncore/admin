"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { blogApi } from "@/lib/api";
import type { BlogImage } from "@/types";

const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

interface BlogImageManagerProps {
  images: BlogImage[];
  onChange: (images: BlogImage[]) => void;
  onUploadingChange: (isUploading: boolean) => void;
}

export function BlogImageManager({
  images,
  onChange,
  onUploadingChange,
}: BlogImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      setError(`A post can have at most ${MAX_IMAGES} images.`);
      return;
    }
    const invalidFile = files.find(
      (file) =>
        !ACCEPTED_TYPES.has(file.type) || file.size === 0 || file.size > MAX_IMAGE_BYTES,
    );
    if (invalidFile) {
      setError("Choose JPEG, PNG, WebP, or AVIF images no larger than 5 MB each.");
      return;
    }

    setError("");
    setIsUploading(true);
    onUploadingChange(true);
    try {
      const nextImages = [...images];
      for (const file of files) {
        const uploaded = await blogApi.uploadImage(file);
        nextImages.push({
          ...uploaded,
          alt: file.name
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]+/g, " ")
            .trim(),
        });
        onChange([...nextImages]);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Image upload failed.",
      );
    } finally {
      setIsUploading(false);
      onUploadingChange(false);
    }
  }

  function updateAlt(index: number, alt: string) {
    onChange(
      images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, alt } : image,
      ),
    );
  }

  function removeImage(index: number) {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">Post images</p>
          <p className="mt-1 text-xs text-ink-muted">
            Upload 1–3 images. JPEG, PNG, WebP, or AVIF; up to 5 MB each.
          </p>
        </div>
        <span className="shrink-0 text-xs text-ink-muted">
          {images.length}/{MAX_IMAGES}
        </span>
      </div>

      {images.length > 0 && (
        <ul className="mb-4 space-y-3">
          {images.map((image, index) => (
            <li
              key={image.url}
              className="flex items-start gap-3 rounded-lg border border-line p-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt}
                className="h-16 w-20 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <label
                  htmlFor={`blog-image-alt-${index}`}
                  className="mb-1 block text-xs font-medium text-ink"
                >
                  Image description
                </label>
                <Input
                  id={`blog-image-alt-${index}`}
                  value={image.alt}
                  maxLength={180}
                  required
                  onChange={(event) => updateAlt(index, event.target.value)}
                  placeholder="Describe this image"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                aria-label={`Remove image ${index + 1}`}
                className="rounded-md p-2 text-coral-600 hover:bg-coral-50"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        aria-label="Upload blog images"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading || images.length >= MAX_IMAGES}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : images.length ? (
          <Upload size={14} />
        ) : (
          <ImagePlus size={14} />
        )}
        {isUploading ? "Uploading…" : "Upload images"}
      </Button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-coral-600">
          {error}
        </p>
      )}
    </div>
  );
}
