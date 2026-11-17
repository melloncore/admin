import { createBackendCollectionApi, createBackendSettingsApi } from "@/lib/api/content";
import type {
  AboutContent,
  AppearanceSettings,
  BlockedDate,
  ChatMessage,
  ContactSettings,
  Conversation,
  DayAvailability,
  Decision,
  FooterSettings,
  HeroContent,
  RoleClarity,
  Service,
  Stat,
  Task,
  TeamMember,
  Testimonial,
  ValueItem,
  Book,
} from "@/types";
import {
  seedAbout,
  seedAppearance,
  seedAvailability,
  seedContact,
  seedFooter,
  seedHero,
} from "@/lib/mock/seed";
import { getAnalytics } from "./analytics";

export const heroApi = createBackendSettingsApi<HeroContent>("hero", seedHero);
export const servicesApi = createBackendCollectionApi<Service>("services");
export const aboutApi = createBackendSettingsApi<AboutContent>("about", seedAbout);
export const valuesApi = createBackendCollectionApi<ValueItem>("values");
export const statsApi = createBackendCollectionApi<Stat>("stats");
export const teamApi = createBackendCollectionApi<TeamMember>("team");
export const testimonialsApi = createBackendCollectionApi<Testimonial>("testimonials");
export const availabilityApi = createBackendSettingsApi<DayAvailability[]>(
  "availability",
  seedAvailability,
);
export const blockedDatesApi = createBackendCollectionApi<BlockedDate>("blocked-dates");
export const conversationsApi = createBackendCollectionApi<Conversation>("conversations");
export const messagesApi = createBackendCollectionApi<ChatMessage>("messages");
export const contactApi = createBackendSettingsApi<ContactSettings>(
  "contact",
  seedContact,
);
export const tasksApi = createBackendCollectionApi<Task>("tasks");
export const footerApi = createBackendSettingsApi<FooterSettings>("footer", seedFooter);
export const appearanceApi = createBackendSettingsApi<AppearanceSettings>(
  "appearance",
  seedAppearance,
);
export const analyticsApi = { get: getAnalytics };
export const booksApi = createBackendCollectionApi<Book>("books");
export const decisionsApi = createBackendCollectionApi<Decision>("decisions");
export const roleApi = createBackendCollectionApi<RoleClarity>("role-clarity");

export { blogApi } from "./blog";
export { advertsApi } from "./adverts";
export { leadsApi } from "./leads";
export { invitesApi } from "./invites";
export { operationsApi } from "./operations";
export { staffApi } from "./staff";
