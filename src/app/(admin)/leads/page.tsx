"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/ui/Feedback";
import { Card, CardBody } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { useCollection } from "@/hooks/useCollection";
import { leadsApi } from "@/lib/api";
import { formatDate } from "@/lib/utils/date";
import type { Lead, LeadStatus } from "@/types";

const STATUS_TONE: Record<LeadStatus, "info" | "warning" | "success" | "neutral" | "danger"> = {
  new: "info",
  contacted: "warning",
  qualified: "success",
  won: "success",
  lost: "danger",
};

export default function LeadsPage() {
  const { items, isLoading } = useCollection<Lead>(leadsApi);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const filtered = statusFilter === "all" ? items : items.filter((l) => l.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));

  const columns: Column<Lead>[] = [
    {
      header: "Contact",
      accessor: (row) => (
        <div>
          <p className="font-medium text-ink">{row.name}</p>
          <p className="text-xs text-ink-muted">{row.email}</p>
        </div>
      ),
    },
    { header: "Company", accessor: (row) => row.company },
    { header: "Budget", accessor: (row) => row.estimatedBudget },
    { header: "Submitted", accessor: (row) => formatDate(row.submittedAt) },
    {
      header: "Status",
      accessor: (row) => <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Prospective clients who filled out the project inquiry form."
        actions={
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "all")}
            className="w-40"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </Select>
        }
      />

      <Card>
        <CardBody className="p-0">
          <DataTable
            columns={columns}
            rows={sorted}
            rowKey={(row) => row.id}
            isLoading={isLoading}
            emptyTitle="No leads yet"
            emptyDescription="Submissions from the Contact page will show up here."
            actions={(row) => (
              <Link href={`/leads/${row.id}`}>
                <Button variant="ghost" size="sm" aria-label={`View ${row.name}`}>
                  <Eye size={14} />
                </Button>
              </Link>
            )}
          />
        </CardBody>
      </Card>
    </div>
  );
}
