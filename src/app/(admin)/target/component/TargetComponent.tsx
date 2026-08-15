"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/Feedback";
import { Card, CardBody } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { useCollection } from "@/hooks/useCollection";
import { tasksApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { formatDate, nowIso } from "@/lib/utils/date";
import type { Task, TaskStatus } from "@/types";

const EMPTY: Omit<Task, "id"> = {
  companyName: "",
  sector: "",
  companyAddress: "",
  contact: "",
  remark: "",
  status: "pending",
  updatedAt: nowIso(),
};

const STATUS_TONE: Record<TaskStatus, "success" | "warning" | "danger"> = {
  deal: "success",
  pending: "warning",
  blacklist: "danger",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  deal: "Deal",
  pending: "Pending",
  blacklist: "Blacklist",
};

export default function TargetComponent() {
  const { items, isLoading, create, update, remove } = useCollection<Task>(tasksApi);
  const { showToast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: Task } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((t) => (statusFilter === "all" ? true : t.status === statusFilter))
      .filter((t) =>
        q
          ? t.companyName.toLowerCase().includes(q) ||
            t.sector.toLowerCase().includes(q) ||
            t.contact.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [items, statusFilter, query]);

  const openCreate = () => setModal({ mode: "create", draft: { id: "", ...EMPTY } });
  const openEdit = (task: Task) => setModal({ mode: "edit", draft: task });

  const handleSave = async () => {
    if (!modal) return;
    const { draft, mode } = modal;
    if (!draft.companyName.trim()) return;
    const payload = { ...draft, updatedAt: nowIso() };
    if (mode === "create") {
      const { id: _id, ...rest } = payload;
      await create(rest);
      showToast("Task added.");
    } else {
      await update(draft.id, payload);
      showToast("Task updated.");
    }
    setModal(null);
  };

  const columns: Column<Task>[] = [
    {
      header: "Company",
      accessor: (row) => (
        <div>
          <p className="font-medium text-ink">{row.companyName}</p>
        </div>
      ),
    },
    {
      header: "sector",
      accessor: (row) => <span className="block max-w-[220px] truncate">{row.sector}</span>,
    },
    {
      header: "Address",
      accessor: (row) => <span className="block max-w-[220px] truncate">{row.companyAddress}</span>,
    },
    {
      header: "Contact",
      accessor: (row) => <span className="block max-w-[200px] truncate">{row.contact}</span>,
    },
    {
      header: "Remark / feedback",
      accessor: (row) => <span className="block max-w-[260px] truncate">{row.remark}</span>,
    },
    {
      header: "Status",
      accessor: (row) => <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
    },
    { header: "Updated", accessor: (row) => formatDate(row.updatedAt) },
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
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | "all")}
          className="w-full sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="deal">Deal</option>
          <option value="pending">Pending</option>
          <option value="blacklist">Blacklist</option>
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
                <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label={`Edit ${row.companyName}`}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(row)}
                  aria-label={`Delete ${row.companyName}`}
                >
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
        title={modal?.mode === "create" ? "Add task" : "Edit task"}
      >
        {modal && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Company name" htmlFor="task-company" required>
                <Input
                  id="task-company"
                  value={modal.draft.companyName}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, companyName: e.target.value } })
                  }
                />
              </FormField>
              <FormField label="Sector" htmlFor="task-sector">
                <Input
                  id="task-sector"
                  value={modal.draft.sector}
                  onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, sector: e.target.value } })}
                  placeholder="Fintech, Retail, Logistics…"
                />
              </FormField>
            </div>
            <FormField label="Company address" htmlFor="task-address">
              <Input
                id="task-address"
                value={modal.draft.companyAddress}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, companyAddress: e.target.value } })
                }
              />
            </FormField>
            <FormField label="Contact" htmlFor="task-contact" hint="Name, email and/or phone number">
              <Input
                id="task-contact"
                value={modal.draft.contact}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, contact: e.target.value } })}
              />
            </FormField>
            <FormField label="Remark / feedback" htmlFor="task-remark">
              <Textarea
                id="task-remark"
                rows={3}
                value={modal.draft.remark}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, remark: e.target.value } })}
              />
            </FormField>
            <FormField label="Status" htmlFor="task-status">
              <Select
                id="task-status"
                value={modal.draft.status}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, status: e.target.value as TaskStatus } })
                }
              >
                <option value="pending">Pending</option>
                <option value="deal">Deal</option>
                <option value="blacklist">Blacklist</option>
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
        title={`Remove "${pendingDelete?.companyName}"?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Task removed.", "info");
        }}
      />
    </div>
  );
}
