"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Layers3 } from "lucide-react";
import { PageHeader } from "@/components/ui/Feedback";
import { Card, CardBody } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useCollection } from "@/hooks/useCollection";
import { servicesApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import type { Service } from "@/types";

const COLOR_TONE: Record<Service["color"], "info" | "danger" | "success"> = {
  brand: "info",
  coral: "danger",
  teal: "success",
};

export default function ServicesPage() {
  const { items, isLoading, remove } = useCollection<Service>(servicesApi);
  const { showToast } = useToast();
  const [pendingDelete, setPendingDelete] = useState<Service | null>(null);

  const columns: Column<Service>[] = [
    {
      header: "Service",
      accessor: (row) => (
        <div>
          <p className="font-medium text-ink">{row.title}</p>
          <p className="max-w-sm truncate text-xs text-ink-muted">{row.shortDescription}</p>
        </div>
      ),
    },
    { header: "Accent", accessor: (row) => <Badge tone={COLOR_TONE[row.color]}>{row.color}</Badge> },
    {
      header: "Engagement models",
      accessor: (row) => `${row.engagementModels.length}`,
    },
    {
      header: "Status",
      accessor: (row) => (
        <Badge tone={row.isPublished ? "success" : "neutral"}>
          {row.isPublished ? "Published" : "Draft"}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Services"
        description="Manage the services grid and each service's engagement models."
        actions={
          <Link href="/services/new">
            <Button>
              <Plus size={16} /> Add service
            </Button>
          </Link>
        }
      />

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={items}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            emptyTitle="No services yet"
            emptyDescription="Add your first service to show it on the site."
            actions={(row) => (
              <>
                <Link href={`/services/${row.id}`}>
                  <Button variant="ghost" size="sm" aria-label={`Edit ${row.title}`}>
                    <Pencil size={14} />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${row.title}`}
                  onClick={() => setPendingDelete(row)}
                >
                  <Trash2 size={14} className="text-coral-600" />
                </Button>
              </>
            )}
          />
        </CardBody>
      </Card>

      {items.length > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
          <Layers3 size={13} /> Drag-and-drop reordering can be added once the services grid order matters.
        </p>
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This removes the service and its engagement models from the site."
        confirmLabel="Delete service"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Service deleted.", "info");
        }}
      />
    </div>
  );
}
