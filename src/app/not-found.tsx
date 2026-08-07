import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
      <p className="font-display text-3xl font-semibold text-ink">404</p>
      <p className="text-sm text-ink-muted">This page doesn't exist.</p>
      <Link href="/dashboard" className="text-sm font-medium text-brand-700 hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
