"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FormField, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { generateId } from "@/lib/utils/id";
import type { FooterLink } from "@/types";

interface FooterLinkListProps {
  title: string;
  description?: string;
  links: FooterLink[];
  onChange: (links: FooterLink[]) => void;
}

export function FooterLinkList({ title, description, links, onChange }: FooterLinkListProps) {
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: FooterLink } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FooterLink | null>(null);

  const openCreate = () => setModal({ mode: "create", draft: { id: "", label: "", href: "" } });
  const openEdit = (link: FooterLink) => setModal({ mode: "edit", draft: link });

  const handleSave = () => {
    if (!modal || !modal.draft.label.trim()) return;
    if (modal.mode === "create") {
      onChange([...links, { ...modal.draft, id: generateId("link") }]);
    } else {
      onChange(links.map((l) => (l.id === modal.draft.id ? modal.draft : l)));
    }
    setModal(null);
  };

  return (
    <Card>
      <CardHeader
        title={title}
        description={description}
        actions={
          <Button type="button" variant="outline" size="sm" onClick={openCreate}>
            <Plus size={14} /> Add line
          </Button>
        }
      />
      <CardBody className="p-0">
        {links.length === 0 ? (
          <p className="px-5 py-6 text-sm text-ink-muted">No lines yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {links.map((link) => (
              <li key={link.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{link.label}</p>
                  <p className="truncate text-xs text-ink-muted">{link.href}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => openEdit(link)}>
                    <Pencil size={14} />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPendingDelete(link)}>
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
        title={modal?.mode === "create" ? "Add line" : "Edit line"}
        size="sm"
      >
        {modal && (
          <div className="space-y-4">
            <FormField label="Label" htmlFor="link-label" required>
              <Input
                id="link-label"
                value={modal.draft.label}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, label: e.target.value } })}
              />
            </FormField>
            <FormField label="Link / value" htmlFor="link-href">
              <Input
                id="link-href"
                value={modal.draft.href}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, href: e.target.value } })}
                placeholder="/about, mailto:hello@..., tel:+1..."
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave}>
                {modal.mode === "create" ? "Add line" : "Save changes"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Remove "${pendingDelete?.label}"?`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (!pendingDelete) return;
          onChange(links.filter((l) => l.id !== pendingDelete.id));
        }}
      />
    </Card>
  );
}
