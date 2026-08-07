"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader, PageLoading } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FooterLinkList } from "@/components/domain/FooterLinkList";
import { useSettings } from "@/hooks/useSettings";
import { footerApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { generateId } from "@/lib/utils/id";
import type { FooterSettings, SocialLink } from "@/types";

export default function FooterPage() {
  const { data, isLoading, isSaving, saveAll } = useSettings<FooterSettings>(footerApi);
  const { showToast } = useToast();
  const [form, setForm] = useState<FooterSettings | null>(null);
  const [socialModal, setSocialModal] = useState<{ mode: "create" | "edit"; draft: SocialLink } | null>(null);
  const [pendingDeleteSocial, setPendingDeleteSocial] = useState<SocialLink | null>(null);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (isLoading || !form) return <PageLoading />;

  const persist = async (next: FooterSettings, message?: string) => {
    setForm(next);
    await saveAll(next);
    if (message) showToast(message);
  };

  const handleSaveGeneral = async () => {
    await saveAll(form);
    showToast("Footer updated.");
  };

  const openCreateSocial = () =>
    setSocialModal({ mode: "create", draft: { id: "", platform: "", icon: "", url: "" } });
  const openEditSocial = (link: SocialLink) => setSocialModal({ mode: "edit", draft: link });

  const handleSaveSocial = async () => {
    if (!socialModal || !socialModal.draft.platform.trim()) return;
    let next: FooterSettings;
    if (socialModal.mode === "create") {
      next = {
        ...form,
        socialLinks: [...form.socialLinks, { ...socialModal.draft, id: generateId("soc") }],
      };
    } else {
      next = {
        ...form,
        socialLinks: form.socialLinks.map((s) => (s.id === socialModal.draft.id ? socialModal.draft : s)),
      };
    }
    await persist(next, socialModal.mode === "create" ? "Social link added." : "Social link updated.");
    setSocialModal(null);
  };

  return (
    <div>
      <PageHeader title="Footer" description="Logo, description, links and copyright shown site-wide." />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Brand" />
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-[200px_1fr]">
            <ImageUpload
              label="Logo"
              aspect="square"
              value={form.logoUrl}
              onChange={(v) => setForm({ ...form, logoUrl: v })}
            />
            <div className="space-y-4">
              <FormField label="Company description" htmlFor="footer-description">
                <Textarea
                  id="footer-description"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </FormField>
              <FormField label="Copyright year" htmlFor="copyright-year" hint="Shown as © [year] Nexlayer">
                <Input
                  id="copyright-year"
                  type="number"
                  value={form.copyrightYear}
                  onChange={(e) => setForm({ ...form, copyrightYear: Number(e.target.value) })}
                  className="w-32"
                />
              </FormField>
            </div>
          </CardBody>
          <div className="flex justify-end border-t border-line px-5 py-3">
            <Button onClick={handleSaveGeneral} isLoading={isSaving}>
              Save brand settings
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Social links"
            description="Icon + URL shown in the footer"
            actions={
              <Button variant="outline" size="sm" onClick={openCreateSocial}>
                <Plus size={14} /> Add social link
              </Button>
            }
          />
          <CardBody className="p-0">
            {form.socialLinks.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-muted">No social links yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {form.socialLinks.map((social) => (
                  <li key={social.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{social.platform}</p>
                      <p className="text-xs text-ink-muted">{social.url}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditSocial(social)}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setPendingDeleteSocial(social)}>
                        <Trash2 size={14} className="text-coral-600" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <FooterLinkList
          title="Company lines"
          description="e.g. About, Careers, Blog"
          links={form.companyLinks}
          onChange={(links) => persist({ ...form, companyLinks: links })}
        />
        <FooterLinkList
          title="Services lines"
          description="Quick links to service pages"
          links={form.serviceLinks}
          onChange={(links) => persist({ ...form, serviceLinks: links })}
        />
        <FooterLinkList
          title="Contact lines"
          description="Quick contact details shown in the footer"
          links={form.contactLinks}
          onChange={(links) => persist({ ...form, contactLinks: links })}
        />
      </div>

      <Modal
        isOpen={!!socialModal}
        onClose={() => setSocialModal(null)}
        title={socialModal?.mode === "create" ? "Add social link" : "Edit social link"}
        size="sm"
      >
        {socialModal && (
          <div className="space-y-4">
            <FormField label="Platform" htmlFor="social-platform" required>
              <Input
                id="social-platform"
                value={socialModal.draft.platform}
                onChange={(e) =>
                  setSocialModal({ ...socialModal, draft: { ...socialModal.draft, platform: e.target.value } })
                }
                placeholder="Twitter, LinkedIn, GitHub…"
              />
            </FormField>
            <FormField label="Icon name" htmlFor="social-icon" hint="Lucide icon identifier">
              <Input
                id="social-icon"
                value={socialModal.draft.icon}
                onChange={(e) =>
                  setSocialModal({ ...socialModal, draft: { ...socialModal.draft, icon: e.target.value } })
                }
                placeholder="twitter"
              />
            </FormField>
            <FormField label="URL" htmlFor="social-url" required>
              <Input
                id="social-url"
                value={socialModal.draft.url}
                onChange={(e) =>
                  setSocialModal({ ...socialModal, draft: { ...socialModal.draft, url: e.target.value } })
                }
                placeholder="https://…"
              />
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSocialModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSocial}>
                {socialModal.mode === "create" ? "Add link" : "Save changes"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDeleteSocial}
        onClose={() => setPendingDeleteSocial(null)}
        title={`Remove "${pendingDeleteSocial?.platform}"?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDeleteSocial) return;
          await persist(
            { ...form, socialLinks: form.socialLinks.filter((s) => s.id !== pendingDeleteSocial.id) },
            "Social link removed.",
          );
        }}
      />
    </div>
  );
}
