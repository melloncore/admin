"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { PageHeader } from "@/components/ui/Feedback";
import { Card, CardBody } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { useCollection } from "@/hooks/useCollection";
import { testimonialsApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { Testimonial } from "@/types";

const EMPTY: Omit<Testimonial, "id"> = {
  quote: "",
  name: "",
  role: "",
  company: "",
  avatarUrl: "",
  rating: 5,
  isFeatured: false,
};

export default function TestimonialsPage() {
  const { items, isLoading, create, update, remove } = useCollection<Testimonial>(testimonialsApi);
  const { showToast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: Testimonial } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Testimonial | null>(null);

  const openCreate = () => setModal({ mode: "create", draft: { id: "", ...EMPTY } });
  const openEdit = (row: Testimonial) => setModal({ mode: "edit", draft: row });

  const handleSave = async () => {
    if (!modal) return;
    const { draft, mode } = modal;
    if (!draft.quote.trim() || !draft.name.trim()) return;
    if (mode === "create") {
      const { id: _id, ...rest } = draft;
      await create(rest);
      showToast("Testimonial added.");
    } else {
      await update(draft.id, draft);
      showToast("Testimonial updated.");
    }
    setModal(null);
  };

  const columns: Column<Testimonial>[] = [
    {
      header: "Quote",
      accessor: (row) => <p className="max-w-sm truncate">&ldquo;{row.quote}&rdquo;</p>,
    },
    {
      header: "Client",
      accessor: (row) => (
        <div>
          <p className="font-medium text-ink">{row.name}</p>
          <p className="text-xs text-ink-muted">
            {row.role} · {row.company}
          </p>
        </div>
      ),
    },
    {
      header: "Rating",
      accessor: (row) => (
        <span className="flex items-center gap-0.5 text-amber-500">
          {Array.from({ length: row.rating }).map((_, i) => (
            <Star key={i} size={13} fill="currentColor" />
          ))}
        </span>
      ),
    },
    {
      header: "Featured",
      accessor: (row) => (row.isFeatured ? <Badge tone="success">Featured</Badge> : <Badge>Standard</Badge>),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Client testimonials"
        description="Quotes shown on the homepage and About page."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Add testimonial
          </Button>
        }
      />

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            emptyTitle="No testimonials yet"
            actions={(row) => (
              <>
                <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                  <Pencil size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPendingDelete(row)}>
                  <Trash2 size={14} className="text-coral-600" />
                </Button>
              </>
            )}
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add testimonial" : "Edit testimonial"}
      >
        {modal && (
          <div className="space-y-4">
            <FormField label="Quote" htmlFor="t-quote" required>
              <Textarea
                id="t-quote"
                rows={3}
                value={modal.draft.quote}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, quote: e.target.value } })}
              />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Name" htmlFor="t-name" required>
                <Input
                  id="t-name"
                  value={modal.draft.name}
                  onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, name: e.target.value } })}
                />
              </FormField>
              <FormField label="Role" htmlFor="t-role">
                <Input
                  id="t-role"
                  value={modal.draft.role}
                  onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, role: e.target.value } })}
                />
              </FormField>
              <FormField label="Company" htmlFor="t-company">
                <Input
                  id="t-company"
                  value={modal.draft.company}
                  onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, company: e.target.value } })}
                />
              </FormField>
            </div>
            <FormField label="Rating" htmlFor="t-rating" hint="1–5 stars">
              <Input
                id="t-rating"
                type="number"
                min={1}
                max={5}
                value={modal.draft.rating}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, rating: Number(e.target.value) } })
                }
              />
            </FormField>
            <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-ink">Featured</p>
                <p className="text-xs text-ink-muted">Show prominently on the homepage</p>
              </div>
              <Toggle
                checked={modal.draft.isFeatured}
                onChange={(v) => setModal({ ...modal, draft: { ...modal.draft, isFeatured: v } })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{modal.mode === "create" ? "Add testimonial" : "Save changes"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Remove testimonial from ${pendingDelete?.name}?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Testimonial removed.", "info");
        }}
      />
    </div>
  );
}
