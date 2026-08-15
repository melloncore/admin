import { createCollectionApi, createSettingsApi } from "@/lib/api/collection";
import type {
  AboutContent,
  AdminUser,
  AnalyticsSnapshot,
  AppearanceSettings,
  BlockedDate,
  BlogPost,
  ContactSettings,
  Conversation,
  ChatMessage,
  DayAvailability,
  FooterSettings,
  HeroContent,
  Lead,
  Service,
  Stat,
  Task,
  Testimonial,
  TeamMember,
  ValueItem,
  Book,
  Decision,
  RoleClarity,
} from "@/types";
import {
  seedAbout,
  seedAnalytics,
  seedAppearance,
  seedAvailability,
  seedBlockedDates,
  seedBlogPosts,
  seedBooks,
  seedContact,
  seedConversations,
  seedDecisions,
  seedFooter,
  seedHero,
  seedLeads,
  seedMessages,
  seedRoleClarity,
  seedServices,
  seedStats,
  seedTasks,
  seedTeam,
  seedTestimonials,
  seedUser,
  seedValues,
} from "@/lib/mock/seed";

export const heroApi = createSettingsApi<HeroContent>("hero", seedHero);
export const servicesApi = createCollectionApi<Service>("services", seedServices);
export const aboutApi = createSettingsApi<AboutContent>("about", seedAbout);
export const valuesApi = createCollectionApi<ValueItem>("values", seedValues);
export const statsApi = createCollectionApi<Stat>("stats", seedStats);
export const teamApi = createCollectionApi<TeamMember>("team", seedTeam);
export const testimonialsApi = createCollectionApi<Testimonial>("testimonials", seedTestimonials);
export const blogApi = createCollectionApi<BlogPost>("blog", seedBlogPosts);
export const availabilityApi = createSettingsApi<DayAvailability[]>("availability", seedAvailability);
export const blockedDatesApi = createCollectionApi<BlockedDate>("blocked-dates", seedBlockedDates);
export const conversationsApi = createCollectionApi<Conversation>("conversations", seedConversations);
export const messagesApi = createCollectionApi<ChatMessage>("messages", seedMessages);
export const contactApi = createSettingsApi<ContactSettings>("contact", seedContact);
export const leadsApi = createCollectionApi<Lead>("leads", seedLeads);
export const tasksApi = createCollectionApi<Task>("tasks", seedTasks);
export const footerApi = createSettingsApi<FooterSettings>("footer", seedFooter);
export const appearanceApi = createSettingsApi<AppearanceSettings>("appearance", seedAppearance);
export const userApi = createSettingsApi<AdminUser>("current-user", seedUser);
export const analyticsApi = createSettingsApi<AnalyticsSnapshot>("analytics", seedAnalytics);
export const booksApi = createCollectionApi<Book>("books", seedBooks);
export const decisionsApi = createCollectionApi<Decision>("decisions", seedDecisions);
export const roleApi = createCollectionApi<RoleClarity>("role-clarity", seedRoleClarity);