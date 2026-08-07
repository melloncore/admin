/**
 * Central type definitions for every editable piece of the public site.
 * These mirror (and extend) the shapes used on the client-facing project so
 * the two stay compatible once a real API sits between them.
 */

export type BrandColor = "coral" | "teal" | "brand";

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
export interface HeroContent {
  id: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  imageUrl: string;
  imageAlt: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Services + engagement models
// ---------------------------------------------------------------------------
export interface EngagementModel {
  id: string;
  name: string;
  description: string;
  bestFor: string;
  priceRange: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  icon: string;
  deliverables: string[];
  color: BrandColor;
  engagementModels: EngagementModel[];
  isPublished: boolean;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// About: values + stats
// ---------------------------------------------------------------------------
export interface AboutContent {
  title: string;
  description: string;
  missionTitle: string;
  missionDescription: string;
}

export interface ValueItem {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface Stat {
  id: string;
  label: string;
  value: string;
  percentage: number;
  order: number;
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  photoUrl: string;
  order: number;
}

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  rating: number;
  isFeatured: boolean;
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------
export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  author: string;
  status: BlogStatus;
  date: string;
  readTime: string;
}

// ---------------------------------------------------------------------------
// Calendar availability
// ---------------------------------------------------------------------------
export interface DayAvailability {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Live chat
// ---------------------------------------------------------------------------
export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: "admin" | "customer";
  body: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  status: "open" | "closed";
}

// ---------------------------------------------------------------------------
// Contact info
// ---------------------------------------------------------------------------
export type ContactChannelType = "email" | "phone" | "address";

export interface ContactChannel {
  id: string;
  type: ContactChannelType;
  label: string;
  value: string;
}

export interface ContactSettings {
  responseTime: string;
  channels: ContactChannel[];
}

// ---------------------------------------------------------------------------
// Leads / interested clients
// ---------------------------------------------------------------------------
export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  estimatedBudget: string;
  projectDetails: string;
  status: LeadStatus;
  submittedAt: string;
}

// ---------------------------------------------------------------------------
// Tasks (company outreach / pipeline tracker)
// ---------------------------------------------------------------------------
export type TaskStatus = "deal" | "pending" | "blacklist";

export interface Task {
  id: string;
  companyName: string;
  sector: string;
  companyAddress: string;
  contact: string;
  remark: string;
  status: TaskStatus;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
export interface SocialLink {
  id: string;
  platform: string;
  icon: string;
  url: string;
}

export interface FooterLink {
  id: string;
  label: string;
  href: string;
}

export interface FooterSettings {
  logoUrl: string;
  description: string;
  copyrightYear: number;
  socialLinks: SocialLink[];
  companyLinks: FooterLink[];
  serviceLinks: FooterLink[];
  contactLinks: FooterLink[];
}

// ---------------------------------------------------------------------------
// Appearance / brand colors
// ---------------------------------------------------------------------------
export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export type AdminRole = "owner" | "editor";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatarUrl?: string;
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------
export interface TrafficPoint {
  date: string;
  visitors: number;
  pageViews: number;
}

export interface ClickEvent {
  id: string;
  label: string;
  page: string;
  clicks: number;
}

export interface CookieConsentStats {
  accepted: number;
  declined: number;
  dismissed: number;
}

export interface TopPage {
  path: string;
  views: number;
  avgTimeOnPage: string;
}

export interface AnalyticsSnapshot {
  totalVisitors: number;
  totalPageViews: number;
  bounceRate: number;
  avgSessionDuration: string;
  traffic: TrafficPoint[];
  topClicks: ClickEvent[];
  topPages: TopPage[];
  cookieConsent: CookieConsentStats;
}
