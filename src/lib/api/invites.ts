import { apiRequest } from "./http";

export type InviteRole = "ADMIN" | "STAFF";
export type InviteTitle =
  | "OWNER"
  | "CEO"
  | "DIRECTOR"
  | "MANAGER"
  | "SUB_MANAGER"
  | "TEAM_LEAD"
  | "HR"
  | "REGULAR";

export const invitesApi = {
  create(input: { email: string; role: InviteRole; title: InviteTitle }) {
    return apiRequest<{ success: boolean; message: string }>("/invites", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  accept(input: { email: string; token: string; password: string; name?: string }) {
    return apiRequest<{
      success: boolean;
      user: { id: string; email: string; name: string | null };
    }>("/invites/accept", { method: "POST", body: JSON.stringify(input) });
  },
};
