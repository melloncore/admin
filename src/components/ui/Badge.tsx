import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: "bg-paper text-ink-soft border-line",
  success: "bg-teal-50 text-teal-700 border-teal-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-coral-50 text-coral-700 border-coral-200",
  info: "bg-brand-50 text-brand-700 border-brand-200",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_STYLES[tone],
      )}
    >
      {children}
    </span>
  );
}
