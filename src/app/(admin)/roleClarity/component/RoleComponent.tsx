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
import type { RoleClarity, RoleClarityStatus } from "@/types";
import { roleApi } from "@/lib/api";

const EMPTY: Omit<RoleClarity, "id"> = {
  role: "",
  department: "",
  coreResponsibility: "",
  ReportTo: "",
  keyKpi: "",
  status: "Pending",
};

const STATUS_TONE: Record<RoleClarityStatus, "success" | "warning" | "danger"> = {
  done: "success",
  cancelled: "warning",
  Pending: "danger",
};

const STATUS_LABEL: Record<RoleClarityStatus, string> = {
  done: "Done",
  cancelled: "Cancelled",
  Pending: "Pending",
};

const RoleComponent = () => {
  const { items, isLoading, create, update, remove } = useCollection<RoleClarity>(roleApi);
  const { showToast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: RoleClarity } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RoleClarity | null>(null);
  const [statusFilter, setStatusFilter] = useState<RoleClarityStatus | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesQuery =
        !q ||
        row.role.toLowerCase().includes(q) ||
        row.department.toLowerCase().includes(q) ||
        row.coreResponsibility.toLowerCase().includes(q) ||
        row.ReportTo.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const openCreate = () => setModal({ mode: "create", draft: { id: "", ...EMPTY } });
  const openEdit = (roleClarity: RoleClarity) => setModal({ mode: "edit", draft: roleClarity });

  const handleSave = async () => {
    if (!modal) return;
    const { draft, mode } = modal;
    if (!draft.role.trim()) return;
    const payload = { ...draft, updatedAt: nowIso() };
    if (mode === "create") {
      const { id: _id, ...rest } = payload;
      await create(rest);
      showToast("Role added.");
    } else {
      await update(draft.id, payload);
      showToast("Role updated.");
    }
    setModal(null);
  };

  const columns: Column<RoleClarity>[] = [
    {
      header: "Role",
      accessor: (row) => (
        <div>
          <p className="font-medium text-ink">{row.role}</p>
        </div>
      ),
    },
    {
      header: "Department",
      accessor: (row) => <span className="block max-w-[220px] truncate">{row.department}</span>,
    },
    {
      header: "Core Responsibility",
      accessor: (row) => <span className="block max-w-[220px] truncate">{row.coreResponsibility}</span>,
    },
    {
      header: "Reports To",
      accessor: (row) => <span className="block max-w-[200px] truncate">{row.ReportTo}</span>,
    },
    {
      header: "Key KPI",
      accessor: (row) => <span className="block max-w-[200px] truncate">{row.keyKpi}</span>,
    },
    {
      header: "Status",
      accessor: (row) => <Badge tone={STATUS_TONE[row.status]}>{STATUS_LABEL[row.status]}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Role Clarity Tracker"
        description="Track roles across the org — department, core responsibility, reporting line and KPI status."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Add role
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search role, department, responsibility…"
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RoleClarityStatus | "all")}
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
            emptyTitle="No roles yet"
            emptyDescription="Add a role you're tracking to get started."
            
          />
        </CardBody>
      </Card>

      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === "create" ? "Add role" : "Edit role"}
      >
        {modal && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Role" htmlFor="role-name" required>
                <Input
                  id="role-name"
                  value={modal.draft.role}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, role: e.target.value } })
                  }
                />
              </FormField>
              <FormField label="Department" htmlFor="role-department">
                <Input
                  id="role-department"
                  value={modal.draft.department}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, department: e.target.value } })
                  }
                  placeholder="Engineering, Sales, Operations…"
                />
              </FormField>
            </div>
            <FormField label="Core responsibility" htmlFor="role-responsibility">
              <Input
                id="role-responsibility"
                value={modal.draft.coreResponsibility}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, coreResponsibility: e.target.value } })
                }
              />
            </FormField>
            <FormField label="Reports to" htmlFor="role-reportto" hint="Manager or role this reports into">
              <Input
                id="role-reportto"
                value={modal.draft.ReportTo}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, ReportTo: e.target.value } })}
              />
            </FormField>
            <FormField label="Key KPI" htmlFor="role-kpi">
              <Input
                id="role-kpi"
                value={modal.draft.keyKpi}
                onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, keyKpi: e.target.value } })}
              />
            </FormField>
            <FormField label="Status" htmlFor="role-status">
              <Select
                id="role-status"
                value={modal.draft.status}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, status: e.target.value as RoleClarityStatus } })
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
              <Button onClick={handleSave}>{modal.mode === "create" ? "Add role" : "Save changes"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Remove "${pendingDelete?.role}"?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          setPendingDelete(null);
          showToast("Role removed.", "info");
        }}
      />
    </div>
  );
};

export default RoleComponent;