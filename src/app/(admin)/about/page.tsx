"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, PageLoading } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSettings } from "@/hooks/useSettings";
import { useCollection } from "@/hooks/useCollection";
import { aboutApi, valuesApi, statsApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { AboutContent, Stat, ValueItem } from "@/types";

export default function AboutPage() {
  return (
    <div>
      <PageHeader title="About & values" description="The company story, values, and headline stats." />
      <div className="space-y-6">
        <AboutDescriptionCard />
        <ValuesCard />
        <StatsCard />
      </div>
    </div>
  );
}

function AboutDescriptionCard() {
  const { data, isLoading, isSaving, save } = useSettings<AboutContent>(aboutApi);
  const { showToast } = useToast();
  const [form, setForm] = useState<AboutContent | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) return <PageLoading />;

  const update = <K extends keyof AboutContent>(key: K, value: AboutContent[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await save(form);
    showToast("About section updated.");
  };

  return (
    <Card>
      <CardHeader title="Company description" description="Shown at the top of the About page" />
      <form onSubmit={handleSubmit}>
        <CardBody className="space-y-4">
          <FormField label="Title" htmlFor="about-title" required>
            <Input id="about-title" value={form.title} onChange={(e) => update("title", e.target.value)} required />
          </FormField>
          <FormField label="Description" htmlFor="about-desc" required>
            <Textarea
              id="about-desc"
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </FormField>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Mission title" htmlFor="mission-title">
              <Input
                id="mission-title"
                value={form.missionTitle}
                onChange={(e) => update("missionTitle", e.target.value)}
              />
            </FormField>
            <FormField label="Mission description" htmlFor="mission-desc">
              <Input
                id="mission-desc"
                value={form.missionDescription}
                onChange={(e) => update("missionDescription", e.target.value)}
              />
            </FormField>
          </div>
        </CardBody>
        <div className="flex justify-end border-t border-line px-5 py-3">
          <Button type="submit" isLoading={isSaving}>
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

const EMPTY_VALUE: Omit<ValueItem, "id"> = { title: "", description: "", order: 0 };

function ValuesCard() {
  const { items, isLoading, create, update, remove } = useCollection<ValueItem>(valuesApi);
  const { showToast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: ValueItem } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ValueItem | null>(null);

  const openCreate = () =>
    setModal({ mode: "create", draft: { id: "", ...EMPTY_VALUE, order: items.length + 1 } });
  const openEdit = (item: ValueItem) => setModal({ mode: "edit", draft: item });

  const handleSave = async () => {
    if (!modal) return;
    const { draft, mode } = modal;
    if (!draft.title.trim()) return;
    if (mode === "create") {
      await create({ title: draft.title, description: draft.description, order: draft.order });
      showToast("Value added.");
    } else {
      await update(draft.id, draft);
      showToast("Value updated.");
    }
    setModal(null);
  };

  return (
    <Card>
      <CardHeader
        title="Our values"
        description="What we tell prospective clients we stand for"
        actions={
          <Button type="button" variant="outline" size="sm" onClick={openCreate}>
            <Plus size={14} /> Add value
          </Button>
        }
      />
      <CardBody className="p-0">
        {isLoading ? (
          <PageLoading />
        ) : items.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-muted">No values added yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {items
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((value) => (
                <li key={value.id} className="flex items-start justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-sm font-medium text-ink">{value.title}</p>
                    <p className="mt-0.5 text-sm text-ink-muted">{value.description}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(value)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPendingDelete(value)}>
                      <Trash2 size={14} className="text-coral-600" />
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </CardBody>

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add value" : "Edit value"}
        size="sm"
      >
        {modal && (
          <div className="space-y-4">
            <FormField label="Title" htmlFor="value-title" required>
              <Input
                id="value-title"
                value={modal.draft.title}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, title: e.target.value } })}
              />
            </FormField>
            <FormField label="Description" htmlFor="value-desc" required>
              <Textarea
                id="value-desc"
                rows={3}
                value={modal.draft.description}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, description: e.target.value } })}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{modal.mode === "create" ? "Add value" : "Save changes"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Remove "${pendingDelete?.title}"?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Value removed.", "info");
        }}
      />
    </Card>
  );
}

const EMPTY_STAT: Omit<Stat, "id"> = { label: "", value: "", percentage: 0, order: 0 };

function StatsCard() {
  const { items, isLoading, create, update, remove } = useCollection<Stat>(statsApi);
  const { showToast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: Stat } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Stat | null>(null);

  const openCreate = () =>
    setModal({ mode: "create", draft: { id: "", ...EMPTY_STAT, order: items.length + 1 } });
  const openEdit = (item: Stat) => setModal({ mode: "edit", draft: item });

  const handleSave = async () => {
    if (!modal) return;
    const { draft, mode } = modal;
    if (!draft.label.trim() || !draft.value.trim()) return;
    if (mode === "create") {
      await create({ label: draft.label, value: draft.value, percentage: draft.percentage, order: draft.order });
      showToast("Stat added.");
    } else {
      await update(draft.id, draft);
      showToast("Stat updated.");
    }
    setModal(null);
  };

  return (
    <Card>
      <CardHeader
        title="Company stats"
        description="Headline numbers and their fill percentage, e.g. for progress bars"
        actions={
          <Button type="button" variant="outline" size="sm" onClick={openCreate}>
            <Plus size={14} /> Add stat
          </Button>
        }
      />
      <CardBody className="p-0">
        {isLoading ? (
          <PageLoading />
        ) : items.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-muted">No stats added yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {items
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((stat) => (
                <li key={stat.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="text-lg font-semibold text-ink">{stat.value}</p>
                      <p className="text-sm text-ink-muted">{stat.label}</p>
                    </div>
                    <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-paper">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${Math.min(stat.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(stat)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPendingDelete(stat)}>
                      <Trash2 size={14} className="text-coral-600" />
                    </Button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </CardBody>

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add stat" : "Edit stat"}
        size="sm"
      >
        {modal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Value" htmlFor="stat-value" required hint="e.g. 98% or 120+">
                <Input
                  id="stat-value"
                  value={modal.draft.value}
                  onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, value: e.target.value } })}
                />
              </FormField>
              <FormField label="Label" htmlFor="stat-label" required>
                <Input
                  id="stat-label"
                  value={modal.draft.label}
                  onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, label: e.target.value } })}
                />
              </FormField>
            </div>
            <FormField label="Fill percentage" htmlFor="stat-pct" hint="0–100, used for progress bar width">
              <Input
                id="stat-pct"
                type="number"
                min={0}
                max={100}
                value={modal.draft.percentage}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, percentage: Number(e.target.value) } })
                }
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{modal.mode === "create" ? "Add stat" : "Save changes"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Remove "${pendingDelete?.label}"?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Stat removed.", "info");
        }}
      />
    </Card>
  );
}
