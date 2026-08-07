"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { PageHeader, PageLoading } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useSettings } from "@/hooks/useSettings";
import { contactApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { generateId } from "@/lib/utils/id";
import type { ContactChannel, ContactSettings } from "@/types";

const ICONS: Record<ContactChannel["type"], typeof Mail> = {
  email: Mail,
  phone: Phone,
  address: MapPin,
};

const EMPTY: Omit<ContactChannel, "id"> = { type: "email", label: "", value: "" };

export default function ContactPage() {
  const { data, isLoading, isSaving, saveAll } = useSettings<ContactSettings>(contactApi);
  const { showToast } = useToast();
  const [form, setForm] = useState<ContactSettings | null>(null);
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: ContactChannel } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ContactChannel | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) return <PageLoading />;

  const persist = async (next: ContactSettings) => {
    setForm(next);
    await saveAll(next);
  };

  const handleResponseTimeSave = async () => {
    await saveAll(form);
    showToast("Response time updated.");
  };

  const openCreate = () => setModal({ mode: "create", draft: { id: "", ...EMPTY } });
  const openEdit = (channel: ContactChannel) => setModal({ mode: "edit", draft: channel });

  const handleSaveChannel = async () => {
    if (!modal || !modal.draft.value.trim()) return;
    let next: ContactSettings;
    if (modal.mode === "create") {
      next = { ...form, channels: [...form.channels, { ...modal.draft, id: generateId("ch") }] };
      showToast("Contact channel added.");
    } else {
      next = {
        ...form,
        channels: form.channels.map((c) => (c.id === modal.draft.id ? modal.draft : c)),
      };
      showToast("Contact channel updated.");
    }
    await persist(next);
    setModal(null);
  };

  const handleDeleteChannel = async () => {
    if (!pendingDelete) return;
    await persist({ ...form, channels: form.channels.filter((c) => c.id !== pendingDelete.id) });
    showToast("Contact channel removed.", "info");
    setPendingDelete(null);
  };

  return (
    <div>
      <PageHeader title="Contact info" description="Channels and response time shown on the Contact page." />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Response time" description="Shown near the contact form to set expectations" />
          <CardBody>
            <FormField label="Message" htmlFor="response-time">
              <Textarea
                id="response-time"
                rows={2}
                value={form.responseTime}
                onChange={(e) => setForm({ ...form, responseTime: e.target.value })}
              />
            </FormField>
          </CardBody>
          <div className="flex justify-end border-t border-line px-5 py-3">
            <Button onClick={handleResponseTimeSave} isLoading={isSaving}>
              Save
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Contact channels"
            description="Emails, phone numbers and addresses"
            actions={
              <Button variant="outline" size="sm" onClick={openCreate}>
                <Plus size={14} /> Add channel
              </Button>
            }
          />
          <CardBody className="p-0">
            {form.channels.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-muted">No contact channels yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {form.channels.map((channel) => {
                  const Icon = ICONS[channel.type];
                  return (
                    <li key={channel.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{channel.label}</p>
                          <p className="text-sm text-ink-muted">{channel.value}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(channel)}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setPendingDelete(channel)}>
                          <Trash2 size={14} className="text-coral-600" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add contact channel" : "Edit contact channel"}
        size="sm"
      >
        {modal && (
          <div className="space-y-4">
            <FormField label="Type" htmlFor="channel-type">
              <Select
                id="channel-type"
                value={modal.draft.type}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, type: e.target.value as ContactChannel["type"] } })
                }
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="address">Address</option>
              </Select>
            </FormField>
            <FormField label="Label" htmlFor="channel-label" required hint="e.g. General enquiries, Support">
              <Input
                id="channel-label"
                value={modal.draft.label}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, label: e.target.value } })}
              />
            </FormField>
            <FormField label="Value" htmlFor="channel-value" required>
              <Input
                id="channel-value"
                value={modal.draft.value}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, value: e.target.value } })}
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChannel}>{modal.mode === "create" ? "Add channel" : "Save changes"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Remove "${pendingDelete?.label}"?`}
        confirmLabel="Remove"
        onConfirm={handleDeleteChannel}
      />
    </div>
  );
}
