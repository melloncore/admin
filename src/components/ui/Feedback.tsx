import type { ReactNode } from "react";
import { Loader2, Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-ink-muted", className)} size={20} />;
}

export function PageLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-paper text-ink-muted">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm font-medium text-ink">{title}</p>
        {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "brand" | "coral" | "teal";
}) {
  const toneStyles = {
    brand: "bg-brand-50 text-brand-700",
    coral: "bg-coral-50 text-coral-600",
    teal: "bg-teal-50 text-teal-700",
  }[tone];

  return (
    <div className="rounded-xl border border-line bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneStyles)}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-ink">{value}</p>
      {delta && <p className="mt-1 text-xs text-teal-600">{delta}</p>}
    </div>
  );
}
