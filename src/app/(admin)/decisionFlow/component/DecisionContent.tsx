"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/Feedback";
import { Card, CardBody } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FormField, Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { useCollection } from "@/hooks/useCollection";
import { useToast } from "@/context/ToastContext";
import { nowIso } from "@/lib/utils/date";
import type { Decision, DecisionStatus } from "@/types";
import { decisionsApi } from "@/lib/api";

const EMPTY: Omit<Decision, "id"> = {
  director: "",
  manager: "",
  lead: "",
  type: "",
  status: "Pending",
};

const STATUS_TONE: Record<DecisionStatus, "success" | "warning" | "danger"> = {
  done: "success",
  cancelled: "warning",
  Pending: "danger",
};

const STATUS_LABEL: Record<DecisionStatus, string> = {
  done: "Done",
  cancelled: "Cancelled",
  Pending: "Pending",
};

const DecisionContent = () => {
  const { items, isLoading, create, update, remove } = useCollection<Decision>(decisionsApi);
  const { showToast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: Decision } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Decision | null>(null);
  const [statusFilter, setStatusFilter] = useState<DecisionStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesQuery =
        !q ||
        row.type.toLowerCase().includes(q) ||
        row.director.toLowerCase().includes(q) ||
        row.manager.toLowerCase().includes(q) ||
        row.lead.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const openCreate = () => setModal({ mode: "create", draft: { id: "", ...EMPTY } });
  const openEdit = (decision: Decision) => setModal({ mode: "edit", draft: decision });

  const handleSave = async () => {
    if (!modal) return;
    const { draft, mode } = modal;
    if (!draft.type.trim()) return;
    const payload = { ...draft, updatedAt: nowIso() };
    if (mode === "create") {
      const { id: _id, ...rest } = payload;
      await create(rest);
      showToast("Decision added.");
    } else {
      await update(draft.id, payload);
      showToast("Decision updated.");
    }
    setModal(null);
  };

  const columns: Column<Decision>[] = [
    {
      header: "Company",
      accessor: (row) => (
        <div>
          <p className="font-medium text-ink">{row.type}</p>
        </div>
      ),
    },
    {
      header: "Director 1",
      accessor: (row) => <span className="block max-w-[220px] truncate">{row.director}</span>,
    },
    {
      header: "Director 2",
      accessor: (row) => <span className="block max-w-[220px] truncate">{row.manager}</span>,
    },
    {
      header: "Director 3",
      accessor: (row) => <span className="block max-w-[200px] truncate">{row.lead}</span>,
    },
    {
      header: "Status",
      accessor: (row) => <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Daily Operation Tracker"
        description="Track companies you've reached out to — sector, contact details and deal status."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Add task
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company, sector, contact…"
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as DecisionStatus | "all")}
          className="w-full sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
          <option value="Pending">Pending</option>
        </Select>
      </div>

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            emptyTitle="No tasks yet"
            emptyDescription="Add a company you're tracking to get started."
            actions={(row) => (
              <>
                <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label={`Edit ${row.type}`}>
                  <Pencil size={14} />
                </Button>
              </>
            )}
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add task" : "Edit task"}
      >
        {modal && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Company name" htmlFor="task-company" required>
                <Input
                  id="task-company"
                  value={modal.draft.type}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, type: e.target.value } })
                  }
                />
              </FormField>
              <FormField label="Sector" htmlFor="task-sector">
                <Input
                  id="task-sector"
                  value={modal.draft.director}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, director: e.target.value } })
                  }
                  placeholder="Fintech, Retail, Logistics…"
                />
              </FormField>
            </div>
            <FormField label="Company address" htmlFor="task-address">
              <Input
                id="task-address"
                value={modal.draft.manager}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, manager: e.target.value } })
                }
              />
            </FormField>
            <FormField label="Contact" htmlFor="task-contact" hint="Name, email and/or phone number">
              <Input
                id="task-contact"
                value={modal.draft.lead}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, lead: e.target.value } })}
              />
            </FormField>
            <FormField label="Status" htmlFor="task-status">
              <Select
                id="task-status"
                value={modal.draft.status}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, status: e.target.value as DecisionStatus } })
                }
              >
                <option value="Pending">Pending</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{modal.mode === "create" ? "Add task" : "Save changes"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Remove "${pendingDelete?.type}"?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Task removed.", "info");
        }}
      />
    </div>
  );
};

export default DecisionContent;   