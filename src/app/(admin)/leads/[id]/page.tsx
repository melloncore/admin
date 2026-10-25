"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Building2, Wallet, Calendar } from "lucide-react";
import { PageHeader, PageLoading, EmptyState } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { leadsApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { formatDateTime } from "@/lib/utils/date";
import type { Lead, LeadStatus } from "@/types";

const STATUS_TONE: Record<
  LeadStatus,
  "info" | "warning" | "success" | "neutral" | "danger"
> = {
  new: "info",
  contacted: "warning",
  qualified: "success",
  won: "success",
  lost: "danger",
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const leadQuery = useQuery({
    queryKey: ["leads", id],
    queryFn: () => leadsApi.get(id),
  });
  const statusMutation = useMutation({
    mutationFn: (status: LeadStatus) => leadsApi.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(["leads", id], updated);
      queryClient.setQueryData<Lead[]>(["leads"], (leads = []) =>
        leads.map((lead) => (lead.id === updated.id ? updated : lead)),
      );
      queryClient.invalidateQueries({ queryKey: ["admin-shell-badges"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      showToast("Status updated.");
    },
  });
  const lead = leadQuery.data;

  if (leadQuery.isLoading) return <PageLoading />;
  if (leadQuery.error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-coral-200 bg-coral-50 p-4 text-sm text-coral-700"
      >
        Lead could not be loaded: {leadQuery.error.message}
      </p>
    );
  }
  if (!lead) {
    return (
      <EmptyState
        title="Lead not found"
        description="It may have already been removed."
      />
    );
  }

  return (
    <div>
      <button
        onClick={() => router.push("/leads")}
        className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to leads
      </button>

      <PageHeader
        title={lead.name}
        description={`Submitted ${formatDateTime(lead.submittedAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
            <Select
              value={lead.status}
              onChange={(e) => statusMutation.mutate(e.target.value as LeadStatus)}
              disabled={statusMutation.isPending}
              className="w-40"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </Select>
          </div>
        }
      />
      {statusMutation.error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-coral-200 bg-coral-50 p-4 text-sm text-coral-700"
        >
          Status could not be updated: {statusMutation.error.message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Project details" />
          <CardBody>
            <p className="whitespace-pre-line text-sm text-ink-soft">
              {lead.projectDetails}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Contact" />
          <CardBody className="space-y-4">
            <InfoRow icon={Mail} label="Email">
              <Link
                href={`mailto:${lead.email}`}
                className="text-brand-700 hover:underline"
              >
                {lead.email}
              </Link>
            </InfoRow>
            <InfoRow icon={Building2} label="Company">
              {lead.company}
            </InfoRow>
            <InfoRow icon={Wallet} label="Estimated budget">
              {lead.estimatedBudget}
            </InfoRow>
            <InfoRow icon={Calendar} label="Submitted">
              {formatDateTime(lead.submittedAt)}
            </InfoRow>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-paper text-ink-muted">
        <Icon size={15} />
      </div>
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-sm text-ink">{children}</p>
      </div>
    </div>
  );
}
