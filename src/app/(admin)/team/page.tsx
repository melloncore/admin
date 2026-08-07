"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, PageLoading, EmptyState } from "@/components/ui/Feedback";
import { Card, CardBody } from "@/components/ui/Card";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Avatar } from "@/components/ui/Avatar";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useCollection } from "@/hooks/useCollection";
import { teamApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { TeamMember } from "@/types";

const EMPTY: Omit<TeamMember, "id"> = {
  name: "",
  role: "",
  bio: "",
  initials: "",
  photoUrl: "",
  order: 0,
};

function initialsFrom(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default function TeamPage() {
  const { items, isLoading, create, update, remove } = useCollection<TeamMember>(teamApi);
  const { showToast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: TeamMember } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);

  const openCreate = () =>
    setModal({ mode: "create", draft: { id: "", ...EMPTY, order: items.length + 1 } });
  const openEdit = (member: TeamMember) => setModal({ mode: "edit", draft: member });

  const handleSave = async () => {
    if (!modal) return;
    const { draft, mode } = modal;
    if (!draft.name.trim() || !draft.role.trim()) return;
    const payload = { ...draft, initials: draft.initials || initialsFrom(draft.name) };
    if (mode === "create") {
      await create(payload);
      showToast("Team member added.");
    } else {
      await update(draft.id, payload);
      showToast("Team member updated.");
    }
    setModal(null);
  };

  return (
    <div>
      <PageHeader
        title="Team"
        description="Who shows up on the About page team grid."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Add team member
          </Button>
        }
      />

      {isLoading ? (
        <PageLoading />
      ) : items.length === 0 ? (
        <EmptyState title="No team members yet" description="Add your first team member." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((member) => (
            <Card key={member.id}>
              <CardBody className="flex flex-col items-start gap-3">
                <div className="flex w-full items-start justify-between">
                  <Avatar name={member.name} src={member.photoUrl} size="lg" />
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(member)}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPendingDelete(member)}>
                      <Trash2 size={14} className="text-coral-600" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-ink">{member.name}</p>
                  <p className="text-sm text-brand-700">{member.role}</p>
                  <p className="mt-1.5 text-sm text-ink-muted">{member.bio}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add team member" : "Edit team member"}
      >
        {modal && (
          <div className="space-y-4">
            <ImageUpload
              label="Photo"
              aspect="square"
              value={modal.draft.photoUrl}
              onChange={(v) => setModal({ ...modal, draft: { ...modal.draft, photoUrl: v } })}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Name" htmlFor="member-name" required>
                <Input
                  id="member-name"
                  value={modal.draft.name}
                  onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, name: e.target.value } })}
                />
              </FormField>
              <FormField label="Role" htmlFor="member-role" required>
                <Input
                  id="member-role"
                  value={modal.draft.role}
                  onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, role: e.target.value } })}
                />
              </FormField>
            </div>
            <FormField label="Bio" htmlFor="member-bio">
              <Textarea
                id="member-bio"
                rows={3}
                value={modal.draft.bio}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, bio: e.target.value } })}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {modal.mode === "create" ? "Add member" : "Save changes"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Remove ${pendingDelete?.name}?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Team member removed.", "info");
        }}
      />
    </div>
  );
}
