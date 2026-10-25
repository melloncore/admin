import { apiRequest, ApiError } from "./http";
import type { Lead, LeadStatus } from "@/types";

type ContactInquiryStatus = Uppercase<LeadStatus>;

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company: string | null;
  budget: string | null;
  message: string;
  status: ContactInquiryStatus;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const statusMap: Record<ContactInquiryStatus, LeadStatus> = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  WON: "won",
  LOST: "lost",
};

function toLead(inquiry: ContactInquiry): Lead {
  return {
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company ?? "",
    estimatedBudget: inquiry.budget ?? "",
    projectDetails: inquiry.message,
    status: statusMap[inquiry.status],
    submittedAt: inquiry.createdAt,
  };
}

export const leadsApi = {
  async list(): Promise<Lead[]> {
    const response =
      await apiRequest<ApiResponse<ContactInquiry[]>>("/contact/inquiries");
    return response.data.map(toLead);
  },

  async get(id: string): Promise<Lead | undefined> {
    try {
      const response = await apiRequest<ApiResponse<ContactInquiry>>(
        `/contact/inquiries/${encodeURIComponent(id)}`,
      );
      return toLead(response.data);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return undefined;
      throw error;
    }
  },

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const response = await apiRequest<ApiResponse<ContactInquiry>>(
      `/contact/inquiries/${encodeURIComponent(id)}/status`,
      { method: "PATCH", body: JSON.stringify({ status: status.toUpperCase() }) },
    );
    return toLead(response.data);
  },
};
