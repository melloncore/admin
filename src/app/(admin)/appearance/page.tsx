"use client";

import { useEffect, useState } from "react";
import { PageHeader, PageLoading } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { ColorInput } from "@/components/ui/ColorInput";
import { Button } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { appearanceApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { applyBrandColors } from "@/lib/theme-runtime";
import { DEFAULT_APPEARANCE } from "@/lib/theme";
import type { AppearanceSettings } from "@/types";

export default function AppearancePage() {
  const { data, isLoading, isSaving, saveAll } = useSettings<AppearanceSettings>(appearanceApi);
  const { showToast } = useToast();
  const [form, setForm] = useState<AppearanceSettings | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  useEffect(() => {
    if (form) applyBrandColors(form);
  }, [form]);

  if (isLoading || !form) return <PageLoading />;

  const handleSave = async () => {
    await saveAll(form);
    showToast("Brand colors updated across the site.");
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_APPEARANCE });
  };

  return (
    <div>
      <PageHeader
        title="Appearance"
        description="Set the brand colors used across the public site."
        actions={
          <Button variant="outline" onClick={handleReset}>
            Reset to defaults
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Brand colors" />
          <CardBody className="space-y-5">
            <ColorInput
              label="Primary color"
              value={form.primaryColor}
              onChange={(v) => setForm({ ...form, primaryColor: v })}
              hint="Used for headings, buttons, and the main navigation"
            />
            <ColorInput
              label="Secondary color"
              value={form.secondaryColor}
              onChange={(v) => setForm({ ...form, secondaryColor: v })}
              hint="Used for accents and calls to action"
            />
            <ColorInput
              label="Tertiary color"
              value={form.tertiaryColor}
              onChange={(v) => setForm({ ...form, tertiaryColor: v })}
              hint="Used for supporting highlights, e.g. success states"
            />
          </CardBody>
          <div className="flex justify-end border-t border-line px-5 py-3">
            <Button onClick={handleSave} isLoading={isSaving}>
              Save colors
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Live preview" />
          <CardBody className="space-y-3">
            <div
              className="rounded-lg p-4 text-white"
              style={{ backgroundColor: form.primaryColor }}
            >
              <p className="text-sm font-semibold">Primary surface</p>
              <p className="text-xs opacity-80">Navigation, hero background</p>
            </div>
            <button
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: form.secondaryColor }}
            >
              Secondary button
            </button>
            <div
              className="rounded-lg border px-4 py-2.5 text-sm font-medium"
              style={{ borderColor: form.tertiaryColor, color: form.tertiaryColor }}
            >
              Tertiary highlight
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
