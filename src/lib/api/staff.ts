import { apiRequest } from "./http";

export type StaffWorkMode = "ONSITE" | "HYBRID" | "REMOTE";
export type StaffTitle = "MANAGER" | "SUB_MANAGER" | "TEAM_LEAD" | "HR" | "REGULAR";

export interface StaffProfileInput {
  firstName: string;
  lastName: string;
  address: string;
  modeOfWork: StaffWorkMode;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  nin?: string;
  passport?: string;
  driversLicense?: string;
  tin?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankAccountName?: string;
  payrollId?: string;
}

export interface StaffSummary {
  id: string;
  adminId: string;
  email: string;
  firstName: string;
  lastName: string;
  modeOfWork: StaffWorkMode | null;
  profileCompleted: boolean;
  onboardingStatus: "NOT_SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  title: string;
}

export interface StaffProfileResponse {
  id: string;
  adminId: string;
  firstName: string;
  lastName: string;
  address: string;
  modeOfWork: StaffWorkMode | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelation: string | null;
  nin: string | null;
  passport: string | null;
  driversLicense: string | null;
  tin: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  payrollId: string | null;
  profileCompleted: boolean;
  onboardingStatus: StaffSummary["onboardingStatus"];
  rejectionReason: string | null;
}

export const staffApi = {
  async submitOwnProfile(profile: StaffProfileInput) {
    return apiRequest<{
      success: boolean;
      profile: {
        id: string;
        profileCompleted: boolean;
        onboardingStatus: StaffSummary["onboardingStatus"];
      };
    }>("/staff/profile", { method: "POST", body: JSON.stringify(profile) });
  },
  async getOwnProfile() {
    return apiRequest<{ profile: StaffProfileResponse }>("/staff/profile");
  },
  async list() {
    return apiRequest<{ staff: StaffSummary[] }>("/staff");
  },
  async get(adminId: string) {
    return apiRequest<{
      profile: StaffProfileResponse & {
        admin: { email: string; role: "ADMIN" | "STAFF"; title: string };
      };
    }>(`/staff/${encodeURIComponent(adminId)}`);
  },
  async updateTitle(adminId: string, title: StaffTitle) {
    return apiRequest<{ success: boolean; admin: { id: string; title: StaffTitle } }>(
      `/staff/${encodeURIComponent(adminId)}/title`,
      { method: "PATCH", body: JSON.stringify({ title }) },
    );
  },
  async review(adminId: string, decision: "APPROVED" | "REJECTED", reason?: string) {
    return apiRequest<{ success: boolean; profile: StaffSummary }>(
      `/staff/${encodeURIComponent(adminId)}/review`,
      {
        method: "PATCH",
        body: JSON.stringify({ decision, ...(reason ? { reason } : {}) }),
      },
    );
  },
};
