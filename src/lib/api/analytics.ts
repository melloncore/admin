import type { AnalyticsSnapshot } from "@/types";
import { apiRequest } from "./http";

export async function getAnalytics(): Promise<AnalyticsSnapshot> {
  return apiRequest<AnalyticsSnapshot>("/analytics/summary");
}
