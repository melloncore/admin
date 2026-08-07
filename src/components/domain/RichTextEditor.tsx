"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Link2,
  ImagePlus,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/**
 * Lightweight contentEditable rich text editor — no external dependency
 * needed for a static build. Produces sanitized-enough HTML for a blog body;
 * swap for a full editor (e.g. Tiptap) later if requirements grow.
 */
export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exec = useCallback(
    (command: string, arg?: string) => {
      document.execCommand(command, false, arg);
      ref.current?.focus();
      onChange(ref.current?.innerHTML ?? "");
    },
    [onChange],
  );

  const handleInsertImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      exec("insertImage", reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleInsertLink = () => {
    const url = window.prompt("Link URL");
    if (url) exec("createLink", url);
  };

  const toolbarButtons: { icon: typeof Bold; label: string; action: () => void }[] = [
    { icon: Bold, label: "Bold", action: () => exec("bold") },
    { icon: Italic, label: "Italic", action: () => exec("italic") },
    { icon: Heading2, label: "Heading", action: () => exec("formatBlock", "H2") },
    { icon: Quote, label: "Quote", action: () => exec("formatBlock", "BLOCKQUOTE") },
    { icon: List, label: "Bullet list", action: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Numbered list", action: () => exec("insertOrderedList") },
    { icon: Link2, label: "Link", action: handleInsertLink },
    { icon: ImagePlus, label: "Image", action: () => fileInputRef.current?.click() },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-paper/60 p-1.5">
        {toolbarButtons.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            aria-label={label}
            title={label}
            className="rounded-md p-1.5 text-ink-soft transition hover:bg-white hover:text-ink hover:shadow-sm"
          >
            <Icon size={15} />
          </button>
        ))}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInsertImage}
          className="hidden"
        />
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        data-placeholder={placeholder}
        className={cn(
          "prose prose-sm min-h-[280px] max-w-none px-4 py-3 text-sm text-ink-soft focus:outline-none",
          "[&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink",
          "[&_blockquote]:border-l-2 [&_blockquote]:border-brand-300 [&_blockquote]:pl-3 [&_blockquote]:italic",
          "[&_img]:my-3 [&_img]:rounded-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "empty:before:text-ink-muted empty:before:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
}
