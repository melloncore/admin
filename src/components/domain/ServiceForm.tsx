"use client";

import { useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FormField, Input, Textarea, Select } from "@/components/ui/Field";
import { TagInput } from "@/components/ui/TagInput";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { EngagementModel, Service } from "@/types";
import { generateId } from "@/lib/utils/id";
import { slugify } from "@/lib/utils/id";

export type ServiceFormValues = Omit<Service, "id" | "updatedAt">;

const EMPTY_ENGAGEMENT: Omit<EngagementModel, "id"> = {
  name: "",
  description: "",
  bestFor: "",
  priceRange: "",
};

interface ServiceFormProps {
  initialValues: ServiceFormValues;
  onSubmit: (values: ServiceFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function ServiceForm({
  initialValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save service",
}: ServiceFormProps) {
  const [form, setForm] = useState<ServiceFormValues>(initialValues);
  const [engagementModal, setEngagementModal] = useState<{
    mode: "create" | "edit";
    draft: Omit<EngagementModel, "id"> & { id?: string };
  } | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const update = <K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: prev.slug === slugify(prev.title) || !prev.slug ? slugify(title) : prev.slug,
    }));
  };

  const saveEngagement = () => {
    if (!engagementModal) return;
    const { draft } = engagementModal;
    if (!draft.name.trim()) return;

    if (engagementModal.mode === "create") {
      update("engagementModels", [
        ...form.engagementModels,
        { ...draft, id: generateId("eng") } as EngagementModel,
      ]);
    } else {
      update(
        "engagementModels",
        form.engagementModels.map((m) => (m.id === draft.id ? ({ ...draft } as EngagementModel) : m)),
      );
    }
    setEngagementModal(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader title="Details" />
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Title" htmlFor="title" required>
              <Input id="title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
            </FormField>
            <FormField label="Slug" htmlFor="slug" hint="Used in the service page URL" required>
              <Input id="slug" value={form.slug} onChange={(e) => update("slug", slugify(e.target.value))} required />
            </FormField>
          </div>
          <FormField label="Short description" htmlFor="shortDescription" hint="Shown on the services grid card" required>
            <Textarea
              id="shortDescription"
              rows={2}
              value={form.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Full description" htmlFor="description" required>
            <Textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Deliverables" htmlFor="deliverables" hint="Shown as a checklist on the service page">
            <TagInput
              values={form.deliverables}
              onChange={(values) => update("deliverables", values)}
              placeholder="e.g. API design & integrations"
            />
          </FormField>
        </CardBody>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader title="Appearance" />
          <CardBody className="space-y-4">
            <FormField label="Accent color" htmlFor="color">
              <Select id="color" value={form.color} onChange={(e) => update("color", e.target.value as Service["color"])}>
                <option value="coral">Coral</option>
                <option value="teal">Teal</option>
                <option value="brand">Brand navy</option>
              </Select>
            </FormField>
            <FormField label="Icon name" htmlFor="icon" hint="Lucide icon identifier, e.g. code, server, cpu">
              <Input id="icon" value={form.icon} onChange={(e) => update("icon", e.target.value)} />
            </FormField>
            <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-ink">Published</p>
                <p className="text-xs text-ink-muted">Visible on the public services page</p>
              </div>
              <Toggle checked={form.isPublished} onChange={(v) => update("isPublished", v)} label="Published" />
            </div>
          </CardBody>
        </Card>

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>

      <Card className="lg:col-span-3">
        <CardHeader
          title="Engagement models"
          description="How clients can work with you for this service"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEngagementModal({ mode: "create", draft: { ...EMPTY_ENGAGEMENT } })}
            >
              <Plus size={14} /> Add model
            </Button>
          }
        />
        <CardBody className="p-0">
          {form.engagementModels.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-muted">
              No engagement models yet. Add one to show pricing options on this service's page.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {form.engagementModels.map((model) => (
                <li key={model.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{model.name}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{model.description}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Best for {model.bestFor} · {model.priceRange}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEngagementModal({ mode: "edit", draft: { ...model } })}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDeleteId(model.id)}
                    >
                      <Trash2 size={14} className="text-coral-600" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={!!engagementModal}
        onClose={() => setEngagementModal(null)}
        title={engagementModal?.mode === "create" ? "Add engagement model" : "Edit engagement model"}
        size="sm"
      >
        {engagementModal && (
          <div className="space-y-4">
            <FormField label="Name" htmlFor="eng-name" required>
              <Input
                id="eng-name"
                value={engagementModal.draft.name}
                onChange={(e) =>
                  setEngagementModal({
                    ...engagementModal,
                    draft: { ...engagementModal.draft, name: e.target.value },
                  })
                }
              />
            </FormField>
            <FormField label="Description" htmlFor="eng-desc">
              <Textarea
                id="eng-desc"
                rows={2}
                value={engagementModal.draft.description}
                onChange={(e) =>
                  setEngagementModal({
                    ...engagementModal,
                    draft: { ...engagementModal.draft, description: e.target.value },
                  })
                }
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Best for" htmlFor="eng-bestfor">
                <Input
                  id="eng-bestfor"
                  value={engagementModal.draft.bestFor}
                  onChange={(e) =>
                    setEngagementModal({
                      ...engagementModal,
                      draft: { ...engagementModal.draft, bestFor: e.target.value },
                    })
                  }
                />
              </FormField>
              <FormField label="Price range" htmlFor="eng-price">
                <Input
                  id="eng-price"
                  value={engagementModal.draft.priceRange}
                  onChange={(e) =>
                    setEngagementModal({
                      ...engagementModal,
                      draft: { ...engagementModal.draft, priceRange: e.target.value },
                    })
                  }
                />
              </FormField>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEngagementModal(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={saveEngagement}>
                {engagementModal.mode === "create" ? "Add model" : "Save changes"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDeleteId}
        onClose={() => setPendingDeleteId(null)}
        title="Remove this engagement model?"
        confirmLabel="Remove"
        onConfirm={() => {
          update(
            "engagementModels",
            form.engagementModels.filter((m) => m.id !== pendingDeleteId),
          );
        }}
      />
    </form>
  );
}
