"use client";

import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white">
            <Layers size={20} />
          </span>
          <h1 className="font-display text-xl font-semibold text-ink">
            Reset your password
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Contact your account owner to recover access.
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
          <p className="text-sm leading-6 text-ink-muted">
            Password recovery by email is not enabled for this installation, so no reset
            request was sent. If you are signed in, change your password in Account
            settings. Otherwise ask another administrator for help.
          </p>
        </div>

        <Link
          href="/login"
          className="mt-4 flex items-center justify-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}
