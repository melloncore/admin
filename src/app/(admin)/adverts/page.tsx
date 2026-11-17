"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Pencil, Trash2, Upload } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FormField, Input, Textarea } from "@/components/ui/Field";
import { PageHeader } from "@/components/ui/Feedback";
import { useToast } from "@/context/ToastContext";
import { useCollection } from "@/hooks/useCollection";
import { advertsApi, type AdvertInput } from "@/lib/api/adverts";
import type { MarketplaceAdvert } from "@/types";

const EMPTY_FORM: AdvertInput = {
  title: "",
  description: "",
  imageUrl: null,
  imageAlt: null,
  linkUrl: "",
  active: false,
  sortOrder: 0,
};

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function MarketplaceAdvertsPage() {
  const { items, isLoading, error, create, update, remove } =
    useCollection<MarketplaceAdvert>(advertsApi);
  const { showToast } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<AdvertInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MarketplaceAdvert | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const sortedItems = [...items].sort(
    (first, second) =>
      first.sortOrder - second.sortOrder ||
      second.createdAt?.localeCompare(first.createdAt ?? "") ||
      0,
  );

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
  }

  function editAdvert(advert: MarketplaceAdvert) {
    setEditingId(advert.id);
    setForm({
      title: advert.title,
      description: advert.description ?? "",
      imageUrl: advert.imageUrl,
      imageAlt: advert.imageAlt,
      linkUrl: advert.linkUrl ?? "",
      active: advert.active,
      sortOrder: advert.sortOrder,
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!IMAGE_TYPES.has(file.type) || file.size === 0 || file.size > MAX_IMAGE_BYTES) {
      setFormError("Choose a JPEG, PNG, WebP, or AVIF image no larger than 5 MB.");
      return;
    }

    setIsUploading(true);
    setFormError("");
    try {
      const uploaded = await advertsApi.uploadImage(file);
      setForm((current) => ({
        ...current,
        imageUrl: uploaded.url,
        imageAlt:
          current.imageAlt || file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      }));
      showToast("Advert image uploaded.");
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : "Could not upload the image.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function saveAdvert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!form.description?.trim() && !form.imageUrl) {
      setFormError("Add advert text or upload an image.");
      return;
    }
    if (form.imageUrl && !form.imageAlt?.trim()) {
      setFormError("Add alternative text describing the image.");
      return;
    }

    setIsSaving(true);
    try {
      const payload: AdvertInput = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
        imageAlt: form.imageUrl ? form.imageAlt?.trim() || null : null,
        linkUrl: form.linkUrl?.trim() || null,
      };
      if (editingId) {
        await update(editingId, payload);
        showToast("Advert updated.");
      } else {
        await create(payload);
        showToast("Advert created.");
      }
      resetForm();
    } catch (cause) {
      setFormError(
        cause instanceof Error ? cause.message : "Could not save this advert.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteAdvert() {
    if (!pendingDelete) return;
    try {
      await remove(pendingDelete.id);
      showToast("Advert deleted.", "info");
      setPendingDelete(null);
      if (editingId === pendingDelete.id) resetForm();
    } catch (cause) {
      showToast(
        cause instanceof Error ? cause.message : "Could not delete the advert.",
        "error",
      );
      setPendingDelete(null);
      throw cause;
    }
  }

  return (
    <div>
      <PageHeader
        title="Marketplace adverts"
        description="Publish text promotions or image adverts on the marketplace."
      />

      <Card className="mb-6">
        <CardHeader
          title={editingId ? "Edit advert" : "Create advert"}
          description="An advert can contain text, an image, or both. Only active adverts appear in the marketplace."
        />
        <CardBody>
          <form
            onSubmit={saveAdvert}
            className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]"
          >
            <div className="space-y-4">
              <FormField label="Advert title" htmlFor="advert-title" required>
                <Input
                  id="advert-title"
                  required
                  maxLength={160}
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </FormField>
              <FormField
                label="Advert text"
                htmlFor="advert-description"
                hint="Optional when using an image."
              >
                <Textarea
                  id="advert-description"
                  rows={4}
                  maxLength={1000}
                  value={form.description ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Link (optional)"
                  htmlFor="advert-link"
                  hint="Use an https:// URL or a path such as /cart."
                >
                  <Input
                    id="advert-link"
                    type="text"
                    maxLength={2048}
                    value={form.linkUrl ?? ""}
                    onChange={(event) =>
                      setForm({ ...form, linkUrl: event.target.value })
                    }
                  />
                </FormField>
                <FormField
                  label="Display order"
                  htmlFor="advert-order"
                  hint="Lower numbers display first."
                >
                  <Input
                    id="advert-order"
                    type="number"
                    min={0}
                    max={10000}
                    value={form.sortOrder}
                    onChange={(event) =>
                      setForm({ ...form, sortOrder: Number(event.target.value) })
                    }
                  />
                </FormField>
              </div>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(event) => setForm({ ...form, active: event.target.checked })}
                />
                Publish this advert
              </label>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-ink">Advert image</p>
              {form.imageUrl ? (
                <div className="overflow-hidden rounded-lg border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt={form.imageAlt ?? ""}
                    className="aspect-video w-full object-cover"
                  />
                  <div className="p-3">
                    <FormField
                      label="Alternative text"
                      htmlFor="advert-image-alt"
                      required
                    >
                      <Input
                        id="advert-image-alt"
                        required
                        maxLength={180}
                        value={form.imageAlt ?? ""}
                        onChange={(event) =>
                          setForm({ ...form, imageAlt: event.target.value })
                        }
                      />
                    </FormField>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setForm({ ...form, imageUrl: null, imageAlt: null })}
                    >
                      <Trash2 size={14} /> Remove image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-paper text-ink-muted">
                  <ImagePlus size={24} />
                  <span className="text-xs">No image uploaded</span>
                </div>
              )}
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={uploadImage}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                isLoading={isUploading}
                onClick={() => fileInput.current?.click()}
              >
                <Upload size={14} /> {isUploading ? "Uploading…" : "Upload image"}
              </Button>
              <p className="text-xs text-ink-muted">
                JPEG, PNG, WebP, or AVIF; up to 5 MB.
              </p>
            </div>

            <div className="lg:col-span-2">
              {formError && (
                <p
                  role="alert"
                  className="mb-4 rounded-lg border border-coral-200 bg-coral-50 px-3 py-2 text-sm text-coral-800"
                >
                  {formError}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  isLoading={isSaving || isUploading}
                  disabled={isUploading}
                >
                  {editingId ? "Save advert" : "Create advert"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardBody>
      </Card>

      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-800"
        >
          {error} Check that the backend is running and you are signed in.
        </p>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <p role="status" className="py-12 text-center text-sm text-ink-muted">
            Loading adverts…
          </p>
        ) : sortedItems.length === 0 ? (
          <Card>
            <CardBody className="text-center text-sm text-ink-muted">
              No adverts yet. Create one above.
            </CardBody>
          </Card>
        ) : (
          sortedItems.map((advert) => (
            <Card key={advert.id}>
              <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {advert.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={advert.imageUrl}
                    alt=""
                    className="h-20 w-32 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium text-ink">{advert.title}</h2>
                    <Badge tone={advert.active ? "success" : "neutral"}>
                      {advert.active ? "Published" : "Draft"}
                    </Badge>
                    <Badge>Order {advert.sortOrder}</Badge>
                  </div>
                  {advert.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                      {advert.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editAdvert(advert)}
                  >
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setPendingDelete(advert)}
                  >
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={deleteAdvert}
        title={`Delete "${pendingDelete?.title}"?`}
        confirmLabel="Delete advert"
      />
    </div>
  );
}
