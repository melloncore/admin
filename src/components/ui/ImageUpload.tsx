"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Link2, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  aspect?: "square" | "wide" | "banner";
}

const ASPECT_STYLES = {
  square: "aspect-square",
  wide: "aspect-video",
  banner: "aspect-[3/1]",
};

/**
 * Lets an admin either paste an image URL or upload a file from disk.
 * Uploaded files are read as data URLs so everything works before a real
 * media/API backend exists — swap the upload handler for a real endpoint
 * later without touching call sites.
 */
export function ImageUpload({ value, onChange, label = "Image", aspect = "wide" }: ImageUploadProps) {
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        <div className="flex gap-1 rounded-md bg-paper p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 transition",
              mode === "upload" ? "bg-white shadow-sm" : "text-ink-muted",
            )}
          >
            <Upload size={12} /> Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn(
              "flex items-center gap-1 rounded px-2 py-1 transition",
              mode === "url" ? "bg-white shadow-sm" : "text-ink-muted",
            )}
          >
            <Link2 size={12} /> URL
          </button>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-dashed border-line bg-paper",
          ASPECT_STYLES[aspect],
        )}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-ink-muted">
            <ImagePlus size={22} />
            <span className="text-xs">No image selected</span>
          </div>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Remove image"
            className="absolute right-2 top-2 rounded-md bg-white/90 p-1.5 text-coral-600 shadow-sm transition hover:bg-white"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="mt-2">
        {mode === "upload" ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={14} /> Choose file
            </Button>
          </>
        ) : (
          <Input
            placeholder="https://example.com/image.jpg"
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
