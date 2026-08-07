"use client";

import { useEffect, useState, type FormEvent } from "react";
import { PageHeader, PageLoading } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { heroApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { HeroContent } from "@/types";
import { nowIso } from "@/lib/utils/date";

export default function HeroPage() {
  const { data, isLoading, isSaving, save } = useSettings<HeroContent>(heroApi);
  const { showToast } = useToast();
  const [form, setForm] = useState<HeroContent | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) return <PageLoading />;

  const update = <K extends keyof HeroContent>(key: K, value: HeroContent[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await save({ ...form, updatedAt: nowIso() });
    showToast("Hero section updated.");
  };

  return (
    <div>
      <PageHeader
        title="Hero section"
        description="Controls the first thing visitors see on the homepage."
      />

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Content" />
          <CardBody className="space-y-4">
            <FormField label="Eyebrow text" htmlFor="eyebrow" hint="Small label above the headline">
              <Input id="eyebrow" value={form.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} />
            </FormField>
            <FormField label="Headline" htmlFor="headline" required>
              <Textarea
                id="headline"
                rows={2}
                value={form.headline}
                onChange={(e) => update("headline", e.target.value)}
                required
              />
            </FormField>
            <FormField label="Subheadline" htmlFor="subheadline" required>
              <Textarea
                id="subheadline"
                rows={3}
                value={form.subheadline}
                onChange={(e) => update("subheadline", e.target.value)}
                required
              />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Primary button label" htmlFor="ctaLabel">
                <Input
                  id="ctaLabel"
                  value={form.primaryCtaLabel}
                  onChange={(e) => update("primaryCtaLabel", e.target.value)}
                />
              </FormField>
              <FormField label="Primary button link" htmlFor="ctaHref">
                <Input
                  id="ctaHref"
                  value={form.primaryCtaHref}
                  onChange={(e) => update("primaryCtaHref", e.target.value)}
                />
              </FormField>
              <FormField label="Secondary button label" htmlFor="cta2Label">
                <Input
                  id="cta2Label"
                  value={form.secondaryCtaLabel}
                  onChange={(e) => update("secondaryCtaLabel", e.target.value)}
                />
              </FormField>
              <FormField label="Secondary button link" htmlFor="cta2Href">
                <Input
                  id="cta2Href"
                  value={form.secondaryCtaHref}
                  onChange={(e) => update("secondaryCtaHref", e.target.value)}
                />
              </FormField>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Hero image" />
            <CardBody className="space-y-4">
              <ImageUpload
                label="Hero image"
                aspect="wide"
                value={form.imageUrl}
                onChange={(value) => update("imageUrl", value)}
              />
              <FormField label="Alt text" htmlFor="imageAlt" hint="Describe the image for accessibility & SEO">
                <Input id="imageAlt" value={form.imageAlt} onChange={(e) => update("imageAlt", e.target.value)} />
              </FormField>
            </CardBody>
          </Card>
          <Button type="submit" className="w-full" isLoading={isSaving}>
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
