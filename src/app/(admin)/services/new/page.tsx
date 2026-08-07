"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/Feedback";
import { ServiceForm, type ServiceFormValues } from "@/components/domain/ServiceForm";
import { servicesApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { nowIso } from "@/lib/utils/date";

const BLANK: ServiceFormValues = {
  slug: "",
  title: "",
  shortDescription: "",
  description: "",
  icon: "code",
  deliverables: [],
  color: "coral",
  isPublished: false,
  engagementModels: [],
};

export default function NewServicePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: ServiceFormValues) => {
    setIsSubmitting(true);
    await servicesApi.create({ ...values, updatedAt: nowIso() });
    setIsSubmitting(false);
    showToast("Service created.");
    router.push("/services");
  };

  return (
    <div>
      <PageHeader title="Add service" description="Create a new entry for the services grid." />
      <ServiceForm initialValues={BLANK} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitLabel="Create service" />
    </div>
  );
}
