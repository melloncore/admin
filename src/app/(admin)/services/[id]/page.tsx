"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, PageLoading } from "@/components/ui/Feedback";
import { EmptyState } from "@/components/ui/Feedback";
import { ServiceForm, type ServiceFormValues } from "@/components/domain/ServiceForm";
import { servicesApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { nowIso } from "@/lib/utils/date";
import type { Service } from "@/types";

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [service, setService] = useState<Service | null | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    servicesApi.get(id).then((s) => setService(s ?? null));
  }, [id]);

  if (service === undefined) return <PageLoading />;
  if (service === null) {
    return <EmptyState title="Service not found" description="It may have already been deleted." />;
  }

  const handleSubmit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    await servicesApi.update(id, { ...values, updatedAt: nowIso() });
    setIsSubmitting(false);
    showToast("Service updated.");
    router.push("/services");
  };

  return (
    <div>
      <PageHeader title={`Edit ${service.title}`} description="Update this service and its engagement models." />
      <ServiceForm initialValues={service} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
