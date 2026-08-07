"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // No email backend yet — this simulates the request so the flow can be
    // wired to a real endpoint later without changing the UI.
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    setIsSent(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white">
            <Layers size={20} />
          </span>
          <h1 className="font-display text-xl font-semibold text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-ink-muted">
            We'll send a reset link to your email address
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white p-6 shadow-soft">
          {isSent ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <MailCheck className="text-teal-600" size={28} />
              <p className="text-sm font-medium text-ink">Check your inbox</p>
              <p className="text-sm text-ink-muted">
                If an account exists for {email}, a reset link is on its way.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Email" htmlFor="email" required>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormField>
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Send reset link
              </Button>
            </form>
          )}
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
