"use client";

import {
  Badge,
  Button,
  Card,
  CardBody,
  Column,
  ConfirmDialog,
  DataTable,
  FormField,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
} from "@/components/ui";
import { useToast } from "@/context/ToastContext";
import { useCollection } from "@/hooks/useCollection";
import { booksApi } from "@/lib/api";
import { formatDate, nowIso } from "@/lib/utils/date";
import { Book, BookDirection, BookStatus } from "@/types";
import { ArrowDownToLine, ArrowUpFromLine, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const EMPTY: Omit<Book, "id"> = {
  customerName: "",
  item: "",
  description: "",
  quantity: "",
  amount: "",
  direction: "in",
  status: "pending",
  updatedAt: nowIso(),
};

const STATUS_TONE: Record<BookStatus, "success" | "warning" | "danger"> = {
  delivered: "success",
  pending: "warning",
  conflict: "danger",
};

const STATUS_LABEL: Record<BookStatus, string> = {
  delivered: "Delivered",
  pending: "Pending",
  conflict: "Conflict",
};

const DIRECTION_TONE: Record<BookDirection, "success" | "danger"> = {
  in: "success",
  out: "danger",
};

// Strips currency symbols, commas, and whitespace before parsing (e.g. "₦1,500.00" -> 1500)
function parseAmount(amount: string): number {
  const cleaned = amount.replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function BooksContent() {
  const { items, isLoading, create, update, remove } = useCollection<Book>(booksApi);
  const { showToast } = useToast();
  const [modal, setModal] = useState<{ mode: "create" | "edit"; draft: Book } | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Book | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookStatus | "all">("all");
  const [directionFilter, setDirectionFilter] = useState<BookDirection | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((t) => (statusFilter === "all" ? true : t.status === statusFilter))
      .filter((t) => (directionFilter === "all" ? true : t.direction === directionFilter))
      .filter((t) =>
        q
          ? t.customerName.toLowerCase().includes(q) ||
            t.item.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [items, statusFilter, directionFilter, query]);

  // Derived balance: overall totals of amount in vs amount out, across all items
  const balance = useMemo(() => {
    let amountIn = 0;
    let amountOut = 0;
    for (const row of items) {
      const amt = parseAmount(row.amount);
      if (row.direction === "in") {
        amountIn += amt;
      } else {
        amountOut += amt;
      }
    }
    return { amountIn, amountOut, net: amountIn - amountOut };
  }, [items]);

  const openCreate = () => setModal({ mode: "create", draft: { id: "", ...EMPTY } });
  const openEdit = (book: Book) => setModal({ mode: "edit", draft: book });

  const handleSave = async () => {
    if (!modal) return;
    const { draft, mode } = modal;
    if (!draft.customerName.trim()) return;
    const payload = { ...draft, updatedAt: nowIso() };
    if (mode === "create") {
      const { id: _id, ...rest } = payload;
      await create(rest);
      showToast("Book added.");
    } else {
      await update(draft.id, payload);
      showToast("Book updated.");
    }
    setModal(null);
  };

  const columns: Column<Book>[] = [
    {
      header: "Customer",
      accessor: (row) => (
        <div>
          <p className="font-medium text-ink">{row.customerName}</p>
        </div>
      ),
    },
    {
      header: "Item",
      accessor: (row) => <span className="block max-w-[220px] truncate">{row.item}</span>,
    },
    {
      header: "Description",
      accessor: (row) => <span className="block max-w-[220px] truncate">{row.description}</span>,
    },
    {
      header: "Direction",
      accessor: (row) => (
        <Badge tone={DIRECTION_TONE[row.direction]}>
          <span className="flex items-center gap-1">
            {row.direction === "in" ? <ArrowDownToLine size={12} /> : <ArrowUpFromLine size={12} />}
          </span>
        </Badge>
      ),
    },
    {
      header: "Quantity",
      accessor: (row) => <span className="block max-w-[200px] truncate">{row.quantity}</span>,
    },
    {
      header: "Amount",
      accessor: (row) => <span className="block max-w-[260px] truncate">{row.amount}</span>,
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
        title="Books"
        description="Track customer orders and stock movement — item, quantity, amount and delivery status."
        actions={
          <Button onClick={openCreate}>
            <Plus size={16} /> Add book
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="mb-4">
        <CardBody>
         <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Total Balance</p>
              <p
                className={`mt-1 text-2xl font-semibold ${
                  balance.net < 0 ? "text-coral-600" : "text-ink"
                }`}
              >
                {formatCurrency(balance.net)}
              </p>
            </div>
        </CardBody>
      </Card>
      <Card className="mb-4">
        <CardBody>
          <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Amount Out</p>
              <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold text-coral-600">
                <ArrowUpFromLine size={18} />
                {formatCurrency(balance.amountOut)}
              </p>
            </div>
        </CardBody>
      </Card>
      <Card className="mb-4">
        <CardBody>
         <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Amount In</p>
              <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold text-success-600">
                <ArrowDownToLine size={18} />
                {formatCurrency(balance.amountIn)}
              </p>
            </div>
        </CardBody>
      </Card>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customer, item, description…"
            className="pl-9"
          />
        </div>
        <Select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value as BookDirection | "all")}
          className="w-full sm:w-44"
        >
          <option value="all">In &amp; out</option>
          <option value="in">Stock in</option>
          <option value="out">Stock out</option>
        </Select>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as BookStatus | "all")}
          className="w-full sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
          <option value="conflict">Conflict</option>
        </Select>
      </div>

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            emptyTitle="No books yet"
            emptyDescription="Add a customer order to get started."
            actions={(row) => (
              <>
                <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label={`Edit ${row.customerName}`}>
                  <Pencil size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(row)}
                  aria-label={`Delete ${row.customerName}`}
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
        title={modal?.mode === "create" ? "Add book" : "Edit book"}
      >
        {modal && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Customer Name" htmlFor="book-customer" required>
                <Input
                  id="book-customer"
                  value={modal.draft.customerName}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, customerName: e.target.value } })
                  }
                />
              </FormField>
              <FormField label="Item" htmlFor="book-item">
                <Input
                  id="book-item"
                  value={modal.draft.item}
                  onChange={(e) => setModal({ ...modal, draft: { ...modal.draft, item: e.target.value } })}
                />
              </FormField>
            </div>
            <FormField label="Description" htmlFor="book-description">
              <Textarea
                id="book-description"
                rows={3}
                value={modal.draft.description}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, description: e.target.value } })
                }
              />
            </FormField>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField label="Direction" htmlFor="book-direction">
                <Select
                  id="book-direction"
                  value={modal.draft.direction}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      draft: { ...modal.draft, direction: e.target.value as BookDirection },
                    })
                  }
                >
                  <option value="in">Stock in</option>
                  <option value="out">Stock out</option>
                </Select>
              </FormField>
              <FormField label="Quantity" htmlFor="book-quantity">
                <Input
                  id="book-quantity"
                  value={modal.draft.quantity}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, quantity: e.target.value } })
                  }
                />
              </FormField>
              <FormField label="Amount" htmlFor="book-amount" hint="e.g. ₦1,500.00">
                <Input
                  id="book-amount"
                  value={modal.draft.amount}
                  onChange={(e) =>
                    setModal({ ...modal, draft: { ...modal.draft, amount: e.target.value } })
                  }
                />
              </FormField>
            </div>
            <FormField label="Status" htmlFor="book-status">
              <Select
                id="book-status"
                value={modal.draft.status}
                onChange={(e) =>
                  setModal({ ...modal, draft: { ...modal.draft, status: e.target.value as BookStatus } })
                }
              >
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="conflict">Conflict</option>
              </Select>
            </FormField>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>{modal.mode === "create" ? "Add book" : "Save changes"}</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        title={`Remove "${pendingDelete?.customerName}"?`}
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await remove(pendingDelete.id);
          showToast("Book removed.", "info");
        }}
      />
    </div>
  );
}